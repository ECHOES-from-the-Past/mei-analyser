<script>
    import Button from "../components/Button.svelte";
    import { onMount } from "svelte";
    import WildcardSearch from "../components/search/WildcardInput.svelte";
    import Tooltip from "../components/Tooltip.svelte";
    import Section from "../components/Section.svelte";

    export let hidden = false;

    let wildcard, regex;

    function updateRegex() {
        regex = wildcard.getWildcardRegex();
    }

    onMount(async () => {
        updateRegex();
        await reloadTable();
    });
</script>

<div id="experimental-panel" {hidden}>
    <Section>
        <WildcardSearch
            bind:this={wildcard}
            onInput={updateRegex}
        />

        <Tooltip id="wildcard-tooltip">
            <p>
                Wildcard search follows the <i>regular expression</i> POSIX standard.
            </p>
            <ul>
                <li>
                    Use a dot <b><code>.</code></b> to search for one arbitrary pitch
                </li>
                <li>
                    Use a question mark <code>.?</code> to search for an
                    optional note.
                    <ul>
                        <li>
                            E.g.: searching for d ? a could return the following
                            sequences of notes: <code>d a</code>,
                            <code> d f a</code>, <code>d g a</code>,
                            <code>d c a</code>, etc.
                        </li>
                    </ul>
                </li>
                <li>
                    Or use the question mark <code>?</code> after a particular
                    pitch value to make that note optional.
                    <ul>
                        <li>
                            For example, searching for d f? a could return both
                            the sequence d a and the sequenced f a.
                        </li>
                    </ul>
                </li>
                <li>
                    Use an asterisk * to search for an number of optional notes.
                    <ul>
                        <li>
                            For example, searching for f * a could return the
                            following sequences: f a, f g a, f b g a, etc.
                        </li>
                    </ul>
                </li>
            </ul>
        </Tooltip>
        <br />
        <p>Current regex: <code>{regex}</code></p>
    </Section>
</div>

<style>
</style>
