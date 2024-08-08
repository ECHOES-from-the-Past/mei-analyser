<script>
    /** @type {String} the component id */
    export let id;
    export let nonselectable;

    /** @type {function} the button's action */
    export let onClick;
    export let disabled;

    let button;
    export function click() {
        button.click();
    }
</script>

<button id={id} nonselectable={nonselectable} on:click={onClick} bind:this={button} {disabled}>
    <slot/>
</button>

<style>
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
