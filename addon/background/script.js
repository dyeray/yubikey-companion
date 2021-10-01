"use strict";
import { getCodes } from "/utils/storage.js";

var port = getNativePort();

port.onMessage.addListener((message) => {
    console.log("Received: " + JSON.stringify(message));
    if (message.type === "otpResponse") {
        injectOtp(message["target"], message["otp"]);
    }
});

browser.menus.create({
    id: "generate-otp",
    title: "Generate OTP",
    documentUrlPatterns: ["https://*/*", "http://*/*"],
    contexts: ["editable"],
    onclick(info, tab) {
        if (info.menuItemId === "generate-otp") {
            generateOtp(info, tab);
        }
    }
});

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
    port.postMessage(message);
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
