import { NeumeComponent, NeumeComponentAQ, NeumeComponentSQ } from './components.js';

/**
 * Load MEI file from its file path and set an order on the screen (1, 2)
 * @param {MEI_file} file_name link to the MEI (.mei) file to be rendered
 * @param {Number} order the number
 */
export function load_MEI_file(file_name, order) {
  fetch(file_name)
    .then((response) => response.text())
    .then((mei) => {
      // This line initializes the Verovio toolkit
      const vero_toolkit = new verovio.toolkit();

      let zoom = 80;
      const options = {
        pageWidth: document.body.clientWidth * 50 / zoom,
        // pageHeight: document.body.clientHeight * 50 / zoom,
        scale: zoom,
      };
      vero_toolkit.setOptions(options);
      vero_toolkit.loadData(mei);
      let svg = vero_toolkit.renderToSVG(1);
      const meifile = document.getElementById("mei-file-" + order);

      meifile.innerHTML = svg;

      // save MEI file to session
      sessionStorage.setItem("mei-file-" + order, mei);
    })
}

/**
 * A function that parses the MEI content of an Aquitanian chant and
 * return an array of Aquitanian Neume Component (typeof `NeumeComponentAQ`)
 * @param {MEI_content} MEI_content the content of the .mei file
 * @returns {Array<NeumeComponentAQ>} an array of NeumeComponentAQ for Aquitanian
 */
export function parse_MEI_AQ(MEI_content) {
  let mei_array = [];

  // Parse the XML .mei file to mutable JS type
  let parser = new DOMParser();
  let htmldoc = parser.parseFromString(MEI_content, "text/xml");
  // Aquitanian
  const staff_layer = htmldoc.querySelectorAll('syllable');
  for (let syllable of staff_layer) {
    const neume_components = syllable.querySelectorAll('nc');

    for (const nc of neume_components) {
      const nc_attributes = nc.attributes;


      const nc_AQ = new NeumeComponentAQ(nc_attributes.getNamedItem("xml:id").nodeValue, nc_attributes.getNamedItem("loc").nodeValue, nc_attributes.getNamedItem('tilt'));
      mei_array.push(nc_AQ);
    }
  }
  return mei_array;
}

/**
 * A function that parses the MEI content of a Square notation chant and
 * return an array of Square Neume Component (typeof `NeumeComponentSQ`)
 * @param {MEI_content} MEI_content the content of the .mei file
 * @returns {Array<NeumeComponentSQ>} an array of NeumeComponentSQ for Square notation
 */
export function parse_MEI_SQ(MEI_content) {
  let sq_mei_array = [];
  // Parse the XML .mei file to mutable JS type
  let parser = new DOMParser();
  let htmldoc = parser.parseFromString(MEI_content, "text/xml");

  const all_syllables = htmldoc.querySelectorAll('syllable');

  // Iterate through every syllable of the chant
  for (let syllable of all_syllables) {
    const neume_components = syllable.querySelectorAll('nc');

    for (const nc of neume_components) {
      // getting attributes of interest from each neume component `<nc>` 
      const nc_id = nc.attributes.getNamedItem("xml:id").nodeValue;
      const nc_pitch = nc.attributes.getNamedItem("pname").nodeValue;
      const nc_octave = nc.attributes.getNamedItem("oct").nodeValue;
      const nc_tilt = nc.attributes.getNamedItem('tilt'); // could be null value

      const nc_SQ = new NeumeComponentSQ(nc_id, nc_pitch, nc_octave, nc_tilt);
      sq_mei_array.push(nc_SQ);
    }
  }
  // console.log(mei_array);
  return sq_mei_array;
}

/**
 * Parse user's input on the search bar via Regular Expression (Regex) to return an array of numbers.
 * Regex pattern: `/-?\d/g`
 * - an optional negative `-` sign
 * - a single digit
 * @param {FormData} search_pattern 
 * @returns {Array<Number>} an array of type number from user's input
 */
export function parse_search_pattern(search_pattern) {
  return search_pattern.match(/-?\d/g).map(Number);
}

export function clear_all_highlight() {
  const all_NC = document.querySelectorAll("g.nc");
  all_NC.forEach(element => {
    element.style.fill = 'black';
    element.style.strokeWidth = '0px';
  });
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
    }
  }
}

export function get_annotation_type(MEI_content) {
  let parser = new DOMParser();
  let htmldoc = parser.parseFromString(MEI_content, "text/xml");

  const staffDef = htmldoc.querySelector('staffDef');
  const lines = staffDef.attributes.getNamedItem('lines').nodeValue;
  if (lines > 1) {
    return "square";
  }
  else {
    return "aquitanian";
  }
}