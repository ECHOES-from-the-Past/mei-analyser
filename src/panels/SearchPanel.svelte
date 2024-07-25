<script>
    import Button from "../components/Button.svelte";
    import Checkbox from "../components/Checkbox.svelte";
    import RadioButton from "../components/RadioButton.svelte";
    import Tooltip from "../components/Tooltip.svelte";
    import Section from "../components/Section.svelte";
    import TextInput from "../components/TextInput.svelte";
    import MelismaArrow from "../components/MelismaArrow.svelte";

    import { createResultTable } from "../client/search";
    import { persist, retrieve, env } from "../utility/utils";

    // DOM Element binding via `bind:this`
    let aquitanianCheckbox, squareCheckbox;
    let liquescentCheckbox, quilismaCheckbox, oriscusCheckbox;
    let searchButton; // bind this with the "Search" button

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
            aquitanian: aquitanianCheckbox.checked,
            square: squareCheckbox.checked,
        });

        /* Second layer of filtering: Ornamental shapes */
        /**
         * Options for the ornamental search
         * @type {{liquescent: boolean, quilisma: boolean, oriscus: boolean}}
         */
        let ornamentalOptions = {
            liquescent: liquescentCheckbox.checked,
            quilisma: quilismaCheckbox.checked,
            oriscus: oriscusCheckbox.checked,
        };

        resultChantList = filterByOrnamentalShapes(resultChantList, ornamentalOptions);
        console.log(resultChantList);

        /* Third layer of filtering: Modes */
        // resultChantList = filterByModes(resultChantList, modeCheckboxes, unknownModeCheckbox);

        /* Forth layer of filtering: Pattern search */
        // resultChantList = filterByMelodicPattern(resultChantList, patternInputBox.value, getMelodicPatternSearchMode())

        // Display the amount of chants that match the search options

        // searchResultInfo.innerHTML = `Found <b>${resultChantList.length}</b> chants from the search options.`;

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
        // console.log(resultChantList)
        return resultChantList;
    }

    /**
     *
     * @param {Chant[]} chantList The list of chants
     * @param {{"aquitanian": boolean, "square": boolean}} musicScripts an array of chant types.
     */
    function filterByMusicScript(chantList, musicScripts) {
        chantList.filter((chant) => {
            if (musicScripts.aquitanian && chant.notationType == "aquitanian")
                return true;
            if (musicScripts.square && chant.notationType == "square")
                return true;
            return false;
        });
    }

    /**
     * HELPER FUNCTION
     * Check if a chant has a specific ornamental shape.
     * This only check for the first occurrence of the ornamental shape in the chant
     * and does not care for the location of the ornamental shape in the chant.
     * @param {Chant} chant the chant to be checked
     * @param {string} ornamentalType the type of ornamental shape to be checked
     * @returns {boolean} `true` if the chant has the ornamental shape, `false` otherwise
     */
    function hasOrnamental(chant, ornamentalType) {
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

    async function searchButtonAction() {
        // clearSearchResultsAndInfo();

        // // Perform search and display the result
        // refreshWheel.hidden = false;
        let searchResults = await performSearch().then((results) => {
            // refreshWheel.hidden = true;
            console.log(createResultTable(results)); // TODO: not displaying
            return results;
        });
        createResultTable(searchResults);
    }

    function selectAllModes() {
        const allModeCheckbox = document.getElementById("all-mode-checkbox");

        for (let i = 1; i <= 8; i++) {
            let checkbox = document.getElementById(`mode-${i}-checkbox`);
            checkbox.checked = allModeCheckbox.checked;
            persist(`mode-${i}-checkbox`, checkbox.checked);
        }

        persist("all-mode-checkbox", allModeCheckbox.checked);
    }
</script>

<div id="search-panel">
    <div id="search-panel-grid">
        <!-- Start of leftside search panel -->
        <div id="search-panel-leftside">
            <Section>
                <h1>Search Panel</h1>
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
                    Liquescent
                </Checkbox>
                <Checkbox value="quilisma" bind:this={quilismaCheckbox}>
                    Quilisma
                </Checkbox>
                <Checkbox value="oriscus" bind:this={oriscusCheckbox}>
                    Oriscus
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
                <br />
                <RadioButton value="contour" group="search-query-option">
                    Contour (melodic intervals)
                </RadioButton>
                <br />
                <TextInput
                    id="pattern-input-box"
                    placeholder="e.g.: 1 +1 -2"
                    onKeydown={(e) => {
                        if (e.key == "Enter") {
                            searchButton.click();
                        }
                    }}
                />
                <p id="pattern-input-status" hidden>
                    Melodic Pattern Search Status
                </p>
                <hr />
                <Button
                    id="search-btn"
                    bind:this={searchButton}
                    onClick={searchButtonAction}
                >
                    Search
                </Button>
                <br />
            </Section>

            <Section>
                <h3>Other options</h3>
                <Checkbox value="melisma">Enable melisma highlighting</Checkbox>
                <p>
                    <span class="melisma-word"> Melisma(s) with at least </span>
                    <input
                        type="number"
                        id="melisma-input"
                        min="2"
                        max="20"
                        value="6"
                    />
                    <span class="melisma-word"> notes in a syllable </span>
                    <MelismaArrow type="down" />
                    <MelismaArrow type="up" />
                </p>
                <div></div>
                <hr />
                <Checkbox
                    value="custom-gabc"
                    onClick={() => {
                        document
                            .querySelectorAll(".custom-gabc")
                            .forEach((element) => {
                                element.hidden = !this.check; // does this work?
                            });
                    }}
                >
                    Toggle show pitch/location with the text
                </Checkbox>
                <br />
                <Checkbox value="aquitanian-pitch">
                    Show Aquitanian in pitch value with text (only for chants
                    with detected mode)
                </Checkbox>
                <hr />
                <!-- Search/filter by mode -->
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

                    <Checkbox value="all-mode" onClick={selectAllModes}
                        >All Modes</Checkbox
                    >
                    <Checkbox value="unknown-mode">Unknown</Checkbox>
                </div>
                <hr />
            </Section>
        </div>
        <!-- End of leftside search panel -->

        <!-- Start of rightside search panel -->
        <div id="search-panel-rightside">
            <Section>
                <h1>Search Results</h1>
                <p id="search-result-info"></p>
                <div id="search-result">
                    <p>Search results will display here</p>

                    <!-- Search results -->
                </div>
            </Section>
            <Section>
                <h1>Chant Information</h1>
                <div id="chant-info">
                    <p>Chant information will display here</p>
                    <!-- Chant information goes here -->
                </div>
                <div id="chant-svg">
                    <p>Chant visual will appear here</p>
                    <!-- Chant SVG goes here -->
                </div>
            </Section>
            <!-- End of rightside search panel -->
        </div>
        <!--  -->
    </div>
</div>

<style>
    #search-panel {
        --liquescent-text: hsl(216, 100%, 41%);
        --quilisma-text: hsl(59, 78%, 28%);
        --oriscus-text: hsl(318, 100%, 36%);
        --unclear-text: hsl(0, 0%, 15%);

        --melisma-text: hsl(115, 61%, 28%);
        --melisma-background: hsla(138, 100%, 66%, 0.4);
        --melisma-spotlight-fill: hsla(138, 100%, 72%, 0.2);
        --melisma-spotlight-stroke: hsl(138, 100%, 72%);

        /* Default highlighting colours */
        --highlight-fill: hsl(276, 74%, 51%);
        --highlight-stroke: hsl(276, 100%, 31%);
        --melodic-pattern-gabc: hsla(276, 100%, 75%, 0.596);

        --spotlight-fill: hsla(276, 74%, 51%, 0.075);
        --spotlight-stroke: hsla(276, 100%, 31%, 0.466);
    }

    #search-panel-grid {
        display: grid;
        grid-template-columns: 1fr 2.7fr;
        gap: 1.2rem;
    }

    .liquescent-word {
        color: var(--liquescent-text);
        font-weight: bold;
        text-decoration: underline solid;
    }

    .quilisma-word {
        color: var(--quilisma-text);
        font-weight: bold;
        text-decoration: underline wavy;
    }

    .oriscus-word {
        color: var(--oriscus-text);
        font-weight: bold;
        text-decoration: underline dashed 0.1rem;
    }

    .melisma-word {
        background-color: var(--melisma-background);
    }

    #melisma-input {
        box-sizing: border-box;
        border: 1px solid var(--button-active);
        font-size: inherit;
        text-align: center;
        margin: 0 0.2rem;
        width: 1.8rem;
        height: 1.8rem;
    }

    input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
</style>
