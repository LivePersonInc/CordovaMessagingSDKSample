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
//      accountId: '33884409',
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
            //        	console.log('@@@ pushNotification on.notification ...'+data.title);
            //        	console.log('@@@ pushNotification on.notification ...'+data.count);
            //        	console.log('@@@ pushNotification on.notification ...'+data.sound);
            //        	console.log('@@@ pushNotification on.notification ...'+data.image);
      console.log('@@@ pushNotification on.notification ...' + data.additionalData);
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
    buttonElement.addEventListener('click', this.lpStartMessagingConversation.bind(this, 'jwt1'), false);


    var buttonElement2 = document.getElementById('start_lp_conversation_2nd_user');
    buttonElement2.addEventListener('click', this.lpStartMessagingConversation.bind(this, 'jwt2'), false);
      
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
      lpMessagingSDK.lp_conversation_api(
        'close_conversation_screen', [],
        function(data) {
          var eventData = JSON.parse(data);
          console.log('@@@ js ... close_conversation_screen callback');
        },
        function(data) {
          var eventData = JSON.parse(data);
          console.log('@@@ js ... close_conversation_screen error callback');
        }
      );
    }  
    
  },
  lpGenerateNewAuthenticationToken: function() {
        // code to generate new fresh JWT would go here...
        // TODO -- implement auth0 API call for refresh token via AJAX/jQuery etc to get a new token
    var jwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy0wNC1BUFItMjAxNy0xMTIwIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE1MDA1NDU0MTEsImlhdCI6MTQ4NzE1OTMzNywicGhvbmVfbnVtYmVyIjoiKzEtMTAtMzQ0LTM3NjUzMzMiLCJscF9zZGVzIjpbeyJ0eXBlIjoiY3RtcmluZm8iLCJpbmZvIjp7ImNzdGF0dXMiOiJjYW5jZWxsZWQiLCJjdHlwZSI6InZpcCIsImN1c3RvbWVySWQiOiJUQUxLVEFMSy0wNC1BUFItMjAxNy0xMTIwIiwiYmFsYW5jZSI6LTQwMC45OSwic29jaWFsSWQiOiIxMTI1NjMyNDc4MCIsImltZWkiOiIzNTQzNTQ2NTQzNTQ1Njg4IiwidXNlck5hbWUiOiJ1c2VyMDAwIiwiY29tcGFueVNpemUiOjUwMCwiYWNjb3VudE5hbWUiOiJiYW5rIGNvcnAiLCJyb2xlIjoiYnJva2VyIiwibGFzdFBheW1lbnREYXRlIjp7ImRheSI6MTUsIm1vbnRoIjoxMCwieWVhciI6MjAxNH0sInJlZ2lzdHJhdGlvbkRhdGUiOnsiZGF5IjoyMywibW9udGgiOjUsInllYXIiOjIwMTN9fX0seyJ0eXBlIjoicGVyc29uYWwiLCJwZXJzb25hbCI6eyJmaXJzdG5hbWUiOiJKb2huOTkiLCJsYXN0bmFtZSI6IkJlYWRsZTk5IiwiYWdlIjp7ImFnZSI6MzQsInllYXIiOjE5ODAsIm1vbnRoIjo0LCJkYXkiOjE1fSwiY29udGFjdHMiOlt7ImVtYWlsIjoiamJlYWRsZTk5QGxpdmVwZXJzb24uY29tIiwicGhvbmUiOiIrMSAyMTItNzg4LTg4NzcifV0sImdlbmRlciI6Ik1BTEUifX1dfQ.QzGDcBnlHRNMVsSWpzKPcbIcv2OfgZO8dbv41OdwPUsFkMygYnxPusANIHOO4XisqB1DZ0M9xi7sXFOGAfkjin-kLLyWK9dgluZ5I4C9xXHeBGeoiasvFwbJFDmM4c7DH11PpspqMSkZj7QgJ4JS5A0Eka9-RAcVjCUqfd6gr8A';
    lpMessagingSDK.lp_conversation_api(
      'reconnect_with_new_token', 
      [jwt],
      function(data) {
        var eventData = JSON.parse(data);
        console.log('@@@ js ... unique reconnect_with_new_token SDK callback');
      },
      function(data) {
        var eventData = JSON.parse(data);
        console.log('@@@ js ... unique reconnect_with_new_token SDK error callback');
      }
    );
    console.log('lpGenerateNewAuthenticationToken completed --> new jwt -->  ', jwt);
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

        // HERE is where you would write your code to call your IDP and return your JWT token for an authenticated customer
        // in this sample app the token is hardcoded for this specific account.
    console.log('lpStartMessagingConversation customerId ' + customerId);
        // sub TALKTALK-04-APR-2017-1120
//      var JWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjE1YjVjMzAyYzk0MTY2YWM5MjViYTVlOWMyNTBlYmM3In0.eyJpc3MiOiJodHRwczpcL1wvd3d3LnRhbGt0YWxrLmNvLnVrIiwiZXhwIjoxNDk2MjQ0OTgyLCJpYXQiOjE0OTYyNDEzODIsInN1YiI6IjEtMDAwMDA1LTY3NDczNi0wIn0.qog0msKMeA8P4a2voTk2Hu79cU9dmaMz5iyWlK5GhGMP6Z2zm9-3oGnmHs8td2Z9J5b0p5aQTTkd7eeuv_kld5MDOLehGY17v0ZDu-uOqCL3INED_q0JiEBZjgZN7O9DFgbCBn4eo16H9jfIVdhgsG-qDVF7X7Aj_n64QZ2oX7lhsC_vq3TDgpItsIjOkKP4J_SkDL2pG6_36hTfj1CTrp_En9_W2-qTUpnm9LkPl458SgXId-Qkpax2H0HxnoFcgMpjh-a_DdbR5E7hAQz38DGM3SGwG_NnaFmEubMHkS370RyXiz-97TUHzOZ8bjNsfdA5Kuec4o2k3pPrbMXzfA';
      
    var JWT = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy0wNC1BUFItMjAxNy0xMTIwIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE0OTEzMDUxMDAwMDAsImlhdCI6MTQ4NzE1OTMzNzAwMCwicGhvbmVfbnVtYmVyIjoiKzEtMTAtMzQ0LTM3NjUzMzMiLCJscF9zZGVzIjpbeyJ0eXBlIjoiY3RtcmluZm8iLCJpbmZvIjp7ImNzdGF0dXMiOiJjYW5jZWxsZWQiLCJjdHlwZSI6InZpcCIsImN1c3RvbWVySWQiOiJUQUxLVEFMSy0wNC1BUFItMjAxNy0xMTIwIiwiYmFsYW5jZSI6LTQwMC45OSwic29jaWFsSWQiOiIxMTI1NjMyNDc4MCIsImltZWkiOiIzNTQzNTQ2NTQzNTQ1Njg4IiwidXNlck5hbWUiOiJ1c2VyMDAwIiwiY29tcGFueVNpemUiOjUwMCwiYWNjb3VudE5hbWUiOiJiYW5rIGNvcnAiLCJyb2xlIjoiYnJva2VyIiwibGFzdFBheW1lbnREYXRlIjp7ImRheSI6MTUsIm1vbnRoIjoxMCwieWVhciI6MjAxNH0sInJlZ2lzdHJhdGlvbkRhdGUiOnsiZGF5IjoyMywibW9udGgiOjUsInllYXIiOjIwMTN9fX0seyJ0eXBlIjoicGVyc29uYWwiLCJwZXJzb25hbCI6eyJmaXJzdG5hbWUiOiJKb2huOTkiLCJsYXN0bmFtZSI6IkJlYWRsZTk5IiwiYWdlIjp7ImFnZSI6MzQsInllYXIiOjE5ODAsIm1vbnRoIjo0LCJkYXkiOjE1fSwiY29udGFjdHMiOlt7ImVtYWlsIjoiamJlYWRsZTk5QGxpdmVwZXJzb24uY29tIiwicGhvbmUiOiIrMSAyMTItNzg4LTg4NzcifV0sImdlbmRlciI6Ik1BTEUifX1dfQ.LlClhbOSl1SP2eNfxmeNHP4WEQytOG4hmXu2hSgQlWFUOvZ3hLDu6KzPiNq-tvN4gZ_a2xVrXMxVqvQa-gp2Bc8ZtMSo91HJi39AiAgbO7ETKZ8xbBkwKhs6DeWdhXyb5WHHwjnAN8ba_vWeKkQ3yHJ7bvi9W-q2LjfymATu6a4';
      
      // sub TALKTALK-12-APR-2017-2000
      //        var JWT2 = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy0xMi1BUFItMjAxNy0yMDAwIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE0OTEzMDUxMDAsImlhdCI6MTQ4NzE1OTMzNywibHBfc2RlcyI6W3sidHlwZSI6ImN0bXJpbmZvIiwiaW5mbyI6eyJjc3RhdHVzIjoibmV3IiwiY3R5cGUiOiJ2aXAiLCJjdXN0b21lcklkIjoiVEFMS1RBTEstMTItQVBSLTIwMTctMjAwMCIsImJhbGFuY2UiOjU1NS43Nywic29jaWFsSWQiOiI0ODQ4ODQ4NDg0IiwiaW1laSI6Ijk4NzEzMTU0ODc4Nzg0OSIsInVzZXJOYW1lIjoidXNlcjA1MiIsImNvbXBhbnlTaXplIjoxMDAsImFjY291bnROYW1lIjoidGFsa3RhbGsiLCJyb2xlIjoiY3VzdG9tZXIiLCJsYXN0UGF5bWVudERhdGUiOnsiZGF5IjoxNSwibW9udGgiOjMsInllYXIiOjIwMTd9LCJyZWdpc3RyYXRpb25EYXRlIjp7ImRheSI6MjMsIm1vbnRoIjo1LCJ5ZWFyIjoyMDEzfX19XX0.l1kKa8alysf3bcdykB3VNF7nViNrnqs8snOGBra6JDRn8Pc3r5y-fPlfeeK-l2Zo63x9WiK8gLfsvKtyqoxRcrL6YDxZw6uWQs-A3VDVdB5Yr6pZ3pDt2Bk1A5teBCebey-UYZ6aD-rzENV_rgCaBK1PCJyHOUBnQwl7m3Rtu5w";
      
      // sub TALKTALK-12-APR-2017-2023
      
    var JWT2 = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy0yMS1BUFItMjAxNy0xNTEwIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE0OTMwNTYzOTksImlhdCI6MTQ4NzE1OTMzNywibHBfc2RlcyI6W3sidHlwZSI6ImN0bXJpbmZvIiwiaW5mbyI6eyJjc3RhdHVzIjoibmV3IiwiY3R5cGUiOiJ2aXAiLCJjdXN0b21lcklkIjoiVEFMS1RBTEstMTItQVBSLTIwMTctMjEwMCJ9fSx7InR5cGUiOiJwZXJzb25hbCIsInBlcnNvbmFsIjp7ImFnZSI6eyJhZ2UiOjM0LCJ5ZWFyIjoxOTgwLCJtb250aCI6NCwiZGF5IjoxNX0sImNvbnRhY3RzIjpbeyJlbWFpbCI6ImJvYkB0YWxrdGFsay5jby51ayJ9XSwiZ2VuZGVyIjoiTUFMRSJ9fV19.egy8ERyWCg_7yS_6QLE6YJfmrKbzcAlmMRuvqKKv9LxVRp9LRv8EqPJOgU4XD7lmsx_1XbpQFoj5sInrC8OdBcm-RVgaXJxO0vXhvsuAzlKl3sao147R51EzyT1yyE-3kx8lPpQTcvO1kQURPks9EZYqJQBT2PFPMsOV_yJYc_4';

    if(customerId == 'unauth') {
      var token = null;
    } else {
      var token = customerId == 'jwt1' ? JWT : JWT2;
    }
      
    console.log('@@@ js ... customer id and token values before start_lp_conversation :: ',customerId,token);
      
    lpMessagingSDK.lp_conversation_api(
        'start_lp_conversation', [
          this.settings.accountId,
          token
        ],
        function(data) {
          var eventData = JSON.parse(data);
          console.log('@@@ js ... unique start_lp_conversation SDK callback');
        },
        function(data) {
          var eventData = JSON.parse(data);
          console.log('@@@ js ... unique start_lp_conversation SDK error callback');
        }
    );

    console.log('lpStartMessagingConversation completed ', JWT);
  }
};

app.initialize();
