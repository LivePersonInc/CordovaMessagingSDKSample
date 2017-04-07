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


class ContainerViewController: UIViewController {
    var brandID: String!
    var authenticationCode:String!
//    var config:[String:AnyObject]!
      // ViewController Lifecycle
    override func viewDidLoad() {
        self.navigationItem.leftBarButtonItem = UIBarButtonItem(title: "Back", style: .plain, target: self, action: #selector(ContainerViewController.backToMainScreen))

        if authenticationCode != nil {
            self.showConversationWithAuthentication()
        }else{
            self.showConversation()
        }
    }
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
        LPMessagingSDK.instance.showConversation(conversationQuery, authenticationCode: self.authenticationCode,containerViewController: self)
    }
    // MARK: IBActions
    func backToMainScreen() {
        self.navigationController?.dismiss(animated: true, completion: {
            let conversationQuery = LPMessagingSDK.instance.getConversationBrandQuery(self.brandID)
            LPMessagingSDK.instance.removeConversation(conversationQuery)
        })
    }
    

}
