import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaBox, FaUsers, FaTools, FaHistory, FaArrowLeft, FaBars, FaTimes } from "react-icons/fa";
import "./MasterSidebar.css";

const MasterSidebar = ({ setActiveTab, activeTab }) => {
  const { businessId, id } = useParams();
  const bId = businessId || id;
  const [isOpen, setIsOpen] = useState(false); 

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`sidebar constant-sidebar ${isOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h3>MASTER MENU</h3>
          </div>
          <ul>
            <li className={activeTab === 'products' ? "active" : ""}>
              <Link to={`/quotation/${bId}/master/ProductMaster`} className="sidebar-link-style" onClick={() => setActiveTab('products')}>
                <FaBox /> <span>Products</span>
              </Link>
            </li>
            
            <li className={activeTab === 'customers' ? "active" : ""}>
              <Link to={`/quotation/${bId}/master/CustomerMaster`} className="sidebar-link-style" onClick={() => setActiveTab('customers')}>
                <FaUsers /> <span>Customers</span>
              </Link>
            </li>

            {/* Bill History in Master Sidebar */}
            <li className={activeTab === 'history' ? "active" : ""}>
              <Link to={`/quotation/${bId}/history`} className="sidebar-link-style" onClick={() => setActiveTab('history')}>
                <FaHistory /> <span>Sales History</span>
              </Link>
            </li>

            <li className={activeTab === 'services' ? "active" : ""}>
              <Link to={`/crm/${bId}/services`} className="sidebar-link-style" onClick={() => setActiveTab('services')}>
                <FaTools /> <span>Services</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <Link to={`/quotation/${bId}/quotation`} className="back-btn-professional">
            <FaArrowLeft /> <span>Back to Billing</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default MasterSidebar;