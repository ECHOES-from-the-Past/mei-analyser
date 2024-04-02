/* --------------- TOP/NAVBAR ELEMENTS --------------- */
/** @type {HTMLButtonElement} */
export const searchModeButton = document.getElementById('search-mode-btn');

/** @type {HTMLButtonElement} */
export const crossComparisonModeButton = document.getElementById('cross-comparison-mode-btn');

/** @type {HTMLButtonElement} */
export const refreshDatabaseButton = document.getElementById('refresh-database-btn');

/** @type {HTMLSpanElement} */
export const refreshDatabaseWarning = document.getElementById('refresh-database-warning');

/** @type {HTMLElement} */
export const refreshIndicator = document.getElementById('refresh-indicator');

/* -------------- DOM ELEMENTS -------------- */
/* Search-related */
/** @type {HTMLInputElement} */
export const pitchRadio = document.getElementById('pitch-radio');

/** @type {HTMLInputElement} */
export const contourRadio = document.getElementById('contour-radio');

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

/** @type {HTMLInputElement} */
export const searchQueryInput = document.getElementById('search-query');

/** @type {HTMLButtonElement} */
export const searchButton = document.getElementById('search-btn');

/* Database-related */
/** @type {HTMLButtonElement} */
export const viewDatabaseButton = document.getElementById('view-database-btn');

/** @type {ListItem} */
export const databaseList = document.getElementById('database-list');

/** @type {HTMLDivElement} */
export const searchResultDiv = document.getElementById('search-result');

/* Chant display */
/** @type {HTMLDivElement} */
export const chantDisplay = document.getElementById('chant-display');

/** @type {HTMLDivElement} */
export const chantInfo = document.getElementById('chant-info');

/** @type {HTMLDivElement} */
export const chantSVG = document.getElementById('chant-svg');

/** @type {HTMLElement} */
export const chantMenuLeft = document.getElementById('database-chant-left');

/** @type {HTMLElement} */
export const chantMenuRight = document.getElementById('database-chant-right');

/** @type {HTMLInputElement} */
export const fileInputLeft = document.getElementById('file-input-left');

/** @type {HTMLInputElement} */
export const fileInputRight = document.getElementById('file-input-right');