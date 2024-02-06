import { matrix, align, needlemanWunsch, needlemanWunsch_nc } from "./needleman-wunsch.js";
import { } from './smith-waterman.js';

/**
 * Example of Needleman-Wunsch algorithm
 */
function example() {
  const A = [2, 5, 7, 9, 3, 1, 2, 4];
  const B = [2, 3, 5, 7, 9, 3, 1, 2, 4];
  const match = 1, mismatch = -1, gap = -2;
  const M = matrix(A, B, match, mismatch, gap);
  console.table(M);
  const [A1a, A2a] = align(M, A, B, match, mismatch, gap);
  console.log(A1a.join(' '));
  console.log(A2a.join(' '));
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
  example();
  // example_nc();
}

main();