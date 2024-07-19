<div>
    <input type="checkbox" id={checkboxId} value={value} checked={isChecked}/>
    <label for={value + "-checkbox"}>
        <slot/>
    </label>
</div>

<script>
    export let value;
    export let isChecked = false;
    export const checkboxId = `${value}-checkbox`;

    // let chkbx = document.getElementById(checkboxId);
    // chkbx.checked = localStorage.getItem(checkboxId)
    // localStorage.setItem(checkboxId, chkbx.checked);
</script>