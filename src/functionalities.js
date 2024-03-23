import database from './database/database.json';
import { Chant } from './utility/components.js';
import {
  databaseList,
  chantSVG,
  chantDisplay,
  liquescentCheckbox,
  quilismaCheckbox,
  oriscusCheckbox,
  aquitanianCheckbox,
  squareCheckbox
} from './DOMelements.mjs';
import { drawSVGFromMEIContent, loadMEIFile, printChantInformation, persist, retrieve } from './utility/utils.js';

/**
 * Obtain the current development or production environment
 * from Vite's `import.meta.env` object
 */
const env = import.meta.env.MODE;
console.debug(`Current environment: ${env}`);
const rootPath = "https://raw.githubusercontent.com/ECHOES-from-the-Past/GABCtoMEI/main/MEI_outfiles/";

/* ----------------------- Persistence Layer ----------------------- */
export function loadPersistedSearchOptions() {
  // if (retrieve('patternSearchMode') == null) {
  //   persist('patternSearchMode', 'pitch');
  // }

  // retrieve('patternSearchMode') == 'pitch' ? pitchRadio.checked = true : contourRadio.checked = true;

  // searchQueryInput.value = retrieve('searchQuery');
  aquitanianCheckbox.checked = retrieve('aquitanianCheckbox') === null ? true : retrieve('aquitanianCheckbox');
  squareCheckbox.checked = retrieve('squareCheckbox');

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
export async function constructDatabaseList() {
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