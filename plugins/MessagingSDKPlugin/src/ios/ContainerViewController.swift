//
//  ContainerViewController.swift
//  LPSDKCordovaSample
//
//  Created by Nir Lachman on 09/11/2016.
//  Updated by John Beadle and Omer Maroof 13/03/2017
//
//

import Foundation
import LPMessagingSDK
import LPInfra
import LPAMS


class ContainerViewController: UIViewController, LPMessagingSDKdelegate {
    var brandID: String!
    var authenticationCode: String? // placeholder for JWT token for authentication
    var firstName: String?
    var lastName: String?
    var nickName: String?
    var phoneNumber: String?

    // callbacks for CordovaPluginResults
    var callBackCommandDelegate: CDVCommandDelegate?
    var callBackCommand:CDVInvokedUrlCommand?
    
    // ViewController Lifecycle
    override func viewDidLoad() {
        self.navigationItem.leftBarButtonItem = UIBarButtonItem(title: "Back", style: .plain, target: self, action: #selector(ContainerViewController.backToMainScreen))
        self.title = self.brandID
        
        LPMessagingSDK.instance.delegate = self
        self.setUserProfile()
        self.setSDKConfigurations()

        // UPDATED: conditional logic to support authenticated conversations when the authenticationCode has been set, else fallback to default
        if authenticationCode != nil {
            self.showConversationWithAuthentication()
        }else{
            self.showConversation()
        }
        
    }
    
    // MARK: IBActions
    func backToMainScreen() {
        self.navigationController?.dismiss(animated: true, completion: {
            let conversationQuery = LPMessagingSDK.instance.getConversationBrandQuery(self.brandID)
            LPMessagingSDK.instance.removeConversation(conversationQuery)
        })
    }
    
    // MARK: MessagingSDK API
    /**
     Show conversation screen and use this ViewController as a container
     */
    func showConversation() {
        let conversationQuery = LPMessagingSDK.instance.getConversationBrandQuery(self.brandID)
        LPMessagingSDK.instance.showConversation(conversationQuery, containerViewController: self)
    }
    
    /*
    show conversation and use this ViewController as a container
    alternative method for starting authenticated messaging conversations
    passes in the JWT token supplied from Javascript via the Cordova Plugin bridge
    */
    func showConversationWithAuthentication(){
         let conversationQuery = LPMessagingSDK.instance.getConversationBrandQuery(self.brandID)
          LPMessagingSDK.instance.showConversation(conversationQuery, authenticationCode: self.authenticationCode)
    }
    

    /**
     Set user profile for the consumer
     */
    func setUserProfile() {
        let user = LPUser(firstName: self.firstName, lastName: self.lastName, nickName: self.nickName,  uid: nil, profileImageURL: nil, phoneNumber: phoneNumber, employeeID: nil)
        LPMessagingSDK.instance.setUserProfile(user, brandID: self.brandID)
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
