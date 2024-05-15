import { highlightPattern } from "../utility/utils.js";
import { Chant, NeumeComponent, toSeptenary } from "../utility/components.js";

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
  const ncArray = chant.neumeComponents;
  const chantNotationType = chant.notationType;

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
        if (ncArray[i_nc + i_sp].loc + searchPattern[i_sp] == ncArray[i_nc + i_sp + 1].loc) {
          patternFound.push(ncArray[i_nc + i_sp + 1]);
        } else {
          patternFound = [];
          break;
        }
      } else if (chantNotationType == "square") {
        // processing the search for Square notation, using the `septenary` value of the note
        if (toSeptenary(ncArray[i_nc + i_sp]) + searchPattern[i_sp] == toSeptenary(ncArray[i_nc + i_sp + 1])) {
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
