import axios from 'axios';
import * as cheerio from 'cheerio';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  link: string;
  date: string;
  source: 'linkedin' | 'indeed';
  score?: number;
  matchReason?: string;
}

export async function scrapeLinkedIn(keywords: string, location: string): Promise<Job[]> {
  try {
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`;
    
    // LinkedIn guest API often requires a User-Agent to return proper HTML
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const jobs: Job[] = [];

    $('li').each((_, element) => {
      const title = $(element).find('.base-search-card__title').text().trim();
      const company = $(element).find('.base-search-card__subtitle').text().trim();
      const jobLocation = $(element).find('.job-search-card__location').text().trim();
      const link = $(element).find('.base-card__full-link').attr('href');
      const date = $(element).find('time').attr('datetime') || $(element).find('.job-search-card__listdate').text().trim();
      
      // Extract ID from entityUrn or data-entity-urn if available, or generate one
      const entityUrn = $(element).find('div[data-entity-urn]').attr('data-entity-urn');
      const id = entityUrn ? entityUrn.split(':').pop() || Math.random().toString(36).substring(7) : Math.random().toString(36).substring(7);

      if (title && link) {
        jobs.push({
          id,
          title,
          company,
          location: jobLocation,
          link,
          date,
          source: 'linkedin'
        });
      }
    });

    return jobs;
  } catch (error) {
    console.error('Error scraping LinkedIn:', error);
    return [];
  }
}

export async function scrapeIndeed(keywords: string, location: string): Promise<Job[]> {
  try {
    // Indeed is very strict. We will try a best-effort scrape.
    // If it fails, the UI will likely handle the empty result by just showing a link to Indeed.
    const url = `https://ca.indeed.com/jobs?q=${encodeURIComponent(keywords)}&l=${encodeURIComponent(location)}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const $ = cheerio.load(response.data);
    const jobs: Job[] = [];

    // Indeed selectors (these change frequently)
    // Common container: .job_seen_beacon or .result
    $('.job_seen_beacon').each((_, element) => {
      const title = $(element).find('.jobTitle span').text().trim();
      const company = $(element).find('[data-testid="company-name"]').text().trim();
      const jobLocation = $(element).find('[data-testid="text-location"]').text().trim();
      const linkPath = $(element).find('a.jcs-JobTitle').attr('href');
      const link = linkPath ? (linkPath.startsWith('http') ? linkPath : `https://ca.indeed.com${linkPath}`) : '';
      const date = $(element).find('.date').text().trim(); // Sometimes just "Posted X days ago"

      // ID often in data-jk
      const id = $(element).closest('.cardOutline').find('a').attr('data-jk') || Math.random().toString(36).substring(7);

      if (title && link) {
        jobs.push({
          id,
          title,
          company,
          location: jobLocation,
          link,
          date,
          source: 'indeed'
        });
      }
    });

    return jobs;
  } catch (error) {
    console.error('Error scraping Indeed (likely blocked):', error);
    // Return empty array, frontend can handle "no results" or "blocked" logic if we want to get fancy later
    return [];
  }
}
