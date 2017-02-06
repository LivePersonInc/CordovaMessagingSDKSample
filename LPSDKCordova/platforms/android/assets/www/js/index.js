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
     var init = false;
    var app = {

        // Application Constructor
        initialize: function() {
            console.log("in app.initialize");
            document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        },

        // deviceready Event Handler
        //
        // Bind any cordova events here. Common events are:
        // 'pause', 'resume', etc.
        onDeviceReady: function() {
            // Events that fired from the index.html
            console.log("<onDeviceReady>");
            this.receivedEvent('lp_sdk_init');
            this.receivedEvent('start_lp_conversation');
            registerNotification();
        },

        // Update DOM on a Received Event
        receivedEvent: function(id) {
            var parentElement = document.getElementById(id);
            console.log("In receivedEvent - ID: " + id);

            //Calling to the LP Messaging API using the bridge
            parentElement.addEventListener("click", function() {
                console.log("In receivedEvent - Handel event id: " + id);
                if (id == "lp_sdk_init"){
                    initMessagingSDK(false);
                } else if (id == "start_lp_conversation"){
                    startConversation();
                }

            });
            console.log('Received Event: ' + id);
        }


    };
    var accountId;
    app.initialize();


    /*
    * Init Liveperson SDK and FCM registration
    * shouldOpenConversation - Set to true if we need to open the conversation window when the init ended
    *                          We need it when the app is killed and the notification was clicked.
    */
    function initMessagingSDK(shouldOpenConversation){

        accountId = document.getElementById("accountId").value;
        console.log("In initMessagingSDK, shouldOpenConversation = " + shouldOpenConversation +", accountId = " + accountId);

        lpMessagingSDK.lp_conversation_api('lp_sdk_init', [accountId],
            //Success callback - lp_sdk_init
            function(message) {
                console.log("LP Init end successfully - Do FCM get_token");
                FCMPlugin.getToken(
                    //Success callback - getToken
                    function(token) {
                        console.log("Get FCM token end successfully, Do LP register pusher, token = " + token);
                        lpMessagingSDK.lp_conversation_api('register_pusher', [accountId, token],
                            //Success callback - register_pusher
                            function(message){
                                console.log('lpMessagingSDK register_pusher end successfully, message: ' + message);
                            },
                            //Failure callback - register_pusher
                            function(){
                                console.log('lpMessagingSDK register_pusher end with Error');
                            }
                        );
                        //When the init called as result of notification click - open the chat window
                        if (shouldOpenConversation){
                            console.log("Open LP conversation window after LP init ended")
                            startConversation();
                        }
                    },
                    //Failure callback - getToken
                    function() {
                        console.log("Get FCM token end with error");
                    }
                );
            },
            //Failure callback
            function() {
                console.log("LP Init end with error");
            }
        );
    }

    /*
    * Open the LP messaging conversation window and set the user profile
    */
    function startConversation(){
        console.log("======= startConversation ========")
        lpMessagingSDK.lp_conversation_api('start_lp_conversation', [],
            //start_lp_conversation - Success callback
            function(message) {
                console.log("action was cordova-plugin-fcmstart_lp_conversation - set to set_lp_user_profile, do set user profile");

               /*
                * For starting SDK call - we also set user profile
                * Arguments for set user profile:
                * First Name, Last Name, Nick Name, User image profile URL, phone number
                */
                lpMessagingSDK.lp_conversation_api("set_lp_user_profile", [accountId, "John","Doe","JohnDe", "https://s-media-cache-ak0.pinimg.com/564x/a2/c7/ee/a2c7ee8982de3bae503a730fe4562cf9.jpg", "11223344"],
                //set_lp_user_profile - Success callback
                function(message) {
                    console.log("action was set_lp_user_profile end successfully");
                },
                //set_lp_user_profile - Failure callback
                function() {
                     console.log("<failure> Error calling set_lp_user_profile Plugin");
                     alert("Error calling set_lp_user_profile Plugin");
                });
            },
            //start_lp_conversation - Failure callback
            function() {
                console.log("<failure> Error calling lp_conversation_api Plugin, id: lp_sdk_init");
                alert("Error calling lp_conversation_api Plugin, id: lp_sdk_init");
            }
        );
    }

    /*
    * Register to the FCMPlugin onNotificationReceived callback to handle incoming notifications
    * onNotificationReceived called from FCMPlugin.sendPushPayload
    */
    function registerNotification(){
        console.log("In registerNotification")
        FCMPlugin.onNotification(
          //onNotificationReceived callback
          function(data){
                if(data.wasTapped){
                    console.log("Handle FCMPlugin.onNotificationReceived");
                    //Notification was received on device tray and tapped by the user.
                    if (init == false){
                        console.log("Messaging SDK is no init - call init first, and then call startConversation");
                        initMessagingSDK(true);
                    }else {
                        console.log("New notification was clicked - open conversation");
                        startConversation();
                    }
                }else{
                  //Notification was received in foreground. Maybe the user needs to be notified.
                  alert( JSON.stringify(data) );
                }
          },
          //Success callback - onNotification
          function(msg){
            console.log('onNotification callback successfully registered: ' + msg);
          },
          //Failure callback - onNotification
          function(err){
            console.log('Error registering onNotification callback: ' + err);
          }
        );
    }

