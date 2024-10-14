<script>
    import { onMount } from "svelte";
    import { retrieve } from "../../utility/utils";
    import RadioButton from "../RadioButton.svelte";
    import TextInput from "../TextInput.svelte";
    import Tooltip from "../Tooltip.svelte";

    export let onKeydown;
    export let onInput;
    let searchModeSelection; // this will be the bind:group of the radio buttons
    let patternInput = `melodic-pattern-input`;
    let searchModeName = "search-mode";

    let patternInputBox,
        error = "",
        placeholder = "e.g.: 1 +1 -2 a b? a* g";

    let /** @type {RadioButton} */ contourButton,
        /** @type {RadioButton} */ wildcardButton;

    /**
     * Takes in the raw input string, output a list of recognizable token
     * @param {string} inputStr the raw input string
     * @return {string[]}
     */
    function filterValidWildcardInput(inputStr) {
        const wildcardInputFilter = /[\.]\??|[A-Ga-g?*]\??/gi;
        let filteredInput = inputStr.match(wildcardInputFilter);

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
        const numericInputFilter = /\+?\-?\d/g;
        let melodyList = inputStr.match(numericInputFilter);

        if (melodyList != null) {
            return melodyList.map(Number);
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
        <!-- <li>
            <b> Exact pitch (only for Square music script chants): </b>
            Enter pitch names of the melodic pattern. For example, "a b a f" will
            search for a melodic pattern that follows the sequence A-B-A-F.
        </li> -->
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
            </ul>
        </li>
        <li>
            Use an asterisk <code>*</code> <b> after a note </b>
            to search for matches of zero or repeating notes (0 or more occurrences).
            <ul>
                <li>
                    E.g.: searching for <code>f d* a</code> could return the
                    following sequences of notes: <code>f a</code>, or
                    <code>f d a</code>, <code>f d d a</code>, etc.
                </li>
                <li>
                    Note that <code>.*</code> will search for every note at all possible
                    occurrences, i.e., everything.
                </li>
            </ul>
        </li>
    </ul>
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
    <ul>
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
    id={patternInput}
    {onKeydown}
    {onInput}
    {placeholder}
    bind:this={patternInputBox}
/>

{error}
