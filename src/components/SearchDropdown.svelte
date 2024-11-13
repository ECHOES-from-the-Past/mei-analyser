<script>
    import DropdownMenu from "./DropdownMenu.svelte";
    import TextInput from "./TextInput.svelte";

    /** @type {TextInput} */
    let inputbox;
    let active;

    export let id = "search-dropdown";
    export let placeholder = "input-something-here";

    export let allOptions = ["Placeholder 1", "Placeholder 2"];
    let availableOptions = [];

    function filterOptions() {
        availableOptions = allOptions.filter((item) =>
            item.toLowerCase().includes(inputbox.getValue().toLowerCase()),
        );
    }
</script>

<TextInput
    {id}
    bind:this={inputbox}
    {placeholder}
    onInput={filterOptions}
    onFocus={() => {
        console.log("FOCUS")
        active = true;
    }}
    onBlur={() => {
        active = false;
    }}
    autocomplete="off"
/>
<br />

<!-- <DropdownMenu options={allOptions}>
</DropdownMenu> -->

{#if active}
    <DropdownMenu options={availableOptions} />
{/if}
<!-- {#each allOptions as i}
    {`${i}, `}
{/each}
<br />
{#each availableOptions as i}
    {`${i}, `}
{/each} -->
