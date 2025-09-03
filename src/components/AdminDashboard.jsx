import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { attendanceAPI, employeeAPI } from '../services/api';
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
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  X
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
  
  // Employee management states
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role_id: '',
    dept_id: '',
    reporting_to: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    fetchTodayStatus();
    fetchTodayAttendance();
    fetchEmployees();
    fetchRolesAndDepartments();
    
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const empId = user?.empId || user?.emp_id || user?.id;
      const response = await attendanceAPI.getTodayStatus(empId);
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
      const empId = user?.empId || user?.emp_id || user?.id;
      const response = await attendanceAPI.checkIn(empId);
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
      const empId = user?.empId || user?.emp_id || user?.id;
      const response = await attendanceAPI.checkOut(empId);
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

  // Employee management functions
  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAllEmployees();
      if (response.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

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

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await employeeAPI.createEmployee(employeeForm);
      if (response.success) {
        setMessage('Employee added successfully!');
        setShowEmployeeModal(false);
        resetEmployeeForm();
        await fetchEmployees();
      } else {
        setMessage(response.message || 'Error adding employee');
      }
    } catch (error) {
      setMessage('Error adding employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await employeeAPI.updateEmployee(editingEmployee.email, employeeForm);
      if (response.success) {
        setMessage('Employee updated successfully!');
        setShowEmployeeModal(false);
        setEditingEmployee(null);
        resetEmployeeForm();
        await fetchEmployees();
      } else {
        setMessage(response.message || 'Error updating employee');
      }
    } catch (error) {
      setMessage('Error updating employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (email) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setLoading(true);
      
      try {
        const response = await employeeAPI.deleteEmployee(email);
        if (response.success) {
          setMessage('Employee deleted successfully!');
          await fetchEmployees();
        } else {
          setMessage(response.message || 'Error deleting employee');
        }
      } catch (error) {
        setMessage('Error deleting employee. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetEmployeeForm = () => {
    setEmployeeForm({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role_id: '',
      dept_id: '',
      reporting_to: ''
    });
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      first_name: employee.first_name || employee.firstName || '',
      last_name: employee.last_name || employee.lastName || '',
      email: employee.email || '',
      password: '',
      role_id: employee.role_id || employee.roleId || '',
      dept_id: employee.dept_id || employee.deptId || '',
      reporting_to: employee.reporting_to || employee.reportingTo || ''
    });
    setShowEmployeeModal(true);
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    resetEmployeeForm();
    setShowEmployeeModal(true);
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : `Role ${roleId}`;
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : `Department ${deptId}`;
  };

  const viewEmployeeSummary = async (empId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await attendanceAPI.getWorkingHours(empId, today, today);
      if (response.success) {
        const summary = response.data;
        alert(`Employee Summary for Today:\nWorking Hours: ${summary.formatted_duration}\nTotal Seconds: ${summary.total_working_seconds}`);
      } else {
        alert('No attendance data found for this employee today.');
      }
    } catch (error) {
      alert('Error fetching employee summary.');
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const firstName = employee.first_name || employee.firstName || '';
    const lastName = employee.last_name || employee.lastName || '';
    const email = employee.email || '';
    
    const matchesSearch = firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !filterDept || (employee.dept_id == filterDept || employee.deptId == filterDept);
    const matchesRole = !filterRole || (employee.role_id == filterRole || employee.roleId == filterRole);
    
    return matchesSearch && matchesDept && matchesRole;
  });

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
                  Welcome back, {user?.firstName} {user?.lastName}!
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
                <button
                  onClick={openAddModal}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Employee</span>
                </button>

                <Link
                  to="/employees"
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
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

          {/* Employee Management Section */}
          <div className="card mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2 text-primary-600" />
                Employee Management
              </h2>
              <button
                onClick={openAddModal}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Employee</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">All Roles</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDept('');
                    setFilterRole('');
                  }}
                  className="btn-secondary px-4 py-2"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Employees Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id || employee.emp_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                          <span className="text-sm font-medium text-primary-600">
                              {(employee.first_name || employee.firstName)?.[0]}{(employee.last_name || employee.lastName)?.[0]}
                            </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.first_name || employee.firstName} {employee.last_name || employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">ID: {employee.emp_id || employee.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getDepartmentName(employee.dept_id || employee.deptId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getRoleName(employee.role_id || employee.roleId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewEmployeeSummary(employee.emp_id || employee.empId || employee.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Summary"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(employee)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Employee"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee.email)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Employee"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEmployees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No employees found matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </h3>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={employeeForm.first_name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={employeeForm.last_name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                />
              </div>

              {!editingEmployee && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="input-field"
                    value={employeeForm.password}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    required
                    className="input-field"
                    value={employeeForm.role_id}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, role_id: e.target.value })}
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    required
                    className="input-field"
                    value={employeeForm.dept_id}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, dept_id: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
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
                    editingEmployee ? 'Update Employee' : 'Add Employee'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
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

export default AdminDashboard;
