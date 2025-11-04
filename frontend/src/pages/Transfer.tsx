import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { transferService } from '../services/transferService';

type TransferType = 'jazzcash' | 'bank' | 'cnic' | 'otherwallet';

const Transfer: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [transferType, setTransferType] = useState<TransferType>('jazzcash');
  const [formData, setFormData] = useState({
    amount: '',
    receiverIdentifier: '',
    bankAccountId: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = {
        amount: parseFloat(formData.amount),
        receiverIdentifier: formData.receiverIdentifier,
        ...(transferType === 'bank' && formData.bankAccountId
          ? { bankAccountId: formData.bankAccountId }
          : {}),
      };

      let response;
      switch (transferType) {
        case 'jazzcash':
          response = await transferService.transferToJazzCash(data);
          break;
        case 'bank':
          response = await transferService.transferToBank(data);
          break;
        case 'cnic':
          response = await transferService.transferToCNIC(data);
          break;
        case 'otherwallet':
          response = await transferService.transferToOtherWallet(data);
          break;
      }

      if (response.success) {
        setSuccess(response.message || 'Transfer successful!');
        setFormData({ amount: '', receiverIdentifier: '', bankAccountId: '' });
        await refreshUser();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          err.message ||
          'Transfer failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (transferType) {
      case 'jazzcash':
        return 'Enter JazzCash mobile number';
      case 'bank':
        return 'Enter account number or IBAN';
      case 'cnic':
        return 'Enter CNIC number';
      case 'otherwallet':
        return 'Enter mobile number';
      default:
        return 'Enter identifier';
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Transfer Money</h1>

        {/* Transfer Type Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Transfer Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['jazzcash', 'bank', 'cnic', 'otherwallet'] as TransferType[]).map((type) => (
              <button
                key={type}
                onClick={() => setTransferType(type)}
                className={`px-4 py-3 rounded-lg font-medium transition ${
                  transferType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'jazzcash'
                  ? 'JazzCash'
                  : type === 'bank'
                  ? 'Bank'
                  : type === 'cnic'
                  ? 'CNIC'
                  : 'Other Wallet'}
              </button>
            ))}
          </div>
        </div>

        {/* Transfer Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Amount (Rs.)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {transferType === 'jazzcash'
                  ? 'JazzCash Mobile Number'
                  : transferType === 'bank'
                  ? 'Account Number or IBAN'
                  : transferType === 'cnic'
                  ? 'CNIC Number'
                  : 'Mobile Number'}
              </label>
              <input
                type="text"
                name="receiverIdentifier"
                value={formData.receiverIdentifier}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={getPlaceholder()}
              />
            </div>

            {transferType === 'bank' && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Bank Account ID (Optional)
                </label>
                <input
                  type="text"
                  name="bankAccountId"
                  value={formData.bankAccountId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Bank account ID (optional)"
                />
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Your Balance</p>
              <p className="text-2xl font-bold text-gray-800">
                Rs. {(user?.balance || 0).toLocaleString()}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Transfer Money'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Transfer;

