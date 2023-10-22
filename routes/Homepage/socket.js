
module.exports = function(app, objJson){

    var arrSockets = [];
    
    app.io.on("connection", function(socket){
        
        console.log("New connection: " + socket.id);
        arrSockets.push(socket.id);

        socket.on("disconnect", function(){
            console.log("Disconnect: " + socket.id);
        });

        socket.on("client-wanna-join-room", function(data){
            socket.join(data.roomName);
        });

        socket.on("client-wanna-leave-room", function(data){
            socket.leave(data.roomName);
        });

        socket.on("client-send-inside-room-name", function(data){
            socket.to(data.roomName).emit("server-send-data", {mess:data.message, sender:data.socketid});
        });

        socket.on("client-is-chatting", function(data){
            console.log(data);
            // 1. Emit cho TAT CA CLIENTS (toan server)
            //app.io.sockets.emit("server-send-data", {mess:data.message, sender:data.socketid})
            
            // 2. Emit DUY NHAT cho nguoi dang gui tin hieu (Sender)
            //socket.emit("server-send-data", {mess:data.message, sender:data.socketid});
        
            // 3. Emit cho tat ca client trong ROOM (ngoai tru Sender)
            console.log(arrSockets);
            socket.to(arrSockets[1]).emit("server-send-data", {mess:data.message, sender:data.socketid});
        });

    });

    app.get("/check", function(req, res){
        const rooms = app.io.of("/").adapter.rooms;
        const sids = app.io.of("/").adapter.sids;
        console.log(rooms);
        console.log(sids);
        res.end();
    });

    app.get("/test", function(req, res){
        res.render("test");
    });

}