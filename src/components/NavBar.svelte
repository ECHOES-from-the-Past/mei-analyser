<script>
    import { env } from "../utility/utils";
    import Button from "./Button.svelte";
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

    let clientVersion;
    export function setVersion(version) {
        clientVersion = version;
        if(env == "development") {
            clientVersion += " (development)";
        }
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

    <p id="client-version"> Version: {clientVersion} </p>
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

    #client-version {
        color: var(--emerald-900);
        margin-left: auto;
    }
</style>
