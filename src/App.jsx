import './App.css'
import { Routes, Route } from 'react-router-dom'
import CustomerRoutes from './Routers/CustomerRoutes'

function App() {
  return (
    <Routes>
      <Route path="/*" element={<CustomerRoutes />} />
    </Routes>
  );
}

export default App
