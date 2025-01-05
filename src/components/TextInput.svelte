<script>
    import { persist, retrieve } from "../utility/utils";
    export let id = "textbox";
    export let placeholder = "Input here";
    export let onKeydown;
    export let onFocus, onBlur;
    export let autocomplete = "off";

    /**
     * @description
     * Behaviour of the text input box when the user types something in.
     * Able to use getValue() here for spontaneous retrieval of the value
     * without any delays
     * @type {Function}
     */
    export let onInput;

    let value = retrieve(id);

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
    on:focus={onFocus}
    on:blur={onBlur}
    bind:value
    on:input={onInput}
    on:input={handleInputChanges}
    on:keydown={onKeydown}
    autocomplete={autocomplete}
/>

<style lang=postcss>
    input {
        @apply w-full border-2 border-emerald-400 rounded-md p-2 my-2;
        @apply focus-visible:border-emerald-800;
    }

</style>
