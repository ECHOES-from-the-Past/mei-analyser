import { highlightPattern } from "../utility/utils.js";
import { Chant, NeumeComponent, NeumeComponentAQ, NeumeComponentSQ } from "../utility/components.js";

/**
 * @deprecated unused function, saving for future reference only.
 * Highlighting notes based on its absolute pitch pattern (only work for Aquitanian notation)
 * @param {Chant} chant the aquitanian MEI (.mei) file to be highlighted
 * @param {Number[]} searchPattern an array of number, parse from user's input
 * @returns {Number} the number of pattern(s) found
 */
function highlightAbsolutePitchPattern(chant, searchPattern) {
  let count = 0;
  const ncArray = chant.getNeumeComponents();
  for (let i_nc = 0; i_nc < ncArray.length - searchPattern.length + 1; i_nc++) {
    if (ncArray[i_nc].getLoc() == searchPattern[0]) {
      let i_search = 1;
      let patternFound = [ncArray[i_nc]];
      while (i_search < searchPattern.length) {
        if (ncArray[i_nc + i_search].getLoc() == searchPattern[i_search]) {
          patternFound.push(ncArray[i_nc + i_search]);
          i_search++;
        } else {
          // Reset list if no search found
          patternFound = [];
          break;
        }
      }

      if (patternFound.length > 0) {
        highlightPattern(patternFound);
        count++;
      }
    }
  }
  return count;
}

/**
 * Algorithm:
 * 1. Get the distance between the first value of search_pattern
 * and the neume component of aquitanian_content
 * 2. Subtract all values in search_pattern by the distance 
 * found above 
 * 3. Check the matching sequence (aquitanian_content[i:].loc and search_pattern[i:])
 * until the end of search pattern.
 * 4. Highlight found pattern
*/

/**
 * A function that highlight Aquitanian chant based on its contour location.
 * It also search the Square chant for a similar contour pattern.
 * 
 * The seach output may overlap; hence, it needs a pattern record and should allow
 * users to visit each pattern at a time.
 * @param {Chant} aquitanian_content the chant's MEI file in Aquitanian notation
 * @param {Number[]} search_pattern an array of number, parse from user's input
 */
export function highlightPitchPattern(chant, searchPattern) {
  const ncArray = chant.getNeumeComponents();
  const chantNotationType = chant.getNotationType();
  let patternFound = [];
  let patternCount = 0;

  for (let i_nc = 0; i_nc < ncArray.length - searchPattern.length; i_nc++) {
    patternFound.push(ncArray[i_nc]);
    let distance = search_pattern[0] - aquitanian_content[i_nc].loc;
    let temp_search_pattern = [...searchPattern].map((e) => e - distance);
    if (aquitanian_content[i_nc + i].loc == temp_search_pattern[i]) {
      found_pattern.push(aquitanian_content[i_nc + i]);
    } else {
      found_pattern = [];
      break;
    }
    if (patternFound.length > 0) {
      highlightPattern(patternFound);
      patternCount++;
    }
  }
  return patternCount;
}

/**
 * Algorithm: convert square neume component to base-7 value (via `septenary()`)
 * and check the melodic interval between two values.
 * NOTE: there are some redundancy/repetition in the calculation that can be optimized. 
*/
/**
   * Algorithm:
   * Check if the next note's `@loc` equals to
   * the current note's `@loc` + the search pattern melodic interval
   * 
   * - At aq_note with index `nc` (`nc` = [0, aq-content_length - contour_pattern.length])
   * - Add the aq_note[nc] to found_pattern as the starting point
   * - Traverse the contour_pattern from i = 0 to i < contour_pattern.length
   * - Return True and add aq_note[nc+1] to found_pattern if 
   * <b> aq_note[nc+i].loc + contour_pattern[i] = aq_note[nc+i+1].loc <b>
   * - If return False, clear the found_pattern array and break out of contour_pattern loop
   * 
   * Misc. notes: aq_note[i_nc].loc must be cast to Number to be able to add with contour_pattern[i] 
  */

/**
 * Highlighting the pattern of Neume Components based on the **contour** search pattern
 * @param {Chant} chant The chant object
 * @param {Number[]} searchPattern The numerical array for the search pattern
 * @returns {Number} The number of patterns found
 */
export function highlightContourPattern(chant, searchPattern) {
  /**
   * @type {NeumeComponentAQ[] | NeumeComponentSQ[]}
   */
  const ncArray = chant.getNeumeComponents();
  const chantNotationType = chant.getNotationType();

  let patternCount = 0;
  let patterns = [];
  
  for (let i_nc = 0; i_nc < ncArray.length - searchPattern.length; i_nc++) {
    /**
     * @type {NeumeComponent[]}
     * An array that stores the neuem components that match the search pattern
    */
    let patternFound = [];
    patternFound.push(ncArray[i_nc]);
    for (let i_sp = 0; i_sp < searchPattern.length; i_sp++) {
      if (chantNotationType == "aquitanian") {
        // processing the search for Aquitanian notation, using the `loc` attribute
        if (ncArray[i_nc + i_sp].getLoc() + searchPattern[i_sp] == ncArray[i_nc + i_sp + 1].getLoc()) {
          patternFound.push(ncArray[i_nc + i_sp + 1]);
        } else {
          patternFound = [];
          break;
        }
      } else if (chantNotationType == "square") {
        // processing the search for Square notation, using the `septenary` value of the note
        if (ncArray[i_nc + i_sp].septenary() + searchPattern[i_sp] == ncArray[i_nc + i_sp + 1].septenary()) {
          patternFound.push(ncArray[i_nc + i_sp + 1]);
        } else {
          patternFound = [];
          break;
        }
      }
    }
    if (patternFound.length > 0) {
      highlightPattern(patternFound);
      patterns.push(patternFound);
      patternCount++;
    }
  }
  console.debug(patterns);
  return patternCount;
}

/**
 * @param {Chant} chant the Chant object
 * @param {Number} slot the slot number (1 or 2)
 */
export function displayChantMode(chant, slot) {
  document.getElementById("chant-mode-" + slot).innerHTML = chant.getMode();
}

/**
 * Make a function that search for all the chants with a certain mode
 * @param {Number} mode the mode to be searched
*/

/**
 * Search for pitch/melodic pattern + mode (combining search functions)
 */


/**
 * Process the contour search pattern for both left and right slots
 * @param {Chant} chant the Chant object
 * @param {Number[]} searchPattern 
 * @param {Number} slot 
 */
function contourPatternSearch(chant, searchPattern, slot) {
  let patternCount = highlightContourPattern(chant, searchPattern);

  document.getElementById("chant-type-" + slot).innerHTML = chant.getNotationType();
  document.getElementById("pattern-count-" + slot).innerHTML = patternCount;
}