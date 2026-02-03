import { NextResponse } from 'next/server';
import { scrapeLinkedIn, scrapeIndeed } from '@/lib/scrapers';
import { scoreJobsWithGemini } from '@/lib/job-matcher';
import { auth } from '@/auth';
import Resume from '@/lib/db/models/Resume';
import clientPromise from '@/lib/db/mongodb';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const { keywords, location, sources } = await request.json();

    if (!keywords || !location) {
      return NextResponse.json({ error: 'Keywords and location are required' }, { status: 400 });
    }

    const selectedSources = sources || ['linkedin', 'indeed'];
    const scrapePromises = [];

    if (selectedSources.includes('linkedin')) {
      scrapePromises.push(scrapeLinkedIn(keywords, location));
    }

    if (selectedSources.includes('indeed')) {
      scrapePromises.push(scrapeIndeed(keywords, location));
    }

    const results = await Promise.all(scrapePromises);
    let flatResults = results.flat();

    // Contextual scoring logic
    const session = await auth();

    if (session?.user?.email) {
       try {
        // Ensure DB connection
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || "");
        }
        
        let userId = session.user.id;
        
        // Fallback: Resolve User ID from email if session lacks it
        if (!userId) {
             const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({}));
             const user = await User.findOne({ email: session.user.email });
             if (user) {
                 userId = user._id;
             }
        }
        
        if (userId) {
            const resume = await Resume.findOne({ 
                userId: userId, 
                isStarred: true 
            }).sort({ updatedAt: -1 });
    
            if (resume && resume.latestContent && flatResults.length > 0) {
                flatResults = await scoreJobsWithGemini(resume.latestContent, flatResults);
                
                // Sort by score if available
                flatResults.sort((a, b) => (b.score || 0) - (a.score || 0));
            }
        }
       } catch (dbError) {
         console.warn("Failed to fetch resume or score jobs:", dbError);
         // Continue without scoring if DB/Gemini fails
       }
    }

    return NextResponse.json({ jobs: flatResults });
  } catch (error) {
    console.error('Error in jobs API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
