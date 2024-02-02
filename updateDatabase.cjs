const fs = require('fs');

let allMEIfiles = fs.readdirSync('./GABCtoMEI/MEI_outfiles');
// Write all files/folder to database.json (a JSON list)
fs.writeFileSync('./src/database.json', JSON.stringify(allMEIfiles), 'utf8');