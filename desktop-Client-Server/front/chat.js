var me = document.getElementById("me");
var friendList = document.getElementById("left-bottom");
var defaultChat = document.getElementById("middle-top");
var friendInfo = document.getElementById("right");
var textBox = document.getElementById("textBox");
var send = document.getElementById("send");
var form = document.getElementById("form");
var middle = document.getElementById("middle");

const {ipcRenderer} = require('electron');

var xhr = new XMLHttpRequest();



var chattingWith = null;
var meToken = null;

var connected = false;

form.style.display = "none";

form.addEventListener("submit", function(event) {

        event.preventDefault();

});

me.addEventListener("click", function() {


      ipcRenderer.send('queryToken', 'token?');
      ipcRenderer.on('queryTokenReply', (event, token) => {

        //console.log(token);

        xhr.open('GET', 'https://127.0.0.1:8443/me?token='+token);

        xhr.onload = function() {

            if ( xhr.status === 200 ) {

                  //console.log("200 OK");
                  window.location.href = "me.html";

            }

            else if ( xhr.status === 406 ) {

                  //console.log("406 NOT ACCEPTABLE");
                  window.location.href = "signin.html";

            }


        };


        xhr.send();




      });
});

window.addEventListener("load", function() {


            socket = io.connect("https://127.0.0.1:8443/", {secure: true});
            connected = true;

            ipcRenderer.send('queryToken', 'token?');
            ipcRenderer.on('queryTokenReply', (event, token) => {

              //console.log(token);

              xhr.open('POST', 'https://127.0.0.1:8443/friendList');
              xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
              xhr.onload = function() {

                  if ( xhr.status === 200 ) {

                        //console.log("200 OK");

                        var response = JSON.parse(xhr.response);


                        //console.log(response);



                        for ( var i = 0; i < response.length; i++ ) {



                              var username = response[i];

                              var result = `<p class="online-text"><img class="usericon" src="../media/online.png" draggable="false">${username}<canvas class="circle online"></canvas><p>`;

                              friendList.innerHTML  += result;

                        }


                        var p = friendList.getElementsByTagName("p");



                        for ( var j = 0; j < p.length; j++ ) {

                              (function(){

                                            var innerText = p[j].innerText;
                                            //console.log(innerText);
                                            var text = p[j].getElementsByClassName("online-text");
                                            var usericon = p[j].getElementsByClassName("usericon");
                                            var circleonline = p[j].getElementsByClassName("circle online");

                                            //console.log(text);
                                            //console.log(usericon);
                                            //console.log(circleonline);


                                            p[j].addEventListener("click", function() {



                                                    defaultChat.innerText = "";
                                                    form.style.display = "";
                                                    var content = `<img src="../media/user.png" draggable="false"><p>${innerText}</p><canvas class="circle selected"></canvas><div class="info"><p>name : N/A</p><p>gender : N/A</p><p>age : N/A</p></div><div class="removeblock"><input class="remove" type="image" src="../media/remove.png" draggable="false"><input class="block" type="image" src="../media/block.png" draggable="false"></div>`;
                                                    console.log(innerText);
                                                    friendInfo.innerHTML = content;

                                                    chattingWith = innerText;

                                                    console.log(friendInfo);



                                                    var remove = friendInfo.getElementsByClassName("remove");
                                                    var block = friendInfo.getElementsByClassName("block");

                                                    var info = friendInfo.getElementsByClassName("info");




                                                    for ( var h = 0; h < remove.length; h++ ) {

                                                          remove[h].addEventListener("click", function() {

                                                                console.log(`remove ${chattingWith}`);
                                                                xhr.open('POST', 'https://127.0.0.1:8443/remove');
                                                                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                                                                xhr.onload = function() {
                                                                      if ( xhr.status === 200 ) {

                                                                          window.location.reload(true);

                                                                      }
                                                                };
                                                                xhr.send(encodeURI(`token=${token}&username=${chattingWith}`));
                                                          });

                                                    }


                                                    for ( var f = 0; f < block.length; f++ ) {

                                                          block[f].addEventListener("click", function() {

                                                                console.log(`block ${chattingWith}`);
                                                                xhr.open('POST', 'https://127.0.0.1:8443/block');
                                                                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                                                                xhr.onload = function() {

                                                                      if ( xhr.status === 200 ) {

                                                                          window.location.reload(true);

                                                                      }

                                                                };
                                                                xhr.send(encodeURI(`token=${token}&username=${chattingWith}`));
                                                          });

                                                    }



                                                    var myself = null;




                                                    ipcRenderer.send('queryToken', 'token?');
                                                    ipcRenderer.on('queryTokenReply', (event, token) => {






                                                              socket.emit("join", {'sender': token});


                                                    });


                                                    socket.on("me", function(data) {

                                                            meToken = data.me;
                                                    });





                                                    socket.on("msged", function(data) {



                                                                  defaultChat.innerHTML += `<p class="userchat">${data.sender}: ${data.msg}</p>`;


                                                                defaultChat.scrollTop = defaultChat.scrollHeight; // to scroll down when the DOM is updated with text.




                                                    });


                                                    socket.on("msgedBy", function(data) {


                                                              defaultChat.innerHTML += `<p>${data.sender}: ${data.msg}</p>`;


                                                              defaultChat.scrollTop = defaultChat.scrollHeight; // to scroll down when the DOM is updated with text.


                                                    });

                                                    var clicked = 0;

                                                    send.addEventListener("click", function() {

                                                          clicked++;

                                                          socket.emit("private", {'msg': textBox.value, 'sendingTo': chattingWith, 'sender': meToken});
                                                          textBox.value = "";

                                                          if ( clicked > 1 ) {

                                                                window.location.reload(true);

                                                          };
                                                    });





                                            });



                              }());

                        }


                  }

                  else if ( xhr.status === 406 ) {

                        //console.log("406 NOT ACCEPTABLE");


                  }


              };


              xhr.send(encodeURI(`token=${token}`));




            });



});
