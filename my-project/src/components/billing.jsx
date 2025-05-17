import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "../styles/styles.css";

const API_BASE = "http://localhost:5000";

const Billing = () => {
  const [stockData, setStockData] = useState([]);
  const [billingDetails, setBillingDetails] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [productList, setProductList] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    price: "",
    totalPrice: 0,
  });
  const [customerInfo, setCustomerInfo] = useState({
    customerName: "",
    mobile: "",
  });
  const tableRef = useRef(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    fetchStockData();
    fetchBillingDetails();
  }, []);
    useEffect(() => {
    if (customerInfo.customerName) {
      const customerBills = billingDetails.filter(
        bill => bill.customerName === customerInfo.customerName
      );
      
      if (customerBills.length > 0) {
        // Get the most recent bill for this customer
        const latestBill = customerBills.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        )[0];
        
        setCustomerInfo(prev => ({
          ...prev,
          mobile: latestBill.mobile
        }));
      }
    }
  }, [customerInfo.customerName, billingDetails]);

  const fetchStockData = () => {
    axios.get(`${API_BASE}/stock`).then((res) => setStockData(res.data));
  };

  const fetchBillingDetails = () => {
    axios.get(`${API_BASE}/billing`).then((res) => {
      setBillingDetails(res.data);
      setTimeout(checkScrollHint, 100);
    });
  };

  const checkScrollHint = () => {
    const el = tableRef.current;
    setShowScrollHint(el && el.scrollHeight > el.clientHeight);
  };

  const handleItemChange = (e) => {
    const name = e.target.value;
    setSelectedItem(name);
    const item = stockData.find((item) => item.name === name);
    if (item) {
      setFormData({
        name: item.name,
        quantity: "",
        price: item.pricePerUnit || 0,
        totalPrice: 0,
      });
    }
  };

  const handleQuantityChange = (e) => {
    const quantity = parseInt(e.target.value, 10) || 0;
    setFormData((prev) => ({
      ...prev,
      quantity,
      totalPrice: prev.price * quantity,
    }));
  };

  const handlePriceChange = (e) => {
    const price = parseFloat(e.target.value) || 0;
    setFormData((prev) => ({
      ...prev,
      price,
      totalPrice: price * prev.quantity,
    }));
  };

  const handleMobileChange = (e) => {
    const input = e.target.value.replace(/\D/g, "");
    if (input.length <= 10) {
      setCustomerInfo((prev) => ({ ...prev, mobile: input }));
    }
  };

  const handleAddItem = () => {
    const { name, quantity, price } = formData;
    const { customerName, mobile } = customerInfo;
    const selectedStock = stockData.find((item) => item.name === name);

    if (!name || !quantity || !price || !customerName || !mobile) {
      alert("All fields are required.");
      return;
    }

    if (quantity <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }

    if (!selectedStock) {
      alert("Selected item not found in stock.");
      return;
    }

    if (quantity > selectedStock.quantity) {
      alert(`Insufficient stock for "${name}". Available: ${selectedStock.quantity}`);
      return;
    }

    setProductList((prev) => [...prev, { ...formData }]);
    setSelectedItem("");
    setFormData({
      name: "",
      quantity: "",
      price: "",
      totalPrice: 0,
    });
  };

  const generatePDF = () => {
    const { customerName, mobile } = customerInfo;
    const date = new Date().toISOString().split("T")[0];
    const doc = new jsPDF();

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("KPS SILKS", 105, 20, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("415 Uthukuli Road,", 105, 27, { align: "center" });
    doc.text("Kunnnathur, Tamil Nadu - 638103", 105, 32, { align: "center" });

    // Date & Customer Info
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 200, 40, { align: "right" });

    doc.setFontSize(11);
    doc.text(`Customer Name : ${customerName}`, 20, 50);
    doc.text(`Mobile Number : +91 ${mobile}`, 20, 58);

    // Table Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.line(20, 66, 200, 66);
    doc.text("S.No", 22, 73);
    doc.text("Product", 42, 73);
    doc.text("Qty", 120, 73, { align: "right" });
    doc.text("Price", 155, 73, { align: "right" });
    doc.text("Total", 195, 73, { align: "right" });
    doc.line(20, 76, 200, 76);

    // Product Rows
    doc.setFont("helvetica", "normal");
    let y = 85;
    let grandTotal = 0;

    productList.forEach((item, idx) => {
    doc.text(`${idx + 1}`, 22, y);
    doc.text(item.name, 42, y);
    doc.text(`${item.quantity}`, 120, y, { align: "right" });
    doc.text(`Rs. ${item.price.toFixed(2)}`, 155, y, { align: "right" });
    doc.text(`Rs. ${item.totalPrice.toFixed(2)}`, 195, y, { align: "right" });
    grandTotal += item.totalPrice;
    y += 10;
  });

  // Table Bottom Line
    // Grand Total
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, 195, y + 10, { align: "right" });

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Thank you for shopping with us!", 105, y + 25, { align: "center" });

    return doc;
  };

  const handleDownloadPDF = async () => {
    const { customerName, mobile } = customerInfo;
    const date = new Date().toISOString().split("T")[0];

    if (!customerName || !/^\d{10}$/.test(mobile) || productList.length === 0) {
      alert("Please fill customer details and add at least one item.");
      return;
    }

    try {
      // Update stock
      for (const item of productList) {
        const stockItem = stockData.find((s) => s.name === item.name);
        if (stockItem) {
          await axios.put(`${API_BASE}/stock/${stockItem._id}`, {
            quantity: stockItem.quantity - item.quantity,
          });
        }
      }

      // Save billing details
      await axios.post(`${API_BASE}/billing`, {
        customerName,
        mobile,
        items: productList,
        date,
        grandTotal: productList.reduce((sum, item) => sum + item.totalPrice, 0),
      });

      // Generate and save PDF
      const doc = generatePDF();
      doc.save(`bill_${customerName}_${date}.pdf`);

      // Reset form
      setProductList([]);
      setFormData({ name: "", quantity: "", price: "", totalPrice: 0 });
      setCustomerInfo({ customerName: "", mobile: "" });

      // Refresh data
      fetchStockData();
      fetchBillingDetails();

      alert("Bill generated successfully!");
    } catch (err) {
      console.error("Billing Error:", err);
      alert("Error generating bill. Please try again.");
    }
  };

  const openBillPDF = (bill) => {
    const doc = new jsPDF();

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("KPS SILKS", 105, 20, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("415 Uthukuli Road,", 105, 27, { align: "center" });
    doc.text("Kunnnathur, Tamil Nadu - 638103", 105, 32, { align: "center" });

    // Date & Customer Info
    doc.setFontSize(12);
    doc.text(`Date: ${bill.date}`, 200, 40, { align: "right" });

    doc.setFontSize(11);
    doc.text(`Customer Name : ${bill.customerName}`, 20, 50);
    doc.text(`Mobile Number : +91 ${bill.mobile}`, 20, 58);

    // Table Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.line(20, 66, 200, 66);
    doc.text("S.No", 22, 73);
    doc.text("Product", 42, 73);
    doc.text("Qty", 120, 73, { align: "right" });
    doc.text("Price", 155, 73, { align: "right" });
    doc.text("Total", 195, 73, { align: "right" });
    doc.line(20, 76, 200, 76);

    // Table Content
    doc.setFont("helvetica", "normal");
    let y = 85;
    let grandTotal = 0;

  bill.items.forEach((item, idx) => {
    doc.text(`${idx + 1}`, 22, y);
    doc.text(item.name, 42, y);
    doc.text(`${item.quantity}`, 120, y, { align: "right" });
    doc.text(`Rs. ${item.price.toFixed(2)}`, 155, y, { align: "right" });
    doc.text(`Rs. ${item.totalPrice.toFixed(2)}`, 195, y, { align: "right" });
    grandTotal += item.totalPrice;
    y += 10;
  });


    // Grand Total
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, 195, y + 10, { align: "right" });
  
    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Thank you for shopping with us!", 105, y + 25, { align: "center" });

    // Open PDF
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="container">
      <h2 className="gradient-heading">Billing Section</h2>
      
      <div className="form">
        <div className="filter-form">
          <div className="input-group">
        <input
          list="customerNames"
          placeholder="Customer Name"
          value={customerInfo.customerName}
          onChange={(e) => setCustomerInfo(prev => ({
            ...prev,
            customerName: e.target.value
          }))}
        />
        <datalist id="customerNames">
          {Array.from(new Set(billingDetails.map(b => b.customerName)))
            .map((name, index) => (
              <option key={index} value={name} />
            ))}
        </datalist>
      </div>

      <div className="input-group">
        <input
          type="tel"
          placeholder="Mobile Number"
          value={customerInfo.mobile}
          onChange={handleMobileChange}
          maxLength="10"
        />
      </div>

          <div className="input-group">
            <select value={selectedItem} onChange={handleItemChange}>
              <option value="">Select Item</option>
              {stockData.map((item) => (
                <option key={item._id} value={item.name}>
                  {item.name} (Stock: {item.quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <input
              type="number"
              min="1"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleQuantityChange}
            />
          </div>

          <div className="input-group">
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={formData.price}
              onChange={handlePriceChange}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Total"
              value={`₹ ${formData.totalPrice.toFixed(2)}`}
              readOnly
            />
          </div>

          <button type="button" className="save-btn" onClick={handleAddItem}>
            Add Item
          </button>
          <button type="button" className="save-btn" onClick={handleDownloadPDF}>
            Generate Bill
          </button>
        </div>
      </div>

      {productList.length > 0 && (
        <div className="table-container">
          <h4>Current Bill Items</h4>
          <table className="table-1">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹ {item.price.toFixed(2)}</td>
                  <td>₹ {item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-container relative" ref={tableRef}>
        <h4>Billing History</h4>
        <table className="table-1">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Date</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {billingDetails.length > 0 ? (
              billingDetails.map((bill, index) => (
                <tr key={index}>
                  <td>{bill.customerName}</td>
                  <td>+91 {bill.mobile}</td>
                  <td>{bill.date}</td>
                  <td>₹ {bill.grandTotal.toFixed(2)}</td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => openBillPDF(bill)}
                    >
                      View Bill
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-records">
                  No billing records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {showScrollHint && (
          <span className="material-symbols-outlined scroll-hint-icon">
            arrow_downward_alt
          </span>
        )}
      </div>
    </div>
  );
};

export default Billing;