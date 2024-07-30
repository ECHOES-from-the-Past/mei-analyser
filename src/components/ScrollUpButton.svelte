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
    #scroll-up-btn {
        display: none; /* Hidden by default */
        position: fixed; /* Fixed/sticky position */
        bottom: 20px;
        left: 30px;
        z-index: 99;
    }
</style>
