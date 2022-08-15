/* tslint:disable */
/* @ts-nocheck*/
const { writeFile, existsSync, mkdirSync } = require('fs');
const { argv } = require('yargs');
require('dotenv').config();

const environment = argv.environment;
const envDirectory = './src/environments';



// helper fn to write env variables
function writeFileUsingFS(targetPath: any, environmentFileContent: any) {
    writeFile(targetPath, environmentFileContent, function (err: any) {
        if (err) {
            console.log(err);
        }

        if (environmentFileContent !== '') {
            console.log(`written to ${targetPath}`)
        }
    }
    )
}

// create environment if it does exist
if (!existsSync(envDirectory)) {
    mkdirSync(envDirectory)
}

// create the files so they can be written into later
writeFileUsingFS('./src/environments/environment.prod.ts', '');
writeFileUsingFS('./src/environments/environment.ts', '');

// check whether dev or prod mode
const isProduction = environment === 'prod';

// choose the correct path based on isProduction mode
const targetPath = isProduction
    ? './src/environments/environment.prod.ts'
    : './src/environments/environment.ts';

// create the actual content to be written
const environmentFileContent = `
// This file was generated automatically using setenv.ts and dotenv. 

export const environment = {
    production: ${isProduction},
    firebase: {
        projectId: '${process.env['PROJECT_ID']}',
        appId: '${process.env['APP_ID']}',
        databaseUrl: '${process.env['DATABASE_URL']}',
        storageBucket: '${process.env['STORAGE_BUCKET']}',
        locationId: '${process.env['LOCATION_ID']}',
        apiKey: '${process.env['API_KEY']}',
        authDomain: '${process.env['AUTH_DOMAIN']}',
        messagingSenderId: '${process.env['MESSAGING_SENDER_ID']}',
        measurementId: '${process.env['MEASUREMENT_ID']}' 
    },
    africasTalkingCredentials: {
        apiKey: '${process.env['AT_API_KEY']}',
        username: '${process.env['AT_USERNAME']}'
    }
}
`;

// write the files to target paths
writeFileUsingFS(targetPath, environmentFileContent)


/* tslint:enable */
