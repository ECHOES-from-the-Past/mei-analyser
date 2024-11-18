<script>
    import Button from "@components/Button.svelte";
    import Checkbox from "@components/Checkbox.svelte";
    import Tooltip from "@components/Tooltip.svelte";
    import Section from "@components/Section.svelte";
    import TextInput from "@components/TextInput.svelte";
    import NumberInput from "@components/NumberInput.svelte";
    import ClientStatus from "@components/ClientStatus.svelte";
    import ResultTable from "@search/ResultTable.svelte";
    import MelodicPatternInput from "@search/MelodicPatternInput.svelte";

    import {
        Chant,
        SearchResult,
        NeumeComponent,
    } from "@utility/components.js";
    import {
        filterByMusicScript,
        filterByOrnamentalShapes,
        filterByMelodicPattern,
        filterByFinalis,
        filterByText,
    } from "@search/search.mjs";

    import { onMount } from "svelte";
    import { persist, retrieve, env } from "@utility/utils";
    import SearchDropdown from "@/components/SearchDropdown.svelte";

    const databaseURL =
        env == "development" ? "src/database/database.json" : "./database.json";
    let listOfChants = [];

    export let hidden = false;

    // DOM Element binding via `bind:this`

    let /** @type {Checkbox} */ aquitanianCheckbox,
        /** @type {Checkbox} */ squareCheckbox,
        /** @type {Checkbox} */ liquescentCheckbox,
        /** @type {Checkbox} */ quilismaCheckbox,
        /** @type {Checkbox} */ oriscusCheckbox;

    let /** @type {MelodicPatternInput} */ melodicPatternInput;

    let /** @type {TextInput} */ finalisInputBox,
        /** @type {TextInput} */ textInputBox;

    let /** @type {Checkbox}  */ melismaHighlight,
        /** @type {TextInput} */ melismaInput;
    let /** @type {Checkbox}  */ customGABCCheckbox,
        /** @type {Checkbox}  */ aquitanianPitchCustomGABC,
        /** @type {Checkbox}  */ verovioRendition;

    let /** @type {Button}  */ searchButton; // bind this with the "Search" button
    let /** @type {ClientStatus} */ clientStatus;

    let /** @type {HTMLDivElement}*/ searchResultDiv,
        /** @type {HTMLDivElement}*/ chantInfoDiv,
        /** @type {HTMLDivElement}*/ chantSVGDiv;

    let /** @type {String[]}*/ listOfTitle;

    onMount(async () => {
        clientStatus.showStatus("Loading list of chants...");
        /**
         * Retrieving the "locally" stored list of chants
         * @type {Chant[]}
         */
        listOfChants = await fetch(databaseURL)
            .then((response) => response.json())
            .finally(() => {
                clientStatus.hideStatus();
            })
            .catch(() => {
                clientStatus.showStatus(
                    "Error loading list of chants, please reload the page.",
                );
            });
    });

    /**
     * Perform highlighting when user clicks on "Search" button
     * @return {SearchResult[]} list of search results (each contain a chant and a list of melodic pattern)
     */
    function performSearch() {
        let resultListOfChants = listOfChants;
        /* First layer of filtering: Notation type */
        resultListOfChants = filterByMusicScript(listOfChants, {
            aquitanian: aquitanianCheckbox.isChecked(),
            square: squareCheckbox.isChecked(),
        });

        /* Second layer of filtering: Ornamental shapes */
        resultListOfChants = filterByOrnamentalShapes(resultListOfChants, {
            liquescent: liquescentCheckbox.isChecked(),
            quilisma: quilismaCheckbox.isChecked(),
            oriscus: oriscusCheckbox.isChecked(),
        });

        /* ~ layer of filtering: Modes (no longer in use) */
        // resultChantList = filterByModes(resultChantList, modeCheckboxes, unknownModeCheckbox);

        /* Fifth layer of filtering: finals */
        resultListOfChants = filterByFinalis(
            resultListOfChants,
            finalisInputBox.getValue(),
        );

        /* Sixth layer of filtering: Text */
        resultListOfChants = filterByText(
            resultListOfChants,
            textInputBox.getValue(),
        );

        /**
         * Sort chant list by file name
         * Ternary operation explain:
         * - If chantA's file name is "less than" chantB's file name, return -1 to sort chantA before chantB
         * - Otherwise, return 1 to sort chantA after chantB
         */
        resultListOfChants.sort((chantA, chantB) =>
            chantA.fileName < chantB.fileName ? -1 : 1,
        );

        /**
         * Pattern search
         */
        let melodicPatternResults = filterByMelodicPattern(
            resultListOfChants,
            melodicPatternInput.getMelodicPatternInput(),
            melodicPatternInput.getMelodicPatternSearchMode(),
        );

        /* Return the result */
        return melodicPatternResults;
    }

    export function clearSearchResultsAndInfo() {
        // Clear the search result display
        searchResultDiv.innerHTML = `<p>Search results will display here</p>`;
        chantInfoDiv.innerHTML = `<p>Chant information will display here</p>`;
        chantSVGDiv.innerHTML = `<p>Chant visual will appear here</p>`;
    }

    function searchButtonAction() {
        /**  @type {string[] | number[]} */
        clientStatus.showStatus("Searching...");

        clearSearchResultsAndInfo();
        searchResultDiv.innerHTML = "";

        let otherOptions = {
            melisma: {
                enabled: melismaHighlight.isChecked(),
                value: melismaInput.getValue(),
            },
            customGABC: {
                enabled: customGABCCheckbox.isChecked(),
                aquitanianPitch: aquitanianPitchCustomGABC.isChecked(),
            },
            verovioRendition: {
                enabled: verovioRendition.isChecked(),
            },
        };

        // Perform search and display the result
        let /**@type {SearchResult[]}*/ result = performSearch();

        // Add a time delay for a feedback, since this is really fast
        var delayMs = 1000; //1 second
        setTimeout(() => {
            new ResultTable({
                target: searchResultDiv,
                props: {
                    searchResult: result,
                    otherOptions: otherOptions,
                },
            });
            clientStatus.hideStatus();
            console.debug("Done Search");
        }, delayMs);
    }

    export function loadDefaultOptions() {
        [aquitanianCheckbox, squareCheckbox].forEach((e) => e.setChecked());
        [liquescentCheckbox, quilismaCheckbox, oriscusCheckbox].forEach((e) =>
            e.setUnchecked(),
        );
        melismaHighlight.setChecked();
        melodicPatternInput.reset();
        finalisInputBox.setValue("");
        verovioRendition.setChecked();
    }

    /**
     *
     * @param {KeyboardEvent} e
     */
    function searchOnEnter(e) {
        if (e.key == "Enter") {
            searchButton.click();
        }
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
                    Filter chants that have ornamental figure(s): <br />
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
                    <MelodicPatternInput
                        bind:this={melodicPatternInput}
                        onKeydown={searchOnEnter}
                    />
                </p>

                <hr />

                <!-- Search by finalis -->
                <p>
                    Filter chants by finalis (the last note)
                    <Tooltip id="finalis-filter">
                        Filter chants by their finalis (last note) by entering <b
                            >a pitch value</b
                        >
                        (from "a" to "g") for chants in square notes or
                        <b>a location value</b> (from "-3" to "+4") for chants in
                        Aquitanian neumes.
                    </Tooltip>
                </p>

                <TextInput
                    id="finalis-input-box"
                    placeholder="e.g.: '-1' or 'a'"
                    onKeydown={(e) => {
                        if (e.key == "Enter") {
                            searchButton.click();
                        }
                    }}
                    bind:this={finalisInputBox}
                />
                <!-- Metadata search filter -->
                <hr />
                <p>
                    Filter chants by metadata <br /><i>
                        (Title, Source, Cantus ID)</i
                    >
                </p>
                <SearchDropdown
                    id="title-dropdown-filter"
                    placeholder="Search a title"
                    allOptions={[
                        ...new Set(
                            listOfChants.map(
                                (/** @type {Chant} */ chant) => chant.title,
                            ),
                        ),
                    ]}
                />

                <SearchDropdown
                    id="source-dropdown-filter"
                    placeholder="Enter a chant's source"
                    allOptions={[
                        ...new Set(
                            listOfChants.map((/** @type {Chant} */ chant) => {
                                return chant.source;
                            }),
                        ),
                    ]}
                />

                <SearchDropdown
                    id="cantusid-dropdown-filter"
                    placeholder="Search a Cantus ID"
                    allOptions={[
                        ...new Set(
                            listOfChants.map(
                                (/** @type {Chant} */ chant) => chant.cantusId,
                            ),
                        ),
                    ]}
                />

                <hr />

                <!-- Search by finalis -->
                <p>
                    Filter chants by text (case insensitive)
                    <!-- <Tooltip id="text-filter">
                        Filter chants by their text.
                    </Tooltip> -->
                </p>

                <TextInput
                    id="text-input-box"
                    placeholder="e.g.: 'dominici'"
                    onKeydown={(e) => {
                        if (e.key == "Enter") {
                            searchButton.click();
                        }
                    }}
                    bind:this={textInputBox}
                />

                <hr />

                <!-- Search, Reset, and Clear Results buttons -->
                <Button
                    id="search-btn"
                    onClick={async () => {
                        await searchButtonAction();
                    }}
                    bind:this={searchButton}
                >
                    Search
                </Button>
                <Button
                    id="reset-search-button"
                    onClick={() => {
                        loadDefaultOptions();
                    }}
                >
                    Reset
                </Button>
                <Button
                    id="clear-search-result"
                    onClick={clearSearchResultsAndInfo}
                >
                    Clear results
                </Button>
            </Section>

            <!-- OTHER OPTIONS -->
            <Section id="other-options">
                <h3>Other options</h3>
                <Checkbox value="melisma" bind:this={melismaHighlight}>
                    Enable
                    <span class="melisma-word"> melisma highlighting </span>
                </Checkbox>
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
                <Checkbox
                    value="aquitanian-pitch"
                    bind:this={aquitanianPitchCustomGABC}
                    disabled
                >
                    Show Aquitanian in pitch value with text (only for chants
                    with detected mode)
                </Checkbox>
                <hr />
                <Checkbox
                    value="veriovio-rendition"
                    bind:this={verovioRendition}
                >
                    Enable modern rendition of chants (Verovio)
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
