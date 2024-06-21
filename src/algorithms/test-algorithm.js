import { matrix_nw, align_nw, needlemanWunsch, needlemanWunsch_nc } from "./needleman-wunsch.js";
import { matrix_sw, align_sw, smithWaterman } from './smith-waterman.js';

/**
 * Testing matrix construction of Needleman-Wunsch algorithm
 */
function nw_test01() {
  console.log("Testing matrix construction of Needleman-Wunsch algorithm");
  const A = [2,    5, 7, 9, 3, 1, 2, 4];
  const B = [2, 3, 5, 7, 9, 3, 1, 2, 4];
  const match = 1, mismatch = -1, gap = -2;
  const M = matrix_nw(A, B, match, mismatch, gap);
  console.table(M);
  console.log("END TEST NW_TEST01()\n");
}

/**
 * Testing alignment of Needleman-Wunsch algorithm
  */
function nw_test02() {
  const A = [2,    5, 7, 9, 3, 1, 2, 4];
  const B = [2, 3, 5, 7, 9, 3, 1, 2, 4];
  const match = 1, mismatch = -1, gap = -2;
  const gapSymbol = '-';
  const M = matrix_nw(A, B, match, mismatch, gap);
  console.table(M);
  console.log(align_nw(M, A, B, gapSymbol));
}

function nw_test03() {
  const A = [1, 2, 4, 5, 1, 3, 2, 6, 7, 2];
  const B = [2, 5, 1, 4, 2, 6, 2, 1, 6, 3];
  const match = 1, mismatch = -1, gap = -2;
  const gapSymbol = '-';
  const M = matrix_nw(A, B, match, mismatch, gap);
  console.table(M);
  console.log(align_nw(M, A, B, gapSymbol));
}

function nw_test04() {
  console.log("Test Needleman-Wunsch 04")
  const A = [1, 1, 2, 4, 5, 1, 3, 2, 6, 7, 2];
  const B = [2, 4, 5, 1, 4, 2, 6, 2, 1, 6, 3];
  const match = 1, mismatch = -1, gap = -2;
  const gapSymbol = '-';
  const M = matrix_nw(A, B, match, mismatch, gap);
  console.table(M);
  console.log(align_nw(M, A, B, gapSymbol));
}

function sw_test01() {
  const A = [2,    5,    9, 3, 1, 2, 4];
  const B = [2, 3, 5, 7, 9, 3, 1, 2, 4];
  const match = 1, mismatch = -1, gap = -1;
  const M = matrix_sw(A, B, match, mismatch, gap);
  console.table(M);
  console.log(align_sw(M, A, B, match, mismatch, gap));
}

function sw_test02() {
  const A = [2, 3, 5, 7, 9, 3, 1, 2, 4]; // row
  const B = [2, 3, 5, 2, 4]; // column
  const match = 1, mismatch = -1, gap = -1;
  const M = matrix_sw(A, B, match, mismatch, gap);
  console.table(M);
  console.log(align_sw(M, A, B, match, mismatch, gap));
}

function sw_test03() {
  const A = [2, 3, 5, 7, 9, 3, 1, 2, 4]; // row, the sequence
  const B = [5, 7, 9]; // column, search query
  const match = 1, mismatch = -1, gap = -1;
  const M = matrix_sw(A, B, match, mismatch, gap);
  console.table(M);
  console.log(align_sw(M, A, B, match, mismatch, gap));
}

function nw_test05() {
  const A = [2, 3, 5, 7, 9, 3, 1, 2, 4];
  const B = [5, 7, 9, 2, 5, 5, 7, 9];
  const match = 1, mismatch = -1, gap = -2;
  const gapSymbol = '-';
  const M = matrix_nw(A, B, match, mismatch, gap);
  console.table(M);
  console.log(align_nw(M, A, B, gapSymbol));
}

function sw_test06() {
  const A = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 3, 5, 2, 1, 5, 3, 4, 5, 6, 7, 8, 9];
  const B = [7, 8, 9]; // search query
  const match = 1, mismatch = -1, gap = -1;

  for(let i = 0; i < A.length - B.length; i++) {
    let A_toCompare = A.slice(i, i + B.length);
    console.log("A_toCompare: ", A_toCompare)
    const M = matrix_sw(A_toCompare, B, match, mismatch, gap);
    console.table(M);
    console.log(align_sw(M, A, B, match, mismatch, gap));
  }
}

function main() {
  // nw_test01();
  // nw_test02();
  // nw_test03();
  // nw_test04();
  // sw_test01();
  // sw_test02();
  // sw_test03();
  // nw_test05();

  sw_test06();
}

main();