import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginDashboard from './components/LoginDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PastorDashboard from './pages/PastorDashboard';
import RecepcaoDashboard from './pages/RecepcaoDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/pastor" element={<PastorDashboard />} />
        <Route path="/recepcao" element={<RecepcaoDashboard />} />
        <Route path="*" element={<LoginDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;