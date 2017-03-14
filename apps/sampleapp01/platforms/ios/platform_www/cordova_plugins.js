cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "cordova-plugin-console.console",
        "file": "plugins/cordova-plugin-console/www/console-via-logger.js",
        "pluginId": "cordova-plugin-console",
        "clobbers": [
            "console"
        ]
    },
    {
        "id": "cordova-plugin-console.logger",
        "file": "plugins/cordova-plugin-console/www/logger.js",
        "pluginId": "cordova-plugin-console",
        "clobbers": [
            "cordova.logger"
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
    "cordova-plugin-whitelist": "1.3.2",
    "cordova-plugin-console": "1.0.6",
    "com.liveperson.messagingSDK": "0.1.0"
};
// BOTTOM OF METADATA
});