<script>
    import { persist, retrieve } from "../utility/utils";
    export let id = "textbox";
    export let placeholder = "Input here";
    export let onKeydown;

    let value = retrieve(id);

    function handleInputChanges() {
        persist(id, value);
    }
</script>

<input
    type="text"
    {id}
    {placeholder}
    bind:value
    on:input={handleInputChanges}
    on:keydown={onKeydown}
/>

<style>
    input {
        width: 20rem;
        height: 1.2rem;
        margin: 0.3rem 0;
    }
</style>
