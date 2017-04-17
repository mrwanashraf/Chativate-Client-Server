var yes = document.getElementById("yes");

const {ipcRenderer} = require('electron');

var xhr = new XMLHttpRequest();

yes.addEventListener("click", function() {

      ipcRenderer.send('queryToken', 'token?');
      ipcRenderer.on('queryTokenReply', (event, token) => {


              xhr.open('POST', 'https://127.0.0.1:8443/delete');
              xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
              xhr.onload = function() {

                    if ( xhr.status === 200 ) {

                          console.log("200 OK");
                          window.location.href = "signin.html";
                    }

                    else if ( xhr.status === 406 ) {

                          console.log("406 NOT ACCEPTABLE");
                          window.location.reload(true);


                    }
              };

            xhr.send(encodeURI(`token=${token}`));

      });
});
