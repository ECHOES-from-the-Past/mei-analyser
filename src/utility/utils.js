import { NeumeComponent, SyllableWord } from "./components.js";

/*
Note for utility functions: These functions are primarily used on the client side (DOM)
and are not used in the server-side code. Be aware when importing these functions.
*/

export const env = import.meta.env.MODE; // 'development' or 'production'
console.debug(`Current environment: ${env}`);

/**
 * Display the certainty percentage on the screen.
 * @param {Number} certaintyPercentage the certainty percentage of the search result
 * @returns the certainty percentage
 * @example displayCertainty(0.8) --> "80%"
 */
export function displayCertainty(certaintyPercentage) {
  return (certaintyPercentage.toFixed(2) * 100).toFixed(0) + "%";
}

/**
 * @source https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
 * @param {string} str the string to be capitalized its first letter
 * @returns the string with its first letter capitalized/to uppercase
 */
export function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Load MEI file from its file path
 * @param {string} fileName link to the MEI (.mei) file to be rendered
 * @returns the content of the MEI file
 */
export async function loadMEIFile(fileName) {
  return await fetch(fileName)
    .then((response) => response.text())
    .then((meiContent) => {
      return meiContent;
    })
    .catch((error) => {
      console.error(`Error: ${error}`);
    });
}

/* ------------------------ HIGHLIGHTING SVGs --------------------------- */
/**
 * Put an SVG Element in a spotlight by surrounding it with a box.
 * @param {SyllableWord} syllableWord the syllable word (not the syllable) to be spotlighted
 * @param {String} color the fill colour of the surrounding box (default: 'rgba(149, 48, 217, 0.6)' - purple)
 * @param {String} stroke_color the stroke colour of the surrounding box (default: 'rgba(149, 48, 217, 1)' - purple)
 */
export function spotlightText(syllableWord) {
  let color = "var(--melisma-text)";
  const syllableWords = document.querySelectorAll(`[id="${syllableWord.id}"]`);
  syllableWords.forEach((text) => {
    let tspan = text.querySelector("tspan");
    tspan.style.fill = color;
    tspan.style.fontWeight = "600";
  });
}

/**
 * Put the neume component in a spotlight by surrounding it with a box.
 * @param {NeumeComponent} neumeComponent the neume component to be spotlighted
 * @param {String} color the fill colour of the surrounding box (default: 'rgba(149, 48, 217, 0.6)' - purple)
 * @param {String} stroke_color the stroke colour of the surrounding box (default: 'rgba(149, 48, 217, 1)' - purple)
 */
export function spotlightNeumeComponent(
  neumeComponent,
  color = "var(--spotlight-fill)",
  stroke_color = "var(--spotlight-stroke)"
) {
  const nc_svg = document.querySelectorAll(`[id="${neumeComponent.id}"]`);
  nc_svg.forEach((nc) => {
    // Newer version of Verovio gives "translate(438, 4653) scale(0.72, 0.72)"
    // Translate (x, y), horizontal L2R, vertical T2B
    let ncTransform = nc
      .querySelector("use")
      .attributes.getNamedItem("transform").value;
    let coords = ncTransform.match(/\d+\.?\d+/g);
    let x_coord = coords[0],
      y_coord = coords[1];

    const width = "300";
    const height = "400";

    // construct a spotlight rectangle to highlight the neume component
    const spotlight = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    spotlight.setAttribute("class", "spotlight-rect");
    spotlight.setAttribute("x", x_coord - width / 3);
    spotlight.setAttribute("y", y_coord - height / 2);
    spotlight.setAttribute("width", width);
    spotlight.setAttribute("height", height);
    spotlight.setAttribute("fill", color);
    spotlight.setAttribute("stroke", stroke_color);
    spotlight.setAttribute("stroke-width", "30px");
    // Display the spotlight rectangle
    nc.appendChild(spotlight);
  });
}

/**
 * Highlight the neume component.
 * @param {NeumeComponent} nc the NeumeComponent object
 * @param {String} color the fill colour of the neume component (default: 'rgba(149, 48, 217, 0.6)' - purple)
 * @param {String} stroke_color the stroke colour of the neume component (default: 'rgba(149, 48, 217, 1)' - purple)
 */
export function highlightNeumeComponent(
  neumeComponent,
  color = "var(--highlight-fill)",
  stroke_color = "var(--highlight-stroke)"
) {
  const nc_svg = document.querySelectorAll(`[id="${neumeComponent.id}"]`);
  nc_svg.forEach((nc) => {
    nc.style.fill = color;
    nc.style.stroke = stroke_color;
    nc.style.strokeWidth = "30px";
  });
}

export function highlightSvgElementById(
  svgID,
  color = "var(--highlight-fill)",
  stroke_color = "var(--highlight-stroke)"
) {
  const nc_svg = document.querySelectorAll(`[id="${svgID}"]`);
  nc_svg.forEach((nc) => {
    nc.style.fill = color;
    nc.style.stroke = stroke_color;
    nc.style.strokeWidth = "30px";
  });
}
/**
 *
 */
export function unhighlight(neumeComponent) {
  const nc_svg = document.querySelectorAll(`[id="${neumeComponent.id}"]`);
  nc_svg.forEach((nc) => {
    nc.style.fill = "black";
  });
}

export function clearAllHighlights() {
  const allNeumeComponents = document.querySelectorAll("g.nc");
  // Clear all highlighted neume components
  allNeumeComponents.forEach((element) => {
    // @ts-ignore
    element.style.fill = "black";
    // @ts-ignore
    element.style.strokeWidth = "0px";
  });
  // Clear all spotlight rectangles
  document.querySelectorAll(".spotlight-rect").forEach((e) => e.remove());
}

/**
 * Highlighting a pattern of neume components on the screen
 * @param {NeumeComponent[]} pattern an array neume components
 */
export function highlightPattern(
  pattern,
  color = "var(--highlight-fill)",
  stroke_color = "var(--highlight-stroke)"
) {
  for (const nc of pattern) {
    highlightNeumeComponent(nc, color, stroke_color);
  }
}

/**
 * Spotlight a pattern of neume components on the screen
 * @param {NeumeComponent[]} pattern an array neume components
 */
export function spotlightPattern(
  pattern,
  color = "var(--spotlight-fill)",
  stroke_color = "var(--spotlight-stroke)"
) {
  for (const nc of pattern) {
    spotlightNeumeComponent(nc, color, stroke_color);
  }
}

/**
 * Log the neume component to the console.
 * Useful for debugging purposes.
 */
function logNeumeComponent(neumeComponent) {
  const nc_svg = document.querySelectorAll(`[id="${neumeComponent.id}"]`);
  nc_svg.forEach((nc) => {
    console.log(nc);
  });
}

/** Persistance functions for the project */

/**
 * Persist a piece of data to the browser's local storage.
 * @param {String} key
 * @param {String} value
 */
export function persist(key, value) {
  value = JSON.stringify(value);
  localStorage.setItem(key, value);
}

/**
 * Retrieve a piece of data from the browser's local storage, given a key.
 * The syntax being used is `localStorage.getItem(key)`.
 * @param {String} key
 */
export function retrieve(key) {
  // @ts-ignore
  return JSON.parse(localStorage.getItem(key));
}

export function clearStorage() {
  localStorage.clear();
}

/**
 *
 * @param {String} key
 * @returns true if the key exists in the local storage, false otherwise
 */
export function checkPersistanceExists(key) {
  return localStorage.getItem(key) !== null;
}
