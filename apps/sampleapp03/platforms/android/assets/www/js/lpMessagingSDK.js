/*global cordova, module
refer to README for full explanation and documentation
*/
var exec = require('cordova/exec');

exports.lp_conversation_api = function(action, args, successCallback, errorCallback) {
    exec(successCallback, errorCallback, "LPMessagingSDK", action, args);
};

exports.lp_register_event_callback = function(args, successCallback, errorCallback) {
    exec(successCallback, errorCallback, "LPMessagingSDK", "lp_register_event_callback", args);
};

exports.lp_close_conversation_on_error = function(action,args, successCallback, errorCallback) {
    exec(successCallback, errorCallback, "LPMessagingSDK", action, args);
};

exports.hello_world = function(action, args, successCallback, errorCallback) {
    console.log("999 HELLO WORLD");
    successCallback("exports.hello_world");
};