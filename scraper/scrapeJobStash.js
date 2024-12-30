import fetch from 'node-fetch';
import standardizeDate from './utils/dateUtils.js';

export default async function scrapeJobStash(maxPages = 5) {
    let allJobs = [];

    try {
        // Iterate through pages
        for (let page = 1; page <= maxPages; page++) {
            const url = `https://middleware.jobstash.xyz/jobs/list?page=${page}&limit=20`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (!response.ok) {
                console.error(`JobStash: HTTP error! status: ${response.status}`);
                continue;
            }

            
            if (!Array.isArray(data.data)) {
                break;
            }

            const pageJobs = data.data
                .filter(job => {
                    const title = job['title'].toLowerCase();
                    return title.includes('dev') || title.includes('engineer');
                })
                .map(job => ({
                    title: job['title'],
                    company: job.organization?.name || null,
                    location: job.locationType || job.location || null,
                    url: job.url ? new URL(job.url).href : null,
                    date: job.timestamp ? standardizeDate(job.timestamp) : null,
                    salary: null, // JobStash doesn't provide salary info
                    type: null    // JobStash doesn't provide job type
                }));

            allJobs = [...allJobs, ...pageJobs];

            // Add delay between requests
            if (page < maxPages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return allJobs;

    } catch (error) {
        console.error('JobStash: Error during scraping:', error.message);
        return allJobs;
    }
} 