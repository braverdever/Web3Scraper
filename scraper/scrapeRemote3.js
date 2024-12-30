import fetch from 'node-fetch';
import standardizeDate from './utils/dateUtils.js';

export default async function scrapeRemote3() {
    let allJobs = [];

    try {
        // Make the jobs request with the required encrypted parameters
        const url = 'https://remote3.co/elasticsearch/msearch';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': 'https://remote3.co',
                'Referer': 'https://remote3.co/',
                'x-bubble-breaking-revision': '5',
                'x-requested-with': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                "z": "l6Lc463fI3fG2dSFI3Ym7uSaA8+sV0GVqGGbRi/zl/4QPkCRTYNq3MC4XM3jOUkvqSBnqHt/hbmkXsIyxrygOo7WjeM7JpOp0dc/R9v+Xi29K5UwO29v1mRqwa1BgRpd9+WUU0dZULcGyvMVW6ywq4GNTUm1WZAoKhlVnsEMl6S0I5myDguCqKPtfHc0eTnAmGozqBg5Yfs1Lefx+VswEOr0vizRJGzvb/TI2xu/AiYzQNmtLRl/6n6GLmW9dpTO/iVbnkxrfcfp9gxpoPx8pwEdjHPeW3AFqTHR2cBxRCc5gPPUkUz9vnXmrGlxLfNbN1UgdW0vTRbS6GsGekJ8m3/L7FXv8Ynm7PzxroSdEJwyEk1lDje1g0aRwCaLBG97ujek9slNKjMyM+HcP2KFLMKJjgZGxtdefHRPYveTsGo7+1jM1TdZ+s7B2h1WrqfTNcpM/Io5Vvz+V4lNUTp1HKyHtm1joNfe2srQ11dZIac9VIBEiU6ia7851OYPC7UactWo6eLvsSpxj0ovpLuNnGi8Iu5M2heZQCxVw/nW/OWuq0GdyBIICkYMBqK92ZKhfAAILwaNxdOM2yHDEUFTqwKr6oK14k0uFLBxFNadwOMQWg0wSVyiwIxweCpcl+lGNV/6FPsgT6aarubimHjKg8SbAFIw3YlK3/RDBdnGdLXehb6XfYALGEI1wj0FWRwJCeNx6HqWYffNQNXFCCAaIKM3AvAnGbIE5J8iV2osVc/06VOJOmdFhzuMYkuRJhPuZfwrA1DRVDJ4jbFVSt8+pbD7mWLNUJeHxqC3Lgk5snlIuejydO+JZeQBiraQ/yk51/owK73OFdgW6x/5OHNGl0mZQUz8+XZhxVq1Xuhod4yVOdtqIb/w6hM9uOJCrOWR",
                "y": "yS0x+rcm8V8kLzCV4yWElQ==",
                "x": "gUkMq1uDZjrC2z36V1bni21rkxxWaVCyYwUCR7OvGnw="
            })
        });

        // Parse the response data
        const data = await response.json();
        
        // Extract jobs from the nested response structure
        const jobs = data.responses[0].hits.hits;

        // Map the jobs to our standard format
        allJobs = jobs.map(job => ({
            title: job._source.job_title_text,
            company: job._source.Slug,
            location: job._source.location_text_text || 'Remote',
            // description: job._source.job_description_text,
            applyUrl: job._source.apply_url_text,
            date: standardizeDate(job._source["Created Date"]) || null,
            type: job._source.job_type_option_job_type || null
        }));

        return allJobs;

    } catch (error) {
        console.error('Remote3: Error during scraping:', error.message);
        return allJobs;
    }
}