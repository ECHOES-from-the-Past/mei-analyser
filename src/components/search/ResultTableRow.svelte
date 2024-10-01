<!-- A result table row display information about a chant. -->

<script>
    export let chant;
    export let title;
    export let notationType;
    export let tdSyllables;
    export let source;
    export let pemDatabaseUrls;

    import ChantDetails from "./ChantDetails.svelte";
    import ChantVerovioRender from "./ChantVerovioRender.svelte";

    import ExternalLink from "../ExternalLink.svelte";
    import Button from "../Button.svelte";
    import { Chant } from "../../utility/components";


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
        {title}
    </td>
    <!-- Music Script column -->
    <td>
        {notationType}
    </td>
    <!-- Text column -->
    <td>
        {@html tdSyllables}
        <!-- {#if textFormatOptions.customGABC.enabled}
            {@html customGABCDiv.outerHTML}
        {/if} -->
    </td>
    <!-- Source column -->
    <td>
        {source}
    </td>
    <!-- Options column -->
    <td>
        <div id="options">
            <Button onClick={() => printChantInformation(chant)}
                >Display chant</Button
            >
            {#each pemDatabaseUrls as url}
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
