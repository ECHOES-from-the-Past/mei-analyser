import {
    viewDatabaseButton,
    searchModeButton, crossComparisonModeButton,
    clientStatus, clientVersion, refreshWheel,
    databaseList,
    aquitanianCheckbox, squareCheckbox,
    modeCheckboxes, allModeCheckbox, unknownModeCheckbox,
    liquescentCheckbox, quilismaCheckbox, oriscusCheckbox,
    exactPitchRadio, contourRadio, patternInputBox,
    searchButton,
    melismaIncrement, melismaDecrement, melismaInput,
    clearPatternInputButton,
    customGABCCheckbox,
    aquitanianPitchCheckbox,
    patternInputStatus,
    melismaEnableCheckbox,
    scrollUpButton,
} from './DOMelements.mjs';
import {
    persist, retrieve, env
} from './utility/utils.js';
import {
    clearSearchResultsAndInfo,
    performSearch, createResultTable
} from './client/search.js';

import packageJSON from '../package.json';

/* ----------------------- Persistence Layer ----------------------- */
function loadPersistedSearchOptions() {
    console.log("Loading persisted search options...");

    aquitanianCheckbox.checked = retrieve('aquitanianCheckbox') === null ? true : retrieve('aquitanianCheckbox');
    squareCheckbox.checked = retrieve('squareCheckbox');

    modeCheckboxes.forEach((checkbox, index) => {
        checkbox.checked = retrieve(`mode${index + 1}Checkbox`);
    });

    allModeCheckbox.checked = retrieve('allModeCheckbox');
    if (retrieve("allModeCheckbox") === null) {
        allModeCheckbox.click();
    }
    unknownModeCheckbox.checked = retrieve('unknownModeCheckbox');

    liquescentCheckbox.checked = retrieve('liquescentCheckbox');
    quilismaCheckbox.checked = retrieve('quilismaCheckbox');
    oriscusCheckbox.checked = retrieve('oriscusCheckbox');

    melismaInput.value = retrieve('melismaInput') === null ? 6 : retrieve('melismaInput');

    switch (retrieve('melodicPatternSearchMode')) {
        case 'exact-pitch':
            exactPitchRadio.checked = true;
            break;
        case 'contour':
            contourRadio.checked = true;
            break;
    }

    patternInputBox.value = retrieve('patternInputBox');

    // Other options
    customGABCCheckbox.checked = retrieve('customGABCCheckbox');
    aquitanianPitchCheckbox.checked = retrieve('aquitanianPitchCheckbox');
    melismaEnableCheckbox.checked = retrieve('melismaEnableCheckbox');
}

let databaseIsOpen = false;

/** --------------- WINDOW and DOM level functions --------------- */
/**
 * Dynamically redraw the MEI content when the window is resized
 * See: https://www.geeksforgeeks.org/how-to-wait-resize-end-event-and-then-perform-an-action-using-javascript/
*/
let timeOutFunctionId;
window.onresize = () => {
    clearTimeout(timeOutFunctionId);
    console.log('Resizing...');
    timeOutFunctionId = setTimeout(() => {
        console.log('Resized!');
    }, 500);
}

/**
* Load predefined files when DOM is loaded
*/
document.addEventListener("DOMContentLoaded", () => {
    const buildVersion = packageJSON.version;

    loadPersistedSearchOptions();

    // Display the client version
    clientVersion.textContent = `Version: ${buildVersion}`;

    if (env === 'development') {
        clientVersion.textContent += " (Development)";
    }

    // Clear the chant list if the version is less than 0.3.0
    if (retrieve('version') !== buildVersion) {
        localStorage.removeItem('chantList');
    }

    persist('version', buildVersion);
    invalidOptions();
});

window.addEventListener("change", () => {
    invalidOptions();
});


/* --------------- SEARCH PANEL PERSISTANCE --------------- */
allModeCheckbox.addEventListener("change", () => {
    modeCheckboxes.forEach((checkbox, index) => {
        checkbox.checked = allModeCheckbox.checked;
        persist(`mode${index + 1}Checkbox`, checkbox.checked);
        persist('allModeCheckbox', allModeCheckbox.checked);
    });
});

exactPitchRadio.addEventListener("change", () => {
    persist('melodicPatternSearchMode', 'exact-pitch')
});

contourRadio.addEventListener("change", () => {
    persist('melodicPatternSearchMode', 'contour')
});

patternInputBox.addEventListener("input", () => {
    persist('patternInputBox', patternInputBox.value);
});



function invalidOptions() {
    if (!aquitanianCheckbox.checked && !squareCheckbox.checked) {
        clientStatus.textContent = "Please select at least one notation type";
        clientStatus.style.color = "red";
        clientStatus.hidden = false;
        searchButton.disabled = true;
        return;
    }

    let allCheckboxUnchecked = () => {
        for (let checkbox of modeCheckboxes) {
            if (checkbox.checked) {
                return false;
            }
        }
        return true;
    }
    if (allCheckboxUnchecked() && !unknownModeCheckbox.checked) {
        clientStatus.textContent = "Please select at least one mode";
        clientStatus.style.color = "red";
        clientStatus.hidden = false;
        searchButton.disabled = true;
        return;
    }

    if (!aquitanianCheckbox.checked && squareCheckbox.checked &&
        allCheckboxUnchecked() && unknownModeCheckbox.checked) {
        clientStatus.textContent = "Please select at least one mode or uncheck 'Unknown Mode'";
        clientStatus.style.color = "red";
        clientStatus.hidden = false;
        searchButton.disabled = true;
        return;
    } else {
        clientStatus.hidden = true;
        searchButton.disabled = false;
    }
}

