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
 * @type {Object}
 * @property {string} filePath the path of the .mei file
 * @property {string} fileName the name of the .mei file
 * @property {string} meiContent the content of the .mei file
 * @property {XMLDocument} meiParsedContent the parsed content of the .mei file
 * @property {string} notationType the notation type of the chant (either "aquitanian" or "square")
 * @property {NeumeComponentAQ[] | NeumeComponentSQ[]} neumeComponents an array of NeumeComponent
 * @property {number} mode the mode of the chant
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

    /** @type {NeumeComponentAQ[] | NeumeComponentSQ[]} */
    this.neumeComponents = this.parseMEIforNeumeComponents();

    if (this.getNotationType() === "square") {
      let [sqMode, sqRating, modeDescription] = this.calculateSquareMode();
      this.mode = sqMode == -1 ? undefined : sqMode;
      this.modeCertainty = Number(sqRating).toFixed(2) * 100;

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
   * @returns {[number, number, number]} the mode of the chant. If the mode is not found, return -1.
   */
  calculateSquareMode() {
    if (env == 'development') {
      console.log(`~ Square mode of ${this.fileName} ~`);
    }
    // Combine the 3 conditions to determine the mode
    let mode = -1;    // default undefined mode
    let rating = 0;   // default undefined rating

    let repercussioRating = 0;
    let ambitusRating = 0;

    let modeDescription = '';

    /** 
     * 1st step: detecting the FINALIS - the last note's pitch of the Square notation chant
     * @type {NeumeComponentSQ}
     */
    const finalisNC = this.neumeComponents[this.neumeComponents.length - 1];

    const finalisPitch = finalisNC.getPitch();
    modeDescription += `Finalis pitch is '${finalisPitch.toUpperCase()}'.\n`;

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
    } else {
      modeDescription += `Unable to detect potential modes based on finalis '${finalisPitch}'.\n`;
    }

    /**
     * 2nd step: REPERCUSSIO - Most repeated note
     */
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
     * Case 1 (i) - repercussio 100%
     * If one of the two expected repercussio notes is the most repeated note
     */
    if (sortedCounts[0] === authenticRepercussioPitch) {
      mode = authenticMode;
      repercussioRating += 1;
      modeDescription += `Authentic repercussio detected, the most repeated pitch is ${authenticRepercussioPitch} (${counts[authenticRepercussioPitch]} times).\n`;
    } else if (sortedCounts[0] === plagalRepercussioPitch) {
      mode = plagalMode;
      repercussioRating += 1;
      modeDescription += `Plagal repercussio detected, the most repeated note is '${plagalRepercussioPitch}' (${counts[plagalRepercussioPitch]} times).\n`;
    }
    /**
     * Case 2 (ii) - repercussio 75%
     * If one of the two expected repercussio notes is the second most repeated note after the finalis.
     * This also means that the most repeated note is the finalis.
     */
    else if (sortedCounts[0] === finalisPitch) {
      if (sortedCounts[1] === authenticRepercussioPitch) {
        mode = authenticMode;
        repercussioRating += 0.75;
        modeDescription += `Authentic repercussio detected, the second most repeated pitch is ${authenticRepercussioPitch} (${counts[authenticRepercussioPitch]} times) after the finalis.\n`;
      } else if (sortedCounts[1] === plagalRepercussioPitch) {
        mode = plagalMode;
        repercussioRating += 0.75;
        modeDescription += `Plagal repercussio detected, the second most repeated pitch is ${plagalRepercussioPitch} (${counts[plagalRepercussioPitch]} times) after the finalis.\n`;
      }
      /**
      * Case 4 (iv) - Finalis is the most repeated note
      * If one of the two expected repercussio notes is the third most repeated note.
      * This happens regardless of the most repeated note.
      * repercussioRating += 0.25
      * */
      else if (sortedCounts[2] === authenticRepercussioPitch) {
        mode = authenticMode;
        repercussioRating += 0.25;
        modeDescription += `Authentic repercussio detected, the third most repeated note is '${authenticRepercussioPitch}' (${counts[authenticRepercussioPitch]} times).\n`;
      } else if (sortedCounts[2] === plagalRepercussioPitch) {
        mode = plagalMode;
        repercussioRating += 0.25;
        modeDescription += `Plagal repercussio detected, the third most repeated note is '${plagalRepercussioPitch}' (${counts[plagalRepercussioPitch]} times).\n`;
      }
      /**
       * Case 5 (v) - Finalis is the most repeated note
       * If one of the two expected repercussio notes is the fourth most repeated note.
       * repercussioRating += 0.125
       * */
      else if (sortedCounts[3] === authenticRepercussioPitch) {
        mode = authenticMode;
        repercussioRating += 0.125;
        modeDescription += `Authentic repercussio detected, with the fourth most repeated note is '${authenticRepercussioPitch}' (${counts[authenticRepercussioPitch]} times).\n`;
      } else if (sortedCounts[3] === plagalRepercussioPitch) {
        mode = plagalMode;
        repercussioRating += 0.125;
        modeDescription += `Plagal repercussio detected, the fourth most repeated note is '${plagalRepercussioPitch}' (${counts[plagalRepercussioPitch]} times).\n`;
      }
    }
    /**
     * Case 3 (iii)
     * If (one of the two expected) repercussio notes is the second most repeated note after a note other than the finalis.
     * This also means that the most repeated note is NOT the finalis.
     * repercussioRating += 0.5
     */
    else if (sortedCounts[0] !== finalisPitch && sortedCounts[1] === authenticRepercussioPitch) {
      mode = authenticMode;
      repercussioRating += 0.5;
      modeDescription += `Authentic repercussio detected, with the second most repeated note is ${authenticRepercussioPitch} (${counts[authenticRepercussioPitch]} times) after a non-finalis '${sortedCounts[0]}' (${counts[sortedCounts[0]]} times).\n`;
    } else if (sortedCounts[0] !== finalisPitch && sortedCounts[1] === plagalRepercussioPitch) {
      mode = plagalMode
      repercussioRating += 0.5;
      modeDescription += `Plagal repercussio detected, the second most repeated note is ${plagalRepercussioPitch} (${counts[plagalRepercussioPitch]} times) after non-finalis '${sortedCounts[0]}' (${counts[sortedCounts[0]]} times).\n`;
    }
    else {
      /**
      * Case 4 (iv) - Finalis is the most repeated note
      * If one of the two expected repercussio notes is the third most repeated note.
      * This happens regardless of the most repeated note.
      * repercussioRating += 0.25
      * */
      if (sortedCounts[2] === authenticRepercussioPitch) {
        mode = authenticMode;
        repercussioRating += 0.25;
        modeDescription += `Authentic repercussio detected, the third most repeated note is '${authenticRepercussioPitch}' (${counts[authenticRepercussioPitch]} times).\n`;
      } else if (sortedCounts[2] === plagalRepercussioPitch) {
        mode = plagalMode;
        repercussioRating += 0.25;
        modeDescription += `Plagal repercussio detected, the third most repeated note is '${plagalRepercussioPitch}' (${counts[plagalRepercussioPitch]} times).\n`;
      }
      /**
       * Case 5 (v) - Finalis is the most repeated note
       * If one of the two expected repercussio notes is the fourth most repeated note.
       * repercussioRating += 0.125
       * */
      else if (sortedCounts[3] === authenticRepercussioPitch) {
        mode = authenticMode;
        repercussioRating += 0.125;
        modeDescription += `Authentic repercussio detected, with the fourth most repeated note is '${authenticRepercussioPitch}' (${counts[authenticRepercussioPitch]} times).\n`;
      } else if (sortedCounts[3] === plagalRepercussioPitch) {
        mode = plagalMode;
        repercussioRating += 0.125;
        modeDescription += `Plagal repercussio detected, the fourth most repeated note is '${plagalRepercussioPitch}' (${counts[plagalRepercussioPitch]} times).\n`;
      }
      /**
       * If none of the expected repercussio notes are repeated more than 3 times.
       */
      else {
        modeDescription += `No expected repercussio note is repeated more than 3 times.\n`;
      }
    }

    /**
     * 3rd condition: AMBITUS - Range of the notes
     * The mode is calculated as the number of notes within the predefined range divided by the total number of notes.
     * Equation: rate = (number of notes within the predetermined range) / (total number of notes)
     * Example: if pitch range is "D-D", all notes are expected to be within the range of D2 to D3.
     * 
     * We expect in authentic mode for most notes to be above the ambitus). Therefore:
     * lower_octave = finalis_octave
     * upper_octave = finalis_octave + 1 
     * For plagal mode, the finalis is expected to be more in the middle, having some notes above the finalis and some notes below the finalis.
     * Therefore the lower octave wont be the one corresponding to the finalis, but an octave below it.
     * lower_octave = finalis_octave - 1
     * upper_octave = finalis_octave
     * @param {string} modeType the mode type ("authentic" or "plagal")
     * @param {string} pitch the lower bound of the pitch range
     * @returns {number} the rate of the pitches within the range
     * @usage pitchRange('d')
     */
    let pitchRangeRate = (modeType, pitch) => {
      const finalisOctave = this.neumeComponents[this.neumeComponents.length - 1].getOctave();
      let lowerOctaveBoundary, upperOctaveBoundary;
      if (modeType === 'authentic') {
        lowerOctaveBoundary = finalisOctave;
        upperOctaveBoundary = finalisOctave + 1;
      } else if (modeType === 'plagal') {
        lowerOctaveBoundary = finalisOctave - 1;
        upperOctaveBoundary = finalisOctave;
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
      modeDescription += `Unable to detect the exact mode based on ambitus.\n`;
    }

    ambitusAuthenticRating = pitchRangeRate('authentic', ambitusAuthenticRange);
    ambitusPlagalRating = pitchRangeRate('plagal', ambitusPlagalRange);

    if (ambitusAuthenticRating > ambitusPlagalRating) {
      modeFromAmbitus = authenticMode;
      ambitusRating = ambitusAuthenticRating;
      modeDescription += `Ambitus suggests authentic mode '${modeFromAmbitus}' with ${Number(ambitusAuthenticRating).toFixed(4) * 100}% of notes in range of '${ambitusAuthenticRange}' over `;
      modeDescription += `plagal mode rating of ${Number(ambitusPlagalRating).toFixed(4) * 100}% of notes in range of '${ambitusPlagalRange}'.\n`;
    } else {
      modeFromAmbitus = plagalMode;
      ambitusRating = ambitusPlagalRating;
      modeDescription += `Ambitus suggests plagal mode '${modeFromAmbitus}' with ${Number(ambitusPlagalRating).toFixed(4) * 100}% of notes in range '${ambitusPlagalRange}' over `;
      modeDescription += `authentic mode rating of ${Number(ambitusAuthenticRating).toFixed(4) * 100}% of notes in range of '${ambitusAuthenticRange}'.\n`;
    }

    modeDescription += `Mode detected from ambitus is '${modeFromAmbitus}'.\n`;


    // Calculate the final rating = (repercussioRating + ambitusRating) / 2
    rating = (repercussioRating + ambitusRating) / 2;

    modeDescription += `Authentic mode ${modeFromAmbitus} rating: ${Number(ambitusAuthenticRating).toFixed(4) * 100}%, plagal mode rating: ${Number(ambitusPlagalRating).toFixed(4) * 100}%.\n`;


    if (env == 'development') {
      console.log(modeDescription);
    }

    return [mode, rating, modeDescription];
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
