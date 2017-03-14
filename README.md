# Cordova Messaging Plugin

## Wrapper file: `plugins/MessagingSDKPlugin/www/LPMessagingSDK.js`

This is where we expose the different function names within the wrapper to call the native code for starting, configuring a messaging conversation.
In the current version there is just one function exposed which takes in an "action" arg for telling the native code what to do.
You must also supply a successCallback js func / errorCallback js func / account id (clone or prod) + any arguments needed by the function.

### API Function definition

```js
lp_conversation_api: function(action, args, successCallback, errorCallback)
```

Supported values for `action` :

### `"lp_sdk_init"`

Must be called before trying to use any other methods.
Requires the account number to be passed within `args` parameter

sample call...

```js
var success = function(message) {
    console.log("OnEvent JS: " + message);
}

var failure = function() {
    console.log("Error calling lp_conversation_api Plugin");
}

lpMessagingSDK.lp_conversation_api("lp_sdk_init", ["123456"], success, failure);

```

### `"start_lp_conversation"`

Used to open the Messaging conversation window and connect to LivePerson.

Includes support for authentication JWT token for implicit flow 

```js
var authenticationCode = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIrOTcyLTMtNTU1NS01NTUiLCJpc3MiOiJodHRwczovL2lkcC5saXZlcGVyc29uLm5ldCIsImF1ZCI6ImFjYzpxYTU3MjIxNjc2IiwiZXhwIjoxNTM0OTcxOTMwLCJpYXQiOjE0NzE4OTk5NDIsIm5hbWUiOiJFaXRhbiJ9.Fh0sG-iu-VMZRFRbUNK0kEzb7Y1BXtQHOKaHL2y40y_c4mBvmQDCOYNWJ1ZEeayTNuLboYx6L8xEoC5xZIFnVv2N4a36BBU88fNuhe9Em2b5qNdVbdBtIJQoBY5ep5O2geAaCVA7A7oS8ysWVGn9CV4btH_D5sU2jGr3ml8yfJA"

lpMessagingSDK.lp_conversation_api(
    "start_lp_conversation", 
    [
        "123456",
        authenticationCode
    ],
    success,
    failure);
```

`authenticationCode` is optional arg parameter. If omitted then the conversation will be **unauthenticated**


### `"set_lp_user_profile"`

Used to send **unauthenticated** customer information to the agent 

`args` array parameter mapping:

+ `1` : accountId : "123456"
+ `2` : first name : "John"
+ `3` : last name : "Doe"
+ `4` : nickname : "JD"
+ `5` : profile image url : "https://s-media-cache-ak0.pinimg.com/564x/a2/c7/ee/a2c7ee8982de3bae503a730fe4562cf9.jpg"
+ `6` : customer phone number : "555-444-12345"

```js
lpMessagingSDK.lp_conversation_api(
    "set_lp_user_profile",
    [
            "123456",
            "John",
            "Doe",
            "JD",
            "https://s-media-cache-ak0.pinimg.com/564x/a2/c7/ee/a2c7ee8982de3bae503a730fe4562cf9.jpg",
            "555-444-12345"
    ],
    success,
    failure
);
```

__If you wish to send secure, authenticated information about the customer to your agent, it should be encoded and encrypted within your JWT token__

[https://s3-eu-west-1.amazonaws.com/ce-sr/CA/security/Authenticated+Interactions+with+oAuth+2.0.pdf](https://s3-eu-west-1.amazonaws.com/ce-sr/CA/security/Authenticated+Interactions+with+oAuth+2.0.pdf)

For a list of supported engagement attributes see the following example JWT:

```json
{
  "sub": "TALKTALK-ID-1234567890",
  "iss": "https://www.talktalk.co.uk",
  "exp": 1514718671000,
  "iat": 1487159337000,
  "phone_number": "+1-10-344-3765333",
  "lp_sdes": [
    {
      "type": "ctmrinfo",
      "info": {
        "cstatus": "cancelled",
        "ctype": "vip",
        "customerId": "138766AC",
        "balance": -400.99,
        "socialId": "11256324780",
        "imei": "3543546543545688",
        "userName": "user000",
        "companySize": 500,
        "accountName": "bank corp",
        "role": "broker",
        "lastPaymentDate": {
          "day": 15,
          "month": 10,
          "year": 2014
        },
        "registrationDate": {
          "day": 23,
          "month": 5,
          "year": 2013
        }
      }
    },
    {
      "type": "personal",
      "personal": {
        "firstname": "John99",
        "lastname": "Beadle99",
        "age": {
          "age": 34,
          "year": 1980,
          "month": 4,
          "day": 15
        },
        "contacts": [
          {
            "email": "jbeadle99@liveperson.com",
            "phone": "+1 212-788-8877"
          }
        ],
        "gender": "MALE"
      }
    }
  ]
}
```