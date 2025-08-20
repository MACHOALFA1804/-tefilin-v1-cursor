import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginDashboard from './components/LoginDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PastorDashboard from './pages/PastorDashboard';
import RecepcaoDashboard from './pages/RecepcaoDashboard';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/pastor" element={<PastorDashboard />} />
          <Route path="/recepcao" element={<RecepcaoDashboard />} />
          <Route path="*" element={<LoginDashboard />} />
          <Route path="/admin/visitantes" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin/cultos" element={<AdminDashboard />} />
          <Route path="/admin/msgs" element={<AdminDashboard />} />
          <Route path="/admin/pdf" element={<AdminDashboard />} />
          <Route path="/admin/api" element={<AdminDashboard />} />
          <Route path="/admin/backup" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;