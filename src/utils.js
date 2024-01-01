import { NeumeComponentAQ, NeumeComponentSQ } from './components.js';

/**
 * A function that parses the MEI content of an Aquitanian chant and
 * return an array of Aquitanian Neume Component (typeof `NeumeComponentAQ`)
 * @param {MEI_content} MEI_content the content of the .mei file
 * @returns {Array<NeumeComponentAQ>} an array of NeumeComponentAQ for Aquitanian
 */
function parse_MEI_AQ(MEI_content) {
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
function parse_MEI_SQ(MEI_content) {
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
        // pageHeight: document.body.clientHeight / zoom,
        scale: zoom,
      };
      vero_toolkit.setOptions(options);
      vero_toolkit.loadData(mei);
      let svg = vero_toolkit.renderToSVG(1);
      const meifile = document.getElementById("mei-file-" + order);

      meifile.innerHTML = svg;

      // save MEI file to session
      // console.log(mei);
      sessionStorage.setItem("mei-file-" + order, mei);
    }
    )
};

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
 * A function that highlight Aquitanian chant based on its absolute location (`@loc` attribute in the MEI file)
 * @param {MEI_Content} MEI_Content the aquitanian MEI (.mei) file to be highlighted
 * @param {Array<Number>} search_pattern an array of number, parse from user's input
 */
export function highlight_absolute(MEI_Content, search_pattern) {
  let neume_array = parse_MEI_AQ(MEI_Content);
  let aq_count = 0;

  for (let i_nc = 0; i_nc < neume_array.length - search_pattern.length + 1; i_nc++) {
    if (neume_array[i_nc].loc == search_pattern[0]) {
      let i_search = 1;
      let search_found = [neume_array[i_nc]];
      while (i_search < search_pattern.length) {
        if (neume_array[i_nc + i_search].loc == search_pattern[i_search]) {
          search_found.push(neume_array[i_nc + i_search]);
          i_search++;
        } else {
          // Reset list if no search found
          search_found = [];
          break;
        }
      }

      // highlight the search found
      if(search_found.length != 0) {
        for (const nc of search_found) {
          nc.highlight();
        }
        aq_count++;
      }

    }
  }

  document.getElementById("search-count").innerHTML = aq_count;
}

/**
 * A function that highlight Aquitanian chant based on its contour location.
 * It also search the Square chant for a similar contour pattern.
 * 
 * The seach output may overlap; hence, it needs a pattern record and should allow
 * users to visit each pattern at a time.
 * @param {MEI_Content} Aquitanian_MEI the chant's MEI file in Aquitanian notation
 * @param {MEI_Content} Square_MEI the chant's MEI file in square notation 
 * @param {Array<Number>} search_pattern an array of number, parse from user's input
 */
export function highlight_contour_square(Aquitanian_MEI, Square_MEI, search_pattern) {
  /**
   * @param {Array<NeumeComponentAQ>} aquitanian_content 
   */
  let aquitanian_content = parse_MEI_AQ(Aquitanian_MEI);
  let aq_count = 0;

  for (let i_nc = 0; i_nc < aquitanian_content.length - search_pattern.length + 1; i_nc++) {
    /**
     * Algorithm:
     * 1. Get the distance between the first value of search_pattern
     * and the neume component of aquitanian_content
     * 2. Subtract all values in search_pattern by the distance 
     * found above 
     * 3. Check the matching sequence (aquitanian_content[i:].loc and search_pattern[i:])
     * until the end of search pattern.
     * 4. Highlight found pattern
    */

    /**
     * @param {Array<NeumeComponentAQ>} found_pattern the found pattern of Aquitanian Neume Component
    */
    let found_pattern = [aquitanian_content[i_nc]];
    let distance = search_pattern[0] - aquitanian_content[i_nc].loc;
    let temp_search_pattern = [...search_pattern].map((e) => e - distance);
    // console.log(temp_search_pattern)
    for (let i = 1; i < temp_search_pattern.length; i++) {
      if (aquitanian_content[i_nc + i].loc == temp_search_pattern[i]) {
        found_pattern.push(aquitanian_content[i_nc + i]);
      } else {
        found_pattern = [];
        break;
      }
    }
    if (found_pattern.length != 0) {
      // highlight the search found
      for (const nc of found_pattern) {
        nc.highlight();
        // nc.log();
      }
      aq_count++;
    }
  }
  document.getElementById("search-count").innerHTML = aq_count;

  let square_content = parse_MEI_SQ(Square_MEI);
}