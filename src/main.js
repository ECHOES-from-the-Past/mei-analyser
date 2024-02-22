import {
  loadMEIFile,
  drawMEIContent,
  parseSearchPattern,
  clearHighlights,
} from './utility/utils.js';
import {
  highlight_contour_AQ,
  highlight_contour_SQ,
  displayChantMode
} from './search/search.js';
import {
  pattern_analysis
} from './analysis/analysis.js';
import {
  Chant
} from './utility/components.js';
const env = import.meta.env.MODE;
console.debug(`Current environment: ${env}`);

/**
 * Load predefined files when DOM is loaded
 */
document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    loadContent();
  }
}

function loadContent() {
  const prev_search_choice = localStorage.getItem("search-choice");
  const radio_checkbox = document.getElementsByName("search-option");
  for (let e of radio_checkbox) {
    if (e.value == prev_search_choice) {
      e.checked = true;
    }
  }
  const prev_search = localStorage.getItem("search-query");
  document.getElementById("search-bar").value = prev_search;

  const prev_analysis_mode = localStorage.getItem("analysis-mode");
  const analysis_radio_checkbox = document.getElementsByName("analysis-mode");
  for (let e of analysis_radio_checkbox) {
    if (e.value == prev_analysis_mode) {
      e.checked = true;
    }
  }

  // Load previous files. The value will be `null` if there's no previous file
  const prevFilePathLeft = sessionStorage.getItem('database-chant-1');
  const prevFilePathRight = sessionStorage.getItem('database-chant-2');

  document.getElementById('database-chant-left').value = prevFilePathLeft;
  document.getElementById('database-chant-right').value = prevFilePathRight;

  drawMEIContent(sessionStorage.getItem('mei-content-1'), 1);
  drawMEIContent(sessionStorage.getItem('mei-content-2'), 2);

  const leftFileContent = sessionStorage.getItem("mei-content-1");
  const leftChantFilePath = sessionStorage.getItem("mei-file-path-1");
  const leftChant = new Chant(leftFileContent, leftChantFilePath);

  const rightChantFilePath = sessionStorage.getItem("mei-file-path-2");
  const rightFileContent = sessionStorage.getItem("mei-content-2");
  const rightChant = new Chant(rightFileContent, rightChantFilePath);

  displayChantMode(leftChant, 1);
  displayChantMode(rightChant, 2);
}

/**
 * Dynamically redraw the MEI content when the window is resized
 * See: https://www.geeksforgeeks.org/how-to-wait-resize-end-event-and-then-perform-an-action-using-javascript/
 */
let timeOutFunctionId;
window.onresize = function () {
  clearTimeout(timeOutFunctionId);

  timeOutFunctionId = setTimeout(() => {
    drawMEIContent(sessionStorage.getItem('mei-content-1'), 1);
    drawMEIContent(sessionStorage.getItem('mei-content-2'), 2);
  }, 100);
}

/**
 * ----------------------- SEARCH -----------------------
 * Event listener for the "Search" button for pattern search
 */
document.getElementById('search-btn').addEventListener("click", performSearch);

/**
 * Perform highlighting when user clicks on "Search" button
 */
function performSearch() {
  clearHighlights();
  const form = document.querySelector("#search-form");
  const form_data = new FormData(form);

  // Get user's selection from the form
  const search_option = form_data.get("search-option");
  const search_bar_input = form_data.get("search-bar");
  localStorage.setItem("search-choice", search_option);
  localStorage.setItem("search-query", search_bar_input);

  // Parse search pattern into an array of number
  const search_pattern = parseSearchPattern(search_bar_input);

  const leftFileContent = sessionStorage.getItem("mei-content-1");
  const leftChantFilePath = sessionStorage.getItem("mei-file-path-1");
  const leftChant = new Chant(leftFileContent, leftChantFilePath);

  const rightChantFilePath = sessionStorage.getItem("mei-file-path-2");
  const rightFileContent = sessionStorage.getItem("mei-content-2");
  const rightChant = new Chant(rightFileContent, rightChantFilePath);
  sessionStorage.setItem('chant-test', JSON.stringify(leftChant));

  if (search_option == "contour") {
    process_contour(leftChant, search_pattern, 'left');
    process_contour(rightChant, search_pattern, 'right');
  }
}

/**
 * Process the contour search pattern for both left and right slots
 * @param {Chant} chant the Chant object
 * @param {Number[]} search_pattern 
 * @param {Number} slot 
 */
function process_contour(chant, search_pattern, slot) {
  let pattern_count = 0;
  const chantType = chant.getAnnotationType();
  const chantNCs = chant.getNeumeComponents();

  if (chantType == "aquitanian") {
    pattern_count = highlight_contour_AQ(chantNCs, search_pattern);
  } else if (chantType == "square") {
    pattern_count = highlight_contour_SQ(chantNCs, search_pattern);
  }

  document.getElementById("chant-type-" + slot).innerHTML = chantType;
  document.getElementById("pattern-count-" + slot).innerHTML = pattern_count;
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
document.getElementById('file-input-1').addEventListener("change", () => { upload_file(1) });

/**
 * Event listener for the "Upload" button, RIGHT slot
 */
document.getElementById('file-input-2').addEventListener("change", () => { upload_file(2) });

/**
 * ----------------------- ANALYSIS -----------------------
 * Event listener for the "Analyse" button for cross-comparison functionality
 */
document.getElementById('cross-comparison-btn').addEventListener("click", () => {
  clearHighlights();
  const leftFileContent = sessionStorage.getItem("mei-content-1");
  const leftChantFilePath = sessionStorage.getItem("mei-file-path-1");
  const leftChant = new Chant(leftFileContent, leftChantFilePath);

  const rightChantFilePath = sessionStorage.getItem("mei-file-path-2");
  const rightFileContent = sessionStorage.getItem("mei-content-2");
  const rightChant = new Chant(rightFileContent, rightChantFilePath);

  const leftChantNCList = leftChant.getNeumeComponents();
  const rightChantNCList = rightChant.getNeumeComponents();

  const analysis_mode = document.querySelector('input[name="analysis-mode"]:checked').value;
  pattern_analysis(leftChantNCList, rightChantNCList, analysis_mode);

  localStorage.setItem("analysis-mode", analysis_mode);
});

import database from './search/database.json';

const chantMenuLeft = document.getElementById('database-chant-left');
const chantMenuRight = document.getElementById('database-chant-right');

chantMenuLeft.innerHTML = database.map((e) => {
  return `<option value=${e}>${e}</option>`;
}).join('');

chantMenuRight.innerHTML = database.map((e) => {
  return `<option value=${e}>${e}</option>`;
}).join('');

async function loadFromDatabase(fileName, order) {
  let rootPath = "";
  if (env === "development") {
    rootPath = "../../GABCtoMEI/MEI_outfiles/";
  } else if (env === "production") {
    rootPath = "./database/";
  }

  sessionStorage.setItem('database-chant-' + order, fileName);

  const filePath = rootPath + fileName;
  let MEIFileContentString = await loadMEIFile(filePath, order);
  let chant = new Chant(MEIFileContentString, filePath);
  drawMEIContent(MEIFileContentString, order);
  displayChantMode(chant, order);
}

chantMenuLeft.addEventListener('change', () => {
  loadFromDatabase(chantMenuLeft.value, 1);
});
chantMenuRight.addEventListener('change', () => {
  loadFromDatabase(chantMenuRight.value, 2)
});