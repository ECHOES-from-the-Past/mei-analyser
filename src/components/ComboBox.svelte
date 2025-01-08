<script>
    import { run } from "svelte/legacy";

    import { onMount } from "svelte";
    import { Combobox } from "bits-ui";

    let inputbox;
    let inputValue = $state();

    /**
     * @typedef {Object} Props
     * @property {string} [placeholder] - export let id = "search-dropdown";
     * @property {any} [allOptions]
     */

    /** @type {Props} */
    let {
        placeholder = "input-something-here",
        allOptions = ["Placeholder 1", "Placeholder 2"],
    } = $props();
    let availableOptions = $state();

    run(() => {
        availableOptions = allOptions.filter((item) => {
            // check if item is a list
            if (typeof item == "object") {
                return item[0].toLowerCase().includes(inputValue.toLowerCase());
            }
            return item.toLowerCase().includes(inputValue.toLowerCase());
        });
    });

    export function getInputValue() {
        return inputValue;
    }

    export function reset() {
        inputbox.setValue("");
    }

    onMount(() => {
        availableOptions = allOptions;
        console.log(availableOptions);
    });
</script>

<Combobox.Root bind:inputValue items={availableOptions} class="combobox">
    <Combobox.Input
        {placeholder}
        aria-label={placeholder}
        class="w-full border-2 border-emerald-400 rounded-md p-2 my-1"
    />

    <Combobox.Content
        class="w-full border border-emerald-800 bg-white px-1 py-3"
    >
        {#each availableOptions.slice(0, 8) as option}
            <Combobox.Item
                value={option}
                label={option}
                class="flex h-10 w-full select-none items-center rounded-button py-3 px-1 transition-all data-[highlighted]:bg-emerald-600 border-b border-emerald-500"
            >
                {option}
                <Combobox.ItemIndicator asChild={false} />
            </Combobox.Item>
        {:else}
            <span class="block px-5 py-2 text-sm text-gray-500">
                No results found
            </span>
        {/each}
    </Combobox.Content>
</Combobox.Root>

<style>
</style>
