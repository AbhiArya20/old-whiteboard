const canvas = document.querySelector(".canvas")
const colors = document.querySelectorAll(".colors>*")
const pencil = document.querySelector(".pencil");
const eraser = document.querySelector(".eraser");
const pencilSizeElem = document.querySelector(".pencil .size-bar input")
const eraserSizeElem = document.querySelector(".eraser input")
const actions = document.querySelectorAll("img");
const body = document.querySelector("body");
const pencilSizeCircle = document.querySelector(".pencil-size");
const eraserSizeCircle = document.querySelector(".eraser-size");


pencilSizeCircle.style.height = `${pencilSizeElem.value}px`
pencilSizeCircle.style.width = `${pencilSizeElem.value}px`
eraserSizeCircle.style.height = `${eraserSizeElem.value}px`
eraserSizeCircle.style.width = `${eraserSizeElem.value}px`

const menuOptions = {
  pencil: "pencil",
  eraser: "eraser"
}

canvas.width = window.innerWidth
canvas.height = window.innerHeight
window.onresize = function () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

actions[0].style.backgroundColor = "rgba(63, 62, 62, 0.2)"
let mouseMove = false;
let penColor = "red"
colors[0].style.border = "solid 3px salmon";
const eraserColor = "white"
let pencilSize = pencilSizeElem.value;
let eraserSize = eraserSizeElem.value;
let UndoRedoTracker = []
let track = 0
let eraserMenu = true;
let toggleMenu = false;
let pencilMenu = true;
let activeMenu = menuOptions.pencil



const tool = canvas.getContext("2d")
tool.strokeStyle = penColor;
tool.lineWidth = pencilSize;

UndoRedoTracker.push(canvas.toDataURL())
track = UndoRedoTracker.length - 1

function togglePencil() {
  actions[0].style.backgroundColor = "rgba(128, 128, 128, 0.27)"
  actions[1].style.backgroundColor = "transparent"
  tool.strokeStyle = penColor;
  tool.lineWidth = pencilSize;
  if (pencilMenu) {
    setTimeout(() => {
      eraser.style.display = "none";
      eraserMenu = true;
    }, 300);
    eraser.style.animationName = "hidePopover";
    pencil.style.animationName = "showPopover";
    pencil.style.display = "block";
    pencilMenu = false;
  } else {
    setTimeout(() => {
      pencil.style.display = "none";
      pencilMenu = true;
    }, 300);
    pencil.style.animationName = "hidePopover";

  }
}

function toggleErase() {
  actions[1].style.backgroundColor = "rgba(128, 128, 128, 0.27)"
  actions[0].style.backgroundColor = "transparent"
  if (eraserMenu) {
    tool.strokeStyle = eraserColor;
    tool.lineWidth = eraserSize;
    setTimeout(() => {
      pencil.style.display = "none";
      pencilMenu = true;
    }, 300);
    pencil.style.animationName = "hidePopover";
    eraser.style.animationName = "showPopover";
    eraser.style.display = "block";
    eraserMenu = false;
  } else {
    setTimeout(() => {
      eraser.style.display = "none";
      eraserMenu = true;
    }, 300);
    eraser.style.animationName = "hidePopover";
  }
}

// Pencil fuctions toggling
actions[0].addEventListener("click", (e) => {
  activeMenu = menuOptions.pencil;
  togglePencil()
});

// eraser fuctions toggling
actions[1].addEventListener("click", (e) => {
  activeMenu = menuOptions.eraser;
  toggleErase();
});

function minimizeHandeling(stickyNote) {
  const minimize = stickyNote.querySelector(".minimize");
  let minimizeMenu = true;
  minimize.addEventListener("click", (e) => {
    const note = stickyNote.querySelector(".note");
    // const thisstickyNote = stickyNote.querySelector(".sticky-note")
    if (minimizeMenu) {
      stickyNote.style.animationName = "hideNote";
      setTimeout(() => {
        stickyNote.style.height = "4rem";
        minimizeMenu = false;
      }, 280);
      note.style.display = "none";
    } else {
      stickyNote.style.animationName = "showNote";
      setTimeout(() => {
        stickyNote.style.height = "16rem";
        note.style.display = "block";
        minimizeMenu = true;
      }, 280);
    }
  });
}

function removeHandlin(stickyNote) {
  const remove = stickyNote.querySelector(".remove");
  remove.addEventListener("click", (e) => {
    stickyNote.remove();
  });
}

function dragAndDrop(ball) {
  ball.onmousedown = function (event) {
    let shiftX = event.clientX - ball.getBoundingClientRect().left;
    let shiftY = event.clientY - ball.getBoundingClientRect().top;

    ball.style.position = 'absolute';
    ball.style.zIndex = 1000;

    moveAt(event.pageX, event.pageY);

    // moves the ball at (pageX, pageY) coordinates
    // taking initial shifts into account
    function moveAt(pageX, pageY) {
      ball.style.left = pageX - shiftX + 'px';
      ball.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);
    }

    // move the ball on mousemove
    document.addEventListener('mousemove', onMouseMove);

    // drop the ball, remove unneeded handlers
    ball.onmouseup = function () {
      document.removeEventListener('mousemove', onMouseMove);
      ball.onmouseup = null;
    };

  };

  ball.ondragstart = function () {
    return false;
  };
}

// Sticky note Working
actions[4].addEventListener("click", (e) => {
  const stickyNote = document.createElement("div");
  stickyNote.setAttribute("class", "sticky-note");
  stickyNote.innerHTML = `<div class="note-action">
                                <div class="minimize"></div>
                                <div class="remove"></div>
                            </div>
                            <div contenteditable="true" spellcheck="false" class="note"></div>`;
  body.appendChild(stickyNote);
  minimizeHandeling(stickyNote);
  removeHandlin(stickyNote);
  dragAndDrop(stickyNote);
});

actions[3].addEventListener("click", (e) => {
  const input = document.createElement("input")
  input.setAttribute("type", "file")
  input.click()
  input.addEventListener("change", (e) => {
    const file = input.files[0];
    const url = URL.createObjectURL(file)
    const stickyNote = document.createElement("div");
    stickyNote.setAttribute("class", "sticky-note");
    stickyNote.innerHTML = `<div class="note-action">
                                    <div class="minimize"></div>
                                    <div class="remove"></div>
                                </div>
                                <div contenteditable="true" spellcheck="false" class="note">
                                  <img src="${url}">
                                </div>
                                  `;
    body.appendChild(stickyNote);
    minimizeHandeling(stickyNote);
    removeHandlin(stickyNote);
    dragAndDrop(stickyNote);
  })
})

function beginPath(strokeObj) {
  tool.beginPath()
  tool.moveTo(strokeObj.X, strokeObj.Y)
  tool.stroke()
}

function drawStroke(strokeObj) {
  tool.strokeStyle = strokeObj.color
  tool.lineWidth = strokeObj.width
  tool.lineTo(strokeObj.X, strokeObj.Y)
  tool.stroke()
}

canvas.ontouchstart = (e) => {

  if (!pencilMenu) {
    togglePencil();
  }
  else if (!eraserMenu) {
    toggleErase();
  }

  mouseMove = true
  const data = {
    X: e.clientX,
    Y: e.clientY
  }
  socket.emit("beginPath", data)
}

canvas.ontouchmove = (e) => {
  if (mouseMove) {
    const data = {
      X: e.clientX,
      Y: e.clientY,
      color: activeMenu == menuOptions.eraser ? eraserColor : penColor,
      width: activeMenu == menuOptions.eraser ? eraserSize : pencilSize
    }
    socket.emit("drawStroke", data)
  }
}

canvas.ontouchend = (e) => {
  mouseMove = false;
  UndoRedoTracker.push(canvas.toDataURL())
  track = UndoRedoTracker.length - 1
}

canvas.onmousedown = (e) => {
  if (!pencilMenu) {
    togglePencil();
  }
  else if (!eraserMenu) {
    toggleErase();
  }
  mouseMove = true
  const data = {
    X: e.clientX,
    Y: e.clientY
  }
  socket.emit("beginPath", data)
}

canvas.onmousemove = (e) => {
  if (mouseMove) {
    const data = {
      X: e.clientX,
      Y: e.clientY,
      color: activeMenu == menuOptions.eraser ? eraserColor : penColor,
      width: activeMenu == menuOptions.eraser ? eraserSize : pencilSize
    }
    socket.emit("drawStroke", data)
  }
}

canvas.onmouseup = (e) => {
  mouseMove = false;
  UndoRedoTracker.push(canvas.toDataURL())
  track = UndoRedoTracker.length - 1
}

colors.forEach(color => {
  color.onclick = (e) => {
    tool.strokeStyle = color.classList[0]
    colors.forEach(color => {
      color.style.border = "3px solid transparent"
    })
    color.style.border = "solid 3px salmon";
    penColor = color.classList[0]
    pencilSizeCircle.style.backgroundColor = penColor
    tool.strokeStyle = penColor
  }
});

pencilSizeElem.onchange = (e) => {
  pencilSize = pencilSizeElem.value
  pencilSizeCircle.style.display = "block"
  setTimeout(() => {
    pencilSizeCircle.style.display = "none"
  }, 1000);
  pencilSizeCircle.style.height = `${e.target.value}px`
  pencilSizeCircle.style.width = `${e.target.value}px`
  tool.lineWidth = pencilSize
}

eraserSizeElem.onchange = (e) => {
  eraserSize = eraserSizeElem.value;
  eraserSizeCircle.style.display = "block"
  setTimeout(() => {
    eraserSizeCircle.style.display = "none"
  }, 1000);
  eraserSizeCircle.style.height = `${eraserSizeElem.value}px`
  eraserSizeCircle.style.width = `${eraserSizeElem.value}px`
  tool.lineWidth = eraserSize
}

actions[2].onclick = (e) => {
  const imageURL = canvas.toDataURL();
  const a = document.createElement("a");
  a.href = imageURL;
  a.download = "image.jpg";
  a.click();
}

actions[6].onclick = (e) => {
  if (track > 0) {
    track--;
    const data = {
      trackValue: track,
      UndoRedoTracker1: UndoRedoTracker
    }
    UndoRedoCanvas(data)
  }
}

actions[5].onclick = (e) => {
  if (track < UndoRedoTracker.length - 1) {
    track++;
    const data = {
      trackValue: track,
      UndoRedoTracker1: UndoRedoTracker
    }
    UndoRedoCanvas(data)
  }
}

function UndoRedoCanvas(trackObj) {

  track = trackObj.trackValue
  UndoRedoTracker = trackObj.UndoRedoTracker1;

  const url = UndoRedoTracker[track];
  const img = new Image()
  img.src = url
  img.onload = (e) => {
    tool.drawImage(img, 0, 0, canvas.innerWidth, canvas.innerHeight);
    tool.drawImage(img, 0, 0, canvas.innerWidth, canvas.innerHeight)
  }
}

function clear() {
  tool.fillStyle = 'white';
  tool.fillRect(0, 0, canvas.width, canvas.height);
}

actions[7].onclick = (e) => {
  clear();
  UndoRedoTracker.push(canvas.toDataURL())
  track = UndoRedoTracker.length - 1
  socket.emit("clear")
}

socket.on("beginPath", (data) => {
  beginPath(data)
})

socket.on("drawStroke", (data) => {
  drawStroke(data);
})

socket.on("ru", (data) => {
  UndoRedoCanvas(data)
})

socket.on("clear", () => {
  clear();
})