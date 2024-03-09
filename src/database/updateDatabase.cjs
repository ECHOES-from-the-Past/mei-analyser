/**
 * This script updates the database.json file with all the MEI files in the MEI_outfiles folder.
 * 
 * To run this script, use the following command: (assuming you are in the root folder of the project)
 * `node src/search/updateDatabase.cjs`
 * # or
 * `npm run updateDatabase`
 */
const fs = require('fs');

const MEI_DIRECTORY = 'GABCtoMEI/MEI_outfiles';
const DATABASE_JSON = 'src/database/database.json';

let allMEIfiles = fs.readdirSync(MEI_DIRECTORY, { recursive: true });
console.log(allMEIfiles);

// Filter out only MEI files
let i = 0;
while (i < allMEIfiles.length) {
    if (!allMEIfiles[i].endsWith('.mei') || allMEIfiles[i].includes('testfiles') || allMEIfiles[i].includes('intermed')) {
        allMEIfiles.splice(i, 1);
    } else {
        i++;
    }
}
console.log(allMEIfiles);

// Write all files/folder to database.json (a JSON list)
fs.writeFileSync(DATABASE_JSON, JSON.stringify(allMEIfiles), 'utf8');