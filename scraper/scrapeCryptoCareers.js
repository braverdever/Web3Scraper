import axios from 'axios';
import * as cheerio from 'cheerio';
import standardizeDate from './utils/dateUtils.js';

export default async function scrapeCryptoCareers(maxPages = 5) {
    const allJobs = [];
    let currentPage = 1;
    let hasNextPage = true;

    try {
        while (hasNextPage && currentPage <= maxPages) {
            const url = `https://www.crypto-careers.com/backfills/jobs?click_location=homepage&pg=${currentPage}`;

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Referer': 'https://www.crypto-careers.com/',
                    'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                    'Sec-Ch-Ua-Mobile': '?0',
                    'Sec-Ch-Ua-Platform': '"Windows"',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-User': '?1',
                    'Upgrade-Insecure-Requests': '1'
                }
            });

            const $ = cheerio.load(response.data);
            const pageJobs = [];

            // Select all job listings
            $('.job-listing').each((index, element) => {
                const title = $(element).find('.job-title').text().trim();
                
                // Only add jobs with 'dev' or 'engineer' in the title
                if (title.toLowerCase().includes('dev') || title.toLowerCase().includes('engineer')) {
                    const job = {
                        title: title,
                        company: $(element).find('.company-name').text().trim(),
                        location: $(element).find('.job-location').text().trim(),
                        url: $(element).find('a.job-link').attr('href'),
                        date: standardizeDate($(element).find('.job-date').text().trim()) || null,
                        salary: $(element).find('.job-salary').text().trim() || null,
                        type: $(element).find('.job-type').text().trim() || null
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
                await new Promise(resolve => setTimeout(resolve, 1000));
                currentPage++;
            }
        }
        return allJobs;

    } catch (error) {
        console.error('CryptoCareers: Error during scraping:', error.message);
        return allJobs; // Return any jobs we managed to collect before the error
    }
}
