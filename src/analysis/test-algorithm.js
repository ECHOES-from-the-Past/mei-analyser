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
  const A = [2, 5, 7, 9, 3, 1, 2, 4];
  const B = [2, 3, 5, 7, 9, 3, 1, 2, 4];
  const match = 1, mismatch = -1, gap = -1;
  const M = matrix_sw(A, B, match, mismatch, gap);
  console.table(M);
}

function sw_test02() {
  const A = [2,    5, 7, 9, 3, 1, 2, 4];
  const B = [2, 3, 5, 7, 9, 3, 1, 2, 4];
  const match = 1, mismatch = -1, gap = -1;
  const M = matrix_sw(A, B, match, mismatch, gap);
  console.table(M);
  console.log(align_sw(M, A, B, match, mismatch, gap));
}

// function example_nc() {
//   const A1 = sessionStorage.getItem("mei-file-1");
//   const A2 = sessionStorage.getItem("mei-file-2");
//   const match = 1, mismatch = -1, gap = -2;

//   // Parse MEI file into an array of NeumeComponent
//   let aquitanian_content = parse_MEI_AQ(A1);
//   let square_content = parse_MEI_SQ(A2);

//   const aquitanian_contour = aquitanian_content.map((e) => e.get_loc()).map((element, index, array) => {
//     if (index == 0) {
//       return 0;
//     } else {
//       return element - array[index - 1];
//     }
//   });

//   const square_contour = square_content.map((e) => e.septenary()).map((element, index, array) => {
//     if (index == 0) {
//       return 0;
//     } else {
//       return element - array[index - 1];
//     }
//   });

//   // The matrix stays the same
//   const M = matrix(aquitanian_contour, square_contour, match, mismatch, gap);
//   console.table(M);

//   // align_nc must contain NeumeComponent, or at least xml:id
//   const [A1a, A2a, gap_1, gap_2] = align_nc(M, aquitanian_contour, square_contour, match, mismatch, gap);
//   console.log(gap_1.join(' '));
//   console.log(gap_2.join(' '));
//   gap_1.forEach((e) => aquitanian_content[e].highlight());
//   gap_2.forEach((e) => square_content[e].highlight());
// }

function main() {
  nw_test01();
  nw_test02();
  nw_test03();
  nw_test04();
  // sw_test01();
  // sw_test02();
  // example_nc();
}

main();