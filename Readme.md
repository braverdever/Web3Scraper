# Web3 Job Scrapers Overview

## How to Run

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Running the Scraper
```bash
# Run all scrapers
npm start

# Or run directly with Node
node index.js

# Run with day limit (only fetch jobs posted within last N days)
node index.js --daylimit=7
```

### Output
- The scrapers will run in parallel
- Results are saved to an Excel file named `web3-jobs-[date].xlsx`
- The Excel file includes columns for:
  - Date
  - Title
  - Company
  - Location
  - Type
  - Salary
  - Source
  - URL

### Notes
- Each scraper has a default page limit of 5 pages
- Failed scrapers will be logged but won't stop other scrapers
- Progress is shown in the console during execution
- Rate limiting is implemented to avoid overloading job sites
- Date standardization is handled automatically

## Data Extraction Summary

| Scraper Name | Title | Company | Location | Posted Date | Salary | Job Type | URL/Link | Notes |
|--------------|:------:|:-------:|:--------:|:-----------:|:------:|:--------:|:--------:|:------|
| scrapeAworker | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Uses salary range format |
| scrapeBeInCrypto | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Complex DOM structure |
| scrapeBlockchainAssociation | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Uses Getro API |
| scrapeBlockew | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | Handles month name abbreviations |
| scrapeCryptoCareers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Uses pagination |
| scrapeCryptocurrencyJobs | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Uses Algolia API |
| scrapeCryptoDotJobs | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | Handles emoji in location |
| scrapeCryptoJobList | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | Uses API with currency info |
| scrapeCryptoJobs | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Handles relative URLs |
| scrapeCryptoJobster | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Parses "@ Company" format |
| scrapeFindWeb3 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | Uses Next.js data API |
| scrapeJobs3 | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | Basic job information |
| scrapeJobStash | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | Uses middleware API |
| scrapeRemote3 | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Uses encrypted API params |
| scrapeThirdwork | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | DOM-based scraping |
| scrapeWeb3Career | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | Table-based structure |
| scrapeWeb3Jobs | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | Uses class-based selectors |
| scrapeWelcomeToWeb3 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Uses Parse API |

## Legend
- ✅ = Information is extracted
- ❌ = Information is not available or not extracted

## Common Features
1. All scrapers filter for "dev" or "engineer" in job titles
2. All scrapers use standardized date formatting via `dateUtils.js`
3. All scrapers return jobs in a unified format with consistent keys:
   - title: Job title
   - company: Company name
   - location: Job location (null if not available)
   - url: Full URL to job posting
   - date: Posted date (null if not available)
   - salary: Salary information (null if not available)
   - type: Job type (null if not available)
4. All scrapers include error handling and return empty arrays on failure
5. All scrapers include platform name in error logging

## Implementation Categories

### API-Based Scrapers
- scrapeBlockchainAssociation (Getro API)
- scrapeCryptocurrencyJobs (Algolia API)
- scrapeCryptoJobList (Custom API)
- scrapeFindWeb3 (Next.js data API)
- scrapeJobStash (Middleware API)
- scrapeRemote3 (Encrypted API)
- scrapeWelcomeToWeb3 (Parse API)

### DOM-Based Scrapers
- scrapeBeInCrypto
- scrapeBlockew
- scrapeCryptoCareers
- scrapeCryptoDotJobs
- scrapeCryptoJobs
- scrapeCryptoJobster
- scrapeJobs3
- scrapeThirdwork
- scrapeWeb3Career
- scrapeWeb3Jobs