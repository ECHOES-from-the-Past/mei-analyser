import {
    viewDatabaseButton,
    fileInputLeft, fileInputRight,
    searchModeButton, crossComparisonModeButton,
    refreshDatabaseButton, refreshStatus, clientVersion, refreshWheel,
    databaseList,
    aquitanianCheckbox, squareCheckbox,
    modeCheckboxes, allModeCheckbox, undetectedCheckbox,
    liquescentCheckbox, quilismaCheckbox, oriscusCheckbox,
    searchButton,
    searchResultDiv, chantSVG, chantDisplay, chantInfo,
    melismaIncrement, melismaDecrement,
    melismaInput,
} from './DOMelements.mjs';
import {
    drawSVGFromMEIContent, loadMEIFile,
    checkPersistanceExists, persist, retrieve
} from './utility/utils.js';
import {
    clearSearchResultsAndInfo,
    performSearch, showSearchResult
} from './search/search.js';

import database from './database/database.json';

import { Chant } from './utility/components.js';

/**
 * Obtain the current development or production environment
 * from Vite's `import.meta.env` object
 */
const env = import.meta.env.MODE;
console.debug(`Current environment: ${env}`);
const rootPath = "https://raw.githubusercontent.com/ECHOES-from-the-Past/GABCtoMEI/main/MEI_outfiles/";


/* ----------------------- Persistence Layer ----------------------- */
function loadPersistedSearchOptions() {
    console.log("Loading persisted search options...");
    // if (retrieve('patternSearchMode') == null) {
    //   persist('patternSearchMode', 'pitch');
    // }

    // retrieve('patternSearchMode') == 'pitch' ? pitchRadio.checked = true : contourRadio.checked = true;

    // searchQueryInput.value = retrieve('searchQuery');
    aquitanianCheckbox.checked = retrieve('aquitanianCheckbox') === null ? true : retrieve('aquitanianCheckbox');
    squareCheckbox.checked = retrieve('squareCheckbox');

    modeCheckboxes.forEach((checkbox, index) => {
        checkbox.checked = retrieve(`mode${index + 1}Checkbox`);
    });

    allModeCheckbox.checked = retrieve('allModeCheckbox');
    undetectedCheckbox.checked = retrieve('modeUndetectedCheckbox');

    liquescentCheckbox.checked = retrieve('liquescentCheckbox');
    quilismaCheckbox.checked = retrieve('quilismaCheckbox');
    oriscusCheckbox.checked = retrieve('oriscusCheckbox');

    melismaInput.value = retrieve('melismaInput') === null ? 6 : retrieve('melismaInput');
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
        // drawMEIContent(sessionStorage.getItem('mei-content-1'), 1);
        // drawMEIContent(sessionStorage.getItem('mei-content-2'), 2);
        console.log('Resized!');
    }, 500);
}

/*
document.onreadystatechange = () => {
    console.debug("Document ready state: " + document.readyState);
    switch (document.readyState) {
        case "loading": {
            // create a loading screen
            let loadingScreen = document.createElement('div');
            loadingScreen.innerHTML = "<h1>Loading...</h1>";
            loadingScreen.style = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);";
            document.body.appendChild(loadingScreen);
            break;
        }
        case "complete": {
            // await Promise.all([loadDatabaseToChant(), loadPersistedSearchOptions()]);
            loadPersistedSearchOptions();
            let remoteVersion = packageJSON.version;
            let localVersion = import.meta.env.VITE_APP_VERSION;
            console.log(`Remote version: ${remoteVersion}, Local version: ${localVersion}`);
            break;
        }
    }
}
*/

/**
* Load predefined files when DOM is loaded
*/
document.addEventListener("DOMContentLoaded", async () => {
    const packageJSON = await fetch("https://raw.githubusercontent.com/ECHOES-from-the-Past/mei-analyser/main/package.json")
        .then(response => response.json());

    loadPersistedSearchOptions();
    let remoteVersion = packageJSON.version;
    let localVersion = retrieve('version');
    console.log(`Newest version: ${remoteVersion}, Local version: ${localVersion}`);

    if (localVersion === null || localVersion !== remoteVersion) {
        await loadDatabaseToLocalStorage();
        localVersion = remoteVersion;
    }

    // Display the client version
    clientVersion.textContent = `Client version: ${localVersion} | Remote version: ${remoteVersion}`;
});

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
    clearSearchResultsAndInfo();
    await loadDatabaseToLocalStorage();
    if (databaseIsOpen) constructDatabaseList();
});

/* --------------------- DATABASE --------------------- */
/**
 * @async
 * @listens viewDatabaseButton
 * Displaying the database as a list of chants on the screen
 */
async function constructDatabaseList() {
    /** @type {Chant[]} */
    const chantList = retrieve('chantList');
    databaseList.innerHTML = '';
    for (let chant of chantList) {
        let li = document.createElement('li');
        // Let the options contains the title and the notation type of the chant
        li.textContent = chant.title + " (" + chant.notationType + ")";
        li.style.wordBreak = "break-word";
        li.style.cursor = "pointer";
        li.style.padding = "0.3em 0";
        li.addEventListener("mouseover", () => {
            li.style.backgroundColor = "var(--background-hover)";
        });
        li.addEventListener("mouseout", () => {
            li.style.backgroundColor = "white";
        });
        li.addEventListener("click", () => {
            // Scroll to the chant view of the page, smoothly
            chantDisplay.scrollIntoView({ behavior: "smooth" });
            // Set the box for the chant
            chantSVG.style.boxShadow = "0 0 2px 3px #888";
            chantSVG.innerHTML = drawSVGFromMEIContent(chant.meiContent);
            // Display the chant information (file name, notation type, mode, etc.)
            printChantInformation(chant);
        });
        databaseList.appendChild(li);
    }
}

async function loadDatabaseToLocalStorage() {
    /** @type {Chant[]} A list of all the chants in the database */
    let chantList = [];
    const remoteDatabaseVersion = await fetch("https://raw.githubusercontent.com/ECHOES-from-the-Past/mei-analyser/main/package.json")
        .then(response => response.json())
        .then(json => json.version);

    // display the indicator
    refreshStatus.textContent = `Updating client from version ${retrieve('version')} to ${remoteDatabaseVersion}`;
    refreshStatus.hidden = false;
    refreshWheel.hidden = false;

    // Clear the search result display
    searchResultDiv.innerHTML = '<p> Search results will display here. </p>';

    // Disable the search button
    searchButton.disabled = true;
    try {
        for (let filename of database) {
            const filePath = rootPath + filename;
            let MEIFileContentString = await loadMEIFile(filePath);
            let chant = new Chant(MEIFileContentString, filePath);
            chantList.push(chant);
        }
        persist('chantList', chantList);
        persist('version', remoteDatabaseVersion);
    } catch (error) {
        refreshStatus.textContent = "Error loading database! Please reload the page or report the issue to the developer.";
        localStorage.removeItem('chantList');
        refreshWheel.hidden = true;
        return;
    }

    refreshStatus.textContent = "Database refresh successfully!";
    refreshWheel.hidden = true;

    // Enable the search button
    searchButton.disabled = false;
    // sleep for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    refreshStatus.hidden = true;
}

/* --------------- SEARCH PANEL PERSISTANCE --------------- */
// pitchRadio.addEventListener("change", () => {
//     persist('patternSearchMode', 'pitch');
// });

// contourRadio.addEventListener("change", () => {
//     persist('patternSearchMode', 'contour');
// });

// searchQueryInput.addEventListener("input", () => {
//     persist('searchQuery', searchQueryInput.value);
// });
aquitanianCheckbox.addEventListener("change", () => {
    persist('aquitanianCheckbox', aquitanianCheckbox.checked);
});

squareCheckbox.addEventListener("change", () => {
    persist('squareCheckbox', squareCheckbox.checked);
});

liquescentCheckbox.addEventListener("change", () => {
    persist('liquescentCheckbox', liquescentCheckbox.checked);
});

quilismaCheckbox.addEventListener("change", () => {
    persist('quilismaCheckbox', quilismaCheckbox.checked);
});

oriscusCheckbox.addEventListener("change", () => {
    persist('oriscusCheckbox', oriscusCheckbox.checked);
});

modeCheckboxes.forEach((checkbox, index) => {
    checkbox.addEventListener("change", () => {
        persist(`mode${index + 1}Checkbox`, checkbox.checked);
    });
});

allModeCheckbox.addEventListener("change", () => {
    modeCheckboxes.forEach((checkbox, index) => {
        checkbox.checked = allModeCheckbox.checked;
        persist(`mode${index + 1}Checkbox`, checkbox.checked);
        persist('allModeCheckbox', allModeCheckbox.checked);
    });
});

undetectedCheckbox.addEventListener("change", () => {
    persist('modeUndetectedCheckbox', undetectedCheckbox.checked);
});

/* --------------- DATABASE PANEL PERSISTANCE --------------- */
viewDatabaseButton.addEventListener("click", () => {
    if (databaseIsOpen === false) {
        viewDatabaseButton.textContent = "Close Database";
        constructDatabaseList();
    } else {
        databaseList.innerHTML = '';
        viewDatabaseButton.textContent = "View Database";
    }
    databaseIsOpen = !databaseIsOpen;
});

/* --------------- SEARCH PANEL --------------- */
searchButton.addEventListener("click", () => {
    clearSearchResultsAndInfo();

    // Perform search and display the result
    let searchResults = performSearch();
    showSearchResult(searchResults);
});

melismaIncrement.addEventListener("click", () => {
    melismaInput.stepUp();
    persist('melismaInput', melismaInput.value);
});

melismaDecrement.addEventListener("click", () => {
    melismaInput.stepDown();
    persist('melismaInput', melismaInput.value);
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