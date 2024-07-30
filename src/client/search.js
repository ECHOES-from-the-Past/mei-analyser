import { NeumeComponent, NeumeComponentSQ, toSeptenary, getNeumeComponentList } from "../utility/components.js";
import {
  contourRadio, exactPitchRadio,
  patternInputStatus,
} from "../DOMelements.mjs";

import { Chant } from "../utility/components.js";
/**
 * ----------------------- SEARCH -----------------------
 */



/**
 * Filter by modes
 * @param {Chant[]} chantList list of chants to be filtered
 * @param {{"numbers": Number[], "unknown": boolean}} modes interested modes
 * @returns {Chant[]} list of chants that has the selected modes. If no modes are selected, return all the chants.
 */
function filterByModes(chantList, modes) {
  /** @type {Chant[]} resulting list of chants after filtering */
  let resultChantList = [];

  modes.numbers.forEach((value) => {
    resultChantList.push(...chantList.filter(chant => { if (chant.mode == value) return true; }));
  })
  
  if (modes.unknown) {
    resultChantList.push(...chantList.filter(chant => { if (chant.mode == -1) return true; }));
  }

  return resultChantList;
}

/**
 * @returns {string} 'exact-pitch' or 'contour' based on the user's selection
 */
function getMelodicPatternSearchMode() {
  if (contourRadio.checked)
    return contourRadio.value;
  if (exactPitchRadio.checked)
    return exactPitchRadio.value;
}

/**
 * Process the search pattern using regexp
 * @param {string} searchPattern raw string taken from the input box
 * @param {string} searchMode 'exact-pitch' or 'contour'
 * @returns {string[] | number[]} list of pitches or contours in the search pattern. 
 * If the search pattern is empty, return an empty list [].
 */
function processSearchPattern(searchPattern, searchMode) {
  const numericMelodyRegex = /-?\d/g
  const alphabetMelodicRegex = /[A-Ga-g]/g

  let melodyList = [];

  patternInputStatus.hidden = true;
  if (searchMode == 'exact-pitch') {
    melodyList = searchPattern.match(alphabetMelodicRegex);
    // In case the user input is empty, regex will return null
    if (melodyList == null) return [];
    melodyList = melodyList.map(pitch => pitch.toLowerCase());
  } else if (searchMode == 'contour') {
    melodyList = searchPattern.match(numericMelodyRegex);
    // In case the user input is empty, regex will return null
    if (melodyList == null) return [];
    melodyList = melodyList.map(Number);
  }

  patternInputStatus.hidden = false;
  patternInputStatus.textContent = `Query detected: [${melodyList.join(", ")}]`;
  patternInputStatus.style.color = "green";

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
 * @deprecated for being unused
 * 
 * Only works for Aquitanian notation chants
 * @param {Chant} chant The chant object, assuming it's in Aquitanian notation
 * @param {string[]} searchQueryList in the form of [-1, 1, 0, -1, 2] for example
 * @returns {NeumeComponent[][]} a list of patterns (in list form) that match the search query
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
 * @returns {NeumeComponent[][]} a list of patterns (in list form) that match the search query
 */
function processContourMelodicPattern(chant, searchQueryList) {
  if (searchQueryList.length == 0) {
    return [];
  }

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

