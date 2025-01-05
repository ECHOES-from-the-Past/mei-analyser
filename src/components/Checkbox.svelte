<script>
    import { Checkbox, Label } from "bits-ui";
    import { persist, retrieve } from "../utility/utils";

    export let value;
    export let id = `${value}-checkbox`;
    const label = `${value}-label`;
    export let disabled = false;

    /** @type {boolean} */
    let check = retrieve(id) === true;

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

<Checkbox.Root
    {id}
    aria-labelledby={label}
    class="peer inline-flex size-[25px] items-center justify-center rounded-md border border-muted bg-foreground transition-all duration-150 ease-in-out active:scale-98 data-[state=unchecked]:border-border-input data-[state=unchecked]:bg-background data-[state=unchecked]:hover:border-dark-40"
    {check}
    {disabled}
    bind:checked={check}
    on:change={update}
>
    <Checkbox.Indicator

        class="inline-flex items-center justify-center text-background"
    >
        {#if check}
            ✓
        {:else}
            ⠀
        {/if}
    </Checkbox.Indicator>
</Checkbox.Root>
<Label.Root
    id={label}
    for={id}
    class="hover:cursor-pointer hover:bg-emerald-100 transition-all duration-150 ease-in-out"
>
    <slot />
</Label.Root>
