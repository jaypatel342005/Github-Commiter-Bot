const readline = require('readline');
const jsonfile = require('jsonfile');
const moment = require('moment');
const simpleGit = require('simple-git')();

const FILE_PATH = './data.json';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question) => {
    return new Promise((resolve) => rl.question(question, resolve));
};

const makeCommit = async (n, date) => {
    if (n === 0) {
        await simpleGit.push();
        console.log("All commits made and pushed!");
        rl.close();
        return;
    }

    const DATE = moment(date).format();
    const data = { date: DATE };

    console.log(`Committing for date: ${DATE}`);
    
    await jsonfile.writeFile(FILE_PATH, data);
    await simpleGit.add([FILE_PATH]);
    await simpleGit.commit(DATE, [FILE_PATH], { '--date': DATE });
    
    await makeCommit(n - 1, date);
};

const start = async () => {
    // Check and stash any unstaged changes
    const status = await simpleGit.status();
    if (status.files.length > 0) {
        await simpleGit.stash();
        console.log("Unstaged changes stashed.");
    }

    const date = await askQuestion('Enter the date (YYYY-MM-DD): ');
    const numberOfCommits = await askQuestion('Enter the number of commits: ');

    await makeCommit(parseInt(numberOfCommits, 10), date);

    // Apply stashed changes if any
    if (status.files.length > 0) {
        await simpleGit.stash(['pop']);
        console.log("Stashed changes reapplied.");
    }
};

start();
