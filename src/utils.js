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

export function parse_user_input() {
  // let user_input = [];
  const user_input = document.getElementById('search-bar').value;
  return 
}

/**
* 
* @param {Array<Number>} search_AQ an array of number, parse from user's input
*/
export function highlight_nc_to_search_AQ(MEI_file_path, search_AQ) {
  const search_AQ_hardcode = [1, 2, 1]; // temporary hardcode
  parse_MEI_AQ(MEI_file_path)
    .then((res) => res)
    .then((nc_arr) => {
      // console.log(nc_arr);
      /**
       * nc is type NeumeComponentAQ
       * @param {NeumeComponentAQ[]} nc_arr
       */
      for (let i_nc = 0; i_nc < nc_arr.length; i_nc++) {
        if(nc_arr[i_nc].loc == search_AQ_hardcode[0]) {
          let i_search = 1;
          let search_found = [nc_arr[i_nc]];
          do {
            if(nc_arr[i_nc + i_search].loc == search_AQ_hardcode[i_search]) {
              search_found.push(nc_arr[i_nc + i_search]);
              i_search++;
            } else {
              // Reset list if no search found
              search_found = [];
              break;
            }
          } while (i_search < search_AQ_hardcode.length)
          
          // highlight the search found
          for (const nc of search_found) {
            nc.highlight();
          }
        }
      }
    });
}

/**
 * 
 * @param {Array<Number>} search_SQ an array of number, parse from user's input
 */
export function highlight_nc_to_search_SQ(MEI_file_path, search_SQ) {
  const search_AQ_hardcode = [1, 2, 1]; // temporary hardcode
  parse_MEI_SQ(MEI_file_path)
    .then((res) => res)
    .then((nc_arr) => {
      for (const nc of nc_arr) {
        nc.highlight();
      }
    });
}