/*global cordova, module
refer to README for full explanation and documentation
*/

module.exports = {
    lp_conversation_api: function(action, args, successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "LPMessagingSDK", action, args);
    }
};