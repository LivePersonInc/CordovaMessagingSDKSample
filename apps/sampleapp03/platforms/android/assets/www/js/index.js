/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

  settings: {
    accountId: '90233546', // replace with your account id
//    accountId: '33884409', // replace with your account id
    currentUserId: '',
    tokenExpirationInMinutes : 5,
    startMessagingConversationButtonId: 'start_lp_conversation',
    logoutButtonId: 'logout_and_clear_history',
    pushToken:null,
    sdkInitialised:false,
    displayPushMessage:false
  },
    // Application Constructor
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

  },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
  onDeviceReady: function() {
    console.log('@@@ js ... console.log works well');
    if (window.cordova.logger) {
      window.cordova.logger.__onDeviceReady();
    }
    this.receivedEvent('deviceready');
        // initialise LP Messaging SDK here
    app.lpMessagingSdkInit();

        // setup click event listener for start messaging button example
    var push = PushNotification.init({
      android: {},
      ios: {
        alert: 'true',
        badge: 'true',
        sound: 'true'
      }
    });

    push.on('registration', function(data) {
            // data.registrationId
            console.log('@@@ pushNotification plugin registrationId ...' + data.registrationId);
        app.settings.pushToken = data.registrationId;
            console.log('@@@ push app.settings.pushToken ...' + app.settings.pushToken);
        app.registerDeviceForPushNotifications();
    });

    push.on('error', function(e) {
            // e.message
      console.log('@@@ pushNotification plugin error ...' + e.message);
    });

    push.on('notification', function(data) {
      console.log('@@@ pushNotification on.notification ...' + data);
      console.log('@@@ pushNotification on.notification data.stringify ...' + JSON.stringify(data));
//
//      alert('New Message from Agent! ...' + data.message);
        lpMessagingSDK.lp_conversation_api(
                'handle_push_message', [data,app.settings.displayPushMessage],
                function(data) {
                  var eventData = JSON.parse(data);
                  console.log('@@@ js ... unique handle_push_message SDK callback ..' + data);
                },
                function(data) {
                  var eventData = JSON.parse(data);
                  console.log('@@@ js ... unique handle_push_message SDK error callback ...' + data);
                }
            );

    });

    console.log('@@@ js ... onDeviceReady completed');
  },
  registerDeviceForPushNotifications: function() {
     var waitForSdkInit = setInterval(function(){

        if(app.settings.pushToken && app.settings.sdkInitialised) {
            clearInterval(waitForSdkInit);
            console.log('@@@  ------- SDK READY -----  app.settings.pushToken has value ...app.settings.sdkInitialised = true ... calling register pusher!');
            lpMessagingSDK.lp_conversation_api(
                'register_pusher',
                [
                    app.settings.accountId,
                    app.settings.pushToken,
                    app.settings.displayPushMessage
                ],
                function(data) {
                  var eventData = JSON.parse(data);
                  console.log('@@@ js ... unique register_pusher SDK callback ..' + data);
                },
                function(data) {
                  var eventData = JSON.parse(data);
                  console.log('@@@ js ... unique register_pusher SDK error callback ...' + data);
                }
            );
        } else {
           console.log('@@@ [!] app.settings.sdkInitialised == false and pushToken not yet set');

        }

      });
  },
    // Update DOM on a Received Event
  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');
    console.log('receivedElement', receivedElement);
    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    var buttonElement = document.getElementById(this.settings.startMessagingConversationButtonId);
    buttonElement.addEventListener('click', this.lpStartMessagingConversation.bind(this, 'demo-user-id-1'), false);


  },
  clearDeviceHistoryAndLogout: function() {
    console.log('@@@ clearDeviceHistoryAndLogout ***');
    lpMessagingSDK.lp_conversation_api(
            'lp_clear_history_and_logout', [app.settings.accountId],
            function(data) {
                var eventData = JSON.parse(data);
                console.log('@@@ js ... unique clearDeviceHistoryAndLogout SDK callback ...data => ' + data);
                console.log('@@@ js ... post logout...now auto reinitialise the SDK for next user to save button press in demo!');
                app.settings.sdkInitialised = false;
                //              registerDeviceForPushNotifications
                app.lpMessagingSdkInit();
                // wait for app.settings.sdkInitialised = true; before recalling registerforpush
                var waitForSdkReInit = setInterval(function(){
                    if(app.settings.sdkInitialised) {
                        clearInterval(waitForSdkReInit);
                        app.registerDeviceForPushNotifications();
                    } else {
                        console.log('@@@ js ... lp_clear_history_and_logout success callback...waiting for app.settings.sdkInitialised = true');
                    }
                },500);
            },
            function(data) {
              var eventData = JSON.parse(data);
              app.settings.sdkInitialised = false;
              console.log('@@@ js ... unique clearDeviceHistoryAndLogout SDK error callback ...data => ' + data);
            }
        );

  },
  globalAsyncEventsSuccessCallback: function(data) {
    var eventData = JSON.parse(data);
    console.log(
            '@@@ globalAsyncEventsSuccessCallback --> ' + data
        );
    if (eventData.eventName == 'LPMessagingSDKTokenExpired') {
      console.log('@@@ authenticated token has expired...refreshing...');
      app.lpGenerateNewAuthenticationToken();
    }

    if (eventData.eventName == 'LPNumberOfUnreadMessagesUpdated') {
      console.log('@@@ LPNumberOfUnreadMessagesUpdated...');
      var numUnreadMessages = eventData.numberOfUnreadMessages;
      var containerUnreadMessages = document.getElementById('numberOfUnreadMessages');
      containerUnreadMessages.innerHTML = numUnreadMessages;
      // display badge!
    }


  },
  globalAsyncEventsErrorCallback: function(data) {
    var eventData = JSON.parse(data);
    console.log(
            '@@@ globalAsyncEventsErrorCallback --> ' + data
        );

    if(eventData.eventName == 'subscribeLogEvents') {
    //close_conversation_screen
      console.log('subscribeLogEvents');
      console.log(eventData);
    }

  },
  lpGenerateNewAuthenticationToken: function() {

    var data = 'sub='+app.settings.currentUserId+'&exp='+app.settings.tokenExpirationInMinutes;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener('readystatechange', function () {
      if (this.readyState === 4) {
        console.log(this.responseText);
        var response = JSON.parse(this.responseText);
        var token = response.jwt || null;
        console.log(token);
        lpMessagingSDK.lp_conversation_api(
          'reconnect_with_new_token', [token],
          function (data) {
            var eventData = JSON.parse(data);
            console.log('@@@ js ... unique reconnect_with_new_token SDK callback');
          },
          function (data) {
            var eventData = JSON.parse(data);
            console.log('@@@ js ... unique reconnect_with_new_token SDK error callback');
          }
        );
      }
    });

    xhr.open('POST', 'https://liveperson-jwt-generator.herokuapp.com/api/token/');
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('cache-control', 'no-cache');
    xhr.setRequestHeader('postman-token', 'ab37b912-cb73-9b5f-548d-19a567cc9b71');

    xhr.send(data);


  },
  lpMessagingSdkInit: function() {
        // lp_sdk_init
    lpMessagingSDK.lp_conversation_api(
        'lp_sdk_init',
        [app.settings.accountId],
        function(data) {
          var eventData = JSON.parse(data);
          console.log('@@@ js ... unique lp_sdk_init SDK callback');
          app.settings.sdkInitialised = true;
        },
        function(data) {
          var eventData = JSON.parse(data);
          app.settings.sdkInitialised = false;
          console.log('@@@ js ... unique lp_sdk_init SDK error callback');
        }
    );
    lpMessagingSDK.lp_register_event_callback(
        [this.settings.accountId],
        this.globalAsyncEventsSuccessCallback,
        this.globalAsyncEventsErrorCallback
    );


    lpMessagingSDK.lp_conversation_api(
      'set_lp_user_profile',
      [
        this.settings.accountId,
        'John',
        'Doe',
        'NickName:JD',
        'https://s-media-cache-ak0.pinimg.com/564x/a2/c7/ee/a2c7ee8982de3bae503a730fe4562cf9.jpg',
        'tel:555-444-12345',
        'uid_5678',
        'employeeId_1234'
      ],
      function(data) {
        var eventData = JSON.parse(data);
        console.log('@@@ js ... unique set_lp_user_profile SDK callback');
      },
      function(data) {
        var eventData = JSON.parse(data);
        console.log('@@@ js ... unique set_lp_user_profile SDK error callback');
      }
    );

    console.log('@@@ js lpMessagingSdkInit completed -- ' + this.settings.accountId);
  },
  lpStartMessagingConversation: function(customerId) {
    app.settings.currentUserId = customerId;
    var data = 'sub='+app.settings.currentUserId+'&exp='+app.settings.tokenExpirationInMinutes;
    console.log(data);
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener('readystatechange', function () {
       console.log('readyStateChange');
       console.log(this.readyState);
      if (this.readyState === 4) {
        var response = JSON.parse(this.responseText||"");
        var token = response.jwt || null;
        console.log(token);
        if(token) {
            lpMessagingSDK.lp_conversation_api(
                  'start_lp_conversation', [
                    app.settings.accountId,
                    token
                  ],
                  function (data) {
                    var eventData = JSON.parse(data);
                    console.log('@@@ js ... unique start_lp_conversation SDK callback');
                  },
                  function (data) {
                    var eventData = JSON.parse(data);
                    console.log('@@@ js ... unique start_lp_conversation SDK error callback');
                  }
                );
        } else {
            console.log("@@@ ERROR with JWT generator -- token is null! "+data);
        }

      }
    });

    xhr.open('POST', 'https://liveperson-jwt-generator.herokuapp.com/api/token/');
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('cache-control', 'no-cache');
    xhr.setRequestHeader('postman-token', 'ab37b912-cb73-9b5f-548d-19a567cc9b71');

    xhr.send(data);

  }
};

app.initialize();
