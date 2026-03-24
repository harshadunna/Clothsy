import './App.css'
import { Routes, Route } from 'react-router-dom'
import CustomerRoutes from './Routers/CustomerRoutes'
import AdminRoutes from './Admin/AdminRoutes' 

function App() {
  return (
    <Routes>
      {/* Customer Routes (Catches everything else) */}
      <Route path="/*" element={<CustomerRoutes />} />
      
      {/* Admin Routes (Catches anything starting with /admin) */}
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
}

export default App