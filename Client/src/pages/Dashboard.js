import React, { useContext, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import AuthContext from "../AuthContext";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);
export const data = {
  labels: ["Apple", "Knorr", "Shoop", "Green", "Purple", "Orange"],
  datasets: [
    {
      label: "# of Votes",
      data: [0, 1, 5, 8, 9, 15],
      backgroundColor: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
      ],
      borderColor: "#ffffff",
      borderWidth: 2,
    },
  ],
};

function Dashboard() {
  const [saleAmount, setSaleAmount] = useState("0");
  const [purchaseAmount, setPurchaseAmount] = useState("0");
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);

  const [chart, setChart] = useState({
    options: {
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ],
      },
    },
    series: [
      {
        name: "Monthly Sales Amount",
        data: [10, 20, 40, 50, 60, 20, 10, 35, 45, 70, 25, 70],
      },
    ],
  });

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchTotalSaleAmount();
    fetchTotalPurchaseAmount();
    fetchStoresData();
    fetchProductsData();
    fetchMonthlySalesData();
  }, []);

  const fetchTotalSaleAmount = () => {
    fetch(`http://localhost:4000/api/sales/get/${authContext.user}/totalsaleamount`)
      .then((response) => response.json())
      .then((data) => setSaleAmount(data.totalSaleAmount));
  };

  const fetchTotalPurchaseAmount = () => {
    fetch(`http://localhost:4000/api/purchase/get/${authContext.user}/totalpurchaseamount`)
      .then((response) => response.json())
      .then((data) => setPurchaseAmount(data.totalPurchaseAmount));
  };

  const fetchStoresData = () => {
    fetch(`http://localhost:4000/api/store/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => setStores(data));
  };

  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/product/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => setProducts(data));
  };

  const fetchMonthlySalesData = () => {
    fetch(`http://localhost:4000/api/sales/getmonthly`)
      .then((response) => response.json())
      .then((data) => setChart((prev) => ({ ...prev, series: [{ name: "Monthly Sales Amount", data: data.salesAmount }] })));
  };

  return (
    <div className="grid grid-cols-1 col-span-12 lg:col-span-10 gap-6 md:grid-cols-3 lg:grid-cols-4 p-4">
      {[{
        title: "Sales", value: saleAmount, bgColor: "bg-green-100", textColor: "text-green-600"
      }, {
        title: "Purchase", value: purchaseAmount, bgColor: "bg-red-100", textColor: "text-red-600"
      }, {
        title: "Total Products", value: products.length, bgColor: "bg-blue-100", textColor: "text-blue-600"
      }, {
        title: "Total Stores", value: stores.length, bgColor: "bg-yellow-100", textColor: "text-yellow-600"
      }].map((item, index) => (
        <article key={index} className={`flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-lg hover:shadow-xl transition duration-300 ${item.bgColor}`}>          
          <div className={`inline-flex gap-2 self-end rounded p-1 ${item.textColor}`}>
            <span className="text-xs font-medium"> 67.81% </span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">{item.title}</strong>
            <p>
              <span className="text-2xl font-medium text-gray-900"> ${item.value} </span>
            </p>
          </div>
        </article>
      ))}
      <div className="flex justify-around bg-white rounded-lg py-8 col-span-full shadow-lg hover:shadow-xl transition duration-300">
        <div>
          <Chart options={chart.options} series={chart.series} type="bar" width="500" />
        </div>
        <div>
          <Doughnut data={data} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
