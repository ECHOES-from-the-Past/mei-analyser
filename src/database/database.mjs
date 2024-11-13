/*
 * This script updates the database.json file with all the MEI files in the MEI_outfiles folder.
 * 
 * To run this script, use the following command: (assuming you are in the root folder of the project)
 * `node src/database/updateDatabase.mjs`
 * # or
 * `npm run database`
 */

import * as xml2js from 'xml2js';
import * as fs from 'fs';
import { Chant, NeumeComponentAQ, NeumeComponentSQ, Syllable, SyllableWord, getNeumeComponentList, toSeptenary } from '../utility/components.js';
import { Octokit } from "@octokit/core";

/**
 * Display the certainty percentage as string
 * @param {Number} certaintyPercentage the certainty percentage of the search result
 * @returns the certainty percentage
 * @example displayRating(0.8) --> "80%"
*/
function displayRating(certaintyPercentage) {
    return (certaintyPercentage.toFixed(2) * 100).toFixed(0) + "%";
}

/**
 * @param {string} meiContent 
 * @returns {JSON} the JSON object of the MEI content
 */
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
function getPEMUrls(meiJSON) {
    const urls = meiJSON.mei.meiHead[0].manifestationList[0].manifestation[0].itemList[0].item[0].$.target;
    const url = urls.split('and');
    return url;
}

/**
 * 
 * @param {JSON} meiJSON 
 * @returns {{line:number, shape:string}} the line and the shape of the clef
 */
function getClefInformation(meiJSON, notationType, modeDescription) {
    let clef = {
        "line": 0,
        "shape": null
    }

    // only worls for square notation with <clef> field
    if (notationType === "square") {
        const clefJSON = meiJSON.mei.music[0].body[0].mdiv[0].score[0].section[0].staff[0].layer[0].clef[0];
        clef.line = Number(clefJSON.$.line);
        clef.shape = clefJSON.$.shape;
    } else if (notationType === "aquitanian") {
        // see issue https://github.com/ECHOES-from-the-Past/mei-analyser/issues/52 for reference
        clef.line = 0;
        clef.shape = modeDescription.match(/'[A-G]'/) ? modeDescription.match(/'[A-G]'/)[0].replace(/'/g, '') : null;
    }
    return clef;
}

/**
 * Obtain the title of the chant
 * @returns {string} the title of the chant
 */
function getChantTitle(meiJSON) {
    const title = meiJSON.mei.meiHead[0].fileDesc[0].titleStmt[0].title[0]._;
    return title;
}


/**
 * 
 * @param {JSON} meiJSON 
 */
function getCantusId(meiJSON) {
    const cantusIdInfo = meiJSON.mei.meiHead[0].fileDesc[0].titleStmt[0].title[0].identifier[0];

    let cantusId = "";
    // Making sure that the information is type "CantusID"
    if (cantusIdInfo.$.type == "CantusID") {
        cantusId = cantusIdInfo._
    }
    return cantusId;
}


/**
 * Get the source of the chant
 * @returns {string} the source of the chant
 */
function getSource(meiJSON) {
    const source = meiJSON.mei.meiHead[0].manifestationList[0].manifestation[0].itemList[0].item[0].identifier[0];
    return source;
}

function getAllSyllables(meiJSON) {
    const allSyllables = meiJSON.mei.music[0].body[0].mdiv[0].score[0].section[0].staff[0].layer[0].syllable;
    return allSyllables;
}

/**
 * 
 * @param {JSON} syllable 
 * @param {string} notationType 
 * @returns {Syllable} a syllable object
 */
function parseToSyllableObject(syllable, notationType) {
    const syl = syllable.syl[0];
    const sylWordId = syl.$["xml:id"];
    const sylWordText = syl._;
    const sylWordPosition = syl.$.wordpos;
    // Creating a SyllableText object
    const syllableWordObject = new SyllableWord(sylWordId, sylWordText, sylWordPosition);

    // Getting all the neume components enclosed in the syllable
    let neumeComponents = [];
    if (syllable.neume != undefined) {
        const neumeList = syllable.neume;
        for (let neume of neumeList) {
            for (let nc of neume.nc) {
                const ncId = nc.$["xml:id"];
                let ncTilt = nc.$.tilt ? nc.$.tilt : null;

                let ncOrnamental = null;
                nc.liquescent ? ncOrnamental = {
                    "type": "liquescent",
                    "id": nc.liquescent[0].$["xml:id"]
                } : null;

                nc.quilisma ? ncOrnamental = {
                    "type": "quilisma",
                    "id": nc.quilisma[0].$["xml:id"]
                } : null;

                nc.oriscus ? ncOrnamental = {
                    "type": "oriscus",
                    "id": nc.oriscus[0].$["xml:id"]
                } : null;

                // let ncOrnamental = null; // TEMPORARY, TODO

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
        }
    }
    // Creating a Syllable object
    const id = syllable.$["xml:id"];
    const syllableObj = new Syllable(id, syllableWordObject, neumeComponents);
    return syllableObj;
}

/**
 * 
 * @param {JSON} allSyllables 
 * @param {string} notationType 
 * @returns {Syllable[]} an array of syllable objects
 */
function parseToSyllableArray(allSyllables, notationType) {
    let syllableArray = [];
    for (let syllable of allSyllables) {
        const syllableObj = parseToSyllableObject(syllable, notationType);
        syllableArray.push(syllableObj);
    }
    return syllableArray;
}

/**
 * Helper function to calculate the mode of the Aquitanian chant.
 * Refer to https://github.com/ECHOES-from-the-Past/mei-analyser/issues/8 for Aquitanian mode detection
 * @returns {[[number], number, string]} the possible mode(s), the certainty, and the descripion of the chant.
 */
function calculateAquitanianMode(syllables) {
    let possibleModes = [];
    let modeDescription = "";

    const neumeComponentList = getNeumeComponentList(syllables);
    // Checking last note
    const lastNote = neumeComponentList[neumeComponentList.length - 1];
    let lastNoteLoc = lastNote.loc;

    // Starting a list of descriptions
    modeDescription += "<ul>";
    // Finalis
    let finalisDescription = "";
    if (lastNoteLoc == 0) {
        finalisDescription = "on the line (position 0)";
    } else if (lastNoteLoc > 0) {
        finalisDescription = `${lastNoteLoc} steps above the line (position +${lastNoteLoc})`;
    } else {
        finalisDescription = `${Math.abs(lastNoteLoc)} steps below the line (position ${lastNoteLoc})`;
    }

    modeDescription += `<li> The <b> finalis </b> is located ${finalisDescription}. </li>`;

    // Rhombus

    // Finding all rhombus shapes by checking every `nc` for a `@tilt = se`
    const allWithSETilt = neumeComponentList.filter((nc) => nc.tilt === 'se');
    let allWithSETiltLoc = allWithSETilt.map((nc) => nc.loc);

    // Checking the @loc value of all rhombus shapes to help determining the mode of the Aquitanian chant
    const rhombus146 = allWithSETiltLoc.filter((loc) => (loc != -1 && loc != 3 && loc != 2)).length == 0;
    const rhombus2 = allWithSETiltLoc.filter((loc) => (loc != -2 && loc != 1 && loc != -3)).length == 0;
    const rhombus38 = allWithSETiltLoc.filter((loc) => (loc != -2 && loc != 2 && loc != 1)).length == 0;
    const rhombus4rare = allWithSETiltLoc.filter((loc) => (loc != 0 && loc != -3 && loc != 4 && loc != 3)).length == 0;
    const rhombus5 = allWithSETiltLoc.filter((loc) => (loc != -3 && loc != 1 && loc != 0)).length == 0;
    const rhombus7 = allWithSETiltLoc.filter((loc) => (loc != 0 && loc != 3 && loc != -1)).length == 0;

    if (allWithSETiltLoc.length <= 0) {
        modeDescription += "<li> <b> No rhombus shape </b> is detected in the chant. </li>";
    } else if (allWithSETiltLoc.length == 1) {
        modeDescription += "<li> Only <b> one rhombus shape </b> is detected. </li>";
    } else {
        let rhombusDescription = [];
        if (lastNoteLoc == -2 && rhombus146) {
            possibleModes.push(1);
            rhombusDescription.push("three steps above the line (+3)");
            rhombusDescription.push("one step below the line (-1)");
        }

        if (lastNoteLoc == 0 && rhombus2) {
            possibleModes.push(2);
            rhombusDescription.push("one step above the line (+1)");
            rhombusDescription.push("two steps below the line (-2)");
        }

        if (lastNoteLoc == -2 && rhombus38) {
            possibleModes.push(3);
            rhombusDescription.push("two steps above the line (+2)");
            rhombusDescription.push("two steps below the line (-2)");
        }

        if (lastNoteLoc == -1 && rhombus146) {
            possibleModes.push(4);
            rhombusDescription.push("three steps above the line (+3)");
            rhombusDescription.push("one step below the line (-1)");
        }

        if (lastNoteLoc == 0 && rhombus4rare) { // rare case
            possibleModes.push(4);
            rhombusDescription.push("on the line (0)")
            rhombusDescription.push("four steps above the line (+4)");
            rhombusDescription.push("three steps below the line (-3)");
        }

        if (lastNoteLoc == -2 && rhombus5) {
            possibleModes.push(5);
            rhombusDescription.push("one step above the line (+1)");
            rhombusDescription.push("three steps below the line (-3)");
        }

        if (lastNoteLoc == 0 && rhombus146) {
            possibleModes.push(6);
            rhombusDescription.push("three steps above the line (+3)");
            rhombusDescription.push("one step below the line (-1)");
        }

        if (lastNoteLoc == -2 && rhombus7) {
            possibleModes.push(7);
            rhombusDescription.push("on the line (0)");
            rhombusDescription.push("three steps above the line (+3)");
        }

        if (lastNoteLoc == 0 && rhombus38) {
            possibleModes.push(8);
            rhombusDescription.push("two steps above the line (+2)");
            rhombusDescription.push("two steps below the line (-2)");
        }

        if (rhombusDescription.length > 0) {
            modeDescription += `<li> The <b> rhomboidal punctum </b> can be found exclusively ${rhombusDescription.join(" or ")}. </li>`;
        } else {
            modeDescription += `<li> The <b> rhomboidal punctum </b> provides no information. </li>`;
        }
    }

    // repercussio
    let count = {};
    for (let nc of neumeComponentList) {
        if (count[nc.loc] === undefined) {
            count[nc.loc] = 1;
        } else {
            count[nc.loc] += 1;
        }
    }
    let sortedCount = Object.keys(count).sort((a, b) => count[b] - count[a]);

    // modeDescription += `<li> The <b>repeated notes</b> in descending order of appearance are at: ${sortedCount.map(loc => `${loc > 0 ? `+${loc}` : `${loc}`} (${count[loc]} ${count[loc] > 1 ? 'times' : 'time'})`).join(", ")}.</li>`;

    const linePitch = {
        1: 'F', 2: 'D', 3: 'G', 4: 'F',
        5: 'A', 6: 'F', 7: 'B', 8: 'G'
    }

    if (possibleModes.length == 0) {
        modeDescription += `<li style='list-style-type: none;'> <b> <u> Unable to suggest a mode for the chant. The pitch of the line is unknown. </b> </u> </li>`;
    } else {
        modeDescription += `<li style='list-style-type: none;'> <b> <u> Possible mode(s) include mode ${possibleModes.join(", mode ")}. The pitch of the line is '${possibleModes.forEach((mode) => {
            return linePitch[mode];
        })}'. </b> </u> </li>`;
    }

    modeDescription += "</ul>";

    return [possibleModes, 0, modeDescription];
}

/**
 * Refer to https://github.com/ECHOES-from-the-Past/mei-analyser/issues/10 for Square mode detection
 * @returns {[number, number, string]} the mode, the overall rating, and the descripion of the chant.
 */
function calculateSquareMode(syllables) {
    // Combine the 3 conditions to determine the mode
    let mode = -1;    // default undefined mode
    let rating = 0;   // default undefined rating

    let modeDescription = "<ul>";

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

    let finalisDescription = "<li>";
    if (authenticMode === -1 || plagalMode === -1) {
        finalisDescription += `Unable to detect the exact mode based on the finalis pitch '${finalisPitch.toUpperCase()}'.`;
    } else {
        finalisDescription += `The <b> finalis </b> pitch is '${finalisPitch.toUpperCase()}', suggesting modes ${authenticMode} or ${plagalMode}.`;
    }

    modeDescription += finalisDescription + "</li>";

    /**
     * 2nd step: REPERCUSSIO - Most repeated note
     */
    let repercussioIntroduction = "<li>";
    repercussioIntroduction += `Regarding <b>repercussio</b>:`;
    modeDescription += repercussioIntroduction + "</li>";

    let repercussioDesc = '<ul>';

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
    let repercussioAuthDesc = '<li>';
    /** Repercussio for Authentic mode */
    repercussioAuthDesc += `For the authentic mode (mode '${authenticMode}'): `;

    if (sortedCounts[0] === authenticRepercussioPitch) { // case (i)
        authenticRepercussioRating += 1;
        repercussioAuthDesc += `'${authenticRepercussioPitch.toUpperCase()}' is the most repeated note (${counts[authenticRepercussioPitch]} times). `;
    } else {
        if (sortedCounts[1] === authenticRepercussioPitch && sortedCounts[0] === finalisPitch) { // case (ii)
            authenticRepercussioRating += 0.75;
            repercussioAuthDesc += `'${authenticRepercussioPitch.toUpperCase()}' is the second most repeated note (${counts[authenticRepercussioPitch]} times) `
            repercussioAuthDesc += `after finalis '${finalisPitch.toUpperCase()}'. `;
        } else if (sortedCounts[1] === authenticRepercussioPitch && sortedCounts[0] !== finalisPitch) { // case (iii)
            authenticRepercussioRating += 0.5;
            repercussioAuthDesc += `'${authenticRepercussioPitch.toUpperCase()}' is the second most repeated note (${counts[authenticRepercussioPitch]} times) `
            repercussioAuthDesc += `after a note other than finalis '${finalisPitch.toUpperCase()}'. `;
        } else if (sortedCounts[2] === authenticRepercussioPitch) { // case (iv)
            authenticRepercussioRating += 0.25;
            repercussioAuthDesc += `'${authenticRepercussioPitch.toUpperCase()}' is the third most repeated note (${counts[authenticRepercussioPitch]} times). `;
        } else if (sortedCounts[3] === authenticRepercussioPitch) { // case (v)
            authenticRepercussioRating += 0.125;
            repercussioAuthDesc += `'${authenticRepercussioPitch.toUpperCase()}' is the fourth most repeated note (${counts[authenticRepercussioPitch]} times). `;
        } else {
            repercussioAuthDesc += `'${authenticRepercussioPitch.toUpperCase()}' is not among the most repeated notes. `;
        }
    }


    /* Check for mode 3 alternatives
    *  If the finalis is 'E', mode 3 alternative is 'B'
    */
    if (mode3alternatives) {
        let mode3alternativeDesc = "<li>";
        let alternativeAuthRepRating = 0;
        mode3alternativeDesc += `Alternatively for authentic mode '3': `;
        const alternativeAuthRepPitch = 'b';
        if (sortedCounts[0] === alternativeAuthRepPitch) { // case (i)
            alternativeAuthRepRating += 1;
            mode3alternativeDesc += `'${alternativeAuthRepPitch.toUpperCase()}' is the most repeated note (${counts[alternativeAuthRepPitch]} times). `;
        } else {
            if (sortedCounts[1] === alternativeAuthRepPitch && sortedCounts[0] === finalisPitch) { // case (ii)
                alternativeAuthRepRating += 0.75;
                mode3alternativeDesc += `'${alternativeAuthRepPitch.toUpperCase()}' is the second most repeated note (${counts[alternativeAuthRepPitch]} times) `
                mode3alternativeDesc += `after finalis '${finalisPitch.toUpperCase()}'. `;
            } else if (sortedCounts[1] === alternativeAuthRepPitch && sortedCounts[0] !== finalisPitch) { // case (iii)
                alternativeAuthRepRating += 0.5;
                mode3alternativeDesc += `'${alternativeAuthRepPitch.toUpperCase()}' is the second most repeated note (${counts[alternativeAuthRepPitch]} times) `
                mode3alternativeDesc += `after a note other than finalis '${finalisPitch.toUpperCase()}'. `;
            } else if (sortedCounts[2] === alternativeAuthRepPitch) { // case (iv)
                alternativeAuthRepRating += 0.25;
                mode3alternativeDesc += `'${alternativeAuthRepPitch.toUpperCase()}' is the third most repeated note (${counts[alternativeAuthRepPitch]} times). `;
            } else if (sortedCounts[3] === alternativeAuthRepPitch) { // case (v)
                alternativeAuthRepRating += 0.125;
                mode3alternativeDesc += `'${alternativeAuthRepPitch.toUpperCase()}' is the fourth most repeated note (${counts[alternativeAuthRepPitch]} times). `;
            } else {
                mode3alternativeDesc += `'${alternativeAuthRepPitch.toUpperCase()}' is not among the most repeated notes. `;
            }
        }
        repercussioAuthDesc += mode3alternativeDesc + "</li>";

        if (alternativeAuthRepRating > authenticRepercussioRating) {
            authenticRepercussioRating = alternativeAuthRepRating;
            authenticRepercussioPitch = alternativeAuthRepPitch;
        }
    }

    // Conclude authentic repercussio:
    // repercussioAuthDesc += `Therefore, there is a <b>${displayRating(authenticRepercussioRating)}</b> probability of being in authentic mode.`;

    // Conclude the repercussio description
    repercussioDesc += repercussioAuthDesc + "</li>";

    /** Repercussio for Plagal mode */
    /** @type {HTMLLIElement} */
    let repercussioPlagDesc = "<li>";
    repercussioPlagDesc += `For the plagal mode (mode '${plagalMode}'): `;

    if (sortedCounts[0] === plagalRepercussioPitch) { // case (i)
        plagalRepercussioRating += 1;
        repercussioPlagDesc += `'${plagalRepercussioPitch.toUpperCase()}' is the most repeated note (${counts[plagalRepercussioPitch]} times). `;
    } else {
        if (sortedCounts[1] === plagalRepercussioPitch && sortedCounts[0] === finalisPitch) { // case (ii)
            plagalRepercussioRating += 0.75;
            repercussioPlagDesc += `'${plagalRepercussioPitch.toUpperCase()}' is the second most repeated note (${counts[plagalRepercussioPitch]} times) `;
            repercussioPlagDesc += `after finalis '${finalisPitch.toUpperCase()}'. `;
        } else if (sortedCounts[1] === plagalRepercussioPitch && sortedCounts[0] !== finalisPitch) { // case (iii)
            plagalRepercussioRating += 0.5;
            repercussioPlagDesc += `'${plagalRepercussioPitch.toUpperCase()}' is the second most repeated note (${counts[plagalRepercussioPitch]} times) `
            repercussioPlagDesc += `after a note other than finalis '${finalisPitch.toUpperCase()}'. `;
        } else if (sortedCounts[2] === plagalRepercussioPitch) { // case (iv)
            plagalRepercussioRating += 0.25;
            repercussioPlagDesc += `'${plagalRepercussioPitch.toUpperCase()}' is the third most repeated note (${counts[plagalRepercussioPitch]} times). `;
        } else if (sortedCounts[3] === plagalRepercussioPitch) { // case (v)
            plagalRepercussioRating += 0.125;
            repercussioPlagDesc += `'${plagalRepercussioPitch.toUpperCase()}' is the fourth most repeated note (${counts[plagalRepercussioPitch]} times). `;
        } else {
            repercussioPlagDesc += `'${plagalRepercussioPitch.toUpperCase()}' is not among the most repeated notes. `;
        }
    }
    // Conclude plagal repercussio:
    // repercussioPlagDesc += `Therefore, there is a <b>${displayRating(plagalRepercussioRating)}</b> probability of being in plagal mode.`;

    // Conclude the repercussio description
    repercussioDesc += repercussioPlagDesc + "</li>";

    // Calculate the final repercussio rating
    let repercussioSuggestion = "<p>";
    if (authenticRepercussioRating > plagalRepercussioRating) {
        modeFromRepercussio = authenticMode;
        repercussioSuggestion += `<b> Repercussio suggests authentic mode '${modeFromRepercussio}'.</b>`;
    } else {
        modeFromRepercussio = plagalMode;
        repercussioSuggestion += `<b> Repercussio suggests plagal mode '${modeFromRepercussio}'.</b>`;
    }
    repercussioDesc += repercussioSuggestion + "</p>" + "</ul>"; // close the repercussio description

    modeDescription += repercussioDesc;

    /**
     * 3rd condition: AMBITUS - Range of the notes
     * The mode is calculated as the number of notes within the predefined range divided by the total number of notes.
     * Equation: rate = (number of notes within the predetermined range) / (total number of notes)
     * Example: if pitch range is "D-D", all notes are expected to be within the range of D2 to D3.
     */
    let ambitusIntroduction = "<li>";
    ambitusIntroduction += `Regarding <b>ambitus</b>:`;
    modeDescription += ambitusIntroduction;

    let ambitusDesc = "<ul>";
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

    let ambitusAuthDesc = '<li>';
    ambitusAuthDesc += `For the authentic mode (mode '${authenticMode}'): <b>${displayRating(ambitusAuthenticRating)}</b> of the notes `;
    ambitusAuthDesc += `are within the range '${ambitusAuthenticRange.toUpperCase()}-${ambitusAuthenticRange.toUpperCase()}' `;
    ambitusAuthDesc += `(${ambitusAuthenticRange.toUpperCase()}${lowerOctaveAuthentic}-${ambitusAuthenticRange.toUpperCase()}${upperOctaveAuthentic}).`;
    ambitusAuthDesc += "</li>";

    let ambitusPlagDesc = '<li>';
    ambitusPlagDesc += `For the plagal mode (mode '${plagalMode}'): <b>${displayRating(ambitusPlagalRating)}</b> of the notes `;
    ambitusPlagDesc += `are within the range '${ambitusPlagalRange.toUpperCase()}-${ambitusPlagalRange.toUpperCase()}' `;
    ambitusPlagDesc += `(${ambitusPlagalRange.toUpperCase()}${lowerOctavePlagal}-${ambitusPlagalRange.toUpperCase()}${upperOctavePlagal}).`;
    ambitusPlagDesc += "</li>";

    ambitusDesc += ambitusAuthDesc;
    ambitusDesc += ambitusPlagDesc;

    // Ambitus suggestion
    let ambitusSuggestion = "<p>";

    if (ambitusAuthenticRating > ambitusPlagalRating) {
        modeFromAmbitus = authenticMode;
        ambitusSuggestion += `<b> Ambitus suggests authentic mode '${modeFromAmbitus}'.</b>.`;
    } else {
        modeFromAmbitus = plagalMode;
        ambitusSuggestion += `<b> Ambitus suggests plagal mode '${modeFromAmbitus}'</b>.`;
    }

    ambitusDesc += ambitusSuggestion + "</p>";
    modeDescription += ambitusDesc + "</ul>"; // close the ambitus description

    modeDescription += "</ul>";

    // Conclusion
    let authenticRating = (authenticRepercussioRating + ambitusAuthenticRating) / 2;
    let plagalRating = (plagalRepercussioRating + ambitusPlagalRating) / 2;

    // let conclusion = "<li style='list-style-type: none;'>";
    // conclusion += `&emsp; <b><u> Authentic mode '${authenticMode}' has ${displayRating(authenticRating)} certainty | `;
    // conclusion += `Plagal mode '${plagalMode}' has ${displayRating(plagalRating)} certainty.</u></b>`;
    // conclusion += "</li>";

    // modeDescription += conclusion;

    // Calculate the final mode and rating
    if (authenticRating > plagalRating) {
        mode = authenticMode;
        rating = authenticRating;
    } else {
        mode = plagalMode;
        rating = plagalRating;
    }

    return [[mode], rating, modeDescription];
}

/**
 * Use authentication token to increase the rate limit for the GitHub API
 * For regular deployment of this project, 60 request per hour is more than enough,
 * since the deployment only occurs once in a while.
 */
const octokit = new Octokit({
    // auth: 'YOUR-TOKEN'
})

const OWNER = 'ECHOES-from-the-Past'
const REPO = 'GABCtoMEI'

// Retrieve the directory tree
let data = await octokit.request(`GET /repos/${OWNER}/${REPO}/git/trees/main`, {
    owner: OWNER,
    repo: REPO,
    // tree_sha: 'main',
    accept: 'application/vnd.github+json',
    headers: {
        'X-GitHub-Api-Version': '2022-11-28'
    },
    recursive: 'true'
});

let targetChantlist = process.env.NODE_ENV === "production" ? "dist/database.json" : "src/database/database.json";

let allMEIfiles = data.data.tree.map((item) => {
    return item.path;
});

// Filter out only MEI files
allMEIfiles = allMEIfiles.filter((file) => {
    return (!file.includes("testfiles") && !file.includes("intermedfiles") && file.endsWith('.mei') && file != 'template.mei');
});


// Get all the content of the MEI files and parse them into Chant objects
let allChants = [];

for (let fileName of allMEIfiles) {
    let meiContent = await fetch(`https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${fileName}`)
        .then(response => response.text());

    let meiJSON = parseMEIContentToJSON(meiContent);
    let title = getChantTitle(meiJSON);
    let source = getSource(meiJSON);
    let notationType = getNotationType(meiJSON);
    let allSyllables = getAllSyllables(meiJSON);
    let syllables = parseToSyllableArray(allSyllables, notationType);

    let mode, modeCertainty, modeDescription;
    if (notationType === "aquitanian") {
        [mode, modeCertainty, modeDescription] = calculateAquitanianMode(syllables);
    } else if (notationType === "square") {
        [mode, modeCertainty, modeDescription] = calculateSquareMode(syllables);
    }
    let clef = getClefInformation(meiJSON, notationType, modeDescription);

    let pemUrls = getPEMUrls(meiJSON);
    let cantusId = getCantusId(meiJSON);
    let chant = new Chant(meiContent, fileName, title, source, notationType, syllables, mode, modeCertainty, modeDescription, clef, pemUrls, cantusId);

    allChants.push(chant);
}

// Write all files/folder to database.json (a JSON list)
fs.writeFileSync(targetChantlist, JSON.stringify(allChants), 'utf8');
