import { highlight_pattern } from "../utility/utils.js";
import database from "./database.json";

export function loadCorpus() {
  console.table(database);
}

/**
 * A function that highlight Aquitanian chant based on its absolute location (`@loc` attribute in the MEI file)
 * @param {Array<NeumeComponentAQ>} neume_array the aquitanian MEI (.mei) file to be highlighted
 * @param {Array<Number>} search_pattern an array of number, parse from user's input
 */
export function highlight_absolute(neume_array, search_pattern) {
  let aq_count = 0;

  for (let i_nc = 0; i_nc < neume_array.length - search_pattern.length + 1; i_nc++) {
    if (neume_array[i_nc].loc == search_pattern[0]) {
      let i_search = 1;
      let found_pattern = [neume_array[i_nc]];
      while (i_search < search_pattern.length) {
        if (neume_array[i_nc + i_search].loc == search_pattern[i_search]) {
          found_pattern.push(neume_array[i_nc + i_search]);
          i_search++;
        } else {
          // Reset list if no search found
          found_pattern = [];
          break;
        }
      }

      if (found_pattern.length > 0) {
        highlight_pattern(found_pattern);
        aq_count++;
      }
    }
  }

  document.getElementById("aq-count").innerHTML = aq_count;
}

/**
 * A function that highlight Aquitanian chant based on its contour location.
 * It also search the Square chant for a similar contour pattern.
 * 
 * The seach output may overlap; hence, it needs a pattern record and should allow
 * users to visit each pattern at a time.
 * @param {Array.NeumeComponentAQ} aquitanian_content the chant's MEI file in Aquitanian notation
 * @param {Array<Number>} search_pattern an array of number, parse from user's input
 */
export function highlight_aquitanian_pattern(aquitanian_content, search_pattern) {
  let aq_count = 0;

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
  for (let i_nc = 0; i_nc < aquitanian_content.length - search_pattern.length + 1; i_nc++) {
    //found_pattern is typed Array<NeumeComponentAQ>
    let found_pattern = [aquitanian_content[i_nc]];
    let distance = search_pattern[0] - aquitanian_content[i_nc].loc;
    let temp_search_pattern = [...search_pattern].map((e) => e - distance);
    // console.log(temp_search_pattern)
    for (let i = 1; i < temp_search_pattern.length; i++) {
      if (aquitanian_content[i_nc + i].loc == temp_search_pattern[i]) {
        found_pattern.push(aquitanian_content[i_nc + i]);
      } else {
        found_pattern = [];
        break;
      }
    }
    if (found_pattern.length > 0) {
      highlight_pattern(found_pattern);
      aq_count++;
    }
  }
  document.getElementById("search-count").innerHTML = aq_count;
}


/**
 * A function that highlight Aquitanian chant based on its contour location.
 * 
 * The seach output may overlap; hence, it needs a pattern record and should allow
 * users to visit each pattern at a time.
 * @param {Array<NeumeComponentAQ>} aquitanian_content an array of NeumeComponentAQ
 * @param {Array<Number>} contour_pattern an array of number, parse from user's input
 * @returns {Number} the number of pattern found 
 */
export function highlight_contour_AQ(aquitanian_content, contour_pattern) {
  let aq_count = 0;

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
  for (let i_nc = 0; i_nc < aquitanian_content.length - contour_pattern.length; i_nc++) {
    /**
     * @param {Array<NeumeComponentAQ>} found_pattern the found pattern of Aquitanian Neume Component
    */
    let found_pattern = [];
    // Add the first note (starting point) for the found pattern
    found_pattern.push(aquitanian_content[i_nc]);
    for (let i = 0; i < contour_pattern.length; i++) {
      if (aquitanian_content[i_nc + i].get_loc() + contour_pattern[i] == aquitanian_content[i_nc + i + 1].get_loc()) {
        found_pattern.push(aquitanian_content[i_nc + i + 1]);
      } else {
        found_pattern = [];
        break;
      }
    }
    if (found_pattern.length > 0) {
      highlight_pattern(found_pattern);
      aq_count++;
    }
  }

  return aq_count;
  // Display the pattern count
  // document.getElementById("aq-count").innerHTML = aq_count;
}


/**
 * A function that highlight Square chant based on its contour location.
 * 
 * The seach output may overlap; hence, it needs a pattern record and should allow
 * users to visit each pattern at a time.
 * @param {Array<NeumeComponentSQ>} Square_MEI the chant's MEI file in square notation
 * @param {Array<Number>} contour_pattern an array of number, parse from user's input
 * @returns {Number} the number of pattern found
 */
export function highlight_contour_SQ(square_content, contour_pattern) {
  let sq_count = 0;

  /**
   * Algorithm: convert square neume component to base-7 value (via `septenary()`)
   * and check the melodic interval between two values.
   * NOTE: there are some redundancy/repetition in the calculation that can be optimized. 
   */
  for (let i_nc = 0; i_nc < square_content.length - contour_pattern.length; i_nc++) {
    /**
     * @param {Array<NeumeComponentSQ>} found_pattern the found pattern of Aquitanian Neume Component
    */
    let found_pattern = [];
    found_pattern.push(square_content[i_nc]);
    for (let i = 0; i < contour_pattern.length; i++) {
      if (square_content[i_nc + i].septenary() + contour_pattern[i] == square_content[i_nc + i + 1].septenary()) {
        found_pattern.push(square_content[i_nc + i + 1]);
      } else {
        found_pattern = [];
        break;
      }
    }
    if (found_pattern.length > 0) {
      highlight_pattern(found_pattern);
      sq_count++;
    }

  }
  return sq_count;
}
