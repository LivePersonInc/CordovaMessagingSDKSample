//
//  LPMessagingSDKPlugin.swift
//  LPSDKCordovaSample
//
//  Created by jbeadle.
//
//

import Foundation
import LPMessagingSDK
import LPInfra
import LPAMS

@objc(LPMessagingSDKPlugin) class LPMessagingSDKPlugin: CDVPlugin, LPMessagingSDKdelegate {
    

    // adding delegates and callbacks for Cordova to notify javascript wrapper when functions complete
    var callBackCommandDelegate: CDVCommandDelegate?
    var callBackCommand:CDVInvokedUrlCommand?
  
    var globalCallbackCommandDelegate: CDVCommandDelegate?
    var globalCallbackCommand: CDVInvokedUrlCommand?
    
    
    override init() {
        super.init()
    }
    
    override func pluginInitialize() {
        print("999 iOS pluginInitialize")
    }
    
    func convertToDictionary(text: String) -> [String: Any]? {
        if let data = text.data(using: .utf8) {
            do {
                return try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
            } catch {
                print(error.localizedDescription)
            }
        }
        return nil
    }
    
    
    func lp_register_event_callback(_ command: CDVInvokedUrlCommand) {
        self.globalCallbackCommandDelegate = commandDelegate
        self.globalCallbackCommand = command
        
        // return NO_RESULT for now and then use this delegate in all async callbacks for other events.
        let pluginResult = CDVPluginResult(
            status: CDVCommandStatus_NO_RESULT,
            messageAs: "999 lp_register_event_callback"
        )
        
        pluginResult?.setKeepCallbackAs(true)
        
        self.globalCallbackCommandDelegate!.send(
            pluginResult,
            callbackId: self.globalCallbackCommand!.callbackId
        )
        
        print("999 iOS lp_register_event_callback \n")

    }
    
    
    func lp_sdk_init(_ command: CDVInvokedUrlCommand) {
        guard let brandID = command.arguments.first as? String else {
            print("Can't init without brandID")
            return
        }

        let config = command.arguments[1] as? [String:AnyObject]
        print("lpMessagingSdkInit brandID --> \(brandID)")
        /*
         examples pulling out config
         print(config!)
         print(config?["branding"])
         print(config?["branding"]?["remoteUserBubbleBackgroundColor"])
         print(config?["window"]?["useCustomViewController"])

         */
        do {
            try LPMessagingSDK.instance.initialize(brandID)
            
            setSDKConfigurations(config:config!)
            LPMessagingSDK.instance.delegate = self
             self.set_lp_callbacks(command)
//            sendEventToJavaScript(dicValue:[
//                "eventName":"LPMessagingSDKInitSuccess",
//                "message" : "LPMessagingSDK Initialization successful:"
//                ])
            
            // let jsonString = self.convertDicToJSON(dic: dicValue)
            // let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
            
            // pluginResult?.setKeepCallbackAs(true)
            // self.callBackCommandDelegate?.send(pluginResult, callbackId: self.callBackCommand?.callbackId)

            var response:[String:String];
        
            response = ["eventName":"LPMessagingSDKInitSuccess"];
            let jsonString = self.convertDicToJSON(dic: response)

            var pluginResultInitSdk = CDVPluginResult(
                status: CDVCommandStatus_OK,
                messageAs:jsonString
            )

            self.commandDelegate!.send(
                pluginResultInitSdk,
                callbackId: command.callbackId
            )
            
            print("999 iOS LPMessagingSDKInitSuccess")


        } catch let error as NSError {
            // throw error callback here!
            // check if this fires the error callback
            // sendEventToJavaScript(dicValue:[
            //     "eventName":"LPMessagingSDKInitError",
            //     "errorMessage" : "LPMessagingSDK Initialization error: \(error)"
            //     ])
            
            // let jsonString = self.convertDicToJSON(dic: dicValue)
            // let pluginResult = CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs:jsonString)
            
            // pluginResult?.setKeepCallbackAs(true)
            // self.callBackCommandDelegate?.send(pluginResult, callbackId: self.callBackCommand?.callbackId)

            var response:[String:String];
        
            response = ["eventName":"LPMessagingSDKInitSuccess"];
            let jsonString = self.convertDicToJSON(dic: response)

            var pluginResultInitSdk = CDVPluginResult(
                status: CDVCommandStatus_ERROR,
                messageAs:jsonString
            )

            self.commandDelegate!.send(
                pluginResultInitSdk,
                callbackId: command.callbackId
            )

            print("999 ios LPMessagingSDK Initialization error: \(error)")
        }
        
    }

    func lp_clear_history_and_logout(_ command: CDVInvokedUrlCommand) {
        
        var response:[String:String];
        
        response = ["eventName":"LPMessagingSDKClearHistoryAndLogout"];
        let jsonString = self.convertDicToJSON(dic: response)
        
        self.set_lp_callbacks(command)
        LPMessagingSDK.instance.logout()
        
        let pluginResult = CDVPluginResult(
            status: CDVCommandStatus_OK,
            messageAs: jsonString
        )

        pluginResult?.setKeepCallbackAs(true)
        self.callBackCommandDelegate?.send(pluginResult, callbackId: self.callBackCommand?.callbackId)
    }
    
    func start_lp_conversation(_ command: CDVInvokedUrlCommand) {
        print("args = \(command.arguments)")
        guard let brandID = command.arguments.first as? String else {
            print("Can't start without brandID")
            return
        }
        // init our callbacks for javascript wrapper
        self.set_lp_callbacks(command)

        // Enable authentication support
        // check if the second parameter to the function call contains a value?
        // this is expected to be the JWT token for enabling authenticated messaging conversations
        // if found we pass it to the showConversation method, otherwise fallback to default unauthenticated mode
        if(command.argument(at: 1) as? String != nil){
            let authCode = command.argument(at: 1) as? String
            self.showConversation(brandID,authenticationCode: authCode)
        }else{
            self.showConversation(brandID)
        }
        
        var response:[String:String];
        
        response = ["eventName":"start_lp_conversation"];
        let jsonString = self.convertDicToJSON(dic: response)
        
               
        let pluginResult = CDVPluginResult(
            status: CDVCommandStatus_OK,
            messageAs: jsonString
        )
        
        pluginResult?.setKeepCallbackAs(true)
        self.callBackCommandDelegate?.send(pluginResult, callbackId: self.callBackCommand?.callbackId)
       
    }

    // Assign values to our objects for triggering JS callbacks in the wrapper once native methods complete
    func set_lp_callbacks(_ command: CDVInvokedUrlCommand) {
        
        self.callBackCommandDelegate = commandDelegate
        self.callBackCommand = command
        LPMessagingSDK.instance.delegate = self

    }
    
    func set_lp_user_profile(_ command: CDVInvokedUrlCommand) {
        guard let brandID = command.argument(at: 0) as? String else {
            print("Can't set profile without brandID")
            return
        }
        
        let firstName = command.argument(at: 1) as? String
        let lastName = command.argument(at: 2) as? String
        let nickName = command.argument(at: 3) as? String
        let imageURL = command.argument(at: 4) as? String
        let phoneNumber = command.argument(at: 5) as? String
        self.setUserProfile(brandID, firstName: firstName, lastName: lastName, nickName: nickName, uid: nil, profileImageURL: imageURL, phoneNumber: phoneNumber, employeeID: nil)
        print("999 iOS setUserProfile")

        var response:[String:String];
        
        response = ["eventName":"999 set_lp_user_profile"];
        let jsonString = self.convertDicToJSON(dic: response)
        
        var pluginResultSetUserProfile = CDVPluginResult(
            status: CDVCommandStatus_OK,
            messageAs:jsonString
        )
        
        self.commandDelegate!.send(
            pluginResultSetUserProfile,
            callbackId: command.callbackId
        )

        
    }
    
    // MARK: MessagingSDK API
    /**
     Show conversation screen and use this ViewController as a container
     */
    func showConversation(_ brandID: String, authenticationCode:String? = nil) {
        
        let conversationQuery = LPMessagingSDK.instance.getConversationBrandQuery(brandID)
        if authenticationCode == nil {
            LPMessagingSDK.instance.showConversation(conversationQuery)
        } else {
            LPMessagingSDK.instance.showConversation(conversationQuery,authenticationCode: authenticationCode)
       }
    }
    
    /**
     Set user profile for the consumer
     */
    func setUserProfile(_ brandID: String, firstName: String?, lastName: String?, nickName: String?, uid: String?, profileImageURL: String?, phoneNumber: String?, employeeID: String?) {
        let user = LPUser(firstName: firstName, lastName: lastName, nickName: nickName,  uid: uid, profileImageURL: profileImageURL, phoneNumber: phoneNumber, employeeID: employeeID)
        LPMessagingSDK.instance.setUserProfile(user, brandID: brandID)
        sendEventToJavaScript(dicValue:[
            "eventName":"LPMessagingSDKSetUserProfileSuccess",
            "message" : "firstName: \(firstName), lastName: \(lastName), nickName: \(nickName),  uid: \(uid), profileImageURL: \(profileImageURL), phoneNumber: \(phoneNumber), employeeID: \(employeeID)"
            ])
    }
    
    /**
     Change default SDK configurations

     TODO: update method to support config and branding changes via a JSON object sent through via the cordova wrapper to change the settings here.

     TODO: Add support for other config options as per SDK documentation
     */
    func setSDKConfigurations(config:[String:AnyObject]) {
        let configurations = LPConfig.defaultConfiguration
        configurations.remoteUserBubbleBackgroundColor = UIColor.purple
        configurations.remoteUserBubbleBorderColor = UIColor.purple
        configurations.remoteUserBubbleTextColor = UIColor.white
        configurations.remoteUserAvatarIconColor = UIColor.white
        configurations.remoteUserAvatarBackgroundColor = UIColor.purple
        
        configurations.brandName = config["branding"]?["brandName"] as? String ?? "LPMessagingSampleBrand"
        
        print("****** BRAND NAME WAS SETUP FROM CONFIG !!! \(configurations.brandName)")
        
        configurations.userBubbleBackgroundColor = UIColor.lightGray
        configurations.userBubbleTextColor = UIColor.white
        
        configurations.sendButtonEnabledColor = UIColor.purple
    }
    
    private func sendEventToJavaScript(dicValue:[String:String]) {
        print("********* sendEventToJavaScript --> dicValue == \(dicValue)")
        
        if (self.globalCallbackCommandDelegate != nil && self.globalCallbackCommand != nil) {
            
            let jsonString = self.convertDicToJSON(dic: dicValue)
            let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
            
            pluginResult?.setKeepCallbackAs(true)
            self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)
            
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
    
    internal func LPMessagingSDKCustomButtonTapped() {
        var response:[String:String];
        response = ["eventName":"LPMessagingSDKCustomButtonTapped"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)
    }
    
    internal func LPMessagingSDKAgentDetails(_ agent: LPUser?) {
        var response:[String:String];
        response = ["eventName":"LPMessagingSDKAgentDetails","agent":"\(agent)"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)

    }
    
    internal func LPMessagingSDKActionsMenuToggled(_ toggled: Bool) {
        var response:[String:String];
        response = ["eventName":"LPMessagingSDKActionsMenuToggled","toggled":"\(toggled)"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)
        
    }
    
    internal func LPMessagingSDKHasConnectionError(_ error: String?) {
        print("LPMessagingSDKHasConnectionError")
        var response:[String:String];
        response = ["eventName":"LPMessagingSDKHasConnectionError","error":"\(error)"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)

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
        var response:[String:String];
        response = ["eventName":"LPMessagingSDKObseleteVersion","error":"\(error)"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)
    }
    
    internal func LPMessagingSDKAuthenticationFailed(_ error: NSError) {
        var response:[String:String];
        response = ["eventName":"LPMessagingSDKAuthenticationFailed","error":"\(error)"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)
    }
    
    internal func LPMessagingSDKTokenExpired(_ brandID: String) {
        print("LPMessagingSDKTokenExpired: \(brandID)")
        var response:[String:String];
        response = ["eventName":"LPMessagingSDKTokenExpired"];
        let jsonString = self.convertDicToJSON(dic: response)        
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)
    }
    
    internal func LPMessagingSDKError(_ error: NSError) {
        print("LPMessagingSDKError: \(error)")
        let response = ["eventName":"LPMessagingSDKError","error":"\(error)"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)
    }
    
    internal func LPMessagingSDKAgentIsTypingStateChanged(_ isTyping: Bool) {
        print("LPMessagingSDKAgentIsTypingStateChanged: \(isTyping)")
        var response:[String:String];
        response = ["eventName":"LPMessagingSDKAgentIsTypingState=\(isTyping)"];
        let jsonString = self.convertDicToJSON(dic: response)        
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)

    }
    
    internal func LPMessagingSDKConversationStarted(_ conversationID: String?) {
        var response:[String:String];
        response = ["eventName":"LPMessagingSDKConversationStarted","conversationID":"\(conversationID)"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)

    }
    
    internal func LPMessagingSDKConversationEnded(_ conversationID: String?) {
        var response:[String:String];
        
        response = ["eventName":"LPMessagingSDKConversationEnded","conversationID":"\(conversationID)"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)
    }
    
    internal func LPMessagingSDKConversationCSATDismissedOnSubmittion(_ conversationID: String?) {
        print("LPMessagingSDKConversationCSATDismissedOnSubmittion: \(conversationID)")
        var response = ["eventName":"LPMessagingSDKConversationCSATDismissedOnSubmittion","conversationID":"\(conversationID)"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)
    }
    
    internal func LPMessagingSDKConnectionStateChanged(_ isReady: Bool, brandID: String) {
        print("iOS LPMessagingSDKConnectionStateChanged: \(isReady), \(brandID)")

        
        var response:[String:String];
        
        response = ["eventName":"LPMessagingSDKConnectionStateChanged","connectionState":"\(isReady)"];
        let jsonString = self.convertDicToJSON(dic: response)
        
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)


    }
    
    internal func LPMessagingSDKOffHoursStateChanged(_ isOffHours: Bool, brandID: String) {
        print("LPMessagingSDKOffHoursStateChanged: \(isOffHours), \(brandID)")
        var response:[String:String];
        
        response = ["eventName":"LPMessagingSDKOffHoursStateChanged","isOffHours":"\(isOffHours)"];
        let jsonString = self.convertDicToJSON(dic: response)
        
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)
    }
    
    internal func LPMessagingSDKConversationViewControllerDidDismiss() {
        print("LPMessagingSDKConversationViewControllerDidDismiss")
        var response:[String:String];
        response = ["eventName":"LPMessagingSDKConversationViewControllerDidDismiss"];
        let jsonString = self.convertDicToJSON(dic: response)        
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)

        
    }
    
}
