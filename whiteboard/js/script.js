const createBtn = document.getElementById("create-btn");
const joinBtn = document.getElementById("join-btn");
const roomName = document.getElementById("roomName");
const roomId = document.getElementById("roomId");
const toastContainer = document.getElementById("toast-container");

function showToast(title, message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `${title}</br>${message}`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, 5000);
}

createBtn.addEventListener("click", () => {
  const name = roomName.value.trim();

  if (!name) {
    showToast(
      "Room name required",
      "Please enter a room name to create",
      "error"
    );
    return;
  }

  try {
    const res = fetch("/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    if (res.status === 201) {
      showToast("Room created successfully", "You can now join the room");
    } else {
      showToast(
        "Something went wrong",
        "Please try again later or contact support",
        "error"
      );
    }
  } catch (e) {
    showToast(
      "Unable to connect to the server",
      "Check your internet connection and try again",
      "error"
    );
    return;
  }
});

joinBtn.addEventListener("click", () => {
  let id = roomId.value.trim();

  try {
    const url = new URL(id);
    id = url.pathname.split("/").pop();
  } catch (e) {
    showToast(
      "Invalid Room ID or connection link",
      "Please enter a valid link",
      "error"
    );
  }

  if (!id) {
    showToast(
      "Room ID or connection link required",
      "Please enter a valid Room ID or connection link to create",
      "error"
    );
    return;
  }
});
