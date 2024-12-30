import axios from 'axios';
import * as cheerio from 'cheerio';
import standardizeDate from './utils/dateUtils.js';
export default async function scrapeCryptoDotJobs(maxPages = 5) {
    const allJobs = [];
    let currentPage = 1;
    let hasNextPage = true;

    try {
        while (hasNextPage && currentPage <= maxPages) {
            const url = `https://crypto.jobs/jobs?page=${currentPage}`;

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const pageJobs = [];

            // Select all job listings
            $('.job-entry').each((index, element) => {
                const title = $(element).find('.job-title').text().trim();
                // Only add jobs with 'dev' or 'engineer' in the title
                if (title.toLowerCase().includes('dev') || title.toLowerCase().includes('engineer')) {
                    const relativeUrl = $(element).find('.job-url').attr('href');
                    const job = {
                        title: title,
                        company: $(element).find('span').first().text().trim(),
                        location: $(element).find('span:contains("🌍")').text().trim().replace('🌍 ', ''),
                        url: relativeUrl.startsWith('http') ? relativeUrl : `https://crypto.jobs${relativeUrl}`,
                        date: standardizeDate($(element).find('[datetime]').text().trim()) || null,
                        salary: null,  // Not available on crypto.jobs
                        type: null     // Not available on crypto.jobs
                    };
                    pageJobs.push(job);
                }
            });

            // Add jobs from this page to our complete list
            allJobs.push(...pageJobs);
            
            // Check if we should continue to next page
            const nextPageButton = $('.pagination .next');
            hasNextPage = nextPageButton.length > 0 && currentPage < maxPages;
            
            if (hasNextPage) {
                currentPage++;
            }
        }
        return allJobs;

    } catch (error) {
        console.error('CryptoDotJobs: Error during scraping:', error.message);
        return allJobs;
    }
} 