
export const MOUSE_BUTTON = Object.freeze({
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2,
    NONE: 3
});

export const ACTIONS = Object.freeze({
    MENU: 'menu',
    PENCIL: "pencil",
    SHAPE: "shape",
    ERASER: "eraser",
    DOWNLOAD: "download",
    IMAGE: "image",
    NOTE: "note",
    UNDO: "undo",
    REDO: "redo",
    CLEAR: "clear"
});

export const SOCKET_ACTION = Object.freeze({
    JOIN_ROOM: "join-room",
    JOINED_USER_STATE: "joined-user-state",
    CANVAS_START: "canvas-start",
    CANVAS_UPDATE: "canvas-update",
    CANVAS_CLEAR: "canvas-clear",
    UNDO_OR_REDO: "undo-or-redo",
    GET_ROOM_STATE: "get-room-state",
    UPDATE_ROOM_STATE: "update-room-state",
})

export const SHAPES = Object.freeze({
    TEXT: 'text',
    RECTANGLE: "rectangle",
    CIRCLE: "circle",
    LINE: "line",
    ARROW: "arrow",
    RHOMBUS: "rhombus",
    TRIANGLE: "triangle",
    STAR: "star",
})
