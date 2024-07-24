<script>
    export let value;
    export const radioId = `${value}-radio`;
    export let group;
</script>

<input id={radioId} type="radio" {value} name={group} />

<label for={radioId}>
    <slot />
</label>
