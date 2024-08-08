<script>
    import { persist, retrieve } from "../utility/utils";

    export let value;
    export let id = `${value}-checkbox`;
    export let onClick;
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
</script>

<label>
    <input
        type="checkbox" {id}
        on:click={onClick}
        on:change={update}
        bind:checked={check}
        {disabled}
    />
    <slot />
</label>

<style>
    label:hover {
        cursor: pointer;
        background-color: var(--label-hover);
    }
</style>
