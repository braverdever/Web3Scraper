import axios from 'axios';
import * as cheerio from 'cheerio';
import standardizeDate from './utils/dateUtils.js';

export default async function scrapeCryptoJobs(maxPages = 5) {
    const allJobs = [];
    let currentPage = 1;
    let hasNextPage = true;

    try {
        while (hasNextPage && currentPage <= maxPages) {
            const url = `https://cryptojobs.com/jobs?sort_by=posted_at&sort_order=desc&sort=-posted_at&page=${currentPage}`;

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const pageJobs = [];

            // Select all rows from the table
            $('.new-box').each((index, element) => {
                const title = $(element).children().last().children().first().children().first().children().first().html().trim();
                // Only add jobs with 'dev' or 'engineer' in the title
                if (title.toLowerCase().includes('dev') || title.toLowerCase().includes('engineer')) {
                    const relativeUrl = $(element).find('article aside.details h2 a').attr('href');
                    const job = {
                        title: title,
                        company: $(element).find('.details').children().eq(1).children().first().children().first().text().trim(),
                        location: $(element).find('article aside.details ul.info li i.la-map-marker').parent().text().trim() || null,
                        url: relativeUrl.startsWith('http') ? relativeUrl : `https://cryptojobs.com${relativeUrl}`,
                        date: $(element).find('ul.date li span').text().trim() ? standardizeDate($(element).find('ul.date li span').text().trim()) : null,
                        salary: null, // Not available on this site
                        type: $(element).find('.details').children().eq(1).children().eq(1).children().last().text().trim() || null
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
        console.error('CryptoJobs: Error during scraping:', error.message);
        return allJobs; // Return any jobs we managed to collect before the error
    }
}