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
    successCallback: function(data) {
        var eventData = JSON.parse(data);
        console.log(
            " LPMessagingSDK ANDROID successCallback fired! "+eventData.eventName
        );

/       // onConversationResolved

        console.log(eventData.eventName);
        if (eventData.eventName == 'onTokenExpired') {
            console.log("authenticated token has expired...refreshing...");
            this.lpGenerateNewAuthenticationToken();
        }

        if (eventData.eventName == 'LPMessagingSDKConnectionStateChanged') {
            console.log("****** LPMessagingSDK ANDROID callback test --- LPMessagingSDKConnectionStateChanged.."+eventData.isReady);

        }


    },
    errorCallback: function(eventDescription) {
        console.log(
            "errorCallback fired! ",
            eventDescription
        );
    },
    lpGenerateNewAuthenticationToken: function() {
        // code to generate new fresh JWT would go here...
        // TODO -- implement auth0 API call for refresh token via AJAX/jQuery etc to get a new token
        var jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy1JRC0xMjM0NTY3ODkwIiwiaXNzIjoiaHR0cHM6Ly93d3cudGFsa3RhbGsuY28udWsiLCJleHAiOjE1MTQ3MTg2NzEwMDAsImlhdCI6MTQ4NzE1OTMzNzAwMCwicGhvbmVfbnVtYmVyIjoiKzEtMTAtMzQ0LTM3NjUzMzMiLCJscF9zZGVzIjpbeyJ0eXBlIjoiY3RtcmluZm8iLCJpbmZvIjp7ImNzdGF0dXMiOiJjYW5jZWxsZWQiLCJjdHlwZSI6InZpcCIsImN1c3RvbWVySWQiOiIxMzg3NjZBQyIsImJhbGFuY2UiOi00MDAuOTksInNvY2lhbElkIjoiMTEyNTYzMjQ3ODAiLCJpbWVpIjoiMzU0MzU0NjU0MzU0NTY4OCIsInVzZXJOYW1lIjoidXNlcjAwMCIsImNvbXBhbnlTaXplIjo1MDAsImFjY291bnROYW1lIjoiYmFuayBjb3JwIiwicm9sZSI6ImJyb2tlciIsImxhc3RQYXltZW50RGF0ZSI6eyJkYXkiOjE1LCJtb250aCI6MTAsInllYXIiOjIwMTR9LCJyZWdpc3RyYXRpb25EYXRlIjp7ImRheSI6MjMsIm1vbnRoIjo1LCJ5ZWFyIjoyMDEzfX19LHsidHlwZSI6InBlcnNvbmFsIiwicGVyc29uYWwiOnsiZmlyc3RuYW1lIjoiSm9objc3IiwibGFzdG5hbWUiOiJCZWFkbGU3NyIsImFnZSI6eyJhZ2UiOjM0LCJ5ZWFyIjoxOTgwLCJtb250aCI6NCwiZGF5IjoxNX0sImNvbnRhY3RzIjpbeyJlbWFpbCI6ImpiZWFkbGU5OUBsaXZlcGVyc29uLmNvbSIsInBob25lIjoiKzEgMjEyLTc4OC04ODc3In1dLCJnZW5kZXIiOiJNQUxFIn19XX0.i-PFEBjgXR-rEM30iGJAV-4l0P58wysMEZxyoYdwOCTpIkmfkXtnztfyYRNdaBkpaF1AmZVtgEBIFEYWLcSmcRWkMvnSUAKV0dv9QhR9tDbILsdyd-DEFB_RcmW8rXB7rWSoSJa4z3EMatpoC7CzaUrih8IycB2X4FuKuxL9mOg";
        lpMessagingSDK.lp_conversation_api(
            "reconnect_with_new_token", [jwt],
            this.successCallback,
            this.errorCallback
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
            "useCustomViewController" : "true"
        };

        var sdkConfig = {
            "branding" : brandingOptions,
            "window" : windowOptions,
            "account" : this.settings.accountId
        };


        lpMessagingSDK.lp_conversation_api(
            "lp_sdk_init", [this.settings.accountId, sdkConfig],
            this.successCallback,
            this.errorCallback
        );
        console.log('lpMessagingSdkInit completed -- ', this.settings.accountId);
    },
    lpStartMessagingConversation: function() {

        // HERE is where you would write your code to call your IDP and return your JWT token for an authenticated customer
        // in this sample app the token is hardcoded for this specific account.

        var JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy1JRC0xMjM0NTY3ODkwIiwiaXNzIjoiaHR0cHM6Ly93d3cudGFsa3RhbGsuY28udWsiLCJleHAiOjE1MTQ3MTg2NzEwMDAsImlhdCI6MTQ4NzE1OTMzNzAwMCwicGhvbmVfbnVtYmVyIjoiKzEtMTAtMzQ0LTM3NjUzMzMiLCJscF9zZGVzIjpbeyJ0eXBlIjoiY3RtcmluZm8iLCJpbmZvIjp7ImNzdGF0dXMiOiJjYW5jZWxsZWQiLCJjdHlwZSI6InZpcCIsImN1c3RvbWVySWQiOiIxMzg3NjZBQyIsImJhbGFuY2UiOi00MDAuOTksInNvY2lhbElkIjoiMTEyNTYzMjQ3ODAiLCJpbWVpIjoiMzU0MzU0NjU0MzU0NTY4OCIsInVzZXJOYW1lIjoidXNlcjAwMCIsImNvbXBhbnlTaXplIjo1MDAsImFjY291bnROYW1lIjoiYmFuayBjb3JwIiwicm9sZSI6ImJyb2tlciIsImxhc3RQYXltZW50RGF0ZSI6eyJkYXkiOjE1LCJtb250aCI6MTAsInllYXIiOjIwMTR9LCJyZWdpc3RyYXRpb25EYXRlIjp7ImRheSI6MjMsIm1vbnRoIjo1LCJ5ZWFyIjoyMDEzfX19LHsidHlwZSI6InBlcnNvbmFsIiwicGVyc29uYWwiOnsiZmlyc3RuYW1lIjoiSm9objc3IiwibGFzdG5hbWUiOiJCZWFkbGU3NyIsImFnZSI6eyJhZ2UiOjM0LCJ5ZWFyIjoxOTgwLCJtb250aCI6NCwiZGF5IjoxNX0sImNvbnRhY3RzIjpbeyJlbWFpbCI6ImpiZWFkbGU5OUBsaXZlcGVyc29uLmNvbSIsInBob25lIjoiKzEgMjEyLTc4OC04ODc3In1dLCJnZW5kZXIiOiJNQUxFIn19XX0.i-PFEBjgXR-rEM30iGJAV-4l0P58wysMEZxyoYdwOCTpIkmfkXtnztfyYRNdaBkpaF1AmZVtgEBIFEYWLcSmcRWkMvnSUAKV0dv9QhR9tDbILsdyd-DEFB_RcmW8rXB7rWSoSJa4z3EMatpoC7CzaUrih8IycB2X4FuKuxL9mOg";

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