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
    const response = await apiCall('/api/employees');
    return response;
  },
  
  getEmployeeById: async (id) => {
    const response = await apiCall(`/api/employees/${id}`);
    return response;
  },
  
  getEmployeeByEmail: async (email) => {
    const response = await apiCall(`/api/employees/email/${email}`);
    return response;
  },
  
  getEmployeeByUUID: async (empId) => {
    const response = await apiCall(`/api/employees/uuid/${empId}`);
    return response;
  },
  
  createEmployee: async (employeeData) => {
    const response = await apiCall('/api/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
    return response;
  },
  
  updateEmployee: async (email, employeeData) => {
    const response = await apiCall(`/api/employees/email/${email}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
    return response;
  },
  
  deleteEmployee: async (email) => {
    const response = await apiCall(`/api/employees/email/${email}`, {
      method: 'DELETE',
    });
    return response;
  },
  
  getAllRoles: async () => {
    const response = await apiCall('/api/employees/roles');
    return response;
  },
  
  getAllDepartments: async () => {
    const response = await apiCall('/api/employees/departments');
    return response;
  }
};

// Attendance API
export const attendanceAPI = {
  checkIn: async (empId) => {
    // Get current local datetime in the exact format expected by the API
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Format: YYYY-MM-DDTHH:mm:ss (matching the API documentation example)
    const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    
    const requestBody = { 
      emp_id: empId,
      checkin_datetime: localDateTime
    };
    
    console.log('Check-in request body:', requestBody);
    console.log('Check-in request body JSON:', JSON.stringify(requestBody));
    console.log('Check-in URL:', `${API_BASE_URL}/api/attendance/checkin`);
    
    try {
      const response = await apiCall('/api/attendance/checkin', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      console.log('Check-in API response:', response);
      return response;
    } catch (error) {
      console.error('Check-in API error:', error);
      return { success: false, message: error.message };
    }
  },
  
  checkOut: async (empId) => {
    // Get current local datetime in the exact format expected by the API
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Format: YYYY-MM-DDTHH:mm:ss (matching the API documentation example)
    const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    
    const requestBody = { 
      emp_id: empId,
      checkout_datetime: localDateTime
    };
    
    console.log('Check-out request body:', requestBody);
    console.log('Check-out request body JSON:', JSON.stringify(requestBody));
    
    try {
      const response = await apiCall('/api/attendance/checkout', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      console.log('Check-out API response:', response);
      return response;
    } catch (error) {
      console.error('Check-out API error:', error);
      return { success: false, message: error.message };
    }
  },
  
  getTodayStatus: async (empId) => {
    const response = await apiCall(`/api/attendance/employee/${empId}`);
    if (!response.success) {
      return { success: false, data: { todayRecords: [], hasActiveCheckIn: false, activeRecord: null, totalCheckIns: 0 } };
    }
    
    console.log('Raw attendance response:', response.data);
    
    // Filter for today's records with proper type checking
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = response.data.filter(record => {
      // Check if checkin_datetime exists and is a string
      if (!record || typeof record.checkin_datetime !== 'string') {
        console.log('Invalid record or checkin_datetime:', record);
        return false;
      }
      
      // Check if the date part matches today
      return record.checkin_datetime.startsWith(today);
    });
    
    console.log('Filtered today records:', todayRecords);
    
    // Find active check-in (without checkout)
    const activeRecord = todayRecords.find(record => !record.checkout_datetime);
    
    return { 
      success: true, 
      data: {
        todayRecords: todayRecords.map(record => ({
          id: record.id,
          checkIn: record.checkin_datetime ? record.checkin_datetime.split('T')[1].slice(0, 8) : null,
          checkOut: record.checkout_datetime ? record.checkout_datetime.split('T')[1].slice(0, 8) : null,
          isCustom: false
        })),
        hasActiveCheckIn: !!activeRecord,
        activeRecord: activeRecord ? {
          id: activeRecord.id,
          checkIn: activeRecord.checkin_datetime ? activeRecord.checkin_datetime.split('T')[1].slice(0, 8) : null
        } : null,
        totalCheckIns: todayRecords.length
      }
    };
  },
  
  getAttendanceByEmployee: async (empId, startDate, endDate) => {
    const response = await apiCall(`/api/attendance/employee/${empId}`);
    if (!response.success) {
      return { success: false, data: [] };
    }
    
    // Filter by date range with proper type checking
    const records = response.data.filter(record => {
      // Check if checkin_datetime exists and is a string
      if (!record || typeof record.checkin_datetime !== 'string') {
        console.log('Invalid record or checkin_datetime:', record);
        return false;
      }
      
      const recordDate = record.checkin_datetime.split('T')[0];
      return recordDate >= startDate && recordDate <= endDate;
    });
    
    return { success: true, data: records };
  },
  
  getAllAttendance: async (date) => {
    const endpoint = date ? `/api/attendance/date/${date}` : '/api/attendance/today';
    const response = await apiCall(endpoint);
    return response;
  },
  
  getAttendanceSummary: async (date) => {
    const endpoint = date ? `/api/attendance/summary/date/${date}` : '/api/attendance/summary/today';
    const response = await apiCall(endpoint);
    return response;
  },
  
  addCustomAttendance: async (empId, date, checkInTime, checkOutTime = null) => {
    // Convert local date and time to ISO datetime format expected by API
    const checkInDateTime = `${date}T${checkInTime}:00`;
    const checkOutDateTime = checkOutTime ? `${date}T${checkOutTime}:00` : null;
    
    // First check-in
    const checkInResponse = await apiCall('/api/attendance/checkin', {
      method: 'POST',
      body: JSON.stringify({ 
        emp_id: empId,
        checkin_datetime: checkInDateTime
      }),
    });
    
    if (!checkInResponse.success) {
      return checkInResponse;
    }
    
    // If checkout time is provided, also check out
    if (checkOutDateTime) {
      const checkOutResponse = await apiCall('/api/attendance/checkout', {
        method: 'POST',
        body: JSON.stringify({ 
          emp_id: empId,
          checkout_datetime: checkOutDateTime
        }),
      });
      
      if (!checkOutResponse.success) {
        return checkOutResponse;
      }
      
      return { success: true, data: checkOutResponse.data };
    }
    
    return checkInResponse;
  }
};
