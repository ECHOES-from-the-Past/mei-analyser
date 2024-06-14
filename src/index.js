import {
    viewDatabaseButton,
    searchModeButton, crossComparisonModeButton,
    refreshDatabaseButton, refreshStatus, clientVersion, refreshWheel,
    databaseList,
    aquitanianCheckbox, squareCheckbox,
    modeCheckboxes, allModeCheckbox, undetectedCheckbox,
    liquescentCheckbox, quilismaCheckbox, oriscusCheckbox,
    exactPitchRadio, contourRadio, patternInputBox,
    patternSearchTooltip, patternSearchTooltipContent,
    searchButton,
    searchResultDiv, chantSVG, chantDisplay, chantInfo,
    melismaIncrement, melismaDecrement, melismaInput,
    clearPatternInputButton,
} from './DOMelements.mjs';
import {
    drawSVGFromMEIContent, loadMEIFile,
    checkPersistanceExists, persist, retrieve, getDatabase, env
} from './utility/utils.js';
import {
    clearSearchResultsAndInfo,
    performSearch, showSearchResult
} from './search/search.js';

import { Chant } from './database/components.js';

const rootPath = "https://raw.githubusercontent.com/ECHOES-from-the-Past/GABCtoMEI/main/";


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
    undetectedCheckbox.checked = retrieve('modeUndetectedCheckbox');

    liquescentCheckbox.checked = retrieve('liquescentCheckbox');
    quilismaCheckbox.checked = retrieve('quilismaCheckbox');
    oriscusCheckbox.checked = retrieve('oriscusCheckbox');

    melismaInput.value = retrieve('melismaInput') === null ? 6 : retrieve('melismaInput');

    switch (retrieve('melodicPatternSearchMode')) {
        case 'exact-pitch':
            exactPitchRadio.checked = true;
            break;
        case 'indefinite-pitch':
            indefinitePitchRadio.checked = true;
            break;
        case 'contour':
            contourRadio.checked = true;
            break;
    }

    patternInputBox.value = retrieve('patternInputBox');
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

    if (env === 'development') {
        clientVersion.textContent += '- Development';
    }
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
    const database = await getDatabase();
    console.log(database);

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
        console.error(error);
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

exactPitchRadio.addEventListener("change", () => {
    persist('melodicPatternSearchMode', 'exact-pitch')
});

contourRadio.addEventListener("change", () => {
    persist('melodicPatternSearchMode', 'contour')
});

// indefinitePitchRadio.addEventListener("change", () => {
//     persist('melodicPatternSearchMode', 'indefinite-pitch')
// });

patternInputBox.addEventListener("input", () => {
    persist('patternInputBox', patternInputBox.value);
});

clearPatternInputButton.addEventListener("click", () => {
    patternInputBox.value = '';
    persist('patternInputBox', patternInputBox.value);
});

patternInputBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchButton.click();
    }
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

// patternSearchTooltip.addEventListener("mouseover", () => {
//     patternSearchTooltipContent.hidden = false;
// });

// patternSearchTooltip.addEventListener("mouseout", () => {
//     patternSearchTooltipContent.hidden = true;
// });
