//
//  ContainerViewController.swift
//  LPSDKCordovaSample
//
//  Created by Nir Lachman on 09/11/2016.
//
//

import Foundation
import LPMessagingSDK
import LPInfra
import LPAMS


class ContainerViewController: UIViewController, LPMessagingSDKdelegate {
    var brandID: String!
    var firstName: String?
    var lastName: String?
    var nickName: String?
    var phoneNumber: String?
    
    // ViewController Lifecycle
    override func viewDidLoad() {
        self.navigationItem.leftBarButtonItem = UIBarButtonItem(title: "Back", style: .plain, target: self, action: #selector(ContainerViewController.backToMainScreen))
        self.title = self.brandID
        
        LPMessagingSDK.instance.delegate = self
        self.setUserProfile()
        self.setSDKConfigurations()
        self.showConversation()
        
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
    
    /**
     Set user profile for the consumer
     */
    func setUserProfile() {
        let user = LPUser(firstName: self.firstName, lastName: self.lastName, nickName: self.nickName,  uid: nil, profileImageURL: nil, phoneNumber: phoneNumber, employeeID: nil)
        LPMessagingSDK.instance.setUserProfile(user, brandID: self.brandID)
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
