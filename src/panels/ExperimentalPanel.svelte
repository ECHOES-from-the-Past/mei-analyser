<script>
    import Button from "../components/Button.svelte";
    import { onMount } from "svelte";
    import ResultTable from "../components/search/ResultTable.svelte";
    import WildcardSearch from "../components/search/WildcardSearch.svelte";
    import Section from "../components/Section.svelte";
    import { env } from "../utility/utils";
    import { Chant, getNeumeComponentList } from "../utility/components";
    import { filterByMusicScript } from "../functions/search";

    export let hidden = false;
    let experimentalSearchResult;

    let wildcard;

    /**
     * Possible entries in wildcardSearchList:
     * - [x] A dot `.` to search for one arbitrary pitch
     * - [ ] A question mark `?` to search for an optional note. E.g.:
     *   - "A F? B" searches for "A F B" and "A B"
     *   - "A .? B", or "A ?. B" search for "A B", "A D B", etc.
     * - [ ] An asterisk `*` to search for an arbritrary number of notes
     * @param {Chant} chant
     * @param {string[]} wildcardRegex
     */
    function processWildcardSearch(chant, wildcardRegex) {
        const ncArray = getNeumeComponentList(chant.syllables);

        const ncPitchStr = ncArray
            .map((nc) => {
                if (chant.notationType == "aquitanian") {
                    return nc.loc;
                } else if (chant.notationType == "square") {
                    return nc.pitch;
                }
            })
            .join("");

        let patternMatches = ncPitchStr.matchAll(wildcardRegex);
        let patterns = [];

        patternMatches.forEach((v, i) => {
            // console.log(v, i)
            // v is the match pattern in the chant,
            // i is the index in ncArray that a match is found
            // patterns will take ncArray[i : i+v.length]
            patterns.push(ncArray.slice(i, i + v.length));
        });

        console.log(patterns);
        return patterns;
    }

    function filterByWildcardSearch(chantList, wildcardRegex) {
        let resultChantList = [],
            returnPatterns = [];

        chantList.forEach((chant) => {
            let pattern = processWildcardSearch(chant, wildcardRegex);
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
            wildcard.getWildcardRegex(),
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

    <Button onClick={reloadTable}>Reload Table</Button>
    <Section>
        <div bind:this={experimentalSearchResult}></div>
    </Section>
</div>

<style>
</style>
