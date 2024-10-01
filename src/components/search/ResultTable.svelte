<script>
    /*
     * The result table takes in **a list of chants** as prop and construct everything there.
     * Filters and such are processed in the Search Panel.
     *
     * Each chant/element of the chant list (called `chantList`) is the input to a ResultTableRow component.
     */
    import { Chant } from "../../utility/components";
    import ResultTableRow from "./ResultTableRow.svelte";

    let tableHeaders = ["Title", "Music Script", "Text", "Source", "Options"];

    /** @type {Chant[]} */
    export let chantList;

    $: numberOfResult = chantList.length;

    import {
        processContourMelodicPattern,
        processExactPitchMelodicPattern,
    } from "../../functions/search";

    /** @type {Chant} */
    export let chant;

    /** @type {{
        "searchPattern": {
            list: string[] | number [],
            mode: string,
        },
        "melisma": {
            enabled: boolean,
            value: number,
        },
        "customGABC": {
            enabled: boolean,
            aquitanianPitch: boolean
        },
    }}
    */
    export let textFormatOptions;

    /** Regular expression to match the file name format
     * - Pattern: 3 digits, an underscore, a letter, and 2 digits
     * - Example: 092_F26
     * @type {RegExp}
     * */
    const fileNameRegex = /\d{3}_\w{1}\d{2}/;

    /* Constructing the text column  */
    let syllablesContent = [];
    let customGABC = [];

    let aquitanianPitchGABC = textFormatOptions.customGABC.aquitanianPitch;
    let searchPattern = textFormatOptions.searchPattern.list;
    let searchMode = textFormatOptions.searchPattern.mode;

    let melodicPatterns = [];
    if (searchMode == "contour") {
        melodicPatterns = processContourMelodicPattern(chant, searchPattern);
    } else if (searchMode == "exact-pitch") {
        melodicPatterns = processExactPitchMelodicPattern(chant, searchPattern);
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

        let melismaEnable = textFormatOptions.melisma.enabled;
        let melismaValue = textFormatOptions.melisma.value;
        if (melismaEnable) {
            // Detect melismas with neume components
            let melismaMin = melismaValue;
            if (syllable.neumeComponents.length >= melismaMin) {
                wordWrapper.classList.add("melisma-word");
            }
        }

        if (melodicPatterns.length > 0) {
            for (let pattern of melodicPatterns) {
                // compare two list, if there's a match (the same element from both), add the class to the wordWrapper
                for (let i = 0; i < pattern.length; i++) {
                    for (let j = 0; j < syllable.neumeComponents.length; j++) {
                        if (pattern[i] == syllable.neumeComponents[j]) {
                            wordWrapper.classList.add("melodic-pattern-word");
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
            syllablesContent.push(word);
            if (chant.notationType == "square") {
                customGABC.push(
                    `${word}(${syllable.neumeComponents
                        .map((nc) => {
                            for (let mp of melodicPatterns) {
                                if (mp.includes(nc)) {
                                    return `<span class="melodic-pattern-word-gabc">${nc.pitch}</span>`;
                                }
                            }
                            return nc.pitch;
                        })
                        .join("")})`,
                );
            } else if (chant.notationType == "aquitanian") {
                if (aquitanianPitchGABC && chant.clef.shape != null) {
                    const clef = chant.clef.shape;
                    const gap = octaveKeys.indexOf(clef.toLowerCase());
                    customGABC.push(
                        `${word}(${syllable.neumeComponents
                            .map((nc) => {
                                let outNc = octaveKeys.at(
                                    (nc.loc + 7 + gap) % 7,
                                );
                                for (let mp of melodicPatterns) {
                                    if (mp.includes(nc)) {
                                        return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
                                    }
                                }
                                return outNc;
                            })
                            .join("")})`,
                    );
                } else if (!aquitanianPitchGABC) {
                    customGABC.push(
                        `${word}(${syllable.neumeComponents
                            .map((nc) => {
                                let outNc = nc.loc;
                                for (let mp of melodicPatterns) {
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
            syllablesContent[syllablesContent.length - 1] += word;
            if (chant.notationType == "square") {
                customGABC[customGABC.length - 1] +=
                    `${word}(${syllable.neumeComponents
                        .map((nc) => {
                            for (let mp of melodicPatterns) {
                                if (mp.includes(nc)) {
                                    return `<span class="melodic-pattern-word-gabc">${nc.pitch}</span>`;
                                }
                            }
                            return nc.pitch;
                        })
                        .join("")})`;
            } else if (chant.notationType == "aquitanian") {
                if (aquitanianPitchGABC && chant.clef.shape != null) {
                    const clef = chant.clef.shape;
                    const gap = octaveKeys.indexOf(clef.toLowerCase());
                    customGABC[customGABC.length - 1] +=
                        `${word}(${syllable.neumeComponents
                            .map((nc) => {
                                let outNc = octaveKeys.at(
                                    (nc.loc + 7 + gap) % 7,
                                );
                                for (let mp of melodicPatterns) {
                                    if (mp.includes(nc)) {
                                        return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
                                    }
                                }
                                return outNc;
                            })
                            .join("")})`;
                } else if (!aquitanianPitchGABC) {
                    customGABC[customGABC.length - 1] +=
                        `${word}(${syllable.neumeComponents
                            .map((nc) => {
                                let outNc = nc.loc;
                                for (let mp of melodicPatterns) {
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
    let tdSyllables = syllablesContent.join(" ");

    let customGABCDiv = document.createElement("div");
    customGABCDiv.classList.add("custom-gabc");
    customGABCDiv.innerHTML = "<hr>" + customGABC.join(" ");

    // Extract the melisma pattern for hightlighting on chant
    let melismaPatterns = [],
        melismaOptions = textFormatOptions.melisma;

    if (melismaOptions.enabled) {
        let melismaMin = melismaOptions.value;
        for (let syllable of chant.syllables) {
            if (syllable.neumeComponents.length >= melismaMin) {
                melismaPatterns.push(syllable);
            }
        }
    }
</script>

<div>
    <p>Found <b>{numberOfResult}</b> chants from the search options.</p>

    {#if numberOfResult > 0}
        <table id="result-table">
            <thead>
                {#each tableHeaders as th}
                    <th scope="col"> {th} </th>
                {/each}
            </thead>

            <tbody>
                {#each chantList as chant}
                    <ResultTableRow
                        {chant}
                        title={chant.title}
                        {tdSyllables}
                        source={chant.source}
                        notationType={chant.notationType}
                        pemDatabaseUrls={chant.pemDatabaseUrls}
                    />
                {/each}
            </tbody>
        </table>
    {/if}
</div>

<style>
    #result-table {
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
</style>
