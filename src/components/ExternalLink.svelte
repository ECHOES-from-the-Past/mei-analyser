<script>
    let { href, children } = $props();
</script>

<a {href} rel="external" target="_blank">
    {@render children?.()}
</a>
