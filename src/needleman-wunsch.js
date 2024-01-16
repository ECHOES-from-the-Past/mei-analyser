/**
 * An implementation of Needleman-Wunsch algorithm
 */

import { NeumeComponent } from "./components";
import {
  parse_MEI_AQ,
  parse_MEI_SQ,
} from "./utils.js";

/**
 * Needleman-Wunsch algorithm - Step 1: Construct the matrix
 * @param {Array<Number>} A1 The first array of number - row
 * @param {Array<Number>} A2 The second array of number - column
 * @returns {number[][]}
 * Pseudocode: https://en.wikipedia.org/wiki/Needleman%E2%80%93Wunsch_algorithm#Advanced_presentation_of_algorithm
 */
function matrix(A1, A2, match = 1, mismatch = -1, gap = -2) {
  var m = A1.length;
  var n = A2.length;
  var M = new Array(m + 1);
  for (let i = 0; i <= m; i++) {
    M[i] = new Array(n + 1);
    M[i][0] = Number(i * gap);
  }
  for (let j = 0; j <= n; j++) {
    M[0][j] = Number(j * gap);
  }

  // Fill the matrix
  for(let i = 0; i < m; i++) {
    for(let j = 0; j < n; j++) {
      let score = A1[i] === A2[j] ? match : mismatch;
      let up = M[i][j + 1] + gap;
      let left = M[i + 1][j] + gap;
      let ul = M[i][j] + score;
      M[i + 1][j + 1] = Math.max(up, left, ul);
    }
  }
  return M;
}

/**
 * Needleman-Wunsch algorithm - Step 2: Alignment and backtracking
 * @param {Array<Array<Number>>} M The 2D matrix from `matrix()` function
 * @param {Array<Number>} A The first array of number
 * @param {Array<Number>} B The second array of number
 * @param {Number} match score for each match
 * @param {Number} mismatch score for each mismatch between two elements
 * @param {Number} gap score for each gap  
 * @returns 
 */
function align(M, A, B, match = 1, mismatch = -1, gap = -2) {
  var AlignmentA = [];
  var AlignmentB = [];

  let i = A.length;
  let j = B.length;

  A.unshift(0);
  B.unshift(0);
  
  const gap_symbol = '<span style=color:red>GAP</span>';

  while(i > 0 || j > 0) {
    // console.log(A[i], B[j]);
    let match_score = A[i] === B[j] ? match : mismatch;
    if(i > 0 && j > 0 && M[i][j] === M[i - 1][j - 1] + match_score) {
      AlignmentA.unshift(A[i]);
      AlignmentB.unshift(B[j]);
      i--;
      j--;
    }
    else if(i > 0 && M[i][j] === M[i - 1][j] + gap) {
      AlignmentA.unshift(A[i]);
      AlignmentB.unshift(gap_symbol);
      i--;
    }
    else if(j > 0 && M[i][j] === M[i][j - 1] + gap) {
      AlignmentA.unshift(gap_symbol);
      AlignmentB.unshift(B[j]);
      j--;
    }
  }
  // console.table(AlignmentA);
  return [AlignmentA, AlignmentB];
}

/**
 * Needleman-Wunsch algorithm, alignment of two arrays of NeumeComponent
 * 
 * @param {Array<Array<Number>>} M The 2D matrix from `matrix()` function
 * @param {Array<Number>} A_nc The first array of NeumeComponent
 * @param {Array<Number>} B_nc The second array of NeumeComponent
 * @param {Number} [match=1] score for each match
 * @param {Number} [mismatch=-1] score for each mismatch between two elements
 * @param {Number} [gap=-2] score for each gap  
 * @returns 4 arrays of numbers: [AlignmentA, AlignmentB, gap_index_A, gap_index_B]
 */
export function align_nc(M, A_nc, B_nc, match = 1, mismatch = -1, gap = -2) {
  let AlignmentA = [];
  let AlignmentB = [];

  let gap_index_A = [];
  let gap_index_B = [];

  let i = A_nc.length;
  let j = B_nc.length;

  A_nc.unshift(0);
  B_nc.unshift(0);
  
  const gap_symbol = '<span style=color:red>GAP</span>';

  while(i > 0 || j > 0) {
    // console.log(A[i], B[j]);
    let match_score = A_nc[i] === B_nc[j] ? match : mismatch;
    if(i > 0 && j > 0 && M[i][j] === M[i - 1][j - 1] + match_score) {
      AlignmentA.unshift(A_nc[i]);
      AlignmentB.unshift(B_nc[j]);
      i--;
      j--;
    }
    else if(i > 0 && M[i][j] === M[i - 1][j] + gap) {
      // Gap filler is on array A
      AlignmentA.unshift(A_nc[i]);
      gap_index_A.unshift(i);
      AlignmentB.unshift(gap_symbol);
      i--;
    }
    else if(j > 0 && M[i][j] === M[i][j - 1] + gap) {
      // Gap filler is on array B
      AlignmentA.unshift(gap_symbol);
      AlignmentB.unshift(B_nc[j]);
      gap_index_B.unshift(j);
      j--;
    }
  }
  // console.table(AlignmentA);
  return [AlignmentA, AlignmentB, gap_index_A, gap_index_B];
}

export function needlemanWunsch(A, B, match = 1, mismatch = -1, gap = -2) {
  const M = matrix(A, B, match, mismatch, gap);
  const [A1, A2] = align(M, A, B, match, mismatch, gap);
  return [A1, A2];
}

export function needlemanWunsch_nc(A_nc, B_nc, match = 1, mismatch = -1, gap = -2) {
  const M = matrix(A_nc, B_nc, match, mismatch, gap);
  const [A1, A2, g1, g2] = align_nc(M, A_nc, B_nc, match, mismatch, gap);
  return [A1, A2, g1, g2];
}

function example() {
  const A1 = [2, 5, 7, 9, 3, 1, 2, 4];
  const A2 = [2, 3, 5, 7, 9, 3, 1, 2, 4];
  const match = 1, mismatch = -1, gap = -2;
  const M = matrix(A1, A2, match, mismatch, gap);
  console.table(M);
  const [A1a, A2a] = align_nc(M, A1, A2, match, mismatch, gap);
  console.log(A1a.join(' '));
  console.log(A2a.join(' '));
}

function example_nc() {
  const A1 = sessionStorage.getItem("mei-file-1");
  const A2 = sessionStorage.getItem("mei-file-2");
  const match = 1, mismatch = -1, gap = -2;

  // Parse MEI file into an array of NeumeComponent
  let aquitanian_content = parse_MEI_AQ(A1);
  let square_content = parse_MEI_SQ(A2);

  const aquitanian_contour = aquitanian_content.map((e) => e.get_loc()).map((element, index, array) => {
    if (index == 0) {
      return 0;
    } else {
      return element - array[index - 1];
    }
  });

  const square_contour = square_content.map((e) => e.septenary()).map((element, index, array) => {
    if (index == 0) {
      return 0;
    } else {
      return element - array[index - 1];
    }
  });

  // The matrix stays the same
  const M = matrix(aquitanian_contour, square_contour, match, mismatch, gap);
  console.table(M);

  // align_nc must contain NeumeComponent, or at least xml:id
  const [A1a, A2a, gap_1, gap_2] = align_nc(M, aquitanian_contour, square_contour, match, mismatch, gap);
  console.log(gap_1.join(' '));
  console.log(gap_2.join(' '));
  gap_1.forEach((e) => aquitanian_content[e].highlight());
  gap_2.forEach((e) => square_content[e].highlight());
}
// example();
// example_nc();