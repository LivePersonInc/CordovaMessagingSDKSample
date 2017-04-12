cordova.define("com.liveperson.messagingSDK.lpMessagingSDK", function(require, exports, module) {
    /*global cordova, module
    refer to README for full explanation and documentation
    */

    /*global cordova, module
     refer to README for full explanation and documentation
     */
    var exec = require('cordova/exec');

    exports.lp_conversation_api = function(action, args, successCallback, errorCallback) {
        exec(successCallback, errorCallback, "LPMessagingSDK", action, args);
    };

    exports.lp_register_event_callback = function(args, successCallback, errorCallback) {
        console.log("999 exports.lp_register_event_callback ");
        exec(successCallback, errorCallback, "LPMessagingSDK", "lp_register_event_callback", args);
    };

    exports.hello_world = function(action, args, successCallback, errorCallback) {
        console.log("999 js exports.hello_world " + action + args[0]);
        successCallback();
    };

});
