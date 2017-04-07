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
        logoutButtonId: "logout_and_clear_history",
        initSdkButtonId: "init_lp_sdk"
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
        console.log('Received Event: ' + id);
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        var buttonElement = document.getElementById(this.settings.startMessagingConversationButtonId);
        buttonElement.addEventListener("click", this.lpStartMessagingConversation.bind(this, 'jwt1'), false);


        var buttonElement2 = document.getElementById("start_lp_conversation_2nd_user");
        buttonElement2.addEventListener("click", this.lpStartMessagingConversation.bind(this, 'jwt2'), false);


        var logoutElement = document.getElementById(this.settings.logoutButtonId);
        logoutElement.addEventListener("click", this.clearDeviceHistoryAndLogout.bind(this), false);

        var initSdkElement = document.getElementById(this.settings.initSdkButtonId);
        initSdkElement.addEventListener("click", this.lpMessagingSdkInit.bind(this), false);
    },

    clearDeviceHistoryAndLogout: function() {
        console.log("*** clearDeviceHistoryAndLogout ***");
        lpMessagingSDK.lp_conversation_api(
            "lp_clear_history_and_logout", [this.settings.accountId],
            this.clearHistorySuccessCallback,
            this.errorCallback
        );

    },
    clearHistorySuccessCallback: function(data) {
        console.log("clearDeviceHistoryAndLogout callback!");
        var eventData = JSON.parse(data);
        console.log("clearDeviceHistoryAndLogout " + data);
    },
    successCallback: function(data) {
        var eventData = JSON.parse(data);
        console.log(
            " LPMessagingSDK ANDROID successCallback fired! " + eventData.eventName
        );

        // onConversationResolved

        console.log(eventData.eventName);
        if (eventData.eventName == 'LPMessagingSDKTokenExpired') {
            console.log("authenticated token has expired...refreshing...");
            this.lpGenerateNewAuthenticationToken();
        }

        if (eventData.eventName == 'LPMessagingSDKConnectionStateChanged') {
            console.log("****** LPMessagingSDK ANDROID callback test --- LPMessagingSDKConnectionStateChanged.." + eventData.isReady);

        }

        if (eventData.eventName == 'LPMessagingSDKInitSuccess') {
            console.log("****** LPMessagingSDKInitSuccess callback OK --- ");


        }

    },
    errorCallback: function(eventDescription) {
        console.log(
            "errorCallback fired! " + eventDescription
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
            "window": windowOptions,
            "account": this.settings.accountId
        };


        lpMessagingSDK.lp_conversation_api(
            "lp_sdk_init", [this.settings.accountId, sdkConfig],
            this.successCallback,
            this.errorCallback
        );

        lpMessagingSDK.lp_conversation_api(
            "set_lp_user_profile", [
                "123456",
                "John",
                "Doe",
                "JD",
                "https://s-media-cache-ak0.pinimg.com/564x/a2/c7/ee/a2c7ee8982de3bae503a730fe4562cf9.jpg",
                "555-444-12345"
            ],
            this.successCallback,
            this.errorCallback
        );

        console.log('lpMessagingSdkInit completed -- ', this.settings.accountId);
    },
    lpStartMessagingConversation: function(customerId) {

        // HERE is where you would write your code to call your IDP and return your JWT token for an authenticated customer
        // in this sample app the token is hardcoded for this specific account.
        console.log('lpStartMessagingConversation customerId ' + customerId);
        // sub TALKTALK-04-APR-2017-1120
        var JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy0wNC1BUFItMjAxNy0xMTIwIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE0OTEzMDUxMDAwMDAsImlhdCI6MTQ4NzE1OTMzNzAwMCwicGhvbmVfbnVtYmVyIjoiKzEtMTAtMzQ0LTM3NjUzMzMiLCJscF9zZGVzIjpbeyJ0eXBlIjoiY3RtcmluZm8iLCJpbmZvIjp7ImNzdGF0dXMiOiJjYW5jZWxsZWQiLCJjdHlwZSI6InZpcCIsImN1c3RvbWVySWQiOiJUQUxLVEFMSy0wNC1BUFItMjAxNy0xMTIwIiwiYmFsYW5jZSI6LTQwMC45OSwic29jaWFsSWQiOiIxMTI1NjMyNDc4MCIsImltZWkiOiIzNTQzNTQ2NTQzNTQ1Njg4IiwidXNlck5hbWUiOiJ1c2VyMDAwIiwiY29tcGFueVNpemUiOjUwMCwiYWNjb3VudE5hbWUiOiJiYW5rIGNvcnAiLCJyb2xlIjoiYnJva2VyIiwibGFzdFBheW1lbnREYXRlIjp7ImRheSI6MTUsIm1vbnRoIjoxMCwieWVhciI6MjAxNH0sInJlZ2lzdHJhdGlvbkRhdGUiOnsiZGF5IjoyMywibW9udGgiOjUsInllYXIiOjIwMTN9fX0seyJ0eXBlIjoicGVyc29uYWwiLCJwZXJzb25hbCI6eyJmaXJzdG5hbWUiOiJKb2huOTkiLCJsYXN0bmFtZSI6IkJlYWRsZTk5IiwiYWdlIjp7ImFnZSI6MzQsInllYXIiOjE5ODAsIm1vbnRoIjo0LCJkYXkiOjE1fSwiY29udGFjdHMiOlt7ImVtYWlsIjoiamJlYWRsZTk5QGxpdmVwZXJzb24uY29tIiwicGhvbmUiOiIrMSAyMTItNzg4LTg4NzcifV0sImdlbmRlciI6Ik1BTEUifX1dfQ.LlClhbOSl1SP2eNfxmeNHP4WEQytOG4hmXu2hSgQlWFUOvZ3hLDu6KzPiNq-tvN4gZ_a2xVrXMxVqvQa-gp2Bc8ZtMSo91HJi39AiAgbO7ETKZ8xbBkwKhs6DeWdhXyb5WHHwjnAN8ba_vWeKkQ3yHJ7bvi9W-q2LjfymATu6a4";

        // sub TALKTALK-05-APR-2017-1800
        var JWT2 = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy0wNS1BUFItMjAxNy0xODAwIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE0OTEzMDUxMDAwMDAsImlhdCI6MTQ4NzE1OTMzNzAwMCwicGhvbmVfbnVtYmVyIjoiKzEtMTAtMzQ0LTM3NjUzMzMiLCJscF9zZGVzIjpbeyJ0eXBlIjoiY3RtcmluZm8iLCJpbmZvIjp7ImNzdGF0dXMiOiJjYW5jZWxsZWQiLCJjdHlwZSI6InZpcCIsImN1c3RvbWVySWQiOiJUQUxLVEFMSy0wNS1BUFItMjAxNy0xODAwIiwiYmFsYW5jZSI6LTQwMC45OSwic29jaWFsSWQiOiIxMTI1NjMyNDc4MCIsImltZWkiOiIzNTQzNTQ2NTQzNTQ1Njg4IiwidXNlck5hbWUiOiJ1c2VyMDAwIiwiY29tcGFueVNpemUiOjUwMCwiYWNjb3VudE5hbWUiOiJiYW5rIGNvcnAiLCJyb2xlIjoiYnJva2VyIiwibGFzdFBheW1lbnREYXRlIjp7ImRheSI6MTUsIm1vbnRoIjoxMCwieWVhciI6MjAxNH0sInJlZ2lzdHJhdGlvbkRhdGUiOnsiZGF5IjoyMywibW9udGgiOjUsInllYXIiOjIwMTN9fX0seyJ0eXBlIjoicGVyc29uYWwiLCJwZXJzb25hbCI6eyJmaXJzdG5hbWUiOiJUb255IiwibGFzdG5hbWUiOiJTdGFyayIsImFnZSI6eyJhZ2UiOjM0LCJ5ZWFyIjoxOTgwLCJtb250aCI6NCwiZGF5IjoxNX0sImNvbnRhY3RzIjpbeyJlbWFpbCI6ImpiZWFkbGU5OUBsaXZlcGVyc29uLmNvbSIsInBob25lIjoiKzEgMjEyLTc4OC04ODc3In1dLCJnZW5kZXIiOiJNQUxFIn19XX0.dy5sModDTo4qIxId8VYtAFA1ajnQvBa_2fDYzXLoXFpXsn-U-k64gtRH4gf5vWXryZ5BCAqKXJsYn6DlifrRWJHQaaxHn6BSOfAvbSS7dRS2c8IGfS7r-c5iQesX9RZPy7M3yJgnOf-1A6_wiF12BMl23U1uQxDTYfc_Z_hv0Nk"

        lpMessagingSDK.lp_conversation_api(
            "start_lp_conversation", [
                this.settings.accountId,
                customerId == "jwt1" ? JWT : JWT2
            ],
            this.successCallback,
            this.errorCallback
        );



        console.log('lpStartMessagingConversation completed ', JWT);
    }
};

app.initialize();