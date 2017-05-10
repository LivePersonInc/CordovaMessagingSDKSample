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
accountId: "90233546", // replace with your account id
startMessagingConversationButtonId: "start_lp_conversation",
logoutButtonId: "logout_and_clear_history"
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
    console.log("@@@ js ... console.log works well");
    if (window.cordova.logger) {
        window.cordova.logger.__onDeviceReady();
    }
    this.receivedEvent('deviceready');
    // initialise LP Messaging SDK here
    this.lpMessagingSdkInit();
    
    // setup click event listener for start messaging button example
    var push = PushNotification.init({
                                     android: {
                                     },
                                     ios: {
                                     alert: "true",
                                     badge: "true",
                                     sound: "true"
                                     }
                                     });
    
    push.on('registration', function(data) {
            // data.registrationId
            console.log('@@@ pushNotification plugin registrationId ...'+data.registrationId);
            
            lpMessagingSDK.lp_conversation_api(
                                               "register_pusher", [app.settings.accountId,data.registrationId],
                                               function(data) {
                                               var eventData = JSON.parse(data);
                                               console.log("@@@ js ... unique register_pusher SDK callback .."+data);
                                               },
                                               function(data) {
                                               var eventData = JSON.parse(data);
                                               console.log("@@@ js ... unique register_pusher SDK error callback ..."+data);
                                               }
                                               );
            
            
            });
    
    push.on('error', function(e) {
            // e.message
            console.log('@@@ pushNotification plugin error ...'+e.message);
            });
    
    
    push.on('notification', function(data) {
            console.log('@@@ pushNotification on.notification ...'+data.message);
            alert('New Message from Agent! ...'+data.message);
            //        	console.log('@@@ pushNotification on.notification ...'+data.title);
            //        	console.log('@@@ pushNotification on.notification ...'+data.count);
            //        	console.log('@@@ pushNotification on.notification ...'+data.sound);
            //        	console.log('@@@ pushNotification on.notification ...'+data.image);
            console.log('@@@ pushNotification on.notification ...'+data.additionalData);
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
    buttonElement.addEventListener("click", this.lpStartMessagingConversation.bind(this, 'jwt1'), false);
    
    
    var buttonElement2 = document.getElementById("start_lp_conversation_2nd_user");
    buttonElement2.addEventListener("click", this.lpStartMessagingConversation.bind(this, 'jwt2'), false);
    
    //        var buttonElement3 = document.getElementById("init_lp_sdk");
    //        buttonElement3.addEventListener("click",this.lpMessagingSdkInit.bind(this),false);
    
    
    var logoutElement = document.getElementById(this.settings.logoutButtonId);
    logoutElement.addEventListener("click", this.clearDeviceHistoryAndLogout.bind(this), false);
    
},
clearDeviceHistoryAndLogout: function() {
    console.log("@@@ clearDeviceHistoryAndLogout ***");
    lpMessagingSDK.lp_conversation_api(
                                       "lp_clear_history_and_logout", [this.settings.accountId],
                                       function(data) {
                                       var eventData = JSON.parse(data);
                                       console.log("@@@ js ... unique clearDeviceHistoryAndLogout SDK callback ...data => "+data);
                                       console.log("@@@ js ... post logout...now auto reinitialise the SDK for next user to save button press in demo!");
                                       app.lpMessagingSdkInit();
                                       
                                       },
                                       function(data) {
                                       var eventData = JSON.parse(data);
                                       console.log("@@@ js ... unique clearDeviceHistoryAndLogout SDK error callback ...data => "+data);
                                       }
                                       );
    
},
successCallback: function(data) {
    
    console.log("@@@ successCallback fired! " + data);
    
    var eventData = JSON.parse(data);
    
    if (eventData.eventName == "LPMessagingSDKConnectionStateChanged") {
        console.log("@@@ ************************************* LPMessagingSDKConnectionStateChanged callback fired! ", eventData.isReady)
    }
    
    if (eventData.eventName == 'LPMessagingSDKTokenExpired') {
        console.log("@@@ authenticated token has expired...refreshing...");
        this.lpGenerateNewAuthenticationToken();
    }
    
    console.log('@@@ successCallback fired ' + eventData.eventName);
    
},
globalAsyncEventsSuccessCallback: function(data) {
    var eventData = JSON.parse(data);
    console.log(
                '@@@ globalAsyncEventsSuccessCallback --> ' + data
                );
    if (eventData.eventName == 'LPMessagingSDKTokenExpired') {
        console.log("@@@ authenticated token has expired...refreshing...");
        app.lpGenerateNewAuthenticationToken();
    }
},
globalAsyncEventsErrorCallback: function(data) {
    var eventData = JSON.parse(data);
    console.log(
                '@@@ globalAsyncEventsErrorCallback --> ' + data
                );
},
lpGenerateNewAuthenticationToken: function() {
    // code to generate new fresh JWT would go here...
    // TODO -- implement auth0 API call for refresh token via AJAX/jQuery etc to get a new token
    var jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJSQlMtMTIzLTQ1Ni03ODktMDEyIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE1MTQ3MTg2NzEwMDAsImlhdCI6MTQ4NzE1OTMzNzAwMCwicGhvbmVfbnVtYmVyIjoiKzEtMTAtMzQ0LTM3NjUzMzMiLCJscF9zZGVzIjpbeyJ0eXBlIjoiY3RtcmluZm8iLCJpbmZvIjp7ImNzdGF0dXMiOiJjYW5jZWxsZWQiLCJjdHlwZSI6InZpcCIsImN1c3RvbWVySWQiOiIxMzg3NjZBQyIsImJhbGFuY2UiOi00MDAuOTksInNvY2lhbElkIjoiMTEyNTYzMjQ3ODAiLCJpbWVpIjoiMzU0MzU0NjU0MzU0NTY4OCIsInVzZXJOYW1lIjoidXNlcjAwMCIsImNvbXBhbnlTaXplIjo1MDAsImFjY291bnROYW1lIjoiYmFuayBjb3JwIiwicm9sZSI6ImJyb2tlciIsImxhc3RQYXltZW50RGF0ZSI6eyJkYXkiOjE1LCJtb250aCI6MTAsInllYXIiOjIwMTR9LCJyZWdpc3RyYXRpb25EYXRlIjp7ImRheSI6MjMsIm1vbnRoIjo1LCJ5ZWFyIjoyMDEzfX19LHsidHlwZSI6InBlcnNvbmFsIiwicGVyc29uYWwiOnsiZmlyc3RuYW1lIjoiSm9objk5IiwibGFzdG5hbWUiOiJCZWFkbGU5OSIsImFnZSI6eyJhZ2UiOjM0LCJ5ZWFyIjoxOTgwLCJtb250aCI6NCwiZGF5IjoxNX0sImNvbnRhY3RzIjpbeyJlbWFpbCI6ImpiZWFkbGU5OUBsaXZlcGVyc29uLmNvbSIsInBob25lIjoiKzEgMjEyLTc4OC04ODc3In1dLCJnZW5kZXIiOiJNQUxFIn19XX0.vZeZf8vGG1T2vYV7ysOCU6Y8cocuvWJ-SJOeTly_KS2Dy0d-uNJuxRdCuxpaXk_9hys79IrKWhsl-y3K7gyM7mdr1v2WXoBWYYGohtAkPJqj67bvsG3OKLEKI_rFIm8M2Jqj1lCv_31akNRfYfvpMxh6n-PC__aUSPrj5FyDYtih0sewHqFS_rDg4SEpE5eP45QkleY0hfUBePTF5eKmF4FLnJNGbhyjOf8rsIWyhVLY8dEUyilB0XjSkkAvkRHBMUPdTVHU3IE5Yz9QgnZmEr7AQAf83mBEAzQUyturmBVfKajfEJ5GYaVaql5STdvRfTfvX73swu3r3ueKMoDHaw";
    lpMessagingSDK.lp_conversation_api(
                                       "reconnect_with_new_token", [jwt],
                                       function(data) {
                                       var eventData = JSON.parse(data);
                                       console.log("@@@ js ... unique reconnect_with_new_token SDK callback");
                                       },
                                       function(data) {
                                       var eventData = JSON.parse(data);
                                       console.log("@@@ js ... unique reconnect_with_new_token SDK error callback");
                                       }
                                       );
    console.log('lpGenerateNewAuthenticationToken completed --> new jwt -->  ', jwt);
},
lpMessagingSdkInit: function() {
    // lp_sdk_init
    
    var brandingOptions = {
        "remoteUserBubbleBackgroundColor": "purple",
        "remoteUserBubbleBorderColor": "purple",
        "remoteUserBubbleTextColor": "white",
        "brandName": "TalkTalk"
    };
    
    var windowOptions = {
        "useCustomViewController": "true"
    };
    
    var sdkConfig = {
        "branding": brandingOptions,
        "window": windowOptions
    };
    //here2
    lpMessagingSDK.lp_conversation_api(
                                       "lp_sdk_init", [this.settings.accountId, sdkConfig],
                                       function(data) {
                                       var eventData = JSON.parse(data);
                                       console.log("@@@ js ... unique lp_sdk_init SDK callback");
                                       },
                                       function(data) {
                                       var eventData = JSON.parse(data);
                                       console.log("@@@ js ... unique lp_sdk_init SDK error callback");
                                       }
                                       );
    
    lpMessagingSDK.lp_conversation_api(
                                       "set_lp_user_profile", [
                                                               this.settings.accountId,
                                                               "John",
                                                               "Doe",
                                                               "NickName:JD",
                                                               "https://s-media-cache-ak0.pinimg.com/564x/a2/c7/ee/a2c7ee8982de3bae503a730fe4562cf9.jpg",
                                                               "tel:555-444-12345",
                                                               "uid_5678",
                                                               "employeeId_1234"
                                                               ],
                                       function(data) {
                                       var eventData = JSON.parse(data);
                                       console.log("@@@ js ... unique set_lp_user_profile SDK callback");
                                       },
                                       function(data) {
                                       var eventData = JSON.parse(data);
                                       console.log("@@@ js ... unique set_lp_user_profile SDK error callback");
                                       }
                                       );
    
    
    lpMessagingSDK.lp_register_event_callback(
                                              [this.settings.accountId],
                                              this.globalAsyncEventsSuccessCallback,
                                              this.globalAsyncEventsErrorCallback
                                              );
    
    console.log('@@@ js lpMessagingSdkInit completed -- '+ this.settings.accountId);
},
lpStartMessagingConversation: function(customerId) {
    
    // HERE is where you would write your code to call your IDP and return your JWT token for an authenticated customer
    // in this sample app the token is hardcoded for this specific account.
    console.log('lpStartMessagingConversation customerId ' + customerId);
    // sub TALKTALK-04-APR-2017-1120
    var JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy0wNC1BUFItMjAxNy0xMTIwIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE0OTEzMDUxMDAwMDAsImlhdCI6MTQ4NzE1OTMzNzAwMCwicGhvbmVfbnVtYmVyIjoiKzEtMTAtMzQ0LTM3NjUzMzMiLCJscF9zZGVzIjpbeyJ0eXBlIjoiY3RtcmluZm8iLCJpbmZvIjp7ImNzdGF0dXMiOiJjYW5jZWxsZWQiLCJjdHlwZSI6InZpcCIsImN1c3RvbWVySWQiOiJUQUxLVEFMSy0wNC1BUFItMjAxNy0xMTIwIiwiYmFsYW5jZSI6LTQwMC45OSwic29jaWFsSWQiOiIxMTI1NjMyNDc4MCIsImltZWkiOiIzNTQzNTQ2NTQzNTQ1Njg4IiwidXNlck5hbWUiOiJ1c2VyMDAwIiwiY29tcGFueVNpemUiOjUwMCwiYWNjb3VudE5hbWUiOiJiYW5rIGNvcnAiLCJyb2xlIjoiYnJva2VyIiwibGFzdFBheW1lbnREYXRlIjp7ImRheSI6MTUsIm1vbnRoIjoxMCwieWVhciI6MjAxNH0sInJlZ2lzdHJhdGlvbkRhdGUiOnsiZGF5IjoyMywibW9udGgiOjUsInllYXIiOjIwMTN9fX0seyJ0eXBlIjoicGVyc29uYWwiLCJwZXJzb25hbCI6eyJmaXJzdG5hbWUiOiJKb2huOTkiLCJsYXN0bmFtZSI6IkJlYWRsZTk5IiwiYWdlIjp7ImFnZSI6MzQsInllYXIiOjE5ODAsIm1vbnRoIjo0LCJkYXkiOjE1fSwiY29udGFjdHMiOlt7ImVtYWlsIjoiamJlYWRsZTk5QGxpdmVwZXJzb24uY29tIiwicGhvbmUiOiIrMSAyMTItNzg4LTg4NzcifV0sImdlbmRlciI6Ik1BTEUifX1dfQ.LlClhbOSl1SP2eNfxmeNHP4WEQytOG4hmXu2hSgQlWFUOvZ3hLDu6KzPiNq-tvN4gZ_a2xVrXMxVqvQa-gp2Bc8ZtMSo91HJi39AiAgbO7ETKZ8xbBkwKhs6DeWdhXyb5WHHwjnAN8ba_vWeKkQ3yHJ7bvi9W-q2LjfymATu6a4";
    
    // sub TALKTALK-12-APR-2017-2000
    //        var JWT2 = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy0xMi1BUFItMjAxNy0yMDAwIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE0OTEzMDUxMDAsImlhdCI6MTQ4NzE1OTMzNywibHBfc2RlcyI6W3sidHlwZSI6ImN0bXJpbmZvIiwiaW5mbyI6eyJjc3RhdHVzIjoibmV3IiwiY3R5cGUiOiJ2aXAiLCJjdXN0b21lcklkIjoiVEFMS1RBTEstMTItQVBSLTIwMTctMjAwMCIsImJhbGFuY2UiOjU1NS43Nywic29jaWFsSWQiOiI0ODQ4ODQ4NDg0IiwiaW1laSI6Ijk4NzEzMTU0ODc4Nzg0OSIsInVzZXJOYW1lIjoidXNlcjA1MiIsImNvbXBhbnlTaXplIjoxMDAsImFjY291bnROYW1lIjoidGFsa3RhbGsiLCJyb2xlIjoiY3VzdG9tZXIiLCJsYXN0UGF5bWVudERhdGUiOnsiZGF5IjoxNSwibW9udGgiOjMsInllYXIiOjIwMTd9LCJyZWdpc3RyYXRpb25EYXRlIjp7ImRheSI6MjMsIm1vbnRoIjo1LCJ5ZWFyIjoyMDEzfX19XX0.l1kKa8alysf3bcdykB3VNF7nViNrnqs8snOGBra6JDRn8Pc3r5y-fPlfeeK-l2Zo63x9WiK8gLfsvKtyqoxRcrL6YDxZw6uWQs-A3VDVdB5Yr6pZ3pDt2Bk1A5teBCebey-UYZ6aD-rzENV_rgCaBK1PCJyHOUBnQwl7m3Rtu5w";
    
    // sub TALKTALK-12-APR-2017-2023
    
    var JWT2 = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy0xMi1BUFItMjAxNy0yMTAwIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE0OTI2ODY2NzEsImlhdCI6MTQ4NzE1OTMzNywibHBfc2RlcyI6W3sidHlwZSI6ImN0bXJpbmZvIiwiaW5mbyI6eyJjc3RhdHVzIjoibmV3IiwiY3R5cGUiOiJ2aXAiLCJjdXN0b21lcklkIjoiVEFMS1RBTEstMTItQVBSLTIwMTctMjEwMCJ9fSx7InR5cGUiOiJwZXJzb25hbCIsInBlcnNvbmFsIjp7ImFnZSI6eyJhZ2UiOjM0LCJ5ZWFyIjoxOTgwLCJtb250aCI6NCwiZGF5IjoxNX0sImNvbnRhY3RzIjpbeyJlbWFpbCI6ImJvYkB0YWxrdGFsay5jby51ayJ9XSwiZ2VuZGVyIjoiTUFMRSJ9fV19.k5vGW5MKK5l201WQHDf4m-wYErLpWz4GSLEHbAGYpvnRwTDmeQU877u66XIVyeQ9OqQxQ7rA_uBXf-Lbu0kcVl2__3PVJjJlIPV3uWtpo-novLhaPWbInoINpRMB1x8RzDlEAmHECT4otGHIVdaAuAMF-cGP5wRoIoThuBlvDB0";
    
    lpMessagingSDK.lp_conversation_api(
                                       "start_lp_conversation", [
                                                                 this.settings.accountId,
                                                                 customerId == "jwt1" ? JWT : JWT2
                                                                 ],
                                       function(data) {
                                       var eventData = JSON.parse(data);
                                       console.log("@@@ js ... unique start_lp_conversation SDK callback");
                                       },
                                       function(data) {
                                       var eventData = JSON.parse(data);
                                       console.log("@@@ js ... unique start_lp_conversation SDK error callback");
                                       }
                                       );
    
    console.log('lpStartMessagingConversation completed ', JWT);
}
};

app.initialize();
