<script>
    export let id;
    let popovertarget = `${id}-tooltip`;
</script>

<button
    {id}
    {popovertarget}
>
    ⓘ
</button>

<div class="tooltip-content" id={popovertarget} popover>
    <slot/>
</div>

<style>
    button {
        color: white;
        font-weight: bold;
        cursor: pointer;
        background-color: var(--button);
        padding: 0.1rem 0.5rem;
        border-radius: 0.5rem;
    }

    .tooltip-content {
        padding: 2rem;
        margin: 8rem;
        background-color: var(--background);
        border: 4px solid var(--button);
        border-radius: 0.5rem;
        width: 80%;
    }
</style>
