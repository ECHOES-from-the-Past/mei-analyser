import { highlight_nc_to_search_SQ, highlight_nc_to_search_AQ, load_MEI_file } from './utils.js';

export function load_search() {
  let searchField = document.getElementById('search-bar').value;
  document.getElementById('search-output').innerHTML = searchField;
}

/**
 * Load predefined files when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  // load_MEI_file('/GABCtoMEI/MEI_outfiles/01_benedicte-omnes_pem82441_aquit_AQUIT.mei', 1);
  // load_MEI_file('/GABCtoMEI/MEI_outfiles/02_benedicte-omnes_pem85041_square_SQUARE.mei', 2);
  load_MEI_file('http://server.notkaramel.me/~antoine/01_benedicte-omnes_pem82441_aquit_AQUIT.mei', 1);
  highlight_nc_to_search_AQ('http://server.notkaramel.me/~antoine/01_benedicte-omnes_pem82441_aquit_AQUIT.mei')
  load_MEI_file('http://server.notkaramel.me/~antoine/02_benedicte-omnes_pem85041_square_SQUARE.mei', 2);
  highlight_nc_to_search_SQ('http://server.notkaramel.me/~antoine/02_benedicte-omnes_pem85041_square_SQUARE.mei')
});