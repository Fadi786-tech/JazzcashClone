import { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../../src/config/db';
import { runAutopayment } from '../../src/cron/autopaymentCron';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify the request is from Vercel Cron or authorized source
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Connect to database
    await connectDB();
    
    // Process autopayments
    await runAutopayment();
    
    res.status(200).json({ 
      success: true, 
      message: 'Autopayments processed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process autopayments' 
    });
  }
}