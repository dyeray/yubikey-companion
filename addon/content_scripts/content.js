"use strict";

browser.runtime.onMessage.addListener(request => {
    let elem = browser.menus.getTargetElement(request.targetElementId);
    elem.value = request.otp;
});
