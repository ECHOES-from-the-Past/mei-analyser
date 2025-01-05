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

<style lang="postcss">
    /* Default button styles */
    button {
        @apply border-0 rounded-lg text-white py-2 px-4 font-medium bg-emerald-800;
        @apply cursor-pointer transition ease-in-out duration-300;

        @apply hover:bg-emerald-600;
        @apply active:bg-emerald-700;
        @apply disabled:bg-gray-400 disabled:cursor-not-allowed;
    }
</style>
