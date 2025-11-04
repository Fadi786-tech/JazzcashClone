import Bank, { PAKISTANI_BANKS } from '../models/Bank';

export const initializeBanks = async (): Promise<void> => {
  try {
    const existingBanks = await Bank.countDocuments();
    
    if (existingBanks === 0) {
      console.log('Initializing Pakistani banks...');
      await Bank.insertMany(PAKISTANI_BANKS);
      console.log(`Successfully initialized ${PAKISTANI_BANKS.length} banks`);
    }
  } catch (error: any) {
    console.error('Error initializing banks:', error.message);
  }
};
