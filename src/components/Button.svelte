<script>
    /** @type {String} the component id */
    export let id;
    export let nonselectable;

    /** @type {function} the button's action */
    export let onClick;
    // let checked = localStorage.getItem(id) == null ? true : false;

    let button;
    export function click() {
        button.click();
    }
</script>

<button id={id} nonselectable={nonselectable} on:click={onClick} bind:this={button}>
    <slot/>
</button>

<style>
    * {
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
