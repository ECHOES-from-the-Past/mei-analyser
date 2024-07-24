<script>
    export let value;
    export let checkboxId = `${value}-checkbox`;
    export let isChecked;
    export let onClick;

    let prevState = localStorage.getItem(checkboxId);
    if(prevState) {
        isChecked = prevState
    } else {
        isChecked = false;
        localStorage.setItem(checkboxId, isChecked)
    }
</script>

<div>
    <input
        type="checkbox"
        id={checkboxId}
        bind:checked={isChecked}
        on:click={() => {
            isChecked = !isChecked;
            localStorage.setItem(checkboxId, isChecked)
            // isChecked.set(!isChecked);
        }}
        on:click={onClick}
    />
    <label for={checkboxId}>
        <slot />
    </label>
</div>

<style>
    input[type="checkbox"]:hover,
    label:hover {
        --label-hover: hsla(207, 100%, 84%, 0.459);
        cursor: pointer;
        background-color: var(--label-hover);
    }
</style>
