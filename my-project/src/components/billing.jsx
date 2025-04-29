import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "../styles/styles.css";

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
    axios.get("http://localhost:5000/stock").then(res => setStockData(res.data));
    axios.get("http://localhost:5000/billing").then(res => {
      setBillingDetails(res.data);
      setTimeout(checkScrollHint, 100);
    });
  }, []);

  const checkScrollHint = () => {
    const el = tableRef.current;
    setShowScrollHint(el && el.scrollHeight > el.clientHeight);
  };

  const handleItemChange = (e) => {
    const name = e.target.value;
    setSelectedItem(name);
    const item = stockData.find(item => item.name === name);
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
    setFormData(prev => ({
      ...prev,
      quantity,
      totalPrice: prev.price * quantity,
    }));
  };

  const handlePriceChange = (e) => {
    const price = parseFloat(e.target.value) || 0; // Ensure the price is a number
    setFormData(prev => ({
      ...prev,
      price,
      totalPrice: price * prev.quantity,
    }));
  };
  const handleMobileChange = (e) => {
    const input = e.target.value.replace(/\D/g, "");
    if (input.length <= 10) {
      setCustomerInfo(prev => ({ ...prev, mobile: input }));
    }
  };

const handleAddItem = () => {
  const { name, quantity, price } = formData;
  const { customerName, mobile } = customerInfo;
  const selectedStock = stockData.find(item => item.name === name);
  
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
  
  // Passed all validations
  setProductList(prev => [
    ...prev,
    {
      ...formData,
      customerName,
      mobile,
    }
  ]);
  
  setSelectedItem("");
  setFormData({
    name: "",
    quantity: "",
    price: "",
    totalPrice: 0,
  });
};


  const handleDownloadPDF = async () => {
    const { customerName, mobile } = customerInfo;
    const date = new Date().toISOString().split("T")[0];
  
    if (!customerName || !/^\d{10}$/.test(mobile) || productList.length === 0) {
      alert("Fill customer details and add at least one item.");
      return;
    }
  
    const billNo = billingDetails.length + 1;
  
    try {
      const doc = new jsPDF();
  
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("KPS SILKS", 20, 20);
  
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("415 Uthukuli Road,", 20, 28);
      doc.text("Kunnnathur, Tamil Nadu - 638103", 20, 33);
  
      doc.setFontSize(12);
      doc.text(`Date: ${date}`, 150, 20, { align: "right" });
      doc.text(`Bill No: ${billNo}`, 150, 28, { align: "right" });
  
      doc.text(`Customer Name : ${customerName}`, 20, 45);
      doc.text(`Mobile Number : +91 ${mobile}`, 20, 50);
  
      doc.text("-------------------------------------------------------------", 20, 55);
  
      let y = 65;
      let grandTotal = 0;
  
      productList.forEach((item, idx) => {
        doc.text(`${idx + 1}) Product: ${item.name}`, 20, y);
        doc.text(`Qty: ${item.quantity}, Price: Rs. ${item.price.toFixed(2)}`, 30, y + 7);
        doc.text(`Total: Rs. ${item.totalPrice.toFixed(2)}`, 30, y + 14);
        grandTotal += item.totalPrice;
        y += 20;
      });
  
      doc.text("-------------------------------------------------------------", 20, y);
      doc.setFont("helvetica", "bold");
      doc.text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, 20, y + 10);
      doc.setFont("helvetica", "normal");
      doc.text("Thank you for your purchase!", 20, y + 20);
  
      doc.save(`bill_${billNo}_${customerName}_${date}.pdf`);
  
      for (const item of productList) {
        const stockItem = stockData.find(s => s.name === item.name);
        if (!stockItem || stockItem.quantity < item.quantity) {
          alert(`Insufficient stock for ${item.name}`);
          return;
        }
  
        await axios.put(`http://localhost:5000/stock/${stockItem._id}`, {
          quantity: stockItem.quantity - item.quantity,
        });
  
        await axios.post("http://localhost:5000/billing", {
          ...item,
          customerName,
          mobile,
          date,
        });
      }
  
      const newBillings = await axios.get("http://localhost:5000/billing");
      setBillingDetails(newBillings.data);
      setProductList([]);
      setFormData({
        name: "",
        quantity: "",
        price: "",
        totalPrice: 0,
      });
      setCustomerInfo({
        customerName: "",
        mobile: "",
      });
      alert("Bill saved and downloaded!");
      setTimeout(checkScrollHint, 100);
    } catch (err) {
      console.error("Billing Error:", err);
      alert("Error generating bill.");
    }
  };

  return (
    <div className="container">
      <h2 className="gradient-heading">Billing Section</h2>
      <form className="form">
        <div className="filter-form">
          <div className="input-group">
            <input type="text" placeholder="Customer Name" value={customerInfo.customerName}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, customerName: e.target.value }))} />
          </div>
          <div className="input-group">
            <input type="tel" placeholder="Mobile Number" value={customerInfo.mobile}
              onChange={handleMobileChange} />
          </div>
          <div className="input-group">
            <select value={selectedItem} onChange={handleItemChange}>
              <option value="">Select item</option>
              {stockData.map(item => (
                <option key={item._id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <input type="number" min="1" value={formData.quantity} onChange={handleQuantityChange}
              placeholder="Quantity" />
          </div>
          <div className="input-group">
  <input 
    type="text" 
    value={formData.price} 
    onChange={handlePriceChange}
    placeholder="Price" 
  />
</div>
          <div className="input-group">
            <input type="text" value={formData.totalPrice.toFixed(2)} readOnly />
          </div>
          <button type="button" className="save-btn" onClick={handleAddItem}>Add Item</button>
          <button type="button" className="save-btn" onClick={handleDownloadPDF}>Generate Bill</button>
        </div>
      </form>

      {productList.length > 0 && (
        <div className="table-container">
          <h4>Items in Bill:</h4>
          <table className="table-1">
            <thead>
              <tr>
                <th>Item</th><th>Qty</th><th>Price</th><th>Total</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price.toFixed(2)}</td>
                  <td>₹{item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-container relative" ref={tableRef}>
        <table className="table-1">
          <thead>
            <tr>
              <th>Customer</th><th>Mobile</th><th>Item</th><th>Quantity</th>
              <th>Price</th><th>Date</th><th>Total</th>
            </tr>
          </thead>
          <tbody>
            {billingDetails.length > 0 ? billingDetails.map((bill, index) => (
              <tr key={index}>
                <td>{bill.customerName}</td>
                <td>+91 {bill.mobile}</td>
                <td>{bill.name}</td>
                <td>{bill.quantity}</td>
                <td>₹{parseFloat(bill.price).toFixed(2)}</td>
                <td>{bill.date}</td>
                <td>₹{parseFloat(bill.totalPrice).toFixed(2)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="no-records">No billing records found.</td>
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
