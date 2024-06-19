/* --------------------- TOP/NAVBAR ELEMENTS --------------------- */
/** @type {HTMLButtonElement} */
export const searchModeButton = document.getElementById('search-mode-btn');

/** @type {HTMLButtonElement} */
export const crossComparisonModeButton = document.getElementById('cross-comparison-mode-btn');

/** @type {HTMLElement} */
export const refreshStatus = document.getElementById('refresh-status');

/** @type {HTMLDivElement} */
export const refreshWheel = document.getElementById('refresh-wheel');

/** @type {HTMLSpanElement} */
export const clientVersion = document.getElementById('client-version');


/* --------------------- Search-related --------------------- */
/**
 * @type {HTMLInputElement}
 * Checkboxes for aquitanian and square notation search
 */
export const aquitanianCheckbox = document.getElementById('aquitanian-checkbox');
export const squareCheckbox = document.getElementById('square-checkbox');

/**
 * @type {HTMLInputElement}
 * @description The checkboxes for liquescent, quilisma, and oriscus (ornamental shapes)
 */
export const liquescentCheckbox = document.getElementById('liquescent-checkbox');
export const quilismaCheckbox = document.getElementById('quilisma-checkbox');
export const oriscusCheckbox = document.getElementById('oriscus-checkbox');

/**
 * @type {HTMLInputElement} 
 * @description The checkboxes for each mode and the undetected mode
 */
const mode1Checkbox = document.getElementById('mode-1-checkbox');
const mode2Checkbox = document.getElementById('mode-2-checkbox');
const mode3Checkbox = document.getElementById('mode-3-checkbox');
const mode4Checkbox = document.getElementById('mode-4-checkbox');
const mode5Checkbox = document.getElementById('mode-5-checkbox');
const mode6Checkbox = document.getElementById('mode-6-checkbox');
const mode7Checkbox = document.getElementById('mode-7-checkbox');
const mode8Checkbox = document.getElementById('mode-8-checkbox');

/** @type {HTMLInputElement[]} */
export const modeCheckboxes = [
    mode1Checkbox, mode2Checkbox, mode3Checkbox, mode4Checkbox,
    mode5Checkbox, mode6Checkbox, mode7Checkbox, mode8Checkbox,
];

export const unknownModeCheckbox = document.getElementById('unknown-mode-checkbox');
export const allModeCheckbox = document.getElementById('all-mode-checkbox');

/** @type {HTMLInputElement} */
export const melismaInput = document.getElementById('melisma-input');

/** @type {HTMLSpanElement} */
export const melismaIncrement = document.getElementById('melisma-increment');

/** @type {HTMLSpanElement} */
export const melismaDecrement = document.getElementById('melisma-decrement');

/** @type {HTMLInputElement} */
export const patternInputBox = document.getElementById('pattern-input-box');

/** @type {HTMLSpanElement} */
export const patternSearchTooltip = document.getElementById('pattern-search-tooltip');

/** @type {HTMLDivElement} */
export const patternSearchTooltipContent = document.getElementById('pattern-search-tooltip-content');

/** @type {HTMLInputElement} */
export const contourRadio = document.getElementById('contour-radio');

/** @type {HTMLInputElement} */
export const exactPitchRadio = document.getElementById('exact-pitch-radio');

/** @type {HTMLButtonElement} */
export const clearPatternInputButton = document.getElementById('clear-pattern-input-btn');

/** @type {HTMLInputElement} */
export const melodicSearchError = document.getElementById('melodic-search-error');

/** @type {HTMLInputElement} */
export const customGABCCheckbox = document.getElementById('custom-gabc-checkbox');

/** @type {HTMLButtonElement} */
export const searchButton = document.getElementById('search-btn');


/* --------------------- Search result --------------------- */
/** @type {HTMLDivElement} */
export const searchResultDiv = document.getElementById('search-result');

/** @type {HTMLPElement} */
export const searchResultInfo = document.getElementById('search-result-info');


/* --------------------- Database-related --------------------- */
/** @type {HTMLButtonElement} */
export const viewDatabaseButton = document.getElementById('view-database-btn');

/** @type {ListItem} */
export const databaseList = document.getElementById('database-list');


/* --------------------- Chant display --------------------- */
/** @type {HTMLDivElement} */
export const chantDisplay = document.getElementById('chant-display');

/** @type {HTMLDivElement} */
export const chantInfo = document.getElementById('chant-info');

/** @type {HTMLDivElement} */
export const chantSVG = document.getElementById('chant-svg');
