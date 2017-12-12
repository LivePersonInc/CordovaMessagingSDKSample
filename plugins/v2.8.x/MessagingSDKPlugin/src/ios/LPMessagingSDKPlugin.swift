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

extension String {
    
    /// Create `Data` from hexadecimal string representation
    ///
    /// This takes a hexadecimal representation and creates a `Data` object. Note, if the string has any spaces or non-hex characters (e.g. starts with '<' and with a '>'), those are ignored and only hex characters are processed.
    ///
    /// - returns: Data represented by this hexadecimal string.
    
    func hexadecimal() -> Data? {
        var data = Data(capacity: characters.count / 2)
        
        let regex = try! NSRegularExpression(pattern: "[0-9a-f]{1,2}", options: .caseInsensitive)
        regex.enumerateMatches(in: self, range: NSMakeRange(0, utf16.count)) { match, flags, stop in
            let byteString = (self as NSString).substring(with: match!.range)
            var num = UInt8(byteString, radix: 16)!
            data.append(&num, count: 1)
        }
        
        guard data.count > 0 else { return nil }
        
        return data
    }
    
}

@objc(LPMessagingSDKPlugin) class LPMessagingSDKPlugin: CDVPlugin, LPMessagingSDKdelegate {
    
    var conversationQuery: ConversationParamProtocol?

    // adding delegates and callbacks for Cordova to notify javascript wrapper when functions complete
    var callBackCommandDelegate: CDVCommandDelegate?
    var callBackCommand:CDVInvokedUrlCommand?
  
    var registerLpPusherCallbackCommandDelegate: CDVCommandDelegate?
    var registerLpPusherCallbackCommand: CDVInvokedUrlCommand?

    
    var globalCallbackCommandDelegate: CDVCommandDelegate?
    var globalCallbackCommand: CDVInvokedUrlCommand?
    
    var lpAccountNumber:String?
    
    override init() {
        super.init()
    }
    
    override func pluginInitialize() {
        print("@@@ iOS pluginInitialize")
    }
    

    
    @objc(lp_sdk_init:)
    func lp_sdk_init(command: CDVInvokedUrlCommand) {
        guard let lpAccountNumber = command.arguments.first as? String else {
            print("Can't init without brandID")
            return
        }
        self.lpAccountNumber = lpAccountNumber
        
        print("lpMessagingSdkInit brandID --> \(lpAccountNumber)")
        
        do {
            try LPMessagingSDK.instance.initialize(lpAccountNumber)
            
            // only set config if we have a valid argument
            // deprecated - should be done through direct editing of this function  for the relevant options
            // in which case move the setSDKConfigurations call outside of this wrapping loop and call on init every time
            
            if let config = command.arguments.lastElement as? [String:AnyObject] {
                setSDKConfigurations(config: config)
            }
            
            
            LPMessagingSDK.instance.delegate = self
            self.set_lp_callbacks(command: command)

            var response:[String:String];
        
            response = ["eventName":"LPMessagingSDKInit"];
            let jsonString = self.convertDicToJSON(dic: response)

            let pluginResultInitSdk = CDVPluginResult(
                status: CDVCommandStatus_OK,
                messageAs:jsonString
            )

            self.commandDelegate!.send(
                pluginResultInitSdk,
                callbackId: command.callbackId
            )
            
            print("@@@ iOS LPMessagingSDKInit")


        } catch let error as NSError {
  
            var response:[String:String];
        
            response = ["eventName":"LPMessagingSDKInit"];
            let jsonString = self.convertDicToJSON(dic: response)

            let pluginResultInitSdk = CDVPluginResult(
                status: CDVCommandStatus_ERROR,
                messageAs:jsonString
            )

            self.commandDelegate!.send(
                pluginResultInitSdk,
                callbackId: command.callbackId
            )

            print("@@@ ios LPMessagingSDK Initialization error: \(error)")
        }
        
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
    
    func convertDeviceTokenString(token:String) -> Data {
        
        
        var result: [String] = []
        let characters = Array(token.characters)
        stride(from: 0, to: characters.count, by: 8).forEach {
            result.append(String(characters[$0..<min($0+8, characters.count)]))
        }
        
        var tokenAsString = result.joined(separator: " ")
        
        tokenAsString = "<" + tokenAsString + ">"
        
        let tokenAsNSData = tokenAsString.hexadecimal()! as NSData
        let tokenAsData = tokenAsString.hexadecimal()!
        
        print("@@@ tokenAsNSData \(tokenAsNSData)")
        print("@@@ tokenAsData \(tokenAsData)")
        
        print("@@@ string as 8 character chunks ... \(result)")
        print("@@@ tokenAsString --> \(tokenAsString)" )
        
        
        
        return tokenAsData
    }
    
    @objc(close_conversation_screen:)
    func close_conversation_screen(command:CDVInvokedUrlCommand) {
        self.conversationQuery = LPMessagingSDK.instance.getConversationBrandQuery(self.lpAccountNumber!)
        if self.conversationQuery != nil {
            LPMessagingSDK.instance.removeConversation(self.conversationQuery!)
            self.viewController.navigationController?.popViewController(animated: true)
            print("@@@ iOS ... LPMessagingSDK  close_conversation_screen:")
            var response:[String:String];
            response = ["eventName":"LPMessagingSDKCloseConversationScreen"];
            let jsonString = self.convertDicToJSON(dic: response)
            let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
            pluginResult?.setKeepCallbackAs(true)
            self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)
            
        }

    }
    
    @objc(register_pusher:)
    func register_pusher(command:CDVInvokedUrlCommand) {
        // API passes in token via args object
        guard let pushToken = command.arguments[1] as? String else {
            print("Can't register pusher without device pushToken ")
            return
        }

        var convertedTokenAsData = convertDeviceTokenString(token: pushToken)
        
        // call the SDK method e.g.
        LPMessagingSDK.instance.registerPushNotifications(token: convertedTokenAsData);
        
        self.registerLpPusherCallbackCommandDelegate = commandDelegate
        self.registerLpPusherCallbackCommand = command
        var response:[String:String];
        
        response = ["eventName":"LPMessagingSDKRegisterLpPusher","deviceToken":"\(String(describing: pushToken))"];
        
        let jsonString = self.convertDicToJSON(dic: response)
        // return NO_RESULT for now and then use this delegate in all async callbacks for other events.
        let pluginResult = CDVPluginResult(
            status: CDVCommandStatus_OK,
            messageAs: jsonString
        )
        
        pluginResult?.setKeepCallbackAs(true)
        
        self.registerLpPusherCallbackCommandDelegate!.send(
            pluginResult,
            callbackId: self.registerLpPusherCallbackCommand!.callbackId
        )

        
    }
    
    @objc(lp_register_event_callback:)
    func lp_register_event_callback(command: CDVInvokedUrlCommand) {
        self.globalCallbackCommandDelegate = commandDelegate
        self.globalCallbackCommand = command
        
        // return NO_RESULT for now and then use this delegate in all async callbacks for other events.
        let pluginResult = CDVPluginResult(
            status: CDVCommandStatus_NO_RESULT,
            messageAs: "lp_register_global_async_event_callback"
        )
        
        pluginResult?.setKeepCallbackAs(true)
        
        self.globalCallbackCommandDelegate!.send(
            pluginResult,
            callbackId: self.globalCallbackCommand!.callbackId
        )
        
        print("@@@ iOS lp_register_event_callback \n")
        
    }
    
    @objc(reconnect_with_new_token:)
    func reconnect_with_new_token(command: CDVInvokedUrlCommand) {
        
        guard let authCode = command.arguments.first as? String else {
            print("Can't init without authCode jwt")
            return
        }
        
        print("@@@ reconnect_with_new_token: new token for reconnect - \(authCode)")
        
        var response:[String:String];
        
        
        self.set_lp_callbacks(command: command)
        do {
            let conversationViewParams = LPConversationViewParams(conversationQuery: self.conversationQuery!, containerViewController: nil, isViewOnly: false)
            let authenticationParams = LPAuthenticationParams(authenticationCode: nil, jwt: authCode, redirectURI: nil)
            LPMessagingSDK.instance.reconnect(self.conversationQuery!, authenticationParams: authenticationParams);
            
            response = ["eventName":"LPMessagingSDKReconnectWithNewToken","token":"\(authCode)","lpAccountNumber":"\(String(describing: lpAccountNumber))"];
            let jsonString = self.convertDicToJSON(dic: response)
            
            let pluginResult = CDVPluginResult(
                status: CDVCommandStatus_OK,
                messageAs: jsonString
            )
            pluginResult?.setKeepCallbackAs(true)
            self.callBackCommandDelegate?.send(pluginResult, callbackId: self.callBackCommand?.callbackId)
        }
        catch let error as NSError {
            
            response = ["eventName":"LPMessagingSDKReconnectWithNewToken","token":"\(authCode)","lpAccountNumber":"\(String(describing: lpAccountNumber))","error":"\(error)"];
            let jsonString = self.convertDicToJSON(dic: response)

            let pluginResult = CDVPluginResult(
                status: CDVCommandStatus_ERROR,
                messageAs: jsonString
            )
            pluginResult?.setKeepCallbackAs(true)
            self.callBackCommandDelegate?.send(pluginResult, callbackId: self.callBackCommand?.callbackId)

        }
        
    }

    @objc(lp_clear_history_and_logout:)
    func lp_clear_history_and_logout(command: CDVInvokedUrlCommand) {
        
        var response:[String:String];
        
        response = ["eventName":"LPMessagingSDKClearHistoryAndLogout"];
        let jsonString = self.convertDicToJSON(dic: response)
        
        self.set_lp_callbacks(command: command)
//        LPMessagingSDK.instance.logout()
        LPMessagingSDK.instance.logout(completion: {
            print("@@@ logout success!");
        }) { (error) in
            print("@@@ logout error!");
        }
        
        let pluginResult = CDVPluginResult(
            status: CDVCommandStatus_OK,
            messageAs: jsonString
        )

        pluginResult?.setKeepCallbackAs(true)
        self.callBackCommandDelegate?.send(pluginResult, callbackId: self.callBackCommand?.callbackId)
    }
    
    @objc(start_lp_conversation:)
    func start_lp_conversation(command: CDVInvokedUrlCommand) {
        print("@@@ ios start_lp_conversation args = \(command.arguments)")
        guard let brandID = command.arguments.first as? String else {
            print("Can't start without brandID")
            return
        }
        // init our callbacks for javascript wrapper
        self.set_lp_callbacks(command: command)

        // Enable authentication support
        // check if the second parameter to the function call contains a value?
        // this is expected to be the JWT token for enabling authenticated messaging conversations
        // if found we pass it to the showConversation method, otherwise fallback to default unauthenticated mode
        var conversationType = "authenticated";

//        var token:String = command.arguments[1] as AnyObject! as! String
        let token = command.arguments[1] as? String ?? ""
        if(token.characters.count > 0){
            
            self.showConversation(brandID: brandID,authenticationCode: token)
        }else{
            conversationType = "unauthenticated";
            self.showConversation(brandID: brandID)
        }
        
        var response:[String:String];
        print("@@@ LPMessagingSDKStartConversation conversationType : \(conversationType)")
        
        response = ["eventName":"LPMessagingSDKStartConversation","type" : conversationType];
        let jsonString = self.convertDicToJSON(dic: response)
        
               
        let pluginResult = CDVPluginResult(
            status: CDVCommandStatus_OK,
            messageAs: jsonString
        )
        
        pluginResult?.setKeepCallbackAs(true)
        self.callBackCommandDelegate?.send(pluginResult, callbackId: self.callBackCommand?.callbackId)
       
    }

    // Assign values to our objects for triggering JS callbacks in the wrapper once native methods complete
    @objc(set_lp_callbacks:)
    func set_lp_callbacks(command: CDVInvokedUrlCommand) {
        
        self.callBackCommandDelegate = commandDelegate
        self.callBackCommand = command
        LPMessagingSDK.instance.delegate = self

    }
    
    @objc(set_lp_user_profile:)
    func set_lp_user_profile(command: CDVInvokedUrlCommand) {
        var response:[String:String];
        self.set_lp_callbacks(command: command);

        guard let brandID = command.argument(at: 0) as? String else {
            print("@@@ ios -- set_lp_user_profile ...Can't set profile without brandID")
            
            response = ["error":"set_lp_user_profile missing brandID"];
            let jsonString = self.convertDicToJSON(dic: response)
            
            let pluginResultSetUserProfileError = CDVPluginResult(
                status: CDVCommandStatus_ERROR,
                messageAs:jsonString
            )
            
            self.commandDelegate!.send(
                pluginResultSetUserProfileError,
                callbackId: command.callbackId
            )
            return
        }
        
        let firstName = command.argument(at: 1) as? String
        let lastName = command.argument(at: 2) as? String
        let nickName = command.argument(at: 3) as? String
        let profileImageURL = command.argument(at: 4) as? String
        let phoneNumber = command.argument(at: 5) as? String
        let uid = command.argument(at: 6) as? String
        let employeeID = command.argument(at: 7) as? String
        
        
        let user = LPUser(firstName: firstName, lastName: lastName, nickName: nickName,  uid: uid, profileImageURL: profileImageURL, phoneNumber: phoneNumber, employeeID: employeeID)
        
        do {
            try LPMessagingSDK.instance.setUserProfile(user, brandID: brandID)
            
            response = ["eventName":"LPMessagingSDKSetUserProfileSuccess"];
            let jsonString = self.convertDicToJSON(dic: response)
            
            let pluginResultSetUserProfile = CDVPluginResult(
                status: CDVCommandStatus_OK,
                messageAs:jsonString
            )
            
            self.commandDelegate!.send(
                pluginResultSetUserProfile,
                callbackId: command.callbackId
            )

        } catch let error as NSError {
            response = ["eventName":"LPMessagingSDKSetUserProfileError","error":"\(error)"];
            let jsonString = self.convertDicToJSON(dic: response)
            
            let pluginResultSetUserProfile = CDVPluginResult(
                status: CDVCommandStatus_ERROR,
                messageAs:jsonString
            )
            
            self.commandDelegate!.send(
                pluginResultSetUserProfile,
                callbackId: command.callbackId
            )

        }
        
        
        
    }
    
    // MARK: MessagingSDK API
    /**
     Show conversation screen and use this ViewController as a container
     */
    func showConversation(brandID: String, authenticationCode:String? = nil) {
        
        self.conversationQuery = LPMessagingSDK.instance.getConversationBrandQuery(brandID)
        if authenticationCode == nil {
            print("@@@ ios -- showConversation ... unauthenticated no JWT token found")

//            LPMessagingSDK.instance.showConversation(self.conversationQuery!)
            
        } else {
            print("@@@ ios -- showConversation ...authenticated session jwt token found! \(authenticationCode!)")

//            LPMessagingSDK.instance.showConversation(self.conversationQuery!,authenticationCode: authenticationCode)
            let conversationViewParams = LPConversationViewParams(conversationQuery: self.conversationQuery!, containerViewController: nil, isViewOnly: false)
            let authenticationParams = LPAuthenticationParams(authenticationCode: nil, jwt: authenticationCode, redirectURI: nil)
            LPMessagingSDK.instance.showConversation(conversationViewParams, authenticationParams: authenticationParams)
       }
    }
    
    
    /**
     Change default SDK configurations

     TODO: update method to support config and branding changes via a JSON object sent through via the cordova wrapper to change the settings here.

     TODO: Add support for other config options as per SDK documentation
     */
    func setSDKConfigurations(config:[String:AnyObject]) {
        let configurations = LPConfig.defaultConfiguration
        
        configurations.brandAvatarImage = UIImage(named: "agent")
        
        configurations.remoteUserBubbleBackgroundColor = UIColor.purple
        configurations.remoteUserBubbleBorderColor = UIColor.purple
        configurations.remoteUserBubbleTextColor = UIColor.white
        configurations.remoteUserAvatarIconColor = UIColor.white
        configurations.remoteUserAvatarBackgroundColor = UIColor.purple
        
        configurations.brandName = config["branding"]?["brandName"] as? String ?? "LPMessagingSampleBrand"
        
        print("@@@ ios ****** BRAND NAME WAS SETUP FROM CONFIG !!! \(configurations.brandName)")
        
        configurations.userBubbleBackgroundColor = UIColor.lightGray
        configurations.userBubbleTextColor = UIColor.white
        
        configurations.sendButtonEnabledColor = UIColor.purple
    }
    
    fileprivate func sendEventToJavaScript(_ dicValue:[String:String]) {
        print("@@@ ios ********* sendEventToJavaScript --> dicValue == \(dicValue)")
        
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
        response = ["eventName":"LPMessagingSDKAgentDetails","agent":"\(String(describing: agent))"];
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
        response = ["eventName":"LPMessagingSDKHasConnectionError","error":"\(String(describing: error))"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)

    }
    
    internal func LPMessagingSDKCSATScoreSubmissionDidFinish(_ brandID: String, rating: Int) {
        print("LPMessagingSDKCSATScoreSubmissionDidFinish: \(brandID)")
        sendEventToJavaScript([
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
        response = ["eventName":"LPMessagingSDKAgentIsTypingState","isTyping":"\(isTyping)"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)

    }
    

    internal func LPMessagingSDKConversationStarted(_ conversationID: String?) {
        var response:[String:String];
        response = ["eventName":"LPMessagingSDKConversationStarted","conversationID":"\(String(describing: conversationID))"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)

    }
    
    internal func LPMessagingSDKConversationEnded(_ conversationID: String?, closeReason: LPConversationCloseReason) {
        var response:[String:String];
        
        response = ["eventName":"LPMessagingSDKConversationEnded","conversationID":"\(String(describing: conversationID))","closeReason":"\(closeReason.hashValue) \(closeReason.rawValue)"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)
    }
    
    
    internal func LPMessagingSDKConversationCSATDismissedOnSubmittion(_ conversationID: String?) {
        print("LPMessagingSDKConversationCSATDismissedOnSubmittion: \(String(describing: conversationID))")
        let response = ["eventName":"LPMessagingSDKConversationCSATDismissedOnSubmittion","conversationID":"\(String(describing: conversationID))"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)
    }
    
    internal func LPMessagingSDKConnectionStateChanged(_ isReady: Bool, brandID: String) {
        print("@@@ iOS ... LPMessagingSDKConnectionStateChanged: \(isReady), \(brandID)")

        
        var response:[String:String];
        
        response = ["eventName":"LPMessagingSDKConnectionStateChanged","connectionState":"\(isReady)"];
        let jsonString = self.convertDicToJSON(dic: response)
        
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)


    }
    
    internal func LPMessagingSDKOffHoursStateChanged(_ isOffHours: Bool, brandID: String) {
        print("@@@ ios... LPMessagingSDKOffHoursStateChanged: \(isOffHours), \(brandID)")
        var response:[String:String];
        
        response = ["eventName":"LPMessagingSDKOffHoursStateChanged","isOffHours":"\(isOffHours)"];
        let jsonString = self.convertDicToJSON(dic: response)
        
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)
    }
    
    internal func LPMessagingSDKConversationViewControllerDidDismiss() {
    
        print("@@@ ios ... LPMessagingSDKConversationViewControllerDidDismiss")
        var response:[String:String];
        response = ["eventName":"LPMessagingSDKConversationViewControllerDidDismiss"];
        let jsonString = self.convertDicToJSON(dic: response)
        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:jsonString)
        pluginResult?.setKeepCallbackAs(true)
        self.globalCallbackCommandDelegate?.send(pluginResult, callbackId: self.globalCallbackCommand?.callbackId)

        
    }
    
}
