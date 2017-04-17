var username = document.getElementById("username");
var password = document.getElementById("password");
var submit = document.getElementById("submit");

var userValid = false;
var passwordValid = false;

var xhr = new XMLHttpRequest();

const {ipcRenderer} = require('electron');


username.addEventListener("blur", function() {

      if ( username.value.length >= 3 ) {


                  xhr.open('GET', 'https://127.0.0.1:8443/signin?u='+username.value);

                  xhr.onload = function() {

                      if ( xhr.status === 200 ) {

                            username.style.borderColor = "#4cbbd6";
                            userValid = true;

                      }

                      else if ( xhr.status === 406 ){

                            username.style.borderColor = "#333333";
                            userValid = false;

                      }

                  };

                  xhr.send();



      }

});


password.addEventListener("blur", function() {

    if ( userValid === true && password.value.length >=3 ) {


                      xhr.open('POST', 'https://127.0.0.1:8443/signin');
                      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

                      xhr.onload = function() {


                            if ( xhr.status === 200 ) {

                                  password.style.borderColor = "#4cbbd6";
                                  passwordValid = true;
                                  submit.style.backgroundColor = "#4cbbd6";

                            }
                            else if ( xhr.status === 406 ) {

                                  password.style.borderColor = "#333333" ;
                                  passwordValid = false;
                                  submit.style.backgroundColor = "#333333";
                          }


                      };

                      xhr.send(encodeURI("username=" + username.value + "&" + "password=" + password.value));

    }


});

submit.style.backgroundColor = "rgba(51,51,51,0.1)";

submit.addEventListener("click", function() {


    if ( userValid === true && passwordValid === true ) {


      xhr.open('POST', 'https://127.0.0.1:8443/auth');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      xhr.onload = function() {


            if ( xhr.status === 200 ) {

                  console.log(xhr.response);

                  var parsedJSON = JSON.parse(xhr.response);
                  var token = parsedJSON.token;
                  console.log("Token > "+token);

                  /*ipcRenderer.send('asyc-msg', 'ping');

                  ipcRenderer.on('asyc-reply', (event, arg) => {

                        console.log(arg);

                  });*/

                  ipcRenderer.send('token', token);

                  window.location.href = "chat.html";


            }



      };

      xhr.send(encodeURI("username=" + username.value + "&" + "password=" + password.value));


    }

    else {


           event.preventDefault();


    }

});
