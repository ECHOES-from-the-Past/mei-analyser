/*---- An implementation of the Needleman-Wunsch algorithm ----*/

/**
 * Needleman-Wunsch algorithm - Step 1: Construct the matrix
 * @param {Array<Number>} A The first array of number - row
 * @param {Array<Number>} B The second array of number - column
 * @returns {number[][]} the 2D matrix with dimensions (A.length + 1) x (B.length + 1)
 * Pseudocode: https://en.wikipedia.org/wiki/Needleman%E2%80%93Wunsch_algorithm#Advanced_presentation_of_algorithm
 */
export function matrix_nw(A, B, match = 1, mismatch = -1, gap = -2) {
  var rowLength = A.length + 1;
  var colLength = B.length + 1;
  var M = new Array(colLength + 1);

  // Fill each row with an empty array
  for (let i = 0; i < colLength; i++) {
    M[i] = new Array(rowLength + 1);
    // Also fill the first column
    M[i][0] = Number(i * gap);
  }

  // Fill the first row
  for (let j = 0; j < rowLength; j++) {
    M[0][j] = Number(j * gap);
  }

  // Fill the remaining of matrix
  // Matrix coordinates are [column][row] or [b_col][a_row]
  // M[b_col][a_row] = "DIAG";
  // M[b_col + 1][a_row] = "SIDE";
  // M[b_col][a_row + 1] = "UP";
  // M[b_col + 1][a_row + 1] = "TARGET CELL";
  for (let a_row = 0; a_row < rowLength - 1; a_row++) {
    for (let b_col = 0; b_col < colLength - 1; b_col++) {
      let match_score = B[b_col] === A[a_row] ? match : mismatch;

      let diagCell = M[b_col][a_row] + match_score;
      let leftCell = M[b_col + 1][a_row] + gap;
      let upCell = M[b_col][a_row + 1] + gap;
      M[b_col + 1][a_row + 1] = Math.max(diagCell, leftCell, upCell);
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
 * @returns alignment of two arrays in order of [AlignmentA, AlignmentB]
 */
export function align(M, A, B, match = 1, mismatch = -1, gap = -2) {
  let alignmentPath = [];
  let AlignmentA = [];
  let AlignmentB = [];

  let a_row = A.length;
  let b_col = B.length;
  console.debug(`List A: ${A}`);
  console.debug(`List B: ${B}`);

  const gap_symbol = 'GAP';

  // Reminder: Matrix coordinates are [column][row] or [b_col][a_row]
  while (b_col > 0 || a_row > 0) {
    const currentCell = M[b_col][a_row];
    alignmentPath.push(currentCell);

    const upLeft = M[b_col][a_row];
    const up = M[b_col - 1][a_row];
    const left = M[b_col][a_row - 1];
    const max = Math.max(upLeft, up, left);
    if (max == upLeft) {
      AlignmentA.unshift(A[a_row - 1]);
      AlignmentB.unshift(B[b_col - 1]);
      a_row--;
      b_col--;
    } else if (max == up) {
      AlignmentB.unshift(B[b_col - 1]);
      AlignmentA.unshift(gap_symbol);
      b_col--;
    } else if (max == left) {
      AlignmentA.unshift(A[a_row - 1]);
      AlignmentB.unshift(gap_symbol);
      a_row--;
    }
    // console.debug(`A: ${AlignmentA}`);
    // console.debug(`B: ${AlignmentB}`);
  }
  // console.table(AlignmentA);
  console.debug(alignmentPath);
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
function align_nc(M, A_nc, B_nc, gap_symbol = '<span style=color:red>GAP</span>', match = 1, mismatch = -1, gap = -2) {
  let AlignmentA = [];
  let AlignmentB = [];
  let gap_index_A = [];
  let gap_index_B = [];

  let a_row = A_nc.length;
  let b_col = B_nc.length;

  // Reminder: Matrix coordinates are [column][row] or [b_col][a_row]
  while (b_col > 0 || a_row > 0) {
    // const currentCell = M[b_col][a_row];

    const upLeft = M[b_col][a_row];
    const up = M[b_col - 1][a_row];
    const left = M[b_col][a_row - 1];
    const max = Math.max(upLeft, up, left);
    if (max == upLeft) {
      AlignmentA.unshift(A_nc[a_row - 1]);
      AlignmentB.unshift(B_nc[b_col - 1]);
      a_row--;
      b_col--;
    } else if (max == up) {
      AlignmentB.unshift(B_nc[b_col - 1]);
      AlignmentA.unshift(gap_symbol);
      b_col--;
    } else if (max == left) {
      AlignmentA.unshift(A_nc[a_row - 1]);
      AlignmentB.unshift(gap_symbol);
      a_row--;
    }
  }


  for (let i = 0; i < AlignmentA.length; i++) {
    if (AlignmentA[i] == gap_symbol) {
      gap_index_A.push(i);
    }
  }
  for (let i = 0; i < AlignmentB.length; i++) {
    if (AlignmentB[i] == gap_symbol) {
      gap_index_B.push(i);
    }
  }
  // console.table(AlignmentA);
  return [AlignmentA, AlignmentB, gap_index_A, gap_index_B];
}

export function needlemanWunsch(A, B, match = 1, mismatch = -1, gap = -2) {
  const M = matrix_nw(A, B, match, mismatch, gap);
  const [A1, A2] = align(M, A, B, match, mismatch, gap);
  return [A1, A2];
}

export function needlemanWunsch_nc(A_nc, B_nc, gap_symbol = '<span style=color:red>GAP</span>', match = 1, mismatch = -1, gap = -2) {
  const M = matrix_nw(A_nc, B_nc, match, mismatch, gap);
  const [A1, A2, g1, g2] = align_nc(M, A_nc, B_nc, gap_symbol, match, mismatch, gap);
  return [A1, A2, g1, g2];
}