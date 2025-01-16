<script>
    import { persist, retrieve } from "../utility/utils";

    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {string} [placeholder]
     * @property {any} onKeydown
     * @property {any} onFocus
     * @property {any} onBlur
     * @property {string} [autocomplete]
     * @property {Function} onInput
     */

    /** @type {Props} */
    let {
        id = "textbox",
        placeholder = "Input here",
        onKeydown,
        onFocus,
        onBlur,
        autocomplete = "off",
    } = $props();

    let value = $state(retrieve(id)?.value || "");

    function handleInputChanges() {
        persist(id, value);
    }

    export function getValue() {
        return value;
    }

    export function setValue(str) {
        value = str;
        persist(id, value);
    }
</script>

<input
    type="text"
    {id}
    {placeholder}
    onfocus={onFocus}
    onblur={onBlur}
    bind:value={value}
    oninput={() => {
        handleInputChanges();
    }}
    onkeydown={onKeydown}
    {autocomplete}
/>

<style lang="postcss">
    input {
        @apply w-full border-2 border-emerald-600 rounded-md px-2 py-1 my-2;
        @apply focus-visible:border-emerald-800;
    }
</style>
