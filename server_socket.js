var express = require("express");
var app = express();
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));

var fs = require("fs");

var server = require("http").Server(app);
var io = require("socket.io")(server);
app.io = io;
server.listen(3001); //  80 3000 443

const mongoose = require('mongoose');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

fs.readFile("./config.json", "utf8" ,function(err, data){
    if(err){
        console.log("Read file error!");
    }else{
        var objJson = JSON.parse(data);
        console.log(objJson.dbConnectionString);
        mongoose.connect(objJson.dbConnectionString)
        .then(()=>{
            console.log("Mongo has been connected successfully");
            //require("./routes/Homepage/socket")(app, objJson);
            require("./routes/Homepage/socketChat")(app, objJson);
            //require("./routes/Homepage/main")(app, objJson, isEmailValid);
        })
        .catch((e)=>{
            console.log(e);
            console.log("Mongo connected fail!");
        });
    } 
});

function isEmailValid(email) {
    var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

    if (!email)
        return false;

    if(email.length>254)
        return false;

    var valid = emailRegex.test(email);
    if(!valid)
        return false;

    // Further checking of some things regex can't handle
    var parts = email.split("@");
    if(parts[0].length>64)
        return false;

    var domainParts = parts[1].split(".");
    if(domainParts.some(function(part) { return part.length>63; }))
        return false;

    return true;
}

