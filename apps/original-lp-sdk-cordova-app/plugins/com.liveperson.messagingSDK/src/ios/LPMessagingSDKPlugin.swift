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
        self.showConversation(brandID: brandID)
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
        self.setUserProfile(brandID: brandID, firstName: firstName, lastName: lastName, nickName: nickName, uid: nil, profileImageURL: imageURL, phoneNumber: phoneNumber, employeeID: nil)
    }
    
    // MARK: MessagingSDK API
    /**
     Show conversation screen and use this ViewController as a container
     */
    func showConversation(brandID: String) {
        //        let container = ContainerViewController()
        //        container.brandID = brandID
        //        let navigationController = UINavigationController(rootViewController: container)
        //        UIApplication.shared.keyWindow?.rootViewController?.present(navigationController, animated: false, completion: nil)
        
        let conversationQuery = LPMessagingSDK.instance.getConversationBrandQuery(brandID)
        LPMessagingSDK.instance.showConversation(conversationQuery)
    }
    
    /**
     Set user profile for the consumer
     */
    func setUserProfile(brandID: String, firstName: String?, lastName: String?, nickName: String?, uid: String?, profileImageURL: String?, phoneNumber: String?, employeeID: String?) {
        let user = LPUser(firstName: firstName, lastName: lastName, nickName: nickName,  uid: uid, profileImageURL: profileImageURL, phoneNumber: phoneNumber, employeeID: employeeID)
        LPMessagingSDK.instance.setUserProfile(user, brandID: brandID)
    }
    
    /**
     Change default SDK configurations
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
    
    // MARK: LPMessagingSDKDelegate
    func LPMessagingSDKCustomButtonTapped() {
        print("LPMessagingSDKCustomButtonTapped")
    }
    
    func LPMessagingSDKAgentDetails(_ agent: LPUser?) {
        print("LPMessagingSDKAgentDetails: \(agent?.nickName)")
    }
    
    func LPMessagingSDKActionsMenuToggled(_ toggled: Bool) {
        print("LPMessagingSDKActionsMenuToggled")
    }
    
    func LPMessagingSDKHasConnectionError(_ error: String?) {
        print("LPMessagingSDKHasConnectionError")
    }
    
    func LPMessagingSDKCSATScoreSubmissionDidFinish(_ brandID: String, rating: Int) {
        print("LPMessagingSDKCSATScoreSubmissionDidFinish: \(brandID)")
    }
    
    func LPMessagingSDKObseleteVersion(_ error: NSError) {
        print("LPMessagingSDKObseleteVersion: \(error)")
    }
    
    func LPMessagingSDKAuthenticationFailed(_ error: NSError) {
        print("LPMessagingSDKAuthenticationFailed: \(error)")
    }
    
    func LPMessagingSDKTokenExpired(_ brandID: String) {
        print("LPMessagingSDKTokenExpired: \(brandID)")
    }
    
    func LPMessagingSDKError(_ error: NSError) {
        print("LPMessagingSDKError: \(error)")
    }
    
    func LPMessagingSDKAgentIsTypingStateChanged(_ isTyping: Bool) {
        print("LPMessagingSDKAgentIsTypingStateChanged: \(isTyping)")
    }
    
    func LPMessagingSDKConversationStarted(_ conversationID: String?) {
        print("LPMessagingSDKConversationStarted: \(conversationID)")
    }
    
    func LPMessagingSDKConversationEnded(_ conversationID: String?) {
        print("LPMessagingSDKConversationEnded: \(conversationID)")
    }
    
    func LPMessagingSDKConversationCSATDismissedOnSubmittion(_ conversationID: String?) {
        print("LPMessagingSDKConversationCSATDismissedOnSubmittion: \(conversationID)")
    }
    
    func LPMessagingSDKConnectionStateChanged(_ isReady: Bool, brandID: String) {
        print("LPMessagingSDKConnectionStateChanged: \(isReady), \(brandID)")
    }
    
    func LPMessagingSDKOffHoursStateChanged(_ isOffHours: Bool, brandID: String) {
        print("LPMessagingSDKOffHoursStateChanged: \(isOffHours), \(brandID)")
    }
    
    func LPMessagingSDKConversationViewControllerDidDismiss() {
        print("LPMessagingSDKConversationViewControllerDidDismiss")
    }
    
}
