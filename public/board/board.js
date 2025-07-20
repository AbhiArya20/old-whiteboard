import { MOUSE_BUTTON, SOCKET_ACTION, SHAPES } from "./enums.js";
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
import { Rhombus } from "./rhombus.js";

document.oncontextmenu = () => {
  return false;
};

const roomsDb = new IndexedDB("rooms", "recent-rooms");

try {
  await roomsDb.openDatabase();
} catch (err) {
  console.log(err);
}

class Canvas {
  #roomState;

  #actionContainer;

  #body;

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
  #text;
  #freehand;

  #userId;

  #mouseButton;

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
  #socket;
  #zoom;

  #roomId;

  #isDialogOpen;

  constructor(options) {
    const SocketURL = `${location.protocol}//${location.host}`;
    this.#socket = io.connect(SocketURL);

    this.#roomId = location.pathname.slice(1);

    this.#roomState = {
      id: this.#roomId,
      users: new Map(),
    };

    this.#pencil = options.pencil;
    this.#shape = options.shape;
    this.#eraser = options.eraser;
    this.#zoom = options.zoom;

    this.#body = document.querySelector("body");
    this.#body.style.cursor = "crosshair";

    this.#actionContainer = document.querySelector(".action-container");

    this.#canvas = document.querySelector(options.canvasId);
    this.#tool = this.#canvas.getContext("2d", { willReadFrequently: true });
    this.#canvas.width = window.innerWidth;
    this.#canvas.height = window.innerHeight;

    this.#isDialogOpen = false;

    this.#mouseButton = MOUSE_BUTTON.NONE;

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
     this.#canvas.addEventListener("touchstart", this.#startDrawing);
    this.#canvas.addEventListener("touchmove", this.#drawing, {
      passive: true,
    });
    this.#canvas.addEventListener("touchend", this.#endDrawing);
    this.#canvas.addEventListener("touchcancel", this.#endDrawing);

    window.addEventListener("resize", (event) => {
      this.#redrawCanvas();
    });

    this.#socket.on(SOCKET_ACTION.USER_ID, (data) => {
      this.#userId = data;
    });

    this.#socket.emit(SOCKET_ACTION.JOIN_ROOM, {
      roomId: this.#roomId,
    });

    this.#socket.on(SOCKET_ACTION.JOIN_ROOM, (data) => {
      console.log(data);

      const userStack = new Stack();
      userStack.push(...data.stack);
      userStack.top(data.top);
      delete data.top;
      this.#roomState.users.set(data.userId, {
        ...data,
        stack: userStack,
      });
      this.#redrawCanvas();
    });

    this.#socket.on(SOCKET_ACTION.JOINED_USERS_STATE, async (data) => {
      this.#roomState.name = data.name;
      this.#roomState.expireAt = data.expireAt;

      for (let user of data.users) {
        const userStack = new Stack();
        userStack.push(...user.stack);
        userStack.top(user.top);
        delete user.top;
        this.#roomState.users.set(user.userId, {
          ...user,
          stack: userStack,
        });
      }

      await roomsDb.saveData({
        id: data.id,
        name: data.name,
        expireAt: data.expireAt,
      });

      this.#redrawCanvas();
    });

    this.#socket.on(SOCKET_ACTION.CANVAS_UPDATE, (data) => {

    });

    this.#socket.on(SOCKET_ACTION.UPDATE_ROOM_STATE, async (data) => {
      this.#roomState.users?.get(data.userId)?.stack?.push(data.state);
      this.#redrawCanvas();
    });

    this.#socket.on(SOCKET_ACTION.CANVAS_CLEAR, () => {
      this.#clear();
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

  #startDrawing = (event) => {
    this.#pencil.closeDialog();
    this.#eraser.closeDialog();
    this.#shape.closeDialog();
    this.#actionContainer.classList.add("pointer-none");
    this.#mouseButton = this.#getClickedMouse(event);
    if (this.#mouseButton === MOUSE_BUTTON.RIGHT) return;

    if (this.#isDialogOpen) return;

    if (this.#mouseButton === MOUSE_BUTTON.MIDDLE) {
      this.#body.style.cursor = "grab";

      this.#offsetX += (this.#cursorX - this.#prevCursorX) / this.#scale;
      this.#offsetY += (this.#cursorY - this.#prevCursorY) / this.#scale;
      this.#redrawCanvas();

      return;
    }    

    const touch = (event.touches || [])[0] || event;

    const isTouch = event.touches && event.touches.length > 0;

    if(isTouch) {
      this.#touchCount = event.touches.length;
      this.#prevTouches = event.touches;
    }

    this.#cursorX = touch.pageX;
    this.#cursorY = touch.pageY;
    this.#prevCursorX = touch.pageX;
    this.#prevCursorY = touch.pageY;
    

    if (
      (this.#mouseButton === MOUSE_BUTTON.LEFT || isTouch) &&
      this.#shape.getState().isSelected
    ) {
      if (this.#shape.getState().selectedShape === SHAPES.RECTANGLE) {
        this.#rectangle = new Rectangle(this.#tool, {
          X: this.#cursorX,
          Y: this.#cursorY,
          width: 0,
          height: 0,
          color: this.#shape.getState().color,
          lineWidth: this.#shape.getState().size,
        });
      } else if (this.#shape.getState().selectedShape === SHAPES.CIRCLE) {
        this.#circle = new Circle(this.#tool, {
          X: this.#cursorX,
          Y: this.#cursorY,
          radius: 0,
          color: this.#shape.getState().color,
          lineWidth: this.#shape.getState().size,
        });
      } else if (this.#shape.getState().selectedShape === SHAPES.LINE) {
        this.#line = new Line(this.#tool, {
          startX: this.#cursorX,
          startY: this.#cursorY,
          endX: this.#cursorX,
          endY: this.#cursorY,
          color: this.#shape.getState().color,
          lineWidth: this.#shape.getState().size,
        });
      } else if (this.#shape.getState().selectedShape === SHAPES.ARROW) {
        this.#arrow = new Arrow(this.#tool, {
          startX: this.#cursorX,
          startY: this.#cursorY,
          endX: this.#cursorX,
          endY: this.#cursorY,
          color: this.#shape.getState().color,
          lineWidth: this.#shape.getState().size,
        });
      } else if (this.#shape.getState().selectedShape === SHAPES.RHOMBUS) {
        this.#rhombus = new Rhombus(this.#tool, {
          X: this.#cursorX,
          Y: this.#cursorY,
          width: 0,
          height: 0,
          color: this.#shape.getState().color,
          lineWidth: this.#shape.getState().size,
        });
      } else if (this.#shape.getState().selectedShape === SHAPES.TRIANGLE) {
        this.#triangle = new Triangle(this.#tool, {
          X: this.#cursorX,
          Y: this.#cursorY,
          width: 0,
          height: 0,
          color: this.#shape.getState().color,
          lineWidth: this.#shape.getState().size,
        });
      } else if (this.#shape.getState().selectedShape === SHAPES.STAR) {
        this.#star = new Star(this.#tool, {
          X: this.#cursorX,
          Y: this.#cursorY,
          radius: 0,
          points: 0,
          color: this.#shape.getState().color,
          lineWidth: this.#shape.getState().size,
        });
      } else if (this.#shape.getState().selectedShape === SHAPES.TEXT) {
        this.#isDialogOpen = true;
        const inputId = 'current-text'; 

        const input = document.createElement("input");
        input.id = inputId;
        input.type = "text";
        input.style.position = "absolute";
        input.style.padding = "0";
        input.style.margin = "0";
        input.style.minWidth = "3rem";
        input.style.width = "max-content";
        input.style.backgroundColor = "transparent";
        input.style.transform = "translate(0, -50%)";
        input.style.top = (this.#cursorY - 10) + "px";
        input.style.left = this.#cursorX + "px";
        input.placeholder = "Enter text";
        input.style.height = (this.#shape.getState().size + 10) + "px";
        input.style.border = "none";
        input.style.outline = "none";
        input.style.fontSize = (this.#shape.getState().size * 1.5)  + "px";
        input.style.fontFamily = this.#shape.getState().font;
        input.style.color = this.#shape.getState().color;
        input.autocomplete = "off";
        
        this.#body.appendChild(input);

        setTimeout(() => input.focus(), 0);

        const style = document.createElement('style');
        style.innerHTML = `
          #${inputId}::placeholder {
            color: ${this.#shape.getState().color} !important;
            opacity: 0.7 !important;
          }
        `;

        const head = document.querySelector("head");
        head.appendChild(style);
        
        input.addEventListener("blur", (event) => {
          event.preventDefault();
          if(input.value.length>0) {            
            this.#text = new Text(this.#tool, {
              X: this.#cursorX,
              Y: this.#cursorY,
              text: input.value,
              fontSize: (this.#shape.getState().size * 1.5),
              fontFamily: this.#shape.getState().font,
              color: this.#shape.getState().color,
            });
            this.#text.draw();const style = document.createElement('style');
            style.innerHTML = `
              #${inputId}::placeholder {
                color: ${this.#shape.getState().color} !important;
                opacity: 0.7 !important;
              }
            `;
            this.#emitCurrentState();
          }  
          this.#actionContainer.classList.remove("pointer-none");        
          this.#body.removeChild(input);
          setTimeout(() => {
            this.#isDialogOpen = false;
          }, 500);
        });  

        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === "Escape") {
            input.blur();
          }
        });
      }
    } else if (
      (this.#mouseButton === MOUSE_BUTTON.LEFT || isTouch) &&
      this.#pencil.getState().isSelected
    ) {
      this.#freehand = new Freehand(this.#tool, {
        startX: this.#cursorX,
        startY: this.#cursorY,
        color: this.#pencil.getState().color,
        lineWidth: this.#pencil.getState().size,
        points: [{ X: this.#cursorX, Y: this.#cursorY }],
      });
    }
  };

  // #drawingTouch = (event) => {
  //   event.preventDefault();

  //   const touch0X = event.touches[0].pageX;
  //   const touch0Y = event.touches[0].pageY;
  //   const prevTouch0X = this.#prevTouches[0].pageX;
  //   const prevTouch0Y = this.#prevTouches[0].pageY;


  //   if (this.#touchCount === 1) {
      
  //   } else {
  //     const touch1X = event.touches[1].pageX;
  //     const touch1Y = event.touches[1].pageY;
  //     const prevTouch1X = this.#prevTouches[1].pageX;
  //     const prevTouch1Y = this.#prevTouches[1].pageY;

  //     const midX = (touch0X + touch1X) / 2;
  //     const midY = (touch0Y + touch1Y) / 2;
  //     const prevMidX = (prevTouch0X + prevTouch1X) / 2;
  //     const prevMidY = (prevTouch0Y + prevTouch1Y) / 2;

  //     const hypot = Math.sqrt(
  //       Math.pow(touch0X - touch1X, 2) + Math.pow(touch0Y - touch1Y, 2)
  //     );
  //     const prevHypot = Math.sqrt(
  //       Math.pow(prevTouch0X - prevTouch1X, 2) +
  //         Math.pow(prevTouch0Y - prevTouch1Y, 2)
  //     );

  //     const zoomAmount = hypot / prevHypot;
  //     this.#scale = this.#scale * zoomAmount;
  //     const scaleAmount = 1 - zoomAmount;

  //     const panX = midX - prevMidX;
  //     const panY = midY - prevMidY;

  //     this.#offsetX += panX / this.#scale;
  //     this.#offsetY += panY / this.#scale;

  //     const zoomRatioX = midX / this.#canvas.clientWidth;
  //     const zoomRatioY = midY / this.#canvas.clientHeight;

  //     const unitsZoomedX = this.#trueWidth() * scaleAmount;
  //     const unitsZoomedY = this.#trueHeight() * scaleAmount;

  //     const unitsAddLeft = unitsZoomedX * zoomRatioX;
  //     const unitsAddTop = unitsZoomedY * zoomRatioY;

  //     this.#offsetX += unitsAddLeft;
  //     this.#offsetY += unitsAddTop;

  //     this.#socket.emit("touchstart", "Running");

  //     redrawCanvas();
  //   }

  //   this.#prevTouches[0] = event.touches[0];
  //   this.#prevTouches[1] = event.touches[1];
  // };

  #drawing = (event) => {
    if(this.#isDialogOpen || this.#shape.getState().selectedShape === SHAPES.TEXT) return;

    const touch = (event.touches || [])[0] || event;

    const isTouch = event.touches && event.touches.length > 0;

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
      return;
    }

    if (
      (this.#mouseButton === MOUSE_BUTTON.LEFT || isTouch) &&
      this.#shape.getState().isSelected
    ) {
      const selectedShape = this.#shape.getState().selectedShape;
      this.#redrawCanvas();
      if (selectedShape === SHAPES.RECTANGLE) {
        const data = {
          width: this.#cursorX - this.#rectangle.getState().X,
          height: this.#cursorY - this.#rectangle.getState().Y,
        };
        this.#rectangle.draw(data);
      } else if (selectedShape === SHAPES.CIRCLE) {
        const data = {
          width: this.#cursorX - this.#circle.getState().X,
          height: this.#cursorY - this.#circle.getState().Y,
        };
        this.#circle.draw(data);
      } else if (selectedShape === SHAPES.LINE) {
        const data = {
          endX: this.#cursorX,
          endY: this.#cursorY,
        };
        this.#line.draw(data);
      } else if (selectedShape === SHAPES.ARROW) {
        const data = {
          endX: this.#cursorX,
          endY: this.#cursorY,
        };
        this.#arrow.draw(data);
      } else if (selectedShape === SHAPES.RHOMBUS) {
        const data = {
          width: this.#cursorX - this.#rhombus.getState().X,
          height: this.#cursorY - this.#rhombus.getState().Y,
        };
        this.#rhombus.draw(data);
      } else if (selectedShape === SHAPES.TRIANGLE) {
        const data = {
          width: this.#cursorX - this.#triangle.getState().X,
          height: this.#cursorY - this.#triangle.getState().Y,
        };
        this.#triangle.draw(data);
      } else if (selectedShape === SHAPES.STAR) {
        const data = {
          radius: this.#cursorX - this.#star.getState().X,
          points: 5,
        };
        this.#star.draw(data);
      }
    } else if (
      (this.#mouseButton === MOUSE_BUTTON.LEFT || isTouch) &&
      this.#pencil.getState().isSelected
    ) {
      const data = {
        X: this.#cursorX,
        Y: this.#cursorY,
      };
      this.#freehand.draw(data);
    }

    if (this.#mouseButton === MOUSE_BUTTON.LEFT || isTouch) {
      this.#isDrawing = true;
      this.#isDrawingCleared = false;
    }

    this.#prevCursorX = this.#cursorX;
    this.#prevCursorY = this.#cursorY;
  };

  #getCurrentState = () => {
    if (this.#rectangle) return this.#rectangle.getState();
    if (this.#circle) return this.#circle.getState();
    if (this.#line) return this.#line.getState();
    if (this.#arrow) return this.#arrow.getState();
    if (this.#rhombus) return this.#rhombus.getState();
    if (this.#triangle) return this.#triangle.getState();
    if (this.#star) return this.#star.getState();
    if (this.#text) return this.#text.getState();
    if (this.#freehand) return this.#freehand.getState();
  };

  #clearCurrentState = () => {
    this.#rectangle = null;
    this.#circle = null;
    this.#line = null;
    this.#arrow = null;
    this.#rhombus = null;
    this.#triangle = null;
    this.#star = null;
    this.#text = null;
    this.#freehand = null;
  };

  #endDrawing = (event) => {
    if(this.#isDialogOpen || this.#shape.getState().selectedShape === SHAPES.TEXT) return;
    
    this.#actionContainer.classList.remove("pointer-none");
    this.#mouseButton = MOUSE_BUTTON.NONE;

    this.#body.style.cursor = "crosshair";

    if (!this.#isDrawing) return;
  
    this.#emitCurrentState();
  
    this.#isDrawing = false;
  };

  #emitCurrentState = () =>{
    const state = this.#getCurrentState();
    
    state.roomId = this.#roomId;
    state.userId = this.#userId;
    this.#clearCurrentState();

    this.#roomState.users?.get(this.#userId)?.stack.push(state);

    this.#socket.emit(SOCKET_ACTION.UPDATE_ROOM_STATE, state);
  }

  #redrawCanvas() {
    this.#canvas.width = document.body.clientWidth;
    this.#canvas.height = document.body.clientHeight;
    this.#clear();
    

    this.#roomState.users?.forEach((userState) => {
      userState.stack.state().forEach((state) => {
        if (state.type === SHAPES.RECTANGLE) {
          const rectangle = new Rectangle(this.#tool, {});
          rectangle.draw(state);
        } else if (state.type === SHAPES.CIRCLE) {
          const circle = new Circle(this.#tool, {});
          circle.draw(state);
        } else if (state.type === SHAPES.LINE) {
          const line = new Line(this.#tool, {});
          line.draw(state);
        } else if (state.type === SHAPES.ARROW) {
          const arrow = new Arrow(this.#tool, {});
          arrow.draw(state);
        } else if (state.type === SHAPES.RHOMBUS) {
          const rhombus = new Rhombus(this.#tool, {});
          rhombus.draw(state);
        } else if (state.type === SHAPES.TRIANGLE) {
          const triangle = new Triangle(this.#tool, {});
          triangle.draw(state);
        } else if (state.type === SHAPES.STAR) {
          const star = new Star(this.#tool, {});
          star.draw(state);
        } else if (state.type === SHAPES.TEXT) {
          const text = new Text(this.#tool, {});
          text.draw(state);
        } else if (state.type === SHAPES.FREEHAND) {
          const freehand = new Freehand(this.#tool, {});
          freehand.drawPoints({...state, offsetX: this.#offsetX, offsetY: this.#offsetY});
        }
      });
    });
  }

  #clear = () => {
    this.#isDrawingCleared = true;
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
  shape,
  zoom,
});
const actions = new Actions({ pencil, shape, eraser, canvas });
