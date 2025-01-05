<script>
    import { env } from "../utility/utils";
    import Button from "./Button.svelte";
    import ExternalLink from "./ExternalLink.svelte";

    let clientVersion;
    export function setVersion(version) {
        clientVersion = version;
        if(env == "development") {
            clientVersion += " (development)";
        }
    }
</script>

<div id="navbar">
    <p>
        MEI Analyser 
    </p>
    <ExternalLink
        href="https://github.com/ECHOES-from-the-Past/mei-analyser/wiki"
    >
        <Button>Project Wiki</Button>
    </ExternalLink>

    <p id="client-version"> Version: {clientVersion} </p>
</div>

<style lang=postcss>
    #navbar {
        @apply flex items-center justify-between gap-3 bg-white px-2 pt-2;
    }

    #client-version {
        @apply text-base text-emerald-900 ml-auto;
    }
</style>
