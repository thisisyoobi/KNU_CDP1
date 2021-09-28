import { count } from "console";
import express from "express";
import http from "http";
import SocketIO from "socket.io"
import { getSystemErrorMap } from "util";
// import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views")
console.log("hello");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

// http 서버와 WebSorcket서버 같이 만들기
const server = http.createServer(app);
const io = SocketIO(server);
io.on("connection", socket =>{
    socket.on("join_room", (roomName) =>{
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer",offer);
    });

    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });

    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice",ice);
    });
});


// function publicRooms(){
//     const {
//         sockets: {
//             adapter: { sids, rooms },
//         },
//     } = io;
//     const publicRooms = [];
//     rooms.forEach((_, key) => {
//         if(sids.get(key) === undefined){
//             publicRooms.push(key);
//         }
//     });
//     return publicRooms;
// }

// function countRoom(roomName){
//     return io.sockets.adapter.rooms.get(roomName)?.size;
// }

// io.on("connection", socket => {
//     socket["nickname"] = "Anon";
//     socket.onAny((event) => {
//         console.log(io.sockets.adapter);
//         console.log("Socket Event: "+event);
//     });
//     // there is sockets in socket.
//     console.log(socket);
//     // 단 on과 emit에서의 event이름은 같아야 한다. 
//     // 만약 front-end에서 실행될 함수를 주고 받고 싶다면 무조건 마지막 인자로서 받아야 한다. 
//     socket.on("enter_room", (roomName, done) => {
//         console.log(socket.id);
//         console.log(socket.rooms);
//         socket.join(roomName);
//         io.sockets.emit("room_change",publicRooms());
//         console.log(socket.rooms);
//         done();
//         socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
//         // setTimeout( () => {
//         //     done("Hello from backend"); // front-end에서 함수를 실행시킨다. 
//         // }, 10000);
//     });
//     socket.on("disconnecting",() => {
//         socket.rooms.forEach(room => socket.to(room).emit("bye",socket.nickname, countRoom(room) - 1));
        
//     });

//     socket.on("disconnect", () => {
//         io.sockets.emit("room_change",publicRooms())
//     });

//     socket.on("new_message", (msg, room, done) => {
//         socket.to(room).emit("new_message", socket.nickname+": " + msg);
//         done();
//     });

//     socket.on("nickname", nickname => socket["nickname"] = nickname);
    
// });


// const wss = new WebSocket.Server({ server });

// WebSocket Using Codes Below 
// const sockets = [];

// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Anon";
//     console.log("Connected to Browser")
//     socket.on("close", () => console.log("Disconnected from browser"))
//     socket.on("message", (msg) => {
//         const parsed = JSON.parse(msg);
//         console.log(socket.nickname +": " + parsed.payload );
//         switch(parsed.type) {
//             case "new_message":
//                 sockets.forEach((aSocket) => aSocket.send(socket.nickname + ": " + parsed.payload));
//             case "nickname":
//                 socket["nickname"] = parsed.payload;
//         }
//     });
//     //socket.send("Hello!!!");
// } ); // on method는 정보를 제공해준다. 
// 

server.listen(3000);
