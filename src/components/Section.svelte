<script>
  export let id;
</script>

<div class="section" {id}>
    <slot/>
</div>

<style>

.section {
  /* border: 1px solid hsl(0, 0%, 0%); */
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: 1px 1px 4px hsl(0, 0%, 0%);
  height: fit-content;
}
</style>