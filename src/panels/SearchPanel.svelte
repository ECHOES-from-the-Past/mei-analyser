<script>
    import Button from "../components/Button.svelte";
    import Checkbox from "../components/Checkbox.svelte";
    import RadioButton from "../components/RadioButton.svelte";
</script>

<div id="search-panel">
    <div id="search-panel-grid">
        <!-- Start of leftside search panel -->
        <div id="search-panel-leftside">
            <div class="section">
                <h1>Search Panel</h1>
                <!-- Search by music script (notation type) -->
                <p>Filter chants with the following music script:</p>
                <Checkbox value="aquitanian" isChecked={true}>
                    Aquitanian
                </Checkbox>

                <Checkbox value="square">Square</Checkbox>

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

                    <Checkbox value="all-mode">All Modes</Checkbox>
                    <Checkbox value="unknown-mode">Unknown</Checkbox>
                </div>
                <hr />
                <!-- Search/filter by ornamental figures -->
                <p>
                    Filter chants that has ornamental figure(s): <br /> (No selection
                    will display all chants)
                </p>

                <Checkbox value="liquescent">Liquescent</Checkbox>
                <Checkbox value="quilisma">Quilisma</Checkbox>
                <Checkbox value="oriscus">Oriscus</Checkbox>

                <hr />
                <!-- Search by melodic pattern -->
                <p>
                    Filter chant(s) by <span class="melodic-pattern-word"
                        >melodic pattern</span
                    >
                    <button
                        class="tooltip"
                        id="pattern-search-tooltip"
                        popovertarget="pattern-search-tooltip-content"
                    >
                        ⓘ
                </button>
                </p>
                <div
                    class="tooltip-content"
                    id="pattern-search-tooltip-content"
                    popover
                >
                    <ul>
                        <li>
                            <p>
                                <b
                                    >Exact pitch (only for Square music script
                                    chants)</b
                                >: Enter pitch names of the melodic pattern. For
                                example, "a b a f" will search for a melodic
                                pattern that follows the sequence A-B-A-F.
                                <!-- Use uppercase letters for a lower octave and lowercase letters for an upper octave. -->
                            </p>
                        </li>
                        <li>
                            <p>
                                <b> Contour (Melodic intervals) </b> in the form
                                of positive or negative integers (e.g., +1 indicates
                                one step up - either a semitone or a tone - from
                                the previous note; 0 indicates unison; and -2 indicates
                                two steps down - either a major or minor third -
                                from the previous note). When looking for a series
                                of notes, the integers can be separated by a space
                                (e.g., "0 +2 -1 +1 +1").
                            </p>
                        </li>
                    </ul>
                </div>
                <RadioButton value="exact-pitch">
                    Exact Pitch
                </RadioButton>
                <br />
                <RadioButton value="contour">
                    Contour (melodic intervals)
                </RadioButton>
                <br />
                <input
                    type="text"
                    id="pattern-input-box"
                    placeholder="e.g.: 1 2 -1"
                />
                <!-- clear input button -->
                <Button id="clear-pattern-input-btn">Clear</Button>
                <p class="error" id="pattern-input-status" hidden>
                    Melodic Pattern Search Status
                </p>
                <hr />
                <Button id="search-btn">Search</Button>
                <br />
            </div>

            <div class="section" id="other-search-options">
                <h3>Other options</h3>
                <input
                    type="checkbox"
                    name="melisma-checkbox"
                    id="melisma-enable-checkbox"
                />
                <label for="melisma-enable-checkbox">
                    Enable melisma highlighting
                </label>
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
                <!-- Search by melisma (melodic density) -->
                <input
                    type="checkbox"
                    name="custom-gabc"
                    id="custom-gabc-checkbox"
                />
                <label for="custom-gabc-checkbox">
                    Toggle show pitch/location with the text
                </label>
                <br />
                <input
                    type="checkbox"
                    name="aquitanian-pitch"
                    id="aquitanian-pitch-checkbox"
                />
                <label for="aquitanian-pitch-checkbox">
                    Show Aquitanian in pitch value with text (only for chants
                    with detected mode)
                </label>
            </div>
        </div>
        <!-- End of leftside search panel -->

        <!-- Start of rightside search panel -->
        <div id="search-panel-rightside">
            <div class="section">
                <h1>Search Results</h1>
                <p id="search-result-info"></p>
                <div id="search-result">
                    <p>Search results will display here</p>

                    <!-- Search results -->
                </div>
            </div>
            <div id="chant-display" class="section">
                <h1>Chant Information</h1>
                <div id="chant-info">
                    <p>Chant information will display here</p>
                    <!-- Chant information goes here -->
                </div>
                <div id="chant-svg">
                    <p>Chant visual will appear here</p>
                    <!-- Chant SVG goes here -->
                </div>
            </div>
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

    input[type="checkbox"]:hover,
    label:hover {
        cursor: pointer;
        background-color: var(--label-hover);
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

    .tooltip {
        color: white;
        font-weight: bold;
        cursor: pointer;
        background-color: var(--button);
        padding: 0.1rem 0.5rem;
        border-radius: 0.5rem;
    }

    .tooltip-content {
        padding: 2rem;
        margin: 8rem;
        background-color: var(--background);
        border: 4px solid var(--button);
        border-radius: 0.5rem;
    }
</style>
