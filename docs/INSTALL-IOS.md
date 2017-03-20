
Create cordova sample app

Add iOS platform

Add SDK plugin with latest version

---- DO NOT RUN BUILD on CLI until you have been into XCODE! ---

Open project workspace in XCODE
    accept all recommend project settings
    select project
    add embedded binaries for the SDK and frameworks
    CLEAN PROJECT!
    BUILD PROJET! == should pass - you will warnings about missing cordova libs as we have not "built in cordova" yet!

go back to CLI


Modify sampleapp/ index.html and js/index.js as these are Cordova defaults that you cannot edit?!

run cordova build ios command
    should succeed

run in xcode or CLI

    if you get a build/run error like this: 

    then edit this file -- platforms/ios/cordova/lib/start-emulator and change the default iOS emulator to run
    or
    add iPhone 5s to your list of emulated devices



