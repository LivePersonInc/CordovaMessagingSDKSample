/*global cordova, module
Example JS call:
    var success = function(message) {
        console.log("OnEvent JS: " + message)
    }

    var failure = function() {
        console.log("Error calling lp_conversation_api Plugin");
    }
    var action = lp_sdk_init; or var action = start_lp_conversation;
    var accountId = xxxx;

    lpMessagingSDK.lp_conversation_api(action, accountId, success, failure);
*/

module.exports = {

    lp_conversation_api: function (action, accountId, successCallback, errorCallback) {

        cordova.exec(successCallback, errorCallback, "LPMessagingSDK", action, [accountId]);

    }

};