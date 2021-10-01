async function getCodes() {
    let data = await browser.storage.local.get("codes");
    return data.codes || [];
}

async function storeCodes(codes) {
    await browser.storage.local.set({codes: codes});
}

export {getCodes, storeCodes};
