<script>
  import { persist, retrieve } from "@/utility/utils";
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

  let availableOptions = $state(allOptions);
  let inputValue = $state("");
  let displayOptions = $derived(availableOptions.slice(0,8))

  // $effect(() => {
  //   availableOptions = allOptions.filter((item) => {
  //     // check if item is a list
  //     if (typeof item == "object") {
  //       return item[0].toLowerCase().includes(inputValue.toLowerCase());
  //     }
  //     return item.toLowerCase().includes(inputValue.toLowerCase());
  //   });
  // });

  function filterOptions() {
    availableOptions = allOptions.filter((item) => {
      // // check if item is a list
      // if (typeof item == "object") {
      //   return item[0].toLowerCase().includes(inputValue.toLowerCase());
      // }
      return item.toLowerCase().includes(inputValue.toLowerCase());
    });
  }

  export function getInputValue() {
    return inputValue;
  }

  export function reset() {
    inputValue = "";
  }
</script>

<Combobox.Root type="multiple" name="combobox" {id}>
  <!-- Input field of the combobox -->
  <Combobox.Input
    {placeholder}
    aria-label={placeholder}
    class="w-full border-2 border-emerald-600 rounded-md px-2 py-1 my-1"
    oninput={(e) => {
      inputValue = e.currentTarget.value;
      persist(id, inputValue);
      filterOptions();
    }}
  />

  <Combobox.Portal>
    <Combobox.Content
    class="w-full border border-emerald-800 bg-gray-50 px-1 py-2 rounded-md shadow-lg"
    >
      <Combobox.Viewport>
        {#if availableOptions.length > 0}
          {#each availableOptions as option}
            <Combobox.Item
              value={option}
              label={option}
              class="flex h-10 w-full select-none items-center py-3 px-1 transition-all data-[highlighted]:bg-emerald-300 border-b border-emerald-500"
            >
              {option}
              <Combobox.ItemIndicator asChild={false} />
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
      </Combobox.Viewport>
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>
