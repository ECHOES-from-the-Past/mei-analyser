<script>
    import { env } from "../utility/utils";
    import Button from "./Button.svelte";
    import ExternalLink from "./ExternalLink.svelte";

    let clientVersion = $state();
    export function setVersion(version) {
        clientVersion = version;
        if (env == "development") {
            clientVersion += " (development)";
        }
    }
</script>

<div id='navbar' class="flex items-center justify-between gap-3 bg-white px-2 pt-2">
    <p>MEI Analyser</p>
    <ExternalLink
        href="https://github.com/ECHOES-from-the-Past/mei-analyser/wiki"
    >
        <Button>Project Wiki</Button>
    </ExternalLink>

    <p id="client-version" class="text-base text-emerald-900 ml-auto">Version: {clientVersion}</p>
</div>