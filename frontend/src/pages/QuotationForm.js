import React, { useState, useEffect } from "react";
import API from "../services/api";
import "./QuotationForm.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function QuotationForm() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);


  const [popupOpen, setPopupOpen] = useState(false);
  const [popupProduct, setPopupProduct] = useState(null);
  const [popupQty, setPopupQty] = useState(1);


  const [multiPopupOpen, setMultiPopupOpen] = useState(false);
  const [selectedMultiProducts, setSelectedMultiProducts] = useState({}); 


  
  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await API.get("/products/");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Product Fetch Error:", err);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await API.get("/customers/");
      setCustomers(res.data || []);
    } catch (err) {
      console.error("Customer Fetch Error:", err);
    }
  };

  const openPopupSingle = (product) => {
    setPopupProduct(product);
    setPopupQty(1);
    setPopupOpen(true);
  };

  const confirmAddProduct = () => {
    if (!popupProduct) return;
    const exists = items.find((i) => i.id === popupProduct.id);
    if (exists) {
      alert("Already added! Change quantity below.");
      setPopupOpen(false);
      return;
    }

    const newItem = { ...popupProduct, qty: popupQty || 1 };
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    recalcTotal(updatedItems);
    setPopupOpen(false);
  };


  const openMultiPopup = () => {
    const initial = {};
    products.forEach(p => {
      initial[p.id] = { selected: false, qty: 1 };
    });
    setSelectedMultiProducts(initial);
    setMultiPopupOpen(true);
  };

  const toggleMultiSelect = (id, checked) => {
    setSelectedMultiProducts(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), selected: checked, qty: prev[id]?.qty || 1 }
    }));
  };

  const setMultiQty = (id, qty) => {
    setSelectedMultiProducts(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), qty: qty < 1 ? 1 : qty }
    }));
  };

  const confirmMultiAdd = () => {
    const selectedIds = Object.keys(selectedMultiProducts).filter(id => selectedMultiProducts[id].selected);
    if (selectedIds.length === 0) {
      alert("Select at least one product.");
      return;
    }

    const newItems = [];
    selectedIds.forEach(idStr => {
      const id = Number(idStr);
      const product = products.find(p => p.id === id);
      if (!product) return;
      const qty = Number(selectedMultiProducts[id].qty) || 1;
    
      if (items.find(i => i.id === product.id)) return;
      newItems.push({ ...product, qty });
    });

    if (newItems.length === 0) {
      alert("Selected products are already added in the quotation.");
      setMultiPopupOpen(false);
      return;
    }

    const updatedItems = [...items, ...newItems];
    setItems(updatedItems);
    recalcTotal(updatedItems);
    setMultiPopupOpen(false);
  };

 
  const updateQty = (id, qty) => {
    const updated = items.map(it => it.id === id ? { ...it, qty: qty < 1 ? 1 : qty } : it);
    setItems(updated);
    recalcTotal(updated);
  };

  const removeItem = (id) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    recalcTotal(updated);
  };

  const recalcTotal = (itemList) => {
    const t = itemList.reduce((acc, p) => {
      const price = parseFloat(p.selling_price_include_tax || p.selling_price || 0) || 0;
      const qty = Number(p.qty) || 0;
      return acc + price * qty;
    }, 0);
    setTotal(t);
  };

  const sendQuotation = async () => {
    if (!selectedCustomer) return alert("Select a customer!");
    if (items.length === 0) return alert("Add a product!");

    const customer = customers.find(c => c.id === Number(selectedCustomer));
    if (!customer) return alert("Customer not found!");

    let msg = `*📄 QUOTATION*\n\n`;
    msg += `*Customer:* ${customer.name}\n`;
    msg += `*Phone:* ${customer.phone}\n\n`;
    msg += `*Product | Model | Qty | Amount*\n`;
    msg += `--------------------------------\n`;

    items.forEach((p) => {
      const price = parseFloat(p.selling_price_include_tax || p.selling_price || 0) || 0;
      msg += `${p.product_name} | ${p.model_no || "-"} | ${p.qty} | ₹${(price * p.qty).toFixed(2)}\n`;
    });

    msg += `\n*Grand Total:* ₹${total.toFixed(2)}`;

  
    window.open(`https://wa.me/${customer.phone}?text=${encodeURIComponent(msg)}`, "_blank");

    try {
      await API.post("/quotations/", {
        customer: selectedCustomer,
        total_amount: total,
        items: items.map(i => ({ product: i.id, quantity: i.qty }))
      });
      alert("Quotation saved!");
    } catch (err) {
      console.error("Save quotation error:", err);
      alert("Saved failed — check console.");
    }
  };

 
  const exportExcel = () => {
    if (!selectedCustomer) return alert("Select customer first!");
    if (items.length === 0) return alert("Add products!");

    const customer = customers.find((c) => c.id === Number(selectedCustomer));
    const data = [
      ["Customer", customer.name],
      ["Phone", customer.phone],
      [],
      ["Product", "Model", "Price", "Qty", "Total"]
    ];
    items.forEach(p => {
      const price = parseFloat(p.selling_price_include_tax || p.selling_price || 0) || 0;
      data.push([p.product_name, p.model_no || "-", price, p.qty, (price * p.qty).toFixed(2)]);
    });
    data.push([]);
    data.push(["Grand Total", total.toFixed(2)]);

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quotation");
    XLSX.writeFile(wb, "quotation.xlsx");
  };

  const exportPDF = () => {
    if (!selectedCustomer) return alert("Select customer first!");
    if (items.length === 0) return alert("Add products!");

    const customer = customers.find((c) => c.id === Number(selectedCustomer));
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Quotation", 14, 15);
    doc.setFontSize(12);
    doc.text(`Customer: ${customer.name}`, 14, 25);
    doc.text(`Phone: ${customer.phone}`, 14, 33);

    autoTable(doc, {
      startY: 45,
      head: [["Product", "Model", "Price", "Qty", "Total"]],
      body: items.map(p => {
        const price = parseFloat(p.selling_price_include_tax || p.selling_price || 0) || 0;
        return [p.product_name, p.model_no || "-", price, p.qty, (price * p.qty).toFixed(2)];
      })
    });

    const finalY = doc.lastAutoTable?.finalY || 80;
    doc.text(`Grand Total: ₹${total.toFixed(2)}`, 14, finalY + 10);
    doc.save("quotation.pdf");
  };


  return (
    <div className="quotation-container">
      <h2>Create Quotation</h2>

      <div className="customer-box">
        <label>Select Customer:</label>
        <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
          <option value="">Choose</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
        </select>

        <div style={{ marginTop: 10 }}>
          <button className="multi-add-btn" onClick={openMultiPopup}>➕ Add Multiple Products</button>
        </div>
      </div>

      <h3>Products</h3>
      <table className="product-table1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Model</th>
            <th>Price</th>
            <th>GST%</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.product_name}</td>
              <td>{p.model_no || "-"}</td>
              <td>₹{(parseFloat(p.selling_price_include_tax || p.selling_price || 0) || 0).toFixed(2)}</td>
              <td>{p.gst_percent ? `${parseFloat(p.gst_percent)}%` : "0%"}</td>
              <td>
                <button onClick={() => openPopupSingle(p)} className="add-btn">Add to Quotation</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Selected Products</h3>
      {items.length === 0 ? <p>No products added.</p> :
        <table className="selected-table1">
          <thead>
            <tr>
              <th>Name</th>
              <th>Model</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const price = parseFloat(item.selling_price_include_tax || item.selling_price || 0) || 0;
              return (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>{item.model_no || "-"}</td>
                  <td>₹{price.toFixed(2)}</td>
                  <td>
                    <input className="qty-input" type="number" min="1" value={item.qty} onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)} />
                  </td>
                  <td>₹{(price * item.qty).toFixed(2)}</td>
                  <td>
                    <button className="delete-btn1" onClick={() => removeItem(item.id)}>X</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      }

      <div className="export-buttons">
        <button className="excel-btn" onClick={exportExcel}>Export Excel</button>
        <button className="pdf-btn" onClick={exportPDF}>Export PDF</button>
      </div>

      <h2 className="total">Total: ₹{total.toFixed(2)}</h2>

      <button className="send-btn" onClick={sendQuotation}>Send WhatsApp & Save</button>

      {popupOpen && popupProduct && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Add Product</h3>
            <p><strong>{popupProduct.product_name}</strong></p>
            <p>Model: {popupProduct.model_no || "-"}</p>
            <p>Price: ₹{(parseFloat(popupProduct.selling_price_include_tax || popupProduct.selling_price || 0) || 0).toFixed(2)}</p>

            <label>Quantity:</label>
            <input type="number" min="1" className="popup-input" value={popupQty} onChange={(e) => setPopupQty(parseInt(e.target.value) || 1)} />

            <div className="popup-buttons">
              <button className="cancel-btn" onClick={() => setPopupOpen(false)}>Cancel</button>
              <button className="confirm-btn" onClick={confirmAddProduct}>Add</button>
            </div>
          </div>
        </div>
      )}

     
      {multiPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-box multi-popup">
            <h3>Select Products</h3>

            <div className="multi-table-wrap">
              <table className="multi-table">
                <thead>
                  <tr>
                    <th style={{width: 60}}>Select</th>
                    <th>Name</th>
                    <th>Model</th>
                    <th>Price</th>
                    <th style={{width:100}}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const sel = selectedMultiProducts[p.id] || { selected: false, qty: 1};
                    return (
                      <tr key={p.id}>
                        <td>
                          <input type="checkbox" checked={sel.selected} onChange={(e) => toggleMultiSelect(p.id, e.target.checked)} />
                        </td>
                        <td style={{fontWeight:600}}>{p.product_name}</td>
                        <td>{p.model_no || "-"}</td>
                        <td>₹{(parseFloat(p.selling_price_include_tax || p.selling_price || 0) || 0).toFixed(2)}</td>
                        <td>
                          <input type="number" min="1" value={sel.qty} onChange={(e) => setMultiQty(p.id, parseInt(e.target.value) || 1)} className="multi-qty-input" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="popup-buttons">
              <button className="cancel-btn" onClick={() => setMultiPopupOpen(false)}>Cancel</button>
              <button className="confirm-btn" onClick={confirmMultiAdd}>Add Selected</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default QuotationForm;