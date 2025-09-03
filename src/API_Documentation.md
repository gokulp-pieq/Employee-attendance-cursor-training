# Employee Attendance Management System - API Documentation

## Base URL
```
http://localhost:8085
```

## Authentication

### Login
**POST** `/api/auth/login`

Authenticates a user and returns employee information.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "role_id": 1,
  "role_name": "Employee",
  "dept_id": 1,
  "dept_name": "Information Technology",
  "reporting_to": null
}
```

**Error Response (401 Unauthorized):**
```json
{
  "code": 401,
  "message": "Invalid credentials"
}
```

## Employee Management

**Note:** All employee responses now include both `role_id`/`dept_id` and `role_name`/`dept_name` fields for better readability and frontend integration.

### Get All Employees
**GET** `/api/employees`

Returns a list of all employees.

**Query Parameters:**
- `dept_id` (optional): Filter by department ID
- `role_id` (optional): Filter by role ID  
- `search` (optional): Search by name or email

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "emp_id": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role_id": 1,
    "role_name": "Employee",
    "dept_id": 1,
    "dept_name": "Information Technology",
    "reporting_to": null
  }
]
```

### Get Employee by Email
**GET** `/api/employees/email/{email}`

Returns employee details by email address.

**Response (200 OK):**
```json
{
  "id": 1,
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "role_id": 1,
  "role_name": "Employee",
  "dept_id": 1,
  "dept_name": "Information Technology",
  "reporting_to": null
}
```

**Error Response (404 Not Found):**
```json
{
  "code": 404,
  "message": "Employee not found"
}
```

### Get Employee by UUID
**GET** `/api/employees/uuid/{empId}`

Returns employee details by UUID.

**Response (200 OK):**
```json
{
  "id": 1,
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "role_id": 1,
  "role_name": "Employee",
  "dept_id": 1,
  "dept_name": "Information Technology",
  "reporting_to": null
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid UUID format"
}
```

### Create Employee
**POST** `/api/employees`

Creates a new employee.

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "password": "password123",
  "role_id": 1,
  "dept_id": 1,
  "reporting_to": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "emp_id": "550e8400-e29b-41d4-a716-446655440001",
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "role_id": 1,
  "role_name": "Employee",
  "dept_id": 1,
  "dept_name": "Information Technology",
  "reporting_to": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Response (409 Conflict):**
```json
{
  "code": 409,
  "message": "Email already exists"
}
```

### Update Employee by Email
**PUT** `/api/employees/email/{email}`

Updates an existing employee by email.

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "role_id": 2,
  "dept_id": 1,
  "reporting_to": null
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "emp_id": "550e8400-e29b-41d4-a716-446655440001",
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "role_id": 2,
  "role_name": "Supervisor",
  "dept_id": 1,
  "dept_name": "Information Technology",
  "reporting_to": null
}
```

### Update Employee by UUID
**PUT** `/api/employees/uuid/{empId}`

Updates an existing employee by UUID.

**Request Body:** Same as above.

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid UUID format"
}
```

### Delete Employee by Email
**DELETE** `/api/employees/email/{email}`

Deletes an employee by email.

**Response (204 No Content):** No body

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Failed to delete employee"
}
```

### Delete Employee by UUID
**DELETE** `/api/employees/uuid/{empId}`

Deletes an employee by UUID.

**Response (204 No Content):** No body

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid UUID format"
}
```

### Get All Roles
**GET** `/api/employees/roles`

Returns a list of all available roles.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Developer"
  },
  {
    "id": 2,
    "name": "Designer"
  },
  {
    "id": 3,
    "name": "Intern"
  },
  {
    "id": 4,
    "name": "Manager"
  },
  {
    "id": 5,
    "name": "Admin"
  }
]
```

### Get All Departments
**GET** `/api/employees/departments`

Returns a list of all available departments.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Software Development"
  },
  {
    "id": 2,
    "name": "Cloud Computing"
  },
  {
    "id": 3,
    "name": "Cyber Security"
  },
  {
    "id": 4,
    "name": "Engineering"
  }
]
```

## Attendance Management

### Check-in
**POST** `/api/attendance/checkin`

Records employee check-in time.

**Request Body:**
```json
{
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "checkin_datetime": "2025-09-03T08:00:00"
}
```

**Notes:**
- `emp_id` (required): Employee UUID
- `checkin_datetime` (optional): Custom check-in datetime. If not provided, current server time will be used.

**Response (201 Created):**
```json
{
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "checkin_datetime": "2025-09-03T08:00:00",
  "checkout_datetime": null,
  "total_working_seconds": null
}
```

**Error Response (409 Conflict):**
```json
{
  "code": 409,
  "message": "Employee already checked in today"
}
```

**Error Response (400 Bad Request):**
```json
{
  "code": 400,
  "message": "Checkin time must be between 6:00 AM and 10:00 PM"
}
```

### Check-out
**POST** `/api/attendance/checkout`

Records employee check-out time.

**Request Body:**
```json
{
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "checkout_datetime": "2025-09-03T17:00:00"
}
```

**Notes:**
- `emp_id` (required): Employee UUID
- `checkout_datetime` (optional): Custom check-out datetime. If not provided, current server time will be used.

**Response (200 OK):**
```json
{
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "checkin_datetime": "2025-09-03T08:00:00",
  "checkout_datetime": "2025-09-03T17:00:00",
  "total_working_seconds": 32400
}
```

**Error Response (400 Bad Request):**
```json
{
  "code": 400,
  "message": "Checkout time must be between 6:00 AM and 10:00 PM"
}
```

### Multiple Check-ins/Check-outs per Day

The system supports multiple check-in and check-out sessions per day for each employee. Here's how it works:

**Scenario 1: Morning Shift + Afternoon Shift**
```
08:00 AM - Check-in (Morning shift starts)
12:00 PM - Check-out (Morning shift ends)
01:00 PM - Check-in (Afternoon shift starts)
05:00 PM - Check-out (Afternoon shift ends)
```

**Scenario 2: Break Time**
```
09:00 AM - Check-in (Work starts)
12:00 PM - Check-out (Lunch break)
01:00 PM - Check-in (Work resumes)
06:00 PM - Check-out (Work ends)
```

**Business Rules:**
1. **Sequential Operations**: Check-out must follow check-in, check-in must follow check-out
2. **Same Day Only**: All operations must be within the same calendar day
3. **Time Validation**: Check-out time must be after check-in time
4. **Business Hours**: All times must be between 6:00 AM and 10:00 PM

**Error Scenarios:**
- **Attempting to check in without checking out**: Returns 409 Conflict
- **Attempting to check out without checking in**: Returns 404 Not Found
- **Check-out time before check-in time**: Returns 400 Bad Request
- **Times outside business hours**: Returns 400 Bad Request

### Get Today's Attendance
**GET** `/api/attendance/today`

Returns today's attendance records for all employees.

**Response (200 OK):**
```json
[
  {
    "emp_id": "550e8400-e29b-41d4-a716-446655440000",
    "checkin_datetime": "2025-09-03T08:00:00",
    "checkout_datetime": "2025-09-03T17:00:00",
    "total_working_seconds": 32400
  }
]
```

### Get Attendance by Date
**GET** `/api/attendance/date/{date}`

Returns attendance records for a specific date (format: YYYY-MM-DD).

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "emp_id": "550e8400-e29b-41d4-a716-446655440000",
    "checkin_datetime": "2025-09-03T08:00:00",
    "checkout_datetime": "2025-09-03T17:00:00"
  }
]
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid date format. Use YYYY-MM-DD"
}
```

### Get Employee Attendance
**GET** `/api/attendance/employee/{empId}`

Returns all attendance records for a specific employee.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "emp_id": "550e8400-e29b-41d4-a716-446655440000",
    "checkin_datetime": "2025-09-03T08:00:00",
    "checkout_datetime": "2025-09-03T17:00:00"
  }
]
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid UUID format"
}
```

### Get Employee Attendance by Date
**GET** `/api/attendance/employee/{empId}/date/{date}`

Returns attendance records for a specific employee on a specific date.

**Response (200 OK):**
```json
[
  {
    "emp_id": "550e8400-e29b-41d4-a716-446655440000",
    "checkin_datetime": "2025-09-03T08:00:00",
    "checkout_datetime": "2025-09-03T12:00:00",
    "total_working_seconds": 14400
  },
  {
    "emp_id": "550e8400-e29b-41d4-a716-446655440000",
    "checkin_datetime": "2025-09-03T13:00:00",
    "checkout_datetime": "2025-09-03T17:00:00",
    "total_working_seconds": 14400
  }
]
```

**Response (404 Not Found):**
```json
{
  "error": "No attendance found for the specified date"
}
```

### Get Attendance Summary by Date
**GET** `/api/attendance/summary/date/{date}`

Returns attendance summary for all employees on a specific date.

**Response (200 OK):**
```json
[
  {
    "emp_id": "550e8400-e29b-41d4-a716-446655440000",
    "employee_name": "John Doe",
    "date": "2025-09-03",
    "checkin_time": "08:00:00",
    "checkout_time": "17:00:00",
    "total_hours": "9.0",
    "status": "COMPLETE"
  }
]
```

### Get Employee Attendance Summary
**GET** `/api/attendance/summary/employee/{empId}`

Returns attendance summary for a specific employee.

**Query Parameters:**
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format

**Response (200 OK):**
```json
[
  {
    "emp_id": "550e8400-e29b-41d4-a716-446655440000",
    "employee_name": "John Doe",
    "date": "2025-09-03",
    "checkin_time": "08:00:00",
    "checkout_time": "17:00:00",
    "total_hours": "9.0",
    "status": "COMPLETE"
  }
]
```

### Get Today's Summary
**GET** `/api/attendance/summary/today`

Returns today's attendance summary for all employees.

**Response (200 OK):**
```json
[
  {
    "emp_id": "550e8400-e29b-41d4-a716-446655440000",
    "employee_name": "John Doe",
    "date": "2025-09-03",
    "checkin_time": "08:00:00",
    "checkout_time": "17:00:00",
    "total_hours": "9.0",
    "status": "COMPLETE"
  }
]
```

### Get Attendance by Date Range
**GET** `/api/attendance/date-range?start_date={startDate}&end_date={endDate}`

Returns attendance records within a date range.

**Query Parameters:**
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "emp_id": "550e8400-e29b-41d4-a716-446655440000",
    "checkin_datetime": "2025-09-03T08:00:00",
    "checkout_datetime": "2025-09-03T17:00:00"
  }
]
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid start date format. Use YYYY-MM-DD"
}
```

### Get Employee Working Hours Between Dates
**GET** `/api/attendance/working-hours/{empId}?start_date={startDate}&end_date={endDate}`

Returns total working hours for a specific employee between two dates.

**Path Parameters:**
- `empId` (required): Employee UUID

**Query Parameters:**
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format

**Response (200 OK):**
```json
{
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "start_date": "2025-09-01",
  "end_date": "2025-09-03",
  "total_working_seconds": 97200,
  "total_working_hours": 27,
  "total_working_minutes": 1620,
  "formatted_duration": "27h 0m"
}
```

**Error Responses:**
- **400 Bad Request**: Invalid UUID format or date format
- **404 Not Found**: Employee not found

## Data Models

### Employee
```json
{
  "id": 1,
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "hashed_password",
  "role_id": 1,
  "dept_id": 1,
  "reporting_to": "550e8400-e29b-41d4-a716-446655440001"
}
```

### EmployeeResponse
```json
{
  "id": 1,
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "role_id": 1,
  "role_name": "Employee",
  "dept_id": 1,
  "dept_name": "Information Technology",
  "reporting_to": "550e8400-e29b-41d4-a716-446655440001"
}
```

### Attendance
```json
{
  "id": 1,
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "checkin_datetime": "2025-09-03T08:00:00",
  "checkout_datetime": "2025-09-03T17:00:00"
}
```

### AttendanceResponse
```json
{
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "checkin_datetime": "2025-09-03T08:00:00",
  "checkout_datetime": "2025-09-03T17:00:00",
  "total_working_seconds": 32400
}
```



## Request DTOs

### LoginRequest
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### CreateEmployeeRequest
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "password": "password123",
  "role_id": 1,
  "dept_id": 1,
  "reporting_to": "550e8400-e29b-41d4-a716-446655440000"
}
```

### UpdateEmployeeRequest
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "role_id": 2,
  "dept_id": 1,
  "reporting_to": null
}
```

### CheckinRequest
```json
{
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "checkin_datetime": "2025-09-03T08:00:00"
}
```

### CheckoutRequest
```json
{
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "checkout_datetime": "2025-09-03T17:00:00"
}
```

### AttendanceSummaryResponse
```json
{
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "employee_name": "John Doe",
  "date": "2025-09-03",
  "checkin_time": "08:00:00",
  "checkout_time": "17:00:00",
  "total_hours": "9.0",
  "status": "COMPLETE"
}
```

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "code": 401,
  "message": "Invalid credentials"
}
```

**404 Not Found:**
```json
{
  "code": 404,
  "message": "Resource not found"
}
```

**409 Conflict:**
```json
{
  "code": 409,
  "message": "Resource already exists"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## Authentication Flow

1. **Login**: Use `/api/auth/login` with email and password
2. **Store Token**: Store the returned employee data in localStorage/session
3. **Role-based Access**: Use `role_id` from login response for authorization
4. **Session Management**: Implement logout by clearing stored data

## Frontend Implementation Notes

- Use the `role_id` from login response to implement role-based access control
- Store employee data in localStorage or session storage after successful login
- Implement proper error handling for all API calls
- Use the employee UUID (`emp_id`) for attendance operations
- Implement proper validation for all form inputs
- Handle loading states and error states appropriately
- All employee responses include both IDs and names for better UX

## Testing

You can test all endpoints using Bruno or any API testing tool like Postman. The backend is running on `http://localhost:8085`.
