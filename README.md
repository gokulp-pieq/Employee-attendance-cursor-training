# Employee Attendance Management System

A modern, responsive web application for managing employee attendance built with React, Vite, and Tailwind CSS.

## Features

### Authentication
- Secure login with email and password
- Role-based access control (Admin, Manager, Employee)
- Session management with local storage

### Employee Dashboard
- Real-time clock display
- Check-in/Check-out functionality
- Today's attendance status
- Working hours calculation
- Personal attendance history

### Admin Dashboard
- All employee dashboard features
- Real-time attendance overview
- Quick statistics (total employees, present today, etc.)
- Admin-specific navigation

### Employee Management (Admin Only)
- CRUD operations for employees
- Search and filter functionality
- Employee information management
- Role and department assignment

### Attendance Summary (Admin Only)
- Comprehensive attendance reports
- Employee statistics (attendance rate, punctuality)
- Detailed attendance records
- Filtering by employee, date range
- Export functionality (UI ready)

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
src/
├── components/           # React components
│   ├── Login.jsx        # Authentication page
│   ├── Dashboard.jsx    # Employee dashboard
│   ├── AdminDashboard.jsx # Admin dashboard
│   ├── EmployeeManagement.jsx # CRUD operations
│   ├── AttendanceSummary.jsx # Reports and analytics
│   ├── Header.jsx       # Navigation header
│   └── LoadingSpinner.jsx # Loading component
├── contexts/
│   └── AuthContext.jsx  # Authentication context
├── services/
│   └── api.js          # Dummy API service
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── index.css           # Global styles
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository or extract the project files
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Demo Credentials

Use these credentials to test different user roles:

- **Admin**: john@company.com / password123
- **Employee**: jane@company.com / password123  
- **Manager**: sarah@company.com / password123

## Features Overview

### For All Users
- ✅ Login/Logout functionality
- ✅ Check-in/Check-out with timestamp
- ✅ Real-time clock display
- ✅ Today's attendance status
- ✅ Working hours calculation

### For Admin Users
- ✅ Employee management (Add/Edit/Delete)
- ✅ Attendance summary and reports
- ✅ Employee statistics and analytics
- ✅ Search and filter functionality
- ✅ Real-time dashboard overview

## API Integration

Currently uses dummy API calls that simulate:
- Authentication
- Employee CRUD operations
- Attendance tracking
- Data persistence in localStorage

To integrate with your Dropwizard backend:
1. Replace the dummy API calls in `src/services/api.js`
2. Update the base URL and endpoints
3. Handle authentication tokens properly
4. Update data models as needed

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Enhancements

- Real backend integration
- Advanced reporting features
- Employee photo uploads
- Email notifications
- Mobile app version
- Biometric integration

## Contributing

1. Follow the existing code structure
2. Use Tailwind CSS for styling
3. Maintain responsive design
4. Add proper error handling
5. Update documentation as needed

---

## Development Log

### User Prompt:
"Now i want to build project for employee's attendance management using react + vite + tailwind css for frontend, dropwizard + kotlin for backend, postgres for database. I created table schemas for storing all the employee and attendance details. Now our only target is to build frontend, later we will integrate it with the backend. As of now use dummy api calls. when th application starts it shows the login page , where user can enter their email and password to login. After the validation it should shows the next page based on the role of the employee role. For all roles there should be check-in, check out options. For admin role there should be additional features such as crud operations to add/ delete/ update any employees and should able to see the summary of all the employees and a specific employee. Dont go with advanced, just add these functionalities with proper styling and working functionalities."

### What I Did:
Built a complete employee attendance management frontend application with React + Vite + Tailwind CSS, including login system with role-based access, employee/admin dashboards, check-in/check-out functionality, employee CRUD operations, attendance summaries, and dummy API integration.

---

### User Prompt:
"Always add my promt and you response with simple word like what you did at the end of readme, Dont add too much just say what you did and my exact prompt. Also small change , currently user can checkin only one time a day, it should be changed to multiple times and there should custom checkin also where we can give date and time for checkin and checkout."

### What I Did:
Modified attendance system to allow multiple check-ins per day, added custom attendance feature with date/time selection, and updated README format to include simple prompt/response logs.
