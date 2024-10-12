<script>
    /* NOTE: due to limited compatibility on certain device (e.g., Safari on iOS), Popover API might not work as expected */
    import Button from "./Button.svelte";
    export let id;
    let popovertarget = `${id}-tooltip-popover`,
        popover;

    function hidePopover() {
        popover.hidePopover();
    }
</script>

<button id={`${id}-button`} {popovertarget}> ⓘ </button>

<div id={popovertarget} popover bind:this={popover} class="tooltip">
    <div class="tooltip-content">
        <div>
            <slot />
        </div>
        <Button id={`${id}-tooltip-close-button`} onClick={hidePopover}>
            Close
        </Button>
    </div>
</div>

<style>
    button {
        color: white;
        font-weight: 900;
        cursor: pointer;
        background-color: var(--button);
        padding: 0.1rem 0.5rem;
        border-radius: 1rem;
        border: 0;
        transition: background-color 0.3s;
        margin: 0 0.3rem;
    }

    button:hover {
        background-color: var(--button-hover);
    }

    .tooltip {
        position: absolute;
        z-index: 10;
        width: 80%;
        padding: 2rem;
        background-color: var(--background);
        border: 4px solid var(--button);
        border-radius: 0.5rem;
        margin: 10rem;
    }

    .tooltip-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
</style>
