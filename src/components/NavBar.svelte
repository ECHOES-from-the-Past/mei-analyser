<script>
    import { onMount } from "svelte";
    import Button from "./Button.svelte";
    import ClientStatus from "./ClientStatus.svelte";
    import ExternalLink from "./ExternalLink.svelte";

    let panelIDs = ["search-panel", "experimental-panel"];

    function showPanel(panelID) {
        panelIDs.forEach((value) => {
            if (value != panelID) {
                document.getElementById(value).hidden = true;
            } else if (value == panelID) {
                document.getElementById(panelID).hidden = false;
            }
        });
    }
</script>

<div id="navbar">
    <Button id="search-mode-btn" onClick={() => showPanel("search-panel")}>
        Corpus Search</Button
    >

    <Button
        id="experimental-btn"
        onClick={() => showPanel("experimental-panel")}
    >
        Experimental
    </Button>

    <ExternalLink
        href="https://github.com/ECHOES-from-the-Past/mei-analyser/wiki"
    >
        <Button>Project Wiki</Button>
    </ExternalLink>
</div>

<style>
    #navbar {
        display: flex;
        justify-content: flex-start;
        gap: 0.3rem;
        align-items: center;
        background-color: white;
        color: white;
    }
</style>
