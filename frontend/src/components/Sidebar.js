import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { FaBox, FaUsers, FaFileAlt, FaHistory, FaPowerOff, FaFileInvoice, FaTools } from "react-icons/fa"; // Icons add panniyachu

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const businessId = localStorage.getItem("businessId");

  const handleLogout = (e) => {
    e.preventDefault(); 
    localStorage.clear();
    navigate("/admin-dashboard"); 
  };

  return (
    <>
      <button
        className={`sidebar-toggle-btn ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? "<<" : ">>"}
      </button>

      <div className={`sidebar ${sidebarOpen ? "show" : ""}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h3>Billing PRO</h3>
          </div>
          <hr className="sidebar-divider" />
          
          <ul>
            {/* Billing Form Section */}
            <li className={location.pathname.includes("/quotation") && !location.pathname.includes("/pages/quotation") ? "active" : ""}>
              <Link to={`/quotation/${businessId}/quotation`}>
                <FaFileAlt /> <span>Billing Form</span>
              </Link>
            </li>

            {/* NEW: Quotation Form Section */}
            <li className={location.pathname.includes("/pages/quotation") ? "active" : ""}>
              <Link to={`/quotation/${businessId}/pages/quotation`}>
                <FaFileInvoice /> <span>Quotation Form</span>
              </Link>
            </li>

            {/* NEW: Service Details Section */}
            <li className={location.pathname.includes("/pages/services") ? "active" : ""}>
              <Link to={`/service/${businessId}/pages/services`}>
                <FaTools /> <span>Service Details</span>
              </Link>
            </li>

            {/* Sales History Section */}
            <li className={location.pathname.includes("/history") ? "active" : ""}>
              <Link to={`/quotation/${businessId}/history`}>
                <FaHistory /> <span>Sales History</span>
              </Link>
            </li>

            <hr className="sidebar-divider" />
            <p className="sidebar-label">Master Data</p>

            <li className={location.pathname.includes("/ProductMaster") ? "active" : ""}>
              <Link to={`/quotation/${businessId}/master/ProductMaster`}> 
                <FaBox /> <span>Products</span>
              </Link>
            </li>
            <li className={location.pathname.includes("/CustomerMaster") ? "active" : ""}>
              <Link to={`/quotation/${businessId}/master/CustomerMaster`}>
                <FaUsers /> <span>Customers</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <hr className="sidebar-divider" />
          <button className="custom-logout-red" onClick={handleLogout}>
            <FaPowerOff /> <span>Back to Home</span> 
          </button>
        </div>      
      </div>
    </>
  );
}

export default Sidebar;