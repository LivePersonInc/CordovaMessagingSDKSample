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