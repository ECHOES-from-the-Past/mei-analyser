import {
  loadMEIFile,
  drawMEIContent,
  parseSearchPattern,
  clearHighlights,
  drawMEIContentToElement
} from './utility/utils.js';

import {
  pattern_analysis
} from './cross-comparison/cross-comparison.js';
import {
  Chant
} from './utility/components.js';

import database from './database/database.json';
import Alpine from 'alpinejs';
import persist from '@alpinejs/persist';

/**
 * Obtain the current development or production environment
 * from Vite's `import.meta.env` object
 */
const env = import.meta.env.MODE;
console.debug(`Current environment: ${env}`);
let rootPath = "";
if (env === "development") {
  rootPath = "../../GABCtoMEI/MEI_outfiles/";
} else if (env === "production") {
  rootPath = "./database/";
}

document.addEventListener('alpine:init', () => {
  // Load database files
  Alpine.store('database', () => ({
    database: database,
    viewDatabase: Alpine.$persist(false).as('viewDatabase'),
    toggleView() {
      this.viewDatabase = !this.viewDatabase;
    },
    async displayChant(fileName) {
      const meifile = await loadMEIFile(rootPath + fileName, 1);
      const svg = drawMEIContentToElement(meifile);
      localStorage.setItem('chant-slot', JSON.stringify(svg));
      document.querySelector('#chant-slot').innerHTML = svg;
    }
  }));
});

/** Wait until Alpine is loaded with the DOM before adding event listeners */
document.addEventListener('alpine:initialized', async () => {
  console.debug('Alpine.js has been initialized. Adding the event listeners');
  document.getElementById('search-btn').addEventListener("click", performSearch);

  const prevChantSlot = localStorage.getItem('chant-slot');
  if (localStorage.getItem('chant-slot') !== null) {
    document.querySelector('#chant-slot').innerHTML = JSON.parse(prevChantSlot);
  }
});


function tempFunc() {
  console.log('tempFunc');
}
/**
 * Load predefined files when DOM is loaded
 */
// document.onreadystatechange = function () {
//   if (document.readyState === 'complete') {
//     loadContent();
//   }
// }

/**
 * Dynamically redraw the MEI content when the window is resized
 * See: https://www.geeksforgeeks.org/how-to-wait-resize-end-event-and-then-perform-an-action-using-javascript/
 */
let timeOutFunctionId;
window.onresize = function () {
  clearTimeout(timeOutFunctionId);
  console.log('Resizing...');
  timeOutFunctionId = setTimeout(() => {
    drawMEIContent(sessionStorage.getItem('mei-content-1'), 1);
    drawMEIContent(sessionStorage.getItem('mei-content-2'), 2);
  }, 100);
}

function loadContent() {
  // Load previous files. The value will be `null` if there's no previous file
  // const prevFilePathLeft = sessionStorage.getItem('database-chant-1');
  // const prevFilePathRight = sessionStorage.getItem('database-chant-2');

  // document.getElementById('database-chant-left').value = prevFilePathLeft;
  // document.getElementById('database-chant-right').value = prevFilePathRight;

  // drawMEIContent(sessionStorage.getItem('mei-content-1'), 1);
  // drawMEIContent(sessionStorage.getItem('mei-content-2'), 2);

  // const leftFileContent = sessionStorage.getItem("mei-content-1");
  // const leftChantFilePath = sessionStorage.getItem("mei-file-path-1");
  // const leftChant = new Chant(leftFileContent, leftChantFilePath);

  // const rightChantFilePath = sessionStorage.getItem("mei-file-path-2");
  // const rightFileContent = sessionStorage.getItem("mei-content-2");
  // const rightChant = new Chant(rightFileContent, rightChantFilePath);

  // displayChantMode(leftChant, 1);
  // displayChantMode(rightChant, 2);
}

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
  const form = document.querySelector("#search-form");
  const form_data = new FormData(form);

  // Get user's selection from the form
  const search_option = form_data.get("search-option");
  const search_bar_input = form_data.get("search-bar");
  localStorage.setItem("search-choice", search_option);
  localStorage.setItem("search-query", search_bar_input);

  // Parse search pattern into an array of number
  const searchPattern = parseSearchPattern(search_bar_input);

  const leftFileContent = sessionStorage.getItem("mei-content-1");
  const leftChantFilePath = sessionStorage.getItem("mei-file-path-1");
  const leftChant = new Chant(leftFileContent, leftChantFilePath);

  const rightChantFilePath = sessionStorage.getItem("mei-file-path-2");
  const rightFileContent = sessionStorage.getItem("mei-content-2");
  const rightChant = new Chant(rightFileContent, rightChantFilePath);
  sessionStorage.setItem('chant-test', JSON.stringify(leftChant));

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