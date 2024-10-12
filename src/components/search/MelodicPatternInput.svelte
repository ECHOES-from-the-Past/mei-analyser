<script>
    import RadioButton from "../RadioButton.svelte";
    import TextInput from "../TextInput.svelte";
    import Tooltip from "../Tooltip.svelte";

    let id = "melodic-pattern-input";
    export let group = "search-query-option";

    let patternInputBox,
        error = "",
        placeholder = "e.g.: 1 +1 -2 a b? a* g";
    export let onKeydown;
    export let onInput;

    /**
     * Takes in the raw input string, output a list of recognizable query
     * @param {string} inputStr the raw input string
     * @param {string} searchMode 'exact-pitch' or 'contour'
     * @return {string[]}
     */
    function filterValidInput(inputStr, searchMode) {
        if (!inputStr) {
            return [];
        }
        const validInputFilter = /[\.]\??|[A-Ga-g?*]\??/gi;
        const numericMelodyRegex = /\+?\-?\d/g;
        let filteredInput = inputStr.match(validInputFilter);

        // TODO: filter input for contour
        let melodyList = [];
        if (searchMode == 'wildcard') {
            melodyList = filteredInput.map((pitch) => pitch.toLowerCase());
        } else if (searchMode == "contour") {
            melodyList = inputStr.match(numericMelodyRegex);
            melodyList = filteredInput.map(Number);
        }

        return filteredInput;
    }

    /**
     * @param {string[]} inputCharList a list of valid characters
     * @return
     */
    function constructMatchingRegexp(inputCharList) {
        if (!inputCharList) {
            return new RegExp("");
        }
        try {
            let matchingRegex = new RegExp(inputCharList.join(""), "gi");
            error = "";
            return matchingRegex;
        } catch (e) {
            error = e;
        }
    }

    /**
     * @return {RegExp} regular expression
     */
    export function getWildcardRegex() {
        return constructMatchingRegexp(
            filterValidInput(patternInputBox.getValue()),
        );
    }

    export function getRegexError() {
        if (!error) {
            return null;
        }
        return new Error(error);
    }

    export function getMelodicPatternRegex() {
        return getWildcardRegex();
    }
</script>

<p>
    Filter chants by
    <span class="melodic-pattern-word"> melodic pattern </span>
</p>

<!-- <RadioButton value="exact-pitch" group="search-query-option" disabled>
    Exact Pitch
</RadioButton> -->

<RadioButton value="wildcard" {group}>Pitch (wildcards)</RadioButton>
<Tooltip id="wildcard-tooltip">
    <p>
        Wildcard search follows the <i>regular expression</i> POSIX standard.
    </p>
    <ul>
        <li>
            Use a dot <b><code>.</code></b> to search for one arbitrary pitch
        </li>
        <li>
            Use a question mark <code>.?</code> to search for an optional note.
            <ul>
                <li>
                    E.g.: searching for <code>d .? a</code> could return the
                    following sequences of notes: <code>d a</code>,
                    <code> d f a</code>, <code>d g a</code>,
                    <code>d c a</code>, etc.
                </li>
            </ul>
        </li>
    </ul>
</Tooltip>
<br />

<RadioButton value="contour" group="search-query-option">
    Contour (melodic intervals)
</RadioButton>
<Tooltip id="melodic-pattern-search">
    <ul>
        <!-- <li>
            <b> Exact pitch (only for Square music script chants): </b>
            Enter pitch names of the melodic pattern. For example, "a b a f" will
            search for a melodic pattern that follows the sequence A-B-A-F.
        </li> -->
        <li>
            <b> Contour (Melodic intervals) </b> in the form of positive or negative
            integers (e.g., +1 indicates one step up - either a semitone or a tone
            - from the previous note; 0 indicates unison; and -2 indicates two steps
            down - either a major or minor third - from the previous note). When
            looking for a series of notes, the integers can be separated by a space
            (e.g., "0 +2 -1 +1 +1").
        </li>
    </ul>
</Tooltip>
<br />

<TextInput
    bind:this={patternInputBox}
    {onKeydown}
    {onInput}
    id="pattern-input-box"
    {placeholder}
/>
{error}
