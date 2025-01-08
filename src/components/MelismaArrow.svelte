<script>
    import { persist } from "../utility/utils";
    let { type } = $props();
    let melismaInput = document.getElementById("melisma-input");

    function stepUp() {
        melismaInput.stepUp();
        persist("melismaInput", melismaInput.value);
    }

    function stepDown() {
        melismaInput.stepDown();
        persist("melismaInput", melismaInput.value);
    }
</script>

{#if type == "up"}
    <button onclick={stepUp}> &gt; </button>
{:else if type == "down"}
    <button onclick={stepDown}> &lt; </button>
{/if}

<style>
    button {
        display: inline-block;
        border: 1px solid var(--button-active);
        box-shadow: 1px 2px var(--button);
        border-radius: 0.5rem;
        padding: 0.1rem 0.4rem;
        font-size: 1rem;
        cursor: pointer;
        transition: box-shadow 0.1s;
    }

    button:hover {
        box-shadow: 2px 3px 1px var(--button-hover);
    }

    button:active {
        box-shadow: 2px 4px 4px var(--button-active);
    }
</style>
