import * as xml2js from 'xml2js';
import * as fs from 'fs';
import { NeumeComponentAQ, NeumeComponentSQ, Syllable, SyllableWord } from '../utility/components';

const testFile = await fetch("https://raw.githubusercontent.com/ECHOES-from-the-Past/GABCtoMEI/main/MEI_outfiles/antiphonae_ad_communionem/001_C01_benedicite-omnes_pem82441_aquit_AQUIT.mei")
    .then(response => response.text())

let testMeiJSON = {};
xml2js.parseString(testFile, (err, result) => {
    console.log(result.mei.meiHead[0].fileDesc[0].titleStmt[0].title[0]);
    testMeiJSON = result;
});

function parseMEIContentToJSON(meiContent) {
    let meiJSON = {};
    xml2js.parseString(meiContent, (err, result) => {
        meiJSON = result;
    });
    return meiJSON;
}

/**
 * Get notation type / music script of the chant from the MEI JSON
 * @returns {string} the notation type of the chant (either "aquitanian" or "square")
 */
function getNotationType(meiJSON) {
    const lines = meiJSON.mei.music[0].body[0].mdiv[0].score[0].scoreDef[0].staffGrp[0].staffDef[0].$.lines;
    if (lines > 1) {
        return "square";
    } else {
        return "aquitanian";
    }
}

/**
 * Obtain the URL of the file on the PEM (Portuguese Early Music database)
 * @returns {string[]} the URL of the file on the PEM
 */
function getDatabaseUrls(meiJSON) {
    const urls = meiJSON.mei.meiHead[0].manifestationList[0].manifestation[0].itemList[0].item[0].$.target;
    const url = urls.split('and');
    return url;
}

/**
 * Obtain the title of the chant
 */
function getChantTitle(meiJSON) {
    const title = meiJSON.mei.meiHead[0].fileDesc[0].titleStmt[0].title[0];
    return title;
}

function getSource(meiJSON) {
    const source = meiJSON.mei.meiHead[0].manifestationList[0].manifestation[0].itemList[0].item[0].identifier;
    return source;
}

function getAllSyllables(meiJSON) {
    const allSyllables = meiJSON.mei.music[0].body[0].mdiv[0].score[0].section[0].staff[0].layer[0].syllable;
    return allSyllables;
}

function parseToSyllableObject(syllable, notationType) {
    const syl = syllable.syl[0];
    const sylWordId = syl.$.id;
    const sylWordText = syl._;
    const sylWordPosition = syl.$.wordpos;
    // Creating a SyllableText object
    const syllableWordObject = new SyllableWord(sylWordId, sylWordText, sylWordPosition);

    // Getting all the neume components enclosed in the syllable
    const ncList = syllable.nc;
    let neumeComponents = [];
    for (const nc of ncList) {
        const ncId = nc.$.id;
        let ncTilt = nc.$.tilt;
        const ncOrnamental = nc.children.length > 0 ? {
            "type": nc.children[0].name,
            "id": nc.children[0].$.id
        } : null;

        if (notationType === "square") {
            // Getting all the necessary attributes of NeumeComponentSQ
            const pitch = nc.$.pname;
            const octave = nc.$.oct;

            const nc_SQ = new NeumeComponentSQ(ncId, ncTilt, ncOrnamental, pitch, octave);
            neumeComponents.push(nc_SQ);
        } else if (notationType === "aquitanian") {
            // Getting the necessary attribute of NeumeComponentAQ
            const loc = nc.$.loc;

            const nc_AQ = new NeumeComponentAQ(ncId, ncTilt, ncOrnamental, loc);
            neumeComponents.push(nc_AQ);
        }
    }
    // Creating a Syllable object
    const id = syllable.$.id;
    const syllableObj = new Syllable(id, syllableWordObject, neumeComponents);
    return syllableObj;
}

function parseToSyllableArray(allSyllables, notationType) {
    let syllableArray = [];
    for (let syllable of allSyllables) {
        const syllableObj = parseToSyllableObject(syllable, notationType);
        syllableArray.push(syllableObj);
    }
    return syllableArray;
}

console.log(getAllSyllables(testMeiJSON));

/**
 * Helper function to calculate the mode of the Aquitanian chant.
 * Refer to https://github.com/ECHOES-from-the-Past/mei-analyser/issues/8 for Aquitanian mode detection
 * @returns {number} the mode of the chant. If the mode is not found, return -1
 */
function calculateAquitanianMode(syllables) {
    let mode = -1;
    const neumeComponentList = getNeumeComponentList(syllables);
    // Checking last note
    const lastNote = neumeComponentList[neumeComponentList.length - 1];
    // Finding all rhombus shapes by checking every `nc` for a `@tilt = se`
    const allWithSETilt = neumeComponentList.filter((nc) => nc.tilt === 'se');
    let allWithSETiltLoc = allWithSETilt.map((nc) => nc.loc);

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

    let lastNoteLoc = lastNote.loc;
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
 * @returns {[number, number, string]} the mode, the overall rating, and the descripion of the chant.
 */
function calculateSquareMode(syllables) {
    // Combine the 3 conditions to determine the mode
    let mode = -1;    // default undefined mode
    let rating = 0;   // default undefined rating

    let modeDescription = document.createElement('ul');

    const neumeComponentList = getNeumeComponentList(syllables);

    /**
     * 1st step: detecting the FINALIS - the last note's pitch of the Square notation chant
     * @type {NeumeComponentSQ}
     */
    const finalisNC = neumeComponentList[neumeComponentList.length - 1];

    const finalisPitch = finalisNC.pitch;
    let authenticMode = -1, plagalMode = -1;
    let authenticRepercussioPitch = '', plagalRepercussioPitch = '';
    let mode3alternatives = false;

    if (finalisPitch === 'd') {
        authenticMode = 1;
        authenticRepercussioPitch = 'a';
        plagalMode = 2;
        plagalRepercussioPitch = 'f';
    } else if (finalisPitch === 'e') {
        mode3alternatives = true;
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
    const pitchFrequency = neumeComponentList.map((nc) => nc.pitch)
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
    repercussioAuthDesc.innerHTML = `For the authentic mode (mode '${authenticMode}'): `;

    if (sortedCounts[0] === authenticRepercussioPitch) { // case (i)
        authenticRepercussioRating += 1;
        repercussioAuthDesc.innerHTML += `'${authenticRepercussioPitch.toUpperCase()}' is the most repeated note (${counts[authenticRepercussioPitch]} times). `;
    } else {
        if (sortedCounts[1] === authenticRepercussioPitch && sortedCounts[0] === finalisPitch) { // case (ii)
            authenticRepercussioRating += 0.75;
            repercussioAuthDesc.innerHTML += `'${authenticRepercussioPitch.toUpperCase()}' is the second most repeated note (${counts[authenticRepercussioPitch]} times) `
            repercussioAuthDesc.innerHTML += `after finalis '${finalisPitch.toUpperCase()}'. `;
        } else if (sortedCounts[1] === authenticRepercussioPitch && sortedCounts[0] !== finalisPitch) { // case (iii)
            authenticRepercussioRating += 0.5;
            repercussioAuthDesc.innerHTML += `'${authenticRepercussioPitch.toUpperCase()}' is the second most repeated note (${counts[authenticRepercussioPitch]} times) `
            repercussioAuthDesc.innerHTML += `after a note other than finalis '${finalisPitch.toUpperCase()}'. `;
        } else if (sortedCounts[2] === authenticRepercussioPitch) { // case (iv)
            authenticRepercussioRating += 0.25;
            repercussioAuthDesc.innerHTML += `'${authenticRepercussioPitch.toUpperCase()}' is the third most repeated note (${counts[authenticRepercussioPitch]} times). `;
        } else if (sortedCounts[3] === authenticRepercussioPitch) { // case (v)
            authenticRepercussioRating += 0.125;
            repercussioAuthDesc.innerHTML += `'${authenticRepercussioPitch.toUpperCase()}' is the fourth most repeated note (${counts[authenticRepercussioPitch]} times). `;
        } else {
            repercussioAuthDesc.innerHTML += `'${authenticRepercussioPitch.toUpperCase()}' is not among the most repeated notes. `;
        }
    }


    /* Check for mode 3 alternatives
    *  If the finalis is 'E', mode 3 alternative is 'B'
    */
    if (mode3alternatives) {
        let mode3alternativeDesc = document.createElement('li');
        let alternativeAuthRepRating = 0;
        mode3alternativeDesc.innerHTML = `Alternatively for authentic mode '3': `;
        const alternativeAuthRepPitch = 'b';
        if (sortedCounts[0] === alternativeAuthRepPitch) { // case (i)
            alternativeAuthRepRating += 1;
            mode3alternativeDesc.innerHTML += `'${alternativeAuthRepPitch.toUpperCase()}' is the most repeated note (${counts[alternativeAuthRepPitch]} times). `;
        } else {
            if (sortedCounts[1] === alternativeAuthRepPitch && sortedCounts[0] === finalisPitch) { // case (ii)
                alternativeAuthRepRating += 0.75;
                mode3alternativeDesc.innerHTML += `'${alternativeAuthRepPitch.toUpperCase()}' is the second most repeated note (${counts[alternativeAuthRepPitch]} times) `
                mode3alternativeDesc.innerHTML += `after finalis '${finalisPitch.toUpperCase()}'. `;
            } else if (sortedCounts[1] === alternativeAuthRepPitch && sortedCounts[0] !== finalisPitch) { // case (iii)
                alternativeAuthRepRating += 0.5;
                mode3alternativeDesc.innerHTML += `'${alternativeAuthRepPitch.toUpperCase()}' is the second most repeated note (${counts[alternativeAuthRepPitch]} times) `
                mode3alternativeDesc.innerHTML += `after a note other than finalis '${finalisPitch.toUpperCase()}'. `;
            } else if (sortedCounts[2] === alternativeAuthRepPitch) { // case (iv)
                alternativeAuthRepRating += 0.25;
                mode3alternativeDesc.innerHTML += `'${alternativeAuthRepPitch.toUpperCase()}' is the third most repeated note (${counts[alternativeAuthRepPitch]} times). `;
            } else if (sortedCounts[3] === alternativeAuthRepPitch) { // case (v)
                alternativeAuthRepRating += 0.125;
                mode3alternativeDesc.innerHTML += `'${alternativeAuthRepPitch.toUpperCase()}' is the fourth most repeated note (${counts[alternativeAuthRepPitch]} times). `;
            } else {
                mode3alternativeDesc.innerHTML += `'${alternativeAuthRepPitch.toUpperCase()}' is not among the most repeated notes. `;
            }
        }
        repercussioAuthDesc.appendChild(mode3alternativeDesc);

        if (alternativeAuthRepRating > authenticRepercussioRating) {
            authenticRepercussioRating = alternativeAuthRepRating;
            authenticRepercussioPitch = alternativeAuthRepPitch;
        }
    }

    // Conclude authentic repercussio:
    repercussioAuthDesc.innerHTML += `Therefore, there is a <b>${authenticRepercussioRating.toFixed(4) * 100}%</b> probability of being in authentic mode.`;

    // Conclude the repercussio description
    repercussioDesc.appendChild(repercussioAuthDesc);

    /** Repercussio for Plagal mode */
    /** @type {HTMLLIElement} */
    let repercussioPlagDesc = document.createElement('li');
    repercussioPlagDesc.innerHTML = `For the plagal mode (mode '${plagalMode}'): `;

    if (sortedCounts[0] === plagalRepercussioPitch) { // case (i)
        plagalRepercussioRating += 1;
        repercussioPlagDesc.innerHTML += `'${plagalRepercussioPitch.toUpperCase()}' is the most repeated note\
          (${counts[plagalRepercussioPitch]} times). `;
    } else {
        if (sortedCounts[1] === plagalRepercussioPitch && sortedCounts[0] === finalisPitch) { // case (ii)
            plagalRepercussioRating += 0.75;
            repercussioPlagDesc.innerHTML += `'${plagalRepercussioPitch.toUpperCase()}' is the second most repeated note\
            (${counts[plagalRepercussioPitch]} times) `;
            repercussioPlagDesc.innerHTML += `after finalis '${finalisPitch.toUpperCase()}'. `;
        } else if (sortedCounts[1] === plagalRepercussioPitch && sortedCounts[0] !== finalisPitch) { // case (iii)
            plagalRepercussioRating += 0.5;
            repercussioPlagDesc.innerHTML += `'${plagalRepercussioPitch.toUpperCase()}' is the second most repeated note\
            (${counts[plagalRepercussioPitch]} times) `
            repercussioPlagDesc.innerHTML += `after a note other than finalis '${finalisPitch.toUpperCase()}'. `;
        } else if (sortedCounts[2] === plagalRepercussioPitch) { // case (iv)
            plagalRepercussioRating += 0.25;
            repercussioPlagDesc.innerHTML += `'${plagalRepercussioPitch.toUpperCase()}' is the third most repeated note\
            (${counts[plagalRepercussioPitch]} times). `;
        } else if (sortedCounts[3] === plagalRepercussioPitch) { // case (v)
            plagalRepercussioRating += 0.125;
            repercussioPlagDesc.innerHTML += `'${plagalRepercussioPitch.toUpperCase()}' is  the fourth most repeated note\
            (${counts[plagalRepercussioPitch]} times). `;
        } else {
            repercussioPlagDesc.innerHTML += `'${plagalRepercussioPitch.toUpperCase()}' is not among the most repeated notes. `;
        }
    }
    // Conclude plagal repercussio:
    repercussioPlagDesc.innerHTML += `Therefore, there is a <b>${plagalRepercussioRating.toFixed(4) * 100}%</b> probability of being in plagal mode.`;

    // Conclude the repercussio description
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
        const finalisOctave = neumeComponentList[neumeComponentList.length - 1].octave;
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

        const lowerBoundNCSeptenary = toSeptenary(new NeumeComponentSQ('', '', '', pitch, lowerOctaveBoundary));
        const upperBoundNCSeptenary = toSeptenary(new NeumeComponentSQ('', '', '', pitch, upperOctaveBoundary));

        const ncSeptenary = neumeComponentList.map((nc) => toSeptenary(nc));

        const totalNotes = ncSeptenary.length;
        const totalNotesInRange = ncSeptenary.filter((septenaryValue) => septenaryValue >= lowerBoundNCSeptenary && septenaryValue <= upperBoundNCSeptenary).length;

        return [totalNotesInRange / totalNotes, lowerOctaveBoundary, upperOctaveBoundary];
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

    let lowerOctaveAuthentic, upperOctaveAuthentic;
    let lowerOctavePlagal, upperOctavePlagal;
    [ambitusAuthenticRating, lowerOctaveAuthentic, upperOctaveAuthentic] = pitchRangeRate('authentic', ambitusAuthenticRange);
    [ambitusPlagalRating, lowerOctavePlagal, upperOctavePlagal] = pitchRangeRate('plagal', ambitusPlagalRange);

    let ambitusAuthDesc = document.createElement('li');
    ambitusAuthDesc.innerHTML = `For the authentic mode (mode '${authenticMode}'): <b>${Number(ambitusAuthenticRating).toFixed(4) * 100}%</b> of the notes\
        are within the range '${ambitusAuthenticRange.toUpperCase()}-${ambitusAuthenticRange.toUpperCase()}'\
        (${ambitusAuthenticRange.toUpperCase()}${lowerOctaveAuthentic}-${ambitusAuthenticRange.toUpperCase()}${upperOctaveAuthentic}).`;


    let ambitusPlagDesc = document.createElement('li');
    ambitusPlagDesc.innerHTML = `For the plagal mode (mode '${plagalMode}'): <b>${Number(ambitusPlagalRating).toFixed(4) * 100}%</b> of the notes\
        are within the range '${ambitusPlagalRange.toUpperCase()}-${ambitusPlagalRange.toUpperCase()}'\
        (${ambitusPlagalRange.toUpperCase()}${lowerOctavePlagal}-${ambitusPlagalRange.toUpperCase()}${upperOctavePlagal}).`;

    ambitusDesc.appendChild(ambitusAuthDesc);
    ambitusDesc.appendChild(ambitusPlagDesc);

    // Ambitus suggestion
    let ambitusSuggestion = document.createElement('p');

    if (ambitusAuthenticRating > ambitusPlagalRating) {
        modeFromAmbitus = authenticMode;
        ambitusSuggestion.innerHTML = `<b> Ambitus suggests authentic mode '${modeFromAmbitus}' with ${Number(ambitusAuthenticRating).toFixed(4) * 100}%\
          certainty over plagal mode with ${Number(ambitusPlagalRating).toFixed(4) * 100}% certainty</b>.`;
    } else {
        modeFromAmbitus = plagalMode;
        ambitusSuggestion.innerHTML = `<b> Ambitus suggests plagal mode '${modeFromAmbitus}' with ${Number(ambitusPlagalRating).toFixed(4) * 100}%\
          certainty over authentic mode with ${Number(ambitusAuthenticRating).toFixed(4) * 100}% certainty</b>.`;
    }

    ambitusDesc.appendChild(ambitusSuggestion);
    modeDescription.appendChild(ambitusDesc);

    // Conclusion
    let authenticRating = (authenticRepercussioRating + ambitusAuthenticRating) / 2;
    let plagalRating = (plagalRepercussioRating + ambitusPlagalRating) / 2;
    let conclusion = document.createElement('p');
    conclusion.innerHTML = `<b><u> Authentic mode '${authenticMode}' has ${authenticRating.toFixed(4) * 100}% certainty |\
                              Plagal mode '${plagalMode}' has ${plagalRating.toFixed(4) * 100}% certainty.</u></b>`;

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
 * @property {string} meiContent the content of the .mei file
 * @property {string} fileName the name of the .mei file
 * @property {string} title the title of the chant
 * @property {string} source the source of the chant
 * @property {string} notationType the notation type of the chant (either "aquitanian" or "square")
 * @property {Syllable[]} syllables an array of all the syllables in the chant
 * @property {number} mode the mode of the chant
 * @property {number} modeCertainty the certainty of the mode detection
 * @property {string} modeDescription an explaination of the mode detection
 * @property {string[]} pemDatabaseUrls the URL of the file on the PEM (Portuguese Early Music) database
*/
export class Chant {
    /**
     * Constructing a Chant object from a .mei file content
     * @param {MEI_Content} meiContent The content of the .mei file
     * @param {String} filePath the path of the .mei file
     */
    constructor(meiContent, fileName, title, source, notationType, syllables, mode, modeCertainty, modeDescription, pemDatabaseUrls) {
        this.meiContent = meiContent;
        this.fileName = fileName;
        this.title = title;
        this.source = source;
        this.notationType = notationType;
        this.syllables = syllables;
        this.mode = mode;
        this.modeCertainty = modeCertainty;
        this.modeDescription = modeDescription;
        this.pemDatabaseUrls = pemDatabaseUrls;
    }
}

function main() {
    
}