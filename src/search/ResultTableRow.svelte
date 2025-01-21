<script>
    import ChantDetails from "@search/ChantDetails.svelte";
    import ChantVerovioRender from "@search/ChantVerovioRender.svelte";
    import Button from "@components/Button.svelte";

    import { Chant } from "@utility/components";
    import { capitalizeFirstLetter } from "@utility/utils";
    import { Accordion } from "bits-ui";
    import AnalysisChart from "./AnalysisChart.svelte";
    import { fly, slide, fade } from "svelte/transition";

    /**
     * @typedef {Object} Props
     * @property {Chant} chant
     * @property {NeumeComponents[][]} melodicPatternNc
     * @property {any} otherOptions
     */

    /** @type {Props} */
    let { chant, melodicPatternNc, otherOptions } = $props();

    let moreDetails = $state(false);

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

    let customGABCDiv = $state(document.createElement("div"));
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

    /* Styling classes */
    const accordionTrigger =
        "flex w-full select-none items-center justify-between py-3 font-medium transition-all hover:bg-emerald-200";

    const accordionItem = "group border-b-2 border-gray-300 p-1";

    const accordionContent = "";
</script>

<tr transition:fly|global>
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
        <div
            id="options"
            class="flex flex-row items-center justify-center gap-x-2"
        >
            <Button
                onClick={() => {
                    moreDetails = !moreDetails;
                }}
            >
                More Details
            </Button>
        </div>
    </td>
</tr>

{#if moreDetails}
    <tr>
        <td colspan="5" transition:fade|global>
            <Accordion.Root type='multiple' forceMount={true} class="w-full">
                <!-- Chant Information -->
                <Accordion.Item value="chant-info" class={accordionItem}>
                    <Accordion.Header>
                        <!-- Title & dropdown button -->
                        <Accordion.Trigger class={accordionTrigger}>
                            <span class="accordion-header">
                                Chant Information
                            </span>
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content forceMount={true}>
                        <div class="flex" transition:slide|global>
                            <ChantDetails {chant} />
                        </div>
                    </Accordion.Content>
                </Accordion.Item>

                <!-- Neume Distribution Chart -->
                <Accordion.Item
                    value="neume-distribution-chart"
                    class={accordionItem}
                >
                    <Accordion.Header>
                        <!-- Title & dropdown button -->
                        <Accordion.Trigger class={accordionTrigger}>
                            <span class="accordion-header">
                                Neume Distribution Chart
                            </span>
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content forceMount={true}>
                        <div class="pb-6" transition:slide|global>
                            <AnalysisChart {chant} />
                        </div>
                    </Accordion.Content>
                </Accordion.Item>

                <!-- Modern rendition -->
                {#if otherOptions.verovioRendition.enabled}
                    <Accordion.Item
                        value="modern-rendition"
                        class={accordionItem}
                    >
                        <!-- Title & dropdown button -->
                        <Accordion.Header>
                            <Accordion.Trigger class={accordionTrigger}>
                                <span class="accordion-header">
                                    Modern Rendition
                                </span>
                            </Accordion.Trigger>
                        </Accordion.Header>
                        <!-- Content: Modern Rendition -->
                        <Accordion.Content forceMount={true} class={accordionContent}>
                            <div class="pb-6" transition:slide|global>
                                <ChantVerovioRender
                                    {chant}
                                    highlightOptions={{
                                        melodicPatternNc: melodicPatternNc,
                                        melismaPatternSyl: melismaPatternSyl,
                                    }}
                                />
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                {/if}
            </Accordion.Root>
        </td>
    </tr>
{/if}

<style lang="postcss">
    .accordion-header {
        @apply w-full text-left font-bold;
    }

    tr {
        @apply table-row;
    }

    tr > td {
        @apply table-cell text-center p-2 border-2 border-emerald-500 w-fit;
    }
</style>
