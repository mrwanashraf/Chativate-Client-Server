var info = document.getElementById("info");
var addFriend = document.getElementById("add");
var signOut = document.getElementById("signout");
var friendRequest = document.getElementById("friendRequest");
var block = document.getElementById("block");
var deleteAccount = document.getElementById("deleteAccount");

var xhr = new XMLHttpRequest();

const {ipcRenderer} = require('electron');


info.addEventListener("click", function() {



        ipcRenderer.send('queryToken', 'token?');
        ipcRenderer.on('queryTokenReply', (event, token) => {

          console.log(token);

          xhr.open('GET', 'https://127.0.0.1:8443/info?token='+token);

          xhr.onload = function() {

              if ( xhr.status === 200 ) {

                    console.log("200 OK");
                    window.location.href = "info.html";

              }

              else if ( xhr.status === 406 ) {

                    console.log("406 NOT ACCEPTABLE");
                    window.location.href = "signin.html";

              }


          };


          xhr.send();




        });



});


addFriend.addEventListener("click", function() {



          ipcRenderer.send('queryToken', 'token?');
          ipcRenderer.on('queryTokenReply', (event, token) => {

            console.log(token);

            xhr.open('GET', 'https://127.0.0.1:8443/info?token='+token);

            xhr.onload = function() {

                if ( xhr.status === 200 ) {

                      console.log("200 OK");
                      window.location.href = "friend.html";

                }

                else if ( xhr.status === 406 ) {

                      console.log("406 NOT ACCEPTABLE");
                      window.location.href = "signin.html";

                }


            };


            xhr.send();




          });


});

friendRequest.addEventListener("click", function() {



          ipcRenderer.send('queryToken', 'token?');
          ipcRenderer.on('queryTokenReply', (event, token) => {

            console.log(token);

            xhr.open('GET', 'https://127.0.0.1:8443/friendRequest?token='+token);

            xhr.onload = function() {

                if ( xhr.status === 200 ) {

                      console.log("200 OK");
                      window.location.href = "friendrequest.html";

                }

                else if ( xhr.status === 406 ) {

                      console.log("406 NOT ACCEPTABLE");
                      window.location.href = "signin.html";

                }


            };


            xhr.send();




          });


});

block.addEventListener("click", function() {



          ipcRenderer.send('queryToken', 'token?');
          ipcRenderer.on('queryTokenReply', (event, token) => {

            console.log(token);

            xhr.open('GET', 'https://127.0.0.1:8443/block?token='+token);

            xhr.onload = function() {

                if ( xhr.status === 200 ) {

                      console.log("200 OK");
                      window.location.href = "block.html";

                }

                else if ( xhr.status === 406 ) {

                      console.log("406 NOT ACCEPTABLE");
                      window.location.href = "signin.html";

                }


            };


            xhr.send();




          });


});

deleteAccount.addEventListener("click", function() {



          ipcRenderer.send('queryToken', 'token?');
          ipcRenderer.on('queryTokenReply', (event, token) => {

            console.log(token);

            xhr.open('GET', 'https://127.0.0.1:8443/deleteAccount?token='+token);

            xhr.onload = function() {

                if ( xhr.status === 200 ) {

                      console.log("200 OK");
                      window.location.href = "delete.html";

                }

                else if ( xhr.status === 406 ) {

                      console.log("406 NOT ACCEPTABLE");
                      window.location.href = "signin.html";

                }


            };


            xhr.send();




          });


});


signOut.addEventListener("click", function() {



        ipcRenderer.send('signout', 'signout');
        window.location.href = "signin.html";




});
