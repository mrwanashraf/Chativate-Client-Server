var username = document.getElementById("username");
var password = document.getElementById("password");
var confirmPassword = document.getElementById("confirmPassword");
var form = document.getElementById("form");
var submit = document.getElementById("submit");

var allowed = false; // boolean for making sure that the data is validated.

var userReady = false;  // boolean for making sure that the username is validated.
var passwordReady = false; // boolean for making sure that the password is validated.
var confirmReady = false; // boolean for making sure that the confirmPassword is validated.


var xhr = new XMLHttpRequest(); // ajax request.



// username validation using GET ajax request.

username.addEventListener("blur", function() {

  xhr.open('GET', 'https://127.0.0.1:8443/signup?u='+username.value);
  xhr.onload = function() {

        if ( ( username.value.length >= 3 && username.value.length <= 12 ) && xhr.status === 200 ) {

            username.style.borderColor = "#4cbbd6";
            userReady = true;

        }

        else if ( ( username.value.length > 0 && username.value.length < 3 ) || username.value.length > 12  || xhr.status === 406 ) {

            username.style.borderColor = "#333333";
            userReady = false;

        }

  };

  xhr.send();



  if ( username.value.length === 0 ) {

        username.style.borderColor = "";
        userReady = false;
  }

});

// password validation.

password.addEventListener("keyup", function() {


        if ( password.value.length >= 8 && password.value.length <= 24 ) {

              password.style.borderColor = "#4cbbd6";
              passwordReady = true;
        }

        else if ( ( password.value.length > 0 && password.value.length < 8 ) || password.value.length > 24 ) {

                password.style.borderColor = "#333333";
                passwordReady = false;
        }

        else if ( password.value.length === 0 ) {

                 password.style.borderColor = "";
                 passwordReady = false;
        }

});


// confirmPassword validation.

confirmPassword.addEventListener("keyup", function() {


        if (  confirmPassword.value === password.value ) {

              confirmPassword.style.borderColor = "#4cbbd6";
              confirmReady = true;
        }

        else {


                  confirmPassword.style.borderColor = "#333333";
                  confirmReady = false;
        }


});


  submit.style.backgroundColor = "rgba(51,51,51,0.1)"; // setting submit button backgroundColor to default until the data is validated.


// changing the submit button color based on boolean values.

form.addEventListener("keyup", function() {



      if ( userReady === true && passwordReady === true && confirmReady === true ) {

            submit.style.backgroundColor = "#4cbbd6";
            allowed = true;

      }

      else {

            submit.style.backgroundColor = "#333333";
            allowed = false;
      }


});


// doesn't allow the form to submit if data is not validated.

submit.addEventListener("click", function(event) {


          if ( allowed === false ) {

              event.preventDefault();

          }

          else {


                    xhr.open('POST', 'https://127.0.0.1:8443/signup');
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

                    xhr.onload = function() {

                            // if sign up process is completed successfully, redirect to sign in.

                            if ( xhr.status === 200 ) {

                                    window.location.href = "signin.html";

                            }


                  };

                  xhr.send(encodeURI("username="+username.value+"&password="+password.value+"&confirmPassword="+confirmPassword.value));

             }

});
