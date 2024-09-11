<script>
    import { onMount } from "svelte";
    import Section from "../Section.svelte";
    import TextInput from "../TextInput.svelte";
    import Tooltip from "../Tooltip.svelte";

    let wildCardSearch;
    let displayText;
    export let onKeydown;

    /**
     * Takes in the raw input string, output a list of recognizable query
     * - A dot `.` to search for one arbitrary pitch
     * - A question mark `?` to search for an optional note. E.g.:
     *   - "A ? B" searches for "A F B" and "A B"
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
        updateText();
    });
</script>

<Section>
    <TextInput
        bind:this={wildCardSearch}
        onInput={() => updateText()}
        {onKeydown}
    ></TextInput>
    <Tooltip>
        <ul>
            <li>
                Use a dot . to search for one arbitrary pitch. Use a question
                mark ? to search for an optional note.
                <ul>

                    <li>
                        
                        For example, searching
                    for d ? a could return the following sequences of notes: d a, d
                    f a, d g a, d c a, etc.
                </li>
            </ul>
            </li>
            <li>
                Or use the question mark ? after a particular pitch value to
                make that note optional. For example, searching for d f? a could
                return both the sequence d a and the sequenced f a.
            </li>
            <li>
                Use an asterisk * to search for an number of optional notes. For
                example, searching for f * a could return the following
                sequences: f a, f g a, f b g a, etc.
            </li>
            <li>
                Use an at sign @ after a note to allow for repetitions of that
                note. For example, searching for f a@ could return the following
                sequences: f a, f a a, f a a a, etc.
            </li>
        </ul>
    </Tooltip>
    <Section>
        <p>{displayText}</p>
    </Section>
</Section>
