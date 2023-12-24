function loadSearch() {
   // alert("button is pressed")
   let searchField = document.getElementById('search-bar').value;
   document.getElementById('search-output').innerHTML = searchField;
}

/**
 * Not being used :)
 * @param {SVGElement} neumeComponent 
 */
function blockHighlighter(neumeComponent) {
   // block highlighting
   const highlighter = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
   // highlighter.style.backgroundColor = 'yellow';
   // highlighter.setAttribute('x', '2000');
   // highlighter.setAttribute('y', '0');
   highlighter.setAttribute('fill-opacity', '30%')
   highlighter.setAttribute('width', '800px');
   highlighter.setAttribute('height', '1400px');
   highlighter.setAttribute('fill', 'yellow');

   neumeComponent.parentNode.insertBefore(highlighter, neumeComponent);
   // highlighter.appendChild(neume);
   console.log(highlighter)
}

const note = {
   'id': "",
   'location': ""
}

document.addEventListener("DOMContentLoaded", (event) => {
   verovio.module.onRuntimeInitialized = function () {
      // This line initializes the Verovio toolkit
      const tk = new verovio.toolkit();

      let zoom = 80;
      let pageWidth = document.body.clientWidth * 100 / zoom;

      options = {
         // pageHeight: pageHeight,
         pageWidth: pageWidth * 0.8,
         scale: zoom,
         // Add an option to pass note@pname and note@oct as svg @data-*
         // svgAdditionalAttribute: ["note@pname", "note@oct"]
      };
      tk.setOptions(options);

      // fetch('samples/16_Square_84863_SQUARE.mei')
      fetch('samples/07_Square_84873_SQUARE.mei')
      // fetch('samples/06_Aquit_84623_AQUIT.mei')
         .then((response) => response.text())
         .then((mei) => {
            // get the ID from mei to get the <loc> 
            console.log(mei);
            /*
            Use the mei to get the position via 'loc' attr
            Based on loc, use the xml:id from the mei to highlight SVG
            (mei xml:id == svg id) 
            */
            tk.loadData(mei);
            let svg = tk.renderToSVG(1);
            document.getElementById("notation").innerHTML = svg;

            // let neume = document.querySelectorAll('g.nc');
            let neume = document.getElementById('m-d9e4652a-8de3-11ee-8849-f2b2e3f0b574');

            console.log(neume)
            /*
            Store all notes in a list with their ID, for example
            [{
              note
              id
            }]
   
            */
            let neume_nc = neume.querySelectorAll('g.nc');
            for (let nc of neume_nc) {
               console.log(nc);
               nc.style.fill = 'red';
            }

         });
   }

});
