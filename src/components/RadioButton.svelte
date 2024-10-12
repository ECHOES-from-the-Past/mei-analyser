<script>
    import { retrieve, persist } from "../utility/utils";
    export let value;
    const id = `${value}-radio`;
    export let group;
    export let disabled = false;

    /** @type {boolean} */
    let prevSelection = retrieve(group);

    $: check = value == prevSelection;

    function updateLS() {
        persist(group, value);
    }

    export function isChecked() {
        return check;
    }

    export function getSelection() {
        return retrieve(group);
    }
</script>

<label>
    <input
        {id}
        type="radio"
        name={group}
        on:change={updateLS}
        {value}
        checked={check}
        {disabled}
    />
    <slot />
</label>

<style>
    label:hover {
        --label-hover: hsla(207, 100%, 84%, 0.459);
        cursor: pointer;
        background-color: var(--label-hover);
    }
</style>
