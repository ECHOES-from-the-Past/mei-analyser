import { load_MEI_file, parse_search_pattern, clear_all_highlight } from './utils.js';
import { highlight_absolute, highlight_aquitanian_pattern, highlight_contour_AQ, highlight_contour_SQ } from './search_algo.js';

import AQUIT_SAMPLE from '../GABCtoMEI/MEI_outfiles/01_benedicte-omnes_pem82441_aquit_AQUIT.mei?url'
import SQUARE_SAMPLE from '../GABCtoMEI/MEI_outfiles/02_benedicte-omnes_pem85041_square_SQUARE.mei?url'

document.getElementById('search-btn').addEventListener("click", load_search, false);
document.getElementById('file-input-1').addEventListener("change", () => {
  upload_file(1);
}, false);

document.getElementById('file-input-2').addEventListener("change", (evt) => {
  upload_file(2)
}, false);


/**
 * 
 */
function upload_file(slot) {
  clear_all_highlight();
  const uploaded_file = document.getElementById('file-input-' + slot).files[0];
  console.log(uploaded_file);
  const objectURL = URL.createObjectURL(uploaded_file);
  console.log(objectURL)
  load_MEI_file(objectURL, slot);
  URL.revokeObjectURL(upload_file);

}

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
  const search_pattern = parse_search_pattern(search_bar_input);

  let aquitanian_chant = sessionStorage.getItem("mei-file-1");
  let square_chant = sessionStorage.getItem("mei-file-2");

  if (search_option == "absolute") {
    highlight_absolute(aquitanian_chant, search_pattern);
  } else if (search_option == "pattern") {
    highlight_aquitanian_pattern(aquitanian_chant, search_pattern);
  } else if (search_option == "contour") {
    highlight_contour_AQ(aquitanian_chant, search_pattern);
    highlight_contour_SQ(square_chant, search_pattern);
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