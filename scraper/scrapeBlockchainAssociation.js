import fetch from 'node-fetch';
import standardizeDate from './utils/dateUtils.js';

export default async function scrapeBlockchainAssociation() {
    let allJobs = [];

    try {
        const url = 'https://api.getro.com/api/v2/collections/869/search/jobs';
        
        // Fetch 10 pages of results
        for (let page = 1; page <= 10; page++) {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Origin': 'https://jobs.theblockchainassociation.org',
                    'Referer': 'https://jobs.theblockchainassociation.org/jobs'
                },
                body: JSON.stringify({
                    hitsPerPage: 20,
                    page: page,
                    filters: { page: page },
                    query: ""
                })
            });

            const data = (await response.json()).results.jobs;
            if (data && Array.isArray(data)) {
                const pageJobs = data
                    .filter(job => {
                        const title = job.title.toLowerCase();
                        return title.includes('dev') || title.includes('engineer');
                    })
                    .map(job => ({
                        title: job.title,
                        company: job.organization?.name || '',
                        location: job.locations?.join(', ') || 'Remote',
                        url: job.url,
                        date: job.created_at ? standardizeDate(new Date(job.created_at * 1000).toISOString()) : null,
                        salary: null, // Not available in source data
                        type: job.work_mode || null,
                    }));
                
                allJobs = [...allJobs, ...pageJobs];
            }
        }

        return allJobs;

    } catch (error) {
        console.error('BlockchainAssociation: Error during scraping:', error.message);
        return allJobs;
    }
}