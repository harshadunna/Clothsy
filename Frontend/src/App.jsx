import './App.css';
import { Routes, Route } from 'react-router-dom';
import CustomerRoutes from './Routers/CustomerRoutes';
import AdminRoutes from './Admin/AdminRoutes'; 
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Admin Suite Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* Customer / Atelier Routes */}
        <Route path="/*" element={<CustomerRoutes />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;