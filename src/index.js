import {
    viewDatabaseButton,
    fileInputLeft,
    fileInputRight,
    searchModeButton,
    crossComparisonModeButton,
    refreshDatabaseButton,
    databaseList,
    searchButton,
    liquescentCheckbox,
    quilismaCheckbox,
    oriscusCheckbox,
    refreshDatabaseWarning,
    aquitanianCheckbox,
    squareCheckbox,
    chantInfo,
    chantSVG,
    chantDisplay,
    refreshIndicator,
    searchResultDiv
} from './DOMelements.mjs';
import {
    drawSVGFromMEIContent, loadMEIFile,
    checkPersistanceExists, persist, retrieve
} from './utility/utils.js';
import {
    obtainSyllables,
    performSearch, showSearchResult
} from './search/search.js';

import pjson from '../package.json';
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
    // squareCheckbox.checked = retrieve('squareCheckbox');
    squareCheckbox.checked = true;

    liquescentCheckbox.checked = retrieve('liquescentCheckbox');
    quilismaCheckbox.checked = retrieve('quilismaCheckbox');
    oriscusCheckbox.checked = retrieve('oriscusCheckbox');
}

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

async function loadDatabaseToChant() {
    /** @type {Chant[]} A list of all the chants in the database */
    let chantList = [];

    // display the indicator
    refreshIndicator.textContent = "Loading the database...";
    refreshIndicator.hidden = false;
    searchResultDiv.innerHTML = '<p> Search results will display here. </p>';

    for (let filename of database) {
        const filePath = rootPath + filename;
        let MEIFileContentString = await loadMEIFile(filePath);
        let chant = new Chant(MEIFileContentString, filePath);
        chantList.push(chant);
    }
    persist('chantList', chantList);

    refreshIndicator.textContent = "Database refresh successfully!";
    // sleep for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    refreshIndicator.hidden = true;
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

/**
 * Load predefined files when DOM is loaded
*/
document.onreadystatechange = () => {
    if (document.readyState === "complete") {
        loadPersistedSearchOptions();

        console.log(`Saved version: ${retrieve('version')} \nNewest version: ${pjson.version}`);

        if (checkPersistanceExists('version') && retrieve('version') != pjson.version) {
            refreshDatabaseWarning.hidden = false;
        }

        if (!checkPersistanceExists('chantList') || !checkPersistanceExists('version')) {
            loadDatabaseToChant();
            persist("version", pjson.version);
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
    refreshDatabaseWarning.hidden = true;
    await loadDatabaseToChant();
    if (databaseIsOpen) constructDatabaseList();
    persist("version", pjson.version);
});

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

searchButton.addEventListener("click", () => {
    // Clear the display when performing a new search
    chantInfo.innerHTML = "<p> Chant information will display here </p>";
    chantSVG.innerHTML = "<p> Click on the chant's file name to display </p>";
    chantSVG.style = ""; // clear the border styling of the chant SVG

    // Perform search and display the result
    let [searchResults, syllableLists] = performSearch();
    console.log(syllableLists);
    showSearchResult(searchResults, syllableLists);
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