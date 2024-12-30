import fetch from 'node-fetch';
import standardizeDate from './utils/dateUtils.js';

export default async function scrapeWelcomeToWeb3() {
    let allJobs = [];
    
    try {
        const payload = {
            where: {
                active: true,
                on_firstpage: false
            },
            limit: 50,
            order: "-creation_date",
            _method: "GET",
            _ApplicationId: "5VE4KNkBeYMTdfTA00noEQUKOgQGHfyB2pFlvT1C",
            _JavaScriptKey: "UwS6HQAsXHWU5iYAlcgZ4M7Lu3exf7I34DBFTUZT",
            _ClientVersion: "js5.1.0",
            _InstallationId: "8591bbd9-0919-4470-b48b-e75bd0e97821"
        };

        const response = await fetch('https://w2tw3web.b4a.app/classes/JobOffer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Origin': 'https://welcometotheweb3.com',
                'Referer': 'https://welcometotheweb3.com/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'cross-site'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return allJobs;
        }

        const data = await response.json();
        
        // Process each job
        for (const job of data.results) {
            if (job.position && (job.position.toLowerCase().includes('dev') || 
                job.position.toLowerCase().includes('engineer'))) {
                
                // Format the date if available
                let formattedDate = null;
                if (job.creation_date?.iso || job.createdAt) {
                    const dateStr = job.creation_date?.iso || job.createdAt;
                    formattedDate = standardizeDate(dateStr);
                }

                // Ensure full URL
                const fullUrl = job.contact_link.startsWith('http') ? 
                    job.contact_link : 
                    `https://welcometotheweb3.com${job.contact_link}`;

                allJobs.push({
                    title: job.position || null,
                    company: job.company_name || null,
                    location: job.country || null,
                    url: fullUrl,
                    date: formattedDate,
                    salary: job.min_yearly_salary && job.max_yearly_salary ? 
                        `$${job.min_yearly_salary.toLocaleString()}-${job.max_yearly_salary.toLocaleString()}` : null,
                    type: job.country?.toLowerCase().includes('remote') ? 'Remote' : null
                });
            }
        }

        return allJobs;

    } catch (error) {
        console.error('WelcomeToWeb3: Error during scraping:', error.message);
        return allJobs;
    }
} 