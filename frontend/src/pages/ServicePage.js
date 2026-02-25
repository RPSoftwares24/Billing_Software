import React, { useState, useEffect } from "react";
import "./ServicePage.css";
import API from "../services/api";


function ServicePage() {
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    customer: "",
    phone: "",
    address: "",
    callFor: "",
    status: "Followup",
    amount: "",
    notes: ""
  });

  const [searchCustomer, setSearchCustomer] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [editId, setEditId] = useState(null);

  const [statusPage, setStatusPage] = useState(0);
  const [setSelectedCustomer] = useState(null);
  const [setShowCustomerHistory] = useState(false);
  const [selectedCustomerFullDetails, setSelectedCustomerFullDetails] = useState(null);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setForm((prev) => ({ ...prev, customer: customer.id, phone: customer.phone, address: customer.address }));
    setShowCustomerHistory(true);
    setSearchCustomer(customer.name);
    setFilteredCustomers([]);
  };

  const openCustomerFullDetails = (customerId) => {
    setSelectedCustomerFullDetails(customerId);
  };

  useEffect(() => {
    fetchServices();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchCustomer.trim() === "") return setFilteredCustomers([]);
    const filtered = customers.filter((c) =>
      c.name.toLowerCase().includes(searchCustomer.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchCustomer, customers]);

  const fetchServices = async () => {
    try {
      const res = await fetch("http://192.168.1.44:8000/api/services/");
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch("http://192.168.1.44:8000/api/customers/");
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  const STATUS_GROUPS = [
    { key: "Followup", label: "Followup", color: "#007bff" },
    { key: "Sitevisit", label: "Site Visit", color: "#8442eeff" },
    { key: "Confirmed", label: "Confirmed", color: "#28a745" },
    { key: "Progress", label: "In Progress", color: "#17a2b8" },
    { key: "Completed", label: "Completed", color: "#6c757d" },
    { key: "Service", label: "Service", color: "#fd7e14" },
    { key: "Repair/Claiming", label: "Repair/Claiming", color: "#dc3545" },
    { key: "Site Checkup", label: "Site Checkup", color: "#20c997" }
  ];

  const visibleStatuses = STATUS_GROUPS.slice(statusPage * 4, statusPage * 4 + 4);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleEdit = (service) => {
    setEditId(service.id);
    setForm({
      customer: service.customer,
      phone: service.phone,
      address: service.address,
      callFor: service.call_for,
      status: service.status,
      amount: service.amount,
      notes: service.notes
    });
    setSearchCustomer(service.customer_details?.name || "");
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;

    try {
      await fetch(`http://192.168.1.44:8000/api/services/${id}/`, {
        method: "DELETE"
      });
      fetchServices();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleSave = async () => {
    if (!form.customer) return alert("Select a customer");

    const payload = {
      customer: form.customer,
      phone: form.phone,
      address: form.address,
      call_for: form.callFor,
      status: form.status,
      amount: parseFloat(form.amount || 0),
      notes: form.notes
    };

    try {
      let res;
      if (editId) {
        res = await fetch(`http://192.168.1.44:8000/api/services/${editId}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("http://192.168.1.44:8000/api/services/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        fetchServices();
        setForm({
          customer: "",
          phone: "",
          address: "",
          callFor: "",
          status: "Followup",
          amount: "",
          notes: ""
        });
        setSearchCustomer("");
        setEditId(null);
        setShowAddForm(false);
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <div className="service-page-container">

      <div className="top-header">
        <h2>Services</h2>
        <button className="open-form-btn" onClick={() => setShowAddForm(true)}>
          + Add Service
        </button>
      </div>

      <div className="status-header">
        <h3>Status Overview</h3>

        <div className="status-arrows">
          {statusPage > 0 && (
            <button onClick={() => setStatusPage(statusPage - 1)}>⟨</button>
          )}
          {statusPage < 1 && (
            <button onClick={() => setStatusPage(statusPage + 1)}>⟩</button>
          )}
        </div>
      </div>

      <div className="status-grid-container">
        {visibleStatuses.map(({ key, label, color }) => {
          const filtered = services.filter((s) => s.status === key);
          return (
            <div key={key} className="status-grid-item" style={{ borderColor: color }}>
              <h3 style={{ color }}>{label}</h3>
              <p><b>Total:</b> {filtered.length}</p>

              {filtered.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="status-grid-summary clickable"
                  onClick={() => openCustomerFullDetails(s.customer)}
                >
                  <div><b>Customer:</b> {s.customer_details?.name}</div>
                  <div><b>Created:</b> {new Date(s.created_on).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {selectedCustomerFullDetails && (
        <div className="customer-history-box">
          <h3>Customer Full Details</h3>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Notes</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {services
                .filter((s) => s.customer === selectedCustomerFullDetails)
                .map((s) => (
                  <tr key={s.id}>
                    <td>{s.customer_details?.name}</td>
                    <td>{s.phone}</td>
                    <td>{s.address}</td>
                    <td>{s.status}</td>
                    <td>₹ {s.amount}</td>
                    <td>{s.notes}</td>
                    <td>{new Date(s.created_on).toLocaleDateString()}</td>
                    <td>{new Date(s.updated_on).toLocaleDateString()}</td>

                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(s)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <h2>{editId ? "Edit Service" : "Add Service"}</h2>
            <button className="modal-close" onClick={() => setShowAddForm(false)}>X</button>

            <input
              type="text"
              placeholder="Search Customer"
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
              autoComplete="off"
            />

            {filteredCustomers.length > 0 && (
              <ul className="suggestions-list">
                {filteredCustomers.map((cust) => (
                  <li key={cust.id} onClick={() => handleSelectCustomer(cust)}>
                    {cust.name} ({cust.phone})
                  </li>
                ))}
              </ul>
            )}

            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />

            <select name="status" value={form.status} onChange={handleChange}>
              {STATUS_GROUPS.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <input type="date" name="callFor" value={form.callFor} onChange={handleChange} />
            <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} />
            <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />

            <button className="save-btn" onClick={handleSave}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServicePage;