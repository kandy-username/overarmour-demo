// Script for handling audio calls with Kandy

$(function() {
  var me = {};

  me.start = function() {
    wireUI();
  };

  function wireUI() {
    var callId;

    // Create audio objects to play incoming calls and outgoing calls sound
    var $audioRingIn = $('<audio>', { loop: 'loop', id: 'ring-in' });
    var $audioRingOut = $('<audio>', { loop: 'loop', id: 'ring-out' });

    // Load audio source to DOM to indicate call events
    var audioSource = {
      ringIn: [
        { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringin.mp3', type: 'audio/mp3' },
        { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringin.ogg', type: 'audio/ogg' }
        ],
      ringOut: [
        { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringout.mp3', type: 'audio/mp3' },
        { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringout.ogg', type: 'audio/ogg' }]
    };

    audioSource.ringIn.forEach(function(entry) {
      var $source = $('<source>').attr('src', entry.src);
      $audioRingIn.append($source);
    });

    audioSource.ringOut.forEach(function(entry) {
      var $source = $('<source>').attr('src', entry.src);
      $audioRingOut.append($source);
    });

    /** setup(config) intializes KandyAPI
      @param <object> config
    */
    KandyAPI.Phone.setup({
      remoteVideoContainer: $('#incoming-video')[0],

      // listeners registers events to handlers
      // You can handle all Kandy Events by registering it here
      listeners: {
        setupsuccess: onSetupSuccess,
        setupfailed: onSetupFailed,
        loginsuccess: onLoginSuccess,
        loginfailed: onLoginFailed,
        callinitiated: onCallInitiate,
        callinitiatefailed: onCallInitiateFail,
        callrejected: onCallRejected,
        callrejectfailed: onCallRejectFailed,
        callignored: onCallIgnored,
        callignorefailed: onCallIgnoreFailed,
        callincoming: onCallIncoming,
        callanswered: onCallAnswer,
        callansweredFailed: onCallAnsweredFailed,
        oncall: onCall,
        callended: onCallTerminate,
        callendedfailed: onCallEndedFailed,
        presencenotification: onPresenceNotification,

        message: function(msg) {//used for receiving chat messages
          var obj = JSON.parse(msg.message.json);
          console.log("====> RECEIVING MESSAGE "+ obj["request_video"]);
          if(obj["request_video"]){
            prompt_for_video_request(callId)
          }
        }
        }
      });

    /**
    * Start your own (client) video
    */
    function stop_video_in_call(callid) {
        console.log("====> trying to stop video");
        kandy.call.stopCallVideo(callId, function(){
        console.log("====> successfully stopped video");
      }, function(){
          console.log("===> FAILED TO STOP VIDEO");
      });
    }

    /**
    * Stop your own (client) video
    */
    function start_video_in_call(callid) {
        console.log("====> trying to start video");
        kandy.call.startCallVideo(callId, function(){
        console.log("====> successfully started video");
      }, function(){
        console.log("===> FAILED TO START VIDEO");
      });
    }

    function prompt_for_video_request() {
      var x;
      if (confirm("Customer is requesting you share your video...") == true) {
       start_video_in_call(callId);
      } else {
      //cancel
      }
    }

    /** UIState is a custom piece of code that shuffles between UI states
        eg:: If user is authenticated, the relevant DOM elements are brought to screen
        and the rest are hidden. Using this method is NOT recommended!
    */

    var username, UIState = {};

    UIState.initial = function() {
      console.log('initial');

      $audioRingIn[0].pause();
      $audioRingOut[0].pause();

      $('#call-form p, #incoming-call p, #call-connected p').text('');
      $('#incoming-call, #call-connected, .call-terminator, #resume-call-btn').addClass('hidden');
      $('#call-form, .call-initializer').removeClass('hidden')
    };

    // Event handler for setupsuccess event
    function onSetupSuccess() {
      console.debug('setupsuccess');
      KandyAPI.Phone.updatePresence(0);
    }

    // Event handler for setupfailed event
    function onSetupFailed(msg) {
      console.debug('setupfailed');
      alert('KandyAPI.Phone.setup() failed: ' + msg);
      KandyAPI.Phone.logout();
    }
      // Event handler for loginsuccess event
    function onLoginSuccess() {
      KandyAPI.Phone.updatePresence(0);
      UIState.authenticated();
    }

    // Event handler for onLoginFailed event
    function onLoginFailed() {
      UIState.unauthenticated();
      alert('Login Failed!');
    }

    // Event handler for callinitiate
    function onCallInitiate(call) {
      callId = call.getId();

      $audioRingIn[0].pause();
      $audioRingOut[0].play();

      $('#username-calling').text('Calling ' + $('#user_to_call').val());
      UIState.callinitialized();
    }

    // Event handler for callinitiatefail event
    function onCallInitiateFail() {
      console.debug('call initiate fail');

      $audioRingOut[0].pause();
      UIState.initial();
      alert('call failed');
    }

    UIState.callinitialized = function() {
      console.log('callinitialized');

      $('.call-initializer').addClass('hidden');
    };

    // Event handler for initiate call button
    $('#initialize-call-btn').on('click', function() {
      var username = $('#user_to_call').val();

      /** makeCall( userName, cameraOn ) : Void
          Initiates a call to another Kandy user over web
          @params <string> userName, <boolean> cameraOn
      */
      KandyAPI.Phone.makeCall(username, true);
    });

    // Event handler for oncall event
    function onCall(call) {
      console.debug('oncall');
      $audioRingOut[0].pause();
      UIState.oncall();
    }

    // Event handler for callended event
    function onCallTerminate(call) {
      console.debug('callended');
      callId = null;

      $audioRingOut[0].play();
      $audioRingIn[0].pause();

      UIState.initial();
    }

    // Event handler for callendedfailed event
    function onCallEndedFailed() {
      console.debug('callendfailed');
      callId = null;
    }

    $('#hold-call-btn').on('click', function() {
      KandyAPI.Phone.holdCall(callId);
      UIState.holdcall();
    });

    $('#resume-call-btn').on('click', function() {
      KandyAPI.Phone.unHoldCall(callId);
      UIState.resumecall();
    });

    // Event handler for call end button
    $('#end-call-btn').on('click', function() {
      KandyAPI.Phone.endCall(callId);
      UIState.initial();
    });

    UIState.oncall = function() {
      console.log('oncall');

      $('#incoming-call, #call-form').addClass('hidden');
      $('#call-connected').removeClass('hidden');
    };

    UIState.holdcall = function() {
      console.log('holdcall');

      $('#hold-call-btn').addClass('hidden');
      $('#resume-call-btn').removeClass('hidden');
    };

    UIState.resumecall = function() {
      console.log('resumecall');

      $('#hold-call-btn').removeClass('hidden');
      $('#resume-call-btn').addClass('hidden');
    };

    // Event handler for callincoming event
    function onCallIncoming(call, isAnonymous) {
      $audioRingIn[0].play();
      callId = call.getId();

      if (!isAnonymous) {
        $('#username-incoming').text(call.callerName + ' Calling!');
      } else {
        $('#username-incoming').text('Anonymous Calling');
      }

      UIState.callincoming();
    };

    // Event handler for oncallanswered event
    function onCallAnswer(call) {
      callId = call.getId();

      $audioRingOut[0].pause();
      $audioRingIn[0].pause();
    };

    // Event handler for callansweredfailed event
    function onCallAnsweredFailed(call) {
      console.debug('callanswerfailed');
      callId = null;
    };

    // Event handler for callrejected event
    function onCallRejected() {
      console.debug('callrejected');
      callId = null;
      $audioRingIn[0].pause();
      UIState.callrejected();
      alert('Call Rejected');
    };

    // Event handler for callrejectfailed event
    function onCallRejectFailed() {
      console.debug('callrejectfailed');
      alert('Call Decline Failed');
    };

    // Event handler for call answer button
    $('#answer-call-btn').on('click', function() {
      KandyAPI.Phone.answerCall(callId, false);
      UIState.oncall();
    });

    // Event handler for call reject button
    $('#reject-call-btn').on('click', function() {
      KandyAPI.Phone.rejectCall(callId);
      UIState.initial();
    });

    UIState.callincoming = function() {
      console.log('call incoming');

      $('#call-form, #call-connected').addClass('hidden');
      $('#incoming-call').removeClass('hidden');
    };

    UIState.callrejected = function() {
      console.log('call rejected');

      $('#incoming-call').addClass('hidden');
    };
      
    // Event handler for callignored event
    function onCallIgnored() {
      console.debug('callignored');
      callId = null;
      UIState.initial();
    };

    // Event handler for callignorefailed event
    function onCallIgnoreFailed() {
      console.debug('callignorefailed');
      callId = null;
    };

    // Event handler for presencenotification event
    function onPresenceNotification(username, state, description, activity) {
      console.debug('presencenotification');
    };

  };

  window.audioOnly = me;
});
