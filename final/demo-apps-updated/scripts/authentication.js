// Entry point script for authenticating and navigation

// JL Populate the form with data from config.json
$.ajax({
  method: "GET",
  url: "../data/config.json",
  "Content-Type": "application/json"
}).done(function(resp) {
  $("#api_key").val(resp.api_key);
  $("#username").val(resp.username);
  $("#password").val(resp.password);
});

// CC == ADDED: as discussed with Jean Yves on skype: (6/11/2015)
//  Q : the chat.html demo app, when you logout, if you stay idle for a while the browser tab in which it is open freezes and you cannot
// click login (or any other field) anymore. Is there something missing in it?
//  A : It is a bug in kandy.js. To avoid it make sure to refresh the page after logging out
// [2:02:31 PM] Jean-Yves Boudreau: It's on the radar to get fixed
  $(function() {      
    /** setup(config)
        Intializes KandyAPI
        @param <object> config
    */
    KandyAPI.Phone.setup({
  
      // listeners registers events to handlers
      // You can handle all Kandy Events by registering it here
      listeners: {
        loginsuccess: onLoginSuccess,
        loginfailed: onLoginFailed
      }
    });
    
    function onLoginSuccess() {
  
      /** updatePresence(val) updates the users presence
          eg. 0: Connected, 1: Unavailable, 2: Away, etc.
          @param <integer> val
      */
      KandyAPI.Phone.updatePresence(0);
      UIState.authenticated();
      loadContacts();
  
      // Checks every 5 seconds for incoming messages
  // CC = This getIM will update the last seen of the logged in user
      myInterval = setInterval(receiveMessages, 5000);
    }
  
    // Event handler for loginfailure event
    function onLoginFailed() {
      alert('Login Failed');
    }
              
    // Event handler for login form button
    $('#login-btn').on('click', function(e) {
      e.preventDefault();
  
      // Values extracted from login form
      username = $('#username').val();
      var apiKey = $('#api_key').val();
      var password = $('#password').val();
    
      /** login(domainApiId, userName, password)
          logs in user to Kandy Platform
          @params <string> domainApiId, <string> userName, <string> password
      */
      KandyAPI.Phone.login(apiKey, username, password);
    });
  
    // Event handler for logout button
    $('#logout-btn').on('click', function() {
    
      /** logout(success) logs a user out of the Kandy Platform
          @param <function> success - Callback handler for
          successful logout
      */
      KandyAPI.Phone.logout(function() {
        chat.cleanup();
        UIState.unauthenticated();
      });
    });
    
    // Event handler for chat tab
    $('#demo-chat').on('click', function() {
      /** Switch to text chat **/
      UIState.clear();
      UIState.chat();
    });

    // Event handler for audio tab
    $('#demo-audio').on('click', function() {
      /** Switch to audio **/
      UIState.clear();
      UIState.audio();
    });

    // Event handler for video tab
    $('#demo-video').on('click', function() {
      /** Switch to video **/
      UIState.clear();
      UIState.video();
    });

    // Event handler for cobrowsing tab
    $('#demo-cobrowsing').on('click', function() {
      /** Switch to cobrowsing **/
      UIState.clear();
      UIState.cobrowsing();
    });

    /** UIState is a custom piece of code that shuffles between UI states
        eg:: If user is authenticated, the relevant DOM elements are brought to screen
        and the rest are hidden. Using this method is NOT recommended!
    */
    
    var username, UIState = {};
    
    UIState.authenticated = function() {
      $('#login-form').addClass('hidden');
      $('#logged-in').removeClass('hidden');
      $('.username').text(username);
    };
    
    UIState.unauthenticated = function() {
      $('#login-form').removeClass('hidden');
      $('#logged-in').addClass('hidden');
      $('.username').text('');
    };
    
    UIState.initial = function() {
      console.log('initial');
    
      $audioRingIn[0].pause();
      $audioRingOut[0].pause();
    
      $('#call-form p, #incoming-call p, #call-connected p').text('');
      $('#incoming-call, #call-connected, .call-terminator, #resume-call-btn').addClass('hidden');
      $('#call-form, .call-initializer').removeClass('hidden')
    };

    UIState.clear = function() {
      $('#tab-content').empty();
    };

    UIState.chat = function() {
      $.get('../templates/chat.html', function(template) {
        $('#tab-content').append(template);
        chat.start();
      });
    };

    UIState.audio = function() {
      $.get('../templates/kandy_phone_audio_only.html', function(template) {
        $('#tab-content').append(template);
        audioOnly.start();
      });
    };

    UIState.video = function() {
      $.get('../templates/kandy_phone_with_video.html', function(template) {
        $('#tab-content').append(template);
        video.start();
      });
    };

    UIState.cobrowsing = function() {
      $.get('../templates/cobrowsing-agent.html', function(template) {
        $('#tab-content').append(template);
        cobrowsing.start();
      });
    };
});
