import { NextResponse } from 'next/server';
import { scrapeLinkedIn, scrapeIndeed } from '@/lib/scrapers';

export async function POST(request: Request) {
  try {
    const { keywords, location, sources } = await request.json();

    if (!keywords || !location) {
      return NextResponse.json({ error: 'Keywords and location are required' }, { status: 400 });
    }

    const selectedSources = sources || ['linkedin', 'indeed'];
    const promises = [];

    if (selectedSources.includes('linkedin')) {
      promises.push(scrapeLinkedIn(keywords, location));
    }

    if (selectedSources.includes('indeed')) {
      promises.push(scrapeIndeed(keywords, location));
    }

    const results = await Promise.all(promises);
    const flatResults = results.flat();

    // Sort heavily randomized results? Or just shuffle?
    // Usually sticking to source order or interleave is good.
    // For now, let's just return them.

    return NextResponse.json({ jobs: flatResults });
  } catch (error) {
    console.error('Error in jobs API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
