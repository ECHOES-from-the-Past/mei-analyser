<script>
    /*
     * The result table takes in **a list of chants** as prop and construct everything there.
     * Filters and such are processed in the Search Panel.
     *
     * Each chant/element of the chant list (called `chantList`) is the input to a ResultTableRow component.
     */
    import { Chant } from "../../utility/components";
    import ResultTableRow from "./ResultTableRow.svelte";

    let tableHeaders = ["Title", "Music Script", "Text", "Source", "Options"];

    /** @type {Chant[]} */
    export let chantList;

    /**
     * @type {Object} see ResultTableRow::textFormatOptions
     */
    export let textFormatOptions;

    $: numberOfResult = chantList.length;
</script>

<div>
    <p>Found <b>{numberOfResult}</b> chants from the search options.</p>

    {#if numberOfResult > 0}
        <table id="result-table">
            <thead>
                {#each tableHeaders as th}
                    <th scope="col"> {th} </th>
                {/each}
            </thead>

            <tbody>
                {#each chantList as chant}
                    <ResultTableRow {chant} {textFormatOptions}/>
                {/each}
            </tbody>
        </table>
    {/if}
</div>

<style>
    #result-table {
        width: 100%;
        word-break: normal;
    }

    #result-table > thead > th {
        text-align: center;
        background-color: var(--button);
        color: white;
        padding: 0.8rem;
        font-size: 1.2rem;
    }
</style>
