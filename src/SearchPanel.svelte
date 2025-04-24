<script>
    import Button from "@components/Button.svelte";
    import SelectInput from "@components/SelectInput.svelte";
    import Checkbox from "@components/Checkbox.svelte";
    import ClientStatus from "@components/ClientStatus.svelte";
    import NumberInput from "@components/NumberInput.svelte";
    import ResultTable from "@search/ResultTable.svelte";
    import Section from "@components/Section.svelte";
    import Tooltip from "@components/Tooltip.svelte";
    import TextInput from "@components/TextInput.svelte";

    import MelodicPatternSearch from "@/search/MelodicPatternSearch.svelte";

    import {
        Chant,
        SearchResult,
    } from "@utility/components.js";
    import {
        filterByMusicScript,
        filterByOrnamentalShapes,
        filterByMelodicPattern,
        filterByFinalis,
        filterByText,
        filterByTitle,
        filterBySource,
        filterByCantusId,
    } from "@search/search.mjs";

    import { mount } from "svelte";
    import { env } from "@utility/utils";

    const databaseURL =
        env == "development" ? "src/database/database.json" : "./database.json";

    // DOM Element binding via `bind:this`

    let /** @type {Checkbox} */ aquitanianCheckbox = $state(),
        /** @type {Checkbox} */ squareCheckbox = $state(),
        /** @type {Checkbox} */ liquescentCheckbox = $state(),
        /** @type {Checkbox} */ quilismaCheckbox = $state(),
        /** @type {Checkbox} */ oriscusCheckbox = $state();

    let /** @type {MelodicPatternSearch} */ melodicPatternSearch = $state();

    let /** @type {TextInput} */ finalisInputBox = $state(),
        /** @type {TextInput} */ textInputBox = $state(),
        /** @type {SelectInput} */ titleComboBox = $state(),
        /** @type {SelectInput} */ sourceComboBox = $state(),
        /** @type {SelectInput} */ cantusIdComboBox = $state();

    let /** @type {Checkbox}  */ melismaHighlight = $state(),
        /** @type {TextInput} */ melismaInput = $state();
    let /** @type {Checkbox}  */ customGABCCheckbox = $state(),
        /** @type {Checkbox}  */ aquitanianPitchCustomGABC = $state(),
        /** @type {Checkbox}  */ verovioRendition = $state();

    let /** @type {Button} */ searchButton = $state(); // bind this with the "Search" button
    let /** @type {ClientStatus} */ clientStatus = $state();

    let /** @type {HTMLDivElement}*/ searchResultDiv = $state();

    let listOfChants = $state([]);

    $effect(async () => {
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
    1;

    /**
     * Perform highlighting when user clicks on "Search" button
     * @return {SearchResult[]} list of search results (each contain a chant and a list of melodic pattern)
     */
    function performSearch() {
        let resultListOfChants = listOfChants;
        /* First layer of filtering: Notation type */
        resultListOfChants = filterByMusicScript(resultListOfChants, {
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

        /* Seventh layer of filtering: Metadata */
        resultListOfChants = filterByTitle(
            resultListOfChants,
            titleComboBox.getInputValue(),
        );

        resultListOfChants = filterBySource(
            resultListOfChants,
            sourceComboBox.getInputValue(),
        );

        resultListOfChants = filterByCantusId(
            resultListOfChants,
            cantusIdComboBox.getInputValue(),
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
            melodicPatternSearch.getMelodicPatternInput(),
            melodicPatternSearch.getMelodicPatternSearchMode(),
            melodicPatternSearch.getLiquescentExclusion()
        );

        /* Return the result */
        return melodicPatternResults;
    }

    export function clearSearchResultsAndInfo() {
        // Clear the search result display
        searchResultDiv.innerHTML = `<p>Search results will display here</p>`;
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
        var delayMs = 80; // ms
        setTimeout(() => {
            mount(ResultTable, {
                target: searchResultDiv,
                props: {
                    searchResult: result,
                    otherOptions: otherOptions,
                },
            });
            clientStatus.hideStatus();
        }, delayMs);
    }

    export function loadDefaultOptions() {
        [aquitanianCheckbox, squareCheckbox].forEach((e) => e.setChecked());
        [liquescentCheckbox, quilismaCheckbox, oriscusCheckbox].forEach((e) =>
            e.setUnchecked(),
        );
        finalisInputBox.setValue("");
        textInputBox.setValue("");
        melodicPatternSearch.reset();

        melismaHighlight.setUnchecked();
        verovioRendition.setChecked();
        [titleComboBox, sourceComboBox, cantusIdComboBox].forEach((e) =>
            e.reset(),
        );
    }

    /**
     * @param {KeyboardEvent} e
     */
    function searchOnEnter(e) {
        if (e.key == "Enter") {
            searchButton.click();
        }
    }
</script>

<div id="search-panel-grid" class="grid md:grid-cols-2 lg:grid-cols-[2fr_3fr] xl:grid-cols-[1fr_3fr]">
    <!-- Start of leftside search panel -->
    <div id="search-filters">
        <Section id="search-filters">
            <h1>Search Filters</h1>
            <!-- Search by music script (notation type) -->
            <p>Filter chants with the following music script(s):</p>
            <Checkbox value="aquitanian" bind:this={aquitanianCheckbox}
                >Aquitanian</Checkbox
            >
            <Checkbox value="square" bind:this={squareCheckbox}>Square</Checkbox
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

            <MelodicPatternSearch
                bind:this={melodicPatternSearch}
                onKeydown={searchOnEnter}
            />

            <hr />

            <!-- Search by finalis -->
            <p>
                Filter chants by finalis (the last note)
                <Tooltip>
                    {#snippet title()}
                        <p>Finalis filter</p>
                    {/snippet}
                    {#snippet content()}
                        <div>
                            Filter chants by their finalis (last note) by
                            entering <b>a pitch value</b>
                            (from "a" to "g") for chants in square notes or
                            <b>a location value</b> (from "-3" to "+4") for chants
                            in Aquitanian neumes.
                        </div>
                    {/snippet}
                </Tooltip>
            </p>

            <TextInput
                id="finalis-input-box"
                placeholder="e.g.: '-1' or 'a'"
                onKeydown={searchOnEnter}
                bind:this={finalisInputBox}
            />
            <!-- Metadata search filter -->
            <hr />
            <p>
                Filter chants by metadata <br /><i>
                    (Title, Source, Cantus ID)</i
                >
            </p>
            <SelectInput
                bind:this={titleComboBox}
                id="title-dropdown-filter"
                placeholder={`Title - e.g., "Benedictus"`}
                allOptions={[
                    ...new Set(
                        listOfChants.map(
                            (/** @type {Chant} */ chant) => chant.title,
                        ),
                    ),
                ]}
                onKeydown={searchOnEnter}
            />

            <SelectInput
                bind:this={sourceComboBox}
                id="source-dropdown-filter"
                placeholder={`Source - e.g., "P-BRs Ms. 034"`}
                allOptions={[
                    ...new Set(
                        listOfChants.map(
                            (/** @type {Chant} */ chant) => chant.source,
                        ),
                    ),
                ]}
                onKeydown={searchOnEnter}
            />

            <SelectInput
                bind:this={cantusIdComboBox}
                id="cantusid-dropdown-filter"
                placeholder={`Cantus ID - e.g.: "g00398"`}
                allOptions={[
                    ...new Set(
                        listOfChants.map(
                            (/** @type {Chant} */ chant) => chant.cantusId,
                        ),
                    ),
                ]}
                onKeydown={searchOnEnter}
            />

            <hr />

            <!-- Search by finalis -->
            <p>
                Filter chants by text
                <Tooltip>
                    {#snippet title()}
                        <p>Text filter</p>
                    {/snippet}
                    {#snippet content()}
                        <div>
                            This filter searches for chants that contain the
                            text input by the user. Note that, this filter is:
                            <ul>
                                <li>
                                    Case insensitive (e.g., <code>BENE</code>
                                    is the same as <code>bene</code>)
                                </li>
                                <li>
                                    Space sensitive (e.g., <code>te om</code>
                                    will search for all occurrences of
                                    <b>"te om"</b> with the space)
                                </li>
                            </ul>
                        </div>
                    {/snippet}
                </Tooltip>
            </p>

            <TextInput
                id="text-input-box"
                placeholder="e.g.: 'dominici'"
                onKeydown={searchOnEnter}
                bind:this={textInputBox}
            />

            <hr />

            <!-- Search, Reset, and Clear Results buttons -->
            <Button
                id="search-btn"
                onClick={searchButtonAction}
                bind:this={searchButton}
            >
                Search
            </Button>
            <Button id="reset-search-button" onClick={loadDefaultOptions}>
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
            <Checkbox value="custom-gabc" bind:this={customGABCCheckbox}>
                Show pitch/location with each syllable
            </Checkbox>
            <br />
            <Checkbox
                value="aquitanian-pitch"
                bind:this={aquitanianPitchCustomGABC}
            >
                Show Aquitanian in pitch value (only available for chants with
                detected mode)
            </Checkbox>
            <hr />
            <Checkbox value="veriovio-rendition" bind:this={verovioRendition}>
                Enable modern rendition of chants (Verovio)
            </Checkbox>
            <hr />
            <!-- Search/filter by mode -->
            <!-- <p>Filter by detected mode(s):</p>
            <div class="grid grid-flow-row grid-cols-2 gap-1 align-left">
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
            <hr /> -->
            <!-- </div> -->
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
    </div>
</div>
