import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import standardizeDate from './utils/dateUtils.js';
export default async function scrapeCryptoJobster() {
    let allJobs = [];

    try {
        const response = await fetch('https://cryptojobster.com');
        const html = await response.text();
        
        const $ = cheerio.load(html);
        
        $('ol.loop-ol > li').each((i, element) => {
            // Get title and company from h3
            const titleElement = $(element).find('h3.job-loop-title');
            const fullTitle = titleElement.text().trim();
            // Split title into position and company (format: "Position @ Company")
            const [title, company] = fullTitle.split(' @ ').map(s => s.trim());
            // Get tags
            const tags = [];
            $(element).find('.tag-design').each((_, tag) => {
                tags.push($(tag).text().trim());
            });
            
            // Get date
            const date = $(element).find('time').text().trim();
            
            // Get specific info from the following div with job details
            const nextDiv = $(element).next('div.collapse');
            const link = nextDiv.find('a').first();
            const url = link.attr('href');
            
            if (title && (title.toLowerCase().includes('dev') || title.toLowerCase().includes('engineer'))) {
                allJobs.push({
                    title: title,
                    company: company,
                    location: tags.find(tag => !tag.includes('Remote') && tag !== tags[0]) || null,
                    url: url?.startsWith('http') ? url : `https://cryptojobster.com${url}`,
                    date: standardizeDate(date) || null,
                    salary: null,
                    type: tags.find(tag => tag.includes('Remote')) ? 'Remote' : 'On-site'
                });
            }
        });

        return allJobs;

    } catch (error) {
        console.error('CryptoJobster: Error during scraping:', error.message);
        return allJobs;
    }
}