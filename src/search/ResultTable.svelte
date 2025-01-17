<script>
    /*
     * The result table takes in **a list of chants** as prop and construct everything there.
     * Filters and such are processed in the Search Panel.
     *
     * Each chant/element of the chant list (called `chantList`) is the input to a ResultTableRow component.
     */
    import { SearchResult } from "@utility/components";
    import ResultTableRow from "@search/ResultTableRow.svelte";

    let tableHeaders = ["Title", "Music Script", "Text", "Source", "Options"];

    /**
     * @typedef {Object} Props
     * @property {SearchResult[]} searchResult
     * @property {any} otherOptions - See ResultTableRow::otherOptions
     */

    /** @type {Props} */
    let { searchResult, otherOptions } = $props();

    let numberOfResult = $derived(searchResult.length);
</script>

<div>
    <p>Found <b>{numberOfResult}</b> chants from the search options.</p>

    {#if numberOfResult > 0}
        <table id="result-table" class="w-full break-normal table-auto mt-4">
            <thead>
                <tr>
                    {#each tableHeaders as th}
                        <th
                            scope="col"
                            class="text-center bg-emerald-700 text-white p-2 font-semibold border-x-2 border-emerald-900"
                        >
                            {th}
                        </th>
                    {/each}
                </tr>
            </thead>

            <tbody>
                {#each searchResult as sr}
                    <ResultTableRow
                        chant={sr.chant}
                        melodicPatternNc={sr.melodicPatternNc}
                        {otherOptions}
                    />
                {/each}
            </tbody>
        </table>
    {/if}
</div>
