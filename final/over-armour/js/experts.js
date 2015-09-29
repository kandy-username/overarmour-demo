var Experts = [];

/**
 * Initializes the slider for the experts.
 * In this function, we create the HTML needed for the expert panel
 * and then adds the events to the next and previous arrows to
 * change the current expert that is displayed
 * TODO Remove jQuery dependency (easy)
 */
Experts.initializeSlider = function() {
    var $slider = $("#expert_slider");
    var self = this;

    for (var i = 0; i < this.length; i++) {
        var panel = this[i].createHtmlForPanel().hide();
        if (i === 0) {
            panel.show();
            $("#expert_info_container").text(this[i].description);
        }
        $slider.append(panel);
        this[i].updateStatusIcon();
    }

    //Add slider interactions
    $(".expert-next-arrow").on("click", function() {
        var prevExpert = self.currentExpert;
        self.currentExpert++;
        if (self.currentExpert >= self.length) {
            self.currentExpert = 0;
        }

        self.changeExpert(prevExpert, self.currentExpert);
    });

    $(".expert-prev-arrow").on("click", function() {
        var prevExpert = self.currentExpert;
        self.currentExpert--;
        if (self.currentExpert < 0) {
            self.currentExpert = self.length-1;
        }

        self.changeExpert(prevExpert, self.currentExpert);
    });

    //Set the current expert
    this.currentExpert = 0;
};

/**
 * Change the expert panel to show the new one.  This function
 * will add a transition to the panel to make it nicer when we
 * change from one expert to the other.
 *
 * TODO Remove jQuery dependency
 * TODO Add animate.css support to replace jQuery's fadeOut/In
 * @param from Current expert id
 * @param to New expert id
 */
Experts.changeExpert = function(from, to) {
    var self = this;
    $("#expert_info_container").text("");
    $("#expert-panel-" + this[from].shortUsername).fadeOut(500);
    setTimeout(function() {
        $("#expert-panel-" + self[to].shortUsername).fadeIn(500);
        $("#expert_info_container").text(self[to].description);
        self.currentExpert = to;
    }, 500);
};

/**
 * Finds an expert in the collection and returns that expert
 * object.
 * @param shortUsername The short username of the expert we want
 * @returns {Expert}
 */
Experts.find = function(shortUsername) {
    var match = null;
    for (var i = 0; i < Experts.length; i++) {
        if (Experts[i].shortUsername === shortUsername) {
            match = Experts[i];
            break;
        }
    }

    return match;
};

/**
 * Start the polling for all of the experts in the collection
 */
Experts.startPolling = function() {
    for (var i = 0; i < this.length; i++) {
        this[i].startPolling();
    }
};