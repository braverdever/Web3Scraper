import fetch from 'node-fetch';
import standardizeDate from './utils/dateUtils.js';
export default async function scrapeCryptocurrencyJobs() {
    let allJobs = [];

    try {
        const url = 'https://8ehcb38y1u-dsn.algolia.net/1/indexes/*/queries';
        const params = new URLSearchParams({
            'x-algolia-agent': 'Algolia for JavaScript (4.10.5); Browser (lite); instantsearch.js (4.30.0); JS Helper (3.5.5)',
            'x-algolia-api-key': 'e3deada9c15551e6363ee91e7e7d59cc',
            'x-algolia-application-id': '8EHCB38Y1U'
        });

        const response = await fetch(`${url}?${params}`, {
            method: 'POST',
            headers: {
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://cryptocurrencyjobs.co',
                'Referer': 'https://cryptocurrencyjobs.co/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'cross-site',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            },
            body: JSON.stringify({
                "requests": [{
                    "indexName": "jobs",
                    "params": "highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&query=&maxValuesPerFacet=10&page=0&hitsPerPage=1000&facets=%5B%22type%22%2C%22location.country%22%2C%22tags%22%2C%22role%22%2C%22location.region%22%2C%22location.city%22%2C%22company.name%22%5D&tagFilters="
                }]
            })
        });

        const data = await response.json();
        
        if (data.results && data.results[0].hits) {
            allJobs = data.results[0].hits
                .filter(hit => {
                    const titleLower = hit.title.toLowerCase();
                    return titleLower.includes('dev') || titleLower.includes('engineer');
                })
                .map(hit => ({
                    title: hit.title,
                    company: hit.company.name,
                    location: hit.locationFilter || null,
                    url: `https://cryptocurrencyjobs.co${hit.permalink}`,
                    date: hit.date ? standardizeDate(hit.date) : null,
                    salary: null,
                    type: hit.type || null
                }));
        }
        
        return allJobs;

    } catch (error) {
        console.error('CryptocurrencyJobs: Error during scraping:', error.message);
        return allJobs;
    }
}