var User = require("../../models/User");
var Token = require("../../models/Token");
var Player = require("../../models/Player");

var cookieParser = require('cookie-parser');


var multer  = require('multer');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

module.exports = function(app, objJson, isEmailValid){

    app.use(cookieParser());

    app.get("/", function(req, res){
        res.render("demo");
    })

    app.post("/register", function(req, res){
        /*
            - For user to register account
            - Parameters: Email:String, Password:String
            - Return: {result:0/1, message:""}
        */
        if( !req.body.Email || !req.body.Password ){
            res.json({result:0, message:"Wrong parameters"});
        }else{
            // Check email template & Pw nho nhat 6 ki tu
            var email = req.body.Email.trim().toLowerCase();
            var password = req.body.Password;
            if(!isEmailValid(email)){
                res.json({result:0, message:"Wrong email template"});
            }else if(password.length<objJson.validateFormat.minPasswordLength){
                // Note: Check do phuc tap cua pw: Phai co NUMBER, phai co TEXT, phai co UPPERCASE, phai co ki tu la (@@#$%%^&&*((?><;'":/,")))
                res.json({result:0, message:"Wrong password's length"});
            }else{
                
                // Email khong dc trung
                User.findOne({Email:email}).then((data)=>{
                    if(data!=null){
                        res.json({result:0, message:"Email is not availble"});
                    }else{

                        // Bcryptjs Password
                        bcrypt.genSalt(10, function(err, salt) {
                            bcrypt.hash(password, salt, function(err, hash) {
                                if(err){
                                    res.json({result:0, message:"Password hash error"});
                                }else{

                                    // Save new user to database
                                    var newUser = new User({
                                        Email:  email,
                                        Password: hash,
                                        Avatar:"avatar.png",
                                        Active:true,
                                        RegisterDate:Date.now(),
                                        Socket:"",
                                        userType:0
                                    });
                                    
                                    newUser.save().then((data)=>{
                                        data.Password = null;
                                        res.json({result:1, message:"Registered is successfully.", user:data});
                                    })
                                    .catch((err)=>{
                                        console.log(err);
                                        res.json({result:0, message:"User saved error!"});
                                    });
                                }
                            });
                        });

                        
                    }
                }).catch((error)=>{
                    res.json({result:0, message:"Email is invalid"});
                });

            }

        }
    });

    app.post("/login", function(req, res){
        if(!req.body.Email || !req.body.Password){
            res.json({result:0, message:"Wrong parameters"});
        }else{
            var email = req.body.Email.trim().toLowerCase();
            var password = req.body.Password;
            User.findOne({Email:email})
            .then((user)=>{
                if(user!=null){
                    bcrypt.compare(password, user.Password, function(err, resB) {
                        if(err){    
                            res.json({result:0, message:"Password checking is invalid"});
                        }else{
                            console.log(resB);
                            if(resB===true){

                                user.Password = "Bạn thật là lịch sự và dễ thương";

                                jwt.sign({
                                    data: user
                                }, objJson.secretKey, { expiresIn: 60*60 }, function(errT, token){
                                    if(errT){
                                        res.json({result:0, message:"Token is invalid"});
                                    }else{

                                        var newToken = new Token({
                                            Email:  email,
                                            Token:token,
                                            Status:true,
                                            RegisterDate:Date.now(),
                                            userType:user.userType
                                        });
                                        newToken.save().then(()=>{
                                            res.json({result:1, message:"Login is successfully.", token:token});
                                        }).catch(()=>{
                                            res.json({result:0, message:"Token is saved failed."});
                                        });
                                        
                                    }
                                });

                                
                                
                            }else{
                                res.json({result:0, message:"Wrong password."});
                            }
                        }   
                    });

                    

                }else{
                    res.json({result:0, message:"Email is not registered."});
                }
            })
            .catch((e)=>{
                res.json({result:0, message:"Found user is invalid"});
            });
        }
    });

    app.post("/verify", function(req, res){
        if(!req.body.Token){
            res.json({result:0, message:"Wrong parameters"});
        }else{
            var token = req.body.Token;
            Token.findOne({Token:token, Status:true}).then((t)=>{
                if(t==null){
                    res.json({result:0, message:"Token has been exprired"});
                }else{
                    // verify token
                    jwt.verify(token, objJson.secretKey, function(err, decoded) {
                        if (err) {
                            res.json({result:0, message:"Token has been verified invalid"});
                        }else{
                            res.json({result:1, message:"Token is okay", data:decoded});
                        }
                    });
                }
            })
            .catch((e)=>{
                res.json({result:0, message:"Invalid token"});
            });
        }
    });

    app.post("/logout", function(req, res){
        if(!req.body.Token){
            res.json({result:0, message:"Wrong parameters"});
        }else{
            var token = req.body.Token;
            Token.findOne({Token:token, Status:true}).then((t)=>{
                if(t==null){
                    res.json({result:0, message:"Token has been exprired"});
                }else{
                    // chnage token status
                    Token.findOneAndUpdate({Token:token}, {Status:false})
                    .then(()=>{
                        res.json({result:1, message:"Logout has been successfully."});
                    })
                    .catch((e)=>{
                        res.json({result:0, message:"Token destroy failed"});
                    });
                }
            })
            .catch((e)=>{
                res.json({result:0, message:"Invalid token"});
            });
        }
    });

    function checkLogined(req, res, next){
        if(!req.body.Token){
            res.json({result:0, message:"Wrong parameters"});
        }else{
            var token = req.body.Token;
            Token.findOne({Token:token, Status:true}).then((t)=>{
                if(t==null){
                    res.json({result:0, message:"Token has been exprired"});
                }else{
                    // verify token
                    jwt.verify(token, objJson.secretKey, function(err, decoded) {
                        if (err) {
                            res.json({result:0, message:"Token has been verified invalid"});
                        }else{
                            //res.json({result:1, message:"Token is okay", data:decoded});
                            next();
                        }
                    });
                }
            })
            .catch((e)=>{
                res.json({result:0, message:"Invalid token"});
            });
        }
    }

    function checkAdmin(req, res, next){ // web browser only
        if(!req.cookies.TOKEN){
            res.redirect("./login");
            //res.json({result:0, message:"Wrong parameters"});
        }else{
            var token = req.cookies.TOKEN;
            Token.findOne({Token:token, Status:true}).then((t)=>{
                if(t==null){
                    res.redirect("./login");
                    //res.json({result:0, message:"Token has been exprired"});
                }else{
                    // verify token
                    jwt.verify(token, objJson.secretKey, function(err, decoded) {
                        if (err) {
                            res.redirect("./login");
                            //res.json({result:0, message:"Token has been verified invalid"});
                        }else{
                            //res.json({result:1, message:"Token is okay", data:decoded});
                            console.log(decoded.data);
                            if(decoded.data.userType==1){
                                next();
                            }else{
                                res.redirect("./login");
                                //res.json({result:0, message:"You are not allowed."});
                            }
                        }
                    });
                }
            })
            .catch((e)=>{
                res.redirect("./login");
                //res.json({result:0, message:"Invalid token"});
            });
        }
    }

    // app.post("/check", checkAdmin, function(req, res){
    //     res.send("CHECK IS OKAY");
    // });
    
    // Upload file
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/upload')
        },
        filename: function (req, file, cb) {
            cb(null, Date.now()  + "-" + file.originalname)
        }
    });  
    var upload = multer({ 
        storage: storage,
        fileFilter: function (req, file, cb) {
            console.log(file);
            if( file.mimetype=="image/bmp" 
                || file.mimetype=="image/png"
                || file.mimetype=="image/gif"
                || file.mimetype=="image/jpg"
                || file.mimetype=="image/jpeg"
            ){
                cb(null, true)
            }else{
                return cb(new Error('Only image are allowed!'))
            }
        }
    }).single("avatar");

    app.post("/uploadFile",  function(req, res){

        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                res.json({result:0, message:"A Multer error occurred when uploading."});
            } else if (err) {
                res.json({result:0, message:"An unknown error occurred when uploading." + err});
            }else{
                console.log(req.file); 
                res.json({result:1, message:"Upload is okay", info:req.file});
            }
    
        });
    });

    app.get("/login", function(req, res){
        res.render("admin/login", {objJson:objJson});
    });
    // Admin : Players
    app.get("/admin", checkAdmin, function(req, res){
        res.render("admin/master", {page:"players"});
    });

    app.post("/player/addNew", function(req, re){
        if(!req.body.Name || !req.body.Point || !req.body.Avatar ){
            res.json({result:0, message:"Lack o f parameters"});
        }else{
            var newPlayer = new Player({
                Avatar:req.body.Avatar,
                Name:req.body.Name,
                Point:parseInt(req.body.Point),
                Active:true,
                RegisterDate:Date.now()
            });
            newPlayer.save()
            .then((data)=>{
                res.json({result:1, message:"Save user is successful"});
            })
            .catch((err)=>{
                res.json({result:0, message:"Save user error"});
            });
        }
    });

    // Admin : Matches
    app.get("/matches", checkAdmin, function(req, res){
        res.render("admin/master", {page:"matches"});
    });

}