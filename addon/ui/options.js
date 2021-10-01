"use strict";

import { getCodes, storeCodes } from "/utils/storage.js";

async function loadCurrentOptions() {
    document.querySelector("form").reset();
    let codes = await getCodes();
    let innerHTML = codes.map(item => getCodeRow(item)).join("");
    document.querySelector("#currentCodes").innerHTML = innerHTML;
}

async function saveOptions(e) {
    let codes = await getCodes()
    let newCode = {domain: document.querySelector("#domain").value, codeName: document.querySelector("#codeName").value};
    await storeCodes([...codes, newCode]);
    await loadCurrentOptions();
    e.preventDefault();
}

async function removeCode(e) {
    if (e.target.className != "removeCode") {
        return;
    }
    let codeToRemove = e.target.getAttribute("data-codename");
    let codes = await getCodes();
    let filteredCodes = codes.filter(code => code.codeName != codeToRemove);
    await storeCodes(filteredCodes);
    await loadCurrentOptions();
}

function getCodeRow(codeSetting) {
    return `<tr><td>${codeSetting.domain}</td><td>${codeSetting.codeName}</td><td class="removeCode" data-codename="${codeSetting.codeName}">❌</td></tr>`
}

document.addEventListener("DOMContentLoaded", loadCurrentOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("#currentCodes").addEventListener("click", removeCode);
