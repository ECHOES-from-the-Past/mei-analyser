<script>
    import { onMount } from "svelte";
    import { retrieve } from "@utility/utils";
    import RadioButton from "@components/RadioButton.svelte";
    import TextInput from "@components/TextInput.svelte";
    import Tooltip from "@components/Tooltip.svelte";

    export let onKeydown;
    export let onInput;
    let searchModeSelection; // this will be the bind:group of the radio buttons
    let patternInput = `melodic-pattern-input`;
    let searchModeName = "search-mode";

    let patternInputBox,
        /** Global error message */ error = "",
        placeholder = "e.g.: 1 +1 -2 a b? a* g";

    let /** @type {RadioButton} */ contourButton,
        /** @type {RadioButton} */ wildcardButton;

    /**
     * Takes in the raw input string, output a list of recognizable token
     * @param {string} inputStr the raw input string
     * @return {string[]}
     */
    function filterValidWildcardInput(inputStr) {
        const characterGroup = `([A-Ga-g.]|(\+?-?\d))`;
        const bracketsGroup = `(\{(\d+\,)?\d+\})`;
        const postGroup = "([?*]?)";
        const flags = `gi`;
        /**
         * @type {RegExp} A filter for valid wildcard input
         * - As of version 0.5.9: /([A-Ga-g.]|(\+?-?\d))((\{(\d+\,)?\d+\})|([\?*]?))/gi
         */
        const wildcardInputFilter =
            /([A-Ga-g.]|(\+?-?\d))((\{(\d+\,)?\d+\})|([\?*]?))/gi;

        /**
         * @type {string[] | null} filteredInput
         * It contains the list of valid tokens all in string format.
         *
         * - For note heights (numerical values), they would need to be converted into a different format
         * for string matching.
         *   - Zero and positive numbers: `\+0`, `\+1`, `\+2`, `\+3`
         *   - Negative numbers: `-1`, `-2`, `-3`
         */
        let filteredInput = inputStr.match(wildcardInputFilter);

        for (let i = 0; i < filteredInput.length; i++) {
            // If a token is a number with a +, -, or no sign:     
            filteredInput[i] = filteredInput[i].replace(/(\+|\-|)\d/, (match) => {
                if (Number(match) >= 0) {
                    return `\(\\+${Number(match)}\)`;
                } else {
                    return `\(${match}\)`;
                }
            });

            // If a token is a dot: the value can match anything including:
            // - A-G, a-g: square note pitch 
            // - 0-9: Aquitanian note height
            // Note: \\ is important to create regex escape character
            filteredInput[i] = filteredInput[i].replace(/\./, (match) => {
                return `\([A-Ga-g]|(\\\+?-?\\d)\)`;
            });
        }
        console.log(filteredInput);
        

        if (filteredInput != null) {
            return filteredInput;
        } else {
            return [];
        }
    }

    /**
     * Takes in the raw input string, output a list of valid numerical values
     * @param {string} inputStr the raw input string
     * @return {number[]}
     */
    function filterValidContourInput(inputStr) {
        const numericInputFilter = /\+?\-?\d|[uds]/g;
        let melodyList = inputStr.match(numericInputFilter);

        if (melodyList != null) {
            return melodyList.map((item) => {
                return isNaN(item) ? item : Number(item);
            });
        } else {
            return [];
        }
    }

    /**
     * @param {string[]} inputCharList a list of valid characters
     * @return {RegExp} Regular Expression from the input token list (global, case insensitive)
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
            filterValidWildcardInput(patternInputBox.getValue()),
        );
    }

    export function getRegexError() {
        if (!error) {
            return null;
        }
        return new Error(error);
    }

    export function reset() {
        patternInputBox.setValue("");
        wildcardButton.setCheck();
    }

    export function getMelodicPatternSearchMode() {
        return retrieve(searchModeName);
    }

    /**
     * @return {RegExp | Number[]}
     */
    export function getMelodicPatternInput() {
        let searchMode = retrieve(searchModeName);
        if (searchMode == "wildcard") {
            return constructMatchingRegexp(
                filterValidWildcardInput(patternInputBox.getValue()),
            );
        } else if (searchMode == "contour") {
            // Contour pattern input does not need the RegExp construction step!
            return filterValidContourInput(patternInputBox.getValue());
        }
    }

    onMount(() => {
        patternInputBox.setValue(retrieve(patternInput));
    });
</script>

<p>
    Filter chants by
    <span class="melodic-pattern-word"> melodic pattern </span>
</p>

<RadioButton
    name={searchModeName}
    value="wildcard"
    bind:this={wildcardButton}
    bind:group={searchModeSelection}
>
    Pitch (wildcards)
</RadioButton>
<Tooltip id="wildcard-tooltip">
    <p>
        Wildcard search follows the <i>regular expression</i> POSIX standard.
    </p>
    <ul>
        <li>
            Use a dot <b><code>.</code></b> to search for one arbitrary note.
            <ul>
                <li>
                    E.g.: searching for <code>d . a</code> could return the
                    following sequences of notes: <code>d f a</code>,
                    <code> d a a</code>, etc.
                </li>
            </ul>
        </li>
        <li>
            Use a question mark <code>?</code> <b> after a note or a dot </b>
            <code>.</code> to search for an optional note.
            <ul>
                <li>
                    E.g.: searching for <code>f d? a</code> could return the
                    following sequences of notes: <code>f d a</code>, or
                    <code>f a</code>.
                </li>
                <li>
                    E.g.: searching for <code>f .? a</code> could return the
                    following sequences of notes: <code>f d a</code>,
                    <code>f f a</code>, <code>f g a</code>, or <code>f a</code>,
                    etc.
                </li>
            </ul>
        </li>
        <li>
            Use an asterisk <code>*</code> <b> after a note </b>
            to search for any number of repetition of that note (0 or more occurrences).
            <ul>
                <li>
                    E.g.: Searching for <code>f d* a</code> could return the
                    following sequences of notes: <code>f a</code>, or
                    <code>f d a</code>, <code>f d d a</code>,
                    <code>f d d d a</code>, etc.
                </li>
                <li>
                    E.g.: Searching for <code>f .* a</code> will search for
                    sequences starting with
                    <code>f</code> and ending with <code>a</code>, with any
                    number of notes in between.
                </li>
            </ul>
        </li>
        <li>
            Use curly brackets and numerical value(s) <b> after a note </b>
            to search for a specific number or range of repetitions for that note.
            <ul>
                <li>
                    Syntax: <code>{`c{2}`}</code>, <code>{`a{2, 4}`}</code>, or
                    <code> {`.{3}`} </code>
                </li>
                <li>
                    E.g.: Searching <code> {`f c{2} a`} </code> would return all
                    occurences of <code> f c c a </code>
                </li>
                <li>
                    E.g.: Searching <code> {`f c{1, 5} a`} </code> would return
                    all occurences of <code>f</code>, followed by
                    <b>1 to 5</b> <code>c</code>, and ending with
                    <code>a</code>.
                </li>
                <li>
                    E.g.: Searching <code> {`f .{2, 4} a`} </code> would return
                    all occurences of <code>f</code>, followed by
                    <b>2 to 4</b> arbitrary notes, and ending with
                    <code>a</code>.
                </li>
            </ul>
        </li>
    </ul>
    <p>
        Note that the search query is <i>case insensitive</i> (i.e., "A" is treated
        similarly as "a") and spaces between characters are optional.
    </p>
</Tooltip>
<br />

<RadioButton
    bind:group={searchModeSelection}
    name={searchModeName}
    value="contour"
    bind:this={contourButton}
>
    Contour (melodic intervals)
</RadioButton>
<Tooltip id="melodic-pattern-search">
    <h3><b> Contour (melodic intervals) </b> in the form of:</h3>
    <ul>
        <li>
            <b> Positive or negative integers </b>, the integers can be
            separated optionally by a space
            <ul>
                <li>
                    E.g., <code>+1</code> indicates one step up - either a semitone
                    or a tone - from the previous note
                </li>
                <li>
                    E.g., <code>-2</code> indicates two steps down - either a major
                    or minor third - from the previous note
                </li>
                <li>
                    E.g., <code>0</code> indicates unison
                </li>
                <li>
                    Example of a search query:
                    <code>+2 -1 0 +1 +1</code> will search for patterns that go two
                    steps up, one step down, unison, two steps up, and one step up.
                </li>
            </ul>
        </li>
        <li>
            <b>General contour</b> (<i>case insensitive</i>, optional spaces):
            <ul>
                <li>
                    <code>u</code> for upward contour (ascending pitches)
                </li>
                <li>
                    <code>d</code> for downward contour (decending pitches)
                </li>
                <li>
                    <code>s</code> for the same note (unison)
                </li>
                <li>
                    Example of a search query:
                    <code>u d s u d</code> will search for a contour pattern that
                    goes up, down, same, up, down.
                </li>
            </ul>
        </li>
        <li>
            A mix of both integers and general contour is allowed.
            <ul>
                <li>
                    E.g., <code>u -2 0 +1</code> will search for a pattern that goes
                    up, two steps down, unison, and one step up.
                </li>
            </ul>
        </li>
    </ul>
</Tooltip>
<br />

<TextInput
    id={patternInput}
    {onKeydown}
    {onInput}
    {placeholder}
    bind:this={patternInputBox}
/>

{error}
