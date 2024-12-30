import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import standardizeDate from './utils/dateUtils.js';

export default async function scrapeJobs3() {
    const allJobs = [];

    try {
        const baseUrl = 'https://main.jobs3.io';
        const url = `${baseUrl}/jobs/`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive'
            },
            timeout: 30000,
            size: 0, // No size limit
            follow: 5 // Follow up to 5 redirects
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        $('.jobsearch-column-12').each((index, element) => {
            const title = $(element).find('.jobsearch-pst-title a').text().trim();
            const company = $(element).find('.job-company-name').text().trim();
            const rawDate = $(element).find('.listitm-posted-time').text().trim();
            const relativeUrl = $(element).find('.jobsearch-applyjob-btn').attr('href');
            
            // Only add jobs with 'dev' or 'engineer' in the title
            if (title.toLowerCase().includes('dev') || title.toLowerCase().includes('engineer')) {
                allJobs.push({
                    title: title,
                    company: company,
                    location: null,
                    url: relativeUrl || '',
                    date: standardizeDate(rawDate) || null,
                    salary: null,
                    type: null
                });
            }
        });

        return allJobs;

    } catch (error) {
        console.error('Jobs3: Error during scraping:', error.message);
        return allJobs;
    }
}