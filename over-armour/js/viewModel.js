
var ViewModel = {};

ViewModel.bindViewEvents = function() {
    ViewModel.interactionButtonEvents();

    KandyWrapper.on("cobrowsingStarted", this.showCobrowsingBar);
    KandyWrapper.on("cobrowsingStopped", this.hideCobrowsingBar);
};

ViewModel.showCobrowsingBar = function(sessionId) {
    document.querySelector("#top_static_drawer").style.background = "orange";
    document.querySelector("#cobrowsing-bar").style.display = "block";
    document.querySelector("#cobrowsing-session").innerText = sessionId;
};

ViewModel.hideCobrowsingBar = function() {
    document.querySelector("#top_static_drawer").style.background = "black";
    document.querySelector("#cobrowsing-bar").style.display = "none";
};

ViewModel.interactionButtonEvents = function() {
    function openPopup() {
        if (Experts[Experts.currentExpert].status === 1) {
            ViewModel.openChatPopup(this.getAttribute("name"), Experts[Experts.currentExpert]);
        } else {
            //Do nothing, agent is not online
            app.log("ViewModel", "interactionButtonEvents", "Agent is not online");
        }
    }
    document.querySelector("#launch_video_support").addEventListener("click", openPopup);
    document.querySelector("#launch_audio_support").addEventListener("click", openPopup);
    document.querySelector("#launch_chat_support").addEventListener("click", openPopup);
};

ViewModel.openChatPopup = function(type, expert) {
    var height = 800;
    var width = 700;
    var left = (screen.width/2)-(($(window).width()*0.5)/2);
    var top = (screen.height/2)-(($(window).height()*1.2)/2);
    var expertPopup = window.open("expert-popup.html?id="+expert.shortUsername + "&type=" + type, type, "height="+height+",width="+width+",top="+top+",left="+left);
    expertPopup.focus();
};

window.addEventListener("DOMContentLoaded", function() {
    window.app = new App();
    app.log("ViewModel", "onLoad", "Application initiated");

    app.init().then(function() {
        //Initialize this view
        ViewModel.bindViewEvents();
    }, function(e) {
        console.log(e);
    });
});