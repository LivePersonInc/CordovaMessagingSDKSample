package com.liveperson.plugin;

import android.content.ComponentName;
import android.content.Intent;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.liveperson.api.LivePersonCallbackImpl;
import com.liveperson.api.sdk.LPConversationData;
import com.liveperson.infra.InitLivePersonProperties;
import com.liveperson.infra.callbacks.InitLivePersonCallBack;
import com.liveperson.messaging.TaskType;
import com.liveperson.messaging.model.AgentData;
import com.liveperson.messaging.sdk.api.LivePerson;
import com.liveperson.messaging.sdk.api.callbacks.LogoutLivePersonCallback;
import com.liveperson.messaging.sdk.api.model.ConsumerProfile;

import org.apache.cordova.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class LPMessagingSDK extends CordovaPlugin {

    private static final String TAG = LPMessagingSDK.class.getSimpleName();
    private static final String SDK_SAMPLE_APP_ID = "com.liveperson.cordova.sample.app";

    private static final String INIT = "lp_sdk_init";
    private static final String START_CONVERSATION = "start_lp_conversation";
    private static final String SET_USER = "set_lp_user_profile";

    private static final String CLEAR_HISTORY_AND_LOGOUT = "lp_clear_history_and_logout";

    private static final String RECONNECT_WITH_NEW_TOKEN = "reconnect_with_new_token";
    public static final String LP_ACCOUNT_ID = "lp_account_id";
    public static final String LP_REGISTER_PUSHER = "register_pusher";

    CallbackContext mCallbackContext;
    CallbackContext mGlobalCallbackContext;

    /**
     * Liveperson messaging API calls from the JS
     * @param action - supported action: lp_sdk_init, start_lp_conversation
     * @param args - using arg(0) for the account Id
     * @param callbackContext - callback to the JS
     * @return
     * @throws JSONException
     */
    public boolean execute(final String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {

        Log.v(TAG, "LPMessagingSDK.execute:" + action);

        boolean success = true;
        mCallbackContext = callbackContext;

        switch (action){
            case INIT:
        // lp_sdk_init - Call this action inorder to do Messaging SDK init
                final String accountId = args.getString(0);
                Log.d(TAG, "Messaging SDK: init for account Id: " + accountId);
                initSDK(accountId);
                break;
            case CLEAR_HISTORY_AND_LOGOUT:
                //final String accountId = args.getString(0);
                LivePerson.logOut(cordova.getActivity(), args.getString(0), SDK_SAMPLE_APP_ID, new LogoutLivePersonCallback() {
                    @Override
                    public void onLogoutSucceed() {
                        JSONObject json = new JSONObject();
                        try {
                            json.putOpt("eventName","LPMessagingSDKClearHistoryAndLogout");
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                        onEvent(json);
                    }

                    @Override
                    public void onLogoutFailed() {
                        JSONObject json = new JSONObject();
                        try {
                            json.putOpt("eventName","LPMessagingSDKClearHistoryAndLogoutFailed");
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                        onEvent(json);
                    }
                });

                break;
            case START_CONVERSATION:

                String jwt = args.getString(1); // [0] is accountId [1] is jwt
                if(jwt != null) {
                    Log.d(TAG, "Messaging SDK:  startAuthenticatedConversation");
                    startAuthenticatedConversation(jwt);
                } else {
                    Log.d(TAG, "Messaging SDK: Start conversation");
                    startConversation();
                }

                break;
            case RECONNECT_WITH_NEW_TOKEN:
                
                Log.d(TAG, "Messaging SDK: RECONNECT_WITH_NEW_TOKEN"+args.getString(0));
                reconnect(args.getString(0));
                break;
            case SET_USER:
                Log.d(TAG, "Messaging SDK: Set User, args:" + args);
                setProfile(callbackContext, args);
                break;
            case LP_REGISTER_PUSHER:
                final String account = args.getString(0);
                final String token = args.getString(1);
                Log.d(TAG, "Messaging SDK: Register pusher for for account: " + account +", token: " + token);
                LivePerson.registerLPPusher(account, SDK_SAMPLE_APP_ID, token);
                mCallbackContext.success("FCM token registration end successfully");
                break;
            default:
                Log.d(TAG,"LPMessagingSDK - LivePerson." + action + " is not a supported function.");
                callbackContext.error("LivePerson." + action + " is not a supported function.");
                success = false;
                break;
        }

        return success;
    }

    /**
     *
     * @param accountId
     */
    private void initSDK(final String accountId) {
            cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    LivePerson.initialize(cordova.getActivity(), new InitLivePersonProperties(accountId, SDK_SAMPLE_APP_ID, new InitLivePersonCallBack() {
                        @Override
                        public void onInitSucceed() {
                            Log.i(TAG, "SDK initialize completed successfully");
                            SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(cordova.getActivity());
                            sharedPreferences.edit().putString(LP_ACCOUNT_ID, accountId).apply();
//                            JSONObject json = new JSONObject();
//                            try {
//                                json.putOpt("eventName","LPMessagingSDKInitSuccess");
//                            } catch (JSONException e1) {
//                                e1.printStackTrace();
//                            }
//                            onEvent(json);


                            cordova.getActivity().runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    setCallBack();

                                }
                            });
                        }

                        @Override
                        public void onInitFailed(Exception e) {
                            Log.i(TAG, "SDK initialize completed with error");
//                            JSONObject json = new JSONObject();
//                            try {
//                                json.putOpt("eventName","LPMessagingSDKInitError");
//                            } catch (JSONException e1) {
//                                e1.printStackTrace();
//                            }
//                            onEvent(json);
                            cordova.getActivity().runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    mCallbackContext.error("Init Failed for account Id: " + accountId);
                                }
                            });
                        }
                    }));

                }
            });
    }

    private void reconnect(String jwt) {
        LivePerson.reconnect(jwt);
    }

    /**
     *
     */
    private void startConversation() {
            cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    LivePerson.showConversation(cordova.getActivity());

                }
            });
        }

    private void startAuthenticatedConversation(final String token) {
        cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                LivePerson.showConversation(cordova.getActivity(),token);

            }
        });
    }

    /**
     *
     * @param callbackContext
     * @param args
     * @throws JSONException
     */
    private void setProfile(final CallbackContext callbackContext, JSONArray args) throws JSONException {
        final String appId = SDK_SAMPLE_APP_ID;
        final String firstName  = args.getString(1);
        final String lastName   = args.getString(2);
        final String phone      = args.getString(3);
        ConsumerProfile consumerProfile = new ConsumerProfile.Builder()
                .setFirstName(firstName)
                .setLastName(lastName)
                .setPhoneNumber(phone)
                .build();
        LivePerson.setUserProfile(consumerProfile);

//        callbackContext.success();
        JSONObject json = new JSONObject();
        try {

            json.putOpt("eventName","LPMessagingSDKSetUserProfileSuccess");

            onEvent(json);
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error(e.toString());
        }

    }


    /**
     * Callbacks that call when the conversation activity running
     */
    private void setCallBack() {
        LivePerson.setCallback(new LivePersonCallbackImpl() {
            @Override
            public void onError(TaskType type, String message) {

            }

            @Override
            public void onTokenExpired() {


                // Change authentication key here
                // LivePerson.reconnect(SampleAppStorage.getInstance(MainActivity.this).getAuthCode());
            }

            @Override
            public void onConversationStarted(LPConversationData convData) {


            }

            @Override
            public void onConversationResolved(LPConversationData convData) {


            }

            @Override
            public void onConnectionChanged(boolean isConnected) {

            }

            @Override
            public void onAgentTyping(boolean isTyping) {

            }

            @Override
            public void onAgentDetailsChanged(AgentData agentData) {

            }

            @Override
            public void onCsatDismissed() {

            }

            @Override
            public void onCsatSubmitted(String conversationId) {

            }

            @Override
            public void onConversationMarkedAsUrgent() {

            }

            @Override
            public void onConversationMarkedAsNormal() {

            }

            @Override
            public void onOfflineHoursChanges(boolean isOfflineHoursOn) {

            }

            @Override
            public void onAgentAvatarTapped(AgentData agentData) {


            }
        });
    }
    /**
     * Call this method to fire e=vent back to the JS during active conversation
     * @param event
     */
    private void onEventOld(String event) {
        Log.d(TAG, event);
        if(mCallbackContext != null) {



            PluginResult result = new PluginResult(PluginResult.Status.OK, event);
            result.setKeepCallback(true);
            mCallbackContext.sendPluginResult(result);

        }
    }

    private void onEvent(JSONObject eventJson) {
        Log.d(TAG, eventJson.toString());
        if(mCallbackContext != null) {

            Log.d(TAG, "******** onEvent mCallbackContext is NOT nil");

            System.out.printf( "JSON: %s", eventJson.toString() );

            PluginResult result = new PluginResult(PluginResult.Status.OK, eventJson.toString());
            result.setKeepCallback(true);
            mCallbackContext.sendPluginResult(result);

        }
    }
}
