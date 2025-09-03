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
  "dept_id": 1,
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

### Get All Employees
**GET** `/api/employees`

Returns a list of all employees.

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
    "dept_id": 1,
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
  "dept_id": 1,
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
  "dept_id": 1,
  "reporting_to": null
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
  "dept_id": 1,
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
  "dept_id": 1,
  "reporting_to": null
}
```

### Update Employee by UUID
**PUT** `/api/employees/uuid/{empId}`

Updates an existing employee by UUID.

**Request Body:** Same as above.

### Delete Employee by Email
**DELETE** `/api/employees/email/{email}`

Deletes an employee by email.

**Response (200 OK):**
```json
{
  "message": "Employee deleted successfully"
}
```

### Delete Employee by UUID
**DELETE** `/api/employees/uuid/{empId}`

Deletes an employee by UUID.

### Get All Roles
**GET** `/api/employees/roles`

Returns a list of all available roles.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Employee",
    "description": "Regular employee"
  },
  {
    "id": 2,
    "name": "Supervisor",
    "description": "Team supervisor"
  },
  {
    "id": 3,
    "name": "Manager",
    "description": "Department manager"
  },
  {
    "id": 4,
    "name": "Director",
    "description": "Company director"
  },
  {
    "id": 5,
    "name": "Admin",
    "description": "System administrator"
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
    "name": "Engineering",
    "description": "Software development team"
  },
  {
    "id": 2,
    "name": "Sales",
    "description": "Sales and marketing team"
  },
  {
    "id": 3,
    "name": "HR",
    "description": "Human resources team"
  },
  {
    "id": 4,
    "name": "Finance",
    "description": "Finance and accounting team"
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
  "emp_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "checkin_datetime": "2025-09-03T08:00:00",
  "checkout_datetime": null
}
```

### Check-out
**POST** `/api/attendance/checkout`

Records employee check-out time.

**Request Body:**
```json
{
  "emp_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "checkin_datetime": "2025-09-03T08:00:00",
  "checkout_datetime": "2025-09-03T17:00:00"
}
```

### Get Today's Attendance
**GET** `/api/attendance/today`

Returns today's attendance records for all employees.

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

### Get Employee Attendance by Date
**GET** `/api/attendance/employee/{empId}/date/{date}`

Returns attendance records for a specific employee on a specific date.

### Get Attendance Summary by Date
**GET** `/api/attendance/summary/date/{date}`

Returns attendance summary for all employees on a specific date.

**Response (200 OK):**
```json
[
  {
    "emp_id": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "last_name": "Doe",
    "checkin_time": "08:00:00",
    "checkout_time": "17:00:00",
    "total_hours": 9.0,
    "status": "COMPLETE"
  }
]
```

### Get Employee Attendance Summary
**GET** `/api/attendance/summary/employee/{empId}`

Returns attendance summary for a specific employee.

### Get Today's Summary
**GET** `/api/attendance/summary/today`

Returns today's attendance summary for all employees.

### Get Attendance by Date Range
**GET** `/api/attendance/date-range?start_date={startDate}&end_date={endDate}`

Returns attendance records within a date range.

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

### Attendance
```json
{
  "id": 1,
  "emp_id": "550e8400-e29b-41d4-a716-446655440000",
  "checkin_datetime": "2025-09-03T08:00:00",
  "checkout_datetime": "2025-09-03T17:00:00"
}
```

### Role
```json
{
  "id": 1,
  "name": "Employee",
  "description": "Regular employee"
}
```

### Department
```json
{
  "id": 1,
  "name": "Engineering",
  "description": "Software development team"
}
```

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "code": 400,
  "message": "Validation error message"
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
  "code": 500,
  "message": "Internal server error"
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

## Testing

You can test all endpoints using Bruno or any API testing tool like Postman. The backend is running on `http://localhost:8085`.
