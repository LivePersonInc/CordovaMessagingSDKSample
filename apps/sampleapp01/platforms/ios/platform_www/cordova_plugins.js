cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      'id': 'phonegap-plugin-push.PushNotification',
      'file': 'plugins/phonegap-plugin-push/www/push.js',
      'pluginId': 'phonegap-plugin-push',
      'clobbers': [
        'PushNotification'
      ]
    },
    {
      'id': 'com.liveperson.messagingSDK.lpMessagingSDK',
      'file': 'plugins/com.liveperson.messagingSDK/www/lpMessagingSDK.js',
      'pluginId': 'com.liveperson.messagingSDK',
      'clobbers': [
        'lpMessagingSDK'
      ]
    }
  ];
  module.exports.metadata = 
// TOP OF METADATA
  {
    'cordova-plugin-whitelist': '1.3.3',
    'phonegap-plugin-push': '2.0.0',
    'com.liveperson.messagingSDK': '0.1.0'
  };
// BOTTOM OF METADATA
});