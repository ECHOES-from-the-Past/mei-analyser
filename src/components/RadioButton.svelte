<script>
    import { run, handlers } from "svelte/legacy";

    import { persist, retrieve } from "../utility/utils";

    /**
     * @typedef {Object} Props
     * @property {any} value
     * @property {any} name
     * @property {any} onChange
     * @property {boolean} [disabled]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { value, name, onChange, disabled = false, children } = $props();
    let checked = $state(retrieve(name) == value);

    function updateLocalStorageWhenChange() {
        persist(name, value);
    }

    export function setCheck() {
        checked = true;
        updateLocalStorageWhenChange();
    }
</script>

<label>
    <input
        {name}
        type="radio"
        onchange={handlers(onChange, updateLocalStorageWhenChange)}
        {disabled}
        {checked}
    />
    {@render children?.()}
</label>

<style>
    label:hover {
        --label-hover: hsla(207, 100%, 84%, 0.459);
        cursor: pointer;
        background-color: var(--label-hover);
    }
</style>
