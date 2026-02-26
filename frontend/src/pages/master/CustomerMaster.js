import React, { useState, useEffect } from "react";
import API from "../../services/api";
import * as XLSX from "xlsx";
import "./CustomerMaster.css";
import { FaEdit, FaTrash, FaFileExcel, FaPlus, FaSave, FaTimes } from "react-icons/fa";

function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [editMode, setEditMode] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      const res = await API.get("/customers/");
      setCustomers(res.data);
    } catch (err) { console.error("❌ Error fetching customers:", err); }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddCustomer = async () => {
    if (!form.name || !form.phone) {
      alert("Name and Phone are required!");
      return;
    }
    try {
      await API.post("/customers/", form);
      setForm({ name: "", email: "", phone: "", address: "" });
      fetchCustomers();
      alert("Customer Added Successfully!");
    } catch (err) { console.error("❌ Error adding customer:", err); }
  };

  const openEditModal = (customer) => {
    setForm({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone,
      address: customer.address || "",
    });
    setEditingCustomerId(customer.id);
    setEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleUpdateCustomer = async () => {
    try {
      await API.put(`/customers/${editingCustomerId}/`, form);
      setEditMode(false);
      setForm({ name: "", email: "", phone: "", address: "" });
      fetchCustomers();
      alert("Customer Updated!");
    } catch (err) { console.error("❌ Error updating customer:", err); }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await API.delete(`/customers/${id}/`);
      fetchCustomers();
    } catch (err) { console.error("❌ Error deleting customer:", err); }
  };

  const exportToExcel = () => {
    const sheetData = customers.map((c) => ({
      ID: c.id, Name: c.name, Email: c.email, Phone: c.phone, Address: c.address
    }));
    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, "Customer_List.xlsx");
  };

  return (
    <div className="customer-container">
      <div className="customer-header">
        <h2 className="title">📇 Customer Management</h2>
        <button className="export-btn" onClick={exportToExcel}>
          <FaFileExcel style={{marginRight: '8px'}}/> Export Excel
        </button>
      </div>

      <div className="customer-form-card">
        <h3>{editMode ? "✏️ Edit Customer" : "➕ Add New Customer"}</h3>
        <div className="customer-form">
          <input type="text" name="name" placeholder="Name *" value={form.name} onChange={handleChange} />
          <input type="text" name="phone" placeholder="Phone *" value={form.phone} onChange={handleChange} />
          <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
          
          <textarea 
            name="address" 
            placeholder="Complete Address" 
            value={form.address} 
            onChange={handleChange} 
            rows="2"
            style={{gridColumn: "span 2", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none"}} 
          />
          
          <div className="form-actions" style={{gridColumn: "span 2", display: "flex", gap: "10px"}}>
            <button className="add-btn" onClick={editMode ? handleUpdateCustomer : handleAddCustomer}>
              {editMode ? <><FaSave/> Update Customer</> : <><FaPlus/> Save Customer</>}
            </button>
            {editMode && (
              <button className="cancel-btn" onClick={() => { setEditMode(false); setForm({name:"", email:"", phone:"", address:""})}}>
                <FaTimes/> Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="customer-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th> 
              <th style={{textAlign: 'center'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((c) => (
                <tr key={c.id}>
                  <td style={{fontWeight: '600'}}>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.email || "-"}</td>
                  <td className="address-cell">{c.address || "-"}</td> 
                  <td style={{textAlign: 'center'}}>
                    <button className="action-btn edit" onClick={() => openEditModal(c)} title="Edit"><FaEdit/></button>
                    <button className="action-btn delete" onClick={() => handleDeleteCustomer(c.id)} title="Delete"><FaTrash/></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerPage;