import { env } from "./utils";

/**
 * An "abstract" class for a Neume Component (`<nc>`).
 * All Neume Components has an id and an optional tilt field.
 */
export class NeumeComponent {
  /**
   * Constructor of a Neume Component.
   * @param {String} id (required) the `@xml:id` attribute of the neume component 
   * @param {*} tilt (optional) the tilt direction of the neume component (e.g., "s", "ne")
   * @param {*} ornamental (optional) the ornamental shape of the component
   * 
   */
  constructor(id, tilt, ornamental) {
    this.id = id;
    this.tilt = tilt;
    this.ornamental = ornamental;
  }

  getId() {
    return this.id;
  }

  getTilt() {
    return this.tilt;
  }

  getOrnamental() {
    return this.ornamental;
  }

  /**
   * Highlight the neume component.
   * @param {String} color the fill colour of the neume component (default: 'rgba(149, 48, 217, 0.6)' - purple)
   * @param {String} stroke_color the stroke colour of the neume component (default: 'rgba(149, 48, 217, 1)' - purple)
   */
  highlight(color = 'var(--highlight-fill)', stroke_color = 'var(--highlight-stroke)') {
    const nc_svg = document.querySelectorAll(`[id="${this.id}"]`);
    nc_svg.forEach((nc) => {
      nc.style.fill = color;
      nc.style.stroke = stroke_color;
      nc.style.strokeWidth = '30px';
    });
  }

  /**
   * Put the neume component in a spotlight by surrounding it with a box.
   * @param {String} color the fill colour of the surrounding box (default: 'rgba(149, 48, 217, 0.6)' - purple)
   * @param {String} stroke_color the stroke colour of the surrounding box (default: 'rgba(149, 48, 217, 1)' - purple)
   */
  spotlight(color = 'var(--highlight-fill)', stroke_color = 'var(--highlight-stroke)') {
    const nc_svg = document.querySelectorAll(`[id="${this.id}"]`);
    nc_svg.forEach((nc) => {
      const x_coord = nc.querySelector('use').attributes.getNamedItem('x').value;
      const y_coord = nc.querySelector('use').attributes.getNamedItem('y').value;
      const width = '300';
      const height = '400';

      // construct a spotlight rectangle to highlight the neume component
      const spotlight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      spotlight.setAttribute('class', 'spotlight-rect');
      spotlight.setAttribute('x', x_coord - width / 3);
      spotlight.setAttribute('y', y_coord - height / 2);
      spotlight.setAttribute('width', width);
      spotlight.setAttribute('height', height);
      spotlight.setAttribute('fill', color);
      spotlight.setAttribute('stroke', stroke_color);
      spotlight.setAttribute('stroke-width', '30px');
      // Display the spotlight rectangle
      nc.appendChild(spotlight);
    });
  }

  unhighlight() {
    const nc_svg = document.querySelectorAll(`[id="${this.id}"]`);
    nc_svg.forEach((nc) => {
      nc.style.fill = 'black';
    });
  }

  /**
   * Log the neume component to the console.
   * Useful for debugging purposes.
   */
  log() {
    const nc_svg = document.querySelectorAll(`[id="${this.id}"]`);
    nc_svg.forEach((nc) => {
      console.log(nc);
    });
  }
}

/**
 * The Neume Component class for Square notation.
 */
export class NeumeComponentSQ extends NeumeComponent {
  /**
   * Constructor of a Neume Component for Square notation.
   * @param {String} id (required) the `@xml:id` attribute of the neume component
   * @param {*} tilt (optional) the tilt direction of the neume component (e.g., "s", "ne")
   * @param {*} ornamental (optional) the ornamental shape of the component
   * @param {String} pname pitch name of the note. (e.g. "d")
   * @param {Number} oct octave of the note. (e.g. 8)
   */
  constructor(id, tilt, ornamental, pname, oct) {
    super(id, tilt, ornamental);
    this.pname = pname;
    this.oct = oct;
  }

  /**
   * Represent square neume component using base-7 value
   * Septenary = pitch * 7^0 + octave * 7^1
   */
  septenary() {
    const sq_pitch = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    return Number(sq_pitch.indexOf(this.pname)) + Number(this.oct) * 7;
  }

  getPitch() {
    return this.pname;
  }

  getOctave() {
    return Number(this.oct);
  }
}

/**
 * The Neume Component class for <b>Aquitanian</b> notation.
 */
export class NeumeComponentAQ extends NeumeComponent {
  /**
   * Constructor of a Neume Component for Aquitanian notation.
   * @param {String} id (required) the `@xml:id` attribute of the neume component 
   * @param {*} tilt (optional) the tilt direction of the neume component (e.g., "s", "ne")
   * @param {*} ornamental (optional) the ornamental shape of the component
   * @param {Number} loc location of the note relative to the staff
   */
  constructor(id, tilt, ornamental, loc) {
    super(id, tilt, ornamental);
    this.loc = loc;
  }

  getLoc() {
    return Number(this.loc);
  }
}


export class SyllableWord {
  /**
   * Constructor of a SyllableWord object.
   * @param {String} id the `@xml:id` attribute of the syllable
   * @param {String} text the text of the syllable
   * @param {String} position the position of the syllable
   * 
   * Note for the position:
   * - 'i' for initial
   * - 'm' for medial
   * - 't' for terminal
   * - 's' for single/standalone
   */
  constructor(id, text, position) {
    this.id = id;
    this.text = text;
    this.position = position;
  }

  getId() {
    return this.id;
  }

  getText() {
    return this.text;
  }
}

/**
 * A class for a Syllable object.
 * Each syllable is composed of an array of NeumeComponents
 * and a syllable text. They also has an unique id.
 * @property {String} id the `@xml:id` attribute of the syllable
 * @property {SyllableText} text the text of the syllable
 * @property {NeumeComponent[]} neumeComponents an array of NeumeComponent
 */
export class Syllable {
  /**
   * Constructor of a Syllable object.
   * @param {String} id the `@xml:id` attribute of the syllable
   * @param {SyllableWord} syllableWord the text of the syllable
   * @param {NeumeComponent[]} neumeComponents an array of NeumeComponent
   */
  constructor(id, syllableWord, neumeComponents) {
    this.id = id;
    this.syllableWord = syllableWord;
    this.neumeComponents = neumeComponents;
  }

  getId() {
    return this.id;
  }
}

/** 
 * @property {string} filePath the path of the .mei file
 * @property {string} fileName the name of the .mei file
 * @property {string} meiContent the content of the .mei file
 * @property {XMLDocument} meiParsedContent the parsed content of the .mei file. This is only useful in chant creation
 * @property {string} notationType the notation type of the chant (either "aquitanian" or "square")
 * @property {NeumeComponentAQ[] | NeumeComponentSQ[]} neumeComponents an array of NeumeComponent
 * @property {number} mode the mode of the chant
 * @property {number} modeCertainty the certainty of the mode detection
 * @property {string} modeDescription an explaination of the mode detection
 * @property {string[]} pemDatabaseUrls the URL of the file on the PEM (Portuguese Early Music) database
 * @property {string} title the title of the chant
 * @property {string} source the source of the chant
*/
export class Chant {
  /**
   * Constructing a Chant object from a .mei file content
   * @param {MEI_Content} meiContent The content of the .mei file
   * @param {String} filePath the path of the .mei file
   */
  constructor(meiContent, filePath) {
    // Parse the XML .mei file to mutable JS type
    let parser = new DOMParser();
    let htmldoc = parser.parseFromString(meiContent, "text/xml");

    /** @type {String} */
    this.filePath = filePath; // could be null, but shouldn't be
    /** @type {String} */
    this.fileName = filePath.split('/').pop();
    this.meiContent = meiContent;
    // Getting the content of the MEI file
    /** @type {XMLDocument} */
    this.meiParsedContent = htmldoc.children[0];

    /** @type {string} */
    this.notationType = this.parseMEIContentForNotationType();

    this.syllables = this.parseMeiForSyllables();

    /** @type {NeumeComponentAQ[] | NeumeComponentSQ[]} */
    this.neumeComponents = this.parseMEIforNeumeComponents();

    if (this.getNotationType() === "square") {
      let [sqMode, sqRating, modeDescription] = this.calculateSquareMode();
      this.mode = sqMode == -1 ? undefined : sqMode;
      this.modeCertainty = sqRating * 100;

      /** @type {string} an explaination of the mode detection only availble for Square notation */
      this.modeDescription = modeDescription;
    } else if (this.getNotationType() === "aquitanian") {
      let mode = this.calculateAquitanianMode();
      this.mode = mode == -1 ? undefined : mode;
      this.modeCertainty = mode == -1 ? undefined : 100;
    }

    /** 
     * @type {string[]}
     * @description the URL of the file on the PEM (Portuguese Early Music) database.
     * Some chants have multiple URLs, so it's an array of URLs.
    */
    this.pemDatabaseUrls = this.obtainDatabaseUrls();

    this.title = this.obtainTitle();

    this.source = this.obtainSource();
  }

  /**
   * Parse the MEI Content to extract the neume components
   * @returns {NeumeComponentAQ[] | NeumeComponentSQ[]} an array of NeumeComponent
   */
  parseMEIforNeumeComponents() {
    const allSyllables = this.meiParsedContent.querySelectorAll('syllable');

    let ncArray = [];
    // Iterate through every syllable of the chant
    for (let syllable of allSyllables) {
      // Obtain a list of neume components `<nc>` in the syllable
      const ncList = syllable.querySelectorAll('nc');
      for (const nc of ncList) {
        // Getting common attributes of NeumeComponent: id, tilt, ornamental
        const id = nc.attributes.getNamedItem("xml:id").value;
        let tilt = nc.attributes.getNamedItem('tilt');
        tilt = tilt != null ? tilt.value : null;
        const ornamental = nc.children.length > 0 ? {
          "type": nc.children[0].nodeName,
          "id": nc.children[0].attributes.getNamedItem("xml:id").value
        } : null;

        if (this.notationType === "square") {
          // Getting all the necessary attributes of NeumeComponentSQ
          const pitch = nc.attributes.getNamedItem("pname").value;
          const octave = nc.attributes.getNamedItem("oct").value;

          const nc_SQ = new NeumeComponentSQ(id, tilt, ornamental, pitch, octave);
          ncArray.push(nc_SQ);
        } else if (this.notationType === "aquitanian") {
          // Getting the necessary attribute of NeumeComponentAQ
          const loc = nc.attributes.getNamedItem("loc").value;

          const nc_AQ = new NeumeComponentAQ(id, tilt, ornamental, loc);
          ncArray.push(nc_AQ);
        }
      }
    }
    return ncArray;
  }

  parseMeiForSyllables() {
    const allSyllables = this.meiParsedContent.querySelectorAll('syllable');
    let syllableArray = [];

    for (let syllable of allSyllables) {
      const syl = syllable.querySelector('syl');
      const sylWordId = syl.attributes.getNamedItem("xml:id").value;
      const sylWordText = syl.textContent;
      const sylWordPosition = syl.attributes.getNamedItem("wordpos").value;
      // Creating a SyllableText object
      const syllableWordObject = new SyllableWord(sylWordId, sylWordText, sylWordPosition);

      // Getting all the neume components enclosed in the syllable
      const ncList = syllable.querySelectorAll('nc');
      let neumeComponents = [];
      for (const nc of ncList) {
        const ncId = nc.attributes.getNamedItem("xml:id").value;
        let ncTilt = nc.attributes.getNamedItem('tilt');
        ncTilt = ncTilt != null ? ncTilt.value : null;
        const ncOrnamental = nc.children.length > 0 ? {
          "type": nc.children[0].nodeName,
          "id": nc.children[0].attributes.getNamedItem("xml:id").value
        } : null;

        if (this.notationType === "square") {
          // Getting all the necessary attributes of NeumeComponentSQ
          const pitch = nc.attributes.getNamedItem("pname").value;
          const octave = nc.attributes.getNamedItem("oct").value;

          const nc_SQ = new NeumeComponentSQ(ncId, ncTilt, ncOrnamental, pitch, octave);
          neumeComponents.push(nc_SQ);
        } else if (this.notationType === "aquitanian") {
          // Getting the necessary attribute of NeumeComponentAQ
          const loc = nc.attributes.getNamedItem("loc").value;

          const nc_AQ = new NeumeComponentAQ(ncId, ncTilt, ncOrnamental, loc);
          neumeComponents.push(nc_AQ);
        }
      }
      // Creating a Syllable object
      const id = syllable.attributes.getNamedItem("xml:id").value;
      const syllableObj = new Syllable(id, syllableWordObject, neumeComponents);
      syllableArray.push(syllableObj);
    }
    return syllableArray;
  }

  /**
   * Parse the MEI Content to extract the notation type
   * @returns {string} the notation type of the chant (either "aquitanian" or "square")
   */
  parseMEIContentForNotationType() {
    const staffDef = this.meiParsedContent.querySelector('staffDef');
    const lines = staffDef.attributes.getNamedItem('lines').value;
    if (lines > 1) {
      return "square";
    } else {
      return "aquitanian";
    }
  }

  /**
   * Helper function to calculate the mode of the Aquitanian chant.
   * Refer to https://github.com/ECHOES-from-the-Past/mei-analyser/issues/8 for Aquitanian mode detection
   * @returns {number} the mode of the chant. If the mode is not found, return -1
   */
  calculateAquitanianMode() {
    let mode = -1;
    // Checking last note
    const lastNote = this.neumeComponents[this.neumeComponents.length - 1];
    // Finding all rhombus shapes by checking every `nc` for a `@tilt = se`
    const allWithSETilt = this.neumeComponents.filter((nc) => nc.getTilt() === 'se');
    let allWithSETiltLoc = allWithSETilt.map((nc) => nc.getLoc());

    // Checking the @loc value of all rhombus shapes to help determining the mode of the Aquitanian chant
    // Example with "neg1pos3"
    // - The False value of neg1pos3 indicates that there is at least one rhombus that is not located on either -1 or +3
    // - The True value of neg1pos3 indicates that there are no other rhombuses other than the ones located at -1 or +3
    const neg1pos3 = allWithSETiltLoc.filter((loc) => (loc != -1 && loc != 3)).length == 0;
    const neg2pos2 = allWithSETiltLoc.filter((loc) => (loc != -2 && loc != 2)).length == 0;
    const neg3pos1 = allWithSETiltLoc.filter((loc) => (loc != -3 && loc != 1)).length == 0;
    const zeropos3 = allWithSETiltLoc.filter((loc) => (loc != 0 && loc != 3)).length == 0;
    const zeroneg3pos4 = allWithSETiltLoc.filter((loc) => (loc != 0 && loc != -3 && loc != 4)).length == 0;
    const neg2pos1 = allWithSETiltLoc.filter((loc) => (loc != -2 && loc != 1)).length == 0;

    if (allWithSETiltLoc.length <= 1) {
      mode = -1;
      return mode;
    }

    let lastNoteLoc = lastNote.getLoc();
    if (lastNoteLoc == -2 && neg1pos3) {
      mode = 1;
    } else if (lastNoteLoc == 0 && neg2pos1) {
      mode = 2;
    } else if (lastNoteLoc == -2 && neg2pos2) {
      mode = 3;
    } else if (lastNoteLoc == 0 && zeroneg3pos4) {
      mode = 4;
    } else if (lastNoteLoc == -1 && neg1pos3) {
      mode = 4;
    } else if (lastNoteLoc == -2 && neg3pos1) {
      mode = 5;
    } else if (lastNoteLoc == 0 && neg1pos3) {
      mode = 6;
    } else if (lastNoteLoc == -2 && zeropos3) {
      mode = 7;
    } else if (lastNoteLoc == 0 && neg2pos2) {
      mode = 8;
    } else { // if all conditions fails
      mode = -1;
    }

    return mode;
  }

  /**
   * Refer to https://github.com/ECHOES-from-the-Past/mei-analyser/issues/10 for Square mode detection
   * Mode description template: (in HTML syntax)
   * <ul>
   *  <li> The finalis pitch is 'E', suggesting modes 3 and 4. </li>
   *  <li> Regarding <b> repercussio </b>:
   *    <ul>
   *      <li>
   *        For authentic mode (mode 3): 'C' and 'B' are not among the most repeated notes.
   *        Therefore, there is a 0% probability of being in authentic mode.
   *      </li>
   *      <li>
   *        For plagal mode (mode 4): 'A' is the second most repeated note (15 times) after a note other than the finalis 'E'.
   *        Therefore, there is a 50% probability of being in plagal mode.
   *      </li>
   *      <li>
   *        <b> Ambitus suggests plagal mode '4' with 94.87% of notes in range </b>
   *      </li>
   *    </ul>
   *  </li>
   *  <li> Regarding <b> ambitus </b>:
   *    <ul>
   *      <li>
   *        For the authentic mode (mode 3): 92.31% of the notes are within the range 'E-E'
   *      </li>
   *      <li>
   *        For the plagal mode (mode 4): 94.87% of the notes are within the range 'B-B'
   *      </li>
   *      <li>
   *        <b> Ambitus suggests plagal mode '4' with 94.87% of notes in range </b>
   *      </li>
   *    </ul>
   *  </li>
   *  <li> <b> Authentic mode '3' has 46.15% rating | Plagal mode '4' has 72.44% raging </b> </li>
   * </ul>
   * 
   * <p><b> Authentic mode '3' has 46.15% rating | Plagal mode '4' has 72.44% raging </b></p>
   * @returns {[number, number, string]} the mode, the overall rating, and the descripion of the chant.
   */
  calculateSquareMode() {
    if (env == 'development') {
      console.log(`~ Square mode of ${this.fileName} ~`);
    }
    // Combine the 3 conditions to determine the mode
    let mode = -1;    // default undefined mode
    let rating = 0;   // default undefined rating

    let modeDescription = document.createElement('ul');

    /** 
     * 1st step: detecting the FINALIS - the last note's pitch of the Square notation chant
     * @type {NeumeComponentSQ}
     */
    const finalisNC = this.neumeComponents[this.neumeComponents.length - 1];

    const finalisPitch = finalisNC.getPitch();
    let authenticMode = -1, plagalMode = -1;
    let authenticRepercussioPitch = '', plagalRepercussioPitch = '';

    if (finalisPitch === 'd') {
      authenticMode = 1;
      authenticRepercussioPitch = 'a';
      plagalMode = 2;
      plagalRepercussioPitch = 'f';
    } else if (finalisPitch === 'e') {
      authenticMode = 3;
      authenticRepercussioPitch = 'c'; // or 'b'
      plagalMode = 4;
      plagalRepercussioPitch = 'a';
    } else if (finalisPitch === 'f') {
      authenticMode = 5;
      authenticRepercussioPitch = 'c';
      plagalMode = 6;
      plagalRepercussioPitch = 'a';
    } else if (finalisPitch === 'g') {
      authenticMode = 7;
      authenticRepercussioPitch = 'd';
      plagalMode = 8;
      plagalRepercussioPitch = 'c';
    }

    let finalisDescription = document.createElement('li');
    if (authenticMode === -1 || plagalMode === -1) {
      finalisDescription.innerHTML = `Unable to detect the exact mode based on the finalis pitch '${finalisPitch.toUpperCase()}'.`;
    } else {
      finalisDescription.innerHTML = `The <b> finalis </b> pitch is '${finalisPitch.toUpperCase()}', suggesting modes ${authenticMode} or ${plagalMode}.`;
    }

    modeDescription.appendChild(finalisDescription);

    /**
     * 2nd step: REPERCUSSIO - Most repeated note
     */
    let repercussioIntroduction = document.createElement('li');
    repercussioIntroduction.innerHTML = `Regarding <b>repercussio</b>:`;
    modeDescription.appendChild(repercussioIntroduction);

    let repercussioDesc = document.createElement('ul');

    let modeFromRepercussio = -1;
    /** @type {string[]} array of all pitches in the chant */
    const pitchFrequency = this.neumeComponents.map((nc) => nc.getPitch())
    let counts = {};
    // Count the frequency of each note
    pitchFrequency.forEach((note) => {
      if (counts[note] === undefined) {
        counts[note] = 1;
      } else {
        counts[note] += 1;
      }
    });

    // sort the counts dictionary by the keys
    let sortedCounts = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

    /**
     * Repercussio rating calculation:
     * i. If the expected repercussio note is the most repeated note: 100%
     * ii. If the expected repercussio note is the second most repeated note after the finalis: 75%
     * iii. If the expected repercussio note is the second most repeated note after a note other than the finalis: 50%
     * iv. If the expected repercussio note is the third most repeated note: 25%
     * v. If the expected repercussio note is the fourth most repeated note: 12.5%
     */
    let authenticRepercussioRating = 0, plagalRepercussioRating = 0;

    /** @type {HTMLLIElement} authentic repercussio description */
    let repercussioAuthDesc = document.createElement('li');
    /** Repercussio for Authentic mode */
    if (sortedCounts[0] === authenticRepercussioPitch) { // case (i)
      authenticRepercussioRating += 1;
      repercussioAuthDesc.innerHTML = `Authentic repercussio '${authenticRepercussioPitch.toUpperCase()}' of mode '${authenticMode}'\
        is the most repeated note (${counts[authenticRepercussioPitch]} times). `;
    } else {
      if (sortedCounts[1] === authenticRepercussioPitch && sortedCounts[0] === finalisPitch) { // case (ii)
        authenticRepercussioRating += 0.75;
        repercussioAuthDesc.innerHTML = `Authentic repercussio '${authenticRepercussioPitch.toUpperCase()}' of mode '${authenticMode}'\
          is the second most repeated note (${counts[authenticRepercussioPitch]} times) `
        repercussioAuthDesc.innerHTML += `after finalis '${finalisPitch.toUpperCase()}'. `;
      } else if (sortedCounts[1] === authenticRepercussioPitch && sortedCounts[0] !== finalisPitch) { // case (iii)
        authenticRepercussioRating += 0.5;
        repercussioAuthDesc.innerHTML = `Authentic repercussio '${authenticRepercussioPitch.toUpperCase()}' of mode '${authenticMode}'\
          is the second most repeated note (${counts[authenticRepercussioPitch]} times) `
        repercussioAuthDesc.innerHTML += `after a note other than finalis '${finalisPitch.toUpperCase()}'. `;
      } else if (sortedCounts[2] === authenticRepercussioPitch) { // case (iv)
        authenticRepercussioRating += 0.25;
        repercussioAuthDesc.innerHTML = `Authentic repercussio '${authenticRepercussioPitch.toUpperCase()}' of mode '${authenticMode}'\
          is the third most repeated note (${counts[authenticRepercussioPitch]} times). `;
      } else if (sortedCounts[3] === authenticRepercussioPitch) { // case (v)
        authenticRepercussioRating += 0.125;
        repercussioAuthDesc.innerHTML = `Authentic repercussio '${authenticRepercussioPitch.toUpperCase()}' of mode '${authenticMode}'\
          is the fourth most repeated note (${counts[authenticRepercussioPitch]} times). `;
      } else {
        repercussioAuthDesc.innerHTML = `Unable to detect authentic mode from repercussio. `;
      }
    }
    repercussioDesc.appendChild(repercussioAuthDesc);

    /** Repercussio for Plagal mode */
    /** @type {HTMLLIElement} */
    let repercussioPlagDesc = document.createElement('li');
    if (sortedCounts[0] === plagalRepercussioPitch) { // case (i)
      plagalRepercussioRating += 1;
      repercussioPlagDesc.innerHTML = `Plagal repercussio '${plagalRepercussioPitch.toUpperCase()}' of mode '${plagalMode}'\
        is the most repeated note (${counts[plagalRepercussioPitch]} times). `;
    } else {
      if (sortedCounts[1] === plagalRepercussioPitch && sortedCounts[0] === finalisPitch) { // case (ii)
        plagalRepercussioRating += 0.75;
        repercussioPlagDesc.innerHTML = `Plagal repercussio '${plagalRepercussioPitch.toUpperCase()}' of mode '${plagalMode}'\
          is the second most repeated note (${counts[plagalRepercussioPitch]} times) `;
        repercussioPlagDesc.innerHTML += `after finalis '${finalisPitch.toUpperCase()}'. `;
      } else if (sortedCounts[1] === plagalRepercussioPitch && sortedCounts[0] !== finalisPitch) { // case (iii)
        plagalRepercussioRating += 0.5;
        repercussioPlagDesc.innerHTML = `Plagal repercussio '${plagalRepercussioPitch.toUpperCase()}' of mode '${plagalMode}'\
          is the second most repeated note (${counts[plagalRepercussioPitch]} times) `
        repercussioPlagDesc.innerHTML += `after a note other than finalis '${finalisPitch.toUpperCase()}'. `;
      } else if (sortedCounts[2] === plagalRepercussioPitch) { // case (iv)
        plagalRepercussioRating += 0.25;
        repercussioPlagDesc.innerHTML = `Plagal repercussio '${plagalRepercussioPitch.toUpperCase()}' of mode '${plagalMode}'\
          is the third most repeated note (${counts[plagalRepercussioPitch]} times). `;
      } else if (sortedCounts[3] === plagalRepercussioPitch) { // case (v)
        plagalRepercussioRating += 0.125;
        repercussioPlagDesc.innerHTML = `Plagal repercussio '${plagalRepercussioPitch.toUpperCase()}' of mode '${plagalMode}'\
          is  the fourth most repeated note (${counts[plagalRepercussioPitch]} times). `;
      } else {
        repercussioPlagDesc.innerHTML = `Unable to detect plagal mode from repercussio. `;
      }
    }
    repercussioDesc.appendChild(repercussioPlagDesc);

    // Calculate the final repercussio rating
    let repercussioSuggestion = document.createElement('p');
    if (authenticRepercussioRating > plagalRepercussioRating) {
      modeFromRepercussio = authenticMode;
      repercussioSuggestion.innerHTML = `<b> Repercussio suggests authentic mode '${modeFromRepercussio}' with ${authenticRepercussioRating.toFixed(4) * 100}% certainty.</b>`;
    } else {
      modeFromRepercussio = plagalMode;
      repercussioSuggestion.innerHTML = `<b> Repercussio suggests plagal mode '${modeFromRepercussio}' with ${plagalRepercussioRating.toFixed(4) * 100}% certainty.</b>`;
    }
    repercussioDesc.appendChild(repercussioSuggestion);

    modeDescription.appendChild(repercussioDesc);

    /**
     * 3rd condition: AMBITUS - Range of the notes
     * The mode is calculated as the number of notes within the predefined range divided by the total number of notes.
     * Equation: rate = (number of notes within the predetermined range) / (total number of notes)
     * Example: if pitch range is "D-D", all notes are expected to be within the range of D2 to D3.
     */
    let ambitusIntroduction = document.createElement('li');
    ambitusIntroduction.innerHTML = `Regarding <b>ambitus</b>:`;
    modeDescription.appendChild(ambitusIntroduction);

    let ambitusDesc = document.createElement('ul');
    /** We expect in authentic mode for most notes to be above the ambitus). Therefore:
     * lower_octave = finalis_octave
     * upper_octave = finalis_octave + 1 
     * For plagal mode, the finalis is expected to be more in the middle, having some notes above the finalis and some notes below the finalis.
     * Therefore the lower octave is an octave below it (only for finalis 'D' or 'E' cases).
     * lower_octave = finalis_octave - 1
     * upper_octave = finalis_octave
     * For plagal mode with finalis 'F' or 'G', the pitch range is similar to the authentic mode.
     * @param {string} modeType the mode type ("authentic" or "plagal")
     * @param {string} pitch the lower bound of the pitch range
     * @returns {number} the rate of the pitches within the range
     * @usage pitchRange('d')
     */

    const pitchRangeRate = (modeType, pitch) => {
      const finalisOctave = this.neumeComponents[this.neumeComponents.length - 1].getOctave();
      let lowerOctaveBoundary, upperOctaveBoundary;
      if (modeType === 'authentic') {
        lowerOctaveBoundary = finalisOctave;
        upperOctaveBoundary = finalisOctave + 1;
      } else if (modeType === 'plagal') {
        if (finalisPitch === 'd' || finalisPitch === 'e') {
          lowerOctaveBoundary = finalisOctave - 1;
          upperOctaveBoundary = finalisOctave;
        } else if (finalisPitch === 'f' || finalisPitch === 'g') {
          lowerOctaveBoundary = finalisOctave;
          upperOctaveBoundary = finalisOctave + 1;
        }
      } else {
        console.error('Invalid mode type');
        return -1;
      }

      const lowerBoundNCSeptenary = new NeumeComponentSQ('', '', '', pitch, lowerOctaveBoundary).septenary();
      const upperBoundNCSeptenary = new NeumeComponentSQ('', '', '', pitch, upperOctaveBoundary).septenary();

      const ncSeptenary = this.neumeComponents.map((nc) => nc.septenary());

      const totalNotes = ncSeptenary.length;
      const totalNotesInRange = ncSeptenary.filter((septenaryValue) => septenaryValue >= lowerBoundNCSeptenary && septenaryValue <= upperBoundNCSeptenary).length;

      return totalNotesInRange / totalNotes;
    }

    let modeFromAmbitus = -1;
    let ambitusAuthenticRange, ambitusPlagalRange;
    let ambitusAuthenticRating = 0, ambitusPlagalRating = 0;
    if (finalisPitch === 'd') {
      ambitusAuthenticRange = 'd';
      ambitusPlagalRange = 'a';
    } else if (finalisPitch === 'e') {
      ambitusAuthenticRange = 'e';
      ambitusPlagalRange = 'b';
    } else if (finalisPitch === 'f') {
      ambitusAuthenticRange = 'f';
      ambitusPlagalRange = 'c';
    } else if (finalisPitch === 'g') {
      ambitusAuthenticRange = 'g';
      ambitusPlagalRange = 'd';
    } else {
      modeDescription += `Unable to detect the exact mode based on ambitus.`;
    }

    ambitusAuthenticRating = pitchRangeRate('authentic', ambitusAuthenticRange);
    ambitusPlagalRating = pitchRangeRate('plagal', ambitusPlagalRange);

    let ambitusAuthDesc = document.createElement('li');
    ambitusAuthDesc.innerHTML = `For the authentic mode (mode ${authenticMode}): ${Number(ambitusAuthenticRating).toFixed(4) * 100}% of the notes\
      are within the range '${ambitusAuthenticRange.toUpperCase()}-${ambitusAuthenticRange.toUpperCase()}'\
      (${ambitusAuthenticRange.toUpperCase()}${finalisNC.getOctave()}-${ambitusAuthenticRange.toUpperCase()}${finalisNC.getOctave() + 1}).`;


    let ambitusPlagDesc = document.createElement('li');
    ambitusPlagDesc.innerHTML = `For the plagal mode (mode ${plagalMode}): ${Number(ambitusPlagalRating).toFixed(4) * 100}% of the notes\
      are within the range'${ambitusPlagalRange.toUpperCase()}-${ambitusPlagalRange.toUpperCase()}'\
      (${ambitusPlagalRange.toUpperCase()}${finalisNC.getOctave() - 1}-${ambitusPlagalRange.toUpperCase()}${finalisNC.getOctave()}).`;

    ambitusDesc.appendChild(ambitusAuthDesc);
    ambitusDesc.appendChild(ambitusPlagDesc);

    // Ambitus suggestion
    let ambitusSuggestion = document.createElement('p');

    if (ambitusAuthenticRating > ambitusPlagalRating) {
      modeFromAmbitus = authenticMode;
      ambitusSuggestion.innerHTML = `<b> Ambitus suggests authentic mode '${modeFromAmbitus}' with ${Number(ambitusAuthenticRating).toFixed(4) * 100}%\
        of notes in range over plagal mode rating of ${Number(ambitusPlagalRating).toFixed(4) * 100}% of notes in range </b>'.`;
    } else {
      modeFromAmbitus = plagalMode;
      ambitusSuggestion.innerHTML = `<b> Ambitus suggests plagal mode '${modeFromAmbitus}' with ${Number(ambitusPlagalRating).toFixed(4) * 100}%\
        of notes in range over authentic mode rating of ${Number(ambitusAuthenticRating).toFixed(4) * 100}% of notes in range </b>'.`;
    }

    ambitusDesc.appendChild(ambitusSuggestion);
    modeDescription.appendChild(ambitusDesc);

    // Conclusion
    let authenticRating = (authenticRepercussioRating + ambitusAuthenticRating) / 2;
    let plagalRating = (plagalRepercussioRating + ambitusPlagalRating) / 2;
    let conclusion = document.createElement('p');
    conclusion.innerHTML = `Authentic mode '${authenticMode}' has ${authenticRating.toFixed(4) * 100}% rating | `;
    conclusion.innerHTML += `Plagal mode '${plagalMode}' has ${plagalRating.toFixed(4) * 100}% rating.`;

    modeDescription.appendChild(conclusion);

    // Calculate the final mode and rating
    if (authenticRating > plagalRating) {
      mode = authenticMode;
      rating = authenticRating;
    }
    else {
      mode = plagalMode;
      rating = plagalRating;
    }


    if (env == 'development') {
      console.dirxml(modeDescription);
    }

    return [mode, rating, modeDescription.outerHTML];
  }

  /**
   * Obtain the URL of the file on the PEM (Portuguese database)
   * @returns {string[]} the URL of the file on the PEM
   */
  obtainDatabaseUrls() {
    const fileManifestation = this.meiParsedContent.querySelector('manifestation');
    const itemTargetTypeURL = fileManifestation.querySelector("item[targettype='url']");
    const urls = itemTargetTypeURL.attributes.getNamedItem("target").value;
    const url = urls.split('and');
    return url;
  }

  obtainTitle() {
    const fileDescription = this.meiParsedContent.querySelector('fileDesc');
    const title = fileDescription.querySelector('title').innerHTML;
    return title;
  }

  obtainSource() {
    const fileManifestation = this.meiParsedContent.querySelector('manifestation');
    const source = fileManifestation.querySelector('identifier').innerHTML;
    return source;
  }

  getFilePath() {
    return this.filePath;
  }

  getNotationType() {
    return this.notationType;
  }

  getNeumeComponents() {
    return this.neumeComponents;
  }

  getMode() {
    return Number(this.mode);
  }
}
