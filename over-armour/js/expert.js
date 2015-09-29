var INTERVAL = 3000;
var DOMAIN = "kandyworkshop.macadamian.com";

/**
 * The Expert class contains all information relative to the experts
 * that we display in the left panel.
 *
 * @param details
 * @constructor
 */
var Expert = function(details) {
    this.name = details.name;
    this.shortUsername = details.username;
    this.username = details.username + "@" + DOMAIN;
    this.image = details.image;
    this.thumbnail = this.getThumbnailPath(details.image);
    this.description = details.description;
    this.status = 0;
    this.interval = null;
};

/**
 * Returns a thumbnail path.  Currently the name of the thumbnail image is
 * the same as the original image but we append a "_face".
 * The thumbnail image is a PNG instead of a JPG
 * @param image Name of the original image
 * @returns {string}
 */
Expert.prototype.getThumbnailPath = function(image) {
    //Relies heavily on convention
    var imageName = image.split(".")[0];
    return imageName + "_face.png";
};

/**
 * This function polls the Kandy network to see if the specified expert
 * is currently online or not.
 * Kandy does not currently support presence when logged in as anonymous users
 * so we use the lastSeen timestamp.
 */
Expert.prototype.pollStatus = function() {
    var self = this;
    KandyWrapper.checkLastSeen(this.username).then(function(result) {
        var originalStatus = self.status;
        self.status = 0;
        if (result.users[0].last_seen !== 0) {
            var timeDifference = (new Date()).getTime() - result.users[0].last_seen;
            var timeDifferenceInSeconds = Math.round(timeDifference/1000);
            //self.log("pollStatus", self.shortUsername + " was seen " + timeDifferenceInSeconds + " seconds ago");
            if (timeDifferenceInSeconds <= 15) {
                self.status = 1;
            }
        }

        if (originalStatus !== self.status) {
            self.updateStatusIcon();
        }
    });
};

/**
 * Start the polling every INTERVAL seconds to see if the
 * expert is currently online or not.
 */
Expert.prototype.startPolling = function() {
    this.log("startPolling", "Start polling for the agent status");
    this.interval = setInterval(this.pollStatus.bind(this), INTERVAL);
    //And do it once right now
    this.pollStatus();
};

/**
 * Stops the polling for the expert status
 */
Expert.prototype.stopPolling = function() {
    clearInterval(this.interval);
};

/**
 * Updates the status icon of the expert depending on the current state
 * he is in.
 * TODO: This should move to the viewModel, not the model
 */
Expert.prototype.updateStatusIcon = function() {
    //Update the icon when we are on the index page
    var statusIcon = document.querySelector("#expert_status_" + this.shortUsername);
    if (statusIcon) {
        statusIcon.style["background-color"] = this.status === 1 ? "green" : "red";
    }
};

/**
 * Creates all the markup required to display the expert in the expert panel
 * to the left of the main page.
 * TODO: Remove jQuery dependency
 * @returns {DOMNode}
 */
Expert.prototype.createHtmlForPanel = function() {
    //Only when there is a expert container
    var $outerContainer = $("<div>").addClass("status-bar-container").attr("id", "expert-panel-" + this.shortUsername);

    if (document.querySelector("#expert_slider")) {
        $outerContainer.append(
            $("<img>").attr("u", "image").attr("src", "img/general/agents/" + this.image)
        );
        var statusBar = $("<div>").attr("id", "expert_name_sl_" + this.shortUsername).addClass("expert-name-sl pointer");
        var arrowBar = $("<span>").addClass("expert-slide-ctrl pointer");
        arrowBar.append(
            $("<i>").addClass("expert-prev-arrow left-float").text("<")
        );
        arrowBar.append(
            $("<div>").attr("id", "expert_status_" + this.shortUsername).addClass("expert_status")
        );
        arrowBar.append(
            $("<span>").text(" " + this.name)
        );
        arrowBar.append(
            $("<i>").addClass("expert-next-arrow right-float").text(">")
        );
        statusBar.append(arrowBar);
        $outerContainer.append(statusBar);
    }

    return $outerContainer;
};

/**
 * Uses the app.log function to log as part of the "Expert" moduel
 * @param functionName Name of the function
 * @param message Message to log
 */
Expert.prototype.log = function(functionName, message) {
    app.log("Expert",functionName, message);
};