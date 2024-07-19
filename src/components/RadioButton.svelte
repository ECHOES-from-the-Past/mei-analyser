<script>
    export let value;
    export const radioId = `${value}-radio`;
</script>

<input name={radioId} id={radioId} type="radio" {value} />

<label for={radioId}>
    <slot />
</label>
