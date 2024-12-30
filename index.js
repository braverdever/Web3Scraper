import ExcelJS from 'exceljs';
import scrapeAworker from './scraper/scrapeAworker.js';
import scrapeBeInCrypto from './scraper/scrapeBeincrypto.js';
import scrapeBlockchainAssociation from './scraper/scrapeBlockchainAssociation.js';
import scrapeBlockew from './scraper/scrapeBlockew.js';
import scrapeCryptoCareers from './scraper/scrapeCryptoCareers.js';
import scrapeCryptocurrencyJobs from './scraper/scrapeCryptocurrencyJobs.js';
import scrapeCryptoJobList from './scraper/scrapeCryptojoblist.js';
import scrapeCryptoJobs from './scraper/scrapeCryptojobs.js';
import scrapeCryptoDotJobs from './scraper/scrapeCryptoDotJobs.js';
import scrapeCryptoJobster from './scraper/scrapeCryptoJobster.js';
import scrapeJobStash from './scraper/scrapeJobStash.js';
import scrapeRemote3 from './scraper/scrapeRemote3.js';
import scrapeThirdwork from './scraper/scrapeThirdwork.js';
import scrapeWeb3Career from './scraper/scrapeWeb3Career.js';
import scrapeWeb3Jobs from './scraper/scrapeWeb3Jobs.js';
import scrapeWelcomeToWeb3 from './scraper/scrapeWelcomeToWeb3.js';
import scrapeJobs3 from './scraper/scrapeJobs3.js';
import scrapeFindWeb3 from './scraper/scrapeFindWeb3.js';
import { parseArgs } from 'node:util';

async function getAllJobs() {
    // Parse command line arguments
    const { values } = parseArgs({
        options: {
            daylimit: { type: 'string' }
        }
    });
    const dayLimit = parseInt(values.daylimit) || null;

    // Run all scrapers in parallel
    const scrapingPromises = [
        { name: 'Aworker', promise: scrapeAworker() },
        { name: 'BeInCrypto', promise: scrapeBeInCrypto() },
        { name: 'BlockchainAssociation', promise: scrapeBlockchainAssociation() },
        { name: 'Blockew', promise: scrapeBlockew() },
        // { name: 'CryptoCareers', promise: scrapeCryptoCareers() },
        { name: 'CryptocurrencyJobs', promise: scrapeCryptocurrencyJobs() },
        { name: 'CryptoJobList', promise: scrapeCryptoJobList() },
        { name: 'CryptoJobs', promise: scrapeCryptoJobs() },
        { name: 'CryptoDotJobs', promise: scrapeCryptoDotJobs() },
        { name: 'CryptoJobster', promise: scrapeCryptoJobster() },
        { name: 'JobStash', promise: scrapeJobStash() },
        // { name: 'Remote3', promise: scrapeRemote3() },
        { name: 'Thirdwork', promise: scrapeThirdwork() },
        { name: 'Web3Career', promise: scrapeWeb3Career() },
        { name: 'Web3Jobs', promise: scrapeWeb3Jobs() },
        { name: 'WelcomeToWeb3', promise: scrapeWelcomeToWeb3() },
        { name: 'Jobs3', promise: scrapeJobs3() },
        { name: 'FindWeb3', promise: scrapeFindWeb3() },
    ];

    const results = [];
    
    // Wait for all scrapers to complete and collect results
    for (const scraper of scrapingPromises) {
        try {
            console.log(`Scraping ${scraper.name}...`);
            const jobs = await scraper.promise;
            
            // Filter jobs by date if dayLimit is specified
            let filteredJobs = jobs;
            if (dayLimit) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - dayLimit);
                
                filteredJobs = jobs.filter(job => {
                    if (!job.date) return false;
                    const jobDate = new Date(job.date);
                    return jobDate >= cutoffDate;
                });
            }

            const jobsWithSource = filteredJobs.map(job => ({
                ...job,
                source: scraper.name
            }));
            results.push(...jobsWithSource);
            console.log(`✓ ${scraper.name}: Found ${filteredJobs.length} jobs within time limit`);
        } catch (error) {
            console.error(`× Error scraping ${scraper.name}:`, error);
        }
    }

    return results;
}

async function saveToExcel(jobs) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Web3 Jobs');

    // Define columns
    worksheet.columns = [
        { header: 'Date', key: 'date', width: 20 },
        { header: 'Title', key: 'title', width: 50 },
        { header: 'Company', key: 'company', width: 30 },
        { header: 'Location', key: 'location', width: 20 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Salary', key: 'salary', width: 20 },
        { header: 'Source', key: 'source', width: 20 },
        { header: 'URL', key: 'url', width: 100 }
    ];

    // Sort jobs by date (newest first)
    const sortedJobs = jobs.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
    });

    // Add jobs to worksheet
    sortedJobs.forEach(job => {
        worksheet.addRow({
            date: job.date,
            title: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            salary: job.salary,
            source: job.source,
            url: job.url
        });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    // Save the workbook
    const filename = `web3-jobs-${new Date().toISOString().split('T')[0]}.xlsx`;
    await workbook.xlsx.writeFile(filename);
    console.log(`Saved ${sortedJobs.length} jobs to ${filename}`);
}

async function main() {
    const startTime = Date.now();

    try {
        const jobs = await getAllJobs();
        await saveToExcel(jobs);
        
        const duration = (Date.now() - startTime) / 1000;
        console.log(`Scraping completed in ${duration.toFixed(2)} seconds`);
    } catch (error) {
        console.error('Error in main process:', error);
    }
}

main(); 