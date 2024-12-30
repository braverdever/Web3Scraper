import fetch from 'node-fetch';
import standardizeDate from './utils/dateUtils.js';

export default async function scrapeFindWeb3() {
    let allJobs = [];

    try {
        const url = 'https://findweb3.com/_next/data/PYekkFJbWmtS-wSCDu-Ry/jobs.json';
        const response = await fetch(url);
        const data = await response.json();
        const jobs = data.pageProps.jobs;
        
        jobs.forEach(job => {
            const title = job['Job Title'];
            if (title.toLowerCase().includes('dev') || title.toLowerCase().includes('engineer')) {
                const rawDate = job['Posted Date'];
                allJobs.push({
                    title: title,
                    company: job['Company Name'],
                    location: job['Company HQ'] || 'Remote',
                    url: `https://findweb3.com/job/${job.id}`,
                    date: standardizeDate(rawDate) || null,
                    salary: null,
                    type: null
                });
            }
        });

        return allJobs;

    } catch (error) {
        console.error('FindWeb3: Error during scraping:', error.message);
        return allJobs;
    }
}