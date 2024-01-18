import { NeumeComponentAQ, NeumeComponentSQ } from "./components.js";
import { highlight_pattern } from "./utils.js";
import { needlemanWunsch, needlemanWunsch_nc } from "./needleman-wunsch.js";

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
 * @param {Array<NeumeComponentAQ>} aquitanian_content the chant's MEI file in Aquitanian notation
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
    let found_pattern = [aquitanian_content[i_nc]];
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
     * @param {Array<NeumeComponentAQ>} found_pattern the found pattern of Aquitanian Neume Component
    */
    let found_pattern = [square_content[i_nc]];
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


/**
 * Using Needleman-Wunsch algorithm to analyse the difference between two different chants
 * @param {Array<NeumeComponentAQ | NeumeComponentSQ>} pattern_1 Neume Component array of pattern 1
 * @param {Array<NeumeComponentAQ | NeumeComponentSQ>} pattern_2 Neume Component array of pattern 2
 */
export function pattern_analysis(pattern_1, pattern_2) {
  if (pattern_1.length == 0 || pattern_2.length == 0) {
    alert("Please upload both files before comparing them.");
    return;
  }

  let pattern_1_loc = [], pattern_2_loc = [];
  if (pattern_1[0] instanceof NeumeComponentAQ) {
    pattern_1_loc = pattern_1.map((e) => e.get_loc());
  } else if (pattern_1[0] instanceof NeumeComponentSQ) {
    pattern_1_loc = pattern_1.map((e) => e.septenary());
  }

  if (pattern_2[0] instanceof NeumeComponentAQ) {
    pattern_2_loc = pattern_2.map((e) => e.get_loc());
  }
  else if (pattern_2[0] instanceof NeumeComponentSQ) {
    pattern_2_loc = pattern_2.map((e) => e.septenary());
  }

  /**
   * Constructing the contour matrix based on Aquitanian's `@loc` and Square's `septenary` value
   */
  const pattern_1_contour = pattern_1_loc.map((element, index, array) => {
    if (index == 0) {
      return 0;
    } else {
      return element - array[index - 1];
    }
  });

  const pattern_2_contour = pattern_2_loc.map((element, index, array) => {
    if (index == 0) {
      return 0;
    } else {
      return element - array[index - 1];
    }
  });

  // console.log(aquitanian_contour);
  // console.log(square_contour);

  // const result = needlemanWunsch(aquitanian_contour, square_contour);
  const result = needlemanWunsch_nc(pattern_1_contour, pattern_2_contour);
  // console.table(result);

  document.getElementById("cross-comparison-1").innerHTML = result[0].join(" ");
  document.getElementById("cross-comparison-2").innerHTML = result[1].join(" ");

  // Highlight the difference
  // Colour: having the same shade for the same melodic interval on both chants
  // Adding clarification for the user
  const gap_1 = result[2];
  const gap_2 = result[3];
  const yellow = 'rgba(255, 255, 0, 1)';
  const yellow_stroke = 'rgb(128,128,0)';

  gap_1.forEach((e, i, arr) => {
    pattern_1[e - 1 - 1].highlight('rgba(255, 0, 0, 0.3)', 'rgba(149, 48, 217, 0.6)');
    pattern_1[e - 1].highlight('rgba(255, 0, 0, 1)', 'rgba(149, 48, 217, 1)');
    pattern_1[e + 1 - 1].highlight('rgba(255, 0, 0, 0.3)', 'rgba(149, 48, 217, 0.6)');

    pattern_2[e - 1 - i - 1].highlight(yellow, yellow_stroke);
    pattern_2[e - i - 1].highlight(yellow, yellow_stroke);
  });
  gap_2.forEach((e, i, arr) => {
    pattern_2[e - 1 - 1].highlight('rgba(255, 0, 0, 0.3)', 'rgba(149, 48, 217, 0.6)');
    pattern_2[e - 1].highlight('rgba(255, 0, 0, 1)', 'rgba(149, 48, 217, 1)');
    pattern_2[e + 1 - 1].highlight('rgba(255, 0, 0, 0.3)', 'rgba(149, 48, 217, 0.6)');

    pattern_1[e - 1 - i - 1 + gap_1.length].highlight(yellow, yellow_stroke);
    pattern_1[e - 1 - i + gap_1.length].highlight(yellow, yellow_stroke);
  });
}

/**
 * Display mismatched pattern in the cross-comparison analysis
 */