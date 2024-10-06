<script>
    import { drawSVGFromMEIContent, spotlightPattern, spotlightText } from "../../utility/utils";
    import { Chant, Syllable, NeumeComponent } from "../../utility/components";
    import {
        highlightPattern,
        highlightSvgElementById,
    } from "../../utility/utils";
    import { onMount } from "svelte";

    /** @type {Chant} */
    export let chant;
    /** @type {{
        melodicPattern: NeumeComponent[][],
        melismaPattern: Syllable[]
    }}
    */
    export let highlightOptions;

    function highlightOnChant() {
        let melodicPattern = highlightOptions.melodicPattern;
        for (let pattern of melodicPattern) {
            highlightPattern(pattern);
        }
    }

    function highlightMelismaOnChant() {
        let melismaPattern = highlightOptions.melismaPattern;
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
