import React, { useState, useEffect } from 'react';
import { attendanceAPI, employeeAPI } from '../services/api';
import Header from './Header';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  User, 
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const AttendanceSummary = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [attendanceData, searchTerm, selectedEmployee]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [employeesResponse, attendanceResponse] = await Promise.all([
        employeeAPI.getAllEmployees(),
        attendanceAPI.getAllAttendance()
      ]);

      if (employeesResponse.success) {
        setEmployees(employeesResponse.data);
      }

      if (attendanceResponse.success) {
        setAttendanceData(attendanceResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = attendanceData;

    // Filter by employee if selected
    if (selectedEmployee) {
      filtered = filtered.filter(record => 
        record.employeeId === parseInt(selectedEmployee)
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employee?.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
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

  const getEmployeeStats = () => {
    const stats = {};
    
    employees.forEach(employee => {
      const employeeRecords = attendanceData.filter(record => 
        record.employeeId === employee.id
      );
      
      const totalDays = employeeRecords.length;
      const presentDays = employeeRecords.filter(record => record.checkIn).length;
      const onTimeDays = employeeRecords.filter(record => {
        if (!record.checkIn) return false;
        const checkInTime = new Date(`2000-01-01T${record.checkIn}`);
        const nineAM = new Date('2000-01-01T09:00:00');
        return checkInTime <= nineAM;
      }).length;
      
      const totalWorkingMinutes = employeeRecords.reduce((total, record) => {
        if (record.checkIn && record.checkOut) {
          const checkIn = new Date(`2000-01-01T${record.checkIn}`);
          const checkOut = new Date(`2000-01-01T${record.checkOut}`);
          return total + (checkOut - checkIn) / (1000 * 60);
        }
        return total;
      }, 0);
      
      const avgWorkingHours = totalWorkingMinutes > 0 ? totalWorkingMinutes / 60 / presentDays : 0;
      
      stats[employee.id] = {
        employee,
        totalDays,
        presentDays,
        onTimeDays,
        attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
        punctualityRate: presentDays > 0 ? (onTimeDays / presentDays) * 100 : 0,
        avgWorkingHours: avgWorkingHours.toFixed(1)
      };
    });
    
    return stats;
  };

  const employeeStats = getEmployeeStats();

  const getStatusBadge = (record) => {
    if (!record.checkIn) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Absent</span>;
    } else if (!record.checkOut) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">In Progress</span>;
    } else {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Complete</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Attendance Summary" />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
              Attendance Summary
            </h1>
            <button className="btn-secondary flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export Report</span>
            </button>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Employee
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="input-field pl-10"
                    placeholder="Search by name or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Employee
                </label>
                <select
                  className="input-field"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">All Employees</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    className="input-field"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  />
                  <input
                    type="date"
                    className="input-field"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Employee Statistics */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-primary-600" />
              Employee Statistics
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Present Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Punctuality Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Working Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.values(employeeStats).map((stat) => (
                      <tr key={stat.employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {stat.employee.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {stat.employee.department}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.presentDays} / {stat.totalDays}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${stat.attendanceRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">
                              {stat.attendanceRate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${stat.punctualityRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">
                              {stat.punctualityRate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.avgWorkingHours}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detailed Attendance Records */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-primary-600" />
              Detailed Attendance Records
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Working Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(record.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {record.employee?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.employee?.department}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {record.checkIn && (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            )}
                            <span className="text-sm text-gray-900">
                              {formatTime(record.checkIn)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {record.checkOut && (
                              <XCircle className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <span className="text-sm text-gray-900">
                              {formatTime(record.checkOut)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Timer className="h-4 w-4 text-primary-500 mr-2" />
                            <span className="text-sm text-gray-900">
                              {calculateWorkingHours(record.checkIn, record.checkOut)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(record)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredData.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search criteria or date range.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendanceSummary;
