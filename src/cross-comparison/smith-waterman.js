// An implementation of Smith-Waterman algorithm for local sequence alignment

/**
 * Construct the matrix for the Smith-Waterman algorithm
 * @param {Array<Number>} A 
 * @param {Array<Number>} B 
 */
export function matrix_sw(A, B, match = 1, mismatch = -1, gap = -1) {
    let matrix = [];
    for (let i = 0; i < B.length; i++) {
        matrix[i] = [0];
    }
    for (let j = 0; j < A.length; j++) {
        matrix[0][j] = 0;
    }

    for (let i = 1; i < B.length; i++) {
        for (let j = 1; j < A.length; j++) {
            let matchScore = matrix[i - 1][j - 1] + (A[i] === B[j] ? match : mismatch);
            let deleteA = matrix[i - 1][j] - 1;
            let deleteB = matrix[i][j - 1] - 1;
            matrix[i][j] = Math.max(matchScore, deleteA, deleteB, 0);
        }
    }
    return matrix;
}

export function align_sw(M, A, B) {
    var AlignmentA = [];
    var AlignmentB = [];

    const gap_symbol = 'GAP';

    let imax = 0, jmax = 0;
    let max = 0;
    for (let i = 0; i < M.length; i++) {
        for (let j = 0; j < M[i].length; j++) {
            if (M[i][j] > max) {
                max = M[i][j];
                imax = i;
                jmax = j;
            }
        }
    }

    console.log("imax: ", imax, "jmax: ", jmax, "max: ", max)

    let i = imax, j = jmax;
    while (i > 1 || j > 1) {
        const up = M[i - 1][j];
        const left = M[i][j - 1];
        const ul = M[i - 1][j - 1];

        if (ul == Math.max(up, left, ul)) {
            AlignmentA.unshift(A[i]);
            AlignmentB.unshift(B[j]);
            i--;
            j--;
        } else if (up == Math.max(up, left, ul)) {
            AlignmentA.unshift(A[i]);
            AlignmentB.unshift(gap_symbol);
            i--;
        }
        else if (left == Math.max(up, left, ul)) {
            AlignmentA.unshift(gap_symbol);
            AlignmentB.unshift(B[j]);
            j--;
        }
    }
    return [AlignmentA, AlignmentB];
}

export function smithWaterman(A, B, match = 1, mismatch = -1, gap = -1) {
    const M = matrix_sw(A, B, match, mismatch, gap);
    const [A1, A2] = align_sw(M, A, B, match, mismatch, gap);
    return [A1, A2];
}