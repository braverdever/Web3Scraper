import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import standardizeDate from './utils/dateUtils.js';

export default async function scrapeThirdwork() {
    let allJobs = [];

    try {
        const response = await fetch('https://www.thirdwork.xyz/jobs');
        const html = await response.text();
        
        const $ = cheerio.load(html);

        // Each job posting appears to be in a div with "Top Job" text
        $('.posting-wrapper-job').each((i, element) => {
            const title = $(element).find('.heading').text().trim();
            
            // Only add jobs with 'dev' or 'engineer' in the title
            if (title.toLowerCase().includes('dev') || title.toLowerCase().includes('engineer')) {
                const company = $(element).find('.company-name-jobs').text().trim();
                const location = $(element).find('[fs-cmsfilter-field="Location"]').text().trim();
                const rawDate = $(element).find('.date-added').text().trim();
                const datePosted = standardizeDate(rawDate) || null;
                const baseUrl = 'https://www.thirdwork.xyz';
                const relativeUrl = $(element).find('.heading').parent('a').attr('href');
                const url = baseUrl + relativeUrl;

                // Standardized job object with unified keys
                const job = {
                    title,
                    company,
                    location,
                    url,
                    date: datePosted,
                    salary: null,  // Salary not available on Thirdwork
                    type: null     // Job type not available on Thirdwork
                };

                allJobs.push(job);
            }
        });
        
        return allJobs;

    } catch (error) {
        console.error('Thirdwork: Error during scraping:', error.message);
        return allJobs;
    }
}