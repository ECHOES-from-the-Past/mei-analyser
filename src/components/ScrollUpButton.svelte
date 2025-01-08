<script>
    let scrollUpBtn = $state();
    window.onscroll = () => {
        if (window.scrollY > 500) {
            scrollUpBtn.style.display = "block";
        } else {
            scrollUpBtn.style.display = "none";
        }
    };
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
</script>

<button id="scroll-up-btn" bind:this={scrollUpBtn} onclick={scrollToTop}>
    Back to top ▲
</button>

<style lang="postcss">
    button {
        @apply hidden fixed bottom-4 left-4 z-50;

        /* Same styling as Button */
        @apply border-0 rounded-lg text-white py-2 px-4 font-medium bg-emerald-800;
        @apply cursor-pointer transition ease-in-out duration-300;

        @apply hover:bg-emerald-600;
        @apply active:bg-emerald-700;
    }
</style>
