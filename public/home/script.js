const createBtn = document.getElementById("create-btn");
const joinBtn = document.getElementById("join-btn");
const roomName = document.getElementById("roomName");
const roomId = document.getElementById("roomId");
const roomOption = document.getElementById("roomOption");
const dropdown = document.querySelector(".dropdown");
console.log(dropdown);

const toastContainer = document.getElementById("toast-container");

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

roomOption.addEventListener("click", ()=>{
  dropdown.classList.toggle("show");
});

createBtn.addEventListener("click", async () => {
  const name = roomName.value.trim();
  if (!name) {
    showToast(
      "Room name required",
      "Please enter a room name to create",
      "error"
    );
    return;
  }

  if(name.trim().length > 15){
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
  } catch (e) {
    showToast(
      "Invalid Room ID or connection link",
      "Please enter a valid link",
      "error"
    );
    return;
  }

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
