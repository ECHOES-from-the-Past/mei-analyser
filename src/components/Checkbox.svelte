<script>
    import { Checkbox, Label } from "bits-ui";
    import { persist, retrieve } from "../utility/utils";
    import { blur } from "svelte/transition";

    const label = `${value}-label`;
    /**
     * @typedef {Object} Props
     * @property {any} value
     * @property {any} [id]
     * @property {boolean} [disabled]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        value,
        id = `${value}-checkbox`,
        disabled = false,
        children,
    } = $props();

    /** @type {boolean} */
    let check = $state(retrieve(id) == true);

    function update() {
        check = !check;
        persist(id, check);
    }

    export function isChecked() {
        return check;
    }

    export function setChecked() {
        check = true;
        persist(id, check);
    }

    export function setUnchecked() {
        check = false;
        persist(id, check);
    }
</script>

<div class="inline-flex items-center justify-center gap-1">
    <Checkbox.Root
        {id}
        aria-labelledby={label}
        class="flex items-center justify-center rounded-md border border-emerald-800 size-6 my-2 mx-1 shrink-0"
        {disabled}
        bind:checked={check}
        on:click={update}
    >
        <Checkbox.Indicator
            class="inline-flex items-center justify-center"
        >
            <span
                transition:blur|global
                class="text-emerald-800 font-semibold"
            >
                {#if check}
                    ✓
                {:else}
                    ⠀
                {/if}
            </span>
        </Checkbox.Indicator>
    </Checkbox.Root>
    <Label.Root
        id={label}
        for={id}
        class="inline hover:cursor-pointer hover:bg-green-100 transition-all duration-150 ease-in-out py-2 break-normal"
    >
        {@render children?.()}
    </Label.Root>
</div>
