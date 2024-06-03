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

// logging the response
console.log(data)

let targetDatabase = process.env.NODE_ENV === "production" ? "dist/database.json" : "src/database/database.json";

let allMEIfiles = data.data.tree.map((item) => {
    return item.path;
});
// console.log(allMEIfiles);

// Filter out only MEI files
allMEIfiles = allMEIfiles.filter((file) => {
    return (!file.includes("testfiles") && !file.includes("intermedfiles") && file.endsWith('.mei') && file != 'template.mei');
});
// console.log(allMEIfiles);

// Write all files/folder to database.json (a JSON list)
fs.writeFileSync(targetDatabase, JSON.stringify(allMEIfiles), 'utf8');