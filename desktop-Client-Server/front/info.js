var realname = document.getElementById("realname");
var nickname = document.getElementById("nickname");
var gender = document.getElementById("gender");
var age = document.getElementById("age");
var password = document.getElementById("password");
var confirmPassword = document.getElementById("confirmPassword");

var save = document.getElementById("save");
var form = document.getElementById("form");

var one = false;
var two = false;
var three = false;
var four = false;
var five = false;
var six = false;

var ready = false;

var xhr = new XMLHttpRequest();

const {ipcRenderer} = require('electron');



realname.addEventListener("keyup", function() {

        if ( realname.value.length >= 3 && realname.value.length <= 25 ) {

              realname.style.borderColor = "#4cbbd6";
              one = true;
        }

        else if ( realname.value.length > 0 && realname.value.length < 3 ) {

              realname.style.borderColor = "#333333";
              one = false;
        }

        else {

              realname.style.borderColor = "";
              one = false;

        }


});

nickname.addEventListener("keyup", function() {

    if ( nickname.value.length >= 3 && nickname.value.length <= 25 ) {

          nickname.style.borderColor = "#4cbbd6";
          two = true;
    }

    else if ( nickname.value.length > 0 && nickname.value.length < 3 ) {

          nickname.style.borderColor = "#333333";
          two = false;
    }

    else {

          nickname.style.borderColor = "";
          two = false;

    }


});

gender.addEventListener("keyup", function() {

    if ( gender.value === "male" || gender.value === "female" ) {

          gender.style.borderColor = "#4cbbd6";
          three = true;
    }

    else if ( gender.value.length > 0 && ( gender.value !== "male" || gender.value !== "female") ) {


          gender.style.borderColor = "#333333";
          three = false;

    }

    else {


          gender.style.borderColor = "";
          three = false;


    }


});

age.addEventListener("keyup", function() {

      var ageValue = parseInt(age.value);


      if ( ageValue >= 13 && ageValue <= 100 ) {

            age.style.borderColor = "#4cbbd6";
            four = true;

      }

      else if ( isNaN(ageValue) || ageValue < 13 || ageValue > 100 ) {


            age.style.borderColor = "#333333";
            four = false;
      }

      else {


            age.style.borderColor = "";
            four = false;

      }

});

password.addEventListener("keyup", function() {

        if ( password.value.length >= 8 && password.value.length <= 24 ) {

              password.style.borderColor = "#4cbbd6";
              five = true;

        }

        else if ( ( password.value.length > 0 && password.value.length < 8 ) || password.value.length > 24 ) {

                password.style.borderColor = "#333333";
                five = false;

        }

        else if ( password.value.length === 0 ) {

                 password.style.borderColor = "";
                 five = false;

        }


});

confirmPassword.addEventListener("keyup", function() {

          if (  confirmPassword.value === password.value ) {

                confirmPassword.style.borderColor = "#4cbbd6";
                six = true;

          }

          else if ( confirmPassword.value !== password.value && confirmPassword.value.length > 1 ) {


                    confirmPassword.style.borderColor = "#333333";
                    six = false;

          }

          else if ( confirmPassword.value.length < 1  ) {

                  confirmPassword.style.borderColor = "";
                  six = false;

          }


});

save.style.backgroundColor = "rgba(51,51,51,0.1)";

form.addEventListener("keyup", function() {

      if ( one === true && two === true && three === true && four === true && five === true && six === true ) {



            save.style.backgroundColor = "#4cbbd6";
            ready = true;

      }

      else {


            save.style.backgroundColor = "#333333";
            ready = false;


      }


});

save.addEventListener("click", function(event) {

      if ( ready === true ) {

            ipcRenderer.send('queryToken', 'token?');
            ipcRenderer.on('queryTokenReply', (event, token) => {

                    xhr.open('POST', 'https://127.0.0.1:8443/info');
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    xhr.onload = function() {



                            if ( xhr.status === 200 ) {

                                    window.location.href = "chat.html";

                            }


                  };
                  xhr.send(encodeURI(`realname=${realname.value}&nickname=${nickname.value}&gender=${gender.value}&age=${age.value}&password=${password.value}&confirmPassword=${confirmPassword.value}&token=${token}`));

          });

      }

      else {

            event.preventDefault();

      }


});
