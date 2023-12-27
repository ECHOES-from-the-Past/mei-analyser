import { highlight_nc_to_search_SQ, highlight_nc_to_search_AQ, load_MEI_file } from './utils.js';

const AQUIT_SAMPLE = "http://server.notkaramel.me/~antoine/01_benedicte-omnes_pem82441_aquit_AQUIT.mei";
const SQUARE_SAMPLE = 'http://server.notkaramel.me/~antoine/02_benedicte-omnes_pem85041_square_SQUARE.mei'
document.getElementById('search-btn').addEventListener("click", load_search, false)

function load_search() {
  highlight_nc_to_search_AQ(AQUIT_SAMPLE)
}

/**
 * Load predefined files when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  // load_MEI_file('/GABCtoMEI/MEI_outfiles/01_benedicte-omnes_pem82441_aquit_AQUIT.mei', 1);
  // load_MEI_file('/GABCtoMEI/MEI_outfiles/02_benedicte-omnes_pem85041_square_SQUARE.mei', 2);
  load_MEI_file(AQUIT_SAMPLE, 1);
  load_MEI_file(SQUARE_SAMPLE, 2);
});