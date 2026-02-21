import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import "./BillingForm.css";
import { FaTrash, FaPlus, FaMinus, FaUserPlus, FaTimes } from "react-icons/fa";

function numberToWords(num) {
    const a = ['', 'ONE ', 'TWO ', 'THREE ', 'FOUR ', 'FIVE ', 'SIX ', 'SEVEN ', 'EIGHT ', 'NINE ', 'TEN ', 'ELEVEN ', 'TWELVE ', 'THIRTEEN ', 'FOURTEEN ', 'FIFTEEN ', 'SIXTEEN ', 'SEVENTEEN ', 'EIGHTEEN ', 'NINETEEN '];
    const b = ['', '', 'TWENTY ', 'THIRTY ', 'FORTY ', 'FIFTY ', 'SIXTY ', 'SEVENTY ', 'EIGHTY ', 'NINETY '];

    const convert = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + a[n % 10];
        if (n < 1000) return a[Math.floor(n / 100)] + 'HUNDRED ' + (n % 100 !== 0 ? 'AND ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + 'THOUSAND ' + (n % 1000 !== 0 ? convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + 'LAKH ' + (n % 100000 !== 0 ? convert(n % 100000) : '');
        return convert(Math.floor(n / 10000000)) + 'CRORE ' + (n % 10000000 !== 0 ? convert(n % 10000000) : '');
    };

    if (num === 0) return "ZERO RUPEES ONLY";
    return convert(Math.floor(num)) + "RUPEES ONLY";
}

function BillingForm() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [showCheckout, setShowCheckout] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // New States for Add Customer with Address
  const [showCustModal, setShowCustModal] = useState(false);
  const [newCust, setNewCust] = useState({ name: "", phone: "", email: "", address: "" });

  const searchInputRef = useRef(null);

  useEffect(() => {
    loadData();
    searchInputRef.current?.focus();
  }, []);

  const loadData = async () => {
    try {
      const [p, c] = await Promise.all([API.get("/products/"), API.get("/customers/")]);
      setProducts(p.data);
      setCustomers(c.data);
    } catch (e) { console.error("Load Error", e); }
  };

  const handleAddCustomer = async () => {
    if (!newCust.name || !newCust.phone) return alert("Enter at least Name and Phone!");
    try {
      const res = await API.post("/customers/", newCust);
      alert("Customer Added Successfully!");
      setCustomers([...customers, res.data]); 
      setSelectedCustomer(res.data.id); 
      setShowCustModal(false);
      setNewCust({ name: "", phone: "", email: "", address: "" }); // Form Reset
    } catch (err) { 
      console.error(err);
      alert("Error adding customer!"); 
    }
  };

  const addToCart = (product) => {
    const productId = product.id || product.product_id; 
    if (product.stock_qty <= 0) {
        alert("Stock empty! " + product.product_name);
        return;
    }
    const existing = cart.find(item => (item.id || item.product_id) === productId);
    if (existing) {
        setCart(cart.map(i => (i.id || i.product_id) === productId ? { ...i, qty: i.qty + 1 } : i));
    } else {
        setCart([...cart, { ...product, qty: 1 }]);
    }
    setSearchTerm(""); 
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const calculateTotals = () => {
    let totalTaxable = 0;
    let totalTax = 0;
    let grandTotal = 0;
    cart.forEach(item => {
      const priceIncTax = parseFloat(item.selling_price_include_tax || 0);
      const gstPercent = parseFloat(item.gst_percent || 0);
      const qty = item.qty;
      const taxableUnit = priceIncTax / (1 + (gstPercent / 100));
      const taxUnit = priceIncTax - taxableUnit;
      totalTaxable += taxableUnit * qty;
      totalTax += taxUnit * qty;
      grandTotal += priceIncTax * qty;
    });
    const roundedTotal = Math.round(grandTotal);
    return {
      taxable: totalTaxable.toFixed(2),
      tax: totalTax.toFixed(2),
      grandTotal: roundedTotal,
      totalInWords: numberToWords(roundedTotal)
    };
  };

  const totals = calculateTotals();

  const handleFinalSave = async () => {
    if (!selectedCustomer) return alert("Select Customer!");
    const billData = {
      bill_no: `INV-${Date.now()}`,
      customer: selectedCustomer,
      total_amount: totals.grandTotal,
      payment_mode: paymentMode,
      items: cart.map(i => ({ 
        product_id: i.id, 
        qty: i.qty,
        price: i.selling_price_include_tax,
        gst_percent: i.gst_percent         
      }))
    };
    try {
      await API.post("/bills/", billData);
      alert("Bill Saved Successfully!");
      setCart([]);
      setShowCheckout(false);
      setSelectedCustomer("");
    } catch (err) { alert(err.response?.data?.error || "Save Error"); }
  };

  return (
    <div className="pos-container">
      <div className="pos-header">
        <div className="search-section">
          <input 
            ref={searchInputRef}
            placeholder="Search Product..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <div className="search-results">
              {products.filter(p => p.product_name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                <div key={p.id} onClick={() => addToCart(p)}>
                  {p.product_name} - ₹{p.selling_price_include_tax}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="customer-selection-area">
            <select className="cust-select" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                <option value="">-- Choose Customer --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} | {c.phone}</option>)}
            </select>
            <button className="add-cust-inline-btn" title="Add New Customer" onClick={() => setShowCustModal(true)}>
                <FaUserPlus />
            </button>
        </div>
      </div>

      <div className="pos-content">
        <table className="bill-table"> 
          <thead>
            <tr>
              <th>SR.</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{item.product_name}</td>
                <td>
                    <button className="qty-btn" onClick={() => updateQty(item.id, -1)}><FaMinus/></button>
                    <span className="qty-val">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, 1)}><FaPlus/></button>
                </td>
                <td>{item.selling_price_include_tax}</td>
                <td>₹{(item.selling_price_include_tax * item.qty).toFixed(2)}</td>
                <td><FaTrash onClick={() => removeFromCart(item.id)} style={{cursor:'pointer', color:'red'}}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pos-footer-summary">
        <div className="tax-details">
          <p>Taxable: ₹{totals.taxable} | Tax: ₹{totals.tax}</p>
        </div>
        <div className="grand-total-section">
          <h1>₹{totals.grandTotal}</h1>
          <button className="checkout-btn" onClick={() => setShowCheckout(true)}>CHECKOUT</button>
        </div>
      </div>

      {/* --- ADD CUSTOMER MODAL WITH ADDRESS --- */}
      {showCustModal && (
          <div className="modal-overlay">
              <div className="modal-box small">
                  <div className="modal-header">
                      <h3>Add New Customer</h3>
                      <FaTimes onClick={() => setShowCustModal(false)} style={{cursor:'pointer'}}/>
                  </div>
                  <div className="modal-body">
                      <label>Customer Name</label>
                      <input type="text" placeholder="Full Name" value={newCust.name} onChange={(e)=>setNewCust({...newCust, name:e.target.value})} />
                      
                      <label>Phone Number</label>
                      <input type="text" placeholder="Mobile No" value={newCust.phone} onChange={(e)=>setNewCust({...newCust, phone:e.target.value})} />
                      
                      <label>Email</label>
                      <input type="email" placeholder="Email Address" value={newCust.email} onChange={(e)=>setNewCust({...newCust, email:e.target.value})} />

                      <label>Address</label>
                      <textarea 
                        placeholder="Customer Address..." 
                        rows="3"
                        style={{width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid #f1f5f9', outline: 'none'}}
                        value={newCust.address} 
                        onChange={(e)=>setNewCust({...newCust, address:e.target.value})} 
                      />
                  </div>
                  <div className="modal-actions">
                      <button className="save-btn1" onClick={handleAddCustomer}>Save & Select</button>
                      <button className="cancel-btn" onClick={() => setShowCustModal(false)}>Cancel</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- CHECKOUT MODAL --- */}
      {showCheckout && (
        <div className="modal-overlay">
          <div className="payment-modal">
            <h3>Finalize Payment</h3>
            <p>Total: ₹{totals.grandTotal}</p>
            <div className="pay-options">
               {["CASH", "ONLINE", "CREDIT"].map(mode => (
                 <button key={mode} className={paymentMode === mode ? "active" : ""} onClick={() => setPaymentMode(mode)}>{mode}</button>
               ))}
            </div>
            <button className="confirm-btn" onClick={handleFinalSave}>Confirm Sale</button>
            <button className="cancel-btn" onClick={() => setShowCheckout(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillingForm;