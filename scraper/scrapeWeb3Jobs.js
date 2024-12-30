import axios from 'axios';
import * as cheerio from 'cheerio';
import standardizeDate from './utils/dateUtils.js';

export default async function scrapeWeb3Jobs(maxPages = 5) {
    const allJobs = [];
    let currentPage = 1;
    let hasNextPage = true;

    try {
        while (hasNextPage && currentPage <= maxPages) {
            const url = `https://web3jobs.io/jobs?page=${currentPage}`;

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const pageJobs = [];

            $('.job-listings-item').each((index, element) => {
                const title = $(element).find('.job-details h3').text().trim();
                
                if (title.toLowerCase().includes('dev') || title.toLowerCase().includes('engineer')) {
                    const job = {
                        title: title,
                        company: $(element).find('.job-info-link-item').first().text().trim(),
                        location: $(element).find('.job-details .jb-color-475569ff:contains("Remote")').text().trim() || 'Remote',
                        url: "https://web3jobs.io" + $(element).find('.job-details-link').attr('href'),
                        date: standardizeDate($(element).find('.job-posted-date').text().trim()) || null,
                        salary: null,
                        type: null
                    };
                    pageJobs.push(job);
                }
            });

            allJobs.push(...pageJobs);
            
            hasNextPage = pageJobs.length > 0 && currentPage < maxPages;
            
            if (hasNextPage) {
                currentPage++;
            }
        }
        return allJobs;

    } catch (error) {
        console.error('Web3Jobs: Error during scraping:', error.message);
        return allJobs;
    }
}