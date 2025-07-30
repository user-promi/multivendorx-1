/* eslint-disable no-console */
import { minify as minifyJs } from 'terser';
import CleanCSS from 'clean-css';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import sass from 'sass';

/**
 * This is the list of folders where the .js and .scss files are present.
 * format: (path start from the root of the project './')
 * 1. 'dist' (directory)
 */
const sourceFolders = [
    "assets",
    ...glob.sync("modules/*/assets/*")
];

const { name } = JSON.parse( fs.readFileSync( "package.json" ) );

( async () => {
    const jsOutputPath = `release/assets/js/${name}-merged.min.js`;
    const cssOutputPath = `release/assets/styles/${name}-merged.min.css`;

    // === JS MERGE + MINIFY ===
    console.log(chalk.bgYellowBright.black('🧹 Merging and minifying JS files'));

    const jsFiles = sourceFolders.flatMap((folder) =>
        glob.sync(`${folder}/**/*.js`)
    );

    let mergedJs = '';

    for ( const file of jsFiles ) {
        try {
            const content = await fs.readFile(file, 'utf8');
            console.log(chalk.bgCyanBright.black(`📦 JS: Appending ${file}`));
            mergedJs += `\n// ---- ${ path.relative( '.', file ) } ----\n` + content + '\n';
        } catch ( error ) {
            console.log(chalk.red(`❌ Error reading JS file ${file}: ${error.message}`));
        }
    }

    if ( mergedJs ) {
        try {
            const result = await minifyJs( mergedJs );
            await fs.outputFile(jsOutputPath, result.code);
            console.log(chalk.bgGreenBright.black(`✅ Minified JS written to ${jsOutputPath}`));
        } catch ( error ) {
            console.log(chalk.red(`❌ Error during JS minification: ${error.message}`));
        }
    }

    // === SCSS MERGE + MINIFY ===
    console.log(chalk.bgYellowBright.black('🎨 Merging and minifying SCSS files'));

    const scssFiles = sourceFolders.flatMap( ( folder ) =>
        glob.sync(`${folder}/**/*.scss`)
    );

    let mergedScss = '';

    for ( const file of scssFiles ) {
        try {
            const content = sass.compile(file, { style: "expanded" });
            console.log(chalk.bgMagentaBright.black(`📦 SCSS: Appending ${file}`));
            mergedScss += `\n/* ---- ${ path.relative( '.', file ) } ---- */\n` + content.css + '\n';
        } catch ( error ) {
            console.log(chalk.red(`❌ Error reading SCSS file ${file}: ${error.message}`));
        }
    }

    if ( mergedScss ) {
        try {
            const result = new CleanCSS().minify(mergedScss);
            await fs.outputFile( cssOutputPath, result.styles );
            console.log( chalk.bgGreenBright.black( `✅ Minified CSS written to ${cssOutputPath}` ) );
        } catch ( error ) {
            console.log( chalk.red( `❌ Error during SCSS minification: ${error.message}` ) );
        }
    }
} )();
