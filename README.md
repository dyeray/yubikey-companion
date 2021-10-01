# Yubikey Companion

**Allows one-click input of totp codes from your Yubikey**

## How it works ##

This extension adds a context menu on text areas that requests a otp code for the current
website to your Yubikey. The code returned is inserted in the text area.

## Installation ##

1. Install the addon.
2. Copy app/yubikey_bridge.py somewhere in your harddrive.
3. Edit yubikey_bridge.json and set the "path" key to reference the path of yubikey_bridge.py in your computer.
4. Copy yubikey_bridge.json to /usr/lib/mozilla/native-messaging-hosts/ (or, depending on your OS, follow the instructions here: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#manifest_location).

This addon requires ykman tool for your Yubikey to be installed and added to the path: https://developers.yubico.com/yubikey-manager/.

## Linking a new code for the addon ##

Unlike U2F or Webauthn tokens, TOTP tokens stored on your Yubikey are not linked to a specific website, so in order to use them with one click, you need to specify to what website does each token match. For this, you must:

1. Run `ykman oath accounts code`. This will show the name of each TOTP code you have stored on your yubikey.
2. You can add each code you want available with one-click with the domain it applies to ([see example](docs/options.jpg)).
3. Once added, you can input your code with right click on the code text input and selecting "Generate OTP" on the menu (you will need to touch your Yubikey if configured to request it).