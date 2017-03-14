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
        startMessagingConversationButtonId: "start_lp_conversation"
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
        console.log("console.log works well");
        if (window.cordova.logger) {
            window.cordova.logger.__onDeviceReady();
        }
        this.receivedEvent('deviceready');
        // initialise LP Messaging SDK here
        app.lpMessagingSdkInit();

        // setup click event listener for start messaging button example


        console.log('onDeviceReady completed');
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
        buttonElement.addEventListener("click", this.lpStartMessagingConversation.bind(this), false);
        console.log('Received Event: ' + id);
    },
    successCallback: function(eventName, eventData) {
        console.log(
            "successCallback fired! ",
            eventName,
            eventData
        );
    },
    errorCallback: function(eventName, eventData) {
        console.log(
            "errorCallback fired! ",
            eventName,
            eventData
        );
    },
    lpMessagingSdkInit: function() {
        // lp_sdk_init
        lpMessagingSDK.lp_conversation_api(
            "lp_sdk_init", [this.settings.accountId],
            this.successCallback,
            this.errorCallback
        );
        console.log('lpMessagingSdkInit completed -- ', this.settings.accountId);
    },
    lpStartMessagingConversation: function() {

        // HERE is where you would write your code to call your IDP and return your JWT token for an authenticated customer
        // in this sample app the token is hardcoded for this specific account.

        var JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJSQlMtMTIzLTQ1Ni03ODktMDEyIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE1MTQ3MTg2NzEwMDAsImlhdCI6MTQ4NzE1OTMzNzAwMCwicGhvbmVfbnVtYmVyIjoiKzEtMTAtMzQ0LTM3NjUzMzMiLCJscF9zZGVzIjpbeyJ0eXBlIjoiY3RtcmluZm8iLCJpbmZvIjp7ImNzdGF0dXMiOiJjYW5jZWxsZWQiLCJjdHlwZSI6InZpcCIsImN1c3RvbWVySWQiOiIxMzg3NjZBQyIsImJhbGFuY2UiOi00MDAuOTksInNvY2lhbElkIjoiMTEyNTYzMjQ3ODAiLCJpbWVpIjoiMzU0MzU0NjU0MzU0NTY4OCIsInVzZXJOYW1lIjoidXNlcjAwMCIsImNvbXBhbnlTaXplIjo1MDAsImFjY291bnROYW1lIjoiYmFuayBjb3JwIiwicm9sZSI6ImJyb2tlciIsImxhc3RQYXltZW50RGF0ZSI6eyJkYXkiOjE1LCJtb250aCI6MTAsInllYXIiOjIwMTR9LCJyZWdpc3RyYXRpb25EYXRlIjp7ImRheSI6MjMsIm1vbnRoIjo1LCJ5ZWFyIjoyMDEzfX19LHsidHlwZSI6InBlcnNvbmFsIiwicGVyc29uYWwiOnsiZmlyc3RuYW1lIjoiSm9objk5IiwibGFzdG5hbWUiOiJCZWFkbGU5OSIsImFnZSI6eyJhZ2UiOjM0LCJ5ZWFyIjoxOTgwLCJtb250aCI6NCwiZGF5IjoxNX0sImNvbnRhY3RzIjpbeyJlbWFpbCI6ImpiZWFkbGU5OUBsaXZlcGVyc29uLmNvbSIsInBob25lIjoiKzEgMjEyLTc4OC04ODc3In1dLCJnZW5kZXIiOiJNQUxFIn19XX0.vZeZf8vGG1T2vYV7ysOCU6Y8cocuvWJ-SJOeTly_KS2Dy0d-uNJuxRdCuxpaXk_9hys79IrKWhsl-y3K7gyM7mdr1v2WXoBWYYGohtAkPJqj67bvsG3OKLEKI_rFIm8M2Jqj1lCv_31akNRfYfvpMxh6n-PC__aUSPrj5FyDYtih0sewHqFS_rDg4SEpE5eP45QkleY0hfUBePTF5eKmF4FLnJNGbhyjOf8rsIWyhVLY8dEUyilB0XjSkkAvkRHBMUPdTVHU3IE5Yz9QgnZmEr7AQAf83mBEAzQUyturmBVfKajfEJ5GYaVaql5STdvRfTfvX73swu3r3ueKMoDHaw";

        lpMessagingSDK.lp_conversation_api(
            "start_lp_conversation", [
                this.settings.accountId,
                JWT
            ],
            this.successCallback,
            this.errorCallback
        );

        console.log('lpStartMessagingConversation completed ', JWT);
    }
};

app.initialize();