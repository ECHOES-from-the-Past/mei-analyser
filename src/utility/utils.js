import { NeumeComponentAQ, NeumeComponentSQ } from './components.js';
import {
  chantInfo
} from '../DOMelements.mjs';
import database from '../database/database.json';

const env = import.meta.env.MODE; // 'development' or 'production'

/** @type {String} root path to the database folder based on the environment */
let databasePath = "";
if (env === "development") {
  databasePath = "../../GABCtoMEI/MEI_outfiles/";
} else if (env === "production") {
  databasePath = "./database/";
}

/**
 * Load MEI file from its file path and set an order on the screen (1, 2)
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

/**
 * Draw the MEI content to the screen on a specific slot/order (1: left, 2: right)
 * @param {string} meiContent file content of the MEI file
 * @param {Number} order 1 for left position, 2 for right position
 */
export async function drawMEIContent(meiContent, order) {
  if (meiContent == null) {
    // In case the MEI content is not loaded (e.g., on first load of the page), load the sample MEI content
    const sampleAquitanianChant = databasePath + database[0];
    const sampleSquareChant = databasePath + database[1];
    if (order == 1) {
      meiContent = await loadMEIFile(sampleAquitanianChant, 1);
    } else if (order == 2) {
      meiContent = await loadMEIFile(sampleSquareChant, 2);
    } else {
      console.error(`Cannot load sample MEI content to invalid order: ${order}.\n Should be 1 (left) or 2 (right).`);
    }
  }

  // This line initializes the Verovio toolkit
  try {
    let verovioToolkit = new verovio.toolkit();

    // Setting options for the toolkit
    let zoom = 80;
    verovioToolkit.setOptions({
      pageWidth: document.body.clientWidth * 50 / zoom,
      adjustPageHeight: true,
      shrinkToFit: true,
      scale: zoom,
      footer: "none",
    });

    verovioToolkit.loadData(meiContent);
    let svg = verovioToolkit.renderToSVG(1);

    // Get the div element to render the MEI content and set the innerHTML to the SVG content
    const meifile = document.getElementById("mei-file-" + order);
    meifile.innerHTML = svg;

  } catch (error) {
    console.error(error);
    console.log("Please reload the page and try again.");
  }
}

/**
 * Draw the MEI content to the screen on a specific slot/order (1: left, 2: right)
 * @param {MEI_FileContent} meiContent file content of the MEI file
 * @returns {SVGElement} SVG content of the MEI file
 */
export function drawSVGFromMEIContent(meiContent) {
  try {
    /** @type {SVGElement} */
    let svg;
    // This line initializes the Verovio toolkit
    let verovioToolkit = new verovio.toolkit();

    // Setting options for the toolkit
    let zoom = 80;
    verovioToolkit.setOptions({
      pageWidth: document.body.clientWidth * 60 / zoom,
      adjustPageHeight: true,
      shrinkToFit: true,
      scale: zoom,
      footer: "none",
    });
    verovioToolkit.loadData(meiContent);
    svg = verovioToolkit.renderToSVG(1);

    return svg;
  } catch (error) {
    console.error(error);
    console.log("Please reload the page and try again.");
  }
}

/**
 * Parse user's input on the search bar via Regular Expression (Regex) to return an array of numbers.
 * Regex pattern: `/-?\d/g`
 * - an optional negative `-` sign
 * - a single digit
 * @param {string} searchPattern 
 * @returns {number[]} an array of type number from user's input
 */
export function parseSearchPattern(searchPattern) {
  return searchPattern.match(/-?\d/g).map(Number);
}

export function clearHighlights() {
  const allNeumeComponents = document.querySelectorAll("g.nc");
  // Clear all highlighted neume components
  allNeumeComponents.forEach(element => {
    // @ts-ignore
    element.style.fill = 'black';
    // @ts-ignore
    element.style.strokeWidth = '0px';
  });
  // Clear all spotlight rectangles
  document.querySelectorAll('.spotlight-rect').forEach(e => e.remove());
}

/**
 * Highlighting a pattern of neume components on the screen
 * @param {NeumeComponentAQ[] | NeumeComponentSQ[]} pattern an array of type NeumeComponentAQ or NeumeComponentSQ
 */
export function highlightPattern(pattern) {
  for (const nc of pattern) {
    nc.highlight();
    // nc.spotlight();
  }
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

/**
 * 
 * @param {Chant} chant the chant which information is to be extracted and printed
 */
export function printChantInformation(chant) {
  chantInfo.innerHTML = '';
  let title = document.createElement('h3');
  title.textContent = "Chant Information";
  chantInfo.appendChild(title);
  let info = {
    "File Name": chant.fileName,
    "Notation Type": chant.notationType,
    "Mode": chant.mode,
    "PEM Database URL": chant.pemDatabaseUrl
  };
  for (let k in info) {
    let p = document.createElement('p');
    p.innerHTML = `<b>${k}</b>: ${info[k]}`;
    chantInfo.appendChild(p);
  }
}