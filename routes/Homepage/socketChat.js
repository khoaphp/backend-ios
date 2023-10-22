
module.exports = function(app, objJson){

    var clients = [];
    app.io.on("connection", function(socket){
        
        socket.on("disconnect", function(){
            var found = getPosition(socket.id);
            console.log(found);
            if(found>-1){
                clients.splice(found, 1);
                console.log("Disconnect: " + socket.id);
            }
            
        });

        socket.on("joinChat", function(data){
            socket.nickName = data.nickname;
            clients.push({socketid:socket.id, nickname:socket.nickName});
            console.log(socket.id + " " + socket.nickName);
            app.io.sockets.emit("updateSocketsList", {sockets:clients});
        });

    });

    function getPosition(socketid){
        var found = -1;
        for (var k in clients){
            if (clients.hasOwnProperty(k)) {
                if(socketid==clients[k].socketid){
                    found = k;
                }
             }
        }
        return found;
    }

    app.get("/getAllCurrentSockets", function(req, res){
        getPosition("aaaaa");
        res.json({sockets:clients});
    });

    app.get("/chat", function(req, res){
        res.render("chat");
    });



}