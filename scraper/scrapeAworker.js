import axios from 'axios';
import standardizeDate from './utils/dateUtils.js';

export default async function scrapeAworker(maxPages = 5) {
    const allJobs = [];
    let currentPage = 1;
    let hasNextPage = true;

    try {
        while (hasNextPage && currentPage <= maxPages) {
            const url = `https://server.aworker.io/api/jobs/pagination?page=${currentPage}&limit=60&jobsAmount=1`;

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const jobs = response.data.results;
            if (!jobs || !jobs.length) {
                break;
            }

            const processedJobs = jobs
                .filter(job => {
                    const title = job.position?.toLowerCase() || '';
                    return title.includes('dev') || title.includes('engineer');
                })
                .map(job => ({
                    title: job.position?.trim() || '',
                    company: job.companyName?.trim() || '',
                    location: job.location || 'Remote',
                    url: job.applyUrl || '',
                    date: job.date ? standardizeDate(job.date) : null,
                    salary: job.minSalary && job.maxSalary ? 
                        `$${job.minSalary.toLocaleString()} - $${job.maxSalary.toLocaleString()}` : null,
                    type: job.type || null
                }));

            allJobs.push(...processedJobs);
            
            // Check if we have more pages using the next object from the API
            hasNextPage = response.data.next && currentPage < maxPages;
            
            if (hasNextPage) {
                currentPage++;
            }
        }

        return allJobs;

    } catch (error) {
        console.error(`Aworker: Error during scraping: ${error.message}`);
        return allJobs;
    }
} 