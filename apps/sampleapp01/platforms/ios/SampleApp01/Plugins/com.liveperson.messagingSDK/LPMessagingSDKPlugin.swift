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

@objc(LPMessagingSDKPlugin) class LPMessagingSDKPlugin: CDVPlugin/*, LPMessagingSDKdelegate*/ {
    

    // adding delegates and callbacks for Cordova to notify javascript wrapper when functions complete
    var callBackCommandDelegate: CDVCommandDelegate?
    var callBackCommand:CDVInvokedUrlCommand?


    override init() {
        super.init()
    }
    
    override func pluginInitialize() {
        
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
            try LPMessagingSDK.instance.initialize("90233546")
            setSDKConfigurations(config:config!)
            self.set_lp_callbacks(command)
            sendEventToJavaScript(dicValue:[
                "eventName":"LPMessagingSDKInitSuccess",
                "message" : "LPMessagingSDK Initialization successful:"
                ])

        } catch let error as NSError {
            // throw error callback here!
            
            sendEventToJavaScript(dicValue:[
                "eventName":"LPMessagingSDKInitError",
                "errorMessage" : "LPMessagingSDK Initialization error: \(error)"
                ])

            print("LPMessagingSDK Initialization error: \(error)")
        }
        
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

       
    }

    // Assign values to our objects for triggering JS callbacks in the wrapper once native methods complete
    func set_lp_callbacks(_ command: CDVInvokedUrlCommand) {
        self.callBackCommandDelegate = commandDelegate
        self.callBackCommand = command
        LPMessagingSDKCallBackWrapper.sharedInstance.setLPMessagingCallBacks(callBackCommandDelegate, callBackCommand: callBackCommand)
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
        container.authenticationCode = authenticationCode
        
        let conversationQuery = LPMessagingSDK.instance.getConversationBrandQuery(brandID)
        if authenticationCode == nil {
////            LPMessagingSDK.instance.delegate = self // callbacks fire in this controller class
            LPMessagingSDK.instance.showConversation(conversationQuery)
       }else{
            // callbacks will fire in the container ContainerViewController class
//           LPMessagingSDK.instance.showConversation(conversationQuery, authenticationCode: authenticationCode,containerViewController:container)

            LPMessagingSDK.instance.showConversation(conversationQuery,authenticationCode: authenticationCode)
        
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
