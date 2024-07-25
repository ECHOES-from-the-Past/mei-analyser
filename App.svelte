<script>
    import NavBar from "./src/components/NavBar.svelte";
    import ScrollUpButton from "./src/components/ScrollUpButton.svelte";
    import SearchPanel from "./src/panels/SearchPanel.svelte";
    import ExperimentalPanel from "./src/panels/ExperimentalPanel.svelte";

    window.onscroll = () => {
    if (window.scrollY > 650) {
        document.getElementById('scroll-up-btn').style.display = "block";
    } else {
        document.getElementById('scroll-up-btn').scrollUpButton.style.display = "none";
    }
}
</script>

<NavBar />
<div id="panels">
    <SearchPanel />
    <ExperimentalPanel />
</div>
<ScrollUpButton
    onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }}
/>

<!-- Search Panel -->
