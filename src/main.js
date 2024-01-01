import { highlight_contour_square, highlight_absolute, load_MEI_file, parse_search_pattern as parse_search_input, clear_all_highlight } from './utils.js';

import AQUIT_SAMPLE from '../GABCtoMEI/MEI_outfiles/01_benedicte-omnes_pem82441_aquit_AQUIT.mei?url'
import SQUARE_SAMPLE from '../GABCtoMEI/MEI_outfiles/02_benedicte-omnes_pem85041_square_SQUARE.mei?url'

document.getElementById('search-btn').addEventListener("click", load_search, false)

/**
 * Perform highlighting when user clicks on "Search" button
 */
function load_search() {
  clear_all_highlight();
  const form = document.querySelector("#search-form");
  const form_data = new FormData(form);

  // Get user's selection from the form
  const search_option = form_data.get("search-option");
  const search_bar_input = form_data.get("search-bar");
  localStorage.setItem("search-choice", search_option);
  localStorage.setItem("search-query", search_bar_input);

  // Parse search pattern into an array of number
  const search_pattern = parse_search_input(search_bar_input);

  let aquitanian_chant = sessionStorage.getItem("mei-file-1");
  let square_chant = sessionStorage.getItem("mei-file-2");

  if (search_option == "absolute") {
    highlight_absolute(aquitanian_chant, search_pattern);
  } else if (search_option == "contour-square") {
    highlight_contour_square(aquitanian_chant, square_chant, search_pattern);
  }

}

/**
 * Load predefined files when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  const prev_search_choice = localStorage.getItem("search-choice");
  const radio_checkbox = document.getElementsByName("search-option");
  for (let e of radio_checkbox) {
    if (e.value == prev_search_choice) {
      e.checked = true;
    }
  }
  const prev_search = localStorage.getItem("search-query");
  document.getElementById("search-bar").value = prev_search;

  load_MEI_file(AQUIT_SAMPLE, 1);
  load_MEI_file(SQUARE_SAMPLE, 2);
});