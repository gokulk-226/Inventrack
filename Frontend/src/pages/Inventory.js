import React, { useState, useEffect, useContext } from "react";
import AddProduct from "../components/AddProduct";
import UpdateProduct from "../components/UpdateProduct";
import AuthContext from "../AuthContext";

function Inventory() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stores, setStores] = useState([]);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/product/get/${authContext.user}`);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/store/get/${authContext.user}`);
      const data = await response.json();
      setStores(data);
    } catch (err) {
      console.error("Error fetching stores:", err);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) return fetchProducts();
    try {
      const response = await fetch(`http://localhost:4000/api/product/search?searchTerm=${searchTerm}`);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching search results:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:4000/api/product/delete/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="font-bold text-xl text-gray-800">Overall Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
            <div className="bg-blue-500 text-white p-5 rounded-lg">
              <span>Total Products</span>
              <p className="text-lg font-bold">{products.length}</p>
            </div>
            <div className="bg-yellow-500 text-white p-5 rounded-lg">
              <span>Stores</span>
              <p className="text-lg font-bold">{stores.length}</p>
            </div>
            <div className="bg-purple-500 text-white p-5 rounded-lg">
              <span>Top Selling</span>
              <p className="text-lg font-bold">5</p>
            </div>
            <div className="bg-red-500 text-white p-5 rounded-lg">
              <span>Low Stocks</span>
              <p className="text-lg font-bold">12</p>
            </div>
          </div>
        </div>

        {showProductModal && <AddProduct onClose={() => setShowProductModal(false)} refreshProducts={fetchProducts} />} 
        {showUpdateModal && <UpdateProduct product={updateProduct} onClose={() => setShowUpdateModal(false)} refreshProducts={fetchProducts} />} 

        <div className="overflow-x-auto rounded-lg border bg-white shadow-lg p-5">
          <div className="flex justify-between items-center pb-4">
            <h3 className="font-bold text-lg text-gray-800">Products</h3>
            <input
              className="border-2 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Search here"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => setShowProductModal(true)}>
              Add Product
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-300">
                <th className="px-4 py-2 text-left font-medium text-gray-900">Product</th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">Manufacturer</th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">Stock</th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">Description</th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">Availability</th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.manufacturer}</td>
                  <td className="px-4 py-2">{product.stock}</td>
                  <td className="px-4 py-2">{product.description}</td>
                  <td className="px-4 py-2">{product.stock > 0 ? "In Stock" : "Not in Stock"}</td>
                  <td className="px-4 py-2">
                    <button className="text-green-600" onClick={() => { setUpdateProduct(product); setShowUpdateModal(true); }}>Edit</button>
                    <button className="text-red-600 ml-2" onClick={() => handleDelete(product._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Inventory;