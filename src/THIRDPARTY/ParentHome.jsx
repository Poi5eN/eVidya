import React, { useState, useEffect } from "react";
import {
  FcConferenceCall,
  FcBusinesswoman,
  FcCurrencyExchange,
} from "react-icons/fc";
import Calendar from "../pages/Calendar";
import StudentAttendanceChart from "../CHART/StudentAttendanceChart";
import StudentNotice from "../STUDENTDASHBOARD/StudentNotice";
import axios from "axios";
import MyKids from "./MyKids";
import ParentNotice from "./ParentNotice";
import Cookies from 'js-cookie';
const authToken = Cookies.get('token');

// const API_GET_DATA = "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents"
const ParentHome = () => {
  const [data, setData] = useState([]);

  const fullName = sessionStorage.getItem("fullName");
  const image = sessionStorage.getItem("image");
  const email = sessionStorage.getItem("email");
 

  useEffect(() => {
    // GET Request to fetch existing notices
    axios.get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents?email=${email}`,
      {
        withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      }, // Set withCredentials to true
      })
      .then((response) => {
        console.log('Yes---->', response.data.allStudent)
        setData(response.data.allStudent[0]);
        console.log(response.data.allStudent[0])
      })
      .catch((error) => {
        console.error('Error fetching notices:', error);
      });

  }, []);

  return (
    <>
      <div className="mt-12">
        <div className="grid gap-2  md:grid-cols-2 sm:grid-cols-2  p-3">
          <div className={`p-2 rounded-md text-center bg-white`}>
            <button
              type="button"
              className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl bg-[#03C9D7]"
            >
              <FcConferenceCall />
            </button>
            <StudentAttendanceChart />
          </div>
         
          <div className={`p-2 rounded-md text-center bg-white`}>
          <h2 className="font-bold text-[#03c9d7]">Notice Board</h2>
            <div className="h-[200px]  p-2 rounded-md overflow-scroll">          
          <ParentNotice/>
            </div>
          </div>
        
        </div>
        <MyKids/>
       




        <div className="p-4">
          <Calendar />
        </div>
      </div>
    </>
  );
};

export default ParentHome;