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