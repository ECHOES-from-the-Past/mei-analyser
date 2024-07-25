<script>
    import Button from "../components/Button.svelte";
    import Checkbox from "../components/Checkbox.svelte";
    import RadioButton from "../components/RadioButton.svelte";

    import {
        clearSearchResultsAndInfo,
        performSearch,
        createResultTable,
    } from "../client/search";

    import Tooltip from "../components/Tooltip.svelte";
    import Section from "../components/Section.svelte";
    import InputTextBox from "../components/TextInput.svelte";
    import { modeCheckboxes } from "../DOMelements.mjs";

    async function searchButtonAction() {
        clearSearchResultsAndInfo();

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
        /**
         * @type {HTMLInputElement}
         * @description The checkboxes for each mode and the undetected mode
         */
        const mode1Checkbox = document.getElementById("mode-1-checkbox");
        const mode2Checkbox = document.getElementById("mode-2-checkbox");
        const mode3Checkbox = document.getElementById("mode-3-checkbox");
        const mode4Checkbox = document.getElementById("mode-4-checkbox");
        const mode5Checkbox = document.getElementById("mode-5-checkbox");
        const mode6Checkbox = document.getElementById("mode-6-checkbox");
        const mode7Checkbox = document.getElementById("mode-7-checkbox");
        const mode8Checkbox = document.getElementById("mode-8-checkbox");

        /** @type {HTMLInputElement[]} */
        const modeCheckboxes = [
            mode1Checkbox,
            mode2Checkbox,
            mode3Checkbox,
            mode4Checkbox,
            mode5Checkbox,
            mode6Checkbox,
            mode7Checkbox,
            mode8Checkbox,
        ];

        const allModeCheckbox = document.getElementById('all-mode-checkbox');


        modeCheckboxes.forEach((checkbox, index) => {
            checkbox.checked = allModeCheckbox.checked;
            persist(`mode-${index + 1}-checkbox`, checkbox.checked);
            persist("all-mode-checkbox", allModeCheckbox.checked);
        });
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
                <Checkbox value="aquitanian">Aquitanian</Checkbox>
                <Checkbox value="square">Square</Checkbox>
                <hr />

                <!-- Search/filter by ornamental figures -->
                <p>
                    Filter chants that has ornamental figure(s): <br />
                    (No selection will display all chants)
                </p>
                <Checkbox value="liquescent">Liquescent</Checkbox>
                <Checkbox value="quilisma">Quilisma</Checkbox>
                <Checkbox value="oriscus">Oriscus</Checkbox>
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
                <InputTextBox id="pattern-input-box" placeholder="e.g.: 1 +1 -2"
                ></InputTextBox>
                <!-- clear input button -->
                <Button id="clear-pattern-input-btn">Clear</Button>
                <p class="error" id="pattern-input-status" hidden>
                    Melodic Pattern Search Status
                </p>
                <hr />
                <Button id="search-btn" onClick={performSearch}>Search</Button>
                <br />
            </Section>

            <Section>
                <h3>Other options</h3>
                <Checkbox value="melisma">Enable melisma highlighting</Checkbox>
                <p>
                    <span class="nonselectable-text melisma-word">
                        Melisma(s) with at least
                    </span>
                    <input
                        type="number"
                        id="melisma-input"
                        min="2"
                        max="20"
                        value="6"
                    />
                    <span class="nonselectable-text melisma-word">
                        notes in a syllable
                    </span>
                </p>
                <div>
                    <span
                        class="melisma-arrow nonselectable-text"
                        id="melisma-decrement"
                    >
                        &lt;
                    </span>
                    <span
                        class="melisma-arrow nonselectable-text"
                        id="melisma-increment"
                    >
                        &gt;
                    </span>
                </div>
                <hr />
                <Checkbox value="custom-gabc">
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

    #database-list {
        list-style-type: none;
        padding: 0.2rem;
    }

    /* #result-table {
        width: 100%;
        word-break: normal;
    }

    #result-table > thead > th {
        text-align: center;
        background-color: var(--button);
        color: white;
        padding: 0.8rem;
        font-size: 1.2rem;
    }

    #result-table > tbody > tr > td,
    #result-table > tbody > tr > a {
        text-align: center;
        padding: 0.5rem;
        border: 1px solid hsla(101, 70%, 16%, 0.678);
        height: inherit;
    } */

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

    .melisma-arrow {
        display: inline-block;
        border: 1px solid var(--button-active);
        box-shadow: 1px 2px var(--button);
        border-radius: 0.5rem;
        padding: 0.1rem 0.4rem;
        font-size: 1rem;
        cursor: pointer;
        transition: box-shadow 0.1s;
    }

    .melisma-arrow:hover {
        box-shadow: 2px 3px 1px var(--button-hover);
    }

    .melisma-arrow:active {
        box-shadow: 2px 4px 4px var(--button-active);
    }
</style>
