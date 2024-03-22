import {
    loadPersistedSearchOptions,
    loadDatabaseToChant,
    constructDatabaseList,
} from './functionalities.js';
import {
    viewDatabaseButton,
    fileInputLeft,
    fileInputRight,
    searchModeButton,
    crossComparisonModeButton,
    refreshDatabaseButton,
    devModeButton,
    databaseList,
    searchButton,
    liquescentCheckbox,
    quilismaCheckbox,
    oriscusCheckbox,
    devOrnamentalShapes,
    refreshDatabaseWarning,
    aquitanianCheckbox,
    squareCheckbox,
    chantInfo,
    chantSVG
} from './DOMelements.mjs';
import {
    checkPersistanceExists,
    persist,
    retrieve
} from './utility/utils.js';
import {
    performSearch,
    showSearchResult
} from './search/search.js';
import pjson from '../package.json';

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
document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        console.debug(`Saved version: ${retrieve('version')} \nNewest version: ${pjson.version}`);

        if (checkPersistanceExists('version') && retrieve('version') != pjson.version) {
            refreshDatabaseWarning.hidden = false;
        }

        loadPersistedSearchOptions();
        if (!checkPersistanceExists('chantList') || !checkPersistanceExists('version')) {
            loadDatabaseToChant();
            persist("version", pjson.version);
        }

        /* --------------- DEV MODE --------------- */
        "load, change".split(", ").forEach((event) => {
            window.addEventListener(event, () => {
                let liquescentIsChecked = liquescentCheckbox.checked ? "liquescent" : "";
                let quilismaIsChecked = quilismaCheckbox.checked ? "quilisma" : "";
                let oriscusIsChecked = oriscusCheckbox.checked ? "oriscus" : "";
                devOrnamentalShapes.textContent = [liquescentIsChecked, quilismaIsChecked, oriscusIsChecked].join(" ");
            })
        });
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
    if (databaseIsOpen) constructDatabaseList();
    alert("Database refreshed!");
    persist("version", pjson.version);
    refreshDatabaseWarning.hidden = true;
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
    chantInfo.innerHTML = "<p><i>Chant information will display here</i></p>";
    chantSVG.innerHTML = "<p><i> Click on the chant's file name to display </i></p>";

    // Perform search and display the result
    let resultChantList = performSearch();
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