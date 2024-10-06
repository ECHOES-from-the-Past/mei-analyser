<script>
    import TextInput from "../TextInput.svelte";

    let wildCardSearch, error = "";
    export let onKeydown;
    export let onInput;

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
        if(!inputCharList) {
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

    function getWildcardList() {
        return filterValidInput(wildCardSearch.getValue());
    }

    /**
     * @return {RegExp} regular expression
     */
    export function getWildcardRegex() {
        return constructMatchingRegexp(getWildcardList());
    }

    export function getRegexError() {
        if (!error) {
            return null;
        }
        return new Error(error);
    }
</script>

<TextInput bind:this={wildCardSearch} {onKeydown} {onInput}></TextInput>
{error}
