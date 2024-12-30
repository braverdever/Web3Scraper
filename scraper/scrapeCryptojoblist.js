import axios from 'axios';
import standardizeDate from './utils/dateUtils.js';

export default async function scrapeCryptoJobList(maxPages = 5) {
    const allJobs = [];
    let currentPage = 1;
    let hasNextPage = true;

    try {
        while (hasNextPage && currentPage <= maxPages) {
            const url = `https://cryptojobslist.com/api/jobs/findbytag?tag=Remote&location=&page=${currentPage}&sort=recent`;

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            // Process jobs from the API response
            const jobs = response.data.data.filter(job => {
                const title = job.jobTitle.toLowerCase();
                return title.includes('dev') || title.includes('engineer');
            }).map(job => ({
                title: job.jobTitle,
                company: job.companyName,
                location: job.jobLocation || 'Remote',
                url: `https://cryptojobslist.com/jobs/${job.seoSlug}`,
                date: standardizeDate(job.timeSinceJobCreation) || null,
                salary: job.salary ? `${job.salary.currency} ${job.salary.unitText}` : null,
                type: null // Job type not provided by this source
            }));

            // Add jobs from this page to our complete list
            allJobs.push(...jobs);
            
            // Check if we should continue to next page
            hasNextPage = jobs.length > 0 && currentPage < maxPages;
            
            if (hasNextPage) {
                // Add a delay between requests
                await new Promise(resolve => setTimeout(resolve, 1000));
                currentPage++;
            }
        }
        return allJobs;

    } catch (error) {
        console.error('CryptoJobList: Error during scraping:', error.message);
        return allJobs; // Return any jobs we managed to collect before the error
    }
}