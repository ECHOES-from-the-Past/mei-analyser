import database from './database/database.json';
import { Chant } from './utility/components.js';
import {
  pitchRadio,
  contourRadio,
  searchQuery,
  databaseList,
  chantSVG,
  chantInfo,
  searchResultDiv,
  chantDisplay
} from './DOMelements.mjs';
import { drawSVGFromMEIContent, loadMEIFile, persist, retrieve } from './utility/utils.js';

/**
 * Obtain the current development or production environment
 * from Vite's `import.meta.env` object
 */
const env = import.meta.env.MODE;
console.debug(`Current environment: ${env}`);
const rootPath = env === "development" ? "../../GABCtoMEI/MEI_outfiles/" : "./database/";

export async function loadDatabaseToChant() {
  /** @type {Chant[]} A list of all the chants in the database */
  let chantList = [];
  // console.debug(database);
  console.log('Loading the entire corpus to browser memory...')

  for (let filename of database) {
    const filePath = rootPath + filename;
    let MEIFileContentString = await loadMEIFile(filePath);
    let chant = new Chant(MEIFileContentString, filePath);
    chantList.push(chant);
  }
  persist('chantList', chantList);
  console.log('Corpus successfully loaded to browser memory.');
}

export function loadPersistedSearchOptions() {
  if (retrieve('patternSearchMode') == null) {
    persist('patternSearchMode', 'pitch');
  }

  retrieve('patternSearchMode') == 'pitch' ? pitchRadio.checked = true : contourRadio.checked = true;

  searchQuery.value = retrieve('searchQuery');
}

/**
 * @async
 * @listens viewDatabaseButton
 * Displaying the database as a list of chants on the screen
 */
export async function viewDatabase() {
  /** @type {Chant[]} */
  const chantList = retrieve('chantList');
  databaseList.innerHTML = '';
  for (let chant of chantList) {
    let li = document.createElement('li');
    li.textContent = chant.fileName;
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
      chantDisplay.scrollIntoView({behavior: "smooth"});
      // Set the box for the chant
      chantSVG.style.boxShadow = "0 0 2px 3px #888";
      chantSVG.innerHTML = drawSVGFromMEIContent(chant.meiContent);
      // Display the chant information (file name, notation type, mode, etc.)
      printChantInformation(chant);
    });
    databaseList.appendChild(li);
  }
}

/**
 * 
 * @param {Chant} chant the chant which information is to be extracted and printed
 */
function printChantInformation(chant) {
  chantInfo.innerHTML = '';
  let title = document.createElement('h3');
  title.textContent = "Chant Information";
  chantInfo.appendChild(title);
  let info = {
    "File Name": chant.fileName,
    "Notation Type": chant.notationType,
    "Mode": chant.mode,
    "PEM Database URL": chant.pemDatabaseUrl
  };
  for(let k in info) {
    let p = document.createElement('p');
    p.innerHTML = `<b>${k}</b>: ${info[k]}`;
    chantInfo.appendChild(p);
  }
}

/**
 * ----------------------- SEARCH -----------------------
 * Event listener for the "Search" button for pattern search
 */


/**
 * Perform highlighting when user clicks on "Search" button
 */
export function performSearch() {
  let allChants = retrieve('chantList');
  let searchQuery = retrieve('searchQuery');
  let searchMode = retrieve('patternSearchMode');

  let resultChantList = allChants.filter(chant => chant.fileName.includes("SQUARE"));
  return resultChantList;
}

/**
 * Show the search result on the screen
 * @param {Chant[]} resultChantList list of chants that match the search query
 */
export function showSearchResult(resultChantList) {
  searchResultDiv.innerHTML = '';

  /** @type {HTMLTableElement} */
  let resultTable = document.createElement('table');
  resultTable.id = "result-table"; // for CSS styling

  // Create the head row of the table: "File Name" -- "Notation Type" -- "Mode"
  const tableHeadRows = ["File Name", "Notation", "Mode", "PEM Database URL"];
  let headRow = document.createElement('thead');
  for (let headRowElement of tableHeadRows) {
    let th = document.createElement('th');
    th.textContent = headRowElement;
    th.scope = "col";

    headRow.appendChild(th);
  }
  resultTable.appendChild(headRow);

  /**
   * Create the body of the table
   * @type {HTMLTableBodyElement}
  */ 
  let tbody = document.createElement('tbody');

  const createTD = (textContent) => {
    let td = document.createElement('td');
    td.textContent = textContent;
    td.style.fontSize = "1rem";
    return td;
  }

  for (let chant of resultChantList) {
    // create a result row for each chant
    let resultRow = document.createElement('tr');
    // add the file name of the chant to row cell
    let td1 = createTD(chant.fileName);
    td1.addEventListener("click", () => {
      // Set the box for the chant
      chantSVG.style.boxShadow = "0 0 2px 3px #888";
      chantSVG.innerHTML = drawSVGFromMEIContent(chant.meiContent);
      // Display the chant information (file name, notation type, mode, etc.)
      printChantInformation(chant);
      chantDisplay.scrollIntoView({behavior: "smooth"});
    });
    td1.style.cursor = "pointer";

    let td2 = createTD(chant.notationType);
    let td3 = createTD(chant.mode);

    /** @type {HTMLAnchorElement} */
    let td4link = document.createElement('a');
    td4link.href = chant.pemDatabaseUrl;
    td4link.textContent = chant.pemDatabaseUrl;
    td4link.target = "_blank";
    td4link.rel = "noopener noreferrer";

    let td4 = createTD();
    td4.appendChild(td4link);    

    resultRow.appendChild(td1);
    resultRow.appendChild(td2);
    resultRow.appendChild(td3);
    resultRow.appendChild(td4);

    tbody.appendChild(resultRow);
  }
  resultTable.appendChild(tbody);

  // Append the table to the search-result div
  searchResultDiv.appendChild(resultTable);
}


/**
 * ----------------------- ANALYSIS -----------------------
 * Event listener for the "Analyse" button for cross-comparison functionality
 */
// document.getElementById('cross-comparison-btn').addEventListener("click", () => {
//   clearHighlights();
//   const leftFileContent = sessionStorage.getItem("mei-content-1");
//   const leftChantFilePath = sessionStorage.getItem("mei-file-path-1");
//   const leftChant = new Chant(leftFileContent, leftChantFilePath);

//   const rightChantFilePath = sessionStorage.getItem("mei-file-path-2");
//   const rightFileContent = sessionStorage.getItem("mei-content-2");
//   const rightChant = new Chant(rightFileContent, rightChantFilePath);

//   const leftChantNCList = leftChant.getNeumeComponents();
//   const rightChantNCList = rightChant.getNeumeComponents();

//   const analysis_mode = document.querySelector('input[name="analysis-mode"]:checked').value;
//   pattern_analysis(leftChantNCList, rightChantNCList, analysis_mode);

//   localStorage.setItem("analysis-mode", analysis_mode);
// });