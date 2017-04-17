var data = document.getElementById("data");

const {ipcRenderer} = require('electron');

var xhr = new XMLHttpRequest();


window.addEventListener("load", function() {


          ipcRenderer.send('queryToken', 'token?');
          ipcRenderer.on('queryTokenReply', (event, token) => {

            console.log(token);

            xhr.open('POST', 'https://127.0.0.1:8443/friendRequest');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onload = function() {

                if ( xhr.status === 200 ) {

                      console.log("200 OK");

                      var response = JSON.parse(xhr.response);


                      console.log(response);



                      for ( var i = 0; i < response.length; i++ ) {

                            console.log(response[i]);

                            var username = response[i];

                            var result = `<li><p class="text"><img class="usericon" src="../media/online.png" draggable="false">${username}<img class="accept" src="../media/accept.png" draggable="false"><img class="refuse" src="../media/refuse.png" draggable="false"><p></li>`;

                            data.innerHTML  += result;

                      }

                      var lis = data.getElementsByTagName("li");



                      for ( var j = 0; j < lis.length; j++ ) {

                            (function(){
                                          console.log(lis[j]);
                                          var innerText = lis[j].innerText;

                                          var accept = lis[j].getElementsByClassName("accept");
                                          var refuse = lis[j].getElementsByClassName("refuse");



                                          for ( var h = 0; h < accept.length; h++ ) {

                                                accept[h].addEventListener("click", function() {

                                                     console.log(`accept ${innerText}`);
                                                     xhr.open('POST', 'https://127.0.0.1:8443/acceptRequest');
                                                     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                                                     xhr.onload = function() {

                                                        if ( xhr.status === 200 ) {

                                                            window.location.reload(true);

                                                        }

                                                     };

                                                     xhr.send(encodeURI(`token=${token}&username=${innerText}`));

                                                });

                                          }

                                          for ( var k = 0; k < accept.length; k++ ) {

                                                refuse[k].addEventListener("click", function() {

                                                     console.log(`refuse ${innerText}`);

                                                     xhr.open('POST', 'https://127.0.0.1:8443/refuseRequest');
                                                     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                                                     xhr.onload = function() {

                                                           if ( xhr.status === 200 ) {

                                                               window.location.reload(true);

                                                           }

                                                     };
                                                     xhr.send(encodeURI(`token=${token}&username=${innerText}`));


                                                });

                                          }



                            }());

                      }


                }

                else if ( xhr.status === 406 ) {

                      console.log("406 NOT ACCEPTABLE");


                }


            };


            xhr.send(encodeURI(`token=${token}`));




          });


});
