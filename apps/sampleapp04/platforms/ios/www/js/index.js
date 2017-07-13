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
    currentUserId: '',
    tokenExpirationInMinutes : 1,
    startMessagingConversationButtonId: 'start_lp_conversation',
    logoutButtonId: 'logout_and_clear_history'
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
    this.lpMessagingSdkInit();

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

      lpMessagingSDK.lp_conversation_api(
                'register_pusher', [app.settings.accountId, data.registrationId],
                function(data) {
                  var eventData = JSON.parse(data);
                  console.log('@@@ js ... unique register_pusher SDK callback ..' + data);
                },
                function(data) {
                  var eventData = JSON.parse(data);
                  console.log('@@@ js ... unique register_pusher SDK error callback ...' + data);
                }
            );


    });

    push.on('error', function(e) {
            // e.message
      console.log('@@@ pushNotification plugin error ...' + e.message);
    });


    push.on('notification', function(data) {
      console.log('@@@ pushNotification on.notification ...' + data.message);
      alert('New Message from Agent! ...' + data.message);
    });

    console.log('@@@ js ... onDeviceReady completed');
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
    buttonElement.addEventListener('click', this.lpStartMessagingConversation.bind(this, 'auth-user-id-1'), false);


    var buttonElement2 = document.getElementById('start_lp_conversation_2nd_user');
    buttonElement2.addEventListener('click', this.lpStartMessagingConversation.bind(this, 'auth-user-id-2'), false);
      
    var buttonElement3 = document.getElementById('start_lp_conversation_3rd_user');
    buttonElement3.addEventListener('click', this.lpStartMessagingConversation.bind(this, 'unauth'), false);


    var logoutElement = document.getElementById(this.settings.logoutButtonId);
    logoutElement.addEventListener('click', this.clearDeviceHistoryAndLogout.bind(this), false);

  },
  clearDeviceHistoryAndLogout: function() {
    console.log('@@@ clearDeviceHistoryAndLogout ***');
    lpMessagingSDK.lp_conversation_api(
            'lp_clear_history_and_logout', [app.settings.accountId],
            function(data) {
              var eventData = JSON.parse(data);
              console.log('@@@ js ... unique clearDeviceHistoryAndLogout SDK callback ...data => ' + data);
              console.log('@@@ js ... post logout...now auto reinitialise the SDK for next user to save button press in demo!');
              app.lpMessagingSdkInit();

            },
            function(data) {
              var eventData = JSON.parse(data);
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

    xhr.open('POST', 'http://liveperson-jwt-generator.herokuapp.com/api/token/');
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('cache-control', 'no-cache');
    xhr.setRequestHeader('postman-token', 'ab37b912-cb73-9b5f-548d-19a567cc9b71');

    xhr.send(data);
    
    
  },
  lpMessagingSdkInit: function() {
        // lp_sdk_init
    lpMessagingSDK.lp_conversation_api(
        'lp_sdk_init', 
        [this.settings.accountId],
        function(data) {
          var eventData = JSON.parse(data);
          console.log('@@@ js ... unique lp_sdk_init SDK callback');
        },
        function(data) {
          var eventData = JSON.parse(data);
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
    
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    
    xhr.addEventListener('readystatechange', function () {
      if (this.readyState === 4) {
        console.log(this.responseText);
        var response = JSON.parse(this.responseText);
        var token = response.jwt || null;
        console.log(token);
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
      }
    });
    
    xhr.open('POST', 'http://liveperson-jwt-generator.herokuapp.com/api/token/');
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('cache-control', 'no-cache');
    xhr.setRequestHeader('postman-token', 'ab37b912-cb73-9b5f-548d-19a567cc9b71');
    
    xhr.send(data);

  }
};

app.initialize();
