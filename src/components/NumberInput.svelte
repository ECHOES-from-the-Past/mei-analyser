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
/>

<style>
    input {
        box-sizing: border-box;
        border: 1px solid var(--button-active);
        font-size: inherit;
        text-align: center;
        margin: 0 0.2rem;
        width: 1.8rem;
        height: 1.8rem;
    }

    input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
</style>
