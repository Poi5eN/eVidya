import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";

import {
  Chart as ChartsJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Pie } from "react-chartjs-2";
ChartsJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);
const authToken = Cookies.get("token");
const PieChart = () => {
 
  const [data, setData] = useState({
    datasets: [
      {
        data: [],
        backgroundColor: ["#00796b", "#880e4f"],
      },
    ],
    labels: ["Boys", "Girls"],
    options: {
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
      },
      layout: {
        padding: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20,
        },
      },
      elements: {
        arc: {
          borderWidth: 0,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1, // Adjust this value to your desired aspect ratio
      cutout: "80%", // Adjust the cutout value to change the inner radius of the pie chart
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (Array.isArray(response.data.allStudent)) {
          // Filter students by gender
          const boysCount = response.data.allStudent.filter(
            (student) => student.gender === "Male"
          ).length;
          const girlsCount = response.data.allStudent.length - boysCount;

          setData({
            datasets: [
              {
                data: [boysCount, girlsCount],
                backgroundColor: ["#29b6f6", "#f06292"],
              },
            ],
            labels: [`Boys : ${boysCount}`, `Girls : ${girlsCount}`],
            options: {
              ...data.options,
              cutout: "70%", // Adjust the cutout value to change the inner radius of the pie chart
            },
          });
        } else {
          console.error("Data format is not as expected:", response.data);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <h1 className="text-center text-[12px] text-cyan-700 font-semibold">
        All Students
      </h1>
      <div className=" rounded-sm flex justify-center items-center ">
        <div className=" ">
          <Pie data={data} options={data.options} />
        </div>
      </div>
    </>
  );
};

export default PieChart;
