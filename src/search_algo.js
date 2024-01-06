import { parse_MEI_AQ, parse_MEI_SQ } from "./utils.js";

/**
 * A function that highlight Aquitanian chant based on its absolute location (`@loc` attribute in the MEI file)
 * @param {MEI_Content} MEI_Content the aquitanian MEI (.mei) file to be highlighted
 * @param {Array<Number>} search_pattern an array of number, parse from user's input
 */
export function highlight_absolute(MEI_Content, search_pattern) {
  let neume_array = parse_MEI_AQ(MEI_Content);
  let aq_count = 0;

  for (let i_nc = 0; i_nc < neume_array.length - search_pattern.length + 1; i_nc++) {
    if (neume_array[i_nc].loc == search_pattern[0]) {
      let i_search = 1;
      let search_found = [neume_array[i_nc]];
      while (i_search < search_pattern.length) {
        if (neume_array[i_nc + i_search].loc == search_pattern[i_search]) {
          search_found.push(neume_array[i_nc + i_search]);
          i_search++;
        } else {
          // Reset list if no search found
          search_found = [];
          break;
        }
      }

      // highlight the search found
      if (search_found.length != 0) {
        for (const nc of search_found) {
          nc.highlight();
        }
        aq_count++;
      }

    }
  }

  document.getElementById("search-count").innerHTML = aq_count;
}

/**
 * A function that highlight Aquitanian chant based on its contour location.
 * It also search the Square chant for a similar contour pattern.
 * 
 * The seach output may overlap; hence, it needs a pattern record and should allow
 * users to visit each pattern at a time.
 * @param {MEI_Content} Aquitanian_MEI the chant's MEI file in Aquitanian notation
 * @param {Array<Number>} search_pattern an array of number, parse from user's input
 */
export function highlight_aquitanian_pattern(Aquitanian_MEI, search_pattern) {
  /**
   * @param {Array<NeumeComponentAQ>} aquitanian_content 
   */
  let aquitanian_content = parse_MEI_AQ(Aquitanian_MEI);
  let aq_count = 0;

  for (let i_nc = 0; i_nc < aquitanian_content.length - search_pattern.length + 1; i_nc++) {
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
     * @param {Array<NeumeComponentAQ>} found_pattern the found pattern of Aquitanian Neume Component
    */
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
    if (found_pattern.length != 0) {
      // highlight the search found
      for (const nc of found_pattern) {
        nc.highlight();
        // nc.log();
      }
      aq_count++;
    }
  }
  document.getElementById("search-count").innerHTML = aq_count;
}


/**
 * A function that highlight Aquitanian chant based on its contour location.
 * It also search the Square chant for a similar contour pattern.
 * 
 * The seach output may overlap; hence, it needs a pattern record and should allow
 * users to visit each pattern at a time.
 * @param {MEI_Content} Aquitanian_MEI the chant's MEI file in Aquitanian notation
 * @param {Array<Number>} contour_pattern an array of number, parse from user's input
 */
export function highlight_contour_AQ(Aquitanian_MEI, contour_pattern) {
  /**
   * @param {Array<NeumeComponentAQ>} aquitanian_content 
   */
  let aquitanian_content = parse_MEI_AQ(Aquitanian_MEI);
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
    let found_pattern = [aquitanian_content[i_nc]];
    for (let i = 0; i < contour_pattern.length; i++) {
      if (Number(aquitanian_content[i_nc + i].loc) + contour_pattern[i] == Number(aquitanian_content[i_nc + i + 1].loc)) {
        found_pattern.push(aquitanian_content[i_nc + i + 1]);
      } else {
        // console.log(found_pattern);
        found_pattern = [];
        break;
      }
    }
    if (found_pattern.length != 0) {
      // highlight the search found
      for (const nc of found_pattern) {
        nc.highlight();
        // nc.log();
      }
      aq_count++;
    }
  }
  document.getElementById("search-count").innerHTML = aq_count;
}
