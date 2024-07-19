<script>
    export let id;
    export let nonselectable;
</script>

<button id={id} nonselectable={nonselectable}>
    <slot/>
</button>

<style>
    :root {
        --button: hsl(170, 100%, 16%);
        --button-hover: hsla(182, 100%, 20%, 0.753);
        --button-active: hsl(170, 100%, 12%);
        --button-disabled: hsla(172, 38%, 16%, 0.288);
    }

    /* Default button styles */
    button {
        border: 0px;
        border-radius: 8px;
        color: white;
        padding: 0.6rem 1.2rem;
        font-size: 1rem;
        font-weight: 500;
        font-family: inherit;
        background-color: var(--button);
        cursor: pointer;
        transition: background-color 0.2s;
    }

    button:hover {
        background-color: var(--button-hover);
    }

    button:active {
        background-color: var(--button-active);
    }

    button:disabled {
        background-color: var(--button-disabled);
        cursor: not-allowed;
    }
</style>
