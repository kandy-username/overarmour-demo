/**
 * KandyWrapper is a library that calls all the KandySDK functions
 * In a normal project, this file should not be needed.  We use it
 * during this workshop to group all the functions that
 * use the KandySDK in order to better illustrate how to use those
 * functions
 * @type {}
 */
var KandyWrapper = {};

/**
 * Force a new user during the authentication
 * @type {boolean}
 */
KandyWrapper.forceNewUser = false;

/**
 * Set the listeners for the kandy.setup function
 * Most of the listeners are setup to be event based
 * and will trigger a KandyWrapper event when triggered
 */
KandyWrapper.setListeners = function() {
    var logListenersDetails = true;
    var self = this;

    self.log("setListeners", "Preparing setup...");

    kandy.setup({
        remoteVideoContainer: document.querySelector("#theirVideo"),//to append video in popup on a video call
        listeners: {
            oncall: function (call) {
                if (logListenersDetails) self.log("listeners", "On call");
            },
            endcall: function () {
                if (logListenersDetails) self.log("listeners", "Call ended");
                self.trigger("callEnded");
            },
            callinitiated: function (call) {
                //self.Call.activeCall = call.getId();
                //if (logListenersDetails) self.log("listeners", "Call initiated (id: " + self.activeCall + ")");
                //self.trigger("callInitiated");
            },
            callinitiatefailed: function (videoTag) {
                self.log("listeners", "Call initiate failed");
            },
            callincoming: function (call, isAnonymous) {
                if (logListenersDetails) self.log("listeners", "Incoming call");
                self.Call.activeCall = call.getId();
                self.trigger("incomingCall");
            },
            callrejected: function () {
                if (logListenersDetails) self.log("listeners", "Call rejected");
                self.Call.activeCall = null;
            },
            callanswered: function () {
                if (logListenersDetails) self.log("listeners", "Call answered");
            },
            callended: function () {
                if (logListenersDetails) self.log("listeners", "Call ended");
                self.trigger("callEnded");
            },
            message: function (msg) {
                //if (logListenersDetails) self.log("listeners", "Incoming IM");
                //self.trigger("incomingMessage", [msg]);
            }
        }
    });
};

/**
 * Starts the authentication process.
 * This functions checks for an anonymous user starts the
 * login process with that user.
 * @returns {Promise}
 */
KandyWrapper.authenticate = function() {
    var self = this;

    this.setListeners();

    return this.checkForAnonymousUser().then(function(user) {
        return self.login(user);
    }).then(function() {
        self.log("authenticate", "Authentication successful");
    });
};

/**
 * Log in to the Kandy network
 * Tries to login to the network.  If a problem occurs, it
 * is most likely an expired token.  If that is the case, we
 * retry the authentication process by forcing a new user.
 * @param user
 * @returns {Promise}
 */
KandyWrapper.login = function(user) {
    var p = new Promise();
    var self = this;

    this.log("login", "Login using " + user.user_access_token);
    kandy.loginSSO(user.user_access_token, function() {
        p.resolve();
    }, function() {
        //Restart but for a new user creation
        self.log("login", "Token expired, restart authentication with new user");
        self.forceNewUser = true;
        p = self.authenticate();
    }, user.pass);
    return p;
};

/**
 * Checks if an anonymous user is stored in the local storage.  If
 * a valid user can't be found, it will try to generate one from
 * the server
 * @returns {Promise}
 */
KandyWrapper.checkForAnonymousUser = function() {
    //var p = new Promise();
    //var storedUser = get_from_local_storage(this.localStorageKey);
    //if (!this.forceNewUser && storedUser !== null && storedUser.user_email && storedUser.pass && storedUser.user_access_token) {
    //    p.resolve(storedUser);
    //} else {
    //    p = this.generateUserFromServer();
    //}
    //
    //return p;
};

/**
 * Generates a new user from our local node server.  This user
 * generation could be done on the client but is done on the
 * server so we can hide our API keys from the end users.
 * @returns {Promise}
 */
KandyWrapper.generateUserFromServer = function() {
    //var p = new Promise();
    //var xhr = new XMLHttpRequest();
    //var self = this;
    //
    //this.log("generateUserFromServer", "Generating a new user.");
    //
    //xhr.open('GET', "/domain-access-token");
    //xhr.onload = function() {
    //    if (xhr.status === 200) {
    //        var resp = JSON.parse(xhr.responseText);
    //        var anonymousUser = {
    //            user_email: resp.result.full_user_id,
    //            username: resp.result.user_name,
    //            user_access_token: resp.result.user_access_token,
    //            pass: resp.result.user_password
    //        };
    //        add_to_local_storage(self.localStorageKey, anonymousUser);
    //        p.resolve(anonymousUser);
    //    }
    //    else {
    //        p.reject('Request failed.  Returned status of ' + xhr.status);
    //    }
    //};
    //xhr.send();
    //
    //return p;
};

/**
 * Get the timestamp of the last time an expert was seen
 * @param username The full expert username
 * @returns {Promise}
 */
KandyWrapper.checkLastSeen = function(username) {
    var p = new Promise();
    //var self = this;
    //KandyAPI.getLastSeen([username],
    //    function(result) {
    //        p.resolve(result);
    //    },
    //    function(msg, code) {
    //        self.log("checkLastSeen", "Error getting last seen (" + code + "): " + msg);
    //        p.reject();
    //    }
    //);

    return p;
};

/**
 * All functions related to chat are under this object
 * @type {}
 */
KandyWrapper.chat = {};

/**
 * Send an IM to a specific user
 * @param to Full username of the user we want to send a message to
 * @param message The message that we are sending
 * @returns {Promise}
 */
KandyWrapper.chat.sendMessage = function(to, message) {
    var p = new Promise();
    //var self = KandyWrapper;
    //
    //kandy.messaging.sendIm(to, message, function () {
    //    p.resolve(message);
    //}, function (e) {
    //    self.log("chat-sendMessage", "Error sending message " + e);
    //    p.reject();
    //});

    return p;
};

/**
 * All functions related to audio and video calls
 * are stored under this object
 * @type {}
 */
KandyWrapper.Call = {};

/**
 * Stores the id of the currently active call.  When no
 * call is active, this should contain null
 * @type {{}}
 */
KandyWrapper.Call.activeCall = {};

/**
 * Initiate an audio call.
 * The Kandy call to make an audio or video call is the same
 * but the second argument is a boolean indicating if the
 * call contains a video stream.
 * @param to The full username of the user to call
 */
KandyWrapper.Call.initiateAudioCall = function(to) {
    //kandy.call.makeCall(to, false); //false == no video
};

/**
 * Initiate a video call
 * The same Kandy call that we did for audio but this time
 * we pass is true as the second argument to indicate that
 * we have a video stream.
 * @param to The full username of the user we want to call
 */
KandyWrapper.Call.initiateVideoCall = function(to) {
    //kandy.call.makeCall(to, true);  //true == with video
};

/**
 * Requests a video stream during an active audio call
 * @param to The full username of the user we want to call
 */
KandyWrapper.Call.requestVideo = function(to) {
    kandy.messaging.sendJSON(to, {"request_video": true}, function() {
        KandyWrapper.log("requestVideo", "Video request successful");
    });
};

/**
 * Ends the currently active call on both the Kandy SDK
 * and sets the activeCall property to null
 */
KandyWrapper.Call.endActiveCall = function() {
    //kandy.call.endCall(KandyWrapper.Call.activeCall);
    //KandyWrapper.Call.activeCall = null;
};

/**
 * Boolean to indicate if the call is currently muted or not
 * @type {boolean}
 */
KandyWrapper.Call.onMute = false;

/**
 * Mutes the current call.
 */
KandyWrapper.Call.mute = function() {
    kandy.call.muteCall(KandyWrapper.Call.activeCall);
    KandyWrapper.Call.onMute = true;
};

/**
 * Unmutes the current call.
 */
KandyWrapper.Call.unmute = function() {
    kandy.call.unMuteCall(KandyWrapper.Call.activeCall);
    KandyWrapper.Call.onMute = false;
};

/**
 * All properties and methods associated with cobrowsing are
 * stored under this object.
 * @type {{}}
 */
KandyWrapper.Cobrowse = {};

/**
 * Starts a cobrowsing session
 * This method will start by creating a new session for the cobrowsing
 * and then add a new listener to the session.  This listener will
 * simply automatically accept the cobrowsing session when the Kandy
 * network requests it.
 * Once the cobrowsing is started, the cobrowsingStarted event is triggered
 */
KandyWrapper.Cobrowse.start = function() {
    //KandyWrapper.Cobrowse.createSession().then(function(sessionId) {
    //    kandy.session.setListeners(sessionId, {
    //        onUserJoinRequest: function(notification) {
    //            KandyWrapper.log("cobrowse-start", "Incoming request for co-browsing");
    //            kandy.session.acceptJoinRequest(notification.session_id, notification.full_user_id);
    //        }
    //    });
    //
    //    KandyAPI.CoBrowse.startBrowsingUser(sessionId);
    //
    //    KandyWrapper.trigger("cobrowsingStarted", [sessionId]);
    //});
    //
    ////TODO Revisit this
    //add_to_local_storage(kandy_workshop.auth.constants.cobrowsing_currently_active, true);
};

/**
 * Stops the current cobrowsing session
 * This will stop the screen share as well as deactive and delete the active
 * session.  Once the cobrowsing is stopped, the cobrowsingStopped event
 * is triggered
 */
KandyWrapper.Cobrowse.stop = function() {
    //KandyAPI.CoBrowse.stopBrowsingUser();
    //kandy.session.inactivate(KandyWrapper.Cobrowse.activeSession);
    //kandy.session.terminate(KandyWrapper.Cobrowse.activeSession, function () {
    //    KandyWrapper.log("cobrowse-stop", "Deleting session");
    //});
    //KandyWrapper.Cobrowse.activeSession = null;
    //
    //add_to_local_storage(kandy_workshop.auth.constants.cobrowsing_currently_active, false);
    //
    //KandyWrapper.trigger("cobrowsingStopped");
};

/**
 * Holds the currently active session that is used for the
 * cobrowsing
 * @type {null}
 */
KandyWrapper.Cobrowse.activeSession = null;

/**
 * Creates a new session to be used with the cobrowsing
 * methods.  This session is then stored in the activeSession
 * property
 * @returns {Promise}
 */
KandyWrapper.Cobrowse.createSession = function() {
    var self = KandyWrapper;
    var p = new Promise();

    //var mockSessionParams = {
    //    session_type: 'kandy-workshop',
    //    user_first_name: 'anonymousUser',
    //    user_last_name: ''
    //};
    //kandy.session.create(
    //    mockSessionParams,
    //    function(result) {
    //        var sessionId = result.session_id;
    //        kandy.session.activate(sessionId);
    //        self.log("cobrowse-createSession", "Created session #" + sessionId);
    //        add_to_local_storage(kandy_workshop.auth.constants.stored_cobrowsing_session_id, sessionId);
    //        self.Cobrowse.activeSession = sessionId;
    //        p.resolve(result.session_id);
    //    },
    //    function(msg, code) {
    //        console.log('Error creating session (' + code + '): ' + msg);
    //        p.reject();
    //    }
    //);

    return p;
};

/**
 * Holds the events that the other modules registered
 * to.
 * @type {{}}
 * @private
 */
KandyWrapper._registeredEvents = {};

/**
 * Fires an event.  Any callback that has registered in
 * another module will be executed once the associated event
 * is triggered.
 * @param eventName The name of the event to trigger
 */
KandyWrapper.trigger = function(eventName) {
    if (this._registeredEvents[eventName]) {
        for (var i=0; i < this._registeredEvents[eventName].length; i++) {
            this._registeredEvents[eventName][i].apply(null, arguments[1]);
        }
    }
};

/**
 * Registers a callback to associate to an event.  When this
 * event is triggered, this callback will be associated
 * @param eventName Name of the event to associate to
 * @param callback A callback to execute when this event is triggered
 */
KandyWrapper.on = function(eventName, callback) {
    if (typeof this._registeredEvents[eventName] === "undefined") {
        this._registeredEvents[eventName] = [];
    }
    this._registeredEvents[eventName].push(callback);
};

/**
 * Logging function.  Uses the app.log function
 * @param module Name of the function
 * @param message Message to log
 */
KandyWrapper.log = function(module, message) {
    app.log("KandyWrapper", module, message);
};