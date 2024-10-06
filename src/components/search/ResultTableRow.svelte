<script>
    import ChantDetails from "./ChantDetails.svelte";
    import ChantVerovioRender from "./ChantVerovioRender.svelte";
    import ExternalLink from "../ExternalLink.svelte";
    import Button from "../Button.svelte";

    import { Chant } from "../../utility/components";
    import {
        processContourMelodicPattern,
        processExactPitchMelodicPattern,
    } from "../../functions/search";
    import { capitalizeFirstLetter } from "../../utility/utils";

    /** @type {Chant} */
    export let chant;

    /** @type {{
        "melodicPatternNc": NeumeComponents[][],
        "melismaPatternSyl": Syllable[],
        "customGABC": {
            enabled: boolean,
            aquitanianPitch: boolean
        },
    }}
     */
    export let rowOptions;

    /* Constructing the text column  */
    let syllablesContent = [];
    let customGABC = [];

    let aquitanianPitchGABC = rowOptions.customGABC.aquitanianPitch;
    let melodicPatterns = rowOptions.melodicPatternNc;

    // let searchPattern = rowOptions.searchPattern.list;
    // let searchMode = rowOptions.searchPattern.mode;
    // if (searchMode == "contour") {
    //     melodicPatterns = processContourMelodicPattern(chant, searchPattern);
    // } else if (searchMode == "exact-pitch") {
    //     melodicPatterns = processExactPitchMelodicPattern(chant, searchPattern);
    // }

    // for (let syllable of chant.syllables) {
    //     // Extract the syllable word and its position from each syllable
    //     let word = syllable.syllableWord.text;
    //     let position = syllable.syllableWord.position;
    //     let ornamentalNC;
    //     for (let nc of syllable.neumeComponents) {
    //         if (nc.ornamental != null) {
    //             ornamentalNC = nc.ornamental.type;
    //             break;
    //         }
    //     }
    //     const wordWrapper = document.createElement("span");

    //     // Construct the text for the syllables
    //     if (ornamentalNC != null) {
    //         wordWrapper.classList.add(ornamentalNC + "-word"); // for CSS styling
    //     }

    //     let melismaEnable = textFormatOptions.melisma.enabled;
    //     let melismaValue = textFormatOptions.melisma.value;
    //     if (melismaEnable) {
    //         // Detect melismas with neume components
    //         let melismaMin = melismaValue;
    //         if (syllable.neumeComponents.length >= melismaMin) {
    //             wordWrapper.classList.add("melisma-word");
    //         }
    //     }

    //     if (melodicPatterns.length > 0) {
    //         for (let pattern of melodicPatterns) {
    //             // compare two list, if there's a match (the same element from both), add the class to the wordWrapper
    //             for (let i = 0; i < pattern.length; i++) {
    //                 for (let j = 0; j < syllable.neumeComponents.length; j++) {
    //                     if (pattern[i] == syllable.neumeComponents[j]) {
    //                         wordWrapper.classList.add("melodic-pattern-word");
    //                     }
    //                 }
    //             }
    //         }
    //     }

    //     wordWrapper.innerText = word;
    //     if (wordWrapper.classList.length > 0) {
    //         word = wordWrapper.outerHTML;
    //     }

    //     const octaveKeys = ["c", "d", "e", "f", "g", "a", "b"];
    //     if (position == "s" || position == "i") {
    //         // standalone or initial syllable
    //         syllablesContent.push(word);
    //         if (chant.notationType == "square") {
    //             customGABC.push(
    //                 `${word}(${syllable.neumeComponents
    //                     .map((nc) => {
    //                         for (let mp of melodicPatterns) {
    //                             if (mp.includes(nc)) {
    //                                 return `<span class="melodic-pattern-word-gabc">${nc.pitch}</span>`;
    //                             }
    //                         }
    //                         return nc.pitch;
    //                     })
    //                     .join("")})`,
    //             );
    //         } else if (chant.notationType == "aquitanian") {
    //             if (aquitanianPitchGABC && chant.clef.shape != null) {
    //                 const clef = chant.clef.shape;
    //                 const gap = octaveKeys.indexOf(clef.toLowerCase());
    //                 customGABC.push(
    //                     `${word}(${syllable.neumeComponents
    //                         .map((nc) => {
    //                             let outNc = octaveKeys.at(
    //                                 (nc.loc + 7 + gap) % 7,
    //                             );
    //                             for (let mp of melodicPatterns) {
    //                                 if (mp.includes(nc)) {
    //                                     return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
    //                                 }
    //                             }
    //                             return outNc;
    //                         })
    //                         .join("")})`,
    //                 );
    //             } else if (!aquitanianPitchGABC) {
    //                 customGABC.push(
    //                     `${word}(${syllable.neumeComponents
    //                         .map((nc) => {
    //                             let outNc = nc.loc;
    //                             for (let mp of melodicPatterns) {
    //                                 if (mp.includes(nc)) {
    //                                     return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
    //                                 }
    //                             }
    //                             return outNc;
    //                         })
    //                         .join("")})`,
    //                 );
    //             }
    //         }
    //     } else if (position == "m" || position == "t") {
    //         // medial syllable, add to the last syllable
    //         // terminal syllable, add to the last syllable
    //         syllablesContent[syllablesContent.length - 1] += word;
    //         if (chant.notationType == "square") {
    //             customGABC[customGABC.length - 1] +=
    //                 `${word}(${syllable.neumeComponents
    //                     .map((nc) => {
    //                         for (let mp of melodicPatterns) {
    //                             if (mp.includes(nc)) {
    //                                 return `<span class="melodic-pattern-word-gabc">${nc.pitch}</span>`;
    //                             }
    //                         }
    //                         return nc.pitch;
    //                     })
    //                     .join("")})`;
    //         } else if (chant.notationType == "aquitanian") {
    //             if (aquitanianPitchGABC && chant.clef.shape != null) {
    //                 const clef = chant.clef.shape;
    //                 const gap = octaveKeys.indexOf(clef.toLowerCase());
    //                 customGABC[customGABC.length - 1] +=
    //                     `${word}(${syllable.neumeComponents
    //                         .map((nc) => {
    //                             let outNc = octaveKeys.at(
    //                                 (nc.loc + 7 + gap) % 7,
    //                             );
    //                             for (let mp of melodicPatterns) {
    //                                 if (mp.includes(nc)) {
    //                                     return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
    //                                 }
    //                             }
    //                             return outNc;
    //                         })
    //                         .join("")})`;
    //             } else if (!aquitanianPitchGABC) {
    //                 customGABC[customGABC.length - 1] +=
    //                     `${word}(${syllable.neumeComponents
    //                         .map((nc) => {
    //                             let outNc = nc.loc;
    //                             for (let mp of melodicPatterns) {
    //                                 if (mp.includes(nc)) {
    //                                     return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
    //                                 }
    //                             }
    //                             return outNc;
    //                         })
    //                         .join("")})`;
    //             }
    //         }
    //     }
    // }

    function processNeumeComponents(
        neumeComponents,
        melodicPatterns,
        clefGap = null,
    ) {
        return neumeComponents
            .map((nc) => {
                let outNc =
                    clefGap !== null
                        ? octaveKeys.at((nc.loc + 7 + clefGap) % 7)
                        : nc.pitch;
                for (let mp of melodicPatterns) {
                    if (mp.includes(nc)) {
                        return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
                    }
                }
                return outNc;
            })
            .join("");
    }

    const octaveKeys = ["c", "d", "e", "f", "g", "a", "b"];
    const melismaEnable = rowOptions.melisma.enabled;
    const melismaMin = rowOptions.melisma.value;
    const clefGap =
        chant.clef && chant.clef.shape
            ? octaveKeys.indexOf(chant.clef.shape.toLowerCase())
            : null;

    for (let syllable of chant.syllables) {
        let word = syllable.syllableWord.text;
        let position = syllable.syllableWord.position;

        let ornamentalNC =
            syllable.neumeComponents.find((nc) => nc.ornamental)?.ornamental
                .type || null;
        const wordWrapper = document.createElement("span");

        // Apply CSS classes for ornamental and melisma
        if (ornamentalNC) wordWrapper.classList.add(`${ornamentalNC}-word`);
        if (melismaEnable && syllable.neumeComponents.length >= melismaMin) {
            wordWrapper.classList.add("melisma-word");
        }

        // Check for melodic patterns
        for (let pattern of melodicPatterns) {
            if (syllable.neumeComponents.some((nc) => pattern.includes(nc))) {
                wordWrapper.classList.add("melodic-pattern-word");
                break; // No need to check further patterns
            }
        }

        wordWrapper.innerText = word;
        if (wordWrapper.classList.length > 0) word = wordWrapper.outerHTML;

        // Generate customGABC based on position and notation type
        if (position === "s" || position === "i") {
            syllablesContent.push(word);

            const neumeComponentText = processNeumeComponents(
                syllable.neumeComponents,
                melodicPatterns,
                clefGap,
            );

            if (chant.notationType === "square") {
                customGABC.push(`${word}(${neumeComponentText})`);
            } else if (chant.notationType === "aquitanian") {
                customGABC.push(`${word}(${neumeComponentText})`);
            }
        } else if (position === "m" || position === "t") {
            // Append to the last syllable for medial or terminal positions
            syllablesContent[syllablesContent.length - 1] += word;

            const neumeComponentText = processNeumeComponents(
                syllable.neumeComponents,
                melodicPatterns,
                clefGap,
            );

            if (chant.notationType === "square") {
                customGABC[customGABC.length - 1] +=
                    `${word}(${neumeComponentText})`;
            } else if (chant.notationType === "aquitanian") {
                customGABC[customGABC.length - 1] +=
                    `${word}(${neumeComponentText})`;
            }
        }
    }

    let tdSyllables = syllablesContent.join(" ");

    let customGABCDiv = document.createElement("div");
    customGABCDiv.classList.add("custom-gabc");
    customGABCDiv.innerHTML = "<hr>" + customGABC.join(" ");

    // Extract the melisma pattern for hightlighting on chant
    let melismaPatterns = [],
        melismaOptions = rowOptions.melisma;

    if (melismaOptions.enabled) {
        let melismaMin = melismaOptions.value;
        for (let syllable of chant.syllables) {
            if (syllable.neumeComponents.length >= melismaMin) {
                melismaPatterns.push(syllable);
            }
        }
    }

    /**
     * Display the chant's information to the screen
     * @param {Chant} chant the chant which information is to be extracted and printed
     */
    async function printChantInformation(chant) {
        let chantInfoDiv = document.getElementById("chant-info");
        chantInfoDiv.innerHTML = "";
        new ChantDetails({
            target: chantInfoDiv,
            props: {
                chant: chant,
            },
        });

        let chantSVGDiv = document.getElementById("chant-svg");
        chantSVGDiv.innerHTML = "";
        new ChantVerovioRender({
            target: chantSVGDiv,
            props: {
                chant: chant,
                highlightOptions: {
                    melodicPattern: melodicPatterns,
                    melismaPattern: melismaPatterns,
                },
            },
        });

        // Add a little delay for Verovio to render the chant
        setTimeout(() => {
            const chantDisplay = document.getElementById("chant-display");
            chantDisplay.scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "nearest",
            });
        }, 300);
    }
</script>

<tr>
    <!-- Title column -->
    <td>
        {chant.title}
    </td>
    <!-- Music Script column -->
    <td>
        {capitalizeFirstLetter(chant.notationType)}
    </td>
    <!-- Text column -->
    <td>
        {@html tdSyllables}
        {#if rowOptions.customGABC.enabled}
            {@html customGABCDiv.outerHTML}
        {/if}
    </td>
    <!-- Source column -->
    <td>
        {chant.source}
    </td>
    <!-- Options column -->
    <td>
        <div id="options">
            <Button onClick={() => printChantInformation(chant)}>
                Display chant
            </Button>
            {#each chant.pemDatabaseUrls as url}
                <ExternalLink href={url}>
                    <Button>View image on PEM</Button>
                </ExternalLink>
            {/each}
        </div>
    </td>
</tr>

<style>
    tr > td {
        display: table-cell;
        text-align: center;
        padding: 0.5rem;
        border: 1px solid hsla(142, 72%, 29%, 0.699);
        height: inherit;
    }

    #options {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
</style>
