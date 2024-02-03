import { needlemanWunsch, needlemanWunsch_nc } from "./needleman-wunsch";
import { } from './smith-waterman';
/**
 * An implementation of Needleman-Wunsch algorithm
 */
import {
    parse_MEI_AQ,
    parse_MEI_SQ,
  } from "../utility/utils.js";


/**
 * Example of Needleman-Wunsch algorithm
 */
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
  example();
  // example_nc();

function visualise(A, B, ABMatrix) {
    let visualMatrix = ABMatrix;
    let col = A.map((e, i) => `A${i}=${e}`);
    let row = B.map((e, i) => `B${i}=${e}`);
    visualMatrix.unshift([...row]);
    visualMatrix = visualMatrix.map((e, i) => [col[i - 1], ...e]);
    console.table(visualMatrix);
}

function test() {
    let A = [1, 2, 3, 4, 5];
    let B = [1, 2, 3, 5];
    visualise(A, B, matrix(A, B));
}

test();