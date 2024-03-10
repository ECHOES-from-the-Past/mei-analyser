/**
 * This script updates the database.json file with all the MEI files in the MEI_outfiles folder.
 * 
 * To run this script, use the following command: (assuming you are in the root folder of the project)
 * `node src/database/updateDatabase.cjs`
 * # or
 * `npm run updateDatabaseList`
 */
const fs = require('fs');

const MEI_DIRECTORY = 'GABCtoMEI/MEI_outfiles';
const DATABASE_JSON = 'src/database/database.json';

let allMEIfiles = fs.readdirSync(MEI_DIRECTORY, { recursive: true });
// console.log(allMEIfiles);

// Filter out only MEI files
allMEIfiles = allMEIfiles.filter((file) => {
    return (!file.includes("testfiles") && !file.includes("intermedfiles") && file.endsWith('.mei'));
});
console.log(allMEIfiles);

// Write all files/folder to database.json (a JSON list)
fs.writeFileSync(DATABASE_JSON, JSON.stringify(allMEIfiles), 'utf8');