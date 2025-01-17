<script>
    /**
     * @typedef {Object} Props
     * @property {String} [id]
     * @property {function} [onClick]
     * @property {boolean} [disabled]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        id = "button-id",
        onClick = null,
        disabled = false,
        children,
    } = $props();

    let button = $state();
    export function click() {
        button.click();
    }
</script>

<button {id} onclick={onClick} bind:this={button} {disabled}>
    {@render children?.()}
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
