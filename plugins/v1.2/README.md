Pleas refer to the README file in the root folder of this repo for all the latest details and instructions for installation.

# v1.2 Release Notes

this version of the plugin includes ...

+ iOS-hotfix-v2.1.2
+ authentication first attempt with hard coded JWT example
+ callback functions using wrapper class #5
+ Android callbacks using iOS naming conventions #5

## iOS Hotfix 2.1.2

https://github.com/LP-Messaging/iOS-Messaging-SDK/releases/tag/2.1.2

### Bug: Gap between input area and keyboard in ViewController mode

#### Symptom :
In ViewController mode, a gap may appear between the user input text view and the keyboard. The root cause is from an app that has any footer view such as UITabBar.

#### Fix :
ViewController now fits the container frame on every container frame change. This will fix the gap display issue.

+ includes the iOS v.2.1.1 frameworks in the plugin src to fix 2 key bugs documented in the link above.
+ follow the INSTALL-IOS.md file for instructions and notes.


## iOS Hotfix 2.1.1

https://github.com/LP-Messaging/iOS-Messaging-SDK/releases/tag/2.1.1

### Bug: Reconnect failures in conversation screen

#### Symptom :
When the JWT expires, the SDK calls a LPMessagingSDKTokenExpired callback and the host app calls the reconnect API. In that case, the Web socket failed to connect and the user was unable to send and receive messages. The only solution was for users to get out of the conversation screen and re-enter.

#### Fix :
Web socket now reconnects correctly when the JWT expires by using a new Auth code.

### Bug: Failed to remove custom button image in Window mode in LPConfig

#### Symptom :
Brands that are using the Window mode and did not set the custom button image or wanted to remove it in LPConfig, received a button with title “item”.

CustomButtonItem

#### Fix:
Custom button in LPConfig is now only displayed once it is set. The ‘item’ text will not appear.