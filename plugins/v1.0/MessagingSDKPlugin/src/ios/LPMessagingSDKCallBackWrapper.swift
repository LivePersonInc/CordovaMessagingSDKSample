//
//  LPMessagingSDKCallBackWrapper.swift
//  SampleApp01
//
//  Created by Omer Maroof on 17/03/17.
//
//

import Foundation
import LPMessagingSDK
import LPInfra
import LPAMS

class LPMessagingSDKCallBackWrapper:LPMessagingSDKdelegate{
    var callBackCommandDelegate: CDVCommandDelegate?
    var callBackCommand:CDVInvokedUrlCommand?
    
    static let sharedInstance = LPMessagingSDKCallBackWrapper()
    
    func setLPMessagingCallBacks(_ callBackCommandDelegate:CDVCommandDelegate?, callBackCommand:CDVInvokedUrlCommand?) {
        
        self.callBackCommandDelegate = callBackCommandDelegate
        self.callBackCommand = callBackCommand
        LPMessagingSDK.instance.delegate = self
    }
    
    internal func LPMessagingSDKCustomButtonTapped() {
        print("LPMessagingSDKCustomButtonTapped")

        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKCustomButtonTapped"
            ])
    }
    
    internal func LPMessagingSDKAgentDetails(_ agent: LPUser?) {
        print("LPMessagingSDKAgentDetails: \(agent?.nickName)")

        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKAgentDetails",
            "agentName" : String(describing: agent?.nickName)
            ])
    }
    
    internal func LPMessagingSDKActionsMenuToggled(_ toggled: Bool) {
        print("LPMessagingSDKActionsMenuToggled")

        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKActionsMenuToggled",
            "toggled" : String(describing: toggled)
            ])

    }
    
    internal func LPMessagingSDKHasConnectionError(_ error: String?) {
        print("LPMessagingSDKHasConnectionError")
        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKHasConnectionError",
            "error" : String(describing: error)
            ])
    }
    
    internal func LPMessagingSDKCSATScoreSubmissionDidFinish(_ brandID: String, rating: Int) {
        print("LPMessagingSDKCSATScoreSubmissionDidFinish: \(brandID)")
        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKCSATScoreSubmissionDidFinish",
            "rating" : String(rating),
            "accountId" : brandID
            ])
    }
    
    internal func LPMessagingSDKObseleteVersion(_ error: NSError) {
        print("LPMessagingSDKObseleteVersion: \(error)")
        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKObseleteVersion",
            "error" : String(describing: error)
            ])
    }
    
    internal func LPMessagingSDKAuthenticationFailed(_ error: NSError) {
        print("LPMessagingSDKAuthenticationFailed: \(error)")

        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKAuthenticationFailed",
            "error" : String(describing: error)
            ])
    }
    
    internal func LPMessagingSDKTokenExpired(_ brandID: String) {
        print("LPMessagingSDKTokenExpired: \(brandID)")

        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKTokenExpired",
            "accountId" : String(brandID)
            ])
    }
    
    internal func LPMessagingSDKError(_ error: NSError) {
        print("LPMessagingSDKError: \(error)")
        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKError",
            "error" : String(describing: error)
            ])
    }
    
    internal func LPMessagingSDKAgentIsTypingStateChanged(_ isTyping: Bool) {
        print("LPMessagingSDKAgentIsTypingStateChanged: \(isTyping)")
        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKAgentIsTypingStateChanged",
            "agentIsTyping" : String(isTyping)
            ])
    }
    
    internal func LPMessagingSDKConversationStarted(_ conversationID: String?) {
        print("LPMessagingSDKConversationStarted: \(conversationID)")
        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKConversationStarted",
            "conversationID" : conversationID ?? ""
            ])
    }
    
    internal func LPMessagingSDKConversationEnded(_ conversationID: String?) {
        print("LPMessagingSDKConversationEnded: \(conversationID)")
        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKConversationEnded",
            "conversationID" : conversationID ?? ""
            ])
    }
    
    internal func LPMessagingSDKConversationCSATDismissedOnSubmittion(_ conversationID: String?) {
        print("LPMessagingSDKConversationCSATDismissedOnSubmittion: \(conversationID)")
        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKConversationCSATDismissedOnSubmittion",
            "conversationID" : conversationID ?? ""
        ])
    }
    
    internal func LPMessagingSDKConnectionStateChanged(_ isReady: Bool, brandID: String) {
        print("LPMessagingSDKConnectionStateChanged: \(isReady), \(brandID)")
        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKConnectionStateChanged",
            "isReady" : String(isReady),
            "accountId" : brandID
        ])
    }
    
    internal func LPMessagingSDKOffHoursStateChanged(_ isOffHours: Bool, brandID: String) {
        print("LPMessagingSDKOffHoursStateChanged: \(isOffHours), \(brandID)")
        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKOffHoursStateChanged",
            "isOffHours" : String(isOffHours),
            "accountId" : brandID
            ])
    }
    
    internal func LPMessagingSDKConversationViewControllerDidDismiss() {
        print("LPMessagingSDKConversationViewControllerDidDismiss")
       
        sendEventToJavaScript(dicValue:["eventName":"LPMessagingSDKConversationViewControllerDidDismiss"])
    }
    
    private func sendEventToJavaScript(dicValue:[String:String]) {
        print("********* dicValue == \(dicValue)")
        
        if (self.callBackCommandDelegate != nil && self.callBackCommand != nil) {
            
            let jsonString = self.convertDicToJSON(dic: dicValue)
            let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
            
            pluginResult?.setKeepCallbackAs(true)
            self.callBackCommandDelegate?.send(pluginResult, callbackId: self.callBackCommand?.callbackId)

        }
        
    }
    

    
    func convertDicToJSON(dic:[String:String]) -> String? {
        if let theJSONData = try? JSONSerialization.data(
            withJSONObject: dic,
            options: []) {
            let theJSONText = String(data: theJSONData,
                                     encoding: .ascii)
            return theJSONText!
        }
        return nil
    }
    
}