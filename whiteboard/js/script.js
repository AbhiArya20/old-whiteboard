
const body = document.querySelector("body");

// NanoID
const urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'
const nanoid = (size = 21) => {
  let id = ''
  let i = size | 0
  while (i--) {
    id += urlAlphabet[(Math.random() * 64) | 0]
  }
  return id
}


// Indexed DB
class IndexedDBHelper {
  constructor(dbName, storeName, keyPath = 'id') {
    this.dbName = dbName;
    this.storeName = storeName;
    this.keyPath = keyPath;
    this.db = null;
  }

  // Open the database (creates if doesn't exist)
  openDatabase(version = 1) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: this.keyPath });
          store.createIndex('timestamp', 'timestamp', { unique: false }); // Index for sorting
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(`Error opening database: ${event.target.error}`);
      };
    });
  }

  // Add or Update JSON data
  saveData(jsonData) {
    return new Promise((resolve, reject) => {
      jsonData.timestamp = Date.now();

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(jsonData); // `put()` will add or update data

      request.onsuccess = () => {
        resolve('Data added/updated successfully!');
      };

      request.onerror = (event) => {
        reject(`Error saving data: ${event.target.error}`);
      };
    });
  }

  // Get data by key
  getData(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(`Error retrieving data: ${event.target.error}`);
      };
    });
  }

  // Get all data sorted by timestamp (insertion order)
  getAllDataSorted() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp'); // Use the index for sorting

      const request = index.openCursor(); // openCursor to iterate over all records
      const allData = [];

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          allData.push(cursor.value);
          cursor.continue();
        } else {
          // Once the cursor finishes iterating, return the sorted data
          resolve(allData);
        }
      };

      request.onerror = (event) => {
        reject(`Error retrieving all data: ${event.target.error}`);
      };
    });
  }

  // Delete data by key
  deleteData(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve('Data deleted successfully!');
      };

      request.onerror = (event) => {
        reject(`Error deleting data: ${event.target.error}`);
      };
    });
  }
}

const dbHelper = new IndexedDBHelper('whiteboard', 'actions');
dbHelper.openDatabase().then((db) => {
  console.log('Database opened:', db);
}).catch((error) => {
  console.log(error);
});


// Debounce 
function debounce(func, delay) {
  let debounceTimer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}


// Stack configuration
class Stack {
  constructor() {
    this.stack = [];
    this.size = 0;
    this.top = -1;
  }

  push(item) {
    this.stack[++this.top] = item;
    this.size = this.top + 1;;
  }

  prev() {
    if (this.top === 0) return null;
    this.top--;
    return this.stack[this.top];
  }

  poll() {
    return this.stack[this.top];
  }

  next() {
    if (this.top === this.size - 1) return null;
    this.top++;
    return this.stack[this.top];
  }
}



// Undo-Redo configuration
const undoRedoStack = new Stack();

// Canvas configuration
const canvas = document.querySelector(".canvas");
const tool = canvas.getContext("2d", { willReadFrequently: true });


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.onresize = function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

undoRedoStack.push(tool.getImageData(0, 0, canvas.width, canvas.height))

function clear() {
  tool.fillStyle = 'white';
  tool.fillRect(0, 0, canvas.width, canvas.height);
}

function beginPath(options) {
  tool.beginPath()
  tool.moveTo(options.X, options.Y)
  tool.stroke()
  // dbHelper.saveData({ id: nanoid(), type: 'path', data: options })
}

function drawStroke(options) {
  tool.strokeStyle = options.color
  tool.lineWidth = options.width
  tool.lineCap = "round"
  tool.lineJoin = "round"
  tool.lineTo(options.X, options.Y)
  tool.stroke()
  // saveToDB('freestyle', options)
  // dbHelper.saveData({ id: nanoid(), type: 'stroke', data: options })
}

function drawInitial(state) {
  for (let line of state) {
    beginPath({ X: line.X, Y: line.Y })
    for (let point of line.points) {
      drawStroke({ X: point.X, Y: point.Y, color: line.color, width: line.width })
    }
  }
}

// Pencil configuration
const pencil = document.querySelector(".pencil-action");
const colors = document.querySelector(".pencil-colors");
const pencilSizeInput = document.querySelector(".pencil-action .size-bar input");
const pencilSizeIndicator = document.querySelector(".pencil-size-indicator");

// Get pencil color from local storage
const pencilColorStorageKey = "pencil-color";
let pencilColor = localStorage.getItem(pencilColorStorageKey) ?? colors.children[0].classList[0];
for (let children of colors.children) {
  if (children.classList.contains(pencilColor)) {
    children.style.border = "solid 3px salmon";
  }
}

// Handle change pencil color
colors.addEventListener("click", (e) => {
  if (e.target === colors) return;
  const selectedColorElement = e.target;
  pencilColor = selectedColorElement.classList[0];
  tool.strokeStyle = pencilColor;
  localStorage.setItem(pencilColorStorageKey, pencilColor);
  // Pencil-size indicator
  pencilSizeIndicator.style.backgroundColor = pencilColor;
  for (let children of colors.children) {
    children.style.border = "solid 3px transparent";
  }
  selectedColorElement.style.border = "solid 3px salmon";
})

// Get pencil size from local storage
const pencilSizeStorageKey = "pencil-size";
let pencilSize = localStorage.getItem(pencilSizeStorageKey) ?? pencilSizeInput.value;
pencilSizeIndicator.style.height = `${pencilSize}px`;
pencilSizeIndicator.style.width = `${pencilSize}px`;

// Handle pencil size change
const hidePencilSizeIndicatorAfterDelay = debounce(() => {
  pencilSizeIndicator.style.display = "none";
}, 2000)
pencilSizeInput.onchange = (e) => {
  pencilSize = e.target.value;
  tool.lineWidth = pencilSize;
  localStorage.setItem(pencilSizeStorageKey, pencilSize);
  // Handle pencil size and erase size indicator
  pencilSizeIndicator.style.display = "block";
  hidePencilSizeIndicatorAfterDelay();
  pencilSizeIndicator.style.height = `${pencilSize}px`;
  pencilSizeIndicator.style.width = `${pencilSize}px`;
}

// Pencil indicator style
pencilSizeIndicator.style.backgroundColor = pencilColor;

// Eraser configuration
const eraser = document.querySelector(".eraser-action");
const eraserSizeInput = document.querySelector(".eraser-action input");
const eraserSizeIndicator = document.querySelector(".eraser-size-indicator");

// Eraser color
const eraserColor = "white";

// Get eraser size from local storage
const eraserSizeStorageKey = "eraser-size";
let eraserSize = localStorage.getItem(eraserSizeIndicator) ?? eraserSizeInput.value;
eraserSizeIndicator.style.height = `${eraserSize}px`;
eraserSizeIndicator.style.width = `${eraserSize}px`;

// Handle eraser size change 
const hideEraserAfterDelay = debounce(() => {
  eraserSizeIndicator.style.display = "none";
}, 2000)

eraserSizeInput.onchange = (e) => {
  eraserSize = e.target.value;
  tool.lineWidth = eraserSize;
  eraserSizeIndicator.style.display = "block";
  hideEraserAfterDelay();
  eraserSizeIndicator.style.height = `${eraserSize}px`;
  eraserSizeIndicator.style.width = `${eraserSize}px`;
}

// Default canvas configuration 
tool.strokeStyle = pencilColor;
tool.lineWidth = pencilSize;

// Action Configurations
const actions = document.querySelectorAll("img");
actions[0].style.backgroundColor = "rgba(63, 62, 62, 0.2)";

const ACTIONS = {
  pencil: "pencil",
  eraser: "eraser"
};
let activeAction = ACTIONS.pencil;

let isPencilActionOpened = false;
let isEraserActionOpened = false;

// Handle pencil action click 
actions[0].addEventListener("click", (e) => {
  activeAction = ACTIONS.pencil;
  togglePencil();
});

// Handle eraser action click
actions[1].addEventListener("click", (e) => {
  activeAction = ACTIONS.eraser;
  toggleErase();
});

function togglePencil() {
  actions[0].style.backgroundColor = "rgba(128, 128, 128, 0.27)"
  actions[1].style.backgroundColor = "transparent"
  if (isPencilActionOpened) {
    setTimeout(() => {
      pencil.style.display = "none";
      isPencilActionOpened = false;
    }, 300);
    pencil.style.animationName = "hidePopover";
  } else {
    setTimeout(() => {
      eraser.style.display = "none";
      isEraserActionOpened = false;
    }, 300);
    eraser.style.animationName = "hidePopover";
    pencil.style.animationName = "showPopover";
    pencil.style.display = "block";
    isPencilActionOpened = true;
  }
}

function toggleErase() {
  actions[1].style.backgroundColor = "rgba(128, 128, 128, 0.27)"
  actions[0].style.backgroundColor = "transparent"
  if (isEraserActionOpened) {
    setTimeout(() => {
      eraser.style.display = "none";
      isEraserActionOpened = false;
    }, 300);
    eraser.style.animationName = "hidePopover";
  } else {
    setTimeout(() => {
      pencil.style.display = "none";
      isPencilActionOpened = false;
    }, 300);
    pencil.style.animationName = "hidePopover";
    eraser.style.animationName = "showPopover";
    eraser.style.display = "block";
    isEraserActionOpened = true;
  }
}

// Socket configuration

const SOCKET_ACTION = {
  JOIN_ROOM: "join-room",
  CANVAS_START: "canvas-start",
  CANVAS_UPDATE: "canvas-update",
  CANVAS_CLEAR: "canvas-clear",
  UNDO_OR_REDO: "undo-or-redo",
  GET_ROOM_STATE: "get-room-state",
  UPDATE_ROOM_STATE: "update-room-state",
}

const socket = io.connect(`http://localhost:3000`);
const roomId = location.pathname.slice(1);

socket.emit(SOCKET_ACTION.JOIN_ROOM, roomId);

socket.on(SOCKET_ACTION.GET_ROOM_STATE, (roomState) => {
  drawInitial(roomState)
})

socket.on(SOCKET_ACTION.CANVAS_CLEAR, () => {
  clear();
  undoRedoStack.push(tool.getImageData(0, 0, canvas.width, canvas.height))
})

socket.on(SOCKET_ACTION.CANVAS_START, (data) => {
  beginPath(data)
})

socket.on(SOCKET_ACTION.CANVAS_UPDATE, (data) => {
  drawStroke(data);
})

// socket.on(SOCKET_ACTION.UNDO_OR_REDO, (data) => {
//   UndoRedoCanvas(data)
// })

// Handle canvas events 
let isDrawingStart = false;
let isDrawing = false;
let isDrawingCleared = true;

canvas.addEventListener("touchstart", startDrawing)
canvas.addEventListener("touchmove", drawing)
canvas.addEventListener("touchend", endDrawing)

canvas.addEventListener("mousedown", startDrawing)
canvas.addEventListener("mousemove", drawing)
canvas.addEventListener("mouseup", endDrawing)

let points = [];
const drawingState = {};

function startDrawing(e) {
  if (isPencilActionOpened) {
    togglePencil();
  }
  else if (isEraserActionOpened) {
    toggleErase();
  }
  isDrawingStart = true
  const data = {
    X: e.clientX,
    Y: e.clientY
  }
  drawingState.X = data.X;
  drawingState.Y = data.Y;
  drawingState.color = activeAction == ACTIONS.eraser ? eraserColor : pencilColor;
  drawingState.width = activeAction == ACTIONS.eraser ? eraserSize : pencilSize;
  socket.emit(SOCKET_ACTION.CANVAS_START, data)
}

function drawing(e) {
  if (isDrawingStart) {
    const data = {
      X: e.clientX,
      Y: e.clientY,
      color: activeAction == ACTIONS.eraser ? eraserColor : pencilColor,
      width: activeAction == ACTIONS.eraser ? eraserSize : pencilSize
    }
    points.push({ X: data.X, Y: data.Y });
    isDrawing = true;
    isDrawingCleared = false;
    socket.emit(SOCKET_ACTION.CANVAS_UPDATE, data)
  }
}

function endDrawing(e) {
  if (isDrawing) {
    undoRedoStack.push(tool.getImageData(0, 0, canvas.width, canvas.height))
  }
  isDrawing = false;
  isDrawingStart = false;
  socket.emit(SOCKET_ACTION.UPDATE_ROOM_STATE, { id: nanoid(), roomId, type: 'draw', ...drawingState, points })
  points = [];
}

// Handle download action
actions[2].onclick = (e) => {
  const imageURL = canvas.toDataURL();
  const a = document.createElement("a");
  a.href = imageURL;
  a.download = "image.jpg";
  a.style.backgroundColor = "white";
  a.click();
}

// Handle redo action
actions[5].onclick = (e) => {
  const nextState = undoRedoStack.next();
  if (nextState) {
    tool.putImageData(nextState, 0, 0);
  }
}

// Handle undo action
actions[6].onclick = (e) => {
  const currentState = undoRedoStack.prev();
  if (currentState) {
    tool.putImageData(currentState, 0, 0);
  }
}

// Handle cleanup action
actions[7].onclick = (e) => {
  if (isDrawingCleared) return;
  isDrawingCleared = true;
  socket.emit(SOCKET_ACTION.CANVAS_CLEAR)
}

// function minimizeHandling(stickyNote) {
//   const minimize = stickyNote.querySelector(".minimize");
//   let minimizeMenu = true;
//   minimize.addEventListener("click", (e) => {
//     const note = stickyNote.querySelector(".note");
//     // const thisstickyNote = stickyNote.querySelector(".sticky-note")
//     if (minimizeMenu) {
//       stickyNote.style.animationName = "hideNote";
//       setTimeout(() => {
//         stickyNote.style.height = "4rem";
//         minimizeMenu = false;
//       }, 280);
//       note.style.display = "none";
//     } else {
//       stickyNote.style.animationName = "showNote";
//       setTimeout(() => {
//         stickyNote.style.height = "16rem";
//         note.style.display = "block";
//         minimizeMenu = true;
//       }, 280);
//     }
//   });
// }

// function removeHandling(stickyNote) {
//   const remove = stickyNote.querySelector(".remove");
//   remove.addEventListener("click", (e) => {
//     stickyNote.remove();
//   });
// }

// function dragAndDrop(ball) {
//   ball.onmousedown = function (event) {
//     let shiftX = event.clientX - ball.getBoundingClientRect().left;
//     let shiftY = event.clientY - ball.getBoundingClientRect().top;

//     ball.style.position = 'absolute';
//     ball.style.zIndex = 1000;

//     moveAt(event.pageX, event.pageY);

//     // moves the ball at (pageX, pageY) coordinates
//     // taking initial shifts into account
//     function moveAt(pageX, pageY) {
//       ball.style.left = pageX - shiftX + 'px';
//       ball.style.top = pageY - shiftY + 'px';
//     }

//     function onMouseMove(event) {
//       moveAt(event.pageX, event.pageY);
//     }

//     // move the ball on mousemove
//     document.addEventListener('mousemove', onMouseMove);

//     // drop the ball, remove unneeded handlers
//     ball.onmouseup = function () {
//       document.removeEventListener('mousemove', onMouseMove);
//       ball.onmouseup = null;
//     };

//   };

//   ball.ondragstart = function () {
//     return false;
//   };
// }

// // Sticky note Working
// actions[4].addEventListener("click", (e) => {
//   const stickyNote = document.createElement("div");
//   stickyNote.setAttribute("class", "sticky-note");
//   stickyNote.innerHTML = `<div class="note-action">
//                                 <div class="minimize"></div>
//                                 <div class="remove"></div>
//                             </div>
//                             <div contenteditable="true" spellcheck="false" class="note"></div>`;
//   body.appendChild(stickyNote);
//   minimizeHandling(stickyNote);
//   removeHandling(stickyNote);
//   dragAndDrop(stickyNote);
// });

// actions[3].addEventListener("click", (e) => {
//   const input = document.createElement("input")
//   input.setAttribute("type", "file")
//   input.click()
//   input.addEventListener("change", (e) => {
//     const file = input.files[0];
//     const url = URL.createObjectURL(file)
//     const stickyNote = document.createElement("div");
//     stickyNote.setAttribute("class", "sticky-note");
//     stickyNote.innerHTML = `<div class="note-action">
//                                     <div class="minimize"></div>
//                                     <div class="remove"></div>
//                                 </div>
//                                 <div contenteditable="true" spellcheck="false" class="note">
//                                   <img src="${url}">
//                                 </div>
//                                   `;
//     body.appendChild(stickyNote);
//     minimizeHandling(stickyNote);
//     removeHandling(stickyNote);
//     dragAndDrop(stickyNote);
//   })
// })




