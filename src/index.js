import {
    loadPersistedSearchOptions, 
    loadDatabaseToChant, 
    viewDatabase,
    showSearchResult,
} from './functionalities.js';
import {
    pitchRadio, 
    contourRadio, 
    searchQuery, 
    viewDatabaseButton, 
    fileInputLeft,
    fileInputRight,
    searchModeButton,
    crossComparisonModeButton,
    refreshDatabaseButton,
    devModeButton,
    databaseList,
    searchButton
} from './DOMelements.mjs';
import { 
    checkPersistanceExists, 
    persist,
    retrieve
} from './utility/utils.js';

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
        // drawMEIContent(sessionStorage.getItem('mei-content-1'), 1);
        // drawMEIContent(sessionStorage.getItem('mei-content-2'), 2);
        console.log('Resized!');
    }, 500);
}

/**
 * Load predefined files when DOM is loaded
 */
document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        loadPersistedSearchOptions();
        if (!checkPersistanceExists('chantList')) {
            loadDatabaseToChant();
        }
    }
}

/* --------------- TOP BUTTON Event Listeners --------------- */
searchModeButton.addEventListener("click", () => {
    document.getElementById('search-panel').hidden = false;
    document.getElementById('cross-comparison-panel').hidden = true;
});

crossComparisonModeButton.addEventListener("click", () => {
    document.getElementById('search-panel').hidden = true;
    document.getElementById('cross-comparison-panel').hidden = false;
});

refreshDatabaseButton.addEventListener("click", async () => {
    await loadDatabaseToChant();
    alert("Database refreshed!");
});

/**
 * Every element with class="devMode" is hidden by default.
 * When the devMode button is clicked, it will be toggled to true.
 */
devModeButton.addEventListener("click", () => {
    document.querySelectorAll('.devMode').forEach((element) => {
        element.hidden = !element.hidden;
    });
});

/* --------------- SEARCH PANEL PERSISTANCE --------------- */
pitchRadio.addEventListener("change", () => {
    persist('patternSearchMode', 'pitch');
});

contourRadio.addEventListener("change", () => {
    persist('patternSearchMode', 'contour');
});

searchQuery.addEventListener("input", () => {
    persist('searchQuery', searchQuery.value);
});

/* --------------- DATABASE PANEL PERSISTANCE --------------- */
let databaseIsOpen = false;
viewDatabaseButton.addEventListener("click", () => {
    if (databaseIsOpen === false) {
        viewDatabaseButton.textContent = "Close Database";
        viewDatabase();
    } else {
        databaseList.innerHTML = '';
        viewDatabaseButton.textContent = "View Database";
    }
    databaseIsOpen = !databaseIsOpen;
});

searchButton.addEventListener("click", () => {
    let chantList = retrieve('chantList');
    // perform search logic here
    // for example
    // perfr
    let resultChantList = chantList.filter(chant => chant.fileName.includes("AQUIT"));
    // display the result
    showSearchResult(resultChantList);
});

/* --------------- CROSS-COMPARISON PANEL PERSISTANCE --------------- */
/**
 * Upload file to a slot on the display (1: left, 2: right) for cross-comparison
 * @param {number} slot either 1 or 2
 */
async function uploadFile(slot) {
    clearHighlights();
    const uploaded_file = document.getElementById('file-input-' + slot).files[0];
    const objectURL = URL.createObjectURL(uploaded_file);

    const newContent = await loadMEIFile(objectURL, slot);
    drawMEIContent(newContent, slot);
    URL.revokeObjectURL(uploaded_file);
}

fileInputLeft.addEventListener("change", () => {
    uploadFile(1);
});

fileInputRight.addEventListener("change", () => {
    uploadFile(2);
});