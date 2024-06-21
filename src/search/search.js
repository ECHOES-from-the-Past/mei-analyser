import { NeumeComponent, NeumeComponentSQ, toSeptenary, getNeumeComponentList } from "../database/components.js";
import { drawSVGFromMEIContent, highlightPattern, env, displayCertainty } from "../utility/utils.js";
import {
  liquescentCheckbox, quilismaCheckbox, oriscusCheckbox,
  aquitanianCheckbox, squareCheckbox,
  searchResultDiv, chantInfo, chantSVG, chantDisplay,
  modeCheckboxes, unknownModeCheckbox,
  melismaInput,
  contourRadio, exactPitchRadio, patternInputBox,
  melodicSearchError,
  searchResultInfo,
  customGABCCheckbox,
  aquitanianPitchCheckbox
} from "../DOMelements.mjs";

import { Chant } from "../database/components.js";
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
  let neumeComponents = getNeumeComponentList(chant.syllables);
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

/**
 * Filter by modes
 * @param {Chant[]} chantList list of chants to be filtered
 * @param {HTMLInputElement[]} modeCheckboxes list of checkboxes for each mode
 * @param {HTMLInputElement} unknownModeCheckbox checkbox for unknown/undetected mode
 * @returns {Chant[]} list of chants that has the selected modes. If no modes are selected, return all the chants.
 */
function filterByModes(chantList, modeCheckboxes, unknownModeCheckbox) {
  /** @type {Chant[]} resulting list of chants after filtering */
  let resultChantList = [];

  for (let i = 0; i < modeCheckboxes.length; i++) {
    if (modeCheckboxes[i].checked) {
      resultChantList.push(...chantList.filter(chant => { if (chant.mode == i + 1) return true; }));
    }
  }

  if (unknownModeCheckbox.checked) {
    resultChantList.push(...chantList.filter(chant => { if (chant.mode == -1) return true; }));
  }

  return resultChantList;
}

function getMelodicPatternSearchMode() {
  if (contourRadio.checked)
    return contourRadio.value;
  if (exactPitchRadio.checked)
    return exactPitchRadio.value;
}

function processSearchPattern(searchPattern, searchMode) {
  const numericMelodyRegex = /-?\d/g
  const alphabetMelodicRegex = /[A-Ga-g]/g

  let melodyList = [];

  melodicSearchError.hidden = true;
  if (searchMode == 'exact-pitch') {
    melodyList = searchPattern.match(alphabetMelodicRegex);
    // In case the user input is empty, regex will return null
    if (melodyList == null) return [];
    melodyList = melodyList.map(pitch => pitch.toLowerCase());
  } else if (searchMode == 'indefinite-pitch' || searchMode == 'contour') {
    melodyList = searchPattern.match(numericMelodyRegex);
    // In case the user input is empty, regex will return null
    if (melodyList == null) return [];
    melodyList = melodyList.map(Number);
  }

  return melodyList;
}

/**
 * 
 * @param {Chant} chant The chant object, assuming it's in Square notation
 * @param {string[]} searchQueryList in the form of ['A', 'B', 'C', 'D', 'E'] for example
 * @returns {NeumeComponentSQ[][]} a list of patterns (in list form) that match the search query
 */
function processExactPitchMelodicPattern(chant, searchQueryList) {
  /** @type {NeumeComponentSQ[]} */
  const ncArray = getNeumeComponentList(chant.syllables);

  let patterns = [];

  for (let i_nc = 0; i_nc < ncArray.length - searchQueryList.length; i_nc++) {
    let patternFound = [];

    for (let i_search = 0; i_search < searchQueryList.length; i_search++) {
      // processing the search for Square notation, using the `septenary` value of the note
      if (ncArray[i_nc + i_search].pitch == searchQueryList[i_search]) {
        patternFound.push(ncArray[i_nc + i_search]);
      } else {
        patternFound = [];
        break;
      }
    }

    if (patternFound.length > 0) {
      patterns.push(patternFound);
    }
  }
  return patterns;
}

/**
 * Only works for Aquitanian notation chants
 * @param {Chant} chant The chant object, assuming it's in Aquitanian notation
 * @param {string[]} searchQueryList in the form of [-1, 1, 0, -1, 2] for example
 * @returns 
 */
function processIndefinitePitchMelodicPattern(chant, searchQueryList) {
  const ncArray = getNeumeComponentList(chant.syllables);

  let patterns = [];

  for (let i_nc = 0; i_nc < ncArray.length - searchQueryList.length; i_nc++) {
    let patternFound = [];

    for (let i_sq = 0; i_sq < searchQueryList.length; i_sq++) {
      if (ncArray[i_nc + i_sq].loc == searchQueryList[i_sq]) {
        patternFound.push(ncArray[i_nc + i_sq]);
      } else {
        patternFound = [];
        break;
      }
    }

    if (patternFound.length > 0) {
      patterns.push(patternFound);
    }
  }

  return patterns;
}

/**
 * 
 * @param {Chant} chant a Chant object
 * @param {number[]} searchQueryList the list of numbers
 * @returns 
 */
function processContourMelodicPattern(chant, searchQueryList) {
  const ncArray = getNeumeComponentList(chant.syllables);
  const chantNotationType = chant.notationType;

  let patterns = [];

  for (let i_nc = 0; i_nc < ncArray.length - searchQueryList.length; i_nc++) {
    let patternFound = [];
    patternFound.push(ncArray[i_nc]);

    if (chantNotationType == "aquitanian") {
      for (let i_sq = 0; i_sq < searchQueryList.length; i_sq++) {
        // processing the search for Aquitanian notation, using the `loc` attribute
        if (ncArray[i_nc + i_sq].loc + searchQueryList[i_sq] == ncArray[i_nc + i_sq + 1].loc) {
          patternFound.push(ncArray[i_nc + i_sq + 1]);
        } else {
          patternFound = [];
          break;
        }
      }
    }
    else if (chantNotationType == "square") {
      for (let i_search = 0; i_search < searchQueryList.length; i_search++) {
        // processing the search for Square notation, using the `septenary` value of the note
        if (toSeptenary(ncArray[i_nc + i_search]) + searchQueryList[i_search] == toSeptenary(ncArray[i_nc + i_search + 1])) {
          patternFound.push(ncArray[i_nc + i_search + 1]);
        } else {
          patternFound = [];
          break;
        }
      }
    }
    if (patternFound.length > 0) {
      patterns.push(patternFound);
    }
  }
  return patterns;
}

/**
 * Using regular expression to process the user's input
 * (from the old parseSearchPattern function)
 * Regex pattern: /-?\d/g
 * - an optional negative `-` sign
 * - a single digit
 * 
 * Regex pattern: /[A-Ga-g]/g
 * - all alphabetical letters in range A-G or a-g
 * 
 * Search mode options:
 * - `exact-pitch` ~ Square pitch pattern (alphabetical value)
 * - `indefinite-pitch` ~ Aquitanian pitch pattern (numerical value)
 * - `contour` ~ Aquitanian/Square contour pattern (numerical)
 * @param {Chant[]} chantList
 * @param {string} searchPattern
 * @param {string} searchMode 
 * @returns {Chant[]} list of chants that contains the melodic pattern
 */
function filterByMelodicPattern(chantList, searchPattern, searchMode) {
  // If search pattern is empty, return the original chant list regardless of the search mode
  if (!searchPattern) {
    return chantList;
  }

  let searchQueryList = [], resultChantList = [];

  try {
    searchQueryList = processSearchPattern(searchPattern, searchMode);
  } catch (error) {
    console.error(error);
    melodicSearchError.textContent = "Invalid melodic pattern options. Please check your search mode selection or query.";
    melodicSearchError.hidden = false;
    return;
  }

  if (searchMode == 'contour') {
    for (let chant of chantList) {
      let patterns = processContourMelodicPattern(chant, searchQueryList);
      if (patterns.length > 0) {
        resultChantList.push(chant);
      }
    }
  } else if (searchMode == 'exact-pitch') {
    for (let chant of chantList) {
      if (chant.notationType == "square") {
        let patterns = processExactPitchMelodicPattern(chant, searchQueryList);
        if (patterns.length > 0) {
          resultChantList.push(chant);
        }
      }
    }
  } else if (searchMode == 'indefinite-pitch') {
    for (let chant of chantList) {
      if (chant.notationType == "aquitanian") {
        let patterns = processIndefinitePitchMelodicPattern(chant, searchQueryList);
        if (patterns.length > 0) {
          resultChantList.push(chant);
        }
      }
    }
  } else {
    console.error("Invalid search mode!");
  }

  return resultChantList;
}

/**
 * Perform highlighting when user clicks on "Search" button
 * @return {"chant": Chant[]} list of chants that match the search query
 */
export async function performSearch() {
  const databaseURL = env == "development" ? "src/database/database.json" : "./database.json";

  /** Retrieving the locally stored list of chants */
  let resultChantList = await fetch(databaseURL).then(response => response.json());

  /* First layer of filtering: Notation type */
  resultChantList = resultChantList.filter(chant => {
    if (aquitanianCheckbox.checked && chant.notationType == "aquitanian") return true;
    if (squareCheckbox.checked && chant.notationType == "square") return true;
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

  /* Third layer of filtering: Modes */
  resultChantList = filterByModes(resultChantList, modeCheckboxes, unknownModeCheckbox);

  /* Forth layer of filtering: Pattern search */
  resultChantList = filterByMelodicPattern(resultChantList, patternInputBox.value, getMelodicPatternSearchMode())

  // Display the amount of chants that match the search options
  searchResultInfo.innerHTML = `Found <b>${resultChantList.length}</b> chants from the search options.`;

  /**
   * Sort chant list by file name
   * Ternary operation explain:
   * - If chantA's file name is "less than" chantB's file name, return -1 to sort chantA before chantB
   * - Otherwise, return 1 to sort chantA after chantB
   */
  resultChantList.sort((chantA, chantB) => (chantA.fileName < chantB.fileName) ? -1 : 1);

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

  /** Constructing the details of the table 
   * @type {Chant}
  */
  for (let chant of resultChantList) {
    // create a result row for each chant
    let resultRow = document.createElement('tr');

    let tdNotationType = createTableCell(chant.notationType);
    let tdMode;
    if (chant.mode != -1) {
      tdMode = createTableCell(`${chant.mode} (${displayCertainty(chant.modeCertainty)})`);
    } else {
      tdMode = createTableCell("Unknown");
      tdMode.style.color = "red";
    }

    /* Constructing the text column  */
    let tdSyllablesContent = [];
    let customGABC = [];

    // In case the word is part of a melodic pattern
    let melodicPattern = [];
    if (contourRadio.checked) {
      melodicPattern = processContourMelodicPattern(chant, processSearchPattern(patternInputBox.value, getMelodicPatternSearchMode()));
    } else if (exactPitchRadio.checked) {
      melodicPattern = processExactPitchMelodicPattern(chant, processSearchPattern(patternInputBox.value, getMelodicPatternSearchMode()));
    } else if (indefinitePitchRadio.checked) {
      melodicPattern = processIndefinitePitchMelodicPattern(chant, processSearchPattern(patternInputBox.value, getMelodicPatternSearchMode()));
    }

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
      const wordWrapper = document.createElement('span');

      // Construct the text for the syllables
      if (ornamentalNC != null) {
        wordWrapper.classList.add(ornamentalNC + "-word") // for CSS styling
      }

      // Detect melismas with 6+ neume components
      let melismaMin = melismaInput.value;
      if (syllable.neumeComponents.length >= melismaMin) {
        wordWrapper.classList.add("melisma-word");
      }

      if (melodicPattern.length > 0) {
        for (let pattern of melodicPattern) {
          // compare two list, if there's a match (the same element from both), add the class to the wordWrapper
          for (let i = 0; i < pattern.length; i++) {
            for (let j = 0; j < syllable.neumeComponents.length; j++) {
              if (JSON.stringify(pattern[i]) === JSON.stringify(syllable.neumeComponents[j])) {
                wordWrapper.classList.add("melodic-pattern-word");
              }
            }
          }
        }
      }

      wordWrapper.innerText = word;
      if (wordWrapper.classList.length > 0) {
        word = wordWrapper.outerHTML;
      }

      const octaveKeys = ["c", "d", "e", "f", "g", "a", "b"];
      const clef = chant.clef.shape;
      const gap = octaveKeys.indexOf(clef.toLowerCase());

      if (position == "s" || position == "i") {
        // standard syllable
        // initial syllable
        tdSyllablesContent.push(word);
        if (chant.notationType == "square") {
          customGABC.push(`${word}(${syllable.neumeComponents.map(nc => nc.pitch).join("")})`);
        } else if (chant.notationType == "aquitanian") {
          if (aquitanianPitchCheckbox.checked && chant.clef.shape != null) {
            customGABC.push(`${word}(${syllable.neumeComponents.map(nc => {
              return octaveKeys.at((nc.loc + 7 + gap) % 7);
            }).join("")})`);
          } else if (!aquitanianPitchCheckbox.checked) {
            customGABC.push(`${word}(${syllable.neumeComponents.map(nc => nc.loc).join("")})`);
          }
        }
      } else if (position == "m" || position == "t") {
        // medial syllable, add to the last syllable
        // terminal syllable, add to the last syllable
        tdSyllablesContent[tdSyllablesContent.length - 1] += word;
        if (chant.notationType == "square") {
          customGABC[customGABC.length - 1] += `${word}(${syllable.neumeComponents.map(nc => nc.pitch).join("")})`;
        } else if (chant.notationType == "aquitanian") {
          if (aquitanianPitchCheckbox.checked && chant.clef.shape != null) {
            customGABC[customGABC.length - 1] += `${word}(${syllable.neumeComponents.map(nc => {
              return octaveKeys.at((nc.loc + 7 + gap) % 7);
            }).join("")})`;
          } else if (!aquitanianPitchCheckbox.checked) {
            customGABC[customGABC.length - 1] += `${word}(${syllable.neumeComponents.map(nc => nc.loc).join("")})`;
          }
        }
      }
    }
    let tdSyllables = createTableCellHTML(tdSyllablesContent.join(" "));

    let customGABCDiv = document.createElement('div');
    customGABCDiv.classList.add("custom-gabc");

    customGABCDiv.innerHTML = "<hr>" + customGABC.join(" ");
    customGABCDiv.hidden = !customGABCCheckbox.checked;

    tdSyllables.appendChild(customGABCDiv);


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
      linkButton.innerText = "View image on PEM";
      linkButton.style.width = "8.64rem";
      // Add the linked button to the div
      pemLinkBtnDiv.appendChild(a);
    }

    // add the file name of the chant to row cell
    let displayChantBtn = document.createElement('button');
    displayChantBtn.textContent = "Display chant " + chant.fileName.match(fileNameRegex);
    displayChantBtn.addEventListener("click", async () => {
      // Display the chant information (file name, notation type, mode, etc.)
      await printChantInformation(chant);

      // Set the box for the chant and draw the chant
      chantSVG.style.boxShadow = "0 0 2px 3px #888";
      chantSVG.innerHTML = drawSVGFromMEIContent(chant.meiContent);

      chantDisplay.scrollIntoView({ behavior: "smooth" });

      // Highlight search pattern
      let melodicPattern = [];
      if (contourRadio.checked) {
        melodicPattern = processContourMelodicPattern(chant, processSearchPattern(patternInputBox.value, getMelodicPatternSearchMode()));
      } else if (exactPitchRadio.checked) {
        melodicPattern = processExactPitchMelodicPattern(chant, processSearchPattern(patternInputBox.value, getMelodicPatternSearchMode()));
      } else if (indefinitePitchRadio.checked) {
        melodicPattern = processIndefinitePitchMelodicPattern(chant, processSearchPattern(patternInputBox.value, getMelodicPatternSearchMode()));
      }
      for (let pattern of melodicPattern) {
        highlightPattern(pattern);
      }
    });

    let tdLinks = createTableCell();
    let tdLinksDiv = document.createElement('div');

    tdLinksDiv.style = "display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 0.5rem; font-size: 1rem;";
    tdLinksDiv.appendChild(displayChantBtn);
    tdLinksDiv.appendChild(pemLinkBtnDiv);
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
async function printChantInformation(chant) {
  chantInfo.innerHTML = '';

  let info = {
    "Title": chant.title,
    "Source": chant.source,
    "Music script": chant.notationType,
    "Mode": chant.mode == -1 ? "Unknown" : chant.mode,
    "Mode Certainty": displayCertainty(chant.modeCertainty),
    "Mode Description": chant.modeDescription,
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
      const rootGABCtoMEI = 'https://github.com/ECHOES-from-the-Past/GABCtoMEI/blob/main/';

      let fileName = chant.fileName;
      let a = document.createElement('a');

      a.href = rootGABCtoMEI + fileName;
      a.target = "_blank";
      a.innerText = `${fileName.split("/").pop()} (GitHub)`; // showing the file name only
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

export function clearSearchResultsAndInfo() {
  // Clear the search result display
  searchResultDiv.innerHTML = '<p> Search results will display here. </p>';

  // Clear the display when performing a new search
  chantInfo.innerHTML = "<p> Chant information will display here </p>";
  chantSVG.innerHTML = "<p> Click on the chant's file name to display </p>";
  chantSVG.style = ""; // clear the border styling of the chant SVG
}
