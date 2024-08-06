<script>
    import NavBar from "./src/components/NavBar.svelte";
    import ScrollUpButton from "./src/components/ScrollUpButton.svelte";
    import SearchPanel from "./src/panels/SearchPanel.svelte";
    import ExperimentalPanel from "./src/panels/ExperimentalPanel.svelte";

    import packageJSON from './package.json';
    import { env, persist } from "./src/utility/utils";
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
    let version = packageJSON.version;
    persist("version", version);

    onMount(() => {
        navbar.setVersion(version);
    })
</script>

<NavBar bind:this={navbar}/>
<div id="panels">
    <SearchPanel />
    <ExperimentalPanel />
</div>
<ScrollUpButton />

<!-- Search Panel -->
