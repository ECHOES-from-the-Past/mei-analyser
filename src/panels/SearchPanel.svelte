<script>
    import Button from "../components/Button.svelte";
    import Checkbox from "../components/Checkbox.svelte";
    import RadioButton from "../components/RadioButton.svelte";
    import Tooltip from "../components/Tooltip.svelte";
    import Section from "../components/Section.svelte";
    import TextInput from "../components/TextInput.svelte";
    import NumberInput from "../components/NumberInput.svelte";
    import ClientStatus from "../components/ClientStatus.svelte";
    import ResultTable from "../components/search/ResultTable.svelte";
    import { onMount } from "svelte";

    import { persist, retrieve, env } from "../utility/utils";
    import {
        NeumeComponent,
        Chant,
        getNeumeComponentList,
    } from "../utility/components.js";
    import {
        filterByMusicScript,
        filterByMelodicPattern,
        processSearchPattern,
    } from "../functions/search.js";

    export let hidden = false;

    // DOM Element binding via `bind:this`
    let aquitanianCheckbox, squareCheckbox;
    let liquescentCheckbox, quilismaCheckbox, oriscusCheckbox;
    let patternInputBox, finalisInputBox;
    let melismaHighlight, melismaInput;
    let customGABCCheckbox, aquitanianPitchCustomGABC;
    let searchButton; // bind this with the "Search" button
    let clientStatus;
    let searchResultDiv, chantInfoDiv, chantSVGDiv;

    onMount(() => {
        clientStatus.hideStatus();
    });

    /**
     * Perform highlighting when user clicks on "Search" button
     * @return {Chant[]} list of chants that match the search query
     */
    async function performSearch() {
        const databaseURL =
            env == "development"
                ? "src/database/database.json"
                : "./database.json";

        /** Retrieving the locally stored list of chants */
        let resultChantList = await fetch(databaseURL).then((response) =>
            response.json(),
        );

        /* First layer of filtering: Notation type */
        resultChantList = filterByMusicScript(resultChantList, {
            aquitanian: aquitanianCheckbox.isChecked(),
            square: squareCheckbox.isChecked(),
        });

        /* Second layer of filtering: Ornamental shapes */
        resultChantList = filterByOrnamentalShapes(resultChantList, {
            liquescent: liquescentCheckbox.isChecked(),
            quilisma: quilismaCheckbox.isChecked(),
            oriscus: oriscusCheckbox.isChecked(),
        });

        /* Third layer of filtering: Modes */
        // resultChantList = filterByModes(resultChantList, modeCheckboxes, unknownModeCheckbox);

        /* Forth layer of filtering: Pattern search */
        let patternSearchMode = retrieve("search-query-option");
        resultChantList = filterByMelodicPattern(
            resultChantList,
            patternInputBox.getValue(),
            patternSearchMode,
        );

        /**
         * Sort chant list by file name
         * Ternary operation explain:
         * - If chantA's file name is "less than" chantB's file name, return -1 to sort chantA before chantB
         * - Otherwise, return 1 to sort chantA after chantB
         */
        resultChantList.sort((chantA, chantB) =>
            chantA.fileName < chantB.fileName ? -1 : 1,
        );

        /* Return the result */
        return resultChantList;
    }

    /**
     * Search by ornamental shapes (liquescent, quilisma, oriscus)
     * @param {Chant[]} chantList list of chants to be filtered
     * @param {{liquescent: boolean, quilisma: boolean, oriscus: boolean}} ornamentalOptions options for the ornamental search
     * @returns {Chant[]} list of chants that has the selected ornamental shapes. If no options are selected, return all the chants.
     */
    function filterByOrnamentalShapes(chantList, ornamentalOptions) {
        /**
         * Filter the chants based on the options.
         * If all the options are unchecked (`false`), return all the chants
         * @type {Chant[]} resulting list of chants after filtering
         */
        let resultChantList = chantList;

        /**
         * HELPER FUNCTION
         * Check if a chant has a specific ornamental shape.
         * This only check for the first occurrence of the ornamental shape in the chant
         * and does not care for the location of the ornamental shape in the chant.
         * @param {Chant} chant the chant to be checked
         * @param {string} ornamentalType the type of ornamental shape to be checked
         * @returns {boolean} `true` if the chant has the ornamental shape, `false` otherwise
         */
        let hasOrnamental = (chant, ornamentalType) => {
            /** @type {NeumeComponent[]} */
            let neumeComponents = getNeumeComponentList(chant.syllables);
            for (let neume of neumeComponents) {
                // TODO: Get the syllables from here
                if (
                    neume.ornamental != null &&
                    neume.ornamental.type == ornamentalType
                )
                    return true;
            }
            return false;
        };

        // first filter for the liquescent option
        if (ornamentalOptions.liquescent) {
            resultChantList = resultChantList.filter((chant) => {
                if (hasOrnamental(chant, "liquescent")) return true;
            });
        }
        // then filter for the quilisma option
        if (ornamentalOptions.quilisma) {
            resultChantList = resultChantList.filter((chant) => {
                if (hasOrnamental(chant, "quilisma")) return true;
            });
        }
        // then filter for the oriscus option
        if (ornamentalOptions.oriscus) {
            resultChantList = resultChantList.filter((chant) => {
                if (hasOrnamental(chant, "oriscus")) return true;
            });
        }

        return resultChantList;
    }

    export function clearSearchResultsAndInfo() {
        // Clear the search result display
        searchResultDiv.innerHTML = `<p>Search results will display here</p>`;
        chantInfoDiv.innerHTML = `<p>Chant information will display here</p>`;
        chantSVGDiv.innerHTML = `<p>Chant visual will appear here</p>`;
    }

    
    
    async function searchButtonAction() {
        /**  @type {string[] | number[]} */
        let patternSearchMode = retrieve("search-query-option");
        let searchPattern = processSearchPattern(patternInputBox.getValue(), patternSearchMode);

        clientStatus.showStatus("Searching...");

        clearSearchResultsAndInfo();
        searchResultDiv.innerHTML = "";
        // Perform search and display the result
        await performSearch().then((resultChantList) => {
            new ResultTable({
                target: searchResultDiv,
                props: {
                    chantList: resultChantList,
                    textFormatOptions: {
                        searchPattern: {
                            list: searchPattern,
                            mode: patternSearchMode
                        },
                        melisma: {
                            enabled: melismaHighlight.isChecked(),
                            value: melismaInput.getValue(),
                        },
                        customGABC: {
                            enabled: customGABCCheckbox.isChecked(),
                            aquitanianPitch: aquitanianPitchCustomGABC.isChecked(),
                        },
                    },
                },
            });
        });

        clientStatus.hideStatus();
    }
</script>

<div id="search-panel" {hidden}>
    <div id="search-panel-grid">
        <!-- Start of leftside search panel -->
        <div id="search-filters">
            <Section id="search-filters">
                <h1>Search Filters</h1>
                <!-- Search by music script (notation type) -->
                <p>Filter chants with the following music script:</p>
                <Checkbox value="aquitanian" bind:this={aquitanianCheckbox}
                    >Aquitanian</Checkbox
                >
                <Checkbox value="square" bind:this={squareCheckbox}
                    >Square</Checkbox
                >
                <hr />

                <!-- Search/filter by ornamental figures -->
                <p>
                    Filter chants that has ornamental figure(s): <br />
                    (No selection will display all chants)
                </p>
                <Checkbox value="liquescent" bind:this={liquescentCheckbox}>
                    <span class="liquescent-word"> Liquescent </span>
                </Checkbox>
                <Checkbox value="quilisma" bind:this={quilismaCheckbox}>
                    <span class="quilisma-word"> Quilisma </span>
                </Checkbox>
                <Checkbox value="oriscus" bind:this={oriscusCheckbox}>
                    <span class="oriscus-word"> Oriscus </span>
                </Checkbox>
                <hr />

                <!-- Search by melodic pattern -->
                <p>
                    Filter chant(s) by
                    <span class="melodic-pattern-word"> melodic pattern </span>
                    <Tooltip />
                </p>

                <RadioButton value="exact-pitch" group="search-query-option">
                    Exact Pitch
                </RadioButton>
                <RadioButton value="contour" group="search-query-option">
                    Contour (melodic intervals)
                </RadioButton>
                <br />
                <TextInput
                    id="pattern-input-box"
                    placeholder="e.g.: '1 +1 -2' or 'a b a g'"
                    onKeydown={(e) => {
                        if (e.key == "Enter") {
                            searchButton.click();
                        }
                    }}
                    bind:this={patternInputBox}
                />

                <p id="pattern-input-status" hidden>
                    Melodic Pattern Search Status
                </p>
                <hr />
                <p>Filter by finalis (the last note)</p>
                <RadioButton group="finalis-filter" value="exact-pitch">
                    Exact Pitch
                </RadioButton>
                <RadioButton group="finalis-filter" value="relative-location">
                    Relative location
                </RadioButton>
                <TextInput
                    id="finalis-input-box"
                    placeholder="A number or a pitch"
                    onKeydown={(e) => {
                        if (e.key == "Enter") {
                            searchButton.click();
                        }
                    }}
                    bind:this={finalisInputBox}
                />
                <hr />
                <Button
                    id="search-btn"
                    onClick={async () => {
                        await searchButtonAction();
                    }}
                    bind:this={searchButton}
                >
                    Search
                </Button>
            </Section>

            <Section id="other-options">
                <h3>Other options</h3>
                <Checkbox value="melisma" bind:this={melismaHighlight}
                    >Enable <span class="melisma-word"
                        >melisma highlighting</span
                    ></Checkbox
                >
                <p>
                    Melisma(s) with at least
                    <NumberInput
                        id="melisma-input"
                        min="2"
                        max="20"
                        value="6"
                        bind:this={melismaInput}
                    />
                    notes in a syllable
                </p>
                <hr />
                <Checkbox
                    value="custom-gabc"
                    onClick={() => {
                        // document
                        //     .querySelectorAll(".custom-gabc")
                        //     .forEach((element) => {
                        //         element.hidden = !customGABCCheckbox.isChecked();
                        //     });
                    }}
                    bind:this={customGABCCheckbox}
                >
                    Show pitch/location with each syllable
                </Checkbox>
                <br />
                <Checkbox value="aquitanian-pitch" bind:this={aquitanianPitchCustomGABC}>
                    Show Aquitanian in pitch value with text (only for chants
                    with detected mode)
                </Checkbox>
                <hr />
                <!-- Search/filter by mode -->
                <div hidden>
                    <p>Filter by detected mode(s):</p>
                    <div id="mode-grid">
                        <Checkbox value="mode-1">Mode 1</Checkbox>
                        <Checkbox value="mode-2">Mode 2</Checkbox>
                        <Checkbox value="mode-3">Mode 3</Checkbox>
                        <Checkbox value="mode-4">Mode 4</Checkbox>

                        <Checkbox value="mode-5">Mode 5</Checkbox>
                        <Checkbox value="mode-6">Mode 6</Checkbox>
                        <Checkbox value="mode-7">Mode 7</Checkbox>
                        <Checkbox value="mode-8">Mode 8</Checkbox>

                        <Checkbox
                            value="all-mode"
                            onClick={() => {
                                const allModeCheckbox =
                                    document.getElementById(
                                        "all-mode-checkbox",
                                    );

                                for (let i = 1; i <= 8; i++) {
                                    let checkbox = document.getElementById(
                                        `mode-${i}-checkbox`,
                                    );

                                    checkbox.checked = allModeCheckbox.checked;

                                    persist(
                                        `mode-${i}-checkbox`,
                                        checkbox.checked,
                                    );
                                }

                                persist(
                                    "all-mode-checkbox",
                                    allModeCheckbox.checked,
                                );
                            }}>All Modes</Checkbox
                        >
                        <Checkbox value="unknown-mode">Unknown</Checkbox>
                    </div>
                    <hr />
                </div>
            </Section>
        </div>
        <!-- End of leftside search panel -->

        <!-- Start of rightside search panel -->
        <div id="search-panel-rightside">
            <Section>
                <h1>Search Results</h1>
                <ClientStatus bind:this={clientStatus} />
                <div id="search-result" bind:this={searchResultDiv}>
                    <!-- Search results -->
                    <p>Search results will display here</p>
                </div>
            </Section>

            <Section id="chant-display">
                <h1>Chant Information</h1>
                <div id="chant-info" bind:this={chantInfoDiv}>
                    <!-- Chant information goes here -->
                    <p>Chant information will display here</p>
                </div>
                <div id="chant-svg" bind:this={chantSVGDiv}>
                    <!-- Chant SVG goes here -->
                    <p>Chant visual will appear here</p>
                </div>
            </Section>
        </div>
    </div>
</div>

<style>
    #search-panel-grid {
        display: grid;
        grid-template-columns: 1fr 3fr;
        gap: 1.2rem;
    }

    #mode-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
    }
</style>
