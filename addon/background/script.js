"use strict";

async function message(json) {
    let reply = await browser.runtime.sendNativeMessage("yubikey_bridge", json);
    if (reply["type"] == "exception") {
        console.log(reply["exception"])
    }
    if (reply["type"] == "error") {
        console.log(reply["error"])
    }
    console.log(reply)
    return reply
}

var accounts = null

async function listAccounts() {
    let reply = await message({ "type": "listAccounts" })
    return reply.accounts
}

async function setupMenus() {
    browser.menus.create({
        id: "generate-otp",
        title: "Generate OTP",
        documentUrlPatterns: ["https://*/*", "http://*/*"],
        contexts: ["editable"],
    });


    browser.menus.create({
        id: "guess",
        title: "Guess",
        parentId: "generate-otp"
    })

    browser.menus.create({
        type: "separator",
        parentId: "generate-otp"
    })



    accounts = await listAccounts()
    accounts.forEach((account) => {
        browser.menus.create({
            id: account,
            title: account,
            parentId: "generate-otp",
        })
    })

}

browser.menus.onHidden.addListener(async (info) => {
    browser.menus.removeAll()
    setupMenus()
})

browser.menus.onClicked.addListener(async (info, tab) => {
    if (id == "guess") {
        accounts.find((account) => {
            const [issuer, user, _] = account.split(/:(.*)/s)
            return tab.url.search(new RegExp(issuer, 'i'))
        })

    }
    console.log(info, tab)
})


setupMenus()


function onResponse(message) {
    console.log("Received: " + JSON.stringify(message));
    if (message.type === "otpResponse") {
        injectOtp(message["target"], message["otp"]);
    }
}


function getNativePort() {
    return browser.runtime.connectNative("yubikey_bridge");
}

async function generateOtp(info, tab) {
    let targetParams = getTargetParams(info, tab);
    let keyName = await getKeyName(info["pageUrl"]);
    let message = {
        "type": "generateOtp",
        "target": targetParams,
        "keyName": keyName
    };
    console.log("Sent message: " + JSON.stringify(message));
    let sending = browser.runtime.sendNativeMessage("yubikey_bridge", message);
    sending.then(onResponse)
}

async function getKeyName(url) {
    let codes = await getCodes();
    let codesMap = new Map(codes.map(i => [i.domain, i.codeName]));
    let host = url.match(/:\/\/(.[^/]+)/)[1];
    return codesMap.get(host);
}

function getTargetParams(info, tab) {
    return {
        tabId: tab.id,
        frameId: info.frameId,
        targetElementId: info.targetElementId,
    };
}

async function injectOtp(targetParams, otp) {
    await browser.tabs.executeScript(targetParams.tabId, {
        runAt: "document_start",
        frameId: targetParams.frameId,
        file: "/content_scripts/content.js",
    });
    await browser.tabs.sendMessage(targetParams.tabId, {
        "targetElementId": targetParams["targetElementId"],
        "otp": otp
    });
}
