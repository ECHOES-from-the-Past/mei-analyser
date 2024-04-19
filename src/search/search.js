import { Chant, NeumeComponent, Syllable, SyllableWord } from "../utility/components.js";
import { retrieve, drawSVGFromMEIContent } from "../utility/utils.js";
import {
  liquescentCheckbox, quilismaCheckbox, oriscusCheckbox,
  aquitanianCheckbox, squareCheckbox,
  searchResultDiv, chantInfo, chantSVG, chantDisplay
} from "../DOMelements.mjs";
import database from "../database/database.json";

/**
 * ----------------------- SEARCH -----------------------
 */

/**
 * HELPER FUNCTION
 * Check if a chant has a specific ornamental shape.
 * This only check for the first occurrence of the ornamental shape in the chant
 * and does not care for the location of the ornamental shape in the chant.
 * @param {Chant} chant the chant to be checked
 * @param {string} ornamentalType the type of ornamental shape to be checked
 * @returns {boolean} `true` if the chant has the ornamental shape, `false` otherwise
 */
function hasOrnamental(chant, ornamentalType) {
  /** @type {NeumeComponent[]} */
  let neumeComponents = chant.neumeComponents;
  for (let neume of neumeComponents) {
    // TODO: Get the syllables from here
    if (neume.ornamental != null && neume.ornamental.type == ornamentalType) return true;
  }
  return false;
}

/**
 * Search by ornamental shapes (liquescent, quilisma, oriscus)
 * @param {Chant[]} chantList list of chants to be filtered
 * @param {{liquescent: boolean, quilisma: boolean, oriscus: boolean}} ornamentalOptions options for the ornamental search
 * @returns {Chant[]} list of chants that has the selected ornamental shapes. If no options are selected, return all the chants.
 */
function filterByOrnamentalShapes(chantList, ornamentalOptions) {
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

function getOrnamentalSyllables(chant, ornamentalType) {
  let syllableList = [];
  /** @type {Syllable[]} */
  let syllables = chant.syllables;
  for (let i = 0; i < syllables.length; i++) {
    /** @type {Syllable} */
    let syllable_i = syllables[i];
    for (let j = 0; j < syllable_i.neumeComponents.length; j++) {
      let neume = syllable_i.neumeComponents[j];
      if (neume.ornamental != null && neume.ornamental.type == ornamentalType) {
        syllableList.push(syllable_i.syllableWord);
      }
    }
  }
  return syllableList;
}

/**
 * Obtain the syllables that contain the ornamental shapes
 * @param {Chant[]} chantList list of chants to be filtered
 * @param {{liquescent: boolean, quilisma: boolean, oriscus: boolean}} ornamentalOptions options for the ornamental search
 * @returns {{"liquescent": string[], "quilisma": string[], "oriscus": string[]}} list of syllables that contain the ornamental shapes
 */
function obtainSyllables(chantList, ornamentalOptions) {
  let liquescentSyllables = [];
  let quilismaSyllables = [];
  let oriscusSyllables = [];
  for (let chant of chantList) {
    if (ornamentalOptions.liquescent) {
      liquescentSyllables.push(getOrnamentalSyllables(chant, "liquescent"));
    }

    if (ornamentalOptions.quilisma) {
      quilismaSyllables.push(getOrnamentalSyllables(chant, "quilisma"));
    }

    if (ornamentalOptions.oriscus) {
      oriscusSyllables.push(getOrnamentalSyllables(chant, "oriscus"));
    }
  }

  const syllablesLists = {
    "liquescent": liquescentSyllables,
    "quilisma": quilismaSyllables,
    "oriscus": oriscusSyllables
  }

  return syllablesLists;
}

/**
 * Perform highlighting when user clicks on "Search" button
 * @return {"chant": Chant[]} list of chants that match the search query
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

  resultChantList = filterByOrnamentalShapes(resultChantList, ornamentalOptions);

  /* Return the result */
  return resultChantList;
}

/**
 * Show the search result on the screen
 * @param {Chant[]} resultChantList list of chants that match the search query
 * @param {{"liquescent": string[], "quilisma": string[], "oriscus": string[]}} syllablesList list of syllables that contain the ornamental shapes
 */
export function showSearchResult(resultChantList) {
  searchResultDiv.innerHTML = '';

  /** @type {HTMLTableElement} */
  let resultTable = document.createElement('table');
  resultTable.id = "result-table"; // for CSS styling

  // Create the head row of the table
  const tableHeadRows = ["Title", "Music Script", "Mode", "Text", "Source", "Links"];
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


  /** Regular expression to match the file name format
   * - Pattern: 3 digits, an underscore, a letter, and 2 digits
   * - Example: 092_F26
   * @type {RegExp}
   * */
  const fileNameRegex = /\d{3}_\w{1}\d{2}/;
  for (let chant of resultChantList) {
    // create a result row for each chant
    let resultRow = document.createElement('tr');

    let tdNotationType = createTableCell(chant.notationType);
    let tdMode;
    if (chant.mode != undefined) {
      tdMode = createTableCell(`${chant.mode} (${chant.modeCertainty.toFixed(1)}%)`);
    } else {
      tdMode = createTableCell("undetected");
      tdMode.style.color = "red";
    }

    let tdSyllablesContent = [];
    for (let syllable of chant.syllables) {
      // Extract the syllable word and its position from each syllable
      let word = syllable.syllableWord.text;
      let position = syllable.syllableWord.position;
      let ornamentalNC;
      for (let nc of syllable.neumeComponents) {
        if (nc.ornamental != null) {
          ornamentalNC = nc.ornamental.type;
          break;
        }
      }

      // Construct the text for the syllables
      if (ornamentalNC != null) {
        const wordWrapper = document.createElement('span');
        wordWrapper.id = ornamentalNC + "-word"; // for CSS styling
        wordWrapper.innerText = word;
        word = wordWrapper.outerHTML;
      }
      if (position == "s" || position == "i") {
        // standard syllable
        // initial syllable
        tdSyllablesContent.push(word);
      } else if (position == "m" || position == "t") {
        // medial syllable, add to the last syllable
        // terminal syllable, add to the last syllable
        tdSyllablesContent[tdSyllablesContent.length - 1] += word;
      }
    }
    let tdSyllables = createTableCellHTML(tdSyllablesContent.join(" "));


    /** @type {HTMLAnchorElement} */
    let pemLinkBtnDiv = document.createElement('div');

    for (let pemUrl of chant.pemDatabaseUrls) {
      let linkButton = document.createElement('button');
      let a = document.createElement('a');
      a.href = pemUrl;
      a.target = "_blank";
      a.style.textDecoration = "none";
      // Wrap a button with the link
      a.appendChild(linkButton);
      linkButton.innerText = "PEM - " + pemUrl.split("/").pop();
      linkButton.style.width = "8.64rem";
      // Add the linked button to the div
      pemLinkBtnDiv.appendChild(a);
    }

    // add the file name of the chant to row cell
    let displayChantBtn = document.createElement('button');
    displayChantBtn.textContent = "Display Chant " + chant.fileName.match(fileNameRegex);
    displayChantBtn.addEventListener("click", () => {
      // Set the box for the chant and draw the chant
      chantSVG.style.boxShadow = "0 0 2px 3px #888";
      chantSVG.innerHTML = drawSVGFromMEIContent(chant.meiContent);
      // Display the chant information (file name, notation type, mode, etc.)
      printChantInformation(chant);
      chantDisplay.scrollIntoView({ behavior: "smooth" });
    });

    let tdLinks = createTableCell();
    let tdLinksDiv = document.createElement('div');

    tdLinksDiv.style = "display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 0.5rem; font-size: 1rem;";
    tdLinksDiv.appendChild(pemLinkBtnDiv);
    tdLinksDiv.appendChild(displayChantBtn);
    tdLinks.appendChild(tdLinksDiv);

    let tdSource = createTableCell(chant.source);

    let tdTitle = createTableCell(chant.title);

    // In order: title, notation type, mode, source, PEM database URL, file name
    resultRow.appendChild(tdTitle);
    resultRow.appendChild(tdNotationType); // Music script
    resultRow.appendChild(tdMode);
    resultRow.appendChild(tdSyllables);
    resultRow.appendChild(tdSource);
    resultRow.appendChild(tdLinks);
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

  let info = {
    "Title": chant.title,
    "Source": chant.source,
    "Music script": chant.notationType,
    "Mode": chant.mode == undefined ? "Undetected" : chant.mode,
    "Mode Certainty": chant.modeCertainty == undefined ? "-" : chant.modeCertainty + "%",
    "Mode Description": chant.modeDescription == undefined ? "-" : chant.modeDescription.replaceAll("\n", "<br>"),
    "MEI File": chant.fileName,
    "PEM Database URL": chant.pemDatabaseUrls,
  };

  for (let k in info) {
    let p = document.createElement('p');
    if (k == "PEM Database URL") { // Special rendering for PEM Database URL
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
    } else if (k == "MEI File") { // Links to the GitHub MEI files
      p.innerHTML = `<b>${k}</b>: `;
      const rootGABCtoMEI = 'https://github.com/ECHOES-from-the-Past/GABCtoMEI/blob/main/MEI_outfiles/';
      let file = database.find(c => c.includes(info[k]));
      let a = document.createElement('a');
      a.href = rootGABCtoMEI + file;
      a.target = "_blank";
      a.innerText = `${chant.fileName} (GitHub)`;
      p.appendChild(a);
    } else {  // Default rendering
      p.innerHTML = `<b>${k}</b>: ${info[k]}`;
    }
    chantInfo.appendChild(p);
  }
}

function createTableCell(content) {
  let td = document.createElement('td');
  td.textContent = content;
  return td;
}

function createTableCellHTML(content) {
  let td = document.createElement('td');
  td.innerHTML = content;
  return td;
}