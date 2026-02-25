import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BillingForm from './pages/billing/BillingForm';
import BillHistory from './pages/billing/BillHistory';
import ProductMaster from './pages/master/ProductMaster';
import CustomerMaster from './pages/master/CustomerMaster';
import QuotationForm from "./pages/QuotationForm";
import ServicePage from "./pages/ServicePage";
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="app-layout" style={{ display: 'flex' }}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="content" style={{ 
          flex: 1, 
          padding: '20px', 
          marginLeft: sidebarOpen ? '250px' : '0px', 
          transition: 'margin 0.3s ease' 
        }}>
          <Routes>
            <Route path="/" element={<Navigate to="/billing" />} />

            <Route path="/billing" element={<BillingForm />} />
            <Route path="/quotation/:businessId/quotation" element={<BillingForm />} />
            
            <Route path="/quotation/:businessId/history" element={<BillHistory />} />

            <Route path="/quotation/:businessId/master/ProductMaster" element={<ProductMaster />} />
            <Route path="/quotation/:businessId/master/CustomerMaster" element={<CustomerMaster />} />
            <Route path="/quotation/:businessId/pages/quotation" element={<QuotationForm />} />
            <Route path="/service/:businessId/pages/services" element={<ServicePage />} />
            <Route path="*" element={<Navigate to="/billing" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

