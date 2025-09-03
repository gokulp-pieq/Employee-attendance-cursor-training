// Dummy data for development
const dummyEmployees = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@company.com',
    role: 'admin',
    department: 'IT',
    joinDate: '2023-01-15',
    status: 'active'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@company.com',
    role: 'employee',
    department: 'HR',
    joinDate: '2023-02-20',
    status: 'active'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@company.com',
    role: 'employee',
    department: 'Finance',
    joinDate: '2023-03-10',
    status: 'active'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah@company.com',
    role: 'manager',
    department: 'Marketing',
    joinDate: '2023-01-05',
    status: 'active'
  }
];

const dummyAttendance = [
  {
    id: 1,
    employeeId: 1,
    date: '2024-01-15',
    checkIn: '09:00:00',
    checkOut: '17:30:00',
    status: 'present'
  },
  {
    id: 2,
    employeeId: 2,
    date: '2024-01-15',
    checkIn: '09:15:00',
    checkOut: '17:45:00',
    status: 'present'
  },
  {
    id: 3,
    employeeId: 3,
    date: '2024-01-15',
    checkIn: '08:45:00',
    checkOut: '17:15:00',
    status: 'present'
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API Configuration
const API_BASE_URL = 'http://localhost:8085';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || `HTTP error! status: ${response.status}`,
        code: response.status
      };
    }
    
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Network error occurred' 
    };
  }
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    const response = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success) {
      // Store user data in localStorage
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      localStorage.setItem('authToken', 'authenticated'); // Since no JWT token in response
    }
    
    return response;
  },
  
  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    return { success: true };
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('currentUser');
  }
};

// Employee API
export const employeeAPI = {
  getAllEmployees: async () => {
    await delay(800);
    return { success: true, data: dummyEmployees };
  },
  
  getEmployeeById: async (id) => {
    await delay(600);
    const employee = dummyEmployees.find(emp => emp.id === parseInt(id));
    return employee 
      ? { success: true, data: employee }
      : { success: false, message: 'Employee not found' };
  },
  
  createEmployee: async (employeeData) => {
    await delay(1000);
    const newEmployee = {
      id: Math.max(...dummyEmployees.map(e => e.id)) + 1,
      ...employeeData,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    dummyEmployees.push(newEmployee);
    return { success: true, data: newEmployee };
  },
  
  updateEmployee: async (id, employeeData) => {
    await delay(800);
    const index = dummyEmployees.findIndex(emp => emp.id === parseInt(id));
    if (index !== -1) {
      dummyEmployees[index] = { ...dummyEmployees[index], ...employeeData };
      return { success: true, data: dummyEmployees[index] };
    }
    return { success: false, message: 'Employee not found' };
  },
  
  deleteEmployee: async (id) => {
    await delay(600);
    const index = dummyEmployees.findIndex(emp => emp.id === parseInt(id));
    if (index !== -1) {
      dummyEmployees.splice(index, 1);
      return { success: true };
    }
    return { success: false, message: 'Employee not found' };
  }
};

// Attendance API
export const attendanceAPI = {
  checkIn: async (employeeId, customDate = null, customTime = null) => {
    await delay(800);
    const date = customDate || new Date().toISOString().split('T')[0];
    const time = customTime || new Date().toTimeString().split(' ')[0];
    
    // For regular check-in (not custom), check if there's an active check-in without checkout
    if (!customDate && !customTime) {
      const today = new Date().toISOString().split('T')[0];
      const activeRecord = dummyAttendance.find(
        record => record.employeeId === employeeId && record.date === today && !record.checkOut
      );
      
      if (activeRecord) {
        return { success: false, message: 'Please check out from your current session before checking in again' };
      }
    }
    
    const newRecord = {
      id: Math.max(...dummyAttendance.map(a => a.id), 0) + 1,
      employeeId,
      date,
      checkIn: time,
      checkOut: null,
      status: 'present',
      isCustom: !!(customDate || customTime)
    };
    
    dummyAttendance.push(newRecord);
    return { success: true, data: newRecord };
  },
  
  checkOut: async (employeeId, recordId = null, customTime = null) => {
    await delay(800);
    const today = new Date().toISOString().split('T')[0];
    const now = customTime || new Date().toTimeString().split(' ')[0];
    
    let record;
    if (recordId) {
      // Check out specific record
      record = dummyAttendance.find(r => r.id === recordId);
    } else {
      // Find latest check-in without check-out for today
      const todayRecords = dummyAttendance.filter(
        r => r.employeeId === employeeId && r.date === today && !r.checkOut
      );
      record = todayRecords[todayRecords.length - 1]; // Get latest
    }
    
    if (!record) {
      return { success: false, message: 'No active check-in record found' };
    }
    
    if (record.checkOut) {
      return { success: false, message: 'This record is already checked out' };
    }
    
    record.checkOut = now;
    if (customTime) record.isCustom = true;
    return { success: true, data: record };
  },
  
  getAttendanceByEmployee: async (employeeId, startDate, endDate) => {
    await delay(600);
    const records = dummyAttendance.filter(record => {
      const recordDate = new Date(record.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return record.employeeId === employeeId && 
             recordDate >= start && 
             recordDate <= end;
    });
    
    return { success: true, data: records };
  },
  
  getAllAttendance: async (date) => {
    await delay(800);
    const records = date 
      ? dummyAttendance.filter(record => record.date === date)
      : dummyAttendance;
    
    // Join with employee data
    const enrichedRecords = records.map(record => ({
      ...record,
      employee: dummyEmployees.find(emp => emp.id === record.employeeId)
    }));
    
    return { success: true, data: enrichedRecords };
  },
  
  getTodayStatus: async (employeeId) => {
    await delay(400);
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = dummyAttendance.filter(
      record => record.employeeId === employeeId && record.date === today
    );
    
    const activeRecord = todayRecords.find(r => !r.checkOut); // Find active check-in
    
    return { 
      success: true, 
      data: {
        todayRecords,
        hasActiveCheckIn: !!activeRecord,
        activeRecord,
        totalCheckIns: todayRecords.length
      }
    };
  },

  addCustomAttendance: async (employeeId, date, checkInTime, checkOutTime = null) => {
    await delay(800);
    
    const newRecord = {
      id: Math.max(...dummyAttendance.map(a => a.id), 0) + 1,
      employeeId,
      date,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      status: 'present',
      isCustom: true
    };
    
    dummyAttendance.push(newRecord);
    return { success: true, data: newRecord };
  }
};
