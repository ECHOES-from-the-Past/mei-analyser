<script>
  let { id, children } = $props();
</script>

<div
  {id}
  class="border-2 border-emerald-800 rounded-xl p-4 my-4 mx-2 shadow-md bg-white h-fit"
>
  {@render children?.()}
</div>
