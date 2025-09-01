import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { attendanceAPI } from '../services/api';
import Header from './Header';
import { Clock, CheckCircle, XCircle, Calendar, Timer, Plus, X } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState({
    todayRecords: [],
    hasActiveCheckIn: false,
    activeRecord: null,
    totalCheckIns: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customData, setCustomData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    checkInTime: format(new Date(), 'HH:mm'),
    checkOutTime: ''
  });

  useEffect(() => {
    fetchTodayStatus();
    
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await attendanceAPI.getTodayStatus(user.id);
      if (response.success) {
        setTodayStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching today status:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await attendanceAPI.checkIn(user.id);
      if (response.success) {
        setMessage('Successfully checked in!');
        await fetchTodayStatus();
      } else {
        setMessage(response.message);
      }
    } catch (error) {
      setMessage('Error checking in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (recordId = null) => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await attendanceAPI.checkOut(user.id, recordId);
      if (response.success) {
        setMessage('Successfully checked out!');
        await fetchTodayStatus();
      } else {
        setMessage(response.message);
      }
    } catch (error) {
      setMessage('Error checking out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAttendance = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await attendanceAPI.addCustomAttendance(
        user.id,
        customData.date,
        customData.checkInTime,
        customData.checkOutTime || null
      );
      if (response.success) {
        setMessage('Custom attendance added successfully!');
        await fetchTodayStatus();
        setShowCustomModal(false);
        setCustomData({
          date: format(new Date(), 'yyyy-MM-dd'),
          checkInTime: format(new Date(), 'HH:mm'),
          checkOutTime: ''
        });
      } else {
        setMessage(response.message);
      }
    } catch (error) {
      setMessage('Error adding custom attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return format(new Date(`2000-01-01T${timeString}`), 'hh:mm a');
  };

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '--:--';
    
    const checkInTime = new Date(`2000-01-01T${checkIn}`);
    const checkOutTime = new Date(`2000-01-01T${checkOut}`);
    const diff = checkOutTime - checkInTime;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getTotalWorkingHours = () => {
    const totalMinutes = todayStatus.todayRecords.reduce((total, record) => {
      if (record.checkIn && record.checkOut) {
        const checkIn = new Date(`2000-01-01T${record.checkIn}`);
        const checkOut = new Date(`2000-01-01T${record.checkOut}`);
        return total + (checkOut - checkIn) / (1000 * 60);
      }
      return total;
    }, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    
    return totalMinutes > 0 ? `${hours}h ${minutes}m` : '--:--';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Employee Dashboard" />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="card mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-gray-600 mt-1">
                  {format(currentTime, 'EEEE, MMMM do, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold text-primary-600">
                  {format(currentTime, 'HH:mm:ss')}
                </div>
                <p className="text-sm text-gray-500">Current Time</p>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('Error') || message.includes('Already') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Check In/Out Actions */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 mr-2 text-primary-600" />
                  Attendance Actions
                </div>
                <span className="text-sm text-gray-500">
                  Today: {todayStatus.totalCheckIns} check-ins
                </span>
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={handleCheckIn}
                  disabled={loading || todayStatus.hasActiveCheckIn}
                  className={`w-full py-4 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                    todayStatus.hasActiveCheckIn
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } disabled:opacity-50`}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>{todayStatus.hasActiveCheckIn ? 'Already Checked In' : 'Check In'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCheckOut()}
                  disabled={loading || !todayStatus.hasActiveCheckIn}
                  className={`w-full py-4 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                    !todayStatus.hasActiveCheckIn
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5" />
                      <span>
                        {!todayStatus.hasActiveCheckIn ? 'No Active Check-in' : 'Check Out'}
                      </span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowCustomModal(true)}
                  className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Plus className="h-5 w-5" />
                  <span>Custom Attendance</span>
                </button>
              </div>
            </div>

            {/* Today's Status */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-primary-600" />
                Today's Records
              </h2>
              
              <div className="space-y-4">
                {todayStatus.todayRecords.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No attendance records for today</p>
                ) : (
                  <>
                    <div className="max-h-64 overflow-y-auto space-y-3">
                      {todayStatus.todayRecords.map((record, index) => (
                        <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">Record #{index + 1}</span>
                            {record.isCustom && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Custom</span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Check In:</span>
                              <div className="font-mono">{formatTime(record.checkIn)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Check Out:</span>
                              <div className="font-mono">{formatTime(record.checkOut)}</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="text-gray-500">Duration:</span>
                            <span className="font-mono ml-2">{calculateWorkingHours(record.checkIn, record.checkOut)}</span>
                          </div>
                          {!record.checkOut && record.id === todayStatus.activeRecord?.id && (
                            <button
                              onClick={() => handleCheckOut(record.id)}
                              disabled={loading}
                              className="mt-2 w-full py-2 px-3 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
                            >
                              {loading ? 'Checking out...' : 'Check Out This Record'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Timer className="h-5 w-5 text-primary-600" />
                        <span className="font-medium">Total Working Hours</span>
                      </div>
                      <span className="font-mono text-lg text-primary-600">
                        {getTotalWorkingHours()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Employee Info */}
          <div className="card mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Employee Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{user?.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium capitalize">{user?.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Join Date</p>
                <p className="font-medium">{user?.joinDate && format(new Date(user.joinDate), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Attendance Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Custom Attendance</h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCustomAttendance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={customData.date}
                  onChange={(e) => setCustomData({ ...customData, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check In Time
                </label>
                <input
                  type="time"
                  required
                  className="input-field"
                  value={customData.checkInTime}
                  onChange={(e) => setCustomData({ ...customData, checkInTime: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check Out Time (Optional)
                </label>
                <input
                  type="time"
                  className="input-field"
                  value={customData.checkOutTime}
                  onChange={(e) => setCustomData({ ...customData, checkOutTime: e.target.value })}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Add Attendance'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
