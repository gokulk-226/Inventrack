import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/styles.css";

function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedContactNo, setEditedContactNo] = useState("");
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const tableRef = useRef(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    checkTableScroll();
    window.addEventListener("resize", checkTableScroll);
    return () => window.removeEventListener("resize", checkTableScroll);
  }, [suppliers]);

  const checkTableScroll = () => {
    if (tableRef.current) {
      const { scrollHeight, clientHeight } = tableRef.current;
      setShowScrollHint(scrollHeight > clientHeight);
    }
  };

  const fetchSuppliers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/suppliers");
      setSuppliers(response.data);
    } catch (error) {
      setError("Failed to fetch suppliers. Please try again.");
      console.error("Error fetching suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobileRegex = /^\d{10}$/;

  const validateInputs = (name, email, contactNo, id = null) => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedContactNo = contactNo.trim();

    if (!trimmedName || !trimmedEmail || !trimmedContactNo) {
      return "All fields are required!";
    }

    if (!emailRegex.test(trimmedEmail)) {
      return "Invalid email format!";
    }

    if (!mobileRegex.test(trimmedContactNo)) {
      if (/\D/.test(trimmedContactNo)) {
        return "Contact number must contain only numbers!";
      }
      if (trimmedContactNo.length !== 10) {
        return "Contact number must be exactly 10 digits!";
      }
      return "Invalid contact number format!";
    }

    if (suppliers.some(s => 
      s.name.toLowerCase() === trimmedName.toLowerCase() && 
      s._id !== id
    )) {
      return "Supplier name already exists!";
    }

    if (suppliers.some(s => 
      s.email.toLowerCase() === trimmedEmail.toLowerCase() && 
      s._id !== id
    )) {
      return "Email already exists!";
    }

    if (suppliers.some(s => 
      s.contactNo === trimmedContactNo && 
      s._id !== id
    )) {
      return "Contact number already exists!";
    }

    return null;
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    setError("");
    
    const validationError = validateInputs(name, email, contactNo);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      await axios.post("http://localhost:5000/suppliers", {
        name: name.trim(),
        email: email.trim(),
        contactNo: contactNo.trim()
      });
      setName("");
      setEmail("");
      setContactNo("");
      await fetchSuppliers();
    } catch (error) {
      setError(error.response?.data?.error || "Error adding supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (supplier) => {
    setEditMode(supplier._id);
    setEditedName(supplier.name);
    setEditedEmail(supplier.email);
    setEditedContactNo(supplier.contactNo);
    setError("");
  };

  const handleSaveEdit = async (id) => {
    const validationError = validateInputs(editedName, editedEmail, editedContactNo, id);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      await axios.put(`http://localhost:5000/suppliers/${id}`, {
        name: editedName.trim(),
        email: editedEmail.trim(),
        contactNo: editedContactNo.trim(),
      });
      setEditMode(null);
      await fetchSuppliers();
    } catch (error) {
      setError(error.response?.data?.error || "Error updating supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:5000/suppliers/${id}`);
      await fetchSuppliers();
    } catch (error) {
      setError(error.response?.data?.error || "Error deleting supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactNoChange = (e, setter) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setter(value);
    }
  };

  return (
    <div className="container">
      <h2 className="gradient-heading">Add Supplier</h2>
      <form onSubmit={handleAddSupplier} className="horizontal-form">
        <input
          type="text"
          placeholder="Supplier Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Contact No (10 digits)"
          value={contactNo}
          onChange={(e) => handleContactNoChange(e, setContactNo)}
          maxLength="10"
          required
        />
        <button 
          type="submit" 
          className="save-btn"
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <h2 className="gradient-heading">Supplier List</h2>
      {isLoading && suppliers.length === 0 ? (
        <div className="loading">Loading suppliers...</div>
      ) : (
        <div className="table-container relative" ref={tableRef}>
          <table className="table-1">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact No</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-records">
                    {isLoading ? "Loading..." : "No suppliers found"}
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    {editMode === supplier._id ? (
                      <>
                        <td>
                          <input
                            className="table-input"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <input
                            className="table-input"
                            value={editedEmail}
                            onChange={(e) => setEditedEmail(e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <input
                            className="table-input"
                            value={editedContactNo}
                            onChange={(e) => handleContactNoChange(e, setEditedContactNo)}
                            maxLength="10"
                            required
                          />
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="save-btn" 
                              onClick={() => handleSaveEdit(supplier._id)}
                              disabled={isLoading}
                            >
                              {isLoading ? "Saving..." : "Save"}
                            </button>
                            <button 
                              className="cancel-btn" 
                              onClick={() => setEditMode(null)}
                              disabled={isLoading}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{supplier.name}</td>
                        <td>{supplier.email}</td>
                        <td>{supplier.contactNo}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="edit-btn" 
                              onClick={() => handleEditClick(supplier)}
                              disabled={isLoading}
                            >
                              Edit
                            </button>
                            <button 
                              className="delete-btn" 
                              onClick={() => handleDelete(supplier._id)}
                              disabled={isLoading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {showScrollHint && (
            <span className="material-symbols-outlined scroll-hint-icon">
              arrow_downward_alt
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Supplier;