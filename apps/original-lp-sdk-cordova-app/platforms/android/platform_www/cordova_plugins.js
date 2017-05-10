cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "cordova-plugin-fcm.FCMPlugin",
        "file": "plugins/cordova-plugin-fcm/www/FCMPlugin.js",
        "pluginId": "cordova-plugin-fcm",
        "clobbers": [
            "FCMPlugin"
        ]
    },
    {
        "id": "com.liveperson.messagingSDK.lpMessagingSDK",
        "file": "plugins/com.liveperson.messagingSDK/www/lpMessagingSDK.js",
        "pluginId": "com.liveperson.messagingSDK",
        "clobbers": [
            "lpMessagingSDK"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-fcm": "2.1.1",
    "com.liveperson.messagingSDK": "0.1.0"
};
// BOTTOM OF METADATA
});