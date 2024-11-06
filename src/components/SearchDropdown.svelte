<script>
    import TextInput from "./TextInput.svelte";

    /** @type {TextInput} */
    let inputbox;

    export let id = "search-dropdown";
    export let placeholder = "input-something-here";
    let inputValue;

    export let allOptions = ["Placeholder 1", "Placeholder 2"];

    /**
     *
     * @param {String[]} options
     * @param {String} userinput
     */
    function filterOptions(options, userinput) {
        console.log(options, userinput);

        return options.filter((item) =>
            // item
            item.includes(userinput),
        );
    }

</script>

<TextInput
    {id}
    bind:this={inputbox}
    {placeholder}
    onKeydown={() => {
        filterOptions(allOptions, inputValue);
    }}
/>

{#each allOptions as i}
    {i}
{/each}

