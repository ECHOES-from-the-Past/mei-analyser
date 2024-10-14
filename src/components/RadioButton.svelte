<script>
    import { persist, retrieve } from "../utility/utils";

    export let value;
    export let name;
    export let onChange;
    export let disabled = false;
    $: checked = retrieve(name) == value;

    function updateLocalStorageWhenChange() {
        persist(name, value);
    }

    export function setCheck() {
        checked = true;
        updateLocalStorageWhenChange();
    }
</script>

<label>
    <input {name} type="radio" on:change={onChange} on:change={updateLocalStorageWhenChange} {disabled} {checked}/>
    <slot />
</label>

<style>
    label:hover {
        --label-hover: hsla(207, 100%, 84%, 0.459);
        cursor: pointer;
        background-color: var(--label-hover);
    }
</style>
