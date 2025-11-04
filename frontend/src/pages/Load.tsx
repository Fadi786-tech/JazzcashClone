import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { loadService } from '../services/loadService';

type LoadType = 'prepaid' | 'postpaid' | 'package';

const Load: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [loadType, setLoadType] = useState<LoadType>('prepaid');
  const [formData, setFormData] = useState({
    mobileNumber: '',
    operator: 'Jazz' as 'Jazz' | 'Zong' | 'Telenor' | 'Ufone',
    amount: '',
    packageName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
        mobileNumber: formData.mobileNumber,
        operator: formData.operator,
        amount: parseFloat(formData.amount),
        ...(loadType === 'package' ? { packageName: formData.packageName } : {}),
      };

      let response;
      switch (loadType) {
        case 'prepaid':
          response = await loadService.prepaidLoad(data);
          break;
        case 'postpaid':
          response = await loadService.postpaidLoad(data);
          break;
        case 'package':
          response = await loadService.packageLoad(data);
          break;
      }

      if (response.success) {
        setSuccess(response.message || 'Load successful!');
        setFormData({
          mobileNumber: '',
          operator: 'Jazz',
          amount: '',
          packageName: '',
        });
        await refreshUser();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          err.message ||
          'Load failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Mobile Load</h1>

        {/* Load Type Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Load Type</h2>
          <div className="grid grid-cols-3 gap-4">
            {(['prepaid', 'postpaid', 'package'] as LoadType[]).map((type) => (
              <button
                key={type}
                onClick={() => setLoadType(type)}
                className={`px-4 py-3 rounded-lg font-medium transition capitalize ${
                  loadType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Load Form */}
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
              <label className="block text-gray-700 font-medium mb-2">Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter mobile number"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Operator</label>
              <select
                name="operator"
                value={formData.operator}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Jazz">Jazz</option>
                <option value="Zong">Zong</option>
                <option value="Telenor">Telenor</option>
                <option value="Ufone">Ufone</option>
              </select>
            </div>

            {loadType === 'package' && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">Package Name</label>
                <input
                  type="text"
                  name="packageName"
                  value={formData.packageName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter package name"
                />
              </div>
            )}

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
              {loading ? 'Processing...' : `Purchase ${loadType} Load`}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Load;

