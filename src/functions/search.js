import { NeumeComponent, NeumeComponentSQ, toSeptenary, getNeumeComponentList } from "../utility/components.js";

import { Chant } from "../utility/components.js";

/**
  * Process the search pattern using regexp
  * @param {string} searchPattern raw string taken from the input box
  * @param {string} searchMode 'exact-pitch' or 'contour'
  * @returns {string[] | number[]} list of pitches or contours in the search pattern.
  * If the search pattern is empty, return an empty list [].
  */
function processSearchPattern(searchPattern, searchMode) {
  const numericMelodyRegex = /-?\d/g;
  const alphabetMelodicRegex = /[A-Ga-g]/g;

  let melodyList = [];

  if (searchMode == "exact-pitch") {
    melodyList = searchPattern.match(alphabetMelodicRegex);
    // In case the user input is empty, regex will return null
    if (melodyList == null) return [];
    melodyList = melodyList.map((pitch) => pitch.toLowerCase());
  } else if (searchMode == "contour") {
    melodyList = searchPattern.match(numericMelodyRegex);
    // In case the user input is empty, regex will return null
    if (melodyList == null) return [];
    melodyList = melodyList.map(Number);
  }

  return melodyList;
}

/**
 * @param {Chant[]} chantList The list of chants
 * @param {{"aquitanian": boolean, "square": boolean}} musicScripts an array of chant types.
 */
export function filterByMusicScript(chantList, musicScripts) {
  let filteredChantList = chantList.filter((chant) => {
    if (musicScripts.aquitanian && chant.notationType == "aquitanian") {
      return true;
    } else if (musicScripts.square && chant.notationType == "square") {
      return true;
    }
    return false;
  });

  return filteredChantList;
}

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
 * - `contour` ~ Aquitanian/Square contour pattern (numerical value)
 * @param {Chant[]} chantList
 * @param {string} searchPattern
 * @param {string} searchMode
 * @returns {Chant[]} list of chants that contains the melodic pattern
 */
export function filterByMelodicPattern(chantList, searchPattern, searchMode) {
  // If search pattern is empty, return the original chant list regardless of the search mode
  if (!searchPattern) {
    return chantList;
  }

  let searchQueryList = [],
    resultChantList = [];

  try {
    searchQueryList = processSearchPattern(searchPattern, searchMode);
  } catch (error) {
    console.error(error);
    // patternInputStatus.textContent =
    //     "Invalid melodic pattern options/input. Please check your search mode selection or query.";
    // patternInputStatus.hidden = false;
    return [];
  }

  if (searchQueryList.length === 0) {
    // patternInputStatus.hidden = false;
    // patternInputStatus.textContent =
    //     "Invalid melodic pattern options/input. Please check your search mode selection or query.\n";
    // patternInputStatus.style.color = "red";
    return [];
  }

  if (searchMode == "contour") {
    for (let chant of chantList) {
      let patterns = processContourMelodicPattern(
        chant,
        searchQueryList,
      );
      if (patterns.length > 0) {
        resultChantList.push(chant);
      }
    }
  } else if (searchMode == "exact-pitch") {
    for (let chant of chantList) {
      if (chant.notationType == "square") {
        let patterns = processExactPitchMelodicPattern(
          chant,
          searchQueryList,
        );
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
 * @deprecated
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