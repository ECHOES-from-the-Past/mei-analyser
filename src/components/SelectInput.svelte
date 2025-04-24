<script>
  import { Combobox } from "bits-ui";

  /**
   * @typedef {Object} Props
   * @property {string} [placeholder] - export let id = "search-dropdown";
   * @property {any} [allOptions]
   */

  /** @type {Props} */
  let {
    id,
    allOptions = ["Placeholder 1", "Placeholder 2"],
    placeholder = "input-something-here",
    onKeydown,
  } = $props();

  let inputValue = $state("");
  let selection = $state("");
  let availableOptions = $state(allOptions);
  let displayOptions = $derived(availableOptions.slice(0, 8));

  $effect(() => {
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

  function setInputValue(newValue) {
    inputValue = newValue;
  }

  export function reset() {
    inputValue = "";
  }
</script>

<Combobox.Root
  name="combobox"
  {id}
  bind:value={getInputValue, setInputValue}
  type="single"
  allowDeselect="true"
>
  <!-- Input field of the combobox -->
  <!-- TODO: onKeydown still ignores the selection on first try -->
  <Combobox.Input
    {placeholder}
    aria-label={placeholder}
    class="w-full border-2 border-emerald-600 rounded-md px-2 py-1 my-1"
    oninput={(e) => {
      inputValue = e.currentTarget.value;
    }}
    onkeydown={(e) => {
      if (e.key == "Enter") {
        if (selection != inputValue && selection != "") {
          inputValue = selection;
        }
      }
      onKeydown(e);
    }}
  />

  <Combobox.Portal>
    <Combobox.Content
      align="start"
      class="transition-all ease-in-out w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)] border border-emerald-800 bg-gray-50 px-1 py-2 rounded-md shadow-lg"
    >
      <!-- Available options -->
      {#if availableOptions.length > 0}
        <!-- displayOptions is derrived value of avaiableOptions -->
        {#each [inputValue, ...displayOptions] as option}
          <Combobox.Item
            value={option}
            label={option}
            class="flex h-10 w-full select-none items-center py-3 px-1 transition-all data-[highlighted]:bg-emerald-300 border-b border-emerald-500"
            onkeydown={() => {
              selection = option;
            }}
          >
            {option}
          </Combobox.Item>
        {/each}
        <span class="block italic px-5 py-2 text-sm text-emerald-700">
          and more...
        </span>
      {:else}
        <span class="block px-5 py-2 text-sm text-gray-500">
          No results found
        </span>
      {/if}
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>
