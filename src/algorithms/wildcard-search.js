/**
 * Implemented by Gemini (Google's AI)
 * 
 * @param {string} aString 
 * @param {string} wQuery wildcard query string
 * @returns {boolean} if a match is found
 */
function wildcardSearchString(aString, wQuery) {
    const m = wQuery.length;
    const n = aString.length;

    // Create a dynamic programming table
    const dp = new Array(n + 1).fill(false).map(() => new Array(m + 1).fill(false));

    // Base cases
    dp[0][0] = true;

    // Fill the table
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (wQuery[j - 1] === '.') {
                dp[i][j] = dp[i - 1][j - 1];
            } else if (wQuery[j - 1] === '?') {
                dp[i][j] = dp[i - 1][j - 1] || dp[i - 1][j];
            } else if (wQuery[j - 1] === '*') {
                dp[i][j] = dp[i - 1][j] || dp[i][j - 1];
            } else if (wQuery[j - 1] === '@') {
                // Check if the character before the @ is repeated
                const repeatedChar = aString[i - 2];
                let foundRepeated = false;
                for (let k = i - 3; k >= 0; k--) {
                    if (aString[k] !== repeatedChar) {
                        break;
                    }
                    foundRepeated = true;
                }
                dp[i][j] = foundRepeated && dp[i - 2][j - 1];
            } else {
                dp[i][j] = dp[i - 1][j - 1] && (aString[i - 1] === wQuery[j - 1]);
            }
        }
    }
    console.table(dp);
    return dp[n][m];
}

function testStringImplementation() {
    const aString = "abcbdabdf";
    const wQuery = "abcb";
    const test1 = wildcardSearchString(aString, wQuery);
    console.log(test1);
}

testStringImplementation()