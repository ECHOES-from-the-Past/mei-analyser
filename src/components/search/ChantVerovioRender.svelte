<script>
    import { drawSVGFromMEIContent } from "../../utility/utils";
    import { Chant } from "../../utility/components";
    import { highlightPattern } from "../../utility/utils";

    /** @type {Chant} */
    export let chant;
    /** @type {{
        melodicPattern: neumeComponents[][],
        melismaPattern: neumeComponents[]
        }}}*/
    export let highlightOptions;

    function highlightOnChant() {
        let melodicPattern = highlightOptions.melodicPattern;
        for (let pattern of melodicPattern) {
            highlightPattern(pattern);
        }
    }
</script>

<div>
    {#await drawSVGFromMEIContent(chant.meiContent)}
        <p>Loading MEI Content and letting Verovio render the chant</p>
    {:then svg}
        {@html svg}
    {:catch error}
        <p>Something went wrong, please try to reload the page!</p>
        <p>Error: {error.message} b</p>
    {/await}
</div>

<style>
    div {
        box-shadow: 0 0 2px 3px #888;
    }
</style>
