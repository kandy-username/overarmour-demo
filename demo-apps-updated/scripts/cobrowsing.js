// Script for handling cobrowsing with Kandy

$(function() {
  var me = {};

  me.start = function() {
    var listeners = {
      'onJoinApprove': onSessionJoinApprove,
      'onInactive': onRemoteSessionInactive,
      'onActive': onRemoteSessionBackActive
    };


    // Function to get sessions that have been created by all users
    function getOpenSessions() {

      /** getOpenSessions(success, failure)
          Gets a list of all open sessions.
          @params <function> success/failure
      */
      KandyAPI.Session.getOpenSessions(
        function (result) {
          loadSessionList(result.sessions);
        },
        function (msg, code) {
          clearAllSessionsAndCreateNew();
          alert('Error getting session info(' + code + '): ' + msg);
        }
      );
    };

    // ========================================
    //  ERASE ALL SESSIONS
    // ========================================
    function deleteSession(sessionid){
      console.log('==> deleting session ========== '+sessionid);
      KandyAPI.Session.terminate(//ok
        sessionid,
        function () {
          console.log('Session Deteled');
      },
        function (msg, code) {
          console.log('Error deleting session (' + code + '): ' + msg);
        }
      );
    };

    function clearAllSessionsAndCreateNew(){
      console.log('==> clearing all previously opened sessions ==========');
      KandyAPI.Session.getOpenSessionsCreatedByUser(function(result) {//OK
        console.log(JSON.stringify(result));
        for (var i =0;i< result.sessions.length; i++){
          deleteSession(result.sessions[i].session_id);
        }
      },
        function(msg, code) {
        console.log('Error getting session info(' + code + '): ' + msg);
        });
    };

    // ========================================
    //  ERASE ALL SESSIONS
    // ========================================

    // Event handler for onJoinApprove event
    function onSessionJoinApprove(notification) {
      UIState.sessionjoined();
    };

    //CC : ADDED -- Essential for when user share/stop sharing screen. Otherwise it will bloack on agent's side
    function onRemoteSessionInactive(notification){
      $("#stop-cobrowsing-btn").click();
    };

    function onRemoteSessionBackActive(notification){
      $("#start-cobrowsing-btn").click();
    };

    //== CC :  ADDED

    // Function to load Session Details
    function loadSessionDetails() {
      currentSession = sessions[parseInt($('#sessions-select').val())];

      $('#session-type').text(currentSession.session_type);
      $('#session-status').text(currentSession.session_status);
      $('#session-admin').text(currentSession.admin_full_user_id);

      if(currentSession.joined){
        UIState.sessionjoined();
      } else {
        UIState.sessionleft();
      }
    };

    // Event handler for session join button
    $('#session-join-btn').on('click', function() {
      currentSession = sessions[parseInt($('#sessions-select').val())];
      KandyAPI.Session.setListeners(currentSession.session_id, listeners);
      KandyAPI.Session.join( currentSession.session_id, {},
        function() {
          console.log('Session join requested.  ID = ' + currentSession.session_id);
          currentSession.joined = true;
        },
        function(msg, code) {
          alert('Error joining session (' + code + '): ' + msg);
    //CC added: essential
    leaveSession(currentSession);
        }
      );
    });

    function leaveSession(currentSession){
      KandyAPI.Session.leave( currentSession.session_id,
        'Reason for leaving: Done with session',
        function() {
          currentSession.joined = false;
          UIState.sessionleft();
          KandyAPI.CoBrowse.stopBrowsingAgent();
          console.log('Session left.  ID = ' + currentSession.session_id);
        },
        function(msg, code) {
          alert('Error leaving session (' + code + '): ' + msg);
        }
      );
    };

    // Event handler for session leave button
    $('#session-leave-btn').on('click', function() {
      KandyAPI.Session.leave( currentSession.session_id,
        'Reason for leaving: Done with session',
        function() {
          currentSession.joined = false;
          UIState.sessionleft();
          KandyAPI.CoBrowse.stopBrowsingAgent();
          console.log('Session left.  ID = ' + currentSession.session_id);
        },
        function(msg, code) {
          alert('Error leaving session (' + code + '): ' + msg);
        }
      );
    });

    // Event handler for start co-browsing button
    $('#start-cobrowsing-btn').on('click', function() {
      UIState.cobrowsingstarted();
      KandyAPI.CoBrowse.startBrowsingAgent(currentSession.session_id, document.getElementById('cobrowsing-holder'));
    });

    // Event handler for stop co-browsing button
    $('#stop-cobrowsing-btn').on('click', function() {
      UIState.cobrowsingstopped();
      KandyAPI.CoBrowse.stopBrowsingAgent();
    });

    var username;
    var sessions = {};
    var currentUser = {};
    var currentSession;

    // Function to load sessions list and append options to #sessions-select
    function loadSessionList(sessionList, alertWhenNone) {
      $('#sessions-select').empty();

      if (sessionList.length > 0) {
        var i = 0;

        sessionList.forEach(function(session) {
          sessions[i] = sessionList[i];
          var $option = $('<option>').val(i).text(session.session_id);
          $('#sessions-select').append($option);
          i++;
        });

        UIState.sessionsavailable();
        loadSessionDetails();
      } else {
        UIState.sessionsunavailable();
        sessions = [];
        clearSessionDetails();
        if (alertWhenNone === undefined || alertWhenNone === null || alertWhenNone) {
          alert('No sessions');
        }
      }
    }

    // Function to clear session details
    function clearSessionDetails() {
      $('#session-details li span').empty();
    }

    // Event handler to load session details on change option
    $('#sessions-select').change(function () {
      loadSessionDetails();
    });

    // Event handler for open sessions button
    $('#open-sessions').on('click', function() {
      getOpenSessions();
    });

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

    UIState.sessionsavailable = function() {
      $('#session-results').removeClass('hidden');
      $('#session-form').removeClass('hidden');
      $('#session-details').removeClass('hidden');
      $('#session-join-btn').removeClass('hidden');
    };

    UIState.sessionsunavailable = function() {
      $('#session-results').addClass('hidden');
      $('#session-form').addClass('hidden');
      $('#session-details').addClass('hidden');
      $('#session-actions button').addClass('hidden');
      console.log("SHARE SCREEN STOPPED sessionsunavailable!!!");
    };

    UIState.sessionjoined = function() {
      $('#session-join-btn').addClass('hidden');
      $('#session-leave-btn').removeClass('hidden');
      $('#start-cobrowsing-btn').removeClass('hidden');
    };

    UIState.sessionleft = function() {
      $('#session-actions button').addClass('hidden');
      $('#session-join-btn').removeClass('hidden');
      console.log("SHARE SCREEN STOPPED sessionleft!!!");
    };

    UIState.cobrowsingstarted = function() {
      $('#session-actions button').addClass('hidden');
      $('#session-leave-btn').removeClass('hidden');
      $('#stop-cobrowsing-btn').removeClass('hidden');
    };

    UIState.cobrowsingstopped = function() {
      $('#session-actions button').addClass('hidden');
      $('#session-leave-btn').removeClass('hidden');
      $('#start-cobrowsing-btn').removeClass('hidden');
      console.log("CO- BROWSING STOPPED!!!");
    };
  };

  window.cobrowsing = me;
});
