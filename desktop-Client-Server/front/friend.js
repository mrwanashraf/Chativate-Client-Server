var addFriendList = document.getElementById("stylist");
var searchBar = document.getElementById("search");

var xhr = new XMLHttpRequest();


const {ipcRenderer} = require('electron');


//addFriendList.style.display = "none";

var process = true;


searchBar.addEventListener("blur", function() {



            if ( searchBar.value.length >= 3 && searchBar.value.length <= 12 ) {


                      ipcRenderer.send('queryToken', 'token?');
                      ipcRenderer.on('queryTokenReply', (event, token) => {


                          if ( process === true ) {


                                      xhr.open('POST', 'https://127.0.0.1:8443/searchFriend');
                                      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                                      xhr.onload = function() {

                                              if ( xhr.status === 200 ) {


                                                  searchBar.style.borderColor = "#4cbbd6";

                                                  console.log(xhr.response);
                                                  var parsedJSON = JSON.parse(xhr.response);
                                                  var username = parsedJSON.searchResult;
                                                  console.log(username);

                                                  var result = `<ul><li><p><a href="#"><img class="users" src="../media/online.png" draggable="false"></a>${username}<a href="#"><img id="add" class="add" src="../media/add.png" draggable="false"></a><p></li>`;

                                                  addFriendList.innerHTML = result;

                                                  var add = document.getElementById("add");

                                                  add.addEventListener("click", function(e) {


                                                        ipcRenderer.send('queryToken', 'token?');
                                                        ipcRenderer.on('queryTokenReply', (event, token) => {

                                                            xhr.open('POST', 'https://127.0.0.1:8443/addFriend');
                                                            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

                                                            xhr.onload = function() {


                                                                    if ( xhr.status === 200 || xhr.status === 406 ) {



                                                                        window.location.reload(true);


                                                                    }


                                                            };

                                                            xhr.send(encodeURI(`requestedTo=${username}&token=${token}`));

                                                        });

                                                  });


                                              }

                                              else if ( xhr.status === 406 ) {

                                                  searchBar.style.borderColor = "#333333";
                                                  addFriendList.innerHTML = "";

                                              }
                                              else {

                                                   searchBar.style.borderColor = "";
                                                   addFriendList.innerHTML = "";
                                              }


                                    };
                                    xhr.send(encodeURI(`username=${searchBar.value}&token=${token}`));
                                    process = false;

                                    setTimeout(function() {

                                          process = true;

                                    } , 3000);


                          }

                    });

                    



            }




});
