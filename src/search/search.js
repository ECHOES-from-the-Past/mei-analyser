import { Chant, NeumeComponent } from "../utility/components.js";
import { retrieve, drawSVGFromMEIContent, printChantInformation } from "../utility/utils.js";
import {
  liquescentCheckbox, quilismaCheckbox, oriscusCheckbox,
  aquitanianCheckbox, squareCheckbox, 
  searchResultDiv,
  chantSVG, chantDisplay
} from "../DOMelements.mjs";

/**
 * ----------------------- SEARCH -----------------------
 */

/**
 * Search by ornamental shapes (liquescent, quilisma, oriscus)
 * @param {{liquescent: boolean, quilisma: boolean, oriscus: boolean}} ornamentalOptions options for the ornamental search
 * @returns {Chant[]} list of chants that has the selected ornamental shapes. If no options are selected, return all the chants.
 */
function searchByOrnamentalShapes(ornamentalOptions) {
  /** @type {Chant[]} */
  let allChants = retrieve('chantList');

  /**
   * Check if a chant has a specific ornamental shape.
   * This only check for the first occurrence of the ornamental shape in the chant
   * and does not care for the location of the ornamental shape in the chant.
   * @param {Chant} chant the chant to be checked
   * @param {string} ornamentalType the type of ornamental shape to be checked
   * @returns {boolean} `true` if the chant has the ornamental shape, `false` otherwise
   */
  const hasOrnamental = (chant, ornamentalType) => {
    /** @type {NeumeComponent[]} */
    let neumeComponents = chant.neumeComponents;
    for (let neume of neumeComponents) {
      if (neume.ornamental != null && neume.ornamental.type == ornamentalType) return true;
    }
    return false;
  }

  /**
   * Filter the chants based on the options.
   * If all the options are unchecked (`false`), return all the chants
   * @type {Chant[]} resulting list of chants after filtering
   */
  let resultChantList = allChants;

  // first filter for the liquescent option
  if (ornamentalOptions.liquescent) {
    resultChantList = resultChantList.filter(chant => {
      if (hasOrnamental(chant, "liquescent")) return true;
    });
  }
  // then filter for the quilisma option
  if (ornamentalOptions.quilisma) {
    resultChantList = resultChantList.filter(chant => {
      if (hasOrnamental(chant, "quilisma")) return true;
    });
  }
  // then filter for the oriscus option
  if (ornamentalOptions.oriscus) {
    resultChantList = resultChantList.filter(chant => {
      if (hasOrnamental(chant, "oriscus")) return true;
    });
  }

  return resultChantList;
}

/**
 * Perform highlighting when user clicks on "Search" button
 */
export function performSearch() {
  let notationTypeOptions = {
    "aquitanian": aquitanianCheckbox.checked,
    "square": squareCheckbox.checked
  }
  /**
   * Options for the ornamental search
   * @type {{liquescent: boolean, quilisma: boolean, oriscus: boolean}}
  */
  let ornamentalOptions = {
    "liquescent": liquescentCheckbox.checked,
    "quilisma": quilismaCheckbox.checked,
    "oriscus": oriscusCheckbox.checked
  }

  let resultChantList = searchByOrnamentalShapes(ornamentalOptions);
  resultChantList = resultChantList.filter(chant => {
    if (notationTypeOptions.aquitanian && chant.notationType == "aquitanian") return true;
    if (notationTypeOptions.square && chant.notationType == "square") return true;
    return false;
  });

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
      chantDisplay.scrollIntoView({ behavior: "smooth" });
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