<script>
    import { onMount } from "svelte";
    import Section from "../Section.svelte";
    import TextInput from "../TextInput.svelte";

    let wildCardSearch;
    let displayText;
    export let onKeydown;

    /**
     * Takes in the raw input string, output a list of recognizable query
     * - A dot `.` to search for one arbitrary pitch
     * - A question mark `?` to search for an optional note. E.g.:
     *   - "A F? B" searches for "A F B" and "A B"
     *   - "A .? B", or "A ?. B" search for "A B", "A D B", etc.
     * - An asterisk `*` to search for an arbritrary number of notes
     * @param {string} inputStr the raw input string
     * @return {string[]}
     */
    function parseInput(inputStr) {
        if (!inputStr) {
            return [];
        }

        let regexFilter = /[\.]\??|[A-Ga-g?*]\??/g;
        let parsedInput = inputStr.match(regexFilter);
        return parsedInput;
    }

    function updateText() {
        displayText = parseInput(wildCardSearch.getValue()).join("  ");
    }

    export function getWildcardList() {
        return parseInput(wildCardSearch.getValue());
    }

    onMount(() => {
        updateText()
    })
</script>

<Section>
    <TextInput bind:this={wildCardSearch} onInput={() => updateText()} {onKeydown}
    ></TextInput>
    <Section>
        <p>{displayText}</p>
    </Section>
</Section>
