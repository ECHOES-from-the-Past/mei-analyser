/**
 * This script updates the database.json file with all the MEI files in the MEI_outfiles folder.
 * 
 * To run this script, use the following command: (assuming you are in the root folder of the project)
 * `node src/search/updateDatabase.cjs`
 * # or
 * `npm run updateDatabase`
 */
const fs = require('fs');

let allMEIfiles = fs.readdirSync('./GABCtoMEI/MEI_outfiles');

// Filter out only MEI files
let i = 0;
while (i < allMEIfiles.length) {
    if (!allMEIfiles[i].endsWith('.mei')) {
        allMEIfiles.splice(i, 1);
    } else {
        i++;
    }
}

// Write all files/folder to database.json (a JSON list)
fs.writeFileSync('./database.json', JSON.stringify(allMEIfiles), 'utf8');

// Check if the database is written correctly
const database = require('./database.json');
console.log('Database table:')
console.table(database);