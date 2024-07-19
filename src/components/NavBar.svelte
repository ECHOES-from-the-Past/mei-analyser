<script>
    import Button from "./Button.svelte";
    import ExternalLink from "./ExternalLink.svelte";
    import RefreshWheel from "./RefreshWheel.svelte";

    function showSearchPanel() {
        document.getElementById("search-panel").hidden = false;
        document.getElementById("cross-comparison-panel").hidden = true;
    }

    function showCCPanel() {
        document.getElementById("search-panel").hidden = true;
        document.getElementById("cross-comparison-panel").hidden = false;
    }
</script>

<div id="navbar">
    <Button id="search-mode-btn">Corpus Search</Button>

    <Button id="cross-comparison-mode-btn"> Cross Comparison </Button>

    <ExternalLink href="https://github.com/ECHOES-from-the-Past/mei-analyser/wiki">
        <Button>Project Wiki</Button>
    </ExternalLink>

    <RefreshWheel />
    <span id="client-status" hidden> Client status </span>

    <span style="color: var(--button); margin-left: auto;" id="client-version"
    ></span>
</div>
