import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { billService } from '../services/billService';
import { Bill } from '../types';

const Bills: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [formData, setFormData] = useState({
    category: 'Electricity' as Bill['category'],
    companyName: '',
    consumerNumber: '',
    amount: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBills, setLoadingBills] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      if (user) {
        try {
          const response = await billService.getUserBills(user._id);
          if (response.success) {
            setBills(response.data);
          }
        } catch (error) {
          console.error('Error fetching bills:', error);
        } finally {
          setLoadingBills(false);
        }
      }
    };

    fetchBills();
  }, [user]);

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
      const response = await billService.payBill({
        ...formData,
        amount: parseFloat(formData.amount),
      });

      if (response.success) {
        setSuccess(response.message || 'Bill paid successfully!');
        setFormData({
          category: 'Electricity',
          companyName: '',
          consumerNumber: '',
          amount: '',
        });
        await refreshUser();

        // Refresh bills list
        if (user) {
          const billsResponse = await billService.getUserBills(user._id);
          if (billsResponse.success) {
            setBills(billsResponse.data);
          }
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          err.message ||
          'Bill payment failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Pay Bills</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pay Bill Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Pay New Bill</h2>

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
                <label className="block text-gray-700 font-medium mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Electricity">Electricity</option>
                  <option value="Gas">Gas</option>
                  <option value="Water">Water</option>
                  <option value="Internet">Internet</option>
                  <option value="Telephone">Telephone</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Consumer Number</label>
                <input
                  type="text"
                  name="consumerNumber"
                  value={formData.consumerNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter consumer number"
                />
              </div>

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
                {loading ? 'Processing...' : 'Pay Bill'}
              </button>
            </form>
          </div>

          {/* Bills History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Bill History</h2>

            {loadingBills ? (
              <p className="text-gray-500">Loading...</p>
            ) : bills.length === 0 ? (
              <p className="text-gray-500">No bills found</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {bills.map((bill) => (
                  <div
                    key={bill._id}
                    className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{bill.category}</p>
                        <p className="text-sm text-gray-600">{bill.companyName}</p>
                        <p className="text-xs text-gray-500">
                          Consumer: {bill.consumerNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          Rs. {bill.amount.toLocaleString()}
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            bill.status === 'Paid'
                              ? 'text-green-600'
                              : bill.status === 'Failed'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {bill.status}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(bill.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Bills;

