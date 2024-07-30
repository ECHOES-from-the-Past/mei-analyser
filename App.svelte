<script>
    import NavBar from "./src/components/NavBar.svelte";
    import ScrollUpButton from "./src/components/ScrollUpButton.svelte";
    import SearchPanel from "./src/panels/SearchPanel.svelte";
    import ExperimentalPanel from "./src/panels/ExperimentalPanel.svelte";
 
</script>

<NavBar />
<div id="panels">
    <SearchPanel />
    <ExperimentalPanel />
</div>
<ScrollUpButton/>

<!-- Search Panel -->
