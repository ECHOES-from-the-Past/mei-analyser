<script>
    /** @type {String} the component id */
    export let id = "button-id";

    /** @type {function} the button's action */
    export let onClick = null;
    export let disabled = false;

    let button;
    export function click() {
        button.click();
    }
</script>

<button id={id} on:click={onClick} bind:this={button} {disabled}>
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
