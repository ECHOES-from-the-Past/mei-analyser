/**
 * This script updates the database.json file with all the MEI files in the MEI_outfiles folder.
 * 
 * To run this script, use the following command: (assuming you are in the root folder of the project)
 * `node src/database/updateDatabase.cjs`
 * # or
 * `npm run updateDatabaseList`
 */
import * as fs from 'fs';
import { Octokit } from "@octokit/core";

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

console.log(data.data)

// const tree = data.data.tree;
// for (const item of tree) {
//     if (item.path.includes('.mei')) {
//         console.log(item.path)
//     }
// }

const DATABASE_JSON = 'src/database/database.json';

let allMEIfiles = data.data.tree.map((item) => {
    return item.path;
});
// console.log(allMEIfiles);

// Filter out only MEI files
allMEIfiles = allMEIfiles.filter((file) => {
    return (!file.includes("testfiles") && !file.includes("intermedfiles") && file.endsWith('.mei'));
});
console.log(allMEIfiles);

// Write all files/folder to database.json (a JSON list)
fs.writeFileSync(DATABASE_JSON, JSON.stringify(allMEIfiles), 'utf8');