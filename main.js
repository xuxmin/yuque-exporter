import puppeteer from 'puppeteer';
import { exit } from 'process';
import fs from 'fs';
import path from 'path';
import { autoLogin } from './src/login.js';
import { getAllBooks } from './src/toc.js';
import { exportMarkDownFiles } from './src/export.js';
// import { printDirectoryTree } from './src/toc.js';
import { logger } from "./src/const.js";
import { DOWNLOAD_BOOKS, FILE_SUCCESS, FILE_FAIL } from "./src/data.js"


let color = {
    byNum: (mess, fgNum) => {
        mess = mess || '';
        fgNum = fgNum === undefined ? 31 : fgNum;
        return '\u001b[' + fgNum + 'm' + mess + '\u001b[39m';
    },
    black: (mess) => color.byNum(mess, 30),
    red: (mess) => color.byNum(mess, 31),
    green: (mess) => color.byNum(mess, 32),
    yellow: (mess) => color.byNum(mess, 33),
    blue: (mess) => color.byNum(mess, 34),
    magenta: (mess) => color.byNum(mess, 35),
    cyan: (mess) => color.byNum(mess, 36),
    white: (mess) => color.byNum(mess, 37)
};



async function run() {
    if (!process.env.EXPORT_PATH) {
        const outputDir = path.join(process.cwd(), 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        process.env.EXPORT_PATH = outputDir;
        logger.info(`The environment variable EXPORT_PATH is not set, so the default ${outputDir} is used as the export path.`)
    }

    // const page = await BrowserPage.getInstance();
    const browser = await puppeteer.launch({ headless: true }); // true:not show browser
    const page = await browser.newPage();

    // 检查是否存在 cookie 文件
    await autoLogin(page)
    logger.info(color.green("Login successfully!"))

    logger.info("Get book stacks ...")
    const books = await getAllBooks(page)

    logger.info("Start export all books ...")
    await exportMarkDownFiles(page, books)

    var SummaryData = 
    `
<<<<<<<<<<<<<<<<<<< Summary >>>>>>>>>>>>>>>>>>>>>>>
Total ${DOWNLOAD_BOOKS.length} books need update.
    ${DOWNLOAD_BOOKS}.

These files download success: ${FILE_SUCCESS}

These files download fail: ${FILE_FAIL}
<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    `
    logger.info(`${SummaryData}`);
    browser.close()
};


run();

