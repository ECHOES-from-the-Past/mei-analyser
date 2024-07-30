<script>
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

    /** @type {ClientStatus} */
    export let clientStatus;
    function updateClientStatus(message = "Loading...") {
        clientStatus.showStatus();
        clientStatus.updateStatus(message);
    }

    function hideClientStatus() {
        clientStatus.hideStatus();
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

    <ClientStatus bind:this={clientStatus} />

    <span style="color: var(--button); margin-left: auto;" id="client-version"
    ></span>
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
