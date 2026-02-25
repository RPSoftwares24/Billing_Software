import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { 
  FaBox, 
  FaUsers, 
  FaTools, 
  FaHistory, 
  FaArrowLeft, 
  FaBars, 
  FaTimes, 
  FaFileInvoice 
} from "react-icons/fa";
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
          <hr className="sidebar-divider" />
          
          <ul>
            {/* 1. Products Section */}
            <li className={activeTab === 'products' ? "active" : ""}>
              <Link to={`/quotation/${bId|| '1'}/master/ProductMaster`} className="sidebar-link-style" onClick={() => {setActiveTab('products'); setIsOpen(false);}}>
                <FaBox /> <span>Products Master</span>
              </Link>
            </li>
            
            {/* 2. Customers Section */}
            <li className={activeTab === 'customers' ? "active" : ""}>
              <Link to={`/quotation/${bId}/master/CustomerMaster`} className="sidebar-link-style" onClick={() => {setActiveTab('customers'); setIsOpen(false);}}>
                <FaUsers /> <span>Customers Master</span>
              </Link>
            </li>

            {/* 3. NEW: Quotation Form Section (Added) */}
            <li className={activeTab === 'quotation' ? "active" : ""}>
              <Link to={`/quotation/${bId}/pages/quotation`} className="sidebar-link-style" onClick={() => {setActiveTab('quotation'); setIsOpen(false);}}>
                <FaFileInvoice /> <span>Quotation Form</span>
              </Link>
            </li>

            {/* 4. Service Details Section (Path Updated to match main sidebar) */}
            <li className={activeTab === 'services' ? "active" : ""}>
              <Link to={`/service/${bId}/pages/services`} className="sidebar-link-style" onClick={() => {setActiveTab('services'); setIsOpen(false);}}>
                <FaTools /> <span>Service Details</span>
              </Link>
            </li>

            {/* 5. Sales History Section */}
            <li className={activeTab === 'history' ? "active" : ""}>
              <Link to={`/quotation/${bId}/history`} className="sidebar-link-style" onClick={() => {setActiveTab('history'); setIsOpen(false);}}>
                <FaHistory /> <span>Sales History</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <hr className="sidebar-divider" />
          <Link to={`/quotation/${bId}/quotation`} className="back-btn-professional">
            <FaArrowLeft /> <span>Back to Billing</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default MasterSidebar;