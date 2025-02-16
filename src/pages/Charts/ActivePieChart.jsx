import Cookies from 'js-cookie';
import axios from 'axios';
// import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
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


const ActivePieChart = () => {
  const authToken = Cookies.get('token');
  const [data, setData] = useState({
    datasets: [
      {
        data: [],
        backgroundColor: ["#1e4db7", "#880e4f"],
      },
    ],
    labels: ["Boys", "Girls"],
    options: {
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
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
      cutout: '80%', // Adjust the cutout value to change the inner radius of the pie chart
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudentStatus', {
          withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
        });
  
        if (Array.isArray(response.data.allStudent)) {
          const Active = response.data.allStudent.filter(student => student.status === 'active').length;
          const InActive = response.data.allStudent.length - Active;
          setData({
            datasets: [
              {
                data: [Active, InActive],
                backgroundColor: ["#00e676", "#fbc02d"],
              },
            ],
            labels: [`Active : ${Active}` , `InActive : ${InActive}`],
            options: {
              ...data.options,
              cutout: '70%', // Adjust the cutout value to change the inner radius of the pie chart
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
      <h1 className="text-center text-[12px] text-cyan-700 font-semibold">Active Students</h1>
      <div className=" rounded-sm flex justify-center items-center ">
        <div className=" ">
          <Pie data={data} options={data.options} />
        </div>
      </div>
    </>
  );
};

export default ActivePieChart;
