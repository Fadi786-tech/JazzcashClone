import cron from 'node-cron';
import Autopayment, { AutopaymentType, ScheduleType } from '../models/Autopayment';
import User from '../models/User';
import Bill, { BillStatus } from '../models/Bill';
import Transaction, { ReceiverType, TransactionStatus } from '../models/Transaction';
import Load, { LoadType, LoadStatus, Operator } from '../models/Load';

export const runAutopayment = async (): Promise<void> => {
  try {
    const now = new Date();
    
    // Find all active autopayments that need to run
    const autopayments = await Autopayment.find({
      isActive: true,
      nextRun: { $lte: now },
    }).populate('userId').populate('billId').populate('receiverId');

    for (const autopayment of autopayments) {
      try {
        // Handle populated userId (could be object or string)
        let userId: string;
        if (typeof autopayment.userId === 'object' && autopayment.userId !== null) {
          userId = (autopayment.userId as any)._id?.toString() || (autopayment.userId as any).toString();
        } else {
          userId = String(autopayment.userId);
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
          console.log(`User not found for autopayment ${autopayment._id}`);
          continue;
        }

        // Check balance
        if (user.balance < autopayment.amount) {
          console.log(`Insufficient balance for autopayment ${autopayment._id}`);
          continue;
        }

        // Process based on type
        if (autopayment.type === AutopaymentType.Bill && autopayment.billId) {
          const bill = await Bill.findById(autopayment.billId);
          
          if (bill && bill.status === BillStatus.Pending) {
            // Pay the bill
            user.balance -= autopayment.amount;
            await user.save();

            bill.status = BillStatus.Paid;
            bill.paidAt = new Date();
            await bill.save();

            console.log(`Bill ${bill._id} paid via autopayment ${autopayment._id}`);
          }
        } else if (autopayment.type === AutopaymentType.Transfer && autopayment.receiverId) {
          const receiver = await User.findById(autopayment.receiverId);
          
          if (receiver) {
            // Create transaction
            await Transaction.create({
              senderId: user._id,
              receiverId: receiver._id,
              receiverType: (autopayment.receiverType as ReceiverType) || ReceiverType.JazzCash,
              amount: autopayment.amount,
              status: TransactionStatus.Completed,
            });

            // Update balances
            user.balance -= autopayment.amount;
            await user.save();

            receiver.balance += autopayment.amount;
            await receiver.save();

            console.log(`Transfer completed via autopayment ${autopayment._id}`);
          }
        } else if (
          (autopayment.type === AutopaymentType.Prepaid || 
           autopayment.type === AutopaymentType.Postpaid || 
           autopayment.type === AutopaymentType.Package) &&
          autopayment.mobileNumber &&
          autopayment.operator
        ) {
          // Process load autopayment
          const loadType = autopayment.type === AutopaymentType.Prepaid 
            ? LoadType.Prepaid 
            : autopayment.type === AutopaymentType.Postpaid 
            ? LoadType.Postpaid 
            : LoadType.Package;

          // Create load record
          const load = await Load.create({
            userId: user._id,
            type: loadType,
            mobileNumber: autopayment.mobileNumber,
            operator: autopayment.operator as Operator,
            amount: autopayment.amount,
            packageName: autopayment.type === AutopaymentType.Package ? autopayment.packageName : undefined,
            status: LoadStatus.Successful,
          });

          // Deduct amount from user balance
          user.balance -= autopayment.amount;
          await user.save();

          console.log(`Load ${loadType} processed via autopayment ${autopayment._id} for ${autopayment.mobileNumber}`);
        }

        // Calculate next run date
        let nextRun = new Date();
        if (autopayment.schedule === ScheduleType.Daily) {
          nextRun.setDate(nextRun.getDate() + 1);
        } else if (autopayment.schedule === ScheduleType.Weekly) {
          nextRun.setDate(nextRun.getDate() + 7);
        } else if (autopayment.schedule === ScheduleType.Monthly) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }

        // Update autopayment
        autopayment.nextRun = nextRun;
        await autopayment.save();
      } catch (error: any) {
        console.error(`Error processing autopayment ${autopayment._id}:`, error.message);
      }
    }
  } catch (error: any) {
    console.error('Error in autopayment cron job:', error.message);
  }
};

// Run every minute for demo purposes
export const startAutopaymentCron = (): void => {
  cron.schedule('* * * * *', () => {
    console.log('Running autopayment cron job...');
    runAutopayment();
  });
  console.log('Autopayment cron job started (runs every minute)');
};
