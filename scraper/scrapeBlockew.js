import axios from "axios";
import * as cheerio from "cheerio";
import standardizeDate from "./utils/dateUtils.js";
export default async function scrapeBlockew(maxPages = 5) {
  const allJobs = [];
  let currentPage = 1;
  let hasNextPage = true;

  try {
    while (hasNextPage && currentPage <= maxPages) {
      const url = `https://blockew.com/crypto-jobs/developer/page/${currentPage}/`;

      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const $ = cheerio.load(response.data);
      const pageJobs = [];

      // Select all job listings
      $(".job_listing").each((index, element) => {
        const title = $(element).find(".job_listing-title").text().trim();
        // Only add jobs with 'dev' or 'engineer' in the title
        if (
          title.toLowerCase().includes("dev") ||
          title.toLowerCase().includes("engineer")
        ) {
          const company = $(element)
            .find(".job_listing-company")
            .text()
            .trim()
            .split("\t")[0];
          const location = $(element)
            .find(".job_listing-location")
            .text()
            .trim();
          const rawDate = $(element)
            .find(".job_listing-date")
            .text()
            .trim()
            .replace("January", "Jan")
            .replace("February", "Feb")
            .replace("March", "Mar")
            .replace("April", "Apr")
            .replace("May", "May") // May is already short
            .replace("June", "Jun")
            .replace("July", "Jul")
            .replace("August", "Aug")
            .replace("September", "Sep")
            .replace("October", "Oct")
            .replace("November", "Nov")
            .replace("December", "Dec");
          const relativeUrl = $(element).find("a").attr("href");

          const job = {
            title,
            company,
            location,
            url: new URL(relativeUrl, "https://blockew.com").toString(),
            date: standardizeDate(rawDate) || null,
            salary: null, // Not available on Blockew
            type: null, // Not available on Blockew
          };
          pageJobs.push(job);
        }
      });

      // Add jobs from this page to our complete list
      allJobs.push(...pageJobs);

      // Check if we should continue to next page
      const nextPageExists = $(".pagination a.next").length > 0;
      hasNextPage =
        nextPageExists && pageJobs.length > 0 && currentPage < maxPages;

      if (hasNextPage) {
        currentPage++;
      }
    }
    return allJobs;
  } catch (error) {
    console.error("Blockew: Error during scraping:", error.message);
    return allJobs; // Return any jobs we managed to collect before the error
  }
}
