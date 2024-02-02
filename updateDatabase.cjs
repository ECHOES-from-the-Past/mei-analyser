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

console.table(allMEIfiles);
// Write all files/folder to database.json (a JSON list)
fs.writeFileSync('./src/database.json', JSON.stringify(allMEIfiles), 'utf8');