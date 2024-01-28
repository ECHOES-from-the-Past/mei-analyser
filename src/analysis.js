import { NeumeComponentAQ, NeumeComponentSQ } from "./components.js";
import { needlemanWunsch_nc } from "./needleman-wunsch.js";


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
  const result = needlemanWunsch_nc(pattern_1_contour, pattern_2_contour, gap_symbol, 10, -10, -20);

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
    // !! @martha-thomae said highlight the mismatch notes only
    // Highlight the mismatched contours: note[mismatch_index] and note[mismatch_index - 1]
    for (let mismatch_index of mismatch) {
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

      // pattern_1[mismatch_index - 1 - offset_1()].highlight('rgb(0,0,255)', 'rgb(0,0,255)');
      pattern_1[mismatch_index - offset_1()].highlight('rgb(0,0,255)', 'rgb(0,0,255)');
      // pattern_2[mismatch_index - 1 - offset_2()].highlight('rgb(0,0,255)', 'rgb(0,0,255)');
      pattern_2[mismatch_index - offset_2()].highlight('rgb(0,0,255)', 'rgb(0,0,255)');
    }
  } else if (mode == "gap-1") {
    // Highlight the gaps
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
  }
}