export function getNeumeComponentList(syllableList) {
  // Get all the neume components from the syllables
  let neumeComponents = [];

  for (let syllable of syllableList) {
    neumeComponents.push(...syllable.neumeComponents);
  }

  return neumeComponents;
}
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
   * @param {String} pitch pitch name of the note. (e.g. "d")
   * @param {Number} octave octave of the note. (e.g. 8)
   */
  constructor(id, tilt, ornamental, pitch, octave) {
    super(id, tilt, ornamental);
    this.pitch = pitch;
    this.octave = Number(octave);
  }
}

/**
 * Represent square neume component using base-7 value
 * Septenary = pitch * 7^0 + octave * 7^1
 * @param {NeumeComponentSQ} ncSQ the square neume component of interest
 * @returns the septenary value of the square neume component
 */
export function toSeptenary(ncSQ) {
  const sq_pitch = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
  return Number(sq_pitch.indexOf(ncSQ.pitch)) + Number(ncSQ.octave) * 7;
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
    this.loc = Number(loc);
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
}

export class Chant {
  /**
   * Constructing a Chant object from a .mei file content
   * @param {MEI_Content} meiContent The content of the .mei file
   * @param {String} fileName the path of the .mei file
   * @param {String} title the title of the chant
   * @param {String} source the source of the chant
   * @param {String} notationType the notation type of the chant (either "aquitanian" or "square")
   * @param {Syllable[]} syllables an array of all the syllables in the chant
   * @param {number} mode the mode of the chant
   * @param {number} modeCertainty the certainty of the mode detection
   * @param {String} modeDescription an explaination of the mode detection
   * @param {{line: number, shape: string}} clef the clef of the chant
   * @param {String[]} pemDatabaseUrls the URL of the file on the PEM (Portuguese Early Music) database
   */
  constructor(meiContent, fileName, title, source, notationType, syllables, mode, modeCertainty, modeDescription, clef, pemDatabaseUrls) {
      this.meiContent = meiContent;
      this.fileName = fileName;
      this.title = title;
      this.source = source;
      this.notationType = notationType;
      this.syllables = syllables;
      this.mode = mode;
      this.modeCertainty = modeCertainty;
      this.modeDescription = modeDescription;
      this.clef = clef;
      this.pemDatabaseUrls = pemDatabaseUrls;
  }
}