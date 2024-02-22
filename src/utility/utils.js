import { NeumeComponentAQ, NeumeComponentSQ } from './components.js';
import database from '../search/database.json';

const env = import.meta.env.MODE; // 'development' or 'production'

/**
 * Load MEI file from its file path and set an order on the screen (1, 2)
 * @param {MEI_filePath} filePath link to the MEI (.mei) file to be rendered
 * @param {Number} order the number
 */
export async function loadMEIFile(filePath, order) {
  let mei_content;
  await fetch(filePath)
    .then((response) => response.text())
    .then((mei) => {
      sessionStorage.setItem("mei-content-" + order, mei);
      sessionStorage.setItem("mei-file-path-" + order, filePath);
      mei_content = mei;
    })
  return mei_content;
}

/**
 * Draw the MEI content to the screen on a specific slot/order (1: left, 2: right)
 * @param {MEI_FileContent} meiContent file content of the MEI file
 * @param {Number} order 1 for left position, 2 for right position
 */
export async function drawMEIContent(meiContent, order) {
  let databasePath = "";
  if(env === "development") {
    databasePath = "../../GABCtoMEI/MEI_outfiles/";
  } else if(env === "production") {
    databasePath = "./database/";
  }

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
 * Parse user's input on the search bar via Regular Expression (Regex) to return an array of numbers.
 * Regex pattern: `/-?\d/g`
 * - an optional negative `-` sign
 * - a single digit
 * @param {FormData} searchPattern 
 * @returns {Array<Number>} an array of type number from user's input
 */
export function parseSearchPattern(searchPattern) {
  return searchPattern.match(/-?\d/g).map(Number);
}

export function clearHighlights() {
  const allNeumeComponents = document.querySelectorAll("g.nc");
  // Clear all highlighted neume components
  allNeumeComponents.forEach(element => {
    element.style.fill = 'black';
    element.style.strokeWidth = '0px';
  });
  // Clear all spotlight rectangles
  document.querySelectorAll('.spotlight-rect').forEach(e => e.remove());
}

/**
 * 
 * @param {Array<NeumeComponentAQ> | Array<NeumeComponentSQ>} found_pattern An array of type NeumeComponentAQ or NeumeComponentSQ
 */
export function highlight_pattern(found_pattern) {
  // highlight the search found
  if (found_pattern.length != 0) {
    for (const nc of found_pattern) {
      nc.highlight();
      // nc.spotlight();
    }
  }
}