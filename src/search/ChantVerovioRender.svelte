<script>
    import { spotlightText } from "@utility/utils";
    import { Chant } from "@utility/components";
    import { highlightPattern } from "@utility/utils";
    import { onMount } from "svelte";
    import createVerovioModule from "verovio/wasm";
    import { VerovioToolkit } from "verovio/esm";

    /**
     * @typedef {Object} Props
     * @property {Chant} chant
     * @property {any} highlightOptions
     */

    /** @type {Props} */
    let { chant, highlightOptions } = $props();

    function highlightOnChant() {
        let melodicPattern = highlightOptions.melodicPatternNc;
        for (let pattern of melodicPattern) {
            highlightPattern(pattern);
        }
    }

    function highlightMelismaOnChant() {
        let melismaPattern = highlightOptions.melismaPatternSyl;
        melismaPattern.forEach((mp) => {
            spotlightText(mp.syllableWord);
        });
    }
    let verovioToolkit = $state(async () => {
        createVerovioModule().then((VerovioModule) => {
            // This line initializes the Verovio toolkit
            verovioToolkit = new VerovioToolkit(VerovioModule);
        });
    });

    /**
     * Draw the MEI content to the screen
     * @async
     * @param {MEI_FileContent} meiContent file content of the MEI file
     * @returns {SVGElement} SVG content of the MEI file
     */
    async function drawSVGFromMEIContent(meiContent) {
        let svg;
        try {
            /** @type {SVGElement} */
            await createVerovioModule().then((VerovioModule) => {
                // This line initializes the Verovio toolkit
                verovioToolkit = new VerovioToolkit(VerovioModule);

                const client = document.documentElement.clientWidth;
                verovioToolkit.setOptions({
                    footer: "none",
                    pageWidth: client,
                    adjustPageHeight: true,
                    adjustPageWidth: true,
                    scale: 60,
                    shrinkToFit: true,
                    breaks: "line",
                });
                verovioToolkit.loadData(meiContent);

                svg = verovioToolkit.renderToSVG(1);
            });
        } catch (error) {
            console.error(error);
            console.log("Please reload the page and try again.");
            throw new Error(
                `Please reload the page and try again. Error(s): ${error}.`,
            );
        }
        return svg;
    }

    let svg = $state(),
        error = $state();
    onMount(async () => {
        await drawSVGFromMEIContent(chant.meiContent)
            .then((chantSVG) => {
                // Set the chant to display
                svg = chantSVG;
                console.log("Chant SVG loaded");
            })
            .then(() => {
                highlightOnChant();
                highlightMelismaOnChant();
            })
            .catch((err) => {
                console.error(err);

                error = err;
            });
    });
</script>

<div class="shadow-md box-border rounded-md p-2 border-2 border-emerald-100">
    {@html svg}
    {#if error}
        <hr />
        {error}
    {/if}
</div>
