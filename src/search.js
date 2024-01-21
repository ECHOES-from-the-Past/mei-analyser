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

function location_septenary_mapping(NeumeComponentPattern) {
  let pattern_location = [];
  if (NeumeComponentPattern[0] instanceof NeumeComponentAQ) {
    pattern_location = NeumeComponentPattern.map((e) => e.get_loc());
  } else if (NeumeComponentPattern[0] instanceof NeumeComponentSQ) {
    pattern_location = NeumeComponentPattern.map((e) => e.septenary());
  }
  return pattern_location;
}


/**
 * Using Needleman-Wunsch algorithm to analyse the difference between two different chants
 * @param {Array<NeumeComponentAQ | NeumeComponentSQ>} pattern_1 Neume Component array of pattern 1
 * @param {Array<NeumeComponentAQ | NeumeComponentSQ>} pattern_2 Neume Component array of pattern 2
 */
export function pattern_analysis(pattern_1, pattern_2, mode = "mismatch") {
  if (pattern_1.length == 0 || pattern_2.length == 0) {
    alert("Please upload both files before comparing them.");
    return;
  }

  let pattern_1_loc = location_septenary_mapping(pattern_1);
  let pattern_2_loc = location_septenary_mapping(pattern_2);

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

  const gap_symbol = '<span style=color:red>GAP</span>';
  const result = needlemanWunsch_nc(pattern_1_contour, pattern_2_contour, gap_symbol);

  let mismatch = [];
  for (let i = 0; i < result[0].length; i++) {
    if (result[0][i] != result[1][i] && result[0][i] != gap_symbol && result[1][i] != gap_symbol) {
      mismatch.push(i);
      result[0][i] = `<span style="color: blue">${result[0][i]}</span>`;
      result[1][i] = `<span style="color: blue">${result[1][i]}</span>`;
    }
  }

  document.getElementById("cross-comparison-1").innerHTML = result[0].join(" ");
  document.getElementById("cross-comparison-2").innerHTML = result[1].join(" ");


  // Highlight the gaps
  // Colour: having the same shade for the same melodic interval on both chants
  // Adding clarification for the user
  const gap_1 = result[2];
  const gap_2 = result[3];
  const yellow = 'rgba(255, 255, 0, 1)';
  const yellow_stroke = 'rgb(128,128,0)';
  const side_note = ['rgba(255, 0, 120, 0.3)', 'rgba(255, 0, 120, 0.5)']
  const gap_note = ['rgba(255, 0, 0, 0.7)', 'rgba(255, 0, 0, 1)']

  if (mode == "mismatch") {
    // Highlight the mismatched contours: note[mismatch_index] and note[mismatch_index - 1]
    for (let mismatch_index of mismatch) {
      // console.log(mismatch);
      // console.log(gap_1);
      // console.log(gap_2);

      let offset_1 = () => {
        let offset = 0;
        for (let i = 0; i < gap_1.length; i++) {
          if (mismatch_index > gap_1[i]) {
            offset++;
          }
        }
        return offset;
      }

      let offset_2 = () => {
        let offset = 0;
        for (let i = 0; i < gap_2.length; i++) {
          if (mismatch_index > gap_2[i]) {
            offset++;
          }
        }
        return offset;
      }

      pattern_1[mismatch_index - offset_1()].log();
      pattern_2[mismatch_index - offset_2()].log();

      pattern_1[mismatch_index - 1 - offset_1()].highlight('rgb(0,0,255)', 'rgb(0,0,255)');
      pattern_1[mismatch_index - offset_1()].highlight('rgb(0,0,255)', 'rgb(0,0,255)');
      pattern_2[mismatch_index - 1 - offset_2()].highlight('rgb(0,0,255)', 'rgb(0,0,255)');
      pattern_2[mismatch_index - offset_2()].highlight('rgb(0,0,255)', 'rgb(0,0,255)');
    }
  } else if (mode == "gap-1") {
    // Highlight the gaps
    // console.log(gap);
    console.log(gap_1);
    console.log(gap_2);
    for (let gap of gap_1) {

      let offset = (gap_index, gap_array) => {
        let offset = 0;
        for (let i = 0; i < gap_array.length; i++) {
          if (gap_index > gap_array[i]) {
            offset++;
          }
        }
        return offset;
      }
      pattern_1[gap - 2 - offset(gap, gap_1)].highlight(...side_note);
      pattern_1[gap - 1 - offset(gap, gap_1)].highlight(...gap_note);
      pattern_1[gap - offset(gap, gap_1)].highlight(...side_note);

      pattern_2[gap - offset(gap, gap_2)].log();
      pattern_2[gap - 2 - offset(gap, gap_2)].highlight(...side_note);
      pattern_2[gap - 1 - offset(gap, gap_2)].highlight(...side_note);
    }
  } else if (mode == "gap-2") {
    for (let gap of gap_2) {

      let offset = (gap_index, gap_array) => {
        let offset = 0;
        for (let i = 0; i < gap_array.length; i++) {
          if (gap_index > gap_array[i]) {
            offset++;
          }
        }
        return offset;
      }
      pattern_2[gap - 2 - offset(gap, gap_2)].highlight(...side_note);
      pattern_2[gap - 1 - offset(gap, gap_2)].highlight(...gap_note);
      pattern_2[gap - offset(gap, gap_2)].highlight(...side_note);

      pattern_1[gap - offset(gap, gap_1)].log();
      pattern_1[gap - 2 - offset(gap, gap_1)].highlight(...side_note);
      pattern_1[gap - 1 - offset(gap, gap_1)].highlight(...side_note);
    }

    // gap_1.forEach((e, i, arr) => {
    //   pattern_1[e - 1 - 1].highlight('rgba(255, 0, 0, 0.3)', 'rgba(149, 48, 217, 0.6)');
    //   pattern_1[e - 1].highlight('rgba(255, 0, 0, 1)', 'rgba(149, 48, 217, 1)');
    //   pattern_1[e + 1 - 1].highlight('rgba(255, 0, 0, 0.3)', 'rgba(149, 48, 217, 0.6)');

    //   pattern_2[e - 1 - i - 1].highlight(yellow, yellow_stroke);
    //   pattern_2[e - i - 1].highlight(yellow, yellow_stroke);
    // });
    // gap_2.forEach((e, i, arr) => {
    //   pattern_2[e - 1 - 1].highlight('rgba(255, 0, 0, 0.3)', 'rgba(149, 48, 217, 0.6)');
    //   pattern_2[e - 1].highlight('rgba(255, 0, 0, 1)', 'rgba(149, 48, 217, 1)');
    //   pattern_2[e + 1 - 1].highlight('rgba(255, 0, 0, 0.3)', 'rgba(149, 48, 217, 0.6)');

    //   pattern_1[e - 1 - i - 1 + gap_1.length].highlight(yellow, yellow_stroke);
    //   pattern_1[e - 1 - i + gap_1.length].highlight(yellow, yellow_stroke);
    // });
  }
}

/**
 * Display mismatched pattern in the cross-comparison analysis
 */