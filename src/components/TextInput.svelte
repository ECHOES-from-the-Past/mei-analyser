<script>
    export let id;
    export let placeholder = "Input here";
    export let onKeydown;
</script>

<input type="text" {id} {placeholder} on:keydown={onKeydown} />

<style>
    input {
        width: 20rem;
        height: 1.2rem;
        margin: 0.3rem 0;
    }
</style>
