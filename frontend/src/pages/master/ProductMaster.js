import React, { useState, useEffect } from "react";
import API from "../../services/api"; 
import "./ProductMaster.css";

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const emptyForm = {
    product_id: "",
    product_name: "",
    hsn_code: "", 
    selling_price_include_tax: 0,
    mrp: 0,
    gst_percent: 0,
    stock_qty: 0,
    unit_of_measurement: "PCS"
  };

  const [formData, setFormData] = useState(emptyForm);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products/");
      setProducts(res.data);
    } catch (error) { alert("Backend Connection Error!"); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const calculateTaxable = (total, gst) => {
    const taxable = total / (1 + (gst / 100));
    return taxable.toFixed(2);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will be permanent.`)) {
      try {
        await API.delete(`/products/${id}/`);
        alert("Product deleted permanently!");
        fetchProducts(); 
      } catch (err) {
        console.error("Delete Error:", err.response?.data);
        alert("Failed to delete the product!");
      }
    }
  };

  const handleSaveProduct = async () => {
    const finalFormData = {
        ...formData,
        product_id: formData.product_id || `PROD-${Date.now()}` 
    };

    try {
        if (isEdit) {
            await API.put(`/products/${editId}/`, finalFormData);
            alert("Product Updated!");
        } else {
            await API.post("/products/", finalFormData);
            alert("Product Saved!");
        }
        setShowForm(false);
        setFormData(emptyForm);
        fetchProducts();
    } catch (err) {
        console.log("Error details:", err.response?.data);
        alert(JSON.stringify(err.response?.data) || "Save failed!");
    }
  };

  const handleEdit = (product) => {
    setIsEdit(true);
    setEditId(product.id);
    setFormData({ ...product });
    setShowForm(true);
  };

  return (
    <div className="product-page">
      <div className="header-flex">
        <h2>📦 Product Inventory Master</h2>
        <button className="add-btn" onClick={() => { setIsEdit(false); setFormData(emptyForm); setShowForm(true); }}>
          ➕ Add New Item
        </button>
      </div>

      <div className="filter-bar">
        <input 
          type="text" 
          placeholder="🔍 Search by Name or HSN..." 
          className="search-box1" 
          onChange={(e) => setSearchText(e.target.value)} 
        />
      </div>

      <div className="table-container">
        <table className="product-table">
          <thead>
            <tr>
              <th>SR.</th>
              <th>Product / HSN</th>
              <th>UOM</th>
              <th>Stock</th>
              <th>Price (Inc. Tax)</th>
              <th>Taxable Val</th>
              <th>GST %</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.filter(p => 
              p.product_name.toLowerCase().includes(searchText.toLowerCase()) || 
              (p.hsn_code && p.hsn_code.includes(searchText))
            ).map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>
                <td>
                  <strong>{p.product_name}</strong><br/>
                  <small className="hsn-tag">HSN: {p.hsn_code || 'N/A'}</small>
                </td>
                <td>{p.unit_of_measurement}</td>
                <td className={p.stock_qty < 5 ? "stock-low" : "stock-ok"}>{p.stock_qty}</td>
                <td>₹{p.selling_price_include_tax}</td>
                <td>₹{calculateTaxable(p.selling_price_include_tax, p.gst_percent)}</td>
                <td>{p.gst_percent}%</td>
                <td>
                  <button className="edit-icon-btn" title="Edit" onClick={() => handleEdit(p)}>✏️</button>
                  <button className="del-icon-btn" title="Delete" onClick={() => handleDelete(p.id, p.product_name)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box large">
            <h3>{isEdit ? "Update Product Details" : "Register New Product"}</h3>
            <div className="modal-grid">
              <div className="input-group">
                <label>Product Name *</label>
                <input type="text" value={formData.product_name} onChange={(e) => setFormData({...formData, product_name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>HSN/SAC Code</label>
                <input type="text" value={formData.hsn_code} onChange={(e) => setFormData({...formData, hsn_code: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Unit (UOM)</label>
                <select value={formData.unit_of_measurement} onChange={(e) => setFormData({...formData, unit_of_measurement: e.target.value})}>
                  <option value="PCS">PCS</option>
                  <option value="KG">KG</option>
                  <option value="NOS">NOS</option>
                  <option value="BOX">BOX</option>
                </select>
              </div>
              <div className="input-group">
                <label>MRP (Rs)</label>
                <input type="number" value={formData.mrp} onChange={(e) => setFormData({...formData, mrp: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Selling Price (Inc. Tax) *</label>
                <input type="number" value={formData.selling_price_include_tax} onChange={(e) => setFormData({...formData, selling_price_include_tax: e.target.value})} />
              </div>
              <div className="input-group">
                <label>GST %</label>
                <select value={formData.gst_percent} onChange={(e) => setFormData({...formData, gst_percent: e.target.value})}>
                  <option value="0">0% (Exempted)</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
              <div className="input-group">
                <label>Initial Stock</label>
                <input type="number" value={formData.stock_qty} onChange={(e) => setFormData({...formData, stock_qty: e.target.value})} />
              </div>
            </div>

            <div className="tax-summary-mini">
               <span>Taxable Amt: ₹{calculateTaxable(formData.selling_price_include_tax, formData.gst_percent)}</span>
               <span>GST Split (CGST+SGST): {formData.gst_percent/2}% + {formData.gst_percent/2}%</span>
            </div>

            <div className="modal-actions">
              <button onClick={handleSaveProduct} className="save-btn1">Save Product</button>
              <button onClick={() => setShowForm(false)} className="cancel-btn">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;

