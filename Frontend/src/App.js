import React from 'react';
import './App.css';
import WebFont from "webfontloader";

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import About from './pages/About.jsx';
import AddRoomForm from './pages/AddRoomForm';
import Product from './pages/StudentDetails.jsx';
import AttendancePage from './pages/Attendance';
import RoomAllocation from './pages/RoomAllocation.jsx';
import Fees from './pages/Fees.jsx';

import Login from './pages/Login';
import Admin from './pages/AdminLogin';
import StaffManagementPage from './pages/AddStaff';
import AdminSettings from './pages/AdminSettings';
import Nav from './components/Nav';
import SearchPage from './pages/SearchPage';

const App = () => {
  return (
    <div className='app'>
      <BrowserRouter>
        <Nav></Nav>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/admin_login" element={<Admin />} />

          {/* Staff routes — StaffSidebar is used inside each page */}
          <Route path="/home" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/AddStudents" element={<About />} />
          <Route path="/AddRooms" element={<AddRoomForm />} />
          <Route path="/RoomAllocation" element={<RoomAllocation />} />
          <Route path="/Student_Details" element={<Product />} />
          <Route path="/Attendance" element={<AttendancePage />} />
          <Route path="/attendance_detail" element={<SearchPage />} />
          <Route path="/Fees" element={<Fees />} />

          {/* Admin routes — AdminSidebar is used inside each page */}
          <Route path="/add_staff" element={<StaffManagementPage />} />
          <Route path="/admin_settings" element={<AdminSettings />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
