<script>
    import { onMount } from "svelte";
    import DropdownMenu from "./DropdownMenu.svelte";
    import TextInput from "./TextInput.svelte";

    /** @type {TextInput} */
    let inputbox;
    let active;

    export let id = "search-dropdown";
    export let placeholder = "input-something-here";

    export let allOptions = ["Placeholder 1", "Placeholder 2"];
    let availableOptions;

    function filterOptions() {
        availableOptions = allOptions.filter((item) => {
            // check if item is a list
            if (typeof item == "object") {
                return item[0].toLowerCase().includes(inputbox.getValue().toLowerCase());
            }
            return item.toLowerCase().includes(inputbox.getValue().toLowerCase());
        });
    }

    onMount(() => {
        availableOptions = allOptions;
    });
</script>

<TextInput
    {id}
    bind:this={inputbox}
    {placeholder}
    onInput={filterOptions}
    onFocus={() => {
        active = true;
    }}
    onBlur={() => {
        active = false;
    }}
    autocomplete="off"
/>
<br />

{#if active}
    <DropdownMenu options={availableOptions} />
{/if}
