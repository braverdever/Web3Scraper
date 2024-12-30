import axios from 'axios';
import * as cheerio from 'cheerio';
import standardizeDate from './utils/dateUtils.js';

export default async function scrapeBeInCrypto(maxPages = 5) {
    const allJobs = [];
    let currentPage = 1;
    let hasNextPage = true;

    try {
        while (hasNextPage && currentPage <= maxPages) {
            const url = `https://beincrypto.com/jobs/?page=${currentPage}`;

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const pageJobs = [];

            // Select all rows from the table
            $('.bg-bicDarkGrey500.rounded-3xl.p-6.border-bicDarkGrey700.border.w-full').each((index, element) => {
                const title = element.children[1].lastChild.firstChild.firstChild.firstChild.data;
                // Only add jobs with 'dev' or 'engineer' in the title
                if (title.toLowerCase().includes('dev') || title.toLowerCase().includes('engineer')) {
                    const job = {
                        title: title,
                        company: $(element).children().eq(1).children().last().children().last().children().first().text().trim(),
                        location: $(element).children().last().children().eq(2).children().eq(1).children().first().children().last().text().trim() || null,
                        url: 'https://beincrypto.com' + $(element).find('a[href^="/jobs/p/"]').attr('href'),
                        date: standardizeDate($(element).find('.text-xs.text-neutral-500').first().text().split('|')[0].trim()) || null,
                        salary: $(element).children().last().children().last().children().eq(1).text() || null,
                        type: $(element).children().last().children().eq(2).children().first().children().first().children().last().text().trim() || null
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
        console.error('BeInCrypto: Error during scraping:', error.message);
        return allJobs; // Return any jobs we managed to collect before the error
    }
}