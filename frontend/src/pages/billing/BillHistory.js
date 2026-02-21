import React, { useState, useEffect } from "react";
import API from "../../services/api";
import "./BillHistory.css";
import { FaPrint, FaEye, FaSearch, FaCalendarAlt, FaTimes, FaSync } from "react-icons/fa";

function BillHistory() {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await API.get("/bills/");
      const data = Array.isArray(res.data) ? [...res.data].reverse() : [];
      setBills(data);
      setFilteredBills(data);
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = bills;
    if (searchTerm) {
      result = result.filter(
        (b) =>
          b.bill_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedDate) {
      result = result.filter((b) => b.created_at?.includes(selectedDate));
    }
    setFilteredBills(result);
  }, [searchTerm, selectedDate, bills]);

  const handleViewBill = async (billId) => {
    try {
      const res = await API.get(`/bills/${billId}/`);
      setSelectedBill(res.data);
      setShowModal(true);
    } catch (error) {
      alert("Can't load the Bill details!");
    }
  };

  const handlePrint = async (billId) => {
    try {
      const response = await API.get(`/bills/${billId}/`);
      const bill = response.data;

      const billItems = bill.items || bill.bill_items || [];
      
      let itemsHTML = "";
      let totalTaxableValue = 0;
      let totalGSTAmount = 0;

      if (billItems.length > 0) {
        itemsHTML = billItems.map((item, index) => {
          const qty = parseFloat(item.qty || 0);
          const price = parseFloat(item.price || 0);
          const gstRate = parseFloat(item.gst_percent || 0);
          
          const lineTotal = qty * price;
          const taxableValue = lineTotal / (1 + gstRate / 100);
          const gstAmt = lineTotal - taxableValue;

          totalTaxableValue += taxableValue;
          totalGSTAmount += gstAmt;

          return `
            <tr class="item-row">
              <td style="text-align: center;">${index + 1}</td>
              <td style="text-align: left;"><strong>${item.product_name}</strong></td>
              <td style="text-align: center;">${qty}</td>
              <td style="text-align: right;">${price.toFixed(2)}</td>
              <td style="text-align: center;">${gstRate}%</td>
              <td style="text-align: right;">${lineTotal.toFixed(2)}</td>
            </tr>
          `;
        }).join('');
      }

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Tax Invoice - ${bill.bill_no}</title>
            <style>
              @page { size: A4; margin: 20mm; }
              body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #333; margin: 0; padding: 0; }
              .invoice-card { width: 100%; background: #fff; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
              .store-details h1 { margin: 0; font-size: 24px; color: #000; }
              .invoice-title { text-align: right; }
              .invoice-title h2 { margin: 0; font-size: 22px; color: #444; }
              
              .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; line-height: 1.6; }
              .bill-to, .bill-info { width: 48%; }
              
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th { background: #f5f5f5; border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold; }
              td { border: 1px solid #000; padding: 10px; }
              
              .totals-wrapper { display: flex; justify-content: flex-end; }
              .totals-table { width: 35%; border: none; }
              .totals-table td { border: none; padding: 5px; text-align: right; }
              .grand-total { border-top: 2px solid #000 !important; font-size: 16px; font-weight: bold; padding-top: 10px !important; }
              
              .footer { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; text-align: center; font-style: italic; }
              .seal { margin-top: 40px; display: flex; justify-content: flex-end; }
              .signature { width: 150px; border-top: 1px solid #000; text-align: center; padding-top: 5px; }

              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-card">
              <div class="header">
                <div class="store-details">
                  <h1>SUPER MARKET PRO</h1>
                  <p>123, Commercial Road, Tiruppur, Tamil Nadu<br/>
                  <strong>GSTIN:</strong> 33AAAAA0000A1Z5<br/>
                  <strong>Phone:</strong> +91 98765 43210</p>
                </div>
                <div class="invoice-title">
                  <h2>TAX INVOICE</h2>
                  <p>Original For Recipient</p>
                </div>
              </div>

              <div class="info-section">
                <div class="bill-to">
                  <strong>Billed To:</strong><br/>
                  Name: ${bill.customer_name || "Walk-in Customer"}<br/>
                  Contact: ${bill.customer_phone || "N/A"}
                </div>
                <div class="bill-info">
                  <strong>Invoice No:</strong> ${bill.bill_no}<br/>
                  <strong>Date:</strong> ${new Date(bill.created_at).toLocaleDateString('en-IN')}<br/>
                  <strong>Payment Mode:</strong> ${bill.payment_mode}
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th style="width: 5%;">S.No</th>
                    <th style="width: 45%;">Description of Goods</th>
                    <th style="width: 10%;">Qty</th>
                    <th style="width: 15%;">Unit Price (₹)</th>
                    <th style="width: 10%;">GST %</th>
                    <th style="width: 15%;">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>

              <div class="totals-wrapper">
                <table class="totals-table">
                  <tr>
                    <td>Taxable Value:</td>
                    <td>₹${totalTaxableValue.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>CGST (Output):</td>
                    <td>₹${(totalGSTAmount / 2).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>SGST (Output):</td>
                    <td>₹${(totalGSTAmount / 2).toFixed(2)}</td>
                  </tr>
                  <tr class="grand-total">
                    <td>Grand Total:</td>
                    <td>₹${parseFloat(bill.total_amount).toFixed(2)}</td>
                  </tr>
                </table>
              </div>

              <div style="margin-top: 20px;">
                <strong>Amount in Words:</strong><br/>
                Rupees ${numberToWords(bill.total_amount)} Only
              </div>

              <div class="seal">
                <div class="signature">
                  Authorized Signatory
                </div>
              </div>

              <div class="footer">
                <p>Terms: Goods once sold will not be taken back. This is a computer generated Tax Invoice.</p>
                <h3>Thank You! Visit Again!</h3>
              </div>
            </div>

            <script>
              window.onload = function() { 
                window.print(); 
                setTimeout(() => { window.close(); }, 500); 
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error("Print Error:", error);
      alert("Error: A4 Invoice create panna mudiyala. Console check pannunga.");
    }
  };

  const numberToWords = (num) => {
    return "Indian Rupees " + num; 
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>📊 Sales History & Reports</h2>
        <div className="history-stats">
          <div className="stat-card">
            <span>Total Bills</span>
            <strong>{filteredBills.length}</strong>
          </div>
          <div className="stat-card">
            <span>Total Sales</span>
            <strong>₹{filteredBills.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0).toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="search-bar">
          <FaSearch className="icon" />
          <input
            type="text"
            placeholder="Search Bill No or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="date-picker">
          <FaCalendarAlt className="icon" />
          <input type="date" onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
        <button className="refresh-btn" onClick={fetchBills}>
          <FaSync /> Refresh
        </button>
      </div>

      <div className="table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Bill No</th>
              <th>Customer</th>
              <th>Payment</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center">Loading Bills...</td></tr>
            ) : filteredBills.length > 0 ? (
              filteredBills.map((bill) => (
                <tr key={bill.id}>
                  <td>{new Date(bill.created_at).toLocaleString()}</td>
                  <td><span className="bill-tag">{bill.bill_no}</span></td>
                  <td>{bill.customer_name || "Walk-in Customer"}</td>
                  <td><span className={`pay-status ${bill.payment_mode?.toLowerCase()}`}>{bill.payment_mode}</span></td>
                  <td><strong>₹{bill.total_amount}</strong></td>
                  <td className="actions">
                    <button title="View Details" className="view-btn" onClick={() => handleViewBill(bill.id)}><FaEye /></button>
                    <button title="Print Receipt" className="print-btn" onClick={() => handlePrint(bill.id)}><FaPrint /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="text-center">No bills found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedBill && (
        <div className="modal-overlay">
          <div className="view-bill-modal">
            <div className="modal-header">
              <h3>Invoice: {selectedBill.bill_no}</h3>
              <FaTimes className="close-icon" onClick={() => setShowModal(false)} />
            </div>
            <div className="modal-body">
              <div className="bill-meta">
                <p><strong>Customer:</strong> {selectedBill.customer_name || "Walk-in"}</p>
                <p><strong>Date:</strong> {new Date(selectedBill.created_at).toLocaleString()}</p>
                <p><strong>Payment Mode:</strong> {selectedBill.payment_mode}</p>
              </div>
              <table className="modal-item-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>GST</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedBill.items || selectedBill.bill_items || []).map((item, index) => (
                    <tr key={index}>
                      <td>{item.product_name}</td>
                      <td>{item.qty}</td>
                      <td>₹{parseFloat(item.price).toFixed(2)}</td>
                      <td>{item.gst_percent}%</td>
                      <td>₹{(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="modal-footer">
                <div className="final-total">
                  <span>Grand Total:</span>
                  <h2>₹{selectedBill.total_amount}</h2>
                </div>
                <button className="modal-print-btn" onClick={() => handlePrint(selectedBill.id)}>
                  <FaPrint /> Print Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillHistory;