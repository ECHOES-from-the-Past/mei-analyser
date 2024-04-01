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

/**
 * @typedef {Object} Chant
 * @property {String} filePath the path of the .mei file
 * @property {String} fileName the name of the .mei file
 * @property {String} meiContent the content of the .mei file
 * @property {XMLDocument} meiParsedContent the parsed content of the .mei file
 * @property {String} notationType the notation type of the chant (either "aquitanian" or "square")
 * @property {NeumeComponentAQ[] | NeumeComponentSQ[]} neumeComponents an array of NeumeComponent
 * @property {number | string} mode the mode of the chant
 * @property {string} modeDescription an explaination of the mode detection
 * @property {string} pemDatabaseUrl the URL of the file on the PEM (Portuguese Early Music) database
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

    /** @type {NeumeComponentAQ[] | NeumeComponentSQ[]} */
    this.neumeComponents = this.parseMEIforNeumeComponents();

    /** 
     * @type {number | string} the mode of the chant
     * * For Aquitanian: the mode of the chant
     * * For Square: the mode of the chant and a percentage of the mode certainty
     */
    this.mode = this.obtainMode();

    /**
     * @type {string} an explaination of the mode detection
     */
    this.modeDescription = "Description of the mode";

    /** 
     * @type {string} 
     * @description the URL of the file on the PEM (Portuguese Early Music) database
    */
    this.pemDatabaseUrl = this.obtainDatabaseUrl();

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
   * Parse the MEI Content to extract the mode of the chant. This only works for Aquitanian notation.   * 
   * @returns {Number} the mode of the chant
   */
  obtainMode() {
    if (this.getNotationType() === "square") {
      let [mode, squareRating] = this.calculateSquareMode();
      if (mode == -1) {
        return undefined;
      }
      if (squareRating < 1) {
        return `${mode} - ${Number(squareRating * 100).toFixed(2)}% of notes in range`;
      }
      return `${mode}`;
    } else if (this.getNotationType() === "aquitanian") {
      let mode = this.calculateAquitanianMode();
      return mode == -1 ? undefined : mode;
    }
    return undefined;
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
   * @returns {[number, pitchRangeRate]} the mode of the chant. If the mode is not found, return -1.
   */
  calculateSquareMode() {
    /** 
     * 1st condtion: the last note's pitch of the Square notation chant 
     * @type {NeumeComponentSQ}
    */
    const lastNotePitch = this.neumeComponents[this.neumeComponents.length - 1].getPitch();

    /**
     * 2nd condition: pitch range
     * If the pitch range is within an octave, it's 100% (`1`) sure that the chant is in that mode.
     * Otherwise, the rate is calculated as the number of notes within the predefined range divided by the total number of notes.
     * Equation: rate = (number of notes within the predetermined range) / (total number of notes)
     * Example: if pitch range is "D-D", all notes are expected to be within the range of D2 to D3.
     * To use: `pitchRange('d', 'd')`
     * @param {string} lowerPitch the lower bound of the pitch range
     * @param {string} upperPitch the upper bound of the pitch range
     * @returns {number} the rate of the pitches within the range
     * */
    let pitchRangeRate = (lowerPitch, upperPitch) => {
      const sortedNeumeComponents = this.neumeComponents.sort((a, b) => a.septenary() - b.septenary())
      const lowerOctave = sortedNeumeComponents[0].getOctave();
      let upperOctave = sortedNeumeComponents[sortedNeumeComponents.length - 1].getOctave();
      if (upperOctave === lowerOctave) {
        upperOctave += 1;
      }
      const lowerBoundNCSeptenary = new NeumeComponentSQ('', '', '', lowerPitch, lowerOctave).septenary();
      const upperBoundNCSeptenary = new NeumeComponentSQ('', '', '', upperPitch, upperOctave).septenary();
      const ncSeptenary = sortedNeumeComponents.map((nc) => nc.septenary());

      const totalNotes = ncSeptenary.length;
      const totalNotesInRange = ncSeptenary.filter((septenaryValue) => septenaryValue >= lowerBoundNCSeptenary && septenaryValue <= upperBoundNCSeptenary).length;

      return totalNotesInRange / totalNotes;
    }

    // 3rd condition: Most frequent/repeated pitch
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
    // Find the most frequent note from the counts object (the key with the highest value)
    let mostRepeatedPitch = ''; // the most frequent note
    let maxValue = 0;
    for (let key in counts) {
      if (counts[key] > maxValue) {
        maxValue = counts[key];
        mostRepeatedPitch = key;
      }
    }

    // Combine the 3 conditions to determine the mode
    let mode = -1; // default undefined mode
    let rating = 0; // default undefined rating

    if (lastNotePitch === 'd' && mostRepeatedPitch === 'a') {
      mode = 1;
      rating = pitchRangeRate('d', 'd');
    } else if (lastNotePitch === 'd' && mostRepeatedPitch === 'f') {
      mode = 2;
      rating = pitchRangeRate('a', 'a');
    } else if (lastNotePitch === 'e' && (mostRepeatedPitch === 'c' || mostRepeatedPitch === 'b')) {
      mode = 3;
      rating = pitchRangeRate('e', 'e');
    } else if (lastNotePitch === 'e' && mostRepeatedPitch === 'a') {
      mode = 4;
      rating = pitchRangeRate('b', 'b');
    } else if (lastNotePitch === 'f' && mostRepeatedPitch === 'c') {
      mode = 5;
      rating = pitchRangeRate('f', 'f');
    } else if (lastNotePitch === 'f' && mostRepeatedPitch === 'a') {
      mode = 6;
      rating = pitchRangeRate('c', 'c');
    } else if (lastNotePitch === 'g' && mostRepeatedPitch === 'd') {
      mode = 7;
      rating = pitchRangeRate('g', 'g');
    } else if (lastNotePitch === 'g' && mostRepeatedPitch === 'c') {
      mode = 8;
      rating = pitchRangeRate('d', 'd');
    }

    if (env == 'development') {
      console.debug(`Mode ${mode} on ${this.fileName}.\nLast note: ${lastNotePitch}\nMost repeated: ${mostRepeatedPitch}\nPitch frequency: ${JSON.stringify(counts)}\nRating: ${rating}`);
    }
    return [mode, rating];
  }

  /**
   * Obtain the URL of the file on the PEM (Portuguese database)
   * @returns {string} the URL of the file on the PEM
   */
  obtainDatabaseUrl() {
    const fileManifestation = this.meiParsedContent.querySelector('manifestation');
    const itemTargetTypeURL = fileManifestation.querySelector("item[targettype='url']");
    const url = itemTargetTypeURL.attributes.getNamedItem("target").value;
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

  getContent() {
    return this.meiParsedContent;
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
