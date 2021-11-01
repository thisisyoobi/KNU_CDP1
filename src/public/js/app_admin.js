// const myStream = document.getElementById("myStream");
// const Big = document.querySelector("MainView");
// const ul = myStream.querySelector("ul");
const myFace = document.getElementById("myFace");
let sendPC;
let receivePCs = {};
let users=[];



const pc_config = {
    "iceServers" : [
        {
            urls: ['stun:59.7.208.141:3478'
        ]

        }
    ]
}

let newSocket = io();
let localStream;
let lengthOfUsers;

function makeIl(mediastream, socketID) {
    console.log("Creating video : " + socketID);
    console.log(mediastream);
    let video = document.createElement("video");
    video.width = "100";
    video.height = "100";
    video.autoplay = true;
    video.playsInline = true;
    video.srcObject = mediastream;
    video.play = true;
    myFace.srcObject = mediastream;
    // let innerul = document.createElement("ul");
    // let innerdiv = document.createElement("div");
    // innerdiv.innerHTML = video;
    // Big.innerHTML = innerdiv;
    // //innerul.appendChild(video);
    // innerdiv.appendChild(video);
    // let h1 = document.createElement("h3");
    // h1.textContent = socketID;
    // innerdiv.appendChild(h1);
    /*
    innerul.appendChild(h1);
    ul.appendChild(innerul);
    */
}

const gdmOptions = {
    video: true,
    audio: false
  }

async function getScreenMedia(displayMediaOptions){


    try {
        localStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch(err){
        console.error("Error: " + err);
    }
    sendPC = createSenderPeerConnection(newSocket, localStream);
    createSenderOffer(newSocket);
    console.log(newSocket.id);
    newSocket.emit('joinRoom', {
        id: newSocket.id,
        roomID: '1234'
    });
    //makeIl(localStream, newSocket.id);
}

getScreenMedia(gdmOptions);


async function getMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                width: 900,
                height: 900
            }
        });
        
    } catch(e) {
        console.log(e);
    }
    sendPC = createSenderPeerConnection(newSocket, localStream);
    //console.log(sendPC);
    createSenderOffer(newSocket); 
    console.log(newSocket.id);
    newSocket.emit('joinRoom', {
        id: newSocket.id,
        roomID: '1234'
    });
    makeIl(localStream, newSocket.id);
}

newSocket.on('userEnter', (data) => {
    console.log("user Enter " + data.id);
    console.log(users);
    lengthOfUsers = users.length;
    console.log(lengthOfUsers);
    createReceivePC(data.id, newSocket);
    
    console.log(users);
    // makeIl(users[0].stream);
});

newSocket.on('allUsers', (data) =>{
    //console.log("Get All Users");
    let len = data.users.length;
    for (let i = 0; i < len; i++) {
        createReceivePC(data.users[i].id, newSocket);
    }

    for(i = 0; i < users.length; i++) {
       // makeIl(users[i].stream);
    }
});

newSocket.on('userExit', (data) => {
    console.log("Delete " + data.id);
    receivePCs[data.id].close();
    delete receivePCs[data.id];
    users = users.filter(user => user.id !== data.id);
});

newSocket.on('getSenderAnswer', async(data) => {
    try {
        console.log('get sender answer');
        //console.log(data.sdp);
        await sendPC.setRemoteDescription(new RTCSessionDescription(data.sdp));
    } catch (error) {
        console.log(error);
    }
});

newSocket.on('getSenderCandidate', async(data) => {
    try {
        console.log('get sender candidate');
        if (!data.candidate) return ;
        sendPC.addIceCandidate(new RTCIceCandidate(data.candidate));
        console.log(sendPC);
        console.log('candidate add success');
    } catch (error) {
        console.log(error);
    }
})

newSocket.on('getReceiverAnswer', async (data) => {
    try {
        console.log("get" + data.id + "'s answer");
        let pc = receivePCs[data.id];
        await pc.setRemoteDescription(data.sdp);
        console.log("socketID (" + data.id + ")'s remote sdp success");
    }catch (error) {
        console.log(error);
    }
});


newSocket.on('getReceiverCandidate', async (data) => {
    try {
        console.log("getReceiverCandidate");
        let pc = receivePCs[data.id];
        if (!data.candidate) return;
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }catch(error){
        console.log(error);
    }
})
const isIncluded = (array, id) => {
    let len = array.length;
    for (let i = 0; i < len; i++){
        if (array[i].id === id ) return true;
    }
    return false;
}

const createReceiverPeerConnection = (socketID, newSocket) => {
    let pc = new RTCPeerConnection(pc_config);

    receivePCs = {...receivePCs, [socketID]: pc};

    pc.onicecandidate = (e) => {
        if(e.candidate) {
            console.log('receive pc onicecandidate');
            newSocket.emit('receiverCandidate', {
                candidate: e.candidate,
                receiverSocketID: newSocket.id,
                senderSocketID: socketID
            });
        }
    }


    pc.oniceconnectionstatechange = (e) => {
        //console.log(e);
    }

    pc.ontrack = (e) => {
        //console.log(e);
        console.log('ontrack success');
        if (users) {
            if( !isIncluded(users, socketID)) {
                users.push({
                    id: socketID,
                    stream: e.streams[0]
                });
            } else return ;
        } else {
            users = [{
                id: socketID,
                stream: e.streams[0]
            }];
        }
        //makeIl(e.streams[0], socketID);
        
        /*
        if (users) {
            if( !isIncluded(users, socketID)) {
                users.push({
                    id: socketID,
                    stream: e.streams[0]
                });
            } else {
                users = [{
                    id: socketID,
                    stream: e.streams[0]
                }];
            }
        }*/
    }
    
    return pc;
}

const createReceiverOffer = async(pc, newSocket, senderSocketID) => {
    try {
        let sdp = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        console.log('create receiver offer success');
        await pc.setLocalDescription(new RTCSessionDescription(sdp));

        newSocket.emit('receiverOffer', {
            sdp,
            receiverSocketID: newSocket.id,
            senderSocketID,
            roomID: '1234'
        });
    }catch (error) {
        console.log(error);
    }
}

const createReceivePC = (id, newSocket) => {
    try {
        console.log(`socketID(${id}) user entered`);
        let pc = createReceiverPeerConnection(id, newSocket);
        createReceiverOffer(pc, newSocket, id);
    } catch (error) {
        console.log(error);
    }
}

const createSenderOffer = async (newSocket) => {
    try {
        let sdp = await sendPC.createOffer({ offerToReceiveAudio: false, offerToReceiveVideo: false });
        console.log('create sender offer success');
        await sendPC.setLocalDescription(new RTCSessionDescription(sdp));

        newSocket.emit('senderOffer', {
            sdp,
            senderSocketID: newSocket.id,
            roomID: '1234'
        });
    } catch (error) {
        console.log(error);
    }
}

const createSenderPeerConnection = (newSocket, localStream) => {
    let pc = new RTCPeerConnection(pc_config);

    pc.onicecandidate = (e) => {
        if (e.candidate) {
            console.log('sender PC onicecandidate');
            newSocket.emit('senderCandidate', {
                candidate: e.candidate,
                senderSocketID: newSocket.id
            });
        }
    }

    pc.oniceconnectionstatechange = (e) => {
        //console.log(e);
    }

    if (localStream) {
        console.log('localstream add');
        localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
        });
    } else {
        console.log('no local stream');
    }
    
    return pc;
}
