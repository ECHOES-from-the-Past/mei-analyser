<script>
    import NavBar from "@components/NavBar.svelte";
    import ScrollUpButton from "@components/ScrollUpButton.svelte";
    import SearchPanel from "@panels/SearchPanel.svelte";

    import packageJSON from "../package.json";
    import { env, persist, retrieve } from "@utility/utils";
    import { onMount } from "svelte";

    /* Dynamically redraw the MEI content when the window is resized
     * See: https://www.geeksforgeeks.org/how-to-wait-resize-end-event-and-then-perform-an-action-using-javascript/
     */
    let timeOutFunctionId;
    window.onresize = () => {
        clearTimeout(timeOutFunctionId);
        timeOutFunctionId = setTimeout(() => {
            console.log("Resized!");
        }, 500);
    };

    let navbar;

    /**
     * Clear old local storage data for apps that uses version prior to 0.5.x
     * @param {string} localVersion
     */
    function clearOldLocalStorage() {
        console.log("Clearing localStorage from version prior to 0.5.4...");
        localStorage.clear();
        console.log(
            "Finished clearing, loading default options for the search panel!",
        );
        loadDefaultOptions();
    }

    let /** @type {SearchPanel} */ searchPanel;
    /**
     * Load default options for the Search Panel
     */
    function loadDefaultOptions() {
        searchPanel.loadDefaultOptions();
    }

    onMount(() => {
        let localVersion = retrieve("version");
        if (localVersion == undefined) {
            console.log("Loading default options on the search panel!");
            loadDefaultOptions();
        } else if (
            localVersion.split(".")[1] < 5 ||
            localVersion.split(".")[2] < 4
        ) {
            // Force clear localStorage for versions lower than 0.5.4
            clearOldLocalStorage();
        }
        let version = packageJSON.version;
        navbar.setVersion(version);
        persist("version", version);
    });
</script>

<NavBar bind:this={navbar} />
<div id="panels">
    <SearchPanel bind:this={searchPanel} />
</div>
<ScrollUpButton />

<!-- Search Panel -->
