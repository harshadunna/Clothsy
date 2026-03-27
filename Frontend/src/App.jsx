import './App.css';
import { Routes, Route } from 'react-router-dom';
import CustomerRoutes from './Routers/CustomerRoutes';
import AdminRoutes from './Admin/AdminRoutes'; 

function App() {
  return (
    <Routes>
      {/* Admin Suite Routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      
      {/* Customer / Atelier Routes */}
      <Route path="/*" element={<CustomerRoutes />} />
    </Routes>
  );
}

export default App;