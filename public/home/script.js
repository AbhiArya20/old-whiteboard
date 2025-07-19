import { IndexedDB } from "../board/indexed-db.js";
const createBtn = document.getElementById("create-btn");
const joinBtn = document.getElementById("join-btn");
const joinRecent = document.getElementById("join-recent");
const roomName = document.getElementById("roomName");
const roomId = document.getElementById("roomId");
const roomOption = document.getElementById("roomOption");
const dropdown = document.querySelector(".dropdown");
const toastContainer = document.getElementById("toast-container");

const db = new IndexedDB("rooms", "recent-rooms");

try {
  await db.openDatabase();
} catch (err) {
  console.log(err);
}

function showToast(title, message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-title">${title}</span><span class="toast-message">${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, 5000);
}

let selectedRoom = "";
let isOpen = false;

roomOption.addEventListener("click", async () => {
  dropdown.classList.toggle("show");

  if (isOpen) {
    isOpen = false;
    return;
  }
  isOpen = true;

  dropdown.innerHTML = `<div id="loader">
  <div class="loading"></div>
  </div>`;

  const loader = document.getElementById("loader");

  loader.classList.add("show");

  try {
    const rooms = await db.getAllDataSorted();

    const res = await fetch(`/actives`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ savedRooms: rooms }),
    });

    if (!res.ok) {
      showToast(
        "Unable to fetch active rooms",
        "Please try again later",
        "error"
      );
      return;
    }

    const { actives } = await res.json();

    actives.forEach((room) => {
      const roomItem = document.createElement("div");
      roomItem.className = "dropdown-item";
      roomItem.setAttribute("room-id", room.id);
      roomItem.setAttribute("room-name", room.name);
      roomItem.innerHTML = room.name;
      dropdown.appendChild(roomItem);
    });

    if (actives.length === 0) {
      const roomItem = document.createElement("div");
      roomItem.className = "dropdown-item";
      roomItem.setAttribute("room-id", "none");
      roomItem.setAttribute("room-name", "No recent rooms");
      roomItem.innerHTML = "No recent rooms";
      dropdown.appendChild(roomItem);
    }

    for (const room of rooms) {
      if (!actives.find((activeRoom) => activeRoom.id === room.id)) {
        db.deleteData(room.id);
      }
    }
  } catch (e) {
    showToast(
      "Unable to fetch active rooms",
      "Please try again later",
      "error"
    );
  } finally {
    loader.classList.remove("show");
  }
});

dropdown.addEventListener("click", (event) => {
  if (event.target.attributes["room-id"].value === "none") return;
  roomOption.innerHTML = event.target.attributes["room-name"].value;
  selectedRoom = event.target.attributes["room-id"].value;
  dropdown.classList.remove("show");
});

joinRecent.addEventListener("click", () => {
  if (!selectedRoom) {
    showToast(
      "Room Selection Required",
      "You must select a room before proceeding. Please choose a room from the list.",
      "error"
    );
    return;
  }
  window.location.assign(`/${selectedRoom}`);
});

createBtn.addEventListener("click", async () => {
  const name = roomName.value.trim();
  if (!name.trim()) {
    showToast(
      "Room name required",
      "Please enter a room name to create",
      "error"
    );
    return;
  }

  if (name.trim().length > 15) {
    showToast(
      "Room name too long",
      "Please enter a room name that is less than 15 characters",
      "error"
    );
    return;
  }

  try {
    const res = await fetch("/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      showToast("Unable to create room", "Please try again later", "error");
    }

    const { id } = await res.json();
    window.location.assign(id);
  } catch (e) {
    console.log(e);
    showToast(
      "Unable to connect to the server",
      "Check your internet connection and try again",
      "error"
    );
  }
});

joinBtn.addEventListener("click", () => {
  let id = roomId.value.trim();
  try {
    const url = new URL(id);
    id = url.pathname.split("/").pop();
  } catch (e) {}

  if (!id) {
    showToast(
      "Room ID or connection link required",
      "Please enter a valid Room ID or connection link to create",
      "error"
    );
    return;
  }
  window.location.assign(id);
});
