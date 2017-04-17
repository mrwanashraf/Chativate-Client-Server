var fs = require('fs');
var mongoose = require('mongoose');
var crypto = require('crypto');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var dbConnection = require('./dbConnection');
var User = require('./db'); // model

var jwt = require('jsonwebtoken');
var jwtKey = fs.readFileSync('../jwtKey/jwtKey.pem');

require('events').EventEmitter.defaultMaxListeners = Infinity;

mongoose.connect(dbConnection.database); // db connection.


module.exports = {


    // salt hash the password with random salt and saving the data to the database.


    signUp: function(username,password) {

          var salt = crypto.randomBytes(256).toString('base64');
          var iteration = 10000;
          var hash = crypto.pbkdf2Sync(password, salt, iteration, 512, 'sha512').toString('base64');

          console.log(`your salt is > ${salt}`);
          console.log(`your salted hash is > ${hash}`);

          var userData = new User({

              user: {
                                name: username,
                                password: hash,
                                salt: salt
                    }
          });


          userData.save(function(err) {

                  if (err) {

                        console.log(err);

                  }

                  else {


                        console.log("data saved!");

                  }

          });

    },

    // checking if the user exists or not in sign up process.

    signUpUserCheck: function(username,res) {

            User.find({"user.name": username} ,function(err, db) {

                    if(err) return console.error(err);

                    // if user doesn't exist then you can register.

                    if ( db.length < 1 ) {
                        res.status(200).end();
                    }

                    // if user exists then you can't.

                    else if ( db.length > 0 ) {
                        res.status(406).end();
                    }

            });

    },


    signIn: function(username,password,res) {


              User.find({"user.name": username}, function(err, db){

                  if ( err ) return console.error(err);

                  // if not empty then the user exists.


                  console.log(db[0].user.salt);

                  var dbSalt = db[0].user.salt;

                  console.log("dbSalt >" + db[0].user.salt);

                  var iteration = 10000;
                  var userHash = crypto.pbkdf2Sync(password, dbSalt, iteration, 512, 'sha512').toString('base64');

                  if ( userHash === db[0].user.password ) {


                      console.log("equal!");
                      console.log(userHash);
                      console.log("is equal to");
                      console.log(db[0].user.password);
                      res.status(200).end();
                  }

                  else {


                      console.log("not equal!");
                      console.log(userHash);
                      console.log("is not equal to");
                      console.log(db[0].user.password);
                      res.status(406).end();

                  }



              });




    },

    signInUserCheck: function(username,res) {


              User.find({"user.name": username} ,function(err, db) {

                      if(err) return console.error(err);

                      // user doesn't exist you may want to register to login.

                      if ( db.length < 1 ) {
                          res.status(406).end();
                      }

                      // user exists now you can attempt to login.

                      else if ( db.length > 0 ) {
                          res.status(200).end();
                      }
              });


    },

    createJWT: function(username,jwt,res) {


              var header = {

                  "alg": "HS512",
                  "typ": "JWT"

              };

              var payload = {


                      "iss": "Chativate",
                      "name": username,
                      "iat": Math.floor(Date.now() / 1000), // date now.
                      "exp": Math.floor(Date.now() / 1000) + ( 60 * 60 ) // exp date after 1 hour.
              };

              var encodedHeader = new Buffer(JSON.stringify(header)).toString('base64');
              var encodedPayload = new Buffer(JSON.stringify(payload)).toString('base64');


              var claims = encodedHeader + "." + encodedPayload;

              console.log(`header > ${JSON.stringify(header)}`);
              console.log(`payload > ${JSON.stringify(payload)}`);
              console.log(`encodedHeader > ${encodedHeader}`);
              console.log(`encodedPayload > ${encodedPayload}`);
              console.log(`claims > ${claims}`);



              var token = jwt.sign(claims, jwtKey, { algorithm: 'HS512'}, function(err, token) {

                    console.log(`token > ${token}`);

                    res.status(200).json({"token": token}).end();



              });


    },

    authCheck: function(username,password,jwt, res) {



            User.find({"user.name": username}, function(err, db){

                      if ( err ) return console.error(err);

                      // if not empty then the user exists.


                      console.log(db[0].user.salt);

                      var dbSalt = db[0].user.salt;

                      console.log("dbSalt >" + db[0].user.salt);

                      var iteration = 10000;
                      var userHash = crypto.pbkdf2Sync(password, dbSalt, iteration, 512, 'sha512').toString('base64');

                      var userName = db[0].user.name;





                      if ( userHash === db[0].user.password ) {



                          module.exports.createJWT(userName,jwt,res);






                      }

                      else {


                          console.log("not equal!");
                          console.log(userHash);
                          console.log("is not equal to");
                          console.log(db[0].user.password);
                          res.status(406).end();

                      }



            });




    },


    validateToken: function(token,jwt,jwtKey,res) {



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

                console.log(`decodedHeader > ${decodedHeader}`);
                console.log(`decodedPayload > ${decodedPayload}`);
                console.log(`name > ${parsedPayload.name}`);
                console.log(`exp date > ${parsedPayload.exp}`);

                var dateNow = Math.floor(Date.now() / 1000);

                if ( parsedPayload.exp > dateNow ) {

                      console.log(`true because ${parsedPayload.exp} > ${dateNow} `);
                      console.log("not yet");
                      res.status(200).end();
                }
                else {

                      console.log(`false because ${dateNow} >  ${parsedPayload.exp}`);
                      console.log("too late");
                      res.status(406).end();
                }
          });




    },

    updateData: function(token,jwtKey,res,realname,nickname,gender,age,password) {


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

                        salt = db[0].user.salt;

                        var iteration = 10000;
                        var userHash = crypto.pbkdf2Sync(password, salt, iteration, 512, 'sha512').toString('base64');

                        var update = {

                                          user: {

                                                   realname: realname,
                                                   nickname: nickname,
                                                   gender: gender,
                                                   age: age,
                                                   password: userHash

                                         }


                        };

                        User.update({"user.name": parsedPayload.name},update, function(err) {

                              if ( err ) return console.error(err);

                              console.log("data successfully updated!");

                              res.status(200).end();
                        });


                  });



            });



    },

    search:  {


              friendRequestList: function(db,username) {


                                                         var stringifyFriendRequest = JSON.stringify(db[0].user.friendRequest);

                                                         if ( stringifyFriendRequest.length < 3 ) {

                                                              console.log("FriendRequest empty");
                                                              return true;

                                                         }

                                                         else {

                                                                   var parseFriendRequest = JSON.parse(stringifyFriendRequest);

                                                                   for ( var i = 0 ; i < parseFriendRequest.length; i++ ) {

                                                                           console.log(` ${i} > ${parseFriendRequest[i][0].name}`);

                                                                           var friendName = parseFriendRequest[i][0].name;
                                                                           if ( username === friendName ) {

                                                                                console.log(`username > ${username} === friendRequest.name > ${friendName}`);
                                                                                return false;



                                                                           }

                                                                           else if ( username !== friendName ) {

                                                                                console.log(`username > ${username} !== friendRequest.name > ${friendName}`);

                                                                                return true;
                                                                           }


                                                                   }



                                                         }


              },



              friendList: function(db,username) {

                                var stringifyFriendList = JSON.stringify(db[0].user.friendList);

                                if ( stringifyFriendList.length < 3 ) {

                                     console.log("FriendList empty");
                                     return true;

                                }

                                else {

                                          var parseFriendList = JSON.parse(stringifyFriendList);

                                          for ( var i = 0 ; i <  parseFriendList.length; i++ ) {

                                                  console.log(` ${i} > ${parseFriendList[i][0].name}`);

                                                  var friendName = parseFriendList[i][0].name;
                                                  if ( username === friendName ) {

                                                       console.log(`username > ${username} === friendRequest.name > ${friendName}`);
                                                       return false;



                                                  }

                                                  else if ( username !== friendName ) {

                                                       console.log(`username > ${username} !== friendRequest.name > ${friendName}`);

                                                       return true;
                                                  }


                                          }



                                }





              },



              blockList: function(db,username) {


                                                         var stringifyBlocked = JSON.stringify(db[0].user.blocked);

                                                         if ( stringifyBlocked.length < 3 ) {

                                                              console.log("Blocked empty");
                                                              return true;

                                                         }

                                                         else {


                                                                   var parseBlocked = JSON.parse(stringifyBlocked);

                                                                   for ( var i = 0 ; i < parseBlocked.length; i++ ) {

                                                                           console.log(` ${i} > ${parseBlocked[i][0].name}`);

                                                                           var friendName = parseBlocked[i][0].name;
                                                                           if ( username === friendName ) {

                                                                                console.log(`username > ${username} === friendRequest.name > ${friendName}`);
                                                                                return false;



                                                                           }

                                                                           else if ( username !== friendName ) {

                                                                                console.log(`username > ${username} !== friendRequest.name > ${friendName}`);

                                                                                return true;
                                                                           }


                                                                   }




                                                         }

              }






    },

    searchFriend: function(token,username,jwtKey,res) {




            var verified = jwt.verify(token, jwtKey, function(err, decoded) {

                  var index = decoded.indexOf(".");
                  var splittedHeader = decoded.substr(0, index);
                  var splittedPayload = decoded.substr(index + 1 );



                  var decodedHeader = new Buffer(splittedHeader, 'base64').toString('utf8');
                  var decodedPayload = new Buffer(splittedPayload, 'base64').toString('utf8');

                  var parsedPayload = JSON.parse(decodedPayload);


                  if ( parsedPayload.name === username || parsedPayload.name === undefined || parsedPayload.name === "" ) {


                          return res.status(406).end();


                  }

                  else if ( parsedPayload.name !== username ){



                          name = parsedPayload.name;

                          var ready1;
                          var ready2;


                          User.find({"user.name": username}, function(err, db) {


                                 if ( err ) return console.error(err);

                                 if ( db < 1 ||  db[0].user.name === undefined  ) {

                                      res.status(406).end();

                                 }

                                 else {

                                   User.find({"user.name": name}, function(err, db2) {


                                         if ( err ) return console.error(err);
                                        /*
                                        console.log(db2);

                                         console.log(db2[0].user.friendRequest);
                                         */

                                        var allowed1 = module.exports.search.friendRequestList(db2,username);
                                        var allowed2 = module.exports.search.friendList(db2,username);
                                        var allowed3 = module.exports.search.blockList(db2,username);

                                        if ( allowed1 === true && allowed2 === true && allowed3 === true  ) {

                                               ready1 = true;

                                        }
                                        else {

                                              ready1 = false;

                                        }

                                        console.log(`allowed1 > ${allowed1}`);
                                        console.log(`allowed2 > ${allowed2}`);
                                        console.log(`allowed3 > ${allowed3}`);
                                   });



                                   User.find({"user.name": username}, function(err, db3) {


                                         if ( err ) return console.error(err);
                                        /*
                                        console.log(db3);

                                         console.log(db3[0].user.friendRequest);
                                         */

                                         var allowed4 = module.exports.search.friendRequestList(db3,name);
                                         var allowed5 = module.exports.search.friendList(db3,name);
                                         var allowed6 = module.exports.search.blockList(db3,name);


                                         console.log(`allowed4 > ${allowed4}`);
                                         console.log(`allowed5 > ${allowed5}`);
                                         console.log(`allowed6 > ${allowed6}`);



                                         if ( allowed4 === true && allowed5 === true && allowed6 === true  ) {

                                                ready2 = true;

                                         }
                                         else {

                                                ready2 = false;

                                         }

                                         setTimeout(function() {


                                               if (  ready1 !== undefined && ready2 !== undefined ) {



                                                           if ( ready1 === true && ready2 === true )  {

                                                                    res.status(200).json({searchResult: db[0].user.name }).end();

                                                           }
                                                           else {


                                                                  res.status(406).end();

                                                           }

                                                     console.log(`ready1 > ${ready1}`);
                                                     console.log(`ready2 > ${ready2}`);



                                                }


                                         }, 250);


                                   });












                             }
                          });










                  }





            });




    },

    sendFriendRequest: function (token,jwtKey,requestedTo,res) {





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

                    var requesterName = parsedPayload.name;

                    console.log(`requesterName = ${requesterName}`);


                    User.find({"user.name": requestedTo}, function(err, db) {


                          if ( err ) return console.error(err);

                          console.log(db);

                          var allowed = module.exports.search.friendRequestList(db,requesterName);

                          setTimeout(function() {

                                      if ( allowed === true ) {

                                                      var update = { $push: {


                                                                                    "user.friendRequest": [{

                                                                                          name: requesterName

                                                                                    }]


                                                                }
                                                          };



                                                      User.update({"user.name": requestedTo}, update, function(err) {

                                                              if (err) return console.error(err);

                                                              console.log("data successfully updated!");
                                                              res.status(200).end();


                                                      });

                                      }
                                      else {

                                                  res.status(406).end();

                                      }


                        }, 125);


                    });







            });








    },

    friendRequestList: function(token,jwtKey,res) {


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

                                    var stringify = JSON.stringify(db[0].user.friendRequest);
                                    var parse = JSON.parse(stringify);

                                    var array = [];

                                    for ( i = 0; i < parse.length; i++ ) {

                                          array.push(parse[i][0].name);

                                    }

                                    console.log(`array > ${array}`);

                                    res.status(200).send(array);

                          });



                    });


    }






};
