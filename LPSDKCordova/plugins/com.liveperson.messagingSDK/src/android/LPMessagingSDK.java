package com.liveperson.plugin;

import android.content.ComponentName;
import android.content.Intent;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.liveperson.api.LivePersonCallback;
import com.liveperson.infra.InitLivePersonProperties;
import com.liveperson.infra.callbacks.InitLivePersonCallBack;
import com.liveperson.messaging.TaskType;
import com.liveperson.messaging.model.AgentData;
import com.liveperson.messaging.sdk.api.LivePerson;

import org.apache.cordova.*;
import org.json.JSONArray;
import org.json.JSONException;

public class LPMessagingSDK extends CordovaPlugin {

    private static final String TAG = LPMessagingSDK.class.getSimpleName();
    private static final String SDK_SAMPLE_APP_ID = "com.liveperson.cordova.sample.app";

    private static final String INIT = "lp_sdk_init";
    private static final String START_CONVERSATION = "start_lp_conversation";
    private static final String SET_USER = "set_lp_user_profile";
    public static final String LP_ACCOUNT_ID = "lp_account_id";
    public static final String LP_REGISTER_PUSHER = "register_pusher";

    CallbackContext mCallbackContext;

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
            case START_CONVERSATION:
                Log.d(TAG, "Messaging SDK: Start conversation");
                startConversation();
                break;
            case SET_USER:
                Log.d(TAG, "Messaging SDK: Set User, args:" + args);
                setProfile(callbackContext, args);
                break;
            case LP_REGISTER_PUSHER:
                final String account = args.getString(0);
                final String token = args.getString(1);
                Log.d(TAG, "Messaging SDK: Register pusher for for accoun: " + account +", token: " + token);
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
                            cordova.getActivity().runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    setCallBack();
                                    mCallbackContext.success("Init End Successfully for account Id: " + accountId);
                                }
                            });
                        }

                        @Override
                        public void onInitFailed(Exception e) {
                            Log.i(TAG, "SDK initialize completed with error");
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
        LivePerson.setUserProfile(appId, firstName, lastName, phone);
        callbackContext.success();
    }


    /**
     * Callbacks that call when the conversation activity running
     */
    private void setCallBack() {
        LivePerson.setCallback(new LivePersonCallback() {
            @Override
            public void onError(TaskType type, String message) {
                onEvent("problem " + type.name());
            }

            @Override
            public void onTokenExpired() {
                onEvent("onTokenExpired");
            }

            @Override
            public void onConversationStarted() {
                onEvent("onConversationStarted");

            }

            @Override
            public void onConversationResolved() {
                onEvent("onConversationResolved");
            }

            @Override
            public void onConnectionChanged(boolean isConnected) {
                onEvent("onConnectionChanged");
            }

            @Override
            public void onAgentTyping(boolean isTyping) {
                onEvent("isTyping " + isTyping);
            }

            @Override
            public void onAgentDetailsChanged(AgentData agentData) {
                onEvent("on Agent Data Change, Data: " + agentData);
            }

            @Override
            public void onCsatDismissed() {
                onEvent("on CSAT Dismissed");
            }

            @Override
            public void onCsatSubmitted(String conversationId) {
                onEvent("on CSAT Submitted. ConversationID");
            }

            @Override
            public void onConversationMarkedAsUrgent() {
                onEvent("Conversation Marked As Urgent ");
            }

            @Override
            public void onConversationMarkedAsNormal() {
                onEvent("Conversation Marked As Normal ");
            }

            @Override
            public void onOfflineHoursChanges(boolean isOfflineHoursOn) {
                onEvent(" on Offline Hours Changes - " + isOfflineHoursOn );
            }

            @Override
            public void onAgentAvatarTapped(AgentData agentData) {
                onEvent(" on Agent Avatar Tapped - " + agentData );
            }
        });
    }

    /**
     * Call this method to fire e=vent back to the JS during active conversation
     * @param event
     */
    private void onEvent(String event) {
        Log.d(TAG, event);
        if(mCallbackContext != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, event);
            result.setKeepCallback(true);
            mCallbackContext.sendPluginResult(result);

        }
    }

}
