"use strict";

import { getCodes, storeCodes } from "/utils/storage.js";

async function loadCurrentOptions(e) {
    document.querySelector("form").reset();
    let codes = await getCodes();
    let table = buildTable(codes);
    let codesNode = document.querySelector("#currentCodes");
    codesNode.textContent = "";
    codesNode.appendChild(table);
}

async function saveOptions(e) {
    e.preventDefault();
    let codes = await getCodes()
    let newCode = {domain: document.querySelector("#domain").value, codeName: document.querySelector("#codeName").value};
    await storeCodes([...codes, newCode]);
    await loadCurrentOptions();
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

function buildTable(codes) {
    let table = createElement("table");
    codes.map(item => { table.appendChild(buildRow(item)) });
    return table;
}

function buildRow(codeSetting) {
    let row = createElement("tr");
    row.appendChild(createElement("td", `${codeSetting.domain}`));
    row.appendChild(createElement("td", `${codeSetting.codeName}`));
    row.appendChild(createElement("td", `❌`, {"class": "removeCode", "data-codename": `${codeSetting.codeName}`}));
    return row;
}

function createElement(tagName, text = null, attributes = {}) {
    let element = document.createElement(tagName);
    if (text != null) {
        element.textContent = text;
    }
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    return element;
}

document.addEventListener("DOMContentLoaded", loadCurrentOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("#currentCodes").addEventListener("click", removeCode);
