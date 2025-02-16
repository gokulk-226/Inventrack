import React, { useState, useEffect, useContext } from "react";
import AddSale from "../components/AddSale";
import AuthContext from "../AuthContext";

function Sales() {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [sales, setAllSalesData] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [stores, setAllStores] = useState([]);
  const [updatePage, setUpdatePage] = useState(false);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchSalesData();
    fetchProductsData();
    fetchStoresData();
  }, [updatePage]);

  // Fetch Sales Data
  const fetchSalesData = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/sales/get/${authContext.user}`);
      if (!response.ok) throw new Error("Failed to fetch sales data");
      const data = await response.json();
      setAllSalesData(data);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  // Fetch Products Data
  const fetchProductsData = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/product/get/${authContext.user}`);
      if (!response.ok) throw new Error("Failed to fetch products data");
      const data = await response.json();
      setAllProducts(data);
    } catch (error) {
      console.error("Error fetching products data:", error);
    }
  };

  // Fetch Stores Data
  const fetchStoresData = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/store/get/${authContext.user}`);
      if (!response.ok) throw new Error("Failed to fetch stores data");
      const data = await response.json();
      setAllStores(data);
    } catch (error) {
      console.error("Error fetching stores data:", error);
    }
  };

  // Toggle Add Sale Modal
  const toggleSaleModal = () => setShowSaleModal((prev) => !prev);

  // Handle Page Refresh
  const refreshPage = () => setUpdatePage((prev) => !prev);

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        {showSaleModal && (
          <AddSale
            addSaleModalSetting={toggleSaleModal}
            products={products}
            stores={stores}
            handlePageUpdate={refreshPage}
            authContext={authContext}
          />
        )}
        
        {/* Sales Table */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <span className="font-bold">Sales</span>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
              onClick={toggleSaleModal}
            >
              Add Sales
            </button>
          </div>

          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-900">Product Name</th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">Store Name</th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">Stock Sold</th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">Sales Date</th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">Total Sale Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale._id}>
                  <td className="px-4 py-2 text-gray-900">{sale.ProductID?.name || "N/A"}</td>
                  <td className="px-4 py-2 text-gray-700">{sale.StoreID?.name || "N/A"}</td>
                  <td className="px-4 py-2 text-gray-700">{sale.StockSold || 0}</td>
                  <td className="px-4 py-2 text-gray-700">
                    {sale.SaleDate
                      ? new Intl.DateTimeFormat("en-US").format(new Date(sale.SaleDate))
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 text-gray-700">${sale.TotalSaleAmount?.toFixed(2) || "0.00"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Sales;
