<script>
    import { drawSVGFromMEIContent, spotlightPattern, spotlightSVGElementById } from "../../utility/utils";
    import { Chant, Syllable, NeumeComponent } from "../../utility/components";
    import {
        highlightPattern,
        highlightSvgElementById,
    } from "../../utility/utils";
    import { onMount } from "svelte";

    /** @type {Chant} */
    export let chant;
    /** @type {{
        melodicPattern: NeumeComponents[][],
        melismaPattern: Syllable[]
        }}}*/
    export let highlightOptions;

    function hightlightOnChant() {
        let melodicPattern = highlightOptions.melodicPattern;
        for (let pattern of melodicPattern) {
            highlightPattern(pattern);
        }
    }

    function highlightMelismaOnChant() {
        let melismaPattern = highlightOptions.melismaPattern;
        console.log(melismaPattern);

        spotlightSVGElementById(melismaPattern[0].syllableWord.id)
        // spotlightPattern(
        //     melismaPattern,
        //     "var(--melisma-spotlight-fill)",
        //     "var(--melisma-spotlight-stroke)",
        // );
        // highlightSvgElementById(
        //     syllable.syllableWord.id,
        //     "var(--melisma-text)",
        //     "var(--melisma-background)",
        // );
    }

    let svg, error;
    onMount(async () => {
        await drawSVGFromMEIContent(chant.meiContent)
            .then((chantSVG) => {
                // Set the chant to display
                svg = chantSVG;
            })
            .then(() => {
                hightlightOnChant();
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
