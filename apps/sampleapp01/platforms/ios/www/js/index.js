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
        this.lpMessagingSdkInit();

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

        console.log(
            "successCallback fired! ",
            eventData,
            typeof(eventData)
        );

        var eventData = JSON.parse(data);

        if (eventData.eventName == "LPMessagingSDKConnectionStateChanged") {
            console.log("************************************* LPMessagingSDKConnectionStateChanged callback fired! ", eventData.isReady)
        }

        if (eventData.eventName == 'LPMessagingSDKTokenExpired') {
            console.log("authenticated token has expired...refreshing...");
            this.lpGenerateNewAuthenticationToken();
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
        var jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy0wNC1BUFItMjAxNy0xMTIwIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE0OTEzMDUxMDAwMDAsImlhdCI6MTQ4NzE1OTMzNzAwMCwicGhvbmVfbnVtYmVyIjoiKzEtMTAtMzQ0LTM3NjUzMzMiLCJscF9zZGVzIjpbeyJ0eXBlIjoiY3RtcmluZm8iLCJpbmZvIjp7ImNzdGF0dXMiOiJjYW5jZWxsZWQiLCJjdHlwZSI6InZpcCIsImN1c3RvbWVySWQiOiJUQUxLVEFMSy0wNC1BUFItMjAxNy0xMTIwIiwiYmFsYW5jZSI6LTQwMC45OSwic29jaWFsSWQiOiIxMTI1NjMyNDc4MCIsImltZWkiOiIzNTQzNTQ2NTQzNTQ1Njg4IiwidXNlck5hbWUiOiJ1c2VyMDAwIiwiY29tcGFueVNpemUiOjUwMCwiYWNjb3VudE5hbWUiOiJiYW5rIGNvcnAiLCJyb2xlIjoiYnJva2VyIiwibGFzdFBheW1lbnREYXRlIjp7ImRheSI6MTUsIm1vbnRoIjoxMCwieWVhciI6MjAxNH0sInJlZ2lzdHJhdGlvbkRhdGUiOnsiZGF5IjoyMywibW9udGgiOjUsInllYXIiOjIwMTN9fX0seyJ0eXBlIjoicGVyc29uYWwiLCJwZXJzb25hbCI6eyJmaXJzdG5hbWUiOiJKb2huOTkiLCJsYXN0bmFtZSI6IkJlYWRsZTk5IiwiYWdlIjp7ImFnZSI6MzQsInllYXIiOjE5ODAsIm1vbnRoIjo0LCJkYXkiOjE1fSwiY29udGFjdHMiOlt7ImVtYWlsIjoiamJlYWRsZTk5QGxpdmVwZXJzb24uY29tIiwicGhvbmUiOiIrMSAyMTItNzg4LTg4NzcifV0sImdlbmRlciI6Ik1BTEUifX1dfQ.LlClhbOSl1SP2eNfxmeNHP4WEQytOG4hmXu2hSgQlWFUOvZ3hLDu6KzPiNq-tvN4gZ_a2xVrXMxVqvQa-gp2Bc8ZtMSo91HJi39AiAgbO7ETKZ8xbBkwKhs6DeWdhXyb5WHHwjnAN8ba_vWeKkQ3yHJ7bvi9W-q2LjfymATu6a4";
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
            "useCustomViewController": "true"
        };

        var sdkConfig = {
            "branding": brandingOptions,
            "window": windowOptions
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

        var JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy0wNC1BUFItMjAxNy0xMTIwIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE0OTEzMDUxMDAwMDAsImlhdCI6MTQ4NzE1OTMzNzAwMCwicGhvbmVfbnVtYmVyIjoiKzEtMTAtMzQ0LTM3NjUzMzMiLCJscF9zZGVzIjpbeyJ0eXBlIjoiY3RtcmluZm8iLCJpbmZvIjp7ImNzdGF0dXMiOiJjYW5jZWxsZWQiLCJjdHlwZSI6InZpcCIsImN1c3RvbWVySWQiOiJUQUxLVEFMSy0wNC1BUFItMjAxNy0xMTIwIiwiYmFsYW5jZSI6LTQwMC45OSwic29jaWFsSWQiOiIxMTI1NjMyNDc4MCIsImltZWkiOiIzNTQzNTQ2NTQzNTQ1Njg4IiwidXNlck5hbWUiOiJ1c2VyMDAwIiwiY29tcGFueVNpemUiOjUwMCwiYWNjb3VudE5hbWUiOiJiYW5rIGNvcnAiLCJyb2xlIjoiYnJva2VyIiwibGFzdFBheW1lbnREYXRlIjp7ImRheSI6MTUsIm1vbnRoIjoxMCwieWVhciI6MjAxNH0sInJlZ2lzdHJhdGlvbkRhdGUiOnsiZGF5IjoyMywibW9udGgiOjUsInllYXIiOjIwMTN9fX0seyJ0eXBlIjoicGVyc29uYWwiLCJwZXJzb25hbCI6eyJmaXJzdG5hbWUiOiJKb2huOTkiLCJsYXN0bmFtZSI6IkJlYWRsZTk5IiwiYWdlIjp7ImFnZSI6MzQsInllYXIiOjE5ODAsIm1vbnRoIjo0LCJkYXkiOjE1fSwiY29udGFjdHMiOlt7ImVtYWlsIjoiamJlYWRsZTk5QGxpdmVwZXJzb24uY29tIiwicGhvbmUiOiIrMSAyMTItNzg4LTg4NzcifV0sImdlbmRlciI6Ik1BTEUifX1dfQ.LlClhbOSl1SP2eNfxmeNHP4WEQytOG4hmXu2hSgQlWFUOvZ3hLDu6KzPiNq-tvN4gZ_a2xVrXMxVqvQa-gp2Bc8ZtMSo91HJi39AiAgbO7ETKZ8xbBkwKhs6DeWdhXyb5WHHwjnAN8ba_vWeKkQ3yHJ7bvi9W-q2LjfymATu6a4";

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
