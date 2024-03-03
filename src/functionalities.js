import database from './database/database.json';
import { Chant } from './utility/components.js';
import { drawSVGFromMEIContent, loadMEIFile, persist, retrieve } from './utility/utils.js';

/* -------------- DOM ELEMENTS -------------- */
/** @type {HTMLInputElement} */
export const pitchRadio = document.getElementById('pitch-radio');

/** @type {HTMLInputElement} */
export const contourRadio = document.getElementById('contour-radio');

/** @type {HTMLInputElement} */
export const searchQuery = document.getElementById('search-query');

/** @type {HTMLButtonElement} */
export const viewDatabaseButton = document.getElementById('view-database-btn');

/** @type {ListItem} */
export const databaseList = document.getElementById('database-list');

/** @type {HTMLDivElement} */
export const chantSVG = document.getElementById('chant-svg');
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
    console.debug(chant);
    chantList.push(chant);
  }
  persist('chantList', chantList);
}

export function loadPersistedSearchOptions() {
  if (retrieve('patternSearchMode') == null) {
    persist('patternSearchMode', 'pitch');
  }

  retrieve('patternSearchMode') == 'pitch' ? pitchRadio.checked = true : contourRadio.checked = true;

  searchQuery.value = retrieve('searchQuery');
}

export async function viewDatabase() {
  /** @type {Chant[]} */
  const chantList = retrieve('chantList');
  databaseList.innerHTML = '';
  for (let chant of chantList) {
    let li = document.createElement('li');
    li.textContent = chant.fileName;
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      chantSVG.innerHTML = drawSVGFromMEIContent(chant.meiContent);
    });

    databaseList.appendChild(li);
  }
}

/** @type {HTMLElement} */
const chantMenuLeft = document.getElementById('database-chant-left');

/** @type {HTMLElement} */
const chantMenuRight = document.getElementById('database-chant-right');


/**
 * ----------------------- SEARCH -----------------------
 * Event listener for the "Search" button for pattern search
 */
// document.getElementById('search-btn').addEventListener("click", performSearch);

/**
 * Perform highlighting when user clicks on "Search" button
 */
export function performSearch() {
  clearHighlights();

  if (search_option == "contour") {
    contourPatternSearch(leftChant, searchPattern, 'left');
    contourPatternSearch(rightChant, searchPattern, 'right');
  }
}


/**
 * Upload file to a slot on the display (1: left, 2: right) for cross-comparison
 * @param {Number} slot either 1 or 2
 */
async function upload_file(slot) {
  clearHighlights();
  const uploaded_file = document.getElementById('file-input-' + slot).files[0];
  const objectURL = URL.createObjectURL(uploaded_file);

  const newContent = await loadMEIFile(objectURL, slot);
  drawMEIContent(newContent, slot);
  URL.revokeObjectURL(upload_file);
}

/**
 * Event listener for the "Upload" button, LEFT slot
 */
// document.getElementById('file-input-1').addEventListener("change", () => { upload_file(1) });

/**
 * Event listener for the "Upload" button, RIGHT slot
 */
// document.getElementById('file-input-2').addEventListener("change", () => { upload_file(2) });

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