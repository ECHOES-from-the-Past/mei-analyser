const UP = 1;
const LEFT = 2;
const UL = 4;

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


function align(M, A, B, match = 1, mismatch = -1, gap = -2) {
  var AlignmentA = [];
  var AlignmentB = [];

  let i = A.length;
  let j = B.length;

  A.unshift(0);
  B.unshift(0);
  
  const gap_symbol = '<span style=color:red>GAP</span>';

  while(i > 0 || j > 0) {
    console.log(A[i], B[j]);
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

export function needlemanWunch(A, B, match = 1, mismatch = -1, gap = -2) {
  const M = matrix(A, B, match, mismatch, gap);
  const [A1, A2] = align(M, A, B, match, mismatch, gap);
  return [A1, A2];
}

function main() {
  const A1 = [2, 5, 7, 9, 3, 1, 2, 4];
  const A2 = [2, 3, 5, 7, 9, 3, 1, 2, 4];
  const match = 1, mismatch = -1, gap = -2;
  const M = matrix(A1, A2, match, mismatch, gap);
  console.table(M);
  const [A1a, A2a] = align(M, A1, A2, match, mismatch, gap);
  console.log(A1a.join(' '));
  console.log(A2a.join(' '));
}

// main();
