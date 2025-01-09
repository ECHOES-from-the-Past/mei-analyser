<script>
    import { persist, retrieve } from "../utility/utils";

    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {string} [placeholder]
     * @property {any} onKeydown
     * @property {any} min
     * @property {any} max
     * @property {any} [value]
     */

    /** @type {Props} */
    let {
        id = "textbox",
        placeholder = "Input here",
        onKeydown,
        min,
        max,
        value = $bindable(retrieve(id)),
    } = $props();

    function handleInputChanges() {
        persist(id, value);
    }

    export function getValue() {
        return value;
    }
</script>

<input
    type="number"
    {id}
    {placeholder}
    {min}
    {max}
    bind:value
    oninput={handleInputChanges}
    onkeydown={onKeydown}
    aria-describedby="number-input"
    data-input-counter
/>

<style lang="postcss">
    input {
        @apply box-border border-2 border-emerald-600 rounded-md py-1 m-auto text-center;
    }
</style>
