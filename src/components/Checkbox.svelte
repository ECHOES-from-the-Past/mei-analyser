<script>
    import { Checkbox, Label } from "bits-ui";
    import { persist, retrieve } from "@utility/utils";

    const label = `${value}-label`;
    /**
     * @typedef {Object} Props
     * @property {String} value (required) The "code" value of the checkbox
     * @property {any} [id] The id of the checkbox, default is `${value}-checkbox`
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
    let checked = $state(retrieve(id) == true);

    export function isChecked() {
        return checked;
    }

    export function setChecked() {
        checked = true;
        persist(id, checked);
    }

    export function setUnchecked() {
        checked = false;
        persist(id, checked);
    }
</script>

<div class="inline-flex items-center justify-center gap-1">
    <Checkbox.Root
        {id}
        aria-labelledby={label}
        class="flex items-center justify-center rounded-md border border-emerald-800 size-6 my-2 mx-1 shrink-0"
        {disabled}
        bind:checked
        onCheckedChange={() => {
            persist(id, checked);
        }}
    >
        {#snippet children({ checked })}
            <div
                class="text-background inline-flex items-center justify-center"
            >
                {#if checked}
                    <span class="text-emerald-800 font-semibold text-sm">
                        ✔
                    </span>
                {:else}
                    <span class="text-emerald-100 font-semibold text-sm">
                        ✗
                    </span>
                {/if}
            </div>
        {/snippet}
        <!-- <Checkbox.Indicator
            class="inline-flex items-center justify-center shirnk-0"
        >
            
        </Checkbox.Indicator> -->
    </Checkbox.Root>
    <Label.Root
        id={label}
        for={id}
        class="inline hover:cursor-pointer hover:bg-green-100 transition-all duration-150 ease-in-out py-2 break-normal"
    >
        {@render children?.()}
    </Label.Root>
</div>
