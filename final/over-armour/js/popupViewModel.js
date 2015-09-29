var PopupViewModel = {};

/**
 * Binds all the events that are associated with the popup window
 */
PopupViewModel.bindViewEvents = function() {
    var self = this;

    document.querySelector("#launch_video").addEventListener("click", function() {
        self.chatControls.hide();
        self.videoControls.show();

        //Initiate video call
        KandyWrapper.Call.initiateVideoCall(self.currentExpert.username);
    });
    document.querySelector("#launch_audio").addEventListener("click", function() {
        self.chatControls.hide();
        self.audioControls.show();

        //Initiate audio call
        KandyWrapper.Call.initiateAudioCall(self.currentExpert.username);
    });

    document.querySelector("#launch_cobrowsing_parent").addEventListener("click", function() {
        //We need to call the parent window wrapper because it's that window we want to share
        var parentWindowKandy = window.opener.KandyWrapper;
        if (parentWindowKandy.Cobrowse.activeSession) {
            parentWindowKandy.Cobrowse.stop();
            self.screenShareControls.deactivate();
        } else {
            parentWindowKandy.Cobrowse.start();
            self.screenShareControls.activate();
        }
    });

    document.querySelector("#end_call").addEventListener("click", function() {
        self.videoControls.hide();
        self.chatControls.show();

        KandyWrapper.Call.endActiveCall();
    });

    document.querySelector("#request_video_in_call").addEventListener("click", function() {
        if (KandyWrapper.Call.activeCall) {
            self.videoControls.show();

            KandyWrapper.Call.requestVideo(self.currentExpert.username);
        }
    });

    document.querySelector("#send_chat_msg_button").addEventListener("click", function() {
        //Send a message to the current expert
        var messageBox = document.querySelector("#chat_input_window");
        var message = messageBox.value;
        KandyWrapper.chat.sendMessage(self.currentExpert.username, message).then(function() {
            self.addNewMessageFromUser(message);
        });
        messageBox.value = "";
    });

    document.querySelector("#chat_input_window").addEventListener("keypress", function(e) {
        if (e.keyCode === 13) {
            document.querySelector("#send_chat_msg_button").click();
        }
    });

    document.querySelector("#mute_call").addEventListener("click", function() {
        debugger;
        if (KandyWrapper.Call.onMute) {
            this.style.color = "white";
            KandyWrapper.Call.unmute();
        } else {
            KandyWrapper.Call.mute();
            this.style.color = "red";
        }
    });
};

/**
 * Holds the video controls functionalities
 * @type {{show: Function, hide: Function}}
 */
PopupViewModel.videoControls = {
    show: function() {
        document.querySelector(".video-template").style.display = "block";
        document.querySelector("#end_call").style.display = "block";
        document.querySelector("#request_video_in_call").style.display = "none";
    },
    hide: function() {
        document.querySelector(".video-template").style.display = "none";
    }
};

/**
 * Holds the audio controls functionalities
 * @type {{show: Function, hide: Function}}
 */
PopupViewModel.audioControls = {
    show: function() {
        document.querySelector(".video-template").style.display = "block";
        document.querySelector("#end_call").style.display = "block";
        document.querySelector("#request_video_in_call").style.display = "block";
    },
    hide: function() {
        document.querySelector(".video-template").style.display = "none";
    }
};

/**
 * Holds the chat controls functionalities
 * @type {{show: Function, hide: Function}}
 */
PopupViewModel.chatControls = {
    show: function() {
        document.querySelector(".chat-template").style.display = "block";
    },
    hide: function() {
        document.querySelector(".chat-template").style.display = "none";
    }
};

/**
 * Holds the screen share controls functionalities
 * @type {{show: Function, hide: Function}}
 */
PopupViewModel.screenShareControls = {
    activate: function() {
        var el = document.querySelector("#launch_cobrowsing_parent");
        toggleClass(el, "orange");
        toggleClass(el, "white");
    },
    deactivate: function() {
        var el = document.querySelector("#launch_cobrowsing_parent");
        toggleClass(el, "white");
        toggleClass(el, "orange");
    }
};

/**
 * Scroll the chat window so we can see the latest entry.
 * This currently uses jQuery animations
 * TODO Remove jQuery dependency
 */
PopupViewModel.scrollToBottom = function() {
    $("#chat_window").animate({ scrollTop: $("#chat_window").height() }, 1000);
};

/**
 * Adds a new message in the chat window.  This message will
 * show on the right side (messages from user).
 * @param message The message to show
 */
PopupViewModel.addNewMessageFromUser = function(message) {
    //TODO Remove jQuery dependency
    $("<div>").addClass("bubble-client bubble-right-margin").text(message).appendTo($("#chat_window"));
    this.scrollToBottom();
};

/**
 * Adds a new message in the chat window.  This message will
 * show on the left side (messages from the expert)
 * @param message
 */
PopupViewModel.addNewMessageFromExpert = function(message) {
    //TODO Remove jQuery dependency
    var $nickname = $("<label>").addClass("agent_chat_nick").text(this.currentExpert.name);
    var $chatItem = $('<div class="bubble-agent bubble-left-margin">');
    var $message = message.message.text;

    $chatItem.append($message);
    $('#chat_window').append($nickname.add($chatItem));

    this.scrollToBottom();
};

/**
 * This is the function that processes incoming messages
 * @param message Incoming Kandy message object
 */
PopupViewModel.receivedMessage = function(message) {
    if (message.messageType === "chat" && message.contentType === "text") {
        PopupViewModel.addNewMessageFromExpert(message);
    }
};

/**
 * Holds the currently selected expert
 * @type {{}}
 */
PopupViewModel.currentExpert = {};

/**
 * Initialization
 */
PopupViewModel.init = function() {
    var expert = Experts.find(getQueryParams().id);
    //Show the image and name of the expert
    document.querySelector("#expert_pic").src = "img/general/agents/" + expert.thumbnail;
    document.querySelector("#expert_name").innerText = expert.name;
    this.currentExpert = expert;

    //Bind the view events
    this.bindViewEvents();

    //Default to the chat controls but the adjust based on the URL
    this.audioControls.hide();
    this.videoControls.hide();
    this.chatControls.show();
    switch (getQueryParams().type) {
        case "audio":
            document.querySelector("#launch_audio").click();
            break;
        case "video":
            document.querySelector("#launch_video").click();
            break;
    }

    //Kandy events
    KandyWrapper.on("incomingMessage", this.receivedMessage);
    KandyWrapper.on("callEnded", document.querySelector("#end_call").click);

    this.scrollToBottom();
};

/**
 * When page is ready, load the app, initialize the app
 * including Kandy authentication and then initialize the popup.
 */
window.addEventListener("DOMContentLoaded", function() {
    window.app = new App();
    app.log("PopupViewModel", "onLoad", "Application initiated");

    app.init().then(function() {
        PopupViewModel.init();
    });
});