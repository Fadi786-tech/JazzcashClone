import { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../../src/config/db';
import { runAutopayment } from '../../src/cron/autopaymentCron';

export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await connectDB();

    await runAutopayment();

    return res.status(200).json({
      success: true,
      message: 'Autopayments processed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {

    console.error('Cron job error:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to process autopayments'
    });
  }
}