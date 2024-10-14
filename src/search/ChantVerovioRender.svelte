<script>
    import { drawSVGFromMEIContent, spotlightText } from "@utility/utils";
    import { Chant, Syllable, NeumeComponent } from "@utility/components";
    import {
        highlightPattern,
    } from "@utility/utils";
    import { onMount } from "svelte";

    /** @type {Chant} */
    export let chant;
    /** @type {{
        melodicPatternNc: NeumeComponent[][],
        melismaPatternSyl: Syllable[]
    }}
    */
    export let highlightOptions;

    function highlightOnChant() {
        let melodicPattern = highlightOptions.melodicPatternNc;
        for (let pattern of melodicPattern) {
            highlightPattern(pattern);
        }
    }

    function highlightMelismaOnChant() {
        let melismaPattern = highlightOptions.melismaPatternSyl;
        melismaPattern.forEach((mp) => {
            spotlightText(mp.syllableWord)
        })
    }

    let svg, error;
    onMount(async () => {
        await drawSVGFromMEIContent(chant.meiContent)
            .then((chantSVG) => {
                // Set the chant to display
                svg = chantSVG;
            })
            .then(() => {
                highlightOnChant();
                highlightMelismaOnChant();
            })
            .catch((err) => {
                error = err;
            });
    });
</script>

<div>
    {@html svg}
    {#if error}
        <hr />
        {error}
    {/if}
</div>

<style>
    div {
        box-shadow: 0 0 2px 3px #888;
    }
</style>
