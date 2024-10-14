import { NeumeComponent, NeumeComponentSQ, toSeptenary, getNeumeComponentList, SearchResult } from "../utility/components.js";

import { Chant } from "../utility/components.js";

/**
 * @param {Chant[]} chantList The list of chants
 * @param {{"aquitanian": boolean, "square": boolean}} musicScripts an array of chant types.
 */
export function filterByMusicScript(chantList, musicScripts) {
    let filteredChantList = chantList.filter((chant) => {
        if (musicScripts.aquitanian && chant.notationType == "aquitanian") {
            return true;
        } else if (musicScripts.square && chant.notationType == "square") {
            return true;
        }
        return false;
    });

    return filteredChantList;
}

/**
 * Filter by modes
 * @param {Chant[]} chantList list of chants to be filtered
 * @param {{"numbers": Number[], "unknown": boolean}} modes interested modes
 * @returns {Chant[]} list of chants that has the selected modes. If no modes are selected, return all the chants.
 */
function filterByModes(chantList, modes) {
    /** @type {Chant[]} resulting list of chants after filtering */
    let resultChantList = [];

    modes.numbers.forEach((value) => {
        resultChantList.push(...chantList.filter(chant => { if (chant.mode == value) return true; }));
    })

    if (modes.unknown) {
        resultChantList.push(...chantList.filter(chant => { if (chant.mode == -1) return true; }));
    }

    return resultChantList;
}

/**
 * @param {Chant} chant
 * @param {RegExp} wildcardRegex
 * @returns {NeumeComponent[][]} A list of patterns that matches the wildcard regex
 */
function matchChantWithWildcards(chant, wildcardRegex) {
    const ncArray = getNeumeComponentList(chant.syllables);

    const ncPitchStr = ncArray
        .map((nc) => {
            if (chant.notationType == "aquitanian") {
                return nc.loc;
            } else if (chant.notationType == "square") {
                return nc.pitch;
            }
        })
        .join("");

    let patternMatches = ncPitchStr.matchAll(wildcardRegex);
    let patterns = [];

    patternMatches.forEach((matchIter) => {
        // matchIter.index = matching pattern starting index
        // matchIter[0] = the matching pattern
        // slice: takes in the starting index and the ending index (starting + pattern's length)
        patterns.push(ncArray.slice(matchIter.index, matchIter.index + matchIter[0].length));
    });

    return patterns;
}

/**
 * @param {Chant} chant a Chant object
 * @param {Number[]} contourArray the list of numbers
 * @returns {NeumeComponent[][]} a list of patterns (in list form) that match the search query
 */
export function matchChantWithContour(chant, contourArray) {
    if (contourArray.length == 0) {
        return [];
    }

    const ncArray = getNeumeComponentList(chant.syllables);
    const chantNotationType = chant.notationType;

    let patterns = [];

    for (let i_nc = 0; i_nc < ncArray.length - contourArray.length; i_nc++) {
        let patternFound = [];
        patternFound.push(ncArray[i_nc]);

        if (chantNotationType == "aquitanian") {
            for (let i_sq = 0; i_sq < contourArray.length; i_sq++) {
                // processing the search for Aquitanian notation, using the `loc` attribute
                if (ncArray[i_nc + i_sq].loc + contourArray[i_sq] == ncArray[i_nc + i_sq + 1].loc) {
                    patternFound.push(ncArray[i_nc + i_sq + 1]);
                } else {
                    patternFound = [];
                    break;
                }
            }
        }
        else if (chantNotationType == "square") {
            for (let i_search = 0; i_search < contourArray.length; i_search++) {
                // processing the search for Square notation, using the `septenary` value of the note
                if (toSeptenary(ncArray[i_nc + i_search]) + contourArray[i_search] == toSeptenary(ncArray[i_nc + i_search + 1])) {
                    patternFound.push(ncArray[i_nc + i_search + 1]);
                } else {
                    patternFound = [];
                    break;
                }
            }
        }
        if (patternFound.length > 0) {
            patterns.push(patternFound);
        }
    }
    return patterns;
}

/**
 * Using regular expression to process the user's input
 *
 * Search mode options:
 * - `wildcard` ~ Square pitch pattern (alphabetical value)
 * - `contour` ~ Aquitanian/Square contour pattern (numerical value)
 * @param {Chant[]} chantList
 * @param {RegExp | Number[]} searchInput a search regular expression pattern to match with the pitches, or contour array
 * @param {string} searchMode `wildcard` & `contour`
 * @returns {SearchResult[]} list of SearchResult object, each contains the chant and its detected melodic pattern
 */
export function filterByMelodicPattern(chantList, searchInput, searchMode) {
    let searchResults = [];

    let /** @type {NeumeComponent[][]} */ patterns = [];

    if (searchInput.length == 0 || String(searchInput) == String(RegExp("", "gi"))) {
        chantList.forEach((chant) => searchResults.push(new SearchResult(chant, [])));
    } else {
        for (let chant of chantList) {
            switch (searchMode) {
                case 'wildcard': {
                    patterns = matchChantWithWildcards(chant, searchInput);
                    break;
                }
                case 'contour': {
                    patterns = matchChantWithContour(chant, searchInput);
                    break;
                }
                default: {
                    console.error("Invalid search mode!");
                    break;
                }
            }
            if (patterns.length > 0) {
                searchResults.push(new SearchResult(chant, patterns));
            }
        }
    }

    return searchResults;
}


/**
 * Search by ornamental shapes (liquescent, quilisma, oriscus)
 * @param {Chant[]} chantList list of chants to be filtered
 * @param {{liquescent: boolean, quilisma: boolean, oriscus: boolean}} ornamentalOptions options for the ornamental search
 * @returns {Chant[]} list of chants that has the selected ornamental shapes. If no options are selected, return all the chants.
 */
export function filterByOrnamentalShapes(chantList, ornamentalOptions) {
    /**
     * Filter the chants based on the options.
     * If all the options are unchecked (`false`), return all the chants
     * @type {Chant[]} resulting list of chants after filtering
     */
    let resultChantList = chantList;

    /**
     * HELPER FUNCTION
     * Check if a chant has a specific ornamental shape.
     * This only check for the first occurrence of the ornamental shape in the chant
     * and does not care for the location of the ornamental shape in the chant.
     * @param {Chant} chant the chant to be checked
     * @param {string} ornamentalType the type of ornamental shape to be checked
     * @returns {boolean} `true` if the chant has the ornamental shape, `false` otherwise
     */
    let hasOrnamental = (chant, ornamentalType) => {
        /** @type {NeumeComponent[]} */
        let neumeComponents = getNeumeComponentList(chant.syllables);
        for (let neume of neumeComponents) {
            // TODO: Get the syllables from here
            if (
                neume.ornamental != null &&
                neume.ornamental.type == ornamentalType
            )
                return true;
        }
        return false;
    };

    // first filter for the liquescent option
    if (ornamentalOptions.liquescent) {
        resultChantList = resultChantList.filter((chant) => {
            if (hasOrnamental(chant, "liquescent")) return true;
        });
    }
    // then filter for the quilisma option
    if (ornamentalOptions.quilisma) {
        resultChantList = resultChantList.filter((chant) => {
            if (hasOrnamental(chant, "quilisma")) return true;
        });
    }
    // then filter for the oriscus option
    if (ornamentalOptions.oriscus) {
        resultChantList = resultChantList.filter((chant) => {
            if (hasOrnamental(chant, "oriscus")) return true;
        });
    }

    return resultChantList;
}

/**
 * Search by a finalis (the chant's last note)
 * @param {Chant[]} chantList list of chants to be filtered
 * @param {string | number} finalis the finalis that we are interested in
 * @returns {Chant[]} list of chants that has the selected ornamental shapes. If no options are selected, return all the chants.
 */
export function filterByFinalis(chantList, finalis) {
    if (finalis == "" || !finalis) {
        return chantList;
    }
    /** @type {Chant[]} */
    let resultChantList = [];

    for (let chant of chantList) {
        let ncList = getNeumeComponentList(chant.syllables);
        let chantFinalisNote =
            chant.notationType == "aquitanian"
                ? ncList[ncList.length - 1].loc
                : ncList[ncList.length - 1].pitch;
        if (chantFinalisNote == finalis) {
            resultChantList.push(chant);
        }
    }
    return resultChantList;
}