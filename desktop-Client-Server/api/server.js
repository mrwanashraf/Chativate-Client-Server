var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var privateKey = fs.readFileSync('../sslcert/key.pem', 'utf8');
var certificate = fs.readFileSync('../sslcert/cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var app2 = express();
var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var jwtKey = fs.readFileSync('../jwtKey/jwtKey.pem');

//require('events').EventEmitter.defaultMaxListeners = Infinity;

var httpsServer = https.createServer(credentials, app).listen(8443, function() {


    console.log("I'm listening on port 8443, https://127.0.0.1:8443/");


});


var dbConnection = require('./dbConnection');
var User = require('./db'); // model

var functions = require('./functions'); // require functions from another file.

var io = require('socket.io')(httpsServer);

//mongoose.connect(dbConnection.database); // db connection.


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/signup', function(req,res) {

    var username = req.body.username;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;

    if ( password.value === confirmPassword.value ) {


          functions.signUp(username,password);
          res.status(200).end();

    }


});

app.get('/signup', function(req, res) {

        var u = req.query.u;

        functions.signUpUserCheck(u,res);

});

app.post('/signin', function(req,res) {

        var username = req.body.username;
        var password = req.body.password;

        console.log(username);
        console.log(password);
        console.log();

        functions.signIn(username,password,res);




});

app.get('/signin', function(req, res) {


          var u = req.query.u;

          functions.signInUserCheck(u,res);

});

app.post('/auth', function(req,res) {


  var username = req.body.username;
  var password = req.body.password;

  console.log(username);
  console.log(password);
  console.log();


  functions.authCheck(username,password,jwt,res);

});


app.get('/me', function(req, res) {

    var token = req.query.token;

    console.log();
    console.log(`me > ${token}`);


    functions.validateToken(token,jwt,jwtKey,res);


});

app.get('/info', function(req, res) {


        var token = req.query.token;

        console.log();
        console.log(`me > ${token}`);


        functions.validateToken(token,jwt,jwtKey,res);

});

app.post('/info', function(req,res) {


    var realname = req.body.realname;
    var nickname = req.body.nickname;
    var gender = req.body.gender;
    var age = req.body.age;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;

    var token = req.body.token;

    console.log(`realname > ${realname}`);
    console.log(`nickname > ${nickname}`);
    console.log(`gender > ${gender}`);
    console.log(`age > ${age}`);
    console.log(`password > ${password}`);
    console.log(`confirmPassword > ${confirmPassword}`);
    console.log(`token > ${token}`);

    if ( password === confirmPassword ) {


        functions.updateData(token,jwtKey,res,realname,nickname,gender,age,password);


    }


});

app.get('/addFriend', function(req,res) {

        var token = req.query.token;

        console.log();
        console.log(`me > ${token}`);


        functions.validateToken(token,jwt,jwtKey,res);


});


app.post('/searchFriend', function(req,res) {

      var token = req.body.token;
      var username = req.body.username;

      console.log(`req.body.username = ${username}`);

      functions.searchFriend(token,username,jwtKey,res);


});

app.post('/addFriend', function(req,res) {

        var requestedTo = req.body.requestedTo;
        var token = req.body.token;

        console.log(`requestedTo = ${requestedTo}`);

        functions.sendFriendRequest(token,jwtKey,requestedTo,res);

        res.status(200).end();

                    /*
                    User.find({"user.name": "username2"}, function(err, db) {


                          if ( err ) return console.error(err);

                          console.log(db[0].user.friendRequest);
                          var del = db[0].user.friendRequest[1];
                          console.log(del);




                          // var index = db[0].user.friendRequest[1].indexOf("username3");

                          // console.log(`index of username is > ${index}`);


                          var update = { $pull: {


                                          "user.friendRequest": [{


                                              name: "username"

                                          }]


                              }

                          };

                          db.users.update({"user.name": "username5"},{$pull:{"user.friendRequest":[{name: "username4"}]})

                          User.update({"user.name": "username2"}, update, function(err) {

                                  if (err) return console.error(err);

                                  console.log("data successfully removed!");


                          });


                  });

                  */

});

app.get('/friendRequest', function(req,res) {

        var token = req.query.token;

        console.log();
        console.log(`me > ${token}`);


        functions.validateToken(token,jwt,jwtKey,res);


});

app.post('/friendRequest', function(req,res) {

        var token = req.body.token;

        functions.friendRequestList(token,jwtKey,res);


});

app.post('/acceptRequest', function(req,res) {

        var token = req.body.token;
        var username = req.body.username;

        var verified = jwt.verify(token, jwtKey, function(err, decoded) {

              console.log(`decoded > ${decoded}`);

              var index = decoded.indexOf(".");
              var splittedHeader = decoded.substr(0, index);
              var splittedPayload = decoded.substr(index + 1 );

              console.log(`splittedHeader > ${splittedHeader}`);
              console.log(`splittedPayload > ${splittedPayload}`);

              var decodedHeader = new Buffer(splittedHeader, 'base64').toString('utf8');
              var decodedPayload = new Buffer(splittedPayload, 'base64').toString('utf8');

              var parsedPayload = JSON.parse(decodedPayload);

              console.log(`ACCEPTED! ${username} is removed from friendRequest and added to ${parsedPayload.name} friendlist.`);

              User.find({"user.name": parsedPayload.name}, function(err, db) {


                    if ( err ) return console.error(err);

                    console.log(db);




                    var update = { $pull: {


                                                  "user.friendRequest": [{

                                                        name: username

                                                  }]


                              }
                        };



                    User.update({"user.name": parsedPayload.name}, update, function(err) {

                            if (err) return console.error(err);

                            console.log("data successfully updated!");
                            res.status(200).end();


                    });




              });

              User.find({"user.name": parsedPayload.name}, function(err, db) {


                    if ( err ) return console.error(err);

                    console.log(db);




                    var update = { $push: {


                                                  "user.friendList": [{

                                                        name: username

                                                  }]


                              }
                        };



                    User.update({"user.name": parsedPayload.name}, update, function(err) {

                            if (err) return console.error(err);

                            console.log("data successfully updated!");
                            res.status(200).end();


                    });




              });

              User.find({"user.name": username }, function(err, db) {


                    if ( err ) return console.error(err);

                    console.log(db);




                    var update = { $push: {


                                                  "user.friendList": [{

                                                        name: parsedPayload.name

                                                  }]


                              }
                        };



                    User.update({"user.name": username}, update, function(err) {

                            if (err) return console.error(err);

                            console.log("data successfully updated!");
                            res.status(200).end();


                    });




              });

          });

});

app.post('/refuseRequest', function(req,res) {

      var token = req.body.token;
      var username = req.body.username;

      var verified = jwt.verify(token, jwtKey, function(err, decoded) {

            console.log(`decoded > ${decoded}`);

            var index = decoded.indexOf(".");
            var splittedHeader = decoded.substr(0, index);
            var splittedPayload = decoded.substr(index + 1 );

            console.log(`splittedHeader > ${splittedHeader}`);
            console.log(`splittedPayload > ${splittedPayload}`);

            var decodedHeader = new Buffer(splittedHeader, 'base64').toString('utf8');
            var decodedPayload = new Buffer(splittedPayload, 'base64').toString('utf8');

            var parsedPayload = JSON.parse(decodedPayload);

            console.log(`REFUSED! ${username} is removed from friendRequest.`);

            User.find({"user.name": parsedPayload.name}, function(err, db) {


                  if ( err ) return console.error(err);

                  console.log(db);




                  var update = { $pull: {


                                                "user.friendRequest": [{

                                                      name: username

                                                }]


                            }
                      };



                  User.update({"user.name": parsedPayload.name}, update, function(err) {

                          if (err) return console.error(err);

                          console.log("data successfully updated!");
                          res.status(200).end();


                  });




            });

        });

});

app.get('/block', function(req,res) {

      var token = req.query.token;

      console.log();
      console.log(`me > ${token}`);


      functions.validateToken(token,jwt,jwtKey,res);

});

app.get('/deleteAccount', function(req,res) {


        var token = req.query.token;

        console.log();
        console.log(`me > ${token}`);


        functions.validateToken(token,jwt,jwtKey,res);


});

app.post('/friendList', function(req,res) {

                  var token = req.body.token;

                  var verified = jwt.verify(token, jwtKey, function(err, decoded) {

                        console.log(`decoded > ${decoded}`);

                        var index = decoded.indexOf(".");
                        var splittedHeader = decoded.substr(0, index);
                        var splittedPayload = decoded.substr(index + 1 );

                        console.log(`splittedHeader > ${splittedHeader}`);
                        console.log(`splittedPayload > ${splittedPayload}`);

                        var decodedHeader = new Buffer(splittedHeader, 'base64').toString('utf8');
                        var decodedPayload = new Buffer(splittedPayload, 'base64').toString('utf8');

                        var parsedPayload = JSON.parse(decodedPayload);



                        User.find({"user.name": parsedPayload.name}, function(err, db) {


                              if ( err ) return console.error(err);

                              console.log(db);



                              var stringify = JSON.stringify(db[0].user.friendList);
                              var parse = JSON.parse(stringify);

                              var array = [];

                              for ( i = 0; i < parse.length; i++ ) {

                                    array.push(parse[i][0].name);

                              }

                              console.log(`array > ${array}`);

                              res.status(200).send(array);




                        });

                    });

});

app.post('/remove', function(req,res) {

      console.log("");
      console.log("remove");
      var token = req.body.token;
      var username = req.body.username;
      console.log(token);
      console.log(username);
      console.log("");

      var verified = jwt.verify(token, jwtKey, function(err, decoded) {

            console.log(`decoded > ${decoded}`);

            var index = decoded.indexOf(".");
            var splittedHeader = decoded.substr(0, index);
            var splittedPayload = decoded.substr(index + 1 );

            console.log(`splittedHeader > ${splittedHeader}`);
            console.log(`splittedPayload > ${splittedPayload}`);

            var decodedHeader = new Buffer(splittedHeader, 'base64').toString('utf8');
            var decodedPayload = new Buffer(splittedPayload, 'base64').toString('utf8');

            var parsedPayload = JSON.parse(decodedPayload);

            console.log(`REFUSED! ${username} is removed from friendRequest.`);

            User.find({"user.name": parsedPayload.name}, function(err, db) {


                  if ( err ) return console.error(err);

                  console.log(db);




                  var update = { $pull: {


                                                "user.friendList": [{

                                                      name: username

                                                }]


                            }
                      };



                  User.update({"user.name": parsedPayload.name}, update, function(err) {

                          if (err) return console.error(err);

                          console.log("data successfully updated!");
                          //res.status(200).end();


                  });

         });

         User.find({"user.name": username}, function(err, db) {


               if ( err ) return console.error(err);

               console.log(db);




               var update = { $pull: {


                                             "user.friendList": [{

                                                   name: parsedPayload.name

                                             }]


                         }
                   };



               User.update({"user.name": username}, update, function(err) {

                       if (err) return console.error(err);

                       console.log("data successfully updated!");
                       res.status(200).end();


               });

      });


    });

});

app.post('/block', function(req,res) {

      console.log("");
      console.log("block");
      var token = req.body.token;
      var username = req.body.username;
      console.log(token);
      console.log(username);
      console.log("");

      var verified = jwt.verify(token, jwtKey, function(err, decoded) {

            console.log(`decoded > ${decoded}`);

            var index = decoded.indexOf(".");
            var splittedHeader = decoded.substr(0, index);
            var splittedPayload = decoded.substr(index + 1 );

            console.log(`splittedHeader > ${splittedHeader}`);
            console.log(`splittedPayload > ${splittedPayload}`);

            var decodedHeader = new Buffer(splittedHeader, 'base64').toString('utf8');
            var decodedPayload = new Buffer(splittedPayload, 'base64').toString('utf8');

            var parsedPayload = JSON.parse(decodedPayload);

            console.log(`REFUSED! ${username} is removed from friendRequest.`);

            User.find({"user.name": parsedPayload.name}, function(err, db) {


                        if ( err ) return console.error(err);

                        console.log(db);




                        var update = { $pull: {


                                                      "user.friendList": [{

                                                            name: username

                                                      }]


                                  }
                            };



                        User.update({"user.name": parsedPayload.name}, update, function(err) {

                                if (err) return console.error(err);

                                console.log("data successfully updated!");
                                //res.status(200).end();


                        });

               });

               User.find({"user.name": username}, function(err, db) {


                     if ( err ) return console.error(err);

                     console.log(db);




                     var update = { $pull: {


                                                   "user.friendList": [{

                                                         name: parsedPayload.name

                                                   }]


                               }
                         };



                     User.update({"user.name": username}, update, function(err) {

                             if (err) return console.error(err);

                             console.log("data successfully updated!");
                             //res.status(200).end();


                     });

            });

            User.find({"user.name": parsedPayload.name}, function(err, db) {


                  if ( err ) return console.error(err);

                  console.log(db);




                  var update = { $push: {


                                                "user.blocked": [{

                                                      name: username

                                                }]


                            }
                      };



                  User.update({"user.name": parsedPayload.name}, update, function(err) {

                          if (err) return console.error(err);

                          console.log("data successfully updated!");
                          res.status(200).end();


                  });

         });

      });
});

app.post('/blocklist', function(req,res) {

        var token = req.body.token;
        var username = req.body.username;

        var verified = jwt.verify(token, jwtKey, function(err, decoded) {

              console.log(`decoded > ${decoded}`);

              var index = decoded.indexOf(".");
              var splittedHeader = decoded.substr(0, index);
              var splittedPayload = decoded.substr(index + 1 );

              console.log(`splittedHeader > ${splittedHeader}`);
              console.log(`splittedPayload > ${splittedPayload}`);

              var decodedHeader = new Buffer(splittedHeader, 'base64').toString('utf8');
              var decodedPayload = new Buffer(splittedPayload, 'base64').toString('utf8');

              var parsedPayload = JSON.parse(decodedPayload);




              User.find({"user.name": parsedPayload.name}, function(err, db) {

                        var stringify = JSON.stringify(db[0].user.blocked);
                        var parse = JSON.parse(stringify);

                        var array = [];

                        for ( i = 0; i < parse.length; i++ ) {

                              array.push(parse[i][0].name);

                        }

                        console.log(`array > ${array}`);

                        res.status(200).send(array);

              });



        });


});

app.post('/unblock', function(req,res) {

        var token = req.body.token;
        var username = req.body.username;

        var verified = jwt.verify(token, jwtKey, function(err, decoded) {

              console.log(`decoded > ${decoded}`);

              var index = decoded.indexOf(".");
              var splittedHeader = decoded.substr(0, index);
              var splittedPayload = decoded.substr(index + 1 );

              console.log(`splittedHeader > ${splittedHeader}`);
              console.log(`splittedPayload > ${splittedPayload}`);

              var decodedHeader = new Buffer(splittedHeader, 'base64').toString('utf8');
              var decodedPayload = new Buffer(splittedPayload, 'base64').toString('utf8');

              var parsedPayload = JSON.parse(decodedPayload);





              User.find({"user.name": parsedPayload.name}, function(err, db) {


                    if ( err ) return console.error(err);

                    console.log(db);




                    var update = { $pull: {


                                                  "user.blocked": [{

                                                        name: username

                                                  }]


                              }
                        };



                    User.update({"user.name": parsedPayload.name}, update, function(err) {

                            if (err) return console.error(err);

                            console.log("data successfully updated!");
                            res.status(200).end();


                    });


        });
    });

});



app.post('/delete', function(req,res) {

          var token = req.body.token;

          var verified = jwt.verify(token, jwtKey, function(err, decoded) {

                console.log(`decoded > ${decoded}`);

                var index = decoded.indexOf(".");
                var splittedHeader = decoded.substr(0, index);
                var splittedPayload = decoded.substr(index + 1 );

                console.log(`splittedHeader > ${splittedHeader}`);
                console.log(`splittedPayload > ${splittedPayload}`);

                var decodedHeader = new Buffer(splittedHeader, 'base64').toString('utf8');
                var decodedPayload = new Buffer(splittedPayload, 'base64').toString('utf8');

                var parsedPayload = JSON.parse(decodedPayload);





                User.remove({"user.name": parsedPayload.name}, function(err) {

                            if (err) return console.error(err);
                            res.status(200).end();


                });
      });

});

app.post('/test', function(req,res) {

        msg = req.body.msg;

        console.log(msg);

});

io.on('connection', function(socket) {


      socket.on("join", function(data) {




          if (  data.sender.length > 0 ) {

                var verified = jwt.verify(data.sender, jwtKey, function(err, decoded) {

                      console.log(`decoded > ${decoded}`);

                      var index = decoded.indexOf(".");
                      var splittedHeader = decoded.substr(0, index);
                      var splittedPayload = decoded.substr(index + 1 );

                      console.log(`splittedHeader > ${splittedHeader}`);
                      console.log(`splittedPayload > ${splittedPayload}`);

                      var decodedHeader = new Buffer(splittedHeader, 'base64').toString('utf8');
                      var decodedPayload = new Buffer(splittedPayload, 'base64').toString('utf8');

                      var parsedPayload = JSON.parse(decodedPayload);




                      console.log(`parsedPayload.name ${parsedPayload.name}`);

                      socket.join(parsedPayload.name);


                      socket.emit("me", {'me': parsedPayload.name});

                      socket.on("private", function(data) {

                            var msg = data.msg;
                            socket.in(data.sendingTo).emit("msged", {msg: data.msg, sender: data.sender});
                            socket.emit("msgedBy", {msg: data.msg, sender: data.sender});


                      });

                });




          }




      });





});


app2.listen(3000, function() {

    console.log("I'm listening on port 3000, http://127.0.0.1:3000/");


});
