/*---- An implementation of the Needleman-Wunsch algorithm ----*/

/**
 * Needleman-Wunsch algorithm - Step 1: Construct the matrix
 * Pseudocode: https://en.wikipedia.org/wiki/Needleman%E2%80%93Wunsch_algorithm#Advanced_presentation_of_algorithm
 * 
 * @param {Array<Number>} A The first array of number - row
 * @param {Array<Number>} B The second array of number - column
 * @param {Number} [match=1] score for each match
 * @param {Number} [mismatch=-1] score for each mismatch between two elements
 * @param {Number} [gap=-2] score for each gap  
 * @returns {number[][]} the 2D matrix with dimensions (A.length + 1) x (B.length + 1)
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

  // Fill the remaining of matrix. Matrix coordinates are [column][row] or [b_col][a_row]
  // M[b_col][a_row] = "DIAG";
  // M[b_col + 1][a_row] = "SIDE";
  // M[b_col][a_row + 1] = "UP";
  // M[b_col + 1][a_row + 1] = "TARGET CELL";
  for (let a_row = 0; a_row < rowLength - 1; a_row++) {
    for (let b_col = 0; b_col < colLength - 1; b_col++) {
      // Score from the diagonal cell
      let match_score = B[b_col] === A[a_row] ? match : mismatch;
      let diagCell = M[b_col][a_row] + match_score;

      // Score from the left cell
      let leftCell = M[b_col + 1][a_row] + gap;

      // Score from the cell above
      let upCell = M[b_col][a_row + 1] + gap;

      // The target cell is the maximum of the three
      M[b_col + 1][a_row + 1] = Math.max(diagCell, leftCell, upCell);
    }
  }
  return M;
}

/**
 * Needleman-Wunsch algorithm - Step 2: Alignment and backtracking
 * @param {Number[][]} M The 2D matrix from `matrix()` function
 * @param {Number[]} A The first array of number
 * @param {Number[]} B The second array of number
 * @param {String} gapSymbol The symbol for gap(s)
 * @returns alignment of two arrays in order of [AlignmentA, AlignmentB]
 */
export function align_nw(M, A, B, gapSymbol = 'GAP') {
  let alignmentPath = [];
  let AlignmentA = [];
  let AlignmentB = [];

  let a_row = A.length;
  let b_col = B.length;
  console.debug(`List A: ${A}`);
  console.debug(`List B: ${B}`);

  // Reminder: Matrix coordinates are [column][row] or [b_col][a_row]
  while (b_col > 0 || a_row > 0) {
    const currentCell = M[b_col][a_row];
    console.debug(`Current cell: ${currentCell}`)
    alignmentPath.push(currentCell);

    if (b_col == 0) {
      AlignmentA.unshift(A[a_row - 1]);
      AlignmentB.unshift(gapSymbol);
      a_row--;
      continue;
    }

    if (a_row == 0) {
      AlignmentA.unshift(gapSymbol);
      AlignmentB.unshift(B[b_col - 1]);
      b_col--;
      continue;
    }

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
      AlignmentA.unshift(gapSymbol);
      b_col--;
    } else if (max == left) {
      AlignmentA.unshift(A[a_row - 1]);
      AlignmentB.unshift(gapSymbol);
      a_row--;
    }
  }
  console.debug(alignmentPath);
  return [AlignmentA, AlignmentB];
}

export function needlemanWunsch(A, B, match = 1, mismatch = -1, gap = -2) {
  const M = matrix_nw(A, B, match, mismatch, gap);
  const [A1, A2] = align_nw(M, A, B);
  return [A1, A2];
}

export function needlemanWunsch_nc(arrayA, arrayB, gapSymbol = '<span style=color:red>GAP</span>', match = 1, mismatch = -1, gap = -2) {
  const matrixAB = matrix_nw(arrayA, arrayB, match, mismatch, gap);
  const [alignmentA, alignmnentB] = align_nw(matrixAB, arrayA, arrayB, gapSymbol);
  let gapsOfA = [];
  let gapsOfB = [];

  for (let i = 0; i < alignmentA.length; i++) {
    if (alignmentA[i] == gapSymbol) {
      gapsOfA.push(i);
    }
  }
  for (let i = 0; i < alignmnentB.length; i++) {
    if (alignmnentB[i] == gapSymbol) {
      gapsOfB.push(i);
    }
  }
  return [alignmentA, alignmnentB, gapsOfA, gapsOfB];
}