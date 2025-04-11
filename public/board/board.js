import { MOUSE_BUTTON, SOCKET_ACTION, SHAPES } from "./js/ui/enums.js";
import { nanoid } from "./js/nanoid.js";
import { IndexedDB } from "./js/ui/indexed-db.js";
import { Stack } from "./js/ui/stack.js";
import { Actions } from "./js/ui/action.js";
import { Eraser } from "./js/ui/eraser.js";
import { Pencil } from "./js/ui/pencil.js";
import { Shape } from "./js/ui/shape.js";
import { Stage } from "./js/drawing/stage.js";

// Remove context menu
document.oncontextmenu = () => {
  return false;
};

// Get userId
const userIdStorageKey = "user-id";
const userId = localStorage.getItem(userIdStorageKey) ?? nanoid();

// Open Database Connection
const db = new IndexedDB("whiteboard", "actions");

try {
  await db.openDatabase();
} catch (err) {
  console.log(err);
}

class Freehand {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options }; // Assume options can include properties like color, lineWidth, etc.
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.beginPath();
    this.#tool.moveTo(this.#state.startX, this.#state.startY);
    this.#tool.lineTo(this.#state.endX, this.#state.endY);
    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth;
    this.#tool.stroke();
  };

  getState = () => {
    return this.#state;
  };
}

class Text {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options }; // Assuming options include properties like color, fontSize, text, etc.
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.font = `${this.#state.fontSize}px ${this.#state.fontFamily}`;
    this.#tool.fillStyle = this.#state.color;
    this.#tool.fillText(this.#state.text, this.#state.X, this.#state.Y);
  };

  getState = () => {
    return this.#state;
  };
}

class Rectangle {
  #tool;
  #state;

  constructor(tool, state) {
    this.#tool = tool;
    this.#state = { ...state }; // Initialize state with properties like X, Y, width, height, color.
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.fillStyle = this.#state.color;
    this.#tool.fillRect(
      this.#state.X,
      this.#state.Y,
      this.#state.width,
      this.#state.height
    );
  };

  getState = () => {
    return this.#state;
  };
}

class Circle {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options }; // Assume options include X, Y, radius, color, etc.
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.beginPath();
    this.#tool.arc(
      this.#state.X,
      this.#state.Y,
      this.#state.radius,
      0,
      2 * Math.PI
    );
    this.#tool.fillStyle = this.#state.color;
    this.#tool.fill();
  };

  getState = () => {
    return this.#state;
  };
}

class Line {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options }; // Assume options include startX, startY, endX, endY, color, lineWidth, etc.
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.beginPath();
    this.#tool.moveTo(this.#state.startX, this.#state.startY);
    this.#tool.lineTo(this.#state.endX, this.#state.endY);
    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth;
    this.#tool.stroke();
  };

  getState = () => {
    return this.#state;
  };
}

class Arrow {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options }; // Assume options include startX, startY, endX, endY, color, lineWidth, arrowSize, etc.
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    const angle = Math.atan2(
      this.#state.endY - this.#state.startY,
      this.#state.endX - this.#state.startX
    );
    const arrowSize = this.#state.arrowSize || 10;

    this.#tool.beginPath();
    this.#tool.moveTo(this.#state.startX, this.#state.startY);
    this.#tool.lineTo(this.#state.endX, this.#state.endY);
    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth;
    this.#tool.stroke();

    // Draw the arrowhead
    this.#tool.beginPath();
    this.#tool.moveTo(this.#state.endX, this.#state.endY);
    this.#tool.lineTo(
      this.#state.endX - arrowSize * Math.cos(angle - Math.PI / 6),
      this.#state.endY - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    this.#tool.moveTo(this.#state.endX, this.#state.endY);
    this.#tool.lineTo(
      this.#state.endX - arrowSize * Math.cos(angle + Math.PI / 6),
      this.#state.endY - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    this.#tool.stroke();
  };

  getState = () => {
    return this.#state;
  };
}

class Triangle {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options }; // Assume options include X, Y, base, height, color, etc.
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    const halfBase = this.#state.base / 2;

    this.#tool.beginPath();
    this.#tool.moveTo(this.#state.X, this.#state.Y); // Starting point (top vertex)
    this.#tool.lineTo(
      this.#state.X - halfBase,
      this.#state.Y + this.#state.height
    ); // Left vertex
    this.#tool.lineTo(
      this.#state.X + halfBase,
      this.#state.Y + this.#state.height
    ); // Right vertex
    this.#tool.closePath();
    this.#tool.fillStyle = this.#state.color;
    this.#tool.fill();
  };

  getState = () => {
    return this.#state;
  };
}

class Star {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options }; // Assume options include X, Y, radius, points, color, etc.
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    const { X, Y, radius, points, color } = this.#state;
    const step = (Math.PI * 2) / points;
    const outerRadius = radius;
    const innerRadius = radius / 2;

    this.#tool.beginPath();
    for (let i = 0; i < points; i++) {
      let angle = i * step;
      this.#tool.lineTo(
        X + Math.cos(angle) * outerRadius,
        Y + Math.sin(angle) * outerRadius
      );
      angle += step / 2;
      this.#tool.lineTo(
        X + Math.cos(angle) * innerRadius,
        Y + Math.sin(angle) * innerRadius
      );
    }
    this.#tool.closePath();
    this.#tool.fillStyle = color;
    this.#tool.fill();
  };

  getState = () => {
    return this.#state;
  };
}

class Canvas {
  #roomState;

  #actionContainer;

  #body;

  #prevClick;

  #prevTouches;
  #touchCount;

  #canvas;
  #tool;

  #rectangle;

  #mouseButton;
  #drawingState;

  #cursorX;
  #cursorY;
  #prevCursorX;
  #prevCursorY;

  #offsetX;
  #offsetY;

  #scale;

  #isDrawing;
  #isDrawingCleared;

  #pencil;
  #shape;
  #eraser;
  #db;
  #socket;
  #zoom;

  #roomId;

  constructor(options) {
    const SocketURL = `${location.protocol}//${location.host}`;
    this.#socket = io.connect(SocketURL);

    this.#roomState = new Map();
    this.#roomState.set(userId, new Stack());
    this.#roomId = location.pathname.slice(1);

    // Initialize objects of all other classes
    this.#pencil = options.pencil;
    this.#shape = options.shape;
    this.#eraser = options.eraser;
    this.#db = options.db;
    this.#zoom = options.zoom;

    this.#body = document.querySelector("body");
    this.#body.style.cursor = "crosshair";

    this.#actionContainer = document.querySelector(".action-container");

    this.#canvas = document.querySelector(options.canvasId);
    this.#tool = this.#canvas.getContext("2d", { willReadFrequently: true });
    this.#canvas.width = window.innerWidth;
    this.#canvas.height = window.innerHeight;

    this.#mouseButton = MOUSE_BUTTON.NONE;
    this.#drawingState = { points: [] };

    this.#isDrawing = false;

    this.#offsetX = 0;
    this.#offsetY = 0;

    this.#scale = 1;

    this.#prevTouches = [null, null];
    this.#touchCount = 0;

    // Event Listeners
    this.#canvas.addEventListener("mousedown", this.#startDrawing);
    this.#canvas.addEventListener("mousemove", this.#drawing);
    this.#canvas.addEventListener("mouseup", this.#endDrawing);
    this.#canvas.addEventListener("mouseout", this.#endDrawing);
    this.#canvas.addEventListener("wheel", this.#onMouseWheel);
    this.#canvas.addEventListener("touchstart", this.#startDrawingTouch);
    this.#canvas.addEventListener("touchmove", this.#drawingTouch, {
      passive: true,
    });
    this.#canvas.addEventListener("touchend", this.#endDrawingTouch);
    this.#canvas.addEventListener("touchcancel", this.#endDrawingTouch);

    // Draw the canvas from local indexedDB.
    (async () => {
      try {
        const state = await db.getAllDataSorted(userId, this.#roomId);
        if (state.length) this.#isDrawingCleared = false;
        else this.#isDrawingCleared = true;
        this.#roomState.get(userId).push(...state);
        this.#redrawCanvas();
      } catch (err) {
        console.log(err);
      }
    })();

    // Redraw the canvas when resize the window.
    window.addEventListener("resize", (event) => {
      this.#redrawCanvas();
    });

    this.#socket.emit(SOCKET_ACTION.JOIN_ROOM, {
      userId,
      roomId: this.#roomId,
      state: this.#roomState.get(userId).state(),
    });

    this.#socket.on(SOCKET_ACTION.JOIN_ROOM, (data) => {
      const stack = new Stack();
      if (data.stack && data.stack.length) {
        stack.push(...data.state);
      }
      this.#roomState.set(data.userId, stack);
      this.#redrawCanvas();
    });

    this.#socket.on(SOCKET_ACTION.JOINED_USER_STATE, (data) => {
      data.forEach((userState) => {
        const stack = new Stack();
        stack.push(...userState.state);
        this.#roomState.set(userState.userId, stack);
      });
      this.#redrawCanvas();
    });

    // Draw lines when other connected user draws anything.
    this.#socket.on(SOCKET_ACTION.CANVAS_UPDATE, (data) => {
      this.#drawStroke(data);
    });

    // Update indexedDB when other connected user completes its one drawing.
    this.#socket.on(SOCKET_ACTION.UPDATE_ROOM_STATE, async (data) => {
      try {
        this.#roomState.set(data.userId, new Stack(...data.state));
        await this.#db.saveData(data.state);
      } catch (err) {
        console.log(err);
      }
    });

    this.#socket.on(SOCKET_ACTION.CANVAS_CLEAR, () => {
      this.clear();
    });
  }

  // Function to detect which mouse button is clicked.
  #getClickedMouse = (event) => {
    switch (event.button) {
      case 0:
        return MOUSE_BUTTON.LEFT;
      case 1:
        return MOUSE_BUTTON.MIDDLE;
      case 2:
        return MOUSE_BUTTON.RIGHT;
      default:
        return MOUSE_BUTTON.NONE;
    }
  };

  #startDrawingTouch = (event) => {
    this.#pencil.close();
    this.#actionContainer.classList.add("pointer-none");
    this.#touchCount = event.touches.length;
    this.#prevTouches[0] = event.touches[0];
    this.#prevTouches[1] = event.touches[1];
  };

  #drawingTouch = (event) => {
    event.preventDefault();
    const touch0X = event.touches[0].pageX;
    const touch0Y = event.touches[0].pageY;
    const prevTouch0X = this.#prevTouches[0].pageX;
    const prevTouch0Y = this.#prevTouches[0].pageY;

    const scaledX = this.#toTrueX(touch0X);
    const scaledY = this.#toTrueY(touch0Y);
    const prevScaledX = this.#toTrueX(prevTouch0X);
    const prevScaledY = this.#toTrueY(prevTouch0Y);

    if (this.#touchCount === 1) {
      const data = {
        X0: prevTouch0X,
        Y0: prevTouch0Y,
        X1: touch0X,
        Y1: touch0Y,
        color: this.#eraser.getState().isSelected
          ? this.#eraser.getState().color
          : this.#pencil.getState().color,
        width: this.#eraser.getState().isSelected
          ? this.#eraser.getState().size
          : this.#pencil.getState().size,
      };

      // Drawing
      this.#drawStroke(data);

      // Storing drawing state to update indexedDB and send to others user
      this.#drawingState.userId = userId;
      this.#drawingState.roomId = this.#roomId;
      this.#drawingState.id = nanoid();
      this.#drawingState.type = "freehand";
      this.#drawingState.color = data.color;
      this.#drawingState.width = data.width;
      this.#drawingState.points.push({
        X0: prevScaledX,
        Y0: prevScaledY,
        X1: scaledX,
        Y1: scaledY,
      });

      // Emit current drawing points.
      this.#socket.emit(SOCKET_ACTION.CANVAS_UPDATE, {
        X0: prevScaledX,
        Y0: prevScaledY,
        X1: scaledX,
        Y1: scaledY,
        type: this.#drawingState.type,
        color: this.#drawingState.color,
        width: this.#drawingState.width,
        roomId: this.#drawingState.roomId,
        userId: this.#drawingState.userId,
      });

      this.#isDrawing = true;
      this.#isDrawingCleared = false;
    } else {
      const touch1X = event.touches[1].pageX;
      const touch1Y = event.touches[1].pageY;
      const prevTouch1X = this.#prevTouches[1].pageX;
      const prevTouch1Y = this.#prevTouches[1].pageY;

      const midX = (touch0X + touch1X) / 2;
      const midY = (touch0Y + touch1Y) / 2;
      const prevMidX = (prevTouch0X + prevTouch1X) / 2;
      const prevMidY = (prevTouch0Y + prevTouch1Y) / 2;

      const hypot = Math.sqrt(
        Math.pow(touch0X - touch1X, 2) + Math.pow(touch0Y - touch1Y, 2)
      );
      const prevHypot = Math.sqrt(
        Math.pow(prevTouch0X - prevTouch1X, 2) +
          Math.pow(prevTouch0Y - prevTouch1Y, 2)
      );

      const zoomAmount = hypot / prevHypot;
      this.#scale = this.#scale * zoomAmount;
      const scaleAmount = 1 - zoomAmount;

      const panX = midX - prevMidX;
      const panY = midY - prevMidY;

      this.#offsetX += panX / this.#scale;
      this.#offsetY += panY / this.#scale;

      const zoomRatioX = midX / this.#canvas.clientWidth;
      const zoomRatioY = midY / this.#canvas.clientHeight;

      const unitsZoomedX = this.#trueWidth() * scaleAmount;
      const unitsZoomedY = this.#trueHeight() * scaleAmount;

      const unitsAddLeft = unitsZoomedX * zoomRatioX;
      const unitsAddTop = unitsZoomedY * zoomRatioY;

      this.#offsetX += unitsAddLeft;
      this.#offsetY += unitsAddTop;

      this.#socket.emit("touchstart", "Running");

      redrawCanvas();
    }

    this.#prevTouches[0] = event.touches[0];
    this.#prevTouches[1] = event.touches[1];
  };

  #endDrawingTouch = (event) => {
    this.#actionContainer.classList.remove("pointer-none");
    if (!this.#isDrawing) return;

    // Push the drawing state in stack.
    this.#roomState.get(userId).push(this.#drawingState);

    // Save the drawing state into indexedDB
    try {
      this.#db.saveData(this.#drawingState);
    } catch (err) {
      console.log(err);
    }

    this.#socket.emit(SOCKET_ACTION.UPDATE_ROOM_STATE, this.#drawingState);

    this.#isDrawing = false;
    this.#drawingState = { points: [] };
  };

  #startDrawing = (event) => {
    this.#pencil.closeDialog();
    this.#eraser.closeDialog();
    this.#shape.closeDialog();
    this.#actionContainer.classList.add("pointer-none");
    this.#mouseButton = this.#getClickedMouse(event);
    if (this.#mouseButton === MOUSE_BUTTON.RIGHT) return;
    // console.log(Date.now() - this.#prevClick);

    // if (this.#mouseButton === MOUSE_BUTTON.LEFT && this.#prevClick && !this.#isDrawing && Date.now() - this.#prevClick < 400) {
    //   console.log("Double clicks");
    // }

    // this.#prevClick = Date.now();

    const touch = (event.touches || [])[0] || event;

    this.#cursorX = touch.pageX;
    this.#cursorY = touch.pageY;
    this.#prevCursorX = touch.pageX;
    this.#prevCursorY = touch.pageY;

    console.log(this.#shape.getState().color);

    if (
      this.#mouseButton === MOUSE_BUTTON.LEFT &&
      this.#shape.getState().isSelected &&
      this.#shape.getState().selectedShape === SHAPES.RECTANGLE
    ) {
      this.#rectangle = new Rectangle(this.#tool, this.#redrawCanvas, {
        X: this.#cursorX,
        Y: this.#cursorY,
        width: 0,
        height: 0,
        color: this.#shape.getState().color,
      });
    }

    if (this.#mouseButton === MOUSE_BUTTON.MIDDLE) {
      this.#body.style.cursor = "grab";
    }
  };

  #drawing = (event) => {
    const touch = (event.touches || [])[0] || event;

    this.#cursorX = touch.pageX;
    this.#cursorY = touch.pageY;

    const scaledX = this.#toTrueX(this.#cursorX);
    const scaledY = this.#toTrueY(this.#cursorY);
    const prevScaledX = this.#toTrueX(this.#prevCursorX);
    const prevScaledY = this.#toTrueY(this.#prevCursorY);

    if (this.#mouseButton === MOUSE_BUTTON.MIDDLE) {
      this.#offsetX += (this.#cursorX - this.#prevCursorX) / this.#scale;
      this.#offsetY += (this.#cursorY - this.#prevCursorY) / this.#scale;
      this.#redrawCanvas();
    } else if (this.#mouseButton === MOUSE_BUTTON.LEFT) {
      if (this.#shape.getState().isSelected) {
        const selectedShape = this.#shape.getState().selectedShape;
        if (selectedShape === "rectangle") {
          const data = {
            width: this.#cursorX - this.#rectangle.getState().X,
            height: this.#cursorY - this.#rectangle.getState().Y,
          };

          this.#rectangle.draw(data);
        }
      } else {
        const data = {
          X0: this.#prevCursorX,
          Y0: this.#prevCursorY,
          X1: this.#cursorX,
          Y1: this.#cursorY,
          color: this.#eraser.getState().isSelected
            ? this.#eraser.getState().color
            : this.#pencil.getState().color,
          width: this.#eraser.getState().isSelected
            ? this.#eraser.getState().size
            : this.#pencil.getState().size,
        };

        this.#drawStroke(data);

        this.#drawingState.userId = userId;
        this.#drawingState.roomId = this.#roomId;
        this.#drawingState.id = nanoid();
        this.#drawingState.type = "freehand";
        this.#drawingState.color = data.color;
        this.#drawingState.width = data.width;
        this.#drawingState.scale = this.#scale;
        this.#drawingState.points.push({
          X0: prevScaledX,
          Y0: prevScaledY,
          X1: scaledX,
          Y1: scaledY,
        });

        this.#socket.emit(SOCKET_ACTION.CANVAS_UPDATE, {
          X0: prevScaledX,
          Y0: prevScaledY,
          X1: scaledX,
          Y1: scaledY,
          type: this.#drawingState.type,
          color: this.#drawingState.color,
          width: this.#drawingState.width,
          roomId: this.#drawingState.roomId,
          userId: this.#drawingState.userId,
        });

        this.#isDrawing = true;
        this.#isDrawingCleared = false;
      }
    }
    this.#prevCursorX = this.#cursorX;
    this.#prevCursorY = this.#cursorY;
  };

  #endDrawing = (event) => {
    this.#actionContainer.classList.remove("pointer-none");
    this.#mouseButton = MOUSE_BUTTON.NONE;

    this.#body.style.cursor = "crosshair";

    if (!this.#isDrawing) return;

    this.#roomState.get(userId).push(this.#drawingState);
    try {
      this.#db.saveData(this.#drawingState);
    } catch (err) {
      console.log(err);
    }

    this.#socket.emit(SOCKET_ACTION.UPDATE_ROOM_STATE, this.#drawingState);

    this.#isDrawing = false;
    this.#drawingState = { points: [] };
  };

  #redrawCanvas() {
    const state = this.#roomState.get(userId).state();

    Array.from(this.#roomState.entries()).forEach(([userId, stack]) => {
      const userState = stack.state();
      if (userState && userState.length) {
        state.push(...userState);
      }
    });

    this.#canvas.width = document.body.clientWidth;
    this.#canvas.height = document.body.clientHeight;

    this.#clear();
    // (this.#scale >= 1 ? line.width * this.#scale : line.width * this.#scale)

    for (let line of state) {
      for (let point of line.points) {
        this.#drawStroke({
          X0: this.#toScreenX(point.X0),
          Y0: this.#toScreenY(point.Y0),
          color: line.color,
          width:
            this.#scale <= line.width ? line.width * this.#scale : line.width,
          X1: this.#toScreenX(point.X1),
          Y1: this.#toScreenY(point.Y1),
        });
      }
    }
  }

  #drawStroke = (options) => {
    this.#tool.beginPath();
    this.#tool.moveTo(options.X0, options.Y0);
    this.#tool.lineTo(options.X1, options.Y1);
    this.#tool.strokeStyle = options.color;
    this.#tool.lineWidth = options.width;
    this.#tool.lineCap = "round";
    this.#tool.lineJoin = "round";
    this.#tool.stroke();
  };

  #clear = () => {
    this.#tool.fillStyle = "white";
    this.#tool.fillRect(
      0,
      0,
      document.body.clientWidth,
      document.body.clientHeight
    );
  };

  #toScreenX(xTrue) {
    return (xTrue + this.#offsetX) * this.#scale;
  }

  #toScreenY(yTrue) {
    return (yTrue + this.#offsetY) * this.#scale;
  }

  #toTrueX(xScreen) {
    return xScreen / this.#scale - this.#offsetX;
  }

  #toTrueY(yScreen) {
    return yScreen / this.#scale - this.#offsetY;
  }

  #trueHeight() {
    return this.#canvas.clientHeight / this.#scale;
  }

  #trueWidth() {
    return this.#canvas.clientWidth / this.#scale;
  }

  #onMouseWheel = (event) => {
    event.preventDefault();
    const deltaY = event.deltaY;
    const scaleAmount = -deltaY / 1000;

    if (
      (this.#scale === 0.1 && scaleAmount < 0) ||
      (this.#scale === 10 && scaleAmount > 0)
    )
      return;

    if (scaleAmount < 0) {
      this.#scale = Math.max(0.1, this.#scale * (1 + scaleAmount));
    } else {
      this.#scale = Math.min(10, this.#scale * (1 + scaleAmount));
    }

    this.#zoom.update(this.#scale);

    // zoom the page based on where the cursor is
    var distX = event.pageX / this.#canvas.clientWidth;
    var distY = event.pageY / this.#canvas.clientHeight;

    // calculate how much we need to zoom
    const unitsZoomedX = this.#trueWidth() * scaleAmount;
    const unitsZoomedY = this.#trueHeight() * scaleAmount;

    const unitsAddLeft = unitsZoomedX * distX;
    const unitsAddTop = unitsZoomedY * distY;

    this.#offsetX -= unitsAddLeft;
    this.#offsetY -= unitsAddTop;

    this.#redrawCanvas();
  };

  redo = () => {
    const nextState = this.#roomState.get(userId).next();
    if (nextState) {
      this.#socket.emit(SOCKET_ACTION.UNDO_OR_REDO, { type: "redo", userId });
      this.#redrawCanvas();
    }
  };

  undo = () => {
    this.#roomState.get(userId).prev();
    this.#socket.emit(SOCKET_ACTION.UNDO_OR_REDO, { type: "undo", userId });
    this.#redrawCanvas();
  };

  clear() {
    if (this.#isDrawingCleared) return;
    this.#clear();
    this.#isDrawingCleared = true;
    this.#socket.emit(SOCKET_ACTION.CANVAS_CLEAR);
  }
}

class Zoom {
  #zoomValue;
  constructor() {
    this.zoomAction = document.querySelector(".zoom-actions");
    this.#zoomValue = this.zoomAction.querySelector(".zoom-value");

    this.zoomAction.addEventListener("click", (event) => {
      if (event.target.classList.contains("zoom-actions")) return;
      const targetClass = event.target.classList[0];
      switch (targetClass) {
        case "zoom-in":
          return this.#zoomIn;
        case "zoom-out":
          return this.#zoomOut;
        default:
          return this.#reset();
      }
    });
  }

  #zoomIn = () => {};

  #zoomOut = () => {};

  #reset = () => {};

  update(scale) {
    this.#zoomValue.innerText = `${(scale * 100).toFixed(0)}%`;
  }
}

const pencil = new Pencil();
const shape = new Shape();
const eraser = new Eraser();
const zoom = new Zoom();
const canvas = new Canvas({
  canvasId: ".canvas",
  pencil,
  eraser,
  db,
  shape,
  zoom,
});
const actions = new Actions({ pencil, shape, eraser, canvas });

// // // Handle cleanup action
// // function minimizeHandling(stickyNote) {
// //   const minimize = stickyNote.querySelector(".minimize");
// //   let minimizeMenu = true;
// //   minimize.addEventListener("click", (e) => {
// //     const note = stickyNote.querySelector(".note");
// //     // const thisstickyNote = stickyNote.querySelector(".sticky-note")
// //     if (minimizeMenu) {
// //       stickyNote.style.animationName = "hideNote";
// //       setTimeout(() => {
// //         stickyNote.style.height = "4rem";
// //         minimizeMenu = false;
// //       }, 280);
// //       note.style.display = "none";
// //     } else {
// //       stickyNote.style.animationName = "showNote";
// //       setTimeout(() => {
// //         stickyNote.style.height = "16rem";
// //         note.style.display = "block";
// //         minimizeMenu = true;
// //       }, 280);
// //     }
// //   });
// // }

// // function removeHandling(stickyNote) {
// //   const remove = stickyNote.querySelector(".remove");
// //   remove.addEventListener("click", (e) => {
// //     stickyNote.remove();
// //   });
// // }

// // function dragAndDrop(ball) {
// //   ball.onmousedown = function (event) {
// //     let shiftX = event.clientX - ball.getBoundingClientRect().left;
// //     let shiftY = event.clientY - ball.getBoundingClientRect().top;

// //     ball.style.position = 'absolute';
// //     ball.style.zIndex = 1000;

// //     moveAt(event.pageX, event.pageY);

// //     // moves the ball at (pageX, pageY) coordinates
// //     // taking initial shifts into account
// //     function moveAt(pageX, pageY) {
// //       ball.style.left = pageX - shiftX + 'px';
// //       ball.style.top = pageY - shiftY + 'px';
// //     }

// //     function onMouseMove(event) {
// //       moveAt(event.pageX, event.pageY);
// //     }

// //     // move the ball on mousemove
// //     document.addEventListener('mousemove', onMouseMove);

// //     // drop the ball, remove unneeded handlers
// //     ball.onmouseup = function () {
// //       document.removeEventListener('mousemove', onMouseMove);
// //       ball.onmouseup = null;
// //     };

// //   };

// //   ball.ondragstart = function () {
// //     return false;
// //   };
// // }

// // // Sticky note Working
// // actions[4].addEventListener("click", (e) => {
// //   const stickyNote = document.createElement("div");
// //   stickyNote.setAttribute("class", "sticky-note");
// //   stickyNote.innerHTML = `<div class="note-action">
// //                                 <div class="minimize"></div>
// //                                 <div class="remove"></div>
// //                             </div>
// //                             <div contenteditable="true" spellcheck="false" class="note"></div>`;
// //   body.appendChild(stickyNote);
// //   minimizeHandling(stickyNote);
// //   removeHandling(stickyNote);
// //   dragAndDrop(stickyNote);
// // });

// // actions[3].addEventListener("click", (e) => {
// //   const input = document.createElement("input")
// //   input.setAttribute("type", "file")
// //   input.click()
// //   input.addEventListener("change", (e) => {
// //     const file = input.files[0];
// //     const url = URL.createObjectURL(file)
// //     const stickyNote = document.createElement("div");
// //     stickyNote.setAttribute("class", "sticky-note");
// //     stickyNote.innerHTML = `<div class="note-action">
// //                                     <div class="minimize"></div>
// //                                     <div class="remove"></div>
// //                                 </div>
// //                                 <div contenteditable="true" spellcheck="false" class="note">
// //                                   <img src="${url}">
// //                                 </div>
// //                                   `;
// //     body.appendChild(stickyNote);
// //     minimizeHandling(stickyNote);
// //     removeHandling(stickyNote);
// //     dragAndDrop(stickyNote);
// //   })
// // })

// // Shape data structure
// let shapes = [];
// let selectedShape = null;
// let dragging = false;
// let offsetX, offsetY;

// // Shape classes
// class Shape1 {
//   constructor(x, y, width, height, type) {
//     this.x = x;
//     this.y = y;
//     this.width = width;
//     this.height = height;
//     this.type = type;
//   }
//   draw(ctx) {
//     ctx.beginPath();
//     ctx.lineWidth = 2;
//     ctx.strokeStyle = "black";

//     switch (this.type) {
//       case "rectangle":
//         ctx.strokeRect(this.x, this.y, this.width, this.height);
//         break;
//       case "circle":
//         ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
//         ctx.stroke();
//         break;
//       case "line":
//         ctx.moveTo(this.x, this.y);
//         ctx.lineTo(this.x + this.width, this.y + this.height);
//         ctx.stroke();
//         break;
//       case "arrow":
//         drawArrow(ctx, this.x, this.y, this.x + this.width, this.y + this.height);
//         break;
//       case "diamond":
//         ctx.moveTo(this.x + this.width / 2, this.y);
//         ctx.lineTo(this.x + this.width, this.y + this.height / 2);
//         ctx.lineTo(this.x + this.width / 2, this.y + this.height);
//         ctx.lineTo(this.x, this.y + this.height / 2);
//         ctx.closePath();
//         ctx.stroke();
//         break;
//       case "triangle":
//         ctx.moveTo(this.x + this.width / 2, this.y);
//         ctx.lineTo(this.x + this.width, this.y + this.height);
//         ctx.lineTo(this.x, this.y + this.height);
//         ctx.closePath();
//         ctx.stroke();
//         break;
//       case "star":
//         drawStar(ctx, this.x + this.width / 2, this.y + this.height / 2, 5, this.width / 2, this.width / 4);
//         break;
//     }
//   }
//   contains(x, y) {
//     return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
//   }
// }

// function drawArrow(ctx, fromX, fromY, toX, toY) {
//   ctx.beginPath();
//   ctx.moveTo(fromX, fromY);
//   ctx.lineTo(toX, toY);
//   ctx.stroke();

//   let angle = Math.atan2(toY - fromY, toX - fromX);
//   let headLength = 10;
//   ctx.moveTo(toX, toY);
//   ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
//   ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
//   ctx.lineTo(toX, toY);
//   ctx.fill();
// }

// function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
//   let rot = Math.PI / 2 * 3;
//   let x = cx;
//   let y = cy;
//   let step = Math.PI / spikes;

//   ctx.beginPath();
//   ctx.moveTo(cx, cy - outerRadius);
//   for (let i = 0; i < spikes; i++) {
//     x = cx + Math.cos(rot) * outerRadius;
//     y = cy + Math.sin(rot) * outerRadius;
//     ctx.lineTo(x, y);
//     rot += step;
//     x = cx + Math.cos(rot) * innerRadius;
//     y = cy + Math.sin(rot) * innerRadius;
//     ctx.lineTo(x, y);
//     rot += step;
//   }
//   ctx.closePath();
//   ctx.stroke();
// }

// function redrawCanvas() {
//   ctx.clearRect(0, 0, canvas.width, canvass.height);
//   shapes.forEach(shape => shape.draw(ctx));
// }

// canvass.addEventListener("mousedown", (e) => {
//   const mouseX = e.offsetX;
//   const mouseY = e.offsetY;
//   selectedShape = shapes.find(shape => shape.contains(mouseX, mouseY));
//   if (selectedShape) {
//     dragging = true;
//     offsetX = mouseX - selectedShape.x;
//     offsetY = mouseY - selectedShape.y;
//   }
// });

// canvass.addEventListener("mousemove", (e) => {
//   if (dragging && selectedShape) {
//     selectedShape.x = e.offsetX - offsetX;
//     selectedShape.y = e.offsetY - offsetY;
//     redrawCanvas();
//   }
// });

// canvass.addEventListener("mouseup", () => { dragging = false; });
// canvass.addEventListener("mouseleave", () => { dragging = false; });

// document.querySelector(".zoom-value").addEventListener("click", () => {
//   shapes = [];
//   redrawCanvas();
// });

// document.querySelectorAll(".shape-btn").forEach(button => {
//   button.addEventListener("click", () => {
//     let type = button.getAttribute("data-shape");
//     shapes.push(new Shape1(50, 50, 50, 50, type));
//     redrawCanvas();
//   });
// });

const stage = new Stage({
  container: document.querySelector(".canvas-container"),
  width: window.innerWidth,
  height: window.innerHeight,
  x: 0,
  y: 0,

  // clearBeforeDraw?: boolean;

  // clipX?: number;
  // clipY?: number;

  // [index: string]: any;
  // x?: number;
  // y?: number;
  // width?: number;
  // height?: number;
  // visible?: boolean;
  // listening?: boolean;
  // id?: string;
  // name?: string;
  // opacity?: number;
  // scale?: Vector2d;
  // scaleX?: number;
  // skewX?: number;
  // skewY?: number;
  // scaleY?: number;
  // rotation?: number;
  // rotationDeg?: number;
  // offset?: Vector2d;
  // offsetX?: number;
  // offsetY?: number;
  // draggable?: boolean;
  // dragDistance?: number;
  // dragBoundFunc?: (this: Node, pos: Vector2d) => Vector2d;
  // preventDefault?: boolean;
  // globalCompositeOperation?: globalCompositeOperationType;
  // filters?: Array<Filter>;
});
