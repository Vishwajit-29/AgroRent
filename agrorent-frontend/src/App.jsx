import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import MyEquipmentPage from './pages/MyEquipmentPage';
import AddEquipmentPage from './pages/AddEquipmentPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingRequestsPage from './pages/BookingRequestsPage';

import './i18n';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
          
          {/* Renter Routes */}
          <Route path="/my-equipment" element={<MyEquipmentPage />} />
          <Route path="/add-equipment" element={<AddEquipmentPage />} />
          <Route path="/edit-equipment/:id" element={<AddEquipmentPage />} />
          <Route path="/requests" element={<BookingRequestsPage />} />

          {/* Rent Taker Routes */}
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
