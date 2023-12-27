class NeumeComponent {
  constructor(id, tilt) {
    this.id = id;
    this.tilt = tilt;
  }

  highlight() {
    const nc_svg = document.getElementById(this.id);
    nc_svg.style.fill = 'red';
  }

  unhighlight() {
    const nc_svg = document.getElementById(this.id);
    nc_svg.style.fill = 'black';
  }
}

class NeumeComponentSQ extends NeumeComponent {
  constructor(id, pname, oct, tilt) {
    super(id, tilt);
    this.pname = pname;
    this.oct = oct;
  }
}

class NeumeComponentAQ extends NeumeComponent {
  constructor(id, loc, tilt) {
    super(id, tilt);
    this.loc = loc;
  }
}

function parse_MEI(MEI_file_path) {
  let mei_array = [];
  fetch(MEI_file_path)
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
          const nc_AQ = new NeumeComponentAQ(nc_attributes.getNamedItem("xml:id").nodeValue, nc_attributes.getNamedItem("loc").nodeValue, nc_attributes.getNamedItem('tilt'));
          mei_array.push(nc_AQ);
        }
      }
    });
  console.log(mei_array);
  return mei_array;
}

export function load_search() {
  let searchField = document.getElementById('search-bar').value;
  document.getElementById('search-output').innerHTML = searchField;
}

function highlight_neume_component(nc_id) {
  let neume = document.getElementById(nc_id);

  let neume_nc = neume.querySelectorAll('g.nc');
  for (let nc of neume_nc) {
    // console.log(nc);
    nc.style.fill = 'red';
  }
}

/**
 * Load MEI file from its file path and set an order on the screen (1, 2)
 * @param {MEI_file} file_name link to the MEI (.mei) file to be rendered
 * @param {Number} order the number
 */
function load_MEI_file(file_name, order) {
  fetch(file_name)
    .then((response) => response.text())
    .then((mei) => {
      // get the ID from mei to get the <loc> 
      // console.log(mei);
      // This line initializes the Verovio toolkit
      const vero_toolkit = new verovio.toolkit();

      let zoom = 80;
      const options = {
        pageWidth: document.body.clientWidth * 50 / zoom,
        // pageHeight: document.body.clientHeight / zoom,
        scale: zoom,
      };
      vero_toolkit.setOptions(options);

      /*
      Use the mei to get the position via 'loc' attr
      Based on loc, use the xml:id from the mei to highlight SVG
      (mei xml:id == svg id) 
      */
      vero_toolkit.loadData(mei);
      let svg = vero_toolkit.renderToSVG(1);
      const meifile = document.getElementById("mei-file-" + order);

      meifile.innerHTML = svg;
      // console.log(meifile)
      highlight_neume_component('m-3f92be62-a103-11ee-b763-f2b2e3f0b573');
      // let neume = document.querySelectorAll('g.nc');

      /*
      Store all notes in a list with their ID, for example
      [{
        note
        id
      }]
  
      */

    }
    )
};

/**
 * Load predefined files when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  // load_MEI_file('/GABCtoMEI/MEI_outfiles/01_benedicte-omnes_pem82441_aquit_AQUIT.mei', 1);
  // load_MEI_file('/GABCtoMEI/MEI_outfiles/02_benedicte-omnes_pem85041_square_SQUARE.mei', 2);
  load_MEI_file('http://server.notkaramel.me/~antoine/01_benedicte-omnes_pem82441_aquit_AQUIT.mei', 1);
  parse_MEI('http://server.notkaramel.me/~antoine/01_benedicte-omnes_pem82441_aquit_AQUIT.mei')
  load_MEI_file('http://server.notkaramel.me/~antoine/02_benedicte-omnes_pem85041_square_SQUARE.mei', 2);
});