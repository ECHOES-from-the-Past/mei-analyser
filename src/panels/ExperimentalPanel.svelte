<script>
    import Button from "../components/Button.svelte";
    import { onMount } from "svelte";
    import ResultTable from "../components/search/ResultTable.svelte";
    import WildcardSearch from "../components/search/WildcardSearch.svelte";
    import Section from "../components/Section.svelte";
    import { env } from "../utility/utils";
    import { getNeumeComponentList } from "../utility/components";
    import { filterByMusicScript } from "../functions/search";

    export let hidden = false;
    let experimentalSearchResult;
    let allPatternsFound;

    let wildcard;

    /**
     * Possible entries in wildcardSearchList:
     * - [x] A dot `.` to search for one arbitrary pitch
     * - [ ] A question mark `?` to search for an optional note. E.g.:
     *   - "A F? B" searches for "A F B" and "A B"
     *   - "A .? B", or "A ?. B" search for "A B", "A D B", etc.
     * - [ ] An asterisk `*` to search for an arbritrary number of notes
     * @param {Chant} chant
     * @param {string[]} wildcardSearchList
     */
    function processWildcardSearch(chant, wildcardSearchList) {
        const ncArray = getNeumeComponentList(chant.syllables);
        // let wQuery = wildcardSearchList;

        // /**
        //  * @type {NeumeComponent[]}
        //  */
        // let aString = ncArray;

        // let n = ncArray.length,
        //     m = wildcardSearchList.length;
        // let dp = new Array(n + 1)
        //     .fill(false)
        //     .map(() => new Array(m + 1).fill(false));
        // let patterns = [];

        // dp[0][0] = true;
        // if (chant.notationType == "aquitanian") {
        //     return;
        // }
        // for (let i = 1; i <= n; i++) {
        //     for (let j = 1; j <= m; j++) {
        //         console.log(wQuery[j], aString[i].pitch);
        //         if (wQuery[j - 1] === ".") {
        //             dp[i][j] = dp[i - 1][j - 1];
        //         } else if (wQuery[j - 1] === "?") {
        //             dp[i][j] = dp[i - 1][j - 1] || dp[i - 1][j];
        //         } else if (wQuery[j - 1] === "*") {
        //             dp[i][j] = dp[i - 1][j] || dp[i][j - 1];
        //         } else if (wQuery[j - 1] === "@") {
        //             // Check if the character before the @ is repeated
        //             const repeatedChar = aString[i - 2].pitch;
        //             let foundRepeated = false;
        //             for (let k = i - 3; k >= 0; k--) {
        //                 if (aString[k].pitch !== repeatedChar) {
        //                     break;
        //                 }
        //                 foundRepeated = true;
        //             }
        //             dp[i][j] = foundRepeated && dp[i - 2][j - 1];
        //         } else {
        //             dp[i][j] =
        //                 dp[i - 1][j - 1] &&
        //                 aString[i - 1].pitch === wQuery[j - 1];
        //         }
        //     }
        // }

        // if (dp[n][m]) {
        //     console.table(dp);
        // }

        // Match found: dp[n][m];

        // OLD CODE
        let patterns = [];

        for (let i = 0; i < ncArray.length - wildcardSearchList.length; i++) {
            let patternFound = [];

            for (let j = 0; j < wildcardSearchList.length; j++) {
                // processing the wildcard search
                if (
                    wildcardSearchList[j] == "." ||
                    ncArray[i + j].pitch == wildcardSearchList[j].toLowerCase()
                ) {
                    patternFound.push(ncArray[i + j]);
                } else {
                    patternFound = [];
                    break;
                }
            }

            if (patternFound.length > 0) {
                patterns.push(patternFound);
            }
        }
        return patterns;
    }

    function filterByWildcardSearch(chantList, wildcardSearchList) {
        // If search pattern is empty, return the original chant list regardless of the search mode
        if (!wildcardSearchList) {
            return chantList;
        }

        let resultChantList = [],
            returnPatterns = [];

        chantList.forEach((chant) => {
            let pattern = processWildcardSearch(chant, wildcardSearchList);
            if (pattern.length > 0) {
                resultChantList.push(chant);
                returnPatterns.push(pattern);
            }
        });

        return [resultChantList, returnPatterns];
    }

    /**
     * Perform highlighting when user clicks on "Search" button
     * @return {[Chant[], String[]]} list of chants that match the search query
     */
    async function performFakeSearch() {
        const databaseURL =
            env == "development"
                ? "src/database/database.json"
                : "./database.json";

        let resultChantList = await fetch(databaseURL).then((response) =>
                response.json(),
            ),
            patterns;
        /* Temporary: filter by square notation */
        resultChantList = filterByMusicScript(resultChantList, {
            aquitanian: false,
            square: true,
        });
        /* Filter by wildcard search */
        [resultChantList, patterns] = filterByWildcardSearch(
            resultChantList,
            wildcard.getWildcardList(),
        );

        /** Sort chant list by file name */
        resultChantList.sort((chantA, chantB) =>
            chantA.fileName < chantB.fileName ? -1 : 1,
        );

        /* Return the result */
        return [resultChantList, patterns];
    }

    async function reloadTable() {
        experimentalSearchResult.innerHTML = "";

        await performFakeSearch().then(([resultChantList, patterns]) => {
            new ResultTable({
                target: experimentalSearchResult,
                props: {
                    chantList: resultChantList,
                    textFormatOptions: {
                        searchPattern: {
                            list: patterns,
                            mode: "exact-pitch",
                        },
                        melisma: {
                            enabled: false,
                            value: 0,
                        },
                        customGABC: {
                            enabled: true,
                            aquitanianPitch: false,
                        },
                    },
                },
            });
        });
    }

    onMount(async () => {
        await reloadTable();
    });
</script>

<div id="experimental-panel" {hidden}>
    Experimental Panel
    <WildcardSearch
        bind:this={wildcard}
        onKeydown={(e) => {
            if (e.key == "Enter") {
                reloadTable();
            }
        }}
    />

    <Section>
        Patterns found includes:
        <div bind:this={allPatternsFound}></div>
    </Section>
    <Button onClick={reloadTable}>Reload Table</Button>
    <Section>
        <div bind:this={experimentalSearchResult}></div>
    </Section>
</div>

<style>
</style>
