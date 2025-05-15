import { MOUSE_BUTTON, SOCKET_ACTION, SHAPES } from "./enums.js";
import { nanoid } from "./nanoid.js";
import { IndexedDB } from "./indexed-db.js";
import { Stack } from "./stack.js";
import { Actions } from "./action.js";
import { Eraser } from "./eraser.js";
import { Pencil } from "./pencil.js";
import { Shape } from "./shape.js";
import { Zoom } from "./zoom.js";
import { Arrow } from "./arrow.js";
import { Circle } from "./circle.js";
import { Freehand } from "./freehand.js";
import { Line } from "./line.js";
import { Rectangle } from "./rectangle.js";
import { Star } from "./star.js";
import { Text } from "./text.js";
import { Triangle } from "./triangle.js";

document.oncontextmenu = () => {
  return false;
};

const db = new IndexedDB("whiteboard", "actions");
const roomsDb = new IndexedDB("rooms", "recent-rooms");

try {
  await db.openDatabase();
  await roomsDb.openDatabase();
} catch (err) {
  console.log(err);
}

const userId = nanoid();

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
  #circle;
  #line;
  #rhombus;
  #star;
  #triangle;
  #arrow;

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

    window.addEventListener("resize", (event) => {
      this.#redrawCanvas();
    });

    this.#socket.emit(SOCKET_ACTION.JOIN_ROOM, {
      userId,
      roomId: this.#roomId,
      state: this.#roomState.get(userId).state(),
    });

    this.#socket.on(SOCKET_ACTION.JOIN_ROOM, (data) => {
      console.log(data);

      const stack = new Stack();
      if (data.stack && data.stack.length) {
        stack.push(...data.state);
      }
      this.#roomState.set(data.userId, stack);
      this.#redrawCanvas();
    });

    this.#socket.on(SOCKET_ACTION.JOINED_USERS_STATE, async (data) => {
      console.log(data);

      await roomsDb.saveData({
        id: data.id,
        name: data.name,
        expireAt: data.expireAt,
      });
      data.forEach((userState) => {
        const stack = new Stack();
        stack.push(...userState.state);
        this.#roomState.set(userState.userId, stack);
      });
      this.#redrawCanvas();
    });

    this.#socket.on(SOCKET_ACTION.CANVAS_UPDATE, (data) => {
      this.#drawStroke(data);
    });

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

      this.#drawStroke(data);

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

  #startDrawing = (event) => {
    this.#pencil.closeDialog();
    this.#eraser.closeDialog();
    this.#shape.closeDialog();
    this.#actionContainer.classList.add("pointer-none");
    this.#mouseButton = this.#getClickedMouse(event);
    if (this.#mouseButton === MOUSE_BUTTON.RIGHT) return;
    console.log(Date.now() - this.#prevClick);

    if (
      this.#mouseButton === MOUSE_BUTTON.LEFT &&
      this.#prevClick &&
      !this.#isDrawing &&
      Date.now() - this.#prevClick < 400
    ) {
      console.log("Double clicks");
    }

    this.#prevClick = Date.now();

    const touch = (event.touches || [])[0] || event;

    this.#cursorX = touch.pageX;
    this.#cursorY = touch.pageY;
    this.#prevCursorX = touch.pageX;
    this.#prevCursorY = touch.pageY;

    console.log(this.#shape.getState().color);

    if (
      this.#mouseButton === MOUSE_BUTTON.LEFT &&
      this.#shape.getState().isSelected
    ) {
      if (this.#shape.getState().selectedShape === SHAPES.RECTANGLE) {
        this.#rectangle = new Rectangle(this.#tool, {
          X: this.#cursorX,
          Y: this.#cursorY,
          width: 0,
          height: 0,
          color: this.#shape.getState().color,
        });
      } else if (this.#shape.getState().selectedShape === SHAPES.CIRCLE) {
        this.#circle = new Circle(this.#tool, {
          X: this.#cursorX,
          Y: this.#cursorY,
          radius: 0,
          color: this.#shape.getState().color,
        });
      } else if (this.#shape.getState().selectedShape === SHAPES.LINE) {
        this.#line = new Line(this.#tool, {
          startX: this.#cursorX,
          startY: this.#cursorY,
          endX: this.#cursorX,
          endY: this.#cursorY,
          color: this.#shape.getState().color,
          lineWidth: this.#pencil.getState().size,
        });
      } else if (this.#shape.getState().selectedShape === SHAPES.ARROW) {
        this.#arrow = new Arrow(this.#tool, {
          startX: this.#cursorX,
          startY: this.#cursorY,
          endX: this.#cursorX,
          endY: this.#cursorY,
          color: this.#shape.getState().color,
          lineWidth: this.#pencil.getState().size,
          arrowSize: this.#pencil.getState().size*2,
        });
      } else if (this.#shape.getState().selectedShape === SHAPES.TRIANGLE) {
        this.#triangle = new Triangle(this.#tool, {
          X: this.#cursorX,
          Y: this.#cursorY,
          base: 0,
          height: 0,
          color: this.#shape.getState().color,
        });
      } else if (this.#shape.getState().selectedShape === SHAPES.RHOMBUS) {
        this.#rhombus = new Rectangle(this.#tool, {
          X: this.#cursorX,
          Y: this.#cursorY,
          base: 0,
          height: 0,
          color: this.#shape.getState().color,
        });
      } else if (this.#shape.getState().selectedShape === SHAPES.STAR) {
        this.#star = new Star(this.#tool, {
          X: this.#cursorX,
          Y: this.#cursorY,
          radius: 0,
          points: 0,
          color: this.#shape.getState().color,
        });
      }
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
        console.log(selectedShape);

        if (selectedShape === "rectangle") {
          const data = {
            width: this.#cursorX - this.#rectangle.getState().X,
            height: this.#cursorY - this.#rectangle.getState().Y,
          };

          console.log(data);

          this.#redrawCanvas();
          this.#rectangle.draw(data);
        } else if (selectedShape === "circle") {
          const data = {
            radius: Math.sqrt(
              Math.pow(this.#cursorX - this.#circle.getState().X, 2) +
                Math.pow(this.#cursorY - this.#circle.getState().Y, 2)
            ),
            color: this.#shape.getState().color,
          };

          this.#redrawCanvas();
          this.#circle.draw(data);
        } else if (selectedShape === "line") {
          const data = {
            endX: this.#cursorX,
            endY: this.#cursorY,
            color: this.#shape.getState().color,
          };

          this.#redrawCanvas();
          this.#line.draw(data);
        } else if (selectedShape === "arrow") {
          const data = {
            // startX: this.#cursorX,
            // startY: this.#cursorY,
            endX: this.#cursorX,
            endY: this.#cursorY,
            color: this.#eraser.getState().isSelected
              ? this.#eraser.getState().color
              : this.#pencil.getState().color,
            lineWidth: this.#eraser.getState().isSelected
              ? this.#eraser.getState().size
              : this.#pencil.getState().size,
            arrowSize: this.#eraser.getState().isSelected
              ? this.#eraser.getState().size
              : this.#pencil.getState().size,
          };

          this.#redrawCanvas();
          this.#arrow.draw(data);
        } else if (selectedShape === "rhombus") {
          const data = {
            X: this.#cursorX,
            Y: this.#cursorY,
            base: this.#pencil.getState().size,
            height: this.#pencil.getState().size,
            color: this.#shape.getState().color,
          };

          this.#redrawCanvas();
          this.#rhombus.draw(data);
        }
        else if(selectedShape === 'triangle'){ 
          const data = {
            base: this.#cursorX,
            height: this.#cursorY,
          };
          this.#redrawCanvas();
          this.#triangle.draw(data);
        }else if(selectedShape === 'star'){
          const data = {
            radius: this.#cursorX,
            points: 5,
          };
          this.#redrawCanvas();
          this.#star.draw(data);
        }
        
        
        else if (selectedShape === "eraser") {
          const data = {
            X0: this.#prevCursorX,
            Y0: this.#prevCursorY,
            X1: this.#cursorX,
            Y1: this.#cursorY,
            color: this.#eraser.getState().isSelected
              ? this.#eraser.getState().color
              : this.#pencil.getState().color,
            lineWidth: this.#eraser.getState().isSelected
              ? this.#eraser.getState().size
              : this.#pencil.getState().size,
            arrowSize: this.#eraser.getState().isSelected
              ? this.#eraser.getState().size
              : this.#pencil.getState().size,
          };

          this.#redrawCanvas();
          this.#arrow.draw(data);
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

    var distX = event.pageX / this.#canvas.clientWidth;
    var distY = event.pageY / this.#canvas.clientHeight;

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

  toDataURL() {
    return this.#canvas.toDataURL();
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
