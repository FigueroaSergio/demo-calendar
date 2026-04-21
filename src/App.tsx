import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { PatientPortal } from './features/patient/PatientPortal';
import { ProviderSearch } from './features/patient/ProviderSearch';
import { BookingWizard } from './features/patient/BookingWizard';
import { AdminDashboard } from './features/admin/AdminDashboard';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<ProviderSearch />} />
          <Route path="book/:providerId" element={<BookingWizard />} />
          <Route path="patient" element={<PatientPortal />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppRouter />
  );
}

export default App;
