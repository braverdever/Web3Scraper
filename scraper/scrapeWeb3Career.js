import axios from 'axios';
import * as cheerio from 'cheerio';
import standardizeDate from './utils/dateUtils.js';

export default async function scrapeWeb3Career(maxPages = 5) {
    const allJobs = [];
    let currentPage = 1;
    let hasNextPage = true;

    try {
        while (hasNextPage && currentPage <= maxPages) {
            const url = `https://web3.career/?page=${currentPage}`;

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const pageJobs = [];

            // Select all rows from the table
            $('table tr').each((index, element) => {
                if (index === 0) return; // Skip header row

                const title = $(element).find('td:nth-child(1)').text().trim();
                // Only add jobs with 'dev' or 'engineer' in the title
                if (title.toLowerCase().includes('dev') || title.toLowerCase().includes('engineer')) {
                    const job = {
                        title,
                        company: $(element).find('td:nth-child(2)').text().trim(),
                        location: $(element).find('td:nth-child(4)').text().trim() || null,
                        url: 'https://web3.career' + $(element).find('td:nth-child(1) a').attr('href'),
                        date: standardizeDate($(element).find('td:nth-child(3)').text().trim()) || null,
                        salary: $(element).find('td:nth-child(5)').text().trim() || null,
                        type: null // Web3Career doesn't provide job type info
                    };
                    pageJobs.push(job);
                }
            });

            // Add jobs from this page to our complete list
            allJobs.push(...pageJobs);
            
            // Check if we should continue to next page
            hasNextPage = pageJobs.length > 0 && currentPage < maxPages;
            
            if (hasNextPage) {
                // Add a delay between requests
                currentPage++;
            }
        }
        return allJobs;

    } catch (error) {
        console.error('Web3Career: Error during scraping:', error.message);
        return allJobs; // Return any jobs we managed to collect before the error
    }
}