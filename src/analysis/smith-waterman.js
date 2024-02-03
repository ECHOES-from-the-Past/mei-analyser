// An implementation of Smith-Waterman algorithm for local sequence alignment

/**
 * 
 * @param {Array<Number>} A 
 * @param {Array<Number>} B 
 */
export function matrix(A, B, match = 1, mismatch = -1, gap = -1) {
    let matrix = [];
    for (let i = 0; i < A.length; i++) {
        matrix[i] = [0];
    }
    for (let j = 0; j < B.length; j++) {
        matrix[0][j] = 0;
    }

    for (let i = 1; i < A.length; i++) {
        for (let j = 1; j < B.length; j++) {
            let matchScore = matrix[i - 1][j - 1] + (A[i] === B[j] ? match : mismatch);
            let deleteA = matrix[i - 1][j] - 1;
            let deleteB = matrix[i][j - 1] - 1;
            matrix[i][j] = Math.max(matchScore, deleteA, deleteB, 0);
        }
    }
    return matrix;
}