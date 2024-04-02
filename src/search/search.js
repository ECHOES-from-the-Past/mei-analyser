import { Chant, NeumeComponent } from "../utility/components.js";
import { retrieve, drawSVGFromMEIContent } from "../utility/utils.js";
import {
  liquescentCheckbox, quilismaCheckbox, oriscusCheckbox,
  aquitanianCheckbox, squareCheckbox,
  searchResultDiv, chantInfo, chantSVG, chantDisplay
} from "../DOMelements.mjs";

/**
 * ----------------------- SEARCH -----------------------
 */

/**
 * Search by ornamental shapes (liquescent, quilisma, oriscus)
 * @param {{liquescent: boolean, quilisma: boolean, oriscus: boolean}} ornamentalOptions options for the ornamental search
 * @returns {Chant[]} list of chants that has the selected ornamental shapes. If no options are selected, return all the chants.
 */
function searchByOrnamentalShapes(chantList, ornamentalOptions) {
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
  let resultChantList = chantList;

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
  /** Retrieving the locally stored list of chants */
  let resultChantList = retrieve('chantList');

  /* First layer of filtering: Notation type */
  let notationTypeOptions = {
    "aquitanian": aquitanianCheckbox.checked,
    "square": squareCheckbox.checked
  }
  resultChantList = resultChantList.filter(chant => {
    if (notationTypeOptions.aquitanian && chant.notationType == "aquitanian") return true;
    if (notationTypeOptions.square && chant.notationType == "square") return true;
    return false;
  });

  /* Second layer of filtering: Ornamental shapes */
  /**
   * Options for the ornamental search
   * @type {{liquescent: boolean, quilisma: boolean, oriscus: boolean}}
  */
  let ornamentalOptions = {
    "liquescent": liquescentCheckbox.checked,
    "quilisma": quilismaCheckbox.checked,
    "oriscus": oriscusCheckbox.checked
  }
  resultChantList = searchByOrnamentalShapes(resultChantList, ornamentalOptions);

  /* Return the result */
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
  const tableHeadRows = ["Title", "Music Script", "Mode", "Source", "PEM Database", "File Name"];
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

  const createTD = (content) => {
    let td = document.createElement('td');
    td.textContent = content;
    td.style.fontSize = "1rem";
    return td;
  }

  const makeTDHoverable = (td) => {
    td.style.cursor = "pointer";
    td.addEventListener("mouseover", () => {
      td.style.backgroundColor = "var(--background-hover)";
    });
    td.addEventListener("mouseout", () => {
      td.style.backgroundColor = "white";
    });
  }

  for (let chant of resultChantList) {
    // create a result row for each chant
    let resultRow = document.createElement('tr');
    // add the file name of the chant to row cell
    let tdFileName = createTD(chant.fileName);
    tdFileName.addEventListener("click", () => {
      // Set the box for the chant
      chantSVG.style.boxShadow = "0 0 2px 3px #888";
      chantSVG.innerHTML = drawSVGFromMEIContent(chant.meiContent);
      // Display the chant information (file name, notation type, mode, etc.)
      printChantInformation(chant);
      chantDisplay.scrollIntoView({ behavior: "smooth" });
    });
    makeTDHoverable(tdFileName);

    let tdNotationType = createTD(chant.notationType);
    let tdMode;
    if (chant.mode != undefined) {
      tdMode = createTD(`${chant.mode} (${chant.modeCertainty}%)`);
    } else {
      tdMode = createTD("undetected");
      tdMode.style.color = "red";
    }

    /** @type {HTMLAnchorElement} */
    let td4link = document.createElement('p');

    for (let pemUrl of chant.pemDatabaseUrls) {
      let a = document.createElement('a');
      a.href = pemUrl;
      a.innerText = pemUrl.split("/").pop() + "\n";
      a.target = "_blank";
      a.style.textDecoration = "underline";
      td4link.appendChild(a);
    }

    let tdPEMLink = createTD();
    tdPEMLink.appendChild(td4link);

    let tdSource = createTD(chant.source);

    let tdTitle = createTD(chant.title);

    // In order: title, notation type, mode, source, PEM database URL, file name
    resultRow.appendChild(tdTitle);
    resultRow.appendChild(tdNotationType); // Music script
    resultRow.appendChild(tdMode);
    resultRow.appendChild(tdSource);
    resultRow.appendChild(tdPEMLink);
    resultRow.appendChild(tdFileName);

    tbody.appendChild(resultRow);
  }
  resultTable.appendChild(tbody);

  // Append the table to the search-result div
  searchResultDiv.appendChild(resultTable);
}

/**
 * Display the chant's information to the screen
 * @param {Chant} chant the chant which information is to be extracted and printed
 */
function printChantInformation(chant) {
  chantInfo.innerHTML = '';
  let title = document.createElement('h3');
  title.textContent = "Chant Information";
  chantInfo.appendChild(title);

  let info = {
    "Title": chant.title,
    "Source": chant.source,
    "Music script": chant.notationType,
    "Mode": chant.mode == undefined ? "Undetected" : chant.mode,
    "Mode Certainty": chant.modeCertainty == undefined ? "-" : chant.modeCertainty + "%",
    "Mode Description": chant.modeDescription == undefined ? "-" : chant.modeDescription,
    "File Name": chant.fileName,
    "PEM Database URL": chant.pemDatabaseUrls,
  };

  for (let k in info) {
    let p = document.createElement('p');
    if (k == "PEM Database URL") {
      p.innerHTML = `<b>${k}</b>: `;
      for (let url of info[k]) {
        let a = document.createElement('a');
        a.href = url;
        a.target = "_blank";
        a.innerText = url;
        p.appendChild(a);
        // Add "or" if it is not the last URL
        if (info[k].indexOf(url) != info[k].length - 1) {
          p.innerHTML += " or ";
        }
      }
    } else {
      p.innerHTML = `<b>${k}</b>: ${info[k]}`;
    }
    chantInfo.appendChild(p);
  }
}