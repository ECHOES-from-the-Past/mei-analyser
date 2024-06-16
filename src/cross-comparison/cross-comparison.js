import { NeumeComponentAQ, NeumeComponentSQ } from "../database/components.js";
import { needlemanWunsch_nc } from "./needleman-wunsch.js";


function location_septenary_mapping(NeumeComponentPattern) {
  let pattern_location = [];
  if (NeumeComponentPattern[0] instanceof NeumeComponentAQ) {
    pattern_location = NeumeComponentPattern.map((e) => e.getLoc());
  } else if (NeumeComponentPattern[0] instanceof NeumeComponentSQ) {
    pattern_location = NeumeComponentPattern.map((e) => e.septenary());
  }
  return pattern_location;
}

function mapLocToContour(locationPattern) {
  let contourPattern = locationPattern.map((element, index, array) => {
    if (index < array.length - 1) {
      return array[index + 1] - array[index];
    }
  });

  return contourPattern;
}

function gapOffset(currentIndex, gapArray) {
  let offset = 0;
  for (let i = 0; i < gapArray.length; i++) {
    if (currentIndex > gapArray[i]) {
      offset++;
    }
  }
  return offset;
}

function highlightMismatches() {

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
  // Define the scores for the Needleman-Wunsch algorithm
  const MATCH = 10;
  const MISMATCH = -1;
  const GAP = -2;
  const GAP_SYMBOL = '<span style=color:red>GAP</span>';

  let pattern_1_loc = location_septenary_mapping(pattern_1);
  let pattern_2_loc = location_septenary_mapping(pattern_2);

  /**
   * Constructing the contour matrix based on Aquitanian's `@loc` and Square's `septenary` value
   */
  const pattern_1_contour = mapLocToContour(pattern_1_loc);
  const pattern_2_contour = mapLocToContour(pattern_2_loc);

  const result = needlemanWunsch_nc(pattern_1_contour, pattern_2_contour, GAP_SYMBOL, MATCH, MISMATCH, GAP);

  let mismatch = [];
  for (let i = 0; i < result[0].length; i++) {
    if (result[0][i] != result[1][i] && result[0][i] != GAP_SYMBOL && result[1][i] != GAP_SYMBOL) {
      mismatch.push(i);
      result[0][i] = `<span style="color: blue">${result[0][i]}</span>`;
      result[1][i] = `<span style="color: blue">${result[1][i]}</span>`;
    }
  }

  document.getElementById("cross-comparison-1").innerHTML = "LEFT : " + result[0].join(" ");
  document.getElementById("cross-comparison-2").innerHTML = "RIGHT: " + result[1].join(" ");

  const gapsOfLeft = result[2];
  const gapsOfRight = result[3];
  const side_note = ['var(--gap-side-note-fill)', 'var(--gap-side-note-stroke)']
  const filler_note = ['var(--gap-filler-fill)', 'var(--gap-filler-stroke)']

  const mismatch_note = ['var(--mismatch-fill)', 'var(--mismatch-stroke)'];
  const mismatch_box = ['var(--mismatch-fill-box)', 'var(--mismatch-stroke-box)'];

  const highlightMismatch = () => {
    // Highlight the mismatched contours
    for (let mismatch_index of mismatch) {
      let offsetP1 = gapOffset(mismatch_index, gapsOfLeft);
      let offsetP2 = gapOffset(mismatch_index, gapsOfRight);

      pattern_1[mismatch_index - offsetP1].highlight(...mismatch_note);
      pattern_1[mismatch_index + 1 - offsetP1].highlight(...mismatch_note);
      pattern_2[mismatch_index - offsetP2].highlight(...mismatch_note);
      pattern_2[mismatch_index + 1 - offsetP2].highlight(...mismatch_note);
    }
  }

  const spotlightMismatch = () => {
    // Spotlight the mismatched contours by putting a box around the notes
    for (let mismatch_index of mismatch) {
      let offsetP1 = gapOffset(mismatch_index, gapsOfLeft);
      let offsetP2 = gapOffset(mismatch_index, gapsOfRight);

      pattern_1[mismatch_index - offsetP1].spotlight(...mismatch_box);
      pattern_1[mismatch_index + 1 - offsetP1].spotlight(...mismatch_box);
      pattern_2[mismatch_index - offsetP2].spotlight(...mismatch_box);
      pattern_2[mismatch_index + 1 - offsetP2].spotlight(...mismatch_box);
    }
  }

  // NOTE: issue occurs when gap is at index 0 or last index
  const highlightRightFillers = () => {
    // Highlight the gap fillers on the right chant (pattern_2)
    for (let gap of gapsOfLeft) {
      let offsetP1 = gapOffset(gap, gapsOfLeft);
      let offsetP2 = gapOffset(gap, gapsOfRight);

      pattern_2[gap - offsetP2 - 1].highlight(...side_note);
      pattern_2[gap - offsetP2].highlight(...filler_note);
      pattern_2[gap - offsetP2 + 1].highlight(...filler_note);
      pattern_2[gap - offsetP2 + 2].highlight(...side_note);

      pattern_1[gap - offsetP1 - 1].highlight(...side_note);
      pattern_1[gap - offsetP1 + 0].highlight(...side_note);
      pattern_1[gap - offsetP1 + 1].highlight(...side_note);
    }
  }

  const highlightLeftFillers = () => {
    // Highlight the gap fillers on the left chant (pattern_1)
    for (let gap of gapsOfRight) {
      let offsetP1 = gapOffset(gap, gapsOfLeft);
      let offsetP2 = gapOffset(gap, gapsOfRight);

      pattern_1[gap - offsetP1 - 1].highlight(...side_note);
      pattern_1[gap - offsetP1 - 0].highlight(...filler_note);
      pattern_1[gap - offsetP1 + 1].highlight(...filler_note);
      pattern_1[gap - offsetP1 + 2].highlight(...side_note);

      pattern_2[gap - offsetP2 - 1].highlight(...side_note);
      pattern_2[gap - offsetP2 - 0].highlight(...side_note);
      pattern_2[gap - offsetP2 + 1].highlight(...side_note);
    }
  }

  if (mode.includes("mismatch")) {
    if (mode.includes("gaps")) {
      spotlightMismatch();
    } else {
      highlightMismatch();
    }
  }
  if (mode.includes("right")) {
    highlightRightFillers();
  } else if (mode.includes("left")) {
    highlightLeftFillers();
  }
}

/**
 * ----------------------- ANALYSIS -----------------------
 * Event listener for the "Analyse" button for cross-comparison functionality
 */
// document.getElementById('cross-comparison-btn').addEventListener("click", () => {
//   clearHighlights();
//   const leftFileContent = sessionStorage.getItem("mei-content-1");
//   const leftChantFilePath = sessionStorage.getItem("mei-file-path-1");
//   const leftChant = new Chant(leftFileContent, leftChantFilePath);

//   const rightChantFilePath = sessionStorage.getItem("mei-file-path-2");
//   const rightFileContent = sessionStorage.getItem("mei-content-2");
//   const rightChant = new Chant(rightFileContent, rightChantFilePath);

//   const leftChantNCList = leftChant.getNeumeComponents();
//   const rightChantNCList = rightChant.getNeumeComponents();

//   const analysis_mode = document.querySelector('input[name="analysis-mode"]:checked').value;
//   pattern_analysis(leftChantNCList, rightChantNCList, analysis_mode);

//   localStorage.setItem("analysis-mode", analysis_mode);
// });
