export function load_search() {
  let searchField = document.getElementById('search-bar').value;
  document.getElementById('search-output').innerHTML = searchField;
}

function highlight_neume_component(nc_id) {
  let neume = document.getElementById(nc_id);

  let neume_nc = neume.querySelectorAll('g.nc');
  for (let nc of neume_nc) {
    console.log(nc);
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
      console.log(mei);
      // This line initializes the Verovio toolkit
      const tk = new verovio.toolkit();

      let zoom = 80;
      const options = {
        pageWidth: document.body.clientWidth * 50 / zoom,
        pageHeight: document.body.clientHeight / zoom,
        scale: zoom,
      };
      tk.setOptions(options);

      /*
      Use the mei to get the position via 'loc' attr
      Based on loc, use the xml:id from the mei to highlight SVG
      (mei xml:id == svg id) 
      */
      tk.loadData(mei);
      let svg = tk.renderToSVG(1);
      const meifile = document.getElementById("mei-file-" + order);

      meifile.innerHTML = svg;
      console.log(meifile)
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
  load_MEI_file('/GABCtoMEI/MEI_outfiles/01_benedicte-omnes_pem82441_aquit_AQUIT.mei', 1);
  load_MEI_file('/GABCtoMEI/MEI_outfiles/02_benedicte-omnes_pem85041_square_SQUARE.mei', 2);
  // load_MEI_file('http://server.notkaramel.me/~antoine/01_benedicte-omnes_pem82441_aquit_AQUIT.mei', 1);
  // load_MEI_file('http://server.notkaramel.me/~antoine/02_benedicte-omnes_pem85041_square_SQUARE.mei', 2);
});