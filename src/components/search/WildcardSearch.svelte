<script>
    import { onMount } from "svelte";
    import Section from "../Section.svelte";
    import TextInput from "../TextInput.svelte";
    import Tooltip from "../Tooltip.svelte";

    let wildCardSearch;
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
    function filterValidInput(inputStr) {
        if (!inputStr) {
            return [];
        }

        let regexFilter = /[\.]\??|[A-Ga-g?*]\??/g;
        let filteredInput = inputStr.match(regexFilter);
        return filteredInput;
    }

    /**
     *  
     * @param {string[]} inputCharList a list of valid characters
     * @return 
     */
    function constructMatchingRegexp(inputCharList) {
        let matchingRegex = new RegExp(inputCharList.join(""), "gi");
        return matchingRegex;
    }

    function getWildcardList() {
        return filterValidInput(wildCardSearch.getValue());
    }

    /**
     * @return {RegExp} regular expression
     */
    export function getWildcardRegex() {
        return constructMatchingRegexp(getWildcardList());
    }

    onMount(() => {
    });
</script>

<Section>
    <TextInput
        bind:this={wildCardSearch}
        onInput={() => {
            console.log(getWildcardRegex())
        }}
        {onKeydown}
    ></TextInput>
    <Tooltip>
        <ul>
            <li>
                Use a dot <code><b>. </b></code> to search for one arbitrary pitch
            </li>
            <!-- <li>
                Use a question mark ? to search for an optional note.
                <ul>
                    <li>
                        E.g.: searching for d ? a could return the
                        following sequences of notes: <code> d a </code>, 
                        <code>
                            d f a, d g a, d c a,
                        </code>
                        etc.
                    </li>
                </ul>
            </li>
            <li>
                Or use the question mark ? after a particular pitch value to
                make that note optional.
                <ul>
                    <li>
                        For example, searching for d f? a could return both the
                        sequence d a and the sequenced f a.
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
            <li>
                Use an at sign @ after a note to allow for repetitions of that
                note.
                <ul>
                    <li>
                        For example, searching for f a@ could return the
                        following sequences: f a, f a a, f a a a, etc.
                    </li>
                </ul>
            </li> -->
        </ul>
    </Tooltip>
</Section>
