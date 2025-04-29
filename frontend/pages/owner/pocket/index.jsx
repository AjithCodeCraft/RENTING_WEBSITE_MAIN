import React, { useState, useEffect } from 'react';
import OwnerHeader from '../OwnerHeader';
import { Calendar, IndianRupee, List, ChevronDown, Wallet } from 'lucide-react';
import Cookies from 'js-cookie';
import axios from 'axios';

const Pocket = () => {
  const [balance, setBalance] = useState(0);
  const [showStatement, setShowStatement] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [nextMondayDate, setNextMondayDate] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    // Fetch user profile to get UPI ID
    const fetchUserProfile = async () => {
      try {
        const token = Cookies.get('access_token_owner');
        const response = await axios.get('http://127.0.0.1:8000/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUpiId(response.data.upi_id || '');
        setLoadingProfile(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoadingProfile(false);
      }
    };

    // Fetch the total completed payments from the API and store in cookies if not already set
    const fetchAndSetBalance = async () => {
      const storedBalance = Cookies.get('balance');
      if (storedBalance === 'undefined' || !storedBalance) {
        try {
          const token = Cookies.get('access_token_owner');
          const owner_id = Cookies.get("owner_id_number");
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/owner/${owner_id}/payments/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          const totalAmount = data.total_amount;
          setBalance(totalAmount);
          Cookies.set('balance', totalAmount, { expires: 7 });
        } catch (error) {
          console.error('Failed to fetch balance:', error);
          setBalance(0);
        }
      } else {
        setBalance(parseFloat(storedBalance));
      }
    };

    fetchUserProfile();
    fetchAndSetBalance();

    // Calculate next Monday for automatic withdrawal
    const calculateNextMonday = () => {
      const today = new Date();
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      return nextMonday.toISOString().split('T')[0];
    };

    setNextMondayDate(calculateNextMonday());

    // Load withdrawals from localStorage and set timeouts for pending withdrawals
    const loadWithdrawals = () => {
      try {
        const storedWithdrawals = localStorage.getItem('owner_withdrawals');
        if (storedWithdrawals) {
          const parsedWithdrawals = JSON.parse(storedWithdrawals);
          // Filter out any invalid entries and ensure proper formatting
          const validWithdrawals = parsedWithdrawals.filter(w =>
            w.id && w.date && w.amount && w.commission && w.type && w.status
          );

          // Process each withdrawal to check if it needs status update
          const processedWithdrawals = validWithdrawals.map(withdrawal => {
            // If withdrawal is still processing, set a timeout to mark it as completed
            if (withdrawal.status === 'Processing') {
              const createdAt = new Date(withdrawal.date).getTime();
              const now = new Date().getTime();
              const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

              // If more than 5 minutes have passed, mark as completed
              if (now - createdAt > fiveMinutes) {
                return { ...withdrawal, status: 'Completed' };
              } else {
                // Set timeout for the remaining time
                const timeLeft = fiveMinutes - (now - createdAt);
                setTimeout(() => {
                  updateWithdrawalStatus(withdrawal.id, 'Completed');
                }, timeLeft);
              }
            }
            return withdrawal;
          });

          setWithdrawals(processedWithdrawals);
          saveWithdrawalsToStorage(processedWithdrawals);
        }
      } catch (error) {
        console.error('Error loading withdrawals from localStorage:', error);
        localStorage.removeItem('owner_withdrawals');
      }
    };

    loadWithdrawals();
  }, []);

  const saveWithdrawalsToStorage = (withdrawalsData) => {
    try {
      localStorage.setItem('owner_withdrawals', JSON.stringify(withdrawalsData));
    } catch (error) {
      console.error('Error saving withdrawals to localStorage:', error);
    }
  };

  const updateWithdrawalStatus = (id, newStatus) => {
    setWithdrawals(prevWithdrawals => {
      const updatedWithdrawals = prevWithdrawals.map(withdrawal => {
        if (withdrawal.id === id) {
          return { ...withdrawal, status: newStatus };
        }
        return withdrawal;
      });
      saveWithdrawalsToStorage(updatedWithdrawals);
      return updatedWithdrawals;
    });
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    const commission = amount * 0.12;
    const totalDeduction = amount; // Commission is already included in the amount

    if (!withdrawAmount || amount <= 0 || totalDeduction > balance) {
      return;
    }

    const withdrawalDate = new Date();
    const newWithdrawal = {
      id: Date.now(), // Using timestamp for unique ID
      date: withdrawalDate.toISOString().split('T')[0],
      amount: amount - commission, // Amount after deducting commission
      commission: commission,
      type: 'Manual',
      status: 'Processing'
    };

    const updatedWithdrawals = [newWithdrawal, ...withdrawals];
    setWithdrawals(updatedWithdrawals);
    saveWithdrawalsToStorage(updatedWithdrawals);

    const newBalance = balance - totalDeduction;
    setBalance(newBalance);
    Cookies.set('balance', newBalance, { expires: 7 });
    setWithdrawAmount('');

    // Set timeout to update status after 5 minutes
    setTimeout(() => {
      updateWithdrawalStatus(newWithdrawal.id, 'Completed');
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
  };

  const commission = parseFloat(withdrawAmount) * 0.12;
  const withdrawableAmount = parseFloat(withdrawAmount) - commission;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <OwnerHeader />
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg p-6">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">My Pocket</h1>

          {/* Balance Card */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 mb-1">Available Balance</p>
                <h2 className="text-3xl font-bold" style={{ color: '#17A345' }}>
                  ₹{typeof balance === 'number' ? balance.toFixed(2) : '0.00'}
                </h2>
              </div>
              <div className="bg-green-50 rounded-full p-3" style={{ backgroundColor: 'rgba(23, 163, 69, 0.1)' }}>
                <IndianRupee className="w-8 h-8" style={{ color: '#17A345' }} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-gray-500 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <p>Next automatic withdrawal: <span className="font-medium">{nextMondayDate}</span></p>
            </div>
          </div>

          {/* Manual Withdrawal Section */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium mb-4 text-gray-700">Withdraw Funds</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="pl-10 block w-full rounded-md border border-gray-200 shadow-sm p-2 focus:ring-0 focus:border-gray-300"
                  />
                </div>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance}
                className="py-2 px-4 rounded-md font-medium text-white flex items-center justify-center"
                style={{ backgroundColor: parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) <= balance ? '#17A345' : '#9CA3AF' }}
              >
                Withdraw Now
              </button>
            </div>

            {/* UPI ID Information */}
            {withdrawAmount && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <Wallet className="w-5 h-5 mt-0.5 mr-2 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-700">
                      Amount will be credited to your UPI ID:
                    </p>
                    <p className="font-medium text-blue-600">
                      {upiId || 'No UPI ID registered. Please update your profile.'}
                    </p>
                    {!upiId && (
                      <p className="text-xs text-red-500 mt-1">
                        You need to set a UPI ID to receive payments
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {parseFloat(withdrawAmount) > balance && (
              <p className="text-red-500 mt-2 text-sm">Insufficient balance for this withdrawal.</p>
            )}
            {withdrawAmount && (
              <div>
                <p className="mt-2 text-sm text-red-500">
                  Commission: -₹{commission.toFixed(2)}
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  Withdrawable Amount: ₹{withdrawableAmount.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Pocket Statement Button */}
          <button
            onClick={() => setShowStatement(!showStatement)}
            className="flex items-center justify-between w-full bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-md mr-3" style={{ backgroundColor: 'rgba(23, 163, 69, 0.1)' }}>
                <List className="h-5 w-5" style={{ color: '#17A345' }} />
              </div>
              <span className="font-medium text-gray-700">Pocket Statement</span>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${showStatement ? 'rotate-180' : ''}`} />
          </button>

          {/* Pocket Statement Table */}
          {showStatement && (
            <div className="mt-4 border border-gray-100 rounded-lg overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawals.length > 0 ? (
                    withdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{withdrawal.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#17A345' }}>₹{withdrawal.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#FF0000' }}>-₹{withdrawal.commission.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{withdrawal.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            withdrawal.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            withdrawal.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {withdrawal.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No withdrawals yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Pocket;
