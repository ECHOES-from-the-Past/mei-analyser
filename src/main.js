import {
  load_MEI_file,
  parse_MEI_AQ,
  parse_MEI_SQ,
  parse_search_pattern,
  clear_all_highlight,
  get_annotation_type
} from './utils.js';
import {
  highlight_contour_AQ,
  highlight_contour_SQ,
  pattern_analysis
} from './search_algo.js';

import AQUIT_SAMPLE from '../GABCtoMEI/MEI_outfiles/01_benedicte-omnes_pem82441_aquit_AQUIT.mei?url'
import SQUARE_SAMPLE from '../GABCtoMEI/MEI_outfiles/02_benedicte-omnes_pem85041_square_SQUARE.mei?url'

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

document.getElementById('search-btn').addEventListener("click", load_search, false);
document.getElementById('file-input-1').addEventListener("change", () => {
  upload_file(1);
}, false);

document.getElementById('file-input-2').addEventListener("change", () => {
  upload_file(2)
}, false);

document.getElementById('cross-comparison-btn').addEventListener("click", () => {
  clear_all_highlight();
  let left_chant = sessionStorage.getItem("mei-file-1");
  let right_chant = sessionStorage.getItem("mei-file-2");

  let left_chant_content, right_chant_content;
  // Parse MEI file into an array of NeumeComponent
  if(get_annotation_type(left_chant) == "aquitanian"){
    left_chant_content = parse_MEI_AQ(left_chant);
  } else if (get_annotation_type(left_chant) == "square"){
    left_chant_content = parse_MEI_SQ(left_chant);
  }

  if(get_annotation_type(right_chant) == "aquitanian"){
    right_chant_content = parse_MEI_AQ(right_chant);
  } else if (get_annotation_type(right_chant) == "square"){
    right_chant_content = parse_MEI_SQ(right_chant);
  }

  pattern_analysis(left_chant_content, right_chant_content);
}, false);

/**
 * Upload file to a slot on the display (1: left, 2: right) for cross-comparison
 * @param {Number} slot either 1 or 2
 */
function upload_file(slot) {
  clear_all_highlight();
  const uploaded_file = document.getElementById('file-input-' + slot).files[0];
  // console.log(uploaded_file);
  const objectURL = URL.createObjectURL(uploaded_file);
  // console.log(objectURL);
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

  let left_chant = sessionStorage.getItem("mei-file-1");
  let right_chant = sessionStorage.getItem("mei-file-2");

  // console.log(left_chant);
  // console.log(right_chant);

  if (search_option == "contour") {
    process_contour(left_chant, search_pattern);
    process_contour(right_chant, search_pattern);
  }
}

function cross_comparison() {
}

function process_contour(MEI_file, search_pattern) {
  // console.log(get_annotation_type(MEI_file));
  if (get_annotation_type(MEI_file) == "aquitanian") {
    const aquitanian_content = parse_MEI_AQ(MEI_file);
    highlight_contour_AQ(aquitanian_content, search_pattern);
  } else if (get_annotation_type(MEI_file) == "square") {
    const square_content = parse_MEI_SQ(MEI_file);
    console.log(square_content[0]);
    highlight_contour_SQ(square_content, search_pattern);
  }
}