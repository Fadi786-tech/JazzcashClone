import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { autopaymentService } from '../services/autopaymentService';
import { Autopayment } from '../types';

const Autopayments: React.FC = () => {
  const { user } = useAuth();
  const [autopayments, setAutopayments] = useState<Autopayment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'bill' as Autopayment['type'],
    schedule: 'monthly' as Autopayment['schedule'],
    billId: '',
    receiverId: '',
    mobileNumber: '',
    operator: 'Jazz' as 'Jazz' | 'Zong' | 'Telenor' | 'Ufone',
    packageName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchAutopayments = async () => {
      if (user) {
        try {
          const response = await autopaymentService.getUserAutopayments(user._id);
          if (response.success) {
            setAutopayments(response.data);
          }
        } catch (error) {
          console.error('Error fetching autopayments:', error);
        } finally {
          setLoadingData(false);
        }
      }
    };

    fetchAutopayments();
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
      const data: any = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        schedule: formData.schedule,
      };

      if (formData.type === 'bill' && formData.billId) {
        data.billId = formData.billId;
      }
      if (formData.type === 'transfer' && formData.receiverId) {
        data.receiverId = formData.receiverId;
      }
      if (
        (formData.type === 'prepaid' ||
          formData.type === 'postpaid' ||
          formData.type === 'package') &&
        formData.mobileNumber
      ) {
        data.mobileNumber = formData.mobileNumber;
        data.operator = formData.operator;
      }
      if (formData.type === 'package' && formData.packageName) {
        data.packageName = formData.packageName;
      }

      const response = await autopaymentService.createAutopayment(data);

      if (response.success) {
        setSuccess('Autopayment created successfully!');
        setFormData({
          amount: '',
          type: 'bill',
          schedule: 'monthly',
          billId: '',
          receiverId: '',
          mobileNumber: '',
          operator: 'Jazz',
          packageName: '',
        });
        setShowAddForm(false);

        if (user) {
          const autopaymentsResponse =
            await autopaymentService.getUserAutopayments(user._id);
          if (autopaymentsResponse.success) {
            setAutopayments(autopaymentsResponse.data);
          }
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          err.message ||
          'Autopayment creation failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Autopayments</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Create Autopayment
          </button>
        </div>

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

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create Autopayment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="bill">Bill</option>
                  <option value="transfer">Transfer</option>
                  <option value="prepaid">Prepaid Load</option>
                  <option value="postpaid">Postpaid Load</option>
                  <option value="package">Package Load</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Schedule</label>
                <select
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
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

              {formData.type === 'bill' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Bill ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="billId"
                    value={formData.billId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter bill ID"
                  />
                </div>
              )}

              {formData.type === 'transfer' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Receiver ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="receiverId"
                    value={formData.receiverId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter receiver ID"
                  />
                </div>
              )}

              {(formData.type === 'prepaid' ||
                formData.type === 'postpaid' ||
                formData.type === 'package') && (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="Jazz">Jazz</option>
                      <option value="Zong">Zong</option>
                      <option value="Telenor">Telenor</option>
                      <option value="Ufone">Ufone</option>
                    </select>
                  </div>
                </>
              )}

              {formData.type === 'package' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Package Name</label>
                  <input
                    type="text"
                    name="packageName"
                    value={formData.packageName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter package name"
                  />
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Autopayment'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      amount: '',
                      type: 'bill',
                      schedule: 'monthly',
                      billId: '',
                      receiverId: '',
                      mobileNumber: '',
                      operator: 'Jazz',
                      packageName: '',
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Autopayments List */}
        {loadingData ? (
          <p className="text-gray-500">Loading...</p>
        ) : autopayments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">
              No autopayments found. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {autopayments.map((autopayment) => (
              <div
                key={autopayment._id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 capitalize">
                        {autopayment.type} Autopayment
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          autopayment.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {autopayment.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Amount:</span> Rs.{' '}
                      {autopayment.amount.toLocaleString()}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Schedule:</span>{' '}
                      {autopayment.schedule.charAt(0).toUpperCase() +
                        autopayment.schedule.slice(1)}
                    </p>
                    {autopayment.nextExecution && (
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Next Execution:</span>{' '}
                        {new Date(autopayment.nextExecution).toLocaleString()}
                      </p>
                    )}
                    {autopayment.lastExecuted && (
                      <p className="text-gray-600">
                        <span className="font-medium">Last Executed:</span>{' '}
                        {new Date(autopayment.lastExecuted).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Autopayments;

