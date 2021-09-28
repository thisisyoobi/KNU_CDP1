const socket = io(); // automatically connect to server and look for server

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");


const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera =  myStream.getVideoTracks()[0];
        // console.log(currentCamera);
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if(currentCamera.label === camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        })
    } catch(e) {
        console.log(e);
    }
}

getCameras();

async function getMedia(deviceId){
    const initalConstraints = {
        audio: true,
        video: { facingMode: "user" }
    };
    const cameraConstraints = {
        audio: true,
        video: {deviceId: {exact: deviceId } }
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initalConstraints
        );
        myFace.srcObject = myStream;
        if (!deviceId) {
            await getCameras();
        }
        
    } catch(e){
        console.log(e);
    }
}

// getMedia();

function handleMuteBtnClick() {
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    if(!muted){
        muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}

function handleCameraBtnClick() {
    myStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

async function handleCameraChange() {
    await getMedia(camerasSelect.value);
    if(myPeerConnection){
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video"); // sender 다른데  보낸것 
        videoSender.replaceTrack(videoTrack);
    }

}

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

//WELCOM FORM
const welcome = document.getElementById("welcome");
welcomeForm = welcome.querySelector("form");

async function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// SOCKETCODE
// PEER A
socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    socket.emit("offer", offer, roomName);
});
socket.on("answer", answer => {
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);
});

// PEER B
socket.on("offer", async offer => {
    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer",answer, roomName);
    console.log("sent the answer");
});
// RTCCODE

socket.on("ice", ice => {
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
});

function handleIce(data){
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;

} 

function makeConnection(){
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun1.l.google.com:19302"
                ]
            }
        ]
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream.getTracks()
        .forEach(track => myPeerConnection
        .addTrack(track, myStream));
}

muteBtn.addEventListener("click", handleMuteBtnClick);
cameraBtn.addEventListener("click", handleCameraBtnClick);
camerasSelect.addEventListener("input", handleCameraChange);
// const welcome = document.getElementById("welcome");
// const form = welcome.querySelector("form");
// const room = document.getElementById("room");

// room.hidden = true;

// function addMessage(message){
//     const ul = room.querySelector("ul");
//     const li = document.createElement("li");
//     li.innerText = message;
//     ul.appendChild(li);
// };

// socket.on("welcome", (user, newCount) => {
//     const h3 = room.querySelector("h3");
//     h3.innerText = "Room : " + roomName + "("+newCount+")";
//     addMessage(user + " joined!");
// } );

// socket.on("bye", (left, newCount) => {
//     const h3 = room.querySelector("h3");
//     h3.innerText = "Room : " + roomName + "("+newCount+")";
//     addMessage(left + " left!");
// });

// socket.on("room_change", (rooms) => {
//     const roomList = welcome.querySelector("ul");
//     roomList.innerHTML = "";
//     rooms.forEach(room => {
//         const li = document.createElement("li");
//         li.innerText = room;
//         roomList.append(li);
//     });
// });


// function handleMessageSubmit(event) {
//     event.preventDefault();

//     const input = room.querySelector("#msg input");
//     const value = input.value;
//     socket.emit("new_message", input.value,roomName, () => {
//         addMessage("You : " + value);
//     });
//     input.value = "";
// }

// function handleNicknameSubmit(event){
//     event.preventDefault();
//     const input = room.querySelector("#name input");
//     socket.emit("nickname", input.value);
// }

// function showRoom(){
//     welcome.hidden = true;
//     room.hidden = false;
//     const h3 = room.querySelector("h3");
//     h3.innerText = "Room : " + roomName;
//     const msgform = room.querySelector("#msg");
//     const nameform = room.querySelector("#name");
//     msgform.addEventListener("submit", handleMessageSubmit);
//     nameform.addEventListener("submit", handleNicknameSubmit);
// }

// function handleRoomSubmit(event){
//     event.preventDefault();
//     const input = form.querySelector("input");
//     socket.emit("enter_room",input.value , showRoom);
//     // Socket IO를 사용하면 간단히 Object를 전송할 수 있다. 그리고 어떠한 우리가 만든 Event를 간단히 Emit하면 된다. 
//     // emit시에 함수, Object, 정수 등 string외에 다양한 형태들을 보낼 수 있다. 
//     roomName = input.value;
//     input.value = "";
// }

// socket.on("new_message", addMessage);

// form.addEventListener("submit", handleRoomSubmit);
// // concept of room 
// // 

