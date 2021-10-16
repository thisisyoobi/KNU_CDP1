const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
    console.log("New message: ", message.data);
});
// function 표현 가능
// function socketMessage(message) {
//     console.log("New message: ", message.data);
// }
// socket.addEventListener("message", socketMessage);

socket.addEventListener("close", () => {
    console.log("Disconnected to Server ❌");
})

// setTimeout(() => {
//     socket.send("hello from the browser!!");
// }, 10000);

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(input.value);
    input.value = "";
}
messageForm.addEventListener("submit", handleSubmit);