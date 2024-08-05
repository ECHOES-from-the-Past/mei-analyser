<script>
    let scrollUpBtn;
    window.onscroll = () => {
        if (window.scrollY > 650) {
            scrollUpBtn.style.display = "block";
        } else {
            scrollUpBtn.style.display = "none";
        }
    };
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
</script>

<button id="scroll-up-btn" bind:this={scrollUpBtn} on:click={scrollToTop}>
    Back to top ▲
</button>

<style>
    /* Default button styles */
    button {
        display: none; /* Hidden by default */
        position: fixed; /* Fixed/sticky position */
        bottom: 20px;
        left: 30px;
        z-index: 99;
        border: 0px;
        border-radius: 8px;
        color: white;
        padding: 0.6rem 1.2rem;
        font-size: 1rem;
        font-weight: 500;
        font-family: inherit;
        background-color: var(--button);
        cursor: pointer;
        transition: background-color 0.2s;
    }

    button:hover {
        background-color: var(--button-hover);
    }

    button:active {
        background-color: var(--button-active);
    }

    button:disabled {
        background-color: var(--button-disabled);
        cursor: not-allowed;
    }
</style>
