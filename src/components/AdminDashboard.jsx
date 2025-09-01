import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { attendanceAPI } from '../services/api';
import Header from './Header';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Timer, 
  Users, 
  BarChart3, 
  Settings,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState({
    todayRecords: [],
    hasActiveCheckIn: false,
    activeRecord: null,
    totalCheckIns: 0
  });
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchTodayStatus();
    fetchTodayAttendance();
    
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

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await attendanceAPI.getAllAttendance(today);
      if (response.success) {
        setTodayAttendance(response.data);
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
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
        await fetchTodayAttendance();
      } else {
        setMessage(response.message);
      }
    } catch (error) {
      setMessage('Error checking in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await attendanceAPI.checkOut(user.id);
      if (response.success) {
        setMessage('Successfully checked out!');
        await fetchTodayStatus();
        await fetchTodayAttendance();
      } else {
        setMessage(response.message);
      }
    } catch (error) {
      setMessage('Error checking out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return format(new Date(`2000-01-01T${timeString}`), 'hh:mm a');
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

  const getAttendanceStats = () => {
    const total = todayAttendance.length;
    const present = todayAttendance.filter(record => record.checkIn).length;
    const checkedOut = todayAttendance.filter(record => record.checkOut).length;
    
    return { total, present, checkedOut };
  };

  const stats = getAttendanceStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Admin Dashboard" />
      
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
                  {format(currentTime, 'EEEE, MMMM do, yyyy')} - Admin Dashboard
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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Present Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Checked Out</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.checkedOut}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Attendance Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Check In/Out */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Clock className="h-6 w-6 mr-2 text-primary-600" />
                My Attendance
              </h2>
              
              <div className="space-y-4 mb-6">
                <button
                  onClick={handleCheckIn}
                  disabled={loading || todayStatus.hasActiveCheckIn}
                  className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                    todayStatus.hasActiveCheckIn
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } disabled:opacity-50`}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>{todayStatus.hasActiveCheckIn ? 'Already Checked In' : 'Check In'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCheckOut}
                  disabled={loading || !todayStatus.hasActiveCheckIn}
                  className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                    !todayStatus.hasActiveCheckIn
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      <span>
                        {!todayStatus.hasActiveCheckIn ? 'No Active Check-in' : 'Check Out'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Today's Check-ins</span>
                  <span className="font-mono">{todayStatus.totalCheckIns}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Active Check-in</span>
                  <span className="font-mono">{todayStatus.hasActiveCheckIn ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                  <span className="text-sm font-medium">Total Working Hours</span>
                  <span className="font-mono text-primary-600">{getTotalWorkingHours()}</span>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Settings className="h-6 w-6 mr-2 text-primary-600" />
                Admin Actions
              </h2>
              
              <div className="space-y-4">
                <Link
                  to="/employees"
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Users className="h-5 w-5" />
                  <span>Manage Employees</span>
                </Link>

                <Link
                  to="/attendance-summary"
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Attendance Summary</span>
                </Link>
              </div>
            </div>

            {/* Today's Attendance Overview */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-primary-600" />
                Today's Overview
              </h2>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {todayAttendance.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No attendance records for today</p>
                ) : (
                  todayAttendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{record.employee?.name}</p>
                        <p className="text-xs text-gray-500">{record.employee?.department}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          {record.checkIn && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {record.checkOut && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {record.checkIn ? formatTime(record.checkIn) : 'Not checked in'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
