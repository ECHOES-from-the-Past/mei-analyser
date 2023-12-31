import { NeumeComponentAQ, NeumeComponentSQ } from './components.js';

async function parse_MEI_AQ(MEI_file_path) {
  let mei_array = [];
  await fetch(MEI_file_path)
    .then((res) => res.text())
    .then((mei) => {
      // Parse the XML .mei file to mutable JS type
      let parser = new DOMParser();
      let htmldoc = parser.parseFromString(mei, "text/xml");
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
    });
  return mei_array;
}

async function parse_MEI_SQ(MEI_file_path) {
  let mei_array = [];
  await fetch(MEI_file_path)
    .then((res) => res.text())
    .then((mei) => {
      // Parse the XML .mei file to mutable JS type
      let parser = new DOMParser();
      let htmldoc = parser.parseFromString(mei, "text/xml");
      // console.log(htmldoc);
      // Aquitanian
      const staff_layer = htmldoc.querySelectorAll('syllable');
      for (let syllable of staff_layer) {
        // console.log(syllable);
        const neume_components = syllable.querySelectorAll('nc');

        for (const nc of neume_components) {
          const nc_attributes = nc.attributes;
          // nc_attributes contains loc.nodeValue and xml:id.nodeValue
          const nc_AQ = new NeumeComponentSQ(nc_attributes.getNamedItem("xml:id").nodeValue, nc_attributes.getNamedItem("pname").nodeValue, nc_attributes.getNamedItem("oct").nodeValue, nc_attributes.getNamedItem('tilt'));
          mei_array.push(nc_AQ);
        }
      }
    });
  // console.log(mei_array);
  return mei_array;
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
 * @param {file} MEI_file_path the aquitanian MEI (.mei) file to be highlighted
 * @param {Array<Number>} search_pattern an array of number, parse from user's input
 */
export function highlight_absolute(MEI_file_path, search_pattern) {
  parse_MEI_AQ(MEI_file_path)
    .then((res) => res)
    .then((nc_arr) => {
      let search_count = 0;

      /**
       * nc is type NeumeComponentAQ
       * @param {NeumeComponentAQ[]} nc_arr
       */
      for (let i_nc = 0; i_nc < nc_arr.length; i_nc++) {
        if (nc_arr[i_nc].loc == search_pattern[0]) {
          let i_search = 1;
          let search_found = [nc_arr[i_nc]];
          while (i_search < search_pattern.length) {
            if (nc_arr[i_nc + i_search].loc == search_pattern[i_search]) {
              search_found.push(nc_arr[i_nc + i_search]);
              i_search++;
            } else {
              // Reset list if no search found
              search_found = [];
              break;
            }
          }

          // highlight the search found
          for (const nc of search_found) {
            nc.highlight();
          }
          search_count++;

        }
      }

      document.getElementById("search-count").innerHTML = search_count;
    });
}

/**
 * A function that highlight Aquitanian chant based on its contour location.
 * It also search the Square chant for a similar contour pattern.
 * 
 * The seach output may overlap; hence, it needs a pattern record and should allow
 * users to visit each pattern at a time.
 * @param {file} Aquitanian_Chant the chant's MEI file in Aquitanian notation
 * @param {file} Square_Chant the chant's MEI file in square notation 
 * @param {Array<Number>} search_pattern an array of number, parse from user's input
 */
export function highlight_contour_square(Aquitanian_Chant, Square_Chant, search_pattern) {
  parse_MEI_AQ(Aquitanian_Chant)
  .then((res) => res)
  .then((nc_arr) => {
    let search_count = 0;
    /**
     * nc is type NeumeComponentAQ
     * @param {NeumeComponentAQ[]} nc_arr
     */
    for (let i_nc = 0; i_nc < nc_arr.length; i_nc++) {
      if (nc_arr[i_nc].loc == search_pattern[0]) {
        let i_search = 1;
        let search_found = [nc_arr[i_nc]];
        while (i_search < search_pattern.length) {
          if (nc_arr[i_nc + i_search].loc == search_pattern[i_search]) {
            search_found.push(nc_arr[i_nc + i_search]);
            i_search++;
          } else {
            // Reset list if no search found
            search_found = [];
            break;
          }
        }

        // highlight the search found
        for (const nc of search_found) {
          nc.highlight();
        }
        search_count++;

      }
    }

    document.getElementById("search-count").innerHTML = search_count;
  });

  parse_MEI_SQ(Square_Chant)
  .then((res) => res)
  .then(() => {
    console.log("hehe");
  })
}