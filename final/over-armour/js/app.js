/**
 * Main application constructor
 * @constructor
 */
var App = function() {
    //Define the application constants here
    this.DEBUG = true;
    this.localStorageKey = "kandyUser";
    this.forceNewUser = false;
};

/**
 * Application initialization.  This will start the kandy authentication process
 * and run the afterInitialization function
 * @returns {Promise}
 */
App.prototype.init = function() {
    var self = this;

    //Create the next experts
    var Lisa = new Expert({
        description: 'Loves mountain biking, cross country running and plays in 3 soccer leagues.',
        name:'Lisa',
        image: 'expert01.jpg',
        username:'user1'
    });

    var Andrew = new Expert({
        description: 'Loves powerlifting and occasionally some crossfit.',
        name:'Andrew',
        image: 'expert02.jpg',
        username:'user2'
    });

    //Add to the Experts collection
    Experts.push(Lisa);
    Experts.push(Andrew);

    //Initialize the expert slider
    Experts.initializeSlider();

    //Authenticate to the Kandy network
    return KandyWrapper.authenticate().then(function() {
        return self.afterAuthentication();
    });
};

/**
 * Code to execute after a successful authentication to the Kandy network
 */
App.prototype.afterAuthentication = function() {
    //Start the experts polling
    Experts.startPolling();
};

/**
 * Main application logging tool.  Uses the app.DEBUG param to decide whether it
 * should log or not.
 * This function will log to the console in the following format
 * > [ModuleName-FunctionName] Message
 *
 * @param module Name of the module
 * @param functionName Name of the function
 * @param message Message to log
 */
App.prototype.log = function(module, functionName, message) {
    if (this.DEBUG) console.log("[" + module + "-" + functionName + "] " + message);
};