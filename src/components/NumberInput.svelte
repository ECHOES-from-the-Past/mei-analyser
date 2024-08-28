<script>
    import { persist, retrieve } from "../utility/utils";
    export let id = "textbox";
    export let placeholder = "Input here";
    export let onKeydown;
    export let min, max;

    export let value = retrieve(id);

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
    {min} {max}
    bind:value
    on:input={handleInputChanges}
    on:keydown={onKeydown}
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
