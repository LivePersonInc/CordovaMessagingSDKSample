package com.liveperson.plugin;

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
    public static final String SDK_SAMPLE_APP_ID = "com.liveperson.sdk_cordova_sample";

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

        Log.v(TAG, "LPMessagingSDK   received account id:" + action);

        mCallbackContext = callbackContext;
        // lp_sdk_init - Call this action inorder to do Messaging SDK init
        if ("lp_sdk_init".equals(action)) {
            final String accountId = args.getString(0);
            cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    LivePerson.initialize(cordova.getActivity(), new InitLivePersonProperties(accountId, SDK_SAMPLE_APP_ID, new InitLivePersonCallBack() {
                        @Override
                        public void onInitSucceed() {
                            Log.i(TAG, "SDK initialize completed successfully");
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
        // start_lp_conversation - Call this action to start \ resume messaging conversation
        } else if ("start_lp_conversation".equals(action)) {
            cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    LivePerson.showConversation(cordova.getActivity());

                }
            });
        } else {
            return false;
        }
        return true;
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
