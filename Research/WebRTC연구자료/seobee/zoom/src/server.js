import http from "http";
//import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
    socket.on("enter_room", (msg, done) => {
        console.log(msg);
        done();
    });
});


//const wss = new WebSocket.Server({ server });
// const sockets = [];
// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Anon";
//     console.log("Connected to Browser ✅");
//     socket.on("close", () => console.log("Disconnected from the Browser ❌"));
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg);
//         switch (message.type) {
//             case "new_message":
//                 sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`));
//             case "nickname":
//                 socket["nickname"] = message.payload;
//         }
//         //sockets.forEach((aSocket) => aSocket.send(message.toString('utf8')));
//     });
// });

const handleListen = () => console.log('Listenig on http://localhost:3000');
httpServer.listen(3000, handleListen);

//console.log("hello");

//app.listen(3000);