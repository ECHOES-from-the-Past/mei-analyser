<script>
    import { onMount } from "svelte";
    export let hidden = false;
    import ResultTable from "../components/search/ResultTable.svelte";
    import WildcardSearch from "../components/search/WildcardSearch.svelte";
    import Section from "../components/Section.svelte";
    import { env } from "../utility/utils";
    import { getNeumeComponentList } from "../utility/components";
    import Button from "../components/Button.svelte";

    let wildcard;

    function processWildcardSearch(chant, wildcardSearchList) {
        const ncArray = getNeumeComponentList(chant.syllables);
        let patterns = [];
        for (
            let i_nc = 0;
            i_nc < ncArray.length - wildcardSearchList.length;
            i_nc++
        ) {
            let patternFound = [];

            for (
                let i_search = 0;
                i_search < wildcardSearchList.length;
                i_search++
            ) {
                // processing the search for Square notation, using the `septenary` value of the note
                if (
                    ncArray[i_nc + i_search].pitch ==
                    wildcardSearchList[i_search]
                ) {
                    patternFound.push(ncArray[i_nc + i_search]);
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

        console.log(wildcardSearchList);

        let resultChantList = [];

        chantList.forEach((chant) => {
            let patterns = processWildcardSearch(chant, wildcardSearchList);
            if (patterns.length > 0) {
                resultChantList.push(chant);
            }
        });

        return resultChantList;
    }

    /**
     * Perform highlighting when user clicks on "Search" button
     * @return {Chant[]} list of chants that match the search query
     */
    async function performFakeSearch() {
        const databaseURL =
            env == "development"
                ? "src/database/database.json"
                : "./database.json";

        let resultChantList = await fetch(databaseURL).then((response) =>
            response.json(),
        );

        /* Filter by wildcard search */
        resultChantList = filterByWildcardSearch(
            resultChantList,
            wildcard.getWildcardList(),
        );
        console.log(resultChantList);

        /** Sort chant list by file name */
        resultChantList.sort((chantA, chantB) =>
            chantA.fileName < chantB.fileName ? -1 : 1,
        );

        /* Return the result */
        return resultChantList;
    }

    async function reloadTable() {
        document.getElementById("searchResultDiv").innerHTML = "";

        await performFakeSearch().then((resultChantList) => {
            new ResultTable({
                target: searchResultDiv,
                props: {
                    chantList: resultChantList,
                    textFormatOptions: {
                        searchPattern: {
                            list: [],
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
    <WildcardSearch bind:this={wildcard} />
    <Button onClick={reloadTable}>Reload Table</Button>
    <Section>
        <div id="searchResultDiv"></div>
    </Section>
</div>

<style>
</style>
