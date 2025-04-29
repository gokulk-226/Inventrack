import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/styles.css";

const CriticalStock = () => {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [showScrollHint, setShowScrollHint] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    const checkScrollHint = () => {
      const el = tableRef.current;
      if (el && el.scrollHeight > el.clientHeight) {
        setShowScrollHint(true);
      } else {
        setShowScrollHint(false);
      }
    };

    checkScrollHint();
    window.addEventListener("resize", checkScrollHint);
    return () => window.removeEventListener("resize", checkScrollHint);
  }, [stocks]);

  const fetchStocks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/stock");
      setStocks(response.data);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    }
  };

  const filteredStocks = stocks.filter(stock =>
    stock.quantity < 20 &&
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (category ? stock.category.toLowerCase().includes(category.toLowerCase()) : true) &&
    (supplier ? stock.supplier.toLowerCase().includes(supplier.toLowerCase()) : true)
  );

  return (
    <div className="container">
      <h2 className="gradient-heading">Critical Stock Items</h2>

      <div className="filter-form">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by category..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by supplier..."
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
        />
      </div>

      <div className="table-container relative" ref={tableRef}>
        <table className="table-1">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Quantity</th>
              <th>Price/Unit</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => (
                <tr
                  key={stock._id}
                  className={stock.quantity < 10 ? "critical" : "warning"}
                >
                  <td>{stock.name}</td>
                  <td>{stock.category}</td>
                  <td>{stock.supplier}</td>
                  <td>{stock.quantity}</td>
                  <td>₹{stock.pricePerUnit.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-records">
                  ✅ No critical stock items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Scroll hint icon */}
        {showScrollHint && (
          <span className="material-symbols-outlined scroll-hint-icon">
            arrow_downward_alt
          </span>
        )}
      </div>
    </div>
  );
};

export default CriticalStock;
