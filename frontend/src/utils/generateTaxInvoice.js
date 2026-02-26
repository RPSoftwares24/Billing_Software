import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../services/api";

const generateTaxInvoice = async (billId, isPrint = false) => {
  try {
    const res = await API.get(`/bills/${billId}/`);
    const bill = res.data;

    if (!bill || !bill.items || bill.items.length === 0) {
      alert("Bill data missing");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("RP SMART ENERGY", 14, 15);

    doc.setFontSize(10);
    doc.text("TAX INVOICE", 150, 15);

    doc.text(`Invoice No: ${bill.bill_no}`, 150, 22);
    doc.text(`Customer: ${bill.customer_name}`, 14, 40);

    let totalGST = 0;
    let grandTotal = 0;

    const rows = bill.items.map((item, index) => {
      const qty = Number(item.qty);
      const price = Number(item.price);
      const gst = Number(item.gst_percent);

      const taxable = qty * price;
      const gstAmount = taxable * gst / 100;
      const total = taxable + gstAmount;

      totalGST += gstAmount;
      grandTotal += total;

      return [
        index + 1,
        item.product_name,
        item.hsn_code,
        qty,
        price.toFixed(2),
        gst + "%",
        total.toFixed(2)
      ];
    });

    autoTable(doc, {
      startY: 60,
      head: [["S.No", "Product", "HSN", "Qty", "Rate", "GST", "Total"]],
      body: rows
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.text(`Total GST: ₹${totalGST.toFixed(2)}`, 140, finalY);
    doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 140, finalY + 6);

    if (isPrint) {
      doc.autoPrint();
      window.open(doc.output("bloburl"));
    } else {
      doc.save(`${bill.bill_no}.pdf`);
    }

  } catch (error) {
    console.error(error);
    alert("Invoice generation failed");
  }
};

export default generateTaxInvoice;
