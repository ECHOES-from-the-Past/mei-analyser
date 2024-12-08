<script>
    import ChantDetails from "@search/ChantDetails.svelte";
    import ChantVerovioRender from "@search/ChantVerovioRender.svelte";
    import ExternalLink from "@components/ExternalLink.svelte";
    import Button from "@components/Button.svelte";

    import { Chant } from "@utility/components";
    import { capitalizeFirstLetter } from "@utility/utils";

    /** @type {Chant} */
    export let chant;
    /** @type {NeumeComponents[][]} */
    export let melodicPatternNc;

    /**
     * @type {{
        "melisma": {
            enabled: boolean,
            value: number
        },
        "customGABC": {
            enabled: boolean,
            aquitanianPitch: boolean
        },
        "verovioRendition": {
            enabled: boolean
        }
    }}
    */
    export let otherOptions;

    /* Constructing the text column  */
    let syllablesContent = [];
    let customGABC = [];

    let aquitanianPitchGABC = otherOptions.customGABC.aquitanianPitch;

    for (let syllable of chant.syllables) {
        // Extract the syllable word and its position from each syllable
        let word = syllable.syllableWord.text;
        let position = syllable.syllableWord.position;

        const wordWrapper = document.createElement("span");
        for (let nc of syllable.neumeComponents) {
            if (nc.ornamental != null) {
                // for Ornamental Neume CSS styling
                wordWrapper.classList.add(nc.ornamental.type + "-word");
                break;
            }
        }

        // Construct the text for the syllables
        if (otherOptions.melisma.enabled) {
            // Detect melismas with neume components
            let melismaMin = otherOptions.melisma.value;
            if (syllable.neumeComponents.length >= melismaMin) {
                wordWrapper.classList.add("melisma-word");
            }
        }

        if (melodicPatternNc.length > 0) {
            for (let pattern of melodicPatternNc) {
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
            // standalone or initial syllable
            syllablesContent.push(word);
            if (chant.notationType == "square") {
                customGABC.push(
                    `${word}(${syllable.neumeComponents
                        .map((nc) => {
                            for (let mp of melodicPatternNc) {
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
                                for (let mp of melodicPatternNc) {
                                    if (mp.includes(nc)) {
                                        return `<span class="melodic-pattern-word-gabc">${outNc}</span>`;
                                    }
                                }
                                return outNc;
                            })
                            .join("")})`,
                    );
                } else {
                    customGABC.push(
                        `${word}(${syllable.neumeComponents
                            .map((nc) => {
                                let outNc = nc.loc;
                                for (let mp of melodicPatternNc) {
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
                            for (let mp of melodicPatternNc) {
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
                                for (let mp of melodicPatternNc) {
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
                                for (let mp of melodicPatternNc) {
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
    let melismaPatternSyl = [],
        melismaOptions = otherOptions.melisma;

    if (melismaOptions.enabled) {
        let melismaMin = melismaOptions.value;
        for (let syllable of chant.syllables) {
            if (syllable.neumeComponents.length >= melismaMin) {
                melismaPatternSyl.push(syllable);
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
        if (otherOptions.verovioRendition.enabled) {
            new ChantVerovioRender({
                target: chantSVGDiv,
                props: {
                    chant: chant,
                    highlightOptions: {
                        melodicPatternNc: melodicPatternNc,
                        melismaPatternSyl: melismaPatternSyl,
                    },
                },
            });
        }

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
        {#if otherOptions.customGABC.enabled}
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
            {#each chant.pemUrls as url}
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
