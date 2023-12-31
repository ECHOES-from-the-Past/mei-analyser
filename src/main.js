import { highlight_contour_square, highlight_absolute, load_MEI_file, parse_search_pattern,   clear_all_highlight } from './utils.js';

import AQUIT_SAMPLE from '../GABCtoMEI/MEI_outfiles/01_benedicte-omnes_pem82441_aquit_AQUIT.mei?url'
import SQUARE_SAMPLE from '../GABCtoMEI/MEI_outfiles/02_benedicte-omnes_pem85041_square_SQUARE.mei?url'

document.getElementById('search-btn').addEventListener("click", load_search, false)

function load_search() {
  clear_all_highlight();
  const form = document.querySelector("#search-form");
  const form_data = new FormData(form);

  const search_option = form_data.get("search-option");
  const search_pattern = form_data.get("search-bar");
  console.log(search_option)
  if(search_option == "absolute") {
    let user_input = parse_search_pattern(search_pattern);
    highlight_absolute(AQUIT_SAMPLE, user_input);
  } else if (search_option == "contour-square") {
    highlight_contour_square(AQUIT_SAMPLE);
  }

}

/**
 * Load predefined files when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  load_MEI_file(AQUIT_SAMPLE, 1);
  load_MEI_file(SQUARE_SAMPLE, 2);
});