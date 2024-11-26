<script>
  /**
   * @type {String[]}
   */
  export let options; // Array of menu items
</script>

<div class="dropdown">
  <div class="dropdown-menu">
    {#each options as option}
      <div class="dropdown-item">
        <p>{option}</p>
      </div>
    {/each}
  </div>
</div>

<style>
  .dropdown {
    position: relative;
    width: 20vw;
  }

  .dropdown-menu {
    position: absolute;
    width: 100%;
    background: white;
    border: 1px solid var(--white);
    z-index: 10;
  }
  .dropdown-item {
    border: 0.2px solid var(--emerald-600);
    padding: 0.5rem;
    cursor: pointer;
  }
  .dropdown-item:hover {
    background: #f0f0f0;
  }
</style>
