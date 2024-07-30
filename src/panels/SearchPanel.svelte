<script>
    import Button from "../components/Button.svelte";
    import Checkbox from "../components/Checkbox.svelte";
    import RadioButton from "../components/RadioButton.svelte";
    import Tooltip from "../components/Tooltip.svelte";
    import Section from "../components/Section.svelte";
    import TextInput from "../components/TextInput.svelte";

    import { persist, retrieve, env } from "../utility/utils";
    import {
        NeumeComponent,
        NeumeComponentSQ,
        toSeptenary,
        Chant,
        getNeumeComponentList,
    } from "../utility/components.js";
    import { onMount } from "svelte";

    // DOM Element binding via `bind:this`
    let aquitanianCheckbox, squareCheckbox;
    let liquescentCheckbox, quilismaCheckbox, oriscusCheckbox;
    let patternInputBox;
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
        // resultChantList = filterByMelodicPattern(resultChantList, patternInputBox.value, getMelodicPatternSearchMode())

        // Display the amount of chants that match the search options

        // searchResultInfo.innerHTML = `Found <b>${resultChantList.length}</b> chants from the search options.`;

        /**
         * Sort chant list by file name
         * Ternary operation explain:
         * - If chantA's file name is "less than" chantB's file name, return -1 to sort chantA before chantB
         * - Otherwise, return 1 to sort chantA after chantB
         */
        // resultChantList.sort((chantA, chantB) =>
        //     chantA.fileName < chantB.fileName ? -1 : 1,
        // );

        /* Return the result */
        console.log(resultChantList);
        return resultChantList;
    }

    /**
     *
     * @param {Chant[]} chantList The list of chants
     * @param {{"aquitanian": boolean, "square": boolean}} musicScripts an array of chant types.
     */
    function filterByMusicScript(chantList, musicScripts) {
        let filteredChantList = chantList.filter((chant) => {
            if (musicScripts.aquitanian && chant.notationType == "aquitanian") {
                return true;
            }
            else if (musicScripts.square && chant.notationType == "square") {
                return true;
            }
            return false;
        });

        return filteredChantList;
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

    /**
     * Using regular expression to process the user's input
     * (from the old parseSearchPattern function)
     * Regex pattern: /-?\d/g
     * - an optional negative `-` sign
     * - a single digit
     *
     * Regex pattern: /[A-Ga-g]/g
     * - all alphabetical letters in range A-G or a-g
     *
     * Search mode options:
     * - `exact-pitch` ~ Square pitch pattern (alphabetical value)
     * - `contour` ~ Aquitanian/Square contour pattern (numerical value)
     * @param {Chant[]} chantList
     * @param {string} searchPattern
     * @param {string} searchMode
     * @returns {Chant[]} list of chants that contains the melodic pattern
     */
    function filterByMelodicPattern(chantList, searchPattern, searchMode) {
        // If search pattern is empty, return the original chant list regardless of the search mode
        if (!searchPattern) {
            return chantList;
        }

        let searchQueryList = [],
            resultChantList = [];

        try {
            searchQueryList = processSearchPattern(searchPattern, searchMode);
        } catch (error) {
            console.error(error);
            patternInputStatus.textContent =
                "Invalid melodic pattern options/input. Please check your search mode selection or query.";
            patternInputStatus.hidden = false;
            return [];
        }

        if (searchQueryList.length === 0) {
            patternInputStatus.hidden = false;
            patternInputStatus.textContent =
                "Invalid melodic pattern options/input. Please check your search mode selection or query.\n";
            patternInputStatus.style.color = "red";
            return [];
        }

        if (searchMode == "contour") {
            for (let chant of chantList) {
                let patterns = processContourMelodicPattern(
                    chant,
                    searchQueryList,
                );
                if (patterns.length > 0) {
                    resultChantList.push(chant);
                }
            }
        } else if (searchMode == "exact-pitch") {
            for (let chant of chantList) {
                if (chant.notationType == "square") {
                    let patterns = processExactPitchMelodicPattern(
                        chant,
                        searchQueryList,
                    );
                    if (patterns.length > 0) {
                        resultChantList.push(chant);
                    }
                }
            }
        } else {
            console.error("Invalid search mode!");
        }

        return resultChantList;
    }

    async function searchButtonAction() {
        // clearSearchResultsAndInfo();

        // // Perform search and display the result
        // refreshWheel.hidden = false;
        let searchResults = await performSearch().then((results) => {
            // refreshWheel.hidden = true;
            return results;
        });
        createResultTable(searchResults);
    }

    /**
     * Show the search result on the screen
     * @param {Chant[]} resultChantList list of chants that match the search query
     */
    async function createResultTable(resultChantList) {
        /** @type {HTMLTableElement} */
        let resultTable = document.createElement("table");
        resultTable.id = "result-table"; // for CSS styling

        // Create the head row of the table
        const tableHeadRows = [
            "Title",
            "Music Script",
            "Text",
            "Source",
            "Links",
        ];
        let headRow = document.createElement("thead");
        for (let headRowElement of tableHeadRows) {
            let th = document.createElement("th");
            th.textContent = headRowElement;
            th.scope = "col";

            headRow.appendChild(th);
        }
        resultTable.appendChild(headRow);

        /**
         * Create the body of the table
         * @type {HTMLTableBodyElement}
         */
        let tbody = document.createElement("tbody");

        /** Regular expression to match the file name format
         * - Pattern: 3 digits, an underscore, a letter, and 2 digits
         * - Example: 092_F26
         * @type {RegExp}
         * */
        const fileNameRegex = /\d{3}_\w{1}\d{2}/;

        /** Constructing the details of the table
         * @type {Chant}
         */
        for (let chant of resultChantList) {
            // create a result row for each chant
            let resultRow = document.createElement("tr");

            let tdNotationType = createTableCell(chant.notationType);
            let tdMode;
            if (chant.mode != -1) {
                tdMode = createTableCell(
                    `${chant.mode} (${displayCertainty(chant.modeCertainty)})`,
                );
            } else {
                tdMode = createTableCell("Unknown");
                tdMode.style.color = "red";
            }

            /* Constructing the text column  */
            let tdSyllablesContent = [];
            let customGABC = [];

            /** In case the word is part of a melodic pattern
             * @type {NeumeComponent[][]}
             * */
            let melodicPattern = [];
            if (contourRadio.isChecked()) {
                melodicPattern = processContourMelodicPattern(
                    chant,
                    processSearchPattern(
                        patternInputBox.value,
                        getMelodicPatternSearchMode(),
                    ),
                );
            } else if (exactPitchRadio.isChecked()) {
                melodicPattern = processExactPitchMelodicPattern(
                    chant,
                    processSearchPattern(
                        patternInputBox.value,
                        getMelodicPatternSearchMode(),
                    ),
                );
            }

            for (let syllable of chant.syllables) {
                // Extract the syllable word and its position from each syllable
                let word = syllable.syllableWord.text;
                let position = syllable.syllableWord.position;
                let ornamentalNC;
                for (let nc of syllable.neumeComponents) {
                    if (nc.ornamental != null) {
                        ornamentalNC = nc.ornamental.type;
                        break;
                    }
                }
                const wordWrapper = document.createElement("span");

                // Construct the text for the syllables
                if (ornamentalNC != null) {
                    wordWrapper.classList.add(ornamentalNC + "-word"); // for CSS styling
                }

                if (melismaEnableCheckbox.isChecked()) {
                    // Detect melismas with neume components
                    let melismaMin = melismaInput.value;
                    if (syllable.neumeComponents.length >= melismaMin) {
                        wordWrapper.classList.add("melisma-word");
                    }
                }

                if (melodicPattern.length > 0) {
                    for (let pattern of melodicPattern) {
                        // compare two list, if there's a match (the same element from both), add the class to the wordWrapper
                        for (let i = 0; i < pattern.length; i++) {
                            for (
                                let j = 0;
                                j < syllable.neumeComponents.length;
                                j++
                            ) {
                                if (
                                    JSON.stringify(pattern[i]) ===
                                    JSON.stringify(syllable.neumeComponents[j])
                                ) {
                                    wordWrapper.classList.add(
                                        "melodic-pattern-word",
                                    );
                                }
                            }
                        }
                    }
                }

                wordWrapper.innerText = word;
                if (wordWrapper.classList.length > 0) {
                    word = wordWrapper.outerHTML;
                }

                const octaveKeys = ["c", "d", "e", "f", "g", "a", "b"];
                if (position == "s" || position == "i") {
                    // standard syllable
                    // initial syllable
                    tdSyllablesContent.push(word);
                    if (chant.notationType == "square") {
                        customGABC.push(
                            `${word}(${syllable.neumeComponents
                                .map((nc) => {
                                    for (let mp of melodicPattern) {
                                        if (mp.includes(nc)) {
                                            return `<span class="melodic-pattern-word-gabc">${nc.pitch}</span>`;
                                        }
                                    }
                                    return nc.pitch;
                                })
                                .join("")})`,
                        );
                    } else if (chant.notationType == "aquitanian") {
                        if (
                            aquitanianPitchCheckbox.isChecked() &&
                            chant.clef.shape != null
                        ) {
                            const clef = chant.clef.shape;
                            const gap = octaveKeys.indexOf(clef.toLowerCase());
                            customGABC.push(
                                `${word}(${syllable.neumeComponents
                                    .map((nc) => {
                                        let outNc = octaveKeys.at(
                                            (nc.loc + 7 + gap) % 7,
                                        );
                                        for (let mp of melodicPattern) {
                                            if (mp.includes(nc)) {
                                                return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
                                            }
                                        }
                                        return outNc;
                                    })
                                    .join("")})`,
                            );
                        } else if (!aquitanianPitchCheckbox.isChecked()) {
                            customGABC.push(
                                `${word}(${syllable.neumeComponents
                                    .map((nc) => {
                                        let outNc = nc.loc;
                                        for (let mp of melodicPattern) {
                                            if (mp.includes(nc)) {
                                                return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
                                            }
                                        }
                                        return outNc;
                                    })
                                    .join("")})`,
                            );
                        }
                    }
                } else if (position == "m" || position == "t") {
                    // medial syllable, add to the last syllable
                    // terminal syllable, add to the last syllable
                    tdSyllablesContent[tdSyllablesContent.length - 1] += word;
                    if (chant.notationType == "square") {
                        customGABC[customGABC.length - 1] +=
                            `${word}(${syllable.neumeComponents
                                .map((nc) => {
                                    for (let mp of melodicPattern) {
                                        if (mp.includes(nc)) {
                                            return `<span class="melodic-pattern-word-gabc">${nc.pitch}</span>`;
                                        }
                                    }
                                    return nc.pitch;
                                })
                                .join("")})`;
                    } else if (chant.notationType == "aquitanian") {
                        if (
                            aquitanianPitchCheckbox.isChecked() &&
                            chant.clef.shape != null
                        ) {
                            const clef = chant.clef.shape;
                            const gap = octaveKeys.indexOf(clef.toLowerCase());
                            customGABC[customGABC.length - 1] +=
                                `${word}(${syllable.neumeComponents
                                    .map((nc) => {
                                        let outNc = octaveKeys.at(
                                            (nc.loc + 7 + gap) % 7,
                                        );
                                        for (let mp of melodicPattern) {
                                            if (mp.includes(nc)) {
                                                return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
                                            }
                                        }
                                        return outNc;
                                    })
                                    .join("")})`;
                        } else if (!aquitanianPitchCheckbox.isChecked()) {
                            customGABC[customGABC.length - 1] +=
                                `${word}(${syllable.neumeComponents
                                    .map((nc) => {
                                        let outNc = nc.loc;
                                        for (let mp of melodicPattern) {
                                            if (mp.includes(nc)) {
                                                return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
                                            }
                                        }
                                        return outNc;
                                    })
                                    .join("")})`;
                        }
                    }
                }
            }
            let tdSyllables = createTableCellHTML(tdSyllablesContent.join(" "));

            let customGABCDiv = document.createElement("div");
            customGABCDiv.classList.add("custom-gabc");

            customGABCDiv.innerHTML = "<hr>" + customGABC.join(" ");
            customGABCDiv.hidden = !customGABCCheckbox.isChecked();

            tdSyllables.appendChild(customGABCDiv);

            /** @type {HTMLAnchorElement} */
            let pemLinkBtnDiv = document.createElement("div");

            for (let pemUrl of chant.pemDatabaseUrls) {
                let linkButton = document.createElement("button");
                let a = document.createElement("a");
                a.href = pemUrl;
                a.target = "_blank";
                a.style.textDecoration = "none";
                // Wrap a button with the link
                a.appendChild(linkButton);
                linkButton.innerText = "View image on PEM";
                linkButton.style.width = "8.64rem";
                // Add the linked button to the div
                pemLinkBtnDiv.appendChild(a);
            }

            // add the file name of the chant to row cell
            let displayChantBtn = document.createElement("button");
            displayChantBtn.textContent =
                "Display chant " + chant.fileName.match(fileNameRegex);
            displayChantBtn.addEventListener("click", async () => {
                // Display the chant information (file name, notation type, mode, etc.)
                await printChantInformation(chant);

                // Set the box for the chant and draw the chant
                chantSVG.style.boxShadow = "0 0 2px 3px #888";
                chantSVG.innerHTML = await drawSVGFromMEIContent(
                    chant.meiContent,
                );

                chantDisplay.scrollIntoView({ behavior: "smooth" });

                // Highlight search pattern
                let melodicPattern = [];
                if (contourRadio.isChecked()) {
                    melodicPattern = processContourMelodicPattern(
                        chant,
                        processSearchPattern(
                            patternInputBox.value,
                            getMelodicPatternSearchMode(),
                        ),
                    );
                } else if (exactPitchRadio.isChecked()) {
                    melodicPattern = processExactPitchMelodicPattern(
                        chant,
                        processSearchPattern(
                            patternInputBox.value,
                            getMelodicPatternSearchMode(),
                        ),
                    );
                }

                for (let pattern of melodicPattern) {
                    highlightPattern(pattern);
                }

                // Highlight the melisma on the chant
                if (melismaEnableCheckbox.isChecked()) {
                    let melismaMin = melismaInput.value;
                    for (let syllable of chant.syllables) {
                        if (syllable.neumeComponents.length >= melismaMin) {
                            highlightSvgElementById(
                                syllable.syllableWord.id,
                                "var(--melisma-text)",
                                "var(--melisma-background)",
                            );
                        }
                    }
                }
            });

            let tdLinks = createTableCell();
            let tdLinksDiv = document.createElement("div");

            tdLinksDiv.style =
                "display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 0.5rem; font-size: 1rem;";
            tdLinksDiv.appendChild(displayChantBtn);
            tdLinksDiv.appendChild(pemLinkBtnDiv);
            tdLinks.appendChild(tdLinksDiv);

            let tdSource = createTableCell(chant.source);

            let tdTitle = createTableCell(chant.title);

            // In order: title, notation type, mode, source, PEM database URL, file name
            resultRow.appendChild(tdTitle);
            resultRow.appendChild(tdNotationType); // Music script
            resultRow.appendChild(tdMode);
            resultRow.appendChild(tdSyllables);
            resultRow.appendChild(tdSource);
            resultRow.appendChild(tdLinks);
            tbody.appendChild(resultRow);
        }
        resultTable.appendChild(tbody);

        // Append the table to the search-result div
        return resultTable;
    }

    /**
     * Display the chant's information to the screen
     * @param {Chant} chant the chant which information is to be extracted and printed
     */
    async function printChantInformation(chant) {
        chantInfo.innerHTML = "";

        let info = {
            Title: chant.title,
            Source: chant.source,
            "Music script": chant.notationType,
            Mode: chant.mode == -1 ? "Unknown" : chant.mode,
            "Mode Certainty": displayCertainty(chant.modeCertainty),
            "Mode Description": chant.modeDescription,
            "MEI File": chant.fileName,
            "PEM Database URL": chant.pemDatabaseUrls,
        };

        for (let k in info) {
            let p = document.createElement("p");
            if (k == "PEM Database URL") {
                // Special rendering for PEM Database URL
                p.innerHTML = `<b>${k}</b>: `;
                for (let url of info[k]) {
                    let a = document.createElement("a");
                    a.href = url;
                    a.target = "_blank";
                    a.innerText = url;
                    p.appendChild(a);
                    // Add "or" if it is not the last URL
                    if (info[k].indexOf(url) != info[k].length - 1) {
                        p.innerHTML += " or ";
                    }
                }
            } else if (k == "MEI File") {
                // Links to the GitHub MEI files
                p.innerHTML = `<b>${k}</b>: `;
                const rootGABCtoMEI =
                    "https://github.com/ECHOES-from-the-Past/GABCtoMEI/blob/main/";

                let fileName = chant.fileName;
                let a = document.createElement("a");

                a.href = rootGABCtoMEI + fileName;
                a.target = "_blank";
                a.innerText = `${fileName.split("/").pop()} (GitHub)`; // showing the file name only
                p.appendChild(a);
            } else {
                // Default rendering
                p.innerHTML = `<b>${k}</b>: ${info[k]}`;
            }

            chantInfo.appendChild(p);
        }
    }

    /**
     * @param {string} content raw string to be displayed in a table cell
     * @returns {HTMLTableCellElement}
     */
    function createTableCell(content) {
        let td = document.createElement("td");
        td.textContent = content;
        return td;
    }

    /**
     * @param {any} content raw HTML content to be displayed in a table cell
     * @returns {HTMLTableCellElement}
     */
    function createTableCellHTML(content) {
        let td = document.createElement("td");
        td.innerHTML = content;
        return td;
    }

    export function clearSearchResultsAndInfo() {
        // Clear the search result display
        searchResultDiv.innerHTML =
            "<p> Search results will display here. </p>";

        // Clear the display when performing a new search
        chantInfo.innerHTML = "<p> Chant information will display here </p>";
        chantSVG.innerHTML =
            "<p> Click on the chant's file name to display </p>";
        chantSVG.style = ""; // clear the border styling of the chant SVG
    }
</script>

<div id="search-panel">
    <div id="search-panel-grid">
        <!-- Start of leftside search panel -->
        <div id="search-filters">
            <Section>
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
                    bind:this={patternInputBox}
                />
                <p id="pattern-input-status" hidden>
                    Melodic Pattern Search Status
                </p>
                <hr />
                <Button
                    id="search-btn"
                    bind:this={searchButton}
                    onClick={async () => {
                        await performSearch();
                        await searchButtonAction();
                    }}
                >
                    Search
                </Button>
                <br />
            </Section>

            <Section>
                <h3>Other options</h3>
                <Checkbox value="melisma"
                    >Enable <span class="melisma-word"
                        >melisma highlighting</span
                    ></Checkbox
                >
                <p>
                    Melisma(s) with at least
                    <input
                        type="number"
                        id="melisma-input"
                        min="2"
                        max="20"
                        value="6"
                    />
                    notes in a syllable
                </p>
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
        grid-template-columns: 1fr 3fr;
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
