<script>
    /*
     * A result table row display information about a chant.
     */

    import ChantDetails from "./ChantDetails.svelte";
    import ChantVerovioRender from "./ChantVerovioRender.svelte";
    import ExternalLink from "../ExternalLink.svelte";
    import Button from "../Button.svelte";

    import { Chant } from "../../utility/components";
    /** @type {Chant} */
    export let chant;

    /** @type {{
        "melodicPattern": [],
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

        // if (melodicPattern.length > 0) {
        //     for (let pattern of melodicPattern) {
        //         // compare two list, if there's a match (the same element from both), add the class to the wordWrapper
        //         for (let i = 0; i < pattern.length; i++) {
        //             for (let j = 0; j < syllable.neumeComponents.length; j++) {
        //                 if (
        //                     JSON.stringify(pattern[i]) ===
        //                     JSON.stringify(syllable.neumeComponents[j])
        //                 ) {
        //                     wordWrapper.classList.add("melodic-pattern-word");
        //                 }
        //             }
        //         }
        //     }
        // }

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
                            // for (let mp of melodicPattern) {
                            //     if (mp.includes(nc)) {
                            //         return `<span class="melodic-pattern-word-gabc">${nc.pitch}</span>`;
                            //     }
                            // }
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
                                // for (let mp of melodicPattern) {
                                //     if (mp.includes(nc)) {
                                //         return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
                                //     }
                                // }
                                return outNc;
                            })
                            .join("")})`,
                    );
                } else if (!aquitanianPitchGABC) {
                    customGABC.push(
                        `${word}(${syllable.neumeComponents
                            .map((nc) => {
                                let outNc = nc.loc;
                                // for (let mp of melodicPattern) {
                                //     if (mp.includes(nc)) {
                                //         return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
                                //     }
                                // }
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
                            // for (let mp of melodicPattern) {
                            //     if (mp.includes(nc)) {
                            //         return `<span class="melodic-pattern-word-gabc">${nc.pitch}</span>`;
                            //     }
                            // }
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
                                // for (let mp of melodicPattern) {
                                //     if (mp.includes(nc)) {
                                //         return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
                                //     }
                                // }
                                return outNc;
                            })
                            .join("")})`;
                } else if (!aquitanianPitchGABC) {
                    customGABC[customGABC.length - 1] +=
                        `${word}(${syllable.neumeComponents
                            .map((nc) => {
                                let outNc = nc.loc;
                                // for (let mp of melodicPattern) {
                                //     if (mp.includes(nc)) {
                                //         return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
                                //     }
                                // }
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

        // Highlight characteristics on the chant when user selects 'Display chant'
        // async () => {
        //     // Highlight search pattern
        //     let melodicPattern = [];
        //     if (contourRadio.isChecked()) {
        //         melodicPattern = processContourMelodicPattern(
        //             chant,
        //             processSearchPattern(
        //                 patternInputBox.value,
        //                 getMelodicPatternSearchMode(),
        //             ),
        //         );
        //     } else if (exactPitchRadio.isChecked()) {
        //         melodicPattern = processExactPitchMelodicPattern(
        //             chant,
        //             processSearchPattern(
        //                 patternInputBox.value,
        //                 getMelodicPatternSearchMode(),
        //             ),
        //         );
        //     }

        //     for (let pattern of melodicPattern) {
        //         highlightPattern(pattern);
        //     }

        //     // Highlight the melisma on the chant
        //     if (melismaEnableCheckbox.isChecked()) {
        //         let melismaMin = melismaInput.value;
        //         for (let syllable of chant.syllables) {
        //             let tdLinks = createTableCell();
        //             if (syllable.neumeComponents.length >= melismaMin) {
        //                 highlightSvgElementById(
        //                     syllable.syllableWord.id,
        //                     "var(--melisma-text)",
        //                     "var(--melisma-background)",
        //                 );
        //             }
        //         }
        //     }
        // };
    }
</script>

<tr>
    <!-- Title column -->
    <td>
        {chant.title}
    </td>
    <!-- Music Script column -->
    <td>
        {chant.notationType}
    </td>
    <!-- Text column -->
    <td>
        {@html tdSyllables}
        {#if textFormatOptions.customGABC.enabled}
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
            <Button onClick={() => printChantInformation(chant)}
                >Display chant</Button
            >
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
