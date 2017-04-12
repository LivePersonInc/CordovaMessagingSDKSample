//
//  LPMessagingSDK.swift
//  LPSDKCordovaSample
//
//  Created by Nir Lachman on 09/11/2016.
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


    override init() {
        super.init()
    }
    
    override func pluginInitialize() {
        
    }
    
    func lp_sdk_init(_ command: CDVInvokedUrlCommand) {
        guard let brandID = command.arguments.first as? String else {
            print("Can't init without brandID")
            return
        }
        
        do {
            try LPMessagingSDK.instance.initialize(brandID)
        } catch let error as NSError {
            print("LPMessagingSDK Initialization error: \(error)")
        }
        LPMessagingSDK.instance.delegate = self
    }
    
    func start_lp_conversation(_ command: CDVInvokedUrlCommand) {
        print("args = \(command.arguments)")
        guard let brandID = command.arguments.first as? String else {
            print("Can't start without brandID")
            return
        }
        
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

        // init our callbacks for javascript wrapper
        self.set_lp_callbacks(command)

    }

    // Assign values to our objects for triggering JS callbacks in the wrapper once native methods complete
    func set_lp_callbacks(_ command: CDVInvokedUrlCommand) {
        self.callBackCommandDelegate = commandDelegate
        self.callBackCommand = command
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
    }
    
    // MARK: MessagingSDK API
    /**
     Show conversation screen and use this ViewController as a container
     */
    func showConversation(_ brandID: String, authenticationCode:String? = nil) {
        let container = ContainerViewController()
        container.brandID = brandID
        container.authenticationCode = authenticationCode // assign the JWT token to the variable in the ContainerViewController class
        container.callBackCommand = self.callBackCommand
        container.callBackCommandDelegate = self.callBackCommandDelegate
        // let navigationController = UINavigationController(rootViewController: container)
        // UIApplication.shared.keyWindow?.rootViewController?.present(navigationController, animated: false, completion: nil)
       

        let conversationQuery = LPMessagingSDK.instance.getConversationBrandQuery(brandID)
        if authenticationCode == nil {
            LPMessagingSDK.instance.delegate = self // callbacks fire in this controller class
            LPMessagingSDK.instance.showConversation(conversationQuery)
       }else{
            // callbacks will fire in the container ContainerViewController class
           LPMessagingSDK.instance.showConversation(conversationQuery, authenticationCode: authenticationCode,containerViewController:container)
       }
    }
    
    /**
     Set user profile for the consumer
     */
    func setUserProfile(_ brandID: String, firstName: String?, lastName: String?, nickName: String?, uid: String?, profileImageURL: String?, phoneNumber: String?, employeeID: String?) {
        let user = LPUser(firstName: firstName, lastName: lastName, nickName: nickName,  uid: uid, profileImageURL: profileImageURL, phoneNumber: phoneNumber, employeeID: employeeID)
        LPMessagingSDK.instance.setUserProfile(user, brandID: brandID)
    }
    
    /**
     Change default SDK configurations

     TODO: update method to support config and branding changes via a JSON object sent through via the cordova wrapper to change the settings here.

     TODO: Add support for other config options as per SDK documentation
     */
    func setSDKConfigurations() {
        let configurations = LPConfig.defaultConfiguration
        configurations.remoteUserBubbleBackgroundColor = UIColor.purple
        configurations.remoteUserBubbleBorderColor = UIColor.purple
        configurations.remoteUserBubbleTextColor = UIColor.white
        configurations.remoteUserAvatarIconColor = UIColor.white
        configurations.remoteUserAvatarBackgroundColor = UIColor.purple
        
        configurations.brandName = "LPMessagingSampleBrand"
        configurations.userBubbleBackgroundColor = UIColor.lightGray
        configurations.userBubbleTextColor = UIColor.white
        
        configurations.sendButtonEnabledTextColor = UIColor.purple
    }
    
    func LPMessagingSDKCustomButtonTapped() {
        print("LPMessagingSDKCustomButtonTapped")
        sendEventToJavaScript(event: "LPMessagingSDKCustomButtonTapped")
    }
    
    func LPMessagingSDKAgentDetails(_ agent: LPUser?) {
        print("LPMessagingSDKAgentDetails: \(agent?.nickName)")
        sendEventToJavaScript(event: "LPMessagingSDKAgentDetails: \(agent?.nickName)")
    }
    
    func LPMessagingSDKActionsMenuToggled(_ toggled: Bool) {
        print("LPMessagingSDKActionsMenuToggled")
        sendEventToJavaScript(event: "LPMessagingSDKActionsMenuToggled")
    }
    
    func LPMessagingSDKHasConnectionError(_ error: String?) {
        print("LPMessagingSDKHasConnectionError")
        sendEventToJavaScript(event: "LPMessagingSDKHasConnectionError")
    }
    
    func LPMessagingSDKCSATScoreSubmissionDidFinish(_ brandID: String, rating: Int) {
        print("LPMessagingSDKCSATScoreSubmissionDidFinish: \(brandID)")
        sendEventToJavaScript(event: "LPMessagingSDKCSATScoreSubmissionDidFinish: \(brandID)")
    }
    
    func LPMessagingSDKObseleteVersion(_ error: NSError) {
        print("LPMessagingSDKObseleteVersion: \(error)")
        sendEventToJavaScript(event:"LPMessagingSDKObseleteVersion: \(error)")
    }
    
    func LPMessagingSDKAuthenticationFailed(_ error: NSError) {
        print("LPMessagingSDKAuthenticationFailed: \(error)")
        sendEventToJavaScript(event:"LPMessagingSDKAuthenticationFailed: \(error)")
    }
    
    func LPMessagingSDKTokenExpired(_ brandID: String) {
        print("LPMessagingSDKTokenExpired: \(brandID)")
        sendEventToJavaScript(event:"onTokenExpired")
    }
    
    func LPMessagingSDKError(_ error: NSError) {
        print("LPMessagingSDKError: \(error)")
        sendEventToJavaScript(event:"LPMessagingSDKError: \(error)")
    }
    
    func LPMessagingSDKAgentIsTypingStateChanged(_ isTyping: Bool) {
        print("LPMessagingSDKAgentIsTypingStateChanged: \(isTyping)")
        sendEventToJavaScript(event:"LPMessagingSDKAgentIsTypingStateChanged: \(isTyping)")
    }
    
    func LPMessagingSDKConversationStarted(_ conversationID: String?) {
        print("LPMessagingSDKConversationStarted: \(conversationID)")
        sendEventToJavaScript(event:"LPMessagingSDKConversationStarted: \(conversationID)")
    }
    
    func LPMessagingSDKConversationEnded(_ conversationID: String?) {
        print("LPMessagingSDKConversationEnded: \(conversationID)")
        sendEventToJavaScript(event:"LPMessagingSDKConversationEnded: \(conversationID)")
    }
    
    func LPMessagingSDKConversationCSATDismissedOnSubmittion(_ conversationID: String?) {
        print("LPMessagingSDKConversationCSATDismissedOnSubmittion: \(conversationID)")
        sendEventToJavaScript(event:"LPMessagingSDKConversationCSATDismissedOnSubmittion: \(conversationID)")
    }
    
    func LPMessagingSDKConnectionStateChanged(_ isReady: Bool, brandID: String) {
        print("LPMessagingSDKConnectionStateChanged: \(isReady), \(brandID)")
        sendEventToJavaScript(event:"LPMessagingSDKConnectionStateChanged: \(isReady), \(brandID)")
    }
    
    func LPMessagingSDKOffHoursStateChanged(_ isOffHours: Bool, brandID: String) {
        print("LPMessagingSDKOffHoursStateChanged: \(isOffHours), \(brandID)")
        sendEventToJavaScript(event:"LPMessagingSDKOffHoursStateChanged: \(isOffHours), \(brandID)")
    }
    
    func LPMessagingSDKConversationViewControllerDidDismiss() {
        print("LPMessagingSDKConversationViewControllerDidDismiss")
        sendEventToJavaScript(event:"LPMessagingSDKConversationViewControllerDidDismiss")
    }
    func sendEventToJavaScript(event: String?) {
        if (self.callBackCommandDelegate != nil && self.callBackCommand != nil) {
           // sleep(10000)
            let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs:event)
            pluginResult?.setKeepCallbackAs(true)
            self.callBackCommandDelegate?.send(pluginResult, callbackId: self.callBackCommand?.callbackId)
           
        }
    }
    
}
