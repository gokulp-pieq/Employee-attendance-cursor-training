import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { attendanceAPI } from '../services/api';
import Header from './Header';
import { Clock, CheckCircle, XCircle, Calendar, Timer, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { employeeAPI } from '../services/api';

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
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchTodayStatus();
    fetchRolesAndDepartments();
    
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchRolesAndDepartments = async () => {
    try {
      const [rolesResponse, departmentsResponse] = await Promise.all([
        employeeAPI.getAllRoles(),
        employeeAPI.getAllDepartments()
      ]);
      
      if (rolesResponse.success) {
        setRoles(rolesResponse.data);
      }
      if (departmentsResponse.success) {
        setDepartments(departmentsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching roles and departments:', error);
    }
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : `Role ${roleId}`;
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : `Department ${deptId}`;
  };

  const fetchTodayStatus = async () => {
    try {
      const empId = getEmployeeId();
      if (!empId) {
        console.error('Employee ID not found');
        return;
      }
      console.log('Fetching today status for emp_id:', empId);
      const response = await attendanceAPI.getTodayStatus(empId);
      console.log('Today status response:', response);
      if (response.success) {
        console.log('Setting today status data:', response.data);
        console.log('Today records:', response.data.todayRecords);
        if (response.data.todayRecords && response.data.todayRecords.length > 0) {
          console.log('First record structure:', response.data.todayRecords[0]);
          console.log('First record keys:', Object.keys(response.data.todayRecords[0]));
        }
        setTodayStatus(response.data);
        
        // Also fetch working hours for today
        await updateWorkingHours(empId);
      }
    } catch (error) {
      console.error('Error fetching today status:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const empId = getEmployeeId();
      if (!empId) {
        setMessage('Error: Employee ID not found. Please log in again.');
        return;
      }
      
      const response = await attendanceAPI.checkIn(empId);
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
      const empId = getEmployeeId();
      if (!empId) {
        setMessage('Error: Employee ID not found. Please log in again.');
        return;
      }
      
      const response = await attendanceAPI.checkOut(empId);
      if (response.success) {
        setMessage('Successfully checked out!');
        await fetchTodayStatus();
        // Update working hours after successful check-out
        await updateWorkingHours(empId);
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
      const empId = getEmployeeId();
      if (!empId) {
        setMessage('Error: Employee ID not found. Please log in again.');
        return;
      }
      
      const response = await attendanceAPI.addCustomAttendance(
        empId,
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

  const updateWorkingHours = async (empId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      // Use the existing attendance endpoint to get today's records
      const response = await fetch(`http://localhost:8085/api/attendance/employee/${empId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Attendance response for working hours:', data);
        
        // Filter today's records and calculate total working hours
        const todayRecords = data.filter(record => {
          if (!record.checkin_datetime) return false;
          const recordDate = record.checkin_datetime.split('T')[0];
          return recordDate === today;
        });
        
        console.log('Today\'s records for working hours:', todayRecords);
        
        // Calculate total working seconds from completed sessions
        const totalWorkingSeconds = todayRecords.reduce((total, record) => {
          if (record.checkin_datetime && record.checkout_datetime) {
            const checkIn = new Date(record.checkin_datetime);
            const checkOut = new Date(record.checkout_datetime);
            const diffMs = checkOut - checkIn;
            if (diffMs > 0) {
              return total + Math.floor(diffMs / 1000);
            }
          }
          return total;
        }, 0);
        
        console.log('Total working seconds:', totalWorkingSeconds);
        
        // Convert to hours and minutes
        const totalHours = Math.floor(totalWorkingSeconds / 3600);
        const totalMinutes = Math.floor((totalWorkingSeconds % 3600) / 60);
        const formattedDuration = totalWorkingSeconds > 0 ? `${totalHours}h ${totalMinutes}m` : '--:--';
        
        console.log('Formatted duration:', formattedDuration);
        
        // Update the todayStatus with working hours
        setTodayStatus(prev => {
          const updated = {
            ...prev,
            totalWorkingHours: formattedDuration
          };
          console.log('Updated todayStatus:', updated);
          return updated;
        });
      } else {
        console.error('Failed to fetch attendance for working hours:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error('Attendance error details:', errorData);
      }
    } catch (error) {
      console.error('Error updating working hours:', error);
    }
  };

  const getTotalWorkingHours = () => {
    console.log('getTotalWorkingHours called, todayStatus:', todayStatus);
    console.log('totalWorkingHours from API:', todayStatus.totalWorkingHours);
    
    // Use the working hours from API if available, otherwise fall back to calculated
    if (todayStatus.totalWorkingHours && todayStatus.totalWorkingHours !== '--:--') {
      console.log('Returning API working hours:', todayStatus.totalWorkingHours);
      return todayStatus.totalWorkingHours;
    }
    
    console.log('Falling back to calculated hours');
    // Fallback calculation from records
    const totalMinutes = todayStatus.todayRecords.reduce((total, record) => {
      if (record.checkIn && record.checkOut) {
        const checkIn = new Date(`2000-01-01T${record.checkIn}`);
        const checkOut = new Date(`2000-01-01T${record.checkOut}`);
        const recordMinutes = (checkOut - checkIn) / (1000 * 60);
        console.log('Record minutes:', recordMinutes, 'for record:', record);
        return total + recordMinutes;
      }
      return total;
    }, 0);
    
    console.log('Total calculated minutes:', totalMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const result = totalMinutes > 0 ? `${hours}h ${minutes}m` : '--:--';
    console.log('Returning calculated result:', result);
    
    return result;
  };

  const getEmployeeId = () => {
    // Try different possible field names for employee ID
    const empId = user?.empId || user?.emp_id || user?.id || user?.employee_id || user?.uuid;
    console.log('getEmployeeId() called:');
    console.log('  user object:', user);
    console.log('  user.empId:', user?.empId);
    console.log('  user.emp_id:', user?.emp_id);
    console.log('  user.id:', user?.id);
    console.log('  user.employee_id:', user?.employee_id);
    console.log('  user.uuid:', user?.uuid);
    console.log('  returning:', empId);
    return empId;
  };

  const canCheckIn = () => {
    // User can check in if:
    // 1. No attendance records today, OR
    // 2. Last session is completed (has checkout time)
    if (todayStatus.todayRecords.length === 0) {
      console.log('canCheckIn: No records today, can check in');
      return true;
    }
    
    const lastRecord = todayStatus.todayRecords[todayStatus.todayRecords.length - 1];
    console.log('canCheckIn: Last record:', lastRecord);
    console.log('canCheckIn: Last record checkout field:', lastRecord?.checkOut);
    console.log('canCheckIn: Last record checkout_datetime field:', lastRecord?.checkout_datetime);
    
    // Check both possible field names for checkout time
    const hasCheckoutTime = lastRecord?.checkOut || lastRecord?.checkout_datetime;
    const canCheckIn = lastRecord && hasCheckoutTime;
    
    console.log('canCheckIn: Has checkout time:', hasCheckoutTime);
    console.log('canCheckIn: Can check in:', canCheckIn);
    
    return canCheckIn;
  };

  const canCheckOut = () => {
    // User can check out if:
    // 1. Has attendance records today, AND
    // 2. Last record doesn't have a checkout time (active session)
    if (todayStatus.todayRecords.length === 0) {
      console.log('canCheckOut: No records today');
      return false;
    }
    
    const lastRecord = todayStatus.todayRecords[todayStatus.todayRecords.length - 1];
    console.log('canCheckOut: Last record:', lastRecord);
    console.log('canCheckOut: Last record checkout field:', lastRecord?.checkOut);
    console.log('canCheckOut: Last record checkout_datetime field:', lastRecord?.checkout_datetime);
    
    // Check both possible field names for checkout time
    const hasCheckoutTime = lastRecord?.checkOut || lastRecord?.checkout_datetime;
    const canCheckOut = lastRecord && !hasCheckoutTime;
    
    console.log('canCheckOut: Has checkout time:', hasCheckoutTime);
    console.log('canCheckOut: Can check out:', canCheckOut);
    
    return canCheckOut;
  };

  // Get the current active session for display purposes
  const getCurrentActiveSession = () => {
    if (todayStatus.todayRecords.length === 0) {
      return null;
    }
    
    const lastRecord = todayStatus.todayRecords[todayStatus.todayRecords.length - 1];
    return lastRecord && !lastRecord.checkOut ? lastRecord : null;
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
                  Welcome back, {user?.firstName} {user?.lastName}!
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


                {/* Check-in Button - Always enabled */}
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Check In</span>
                    </>
                  )}
                </button>

                {/* Check-out Button - Always enabled */}
                <button
                  onClick={() => handleCheckOut()}
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5" />
                      <span>Check Out</span>
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
                <p className="font-medium">{user?.deptName || user?.dept_name || getDepartmentName(user?.dept_id) || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium capitalize">{user?.roleName || user?.role_name || getRoleName(user?.role_id) || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="font-medium font-mono text-sm">{user?.empId || user?.emp_id || 'N/A'}</p>
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
