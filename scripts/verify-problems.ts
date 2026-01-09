
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Problem from '../src/lib/db/models/Problem';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function verify() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB');

    const problems = await Problem.find({}).sort({ difficulty: 1, title: 1 });
    console.log(`Found ${problems.length} problems:`);
    problems.forEach(p => {
        console.log(`- [${p.difficulty}] ${p.title} (${p.slug})`);
        const starter = (p.starterCode as any)?.get('javascript');
        if (starter) {
             const hasVar = starter.includes('var ');
             const hasConst = starter.includes('const ');
             const hasLet = starter.includes('let ');
             console.log(`  Starter code check: var=${hasVar}, const=${hasConst}, let=${hasLet}`);
        } else {
            console.log('  No javascript starter code');
        }
    });

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error verifying problems:', error);
    process.exit(1);
  }
}

verify();
