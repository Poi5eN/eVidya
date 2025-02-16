import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PieChart from "../pages/Charts/PieChart";
import { useStateContext } from "../contexts/ContextProvider";
import {
  FcConferenceCall,
  FcBusinesswoman,
  FcCurrencyExchange,
} from "react-icons/fc";
import { format } from "date-fns";
import { BiMaleFemale } from "react-icons/bi";
import Calendar from "../pages/Calendar";
import axios from "axios";
import ActivePieChart from "../pages/Charts/ActivePieChart";
import EarningChart from "../CHART/EarningChart";
import Cookies from "js-cookie";
import TeacherNotice from "../TEACHERDASHBOARD/TeacherNotice";
import { Footer } from "../components";
import useCustomQuery from "../useCustomQuery";
import Loading from "../Loading";
import SomthingwentWrong from "../SomthingwentWrong";
import Bday from "./Bday";
import Marquee from "../Marque/Marquee";
import Welcome from "../Dynamic/Welcome";
import Mobile from "./Mobile/Index";

const DashboardHome = () => {
  const authToken = Cookies.get("token");
  const [allBday, setAllBday] = useState([]);
  const today = new Date();

  const year = today.getFullYear();
 
  // Format today's date as "dd-MM"
  const todayDay = String(today.getDate()).padStart(2, "0");
  const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
  const formattedToday = `${todayDay}-${todayMonth}`;
  const nowDate = `${todayDay}-${todayMonth}`;
  const {
    queryData: teacherData,
    error: teacherError,
    loading: teacherLoading,
  } = useCustomQuery(
    "https://eshikshaserver.onrender.com/api/v1/adminRoute/getTeachers"
  );
  const {
    queryData: studentData,
    error: studentError,
    loading: studentLoading,
  } = useCustomQuery(
    "https://eshikshaserver.onrender.com/api/v1/adminRoute/getAllStudents"
  );
  const {
    queryData: admissionData,
    error: admissionError,
    loading: admissionLoading,
  } = useCustomQuery(
    "https://eshikshaserver.onrender.com/api/v1/adminRoute/getLastYearStudents"
  );

  const location = useLocation();
  const navigate = useNavigate();
  const [teacherCount, setTeacherCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [admissionCount, setAdmissionCount] = useState(0);
  const [earningData, setEarningData] = useState([]);
  const [totalSellAmount, setTotalSellAmount] = useState(0);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const { currentColor, setAllFees, allFees } = useStateContext();

  const matchingStudents = studentData?.allStudent?.filter((student) => {
    const studentDOB = format(new Date(student.dateOfBirth), "dd-MM");
    return studentDOB === formattedToday;
  });
  useEffect(() => {
    if (teacherData) {
      setTeacherCount(teacherData.data.length);
    }
  }, [teacherData]);

  useEffect(() => {
    if (studentData) {
      setStudentCount(studentData.allStudent.length);
      setAllBday(matchingStudents);
    }
  }, [studentData]);


  useEffect(() => {
    if (admissionData) {
      setAdmissionCount(admissionData.count);
    }
  }, [admissionData]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(
          "https://eshikshaserver.onrender.com/api/v1/adminRoute/getAllItems",
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (Array.isArray(response.data.listOfAllItems)) {
          const aggregatedSellAmounts = {};

          response.data.listOfAllItems.forEach((item) => {
            const category = capitalize(item.category);
            const sellAmount = parseFloat(item.sellAmount);

            if (aggregatedSellAmounts[category] === undefined) {
              aggregatedSellAmounts[category] = sellAmount;
            } else {
              aggregatedSellAmounts[category] += sellAmount;
            }
          });

          const extractedCategories = Object.keys(aggregatedSellAmounts);
          const extractedAmount = Object.values(aggregatedSellAmounts);

          const totalSellAmount = extractedAmount.reduce(
            (acc, amount) => acc + amount,
            0
          );

          setTotalSellAmount(totalSellAmount);
        }
      } catch (error) {
        console.error("Error fetching item list:", error);
      }
    };

    fetchItems();
  }, [authToken]);

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  useEffect(() => {
    const fetchFeeStatus = async () => {
      try {
        const response = await axios.get(
          "https://eshikshaserver.onrender.com/api/v1/fees/getFeeStatus",
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        let regularFee = 0;
        let additionalFees = 0;

        response.data?.data.forEach((data) => {
          data.feeHistory.forEach((fees) => {
            if (fees?.regularFees.length > 0) {
              const feeTotal = fees?.regularFees.reduce((total, paid) => {
                const paidAmount = Number(paid.paidAmount) || 0;
                return total + paidAmount;
              }, 0);
              regularFee += feeTotal;
            }
          });
        });

        response.data?.data.forEach((data) => {
          data.feeHistory.forEach((fees) => {
            if (fees?.additionalFees.length > 0) {
              const feeTotal = fees?.additionalFees.reduce((total, paid) => {
                const paidAmount = Number(paid.paidAmount) || 0;
                return total + paidAmount;
              }, 0);
              additionalFees += feeTotal;
            }
          });
        });
        let totalDues = response.data?.data.reduce((total, paid) => {
          const paidAmount = Number(paid.dues) || 0;
          return total + paidAmount;
        }, 0);

        setTotalPaidAmount(additionalFees + regularFee);
        setAllFees([{ regularFee, additionalFees, totalDues }]);
      } catch (error) {
        console.error("Error fetching Fees data: ", error);
      }
    };

    fetchFeeStatus();
  }, []);

  useEffect(() => {
    const newEarningData = [
      {
        icon: <FcConferenceCall />,
        amount: `${studentCount}`,
        title: "Students",
        iconColor: "#fff",
        iconBg: "rgb(254, 201, 15)",
        pcColor: "red-600",
        redirect: "allstudent",
        color:"#6276a1",
        border: "blue",
      },
      {
        icon: <FcBusinesswoman />,
        amount: `${teacherCount}`,
        title: "Teachers",
        iconColor: "#fff",
        iconBg: "rgb(254, 201, 15)",
        pcColor: "green-600",
        redirect: "allteachers",
        border: "green",
        color:"#97d5aa"
      },
      {
        icon: <FcCurrencyExchange />,
        amount: `${totalPaidAmount}`,
        // amount: `${totalSellAmount + totalPaidAmount}`,
        title: "Fee",
        iconColor: "#fff",
        iconBg: "rgb(254, 201, 15)",
        pcColor: "green-600",
        redirect: "checkfee",
        border: "#966e11",
        color:"#edcd83"
      },
      {
        icon: <BiMaleFemale />,
        amount: `${admissionCount}`,
        title: "Admission",
        iconColor: "#fff",
        iconBg: "rgb(254, 201, 15)",
        pcColor: "red-600",
        redirect: "admission",
        border: "red",
      },
    ];

    setEarningData(newEarningData);
  }, [teacherCount, studentCount, totalPaidAmount, totalSellAmount]);

  useEffect(() => {
    window.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
      }
    });

    navigate(location.href, { replace: true });
    window.addEventListener("popstate", function (event) {
      navigate(location.href, { replace: true });
    });
  }, [navigate]);

  if (teacherError || studentError) {
    return <SomthingwentWrong />;
  }
  if (teacherLoading || studentLoading) {
    return <Loading />;
  }

  return (
    <>
     <div className="sm:block md:hidden">
        <Mobile />
      </div>
      <div className="mt:0 sm:hidden hidden md:block">
      <div className="sm:mt-20 mt-20 md:mt-0 bg-gray-100 dark:bg-main-dark-bg">
        <div className="relative">
          {earningData.map((item) => (
            <div className="w-1/2 sm:w-1/4 float-left" key={item.title}>
              <div
                className={`bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-1 m-2 flex justify-center border-${item?.border}-600 bg-${item?.border}-200  border-b-4 rounded-md hover:bg-${currentColor}`}
                style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",background:item?.color,borderColor:item.border }}
              >
                <Link
                  to={item.redirect}
                  className=" h-[110px] dark:text-dark dark:bg-secondary-dark-bg md:w-56 p-3  rounded-2xl text-center text-red font-semibold"
                >
                  <button
                    type="button"
                    style={{
                      color: item.iconColor,
                      background: currentColor,
                    }}
                    className="text-2xl opacity-0.9 rounded-full p-2 hover:drop-shadow-2xl"
                  >
                    {item.icon}
                  </button>
                  <p className=" text-gray-700 dark:text-gray-200">
                    <span className="text-lg font-semibold">{item.amount}</span>
                    <span className={`text-sm text-${item.pcColor} ml-2`}>
                      {item.percentage}
                    </span>
                  </p>
                  <p
                    className="text-[20px] font-semibold "
                    style={{ color: currentColor }}
                  >
                    {item.title}
                  </p>
                </Link>
              </div>
            </div>
          ))}

          <div className="clearfix"></div>
        </div>
        <div className="grid gap-3 p-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
       
        <Welcome />
     
     <div
       style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
       className="p-2 rounded-md text-center bg-white dark:text-white dark:bg-secondary-dark-bg"
     >
        <Marquee list={allBday} time={6} height={"130px"}>
                {allBday.map((item, index) => (
                  <div class=" items-center gap-4 p-1 border rounded-sm shadow-sm bg-white my-[1px] mx-1 ">
                    <span class="px-2 py-1 bg-gray-100 text-gray-800 text-[10px] font-semibold rounded">
                      {item.role}
                    </span>

                    <div class="flex items-center justify-between w-full">
                      <div>
                        <h4 class=" font-bold text-[12px]"> {item.fullName}</h4>
                        <h4 class="text-gray-600 font-bold text-[10px]">
                          {" "}
                          Class : {item.class}-{item.section}{" "}
                        </h4>
                        <p class="text-gray-600 text-sm">
                          {item.bday} Birthday 🎂 🎉
                        </p>
                      </div>

                      <div>
                        <img
                          class="w-10 h-10 rounded-full"
                          src="https://via.placeholder.com/40"
                          alt="User Avatar"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </Marquee>
     </div>
     <div
       style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
       className="p-2 rounded-md text-center bg-white dark:text-white dark:bg-secondary-dark-bg"
     >
       <TeacherNotice />
     </div>
   </div>
      
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-2 px-3">
          <div
            className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-md  p-3"
            style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
          >
            <EarningChart />
          </div>
          
          <div
            className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-md  p-3 gap-2 flex justify-center items-center flex-col"
            style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
          >
            <PieChart />
           
            <ActivePieChart />
          </div>
          <div
            className="bg-white dark:text-white dark:bg-secondary-dark-bg rounded-md  p-3"
            style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
          >
            <Calendar />
          </div>
        </div>
      </div>
      </div>
     
      {/* <Footer /> */}
    </>
  );
};

export default DashboardHome;




// import React, { useEffect, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import PieChart from "../pages/Charts/PieChart";
// import { useStateContext } from "../contexts/ContextProvider";
// import {
//   FcConferenceCall,
//   FcBusinesswoman,
//   FcCurrencyExchange,
// } from "react-icons/fc";
// import { format } from "date-fns";
// import { BiMaleFemale } from "react-icons/bi";
// import Calendar from "../pages/Calendar";
// import axios from "axios";
// import ActivePieChart from "../pages/Charts/ActivePieChart";
// import EarningChart from "../CHART/EarningChart";
// import Cookies from "js-cookie";
// import TeacherNotice from "../TEACHERDASHBOARD/TeacherNotice";
// import { Footer } from "../components";
// import useCustomQuery from "../useCustomQuery";
// import Loading from "../Loading";
// import SomthingwentWrong from "../SomthingwentWrong";
// import Bday from "./Bday";
// import Marquee from "../Marque/Marquee";
// import Welcome from "../Dynamic/Welcome";

// const DashboardHome = () => {
//   const authToken = Cookies.get("token");
//   const [allBday, setAllBday] = useState([]);
//   const today = new Date();

//   const year = today.getFullYear();
//   console.log("Year:", year);
//   // Format today's date as "dd-MM"
//   const todayDay = String(today.getDate()).padStart(2, "0");
//   const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
//   const formattedToday = `${todayDay}-${todayMonth}`;
//   const nowDate = `${todayDay}-${todayMonth}`;
//   const {
//     queryData: teacherData,
//     error: teacherError,
//     loading: teacherLoading,
//   } = useCustomQuery(
//     "https://eshikshaserver.onrender.com/api/v1/adminRoute/getTeachers"
//   );
//   const {
//     queryData: studentData,
//     error: studentError,
//     loading: studentLoading,
//   } = useCustomQuery(
//     "https://eshikshaserver.onrender.com/api/v1/adminRoute/getAllStudents"
//   );
//   const {
//     queryData: admissionData,
//     error: admissionError,
//     loading: admissionLoading,
//   } = useCustomQuery(
//     "https://eshikshaserver.onrender.com/api/v1/adminRoute/getLastYearStudents"
//   );

//   const location = useLocation();
//   const navigate = useNavigate();
//   const [teacherCount, setTeacherCount] = useState(0);
//   const [studentCount, setStudentCount] = useState(0);
//   const [admissionCount, setAdmissionCount] = useState(0);
//   const [earningData, setEarningData] = useState([]);
//   const [totalSellAmount, setTotalSellAmount] = useState(0);
//   const [totalPaidAmount, setTotalPaidAmount] = useState(0);
//   const { currentColor, setAllFees, allFees } = useStateContext();

//   const matchingStudents = studentData?.allStudent?.filter((student) => {
//     const studentDOB = format(new Date(student.dateOfBirth), "dd-MM");
//     return studentDOB === formattedToday;
//   });
//   useEffect(() => {
//     if (teacherData) {
//       setTeacherCount(teacherData.data.length);
//     }
//   }, [teacherData]);

//   useEffect(() => {
//     if (studentData) {
//       setStudentCount(studentData.allStudent.length);
//       setAllBday(matchingStudents);
//     }
//   }, [studentData]);
//   console.log("allBdayallBdayallBdayallBdayallBdayallBdayallBday", allBday);
//   console.log(
//     "matchingStudentsmatchingStudentsmatchingStudentsmatchingStudents",
//     matchingStudents
//   );

//   useEffect(() => {
//     if (admissionData) {
//       setAdmissionCount(admissionData.count);
//     }
//   }, [admissionData]);

//   useEffect(() => {
//     const fetchItems = async () => {
//       try {
//         const response = await axios.get(
//           "https://eshikshaserver.onrender.com/api/v1/adminRoute/getAllItems",
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         );
//         if (Array.isArray(response.data.listOfAllItems)) {
//           const aggregatedSellAmounts = {};

//           response.data.listOfAllItems.forEach((item) => {
//             const category = capitalize(item.category);
//             const sellAmount = parseFloat(item.sellAmount);

//             if (aggregatedSellAmounts[category] === undefined) {
//               aggregatedSellAmounts[category] = sellAmount;
//             } else {
//               aggregatedSellAmounts[category] += sellAmount;
//             }
//           });

//           const extractedCategories = Object.keys(aggregatedSellAmounts);
//           const extractedAmount = Object.values(aggregatedSellAmounts);

//           const totalSellAmount = extractedAmount.reduce(
//             (acc, amount) => acc + amount,
//             0
//           );

//           setTotalSellAmount(totalSellAmount);
//         }
//       } catch (error) {
//         console.error("Error fetching item list:", error);
//       }
//     };

//     fetchItems();
//   }, [authToken]);

//   const capitalize = (str) => {
//     return str.charAt(0).toUpperCase() + str.slice(1);
//   };

//   useEffect(() => {
//     const fetchFeeStatus = async () => {
//       try {
//         const response = await axios.get(
//           "https://eshikshaserver.onrender.com/api/v1/fees/getFeeStatus",
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         );

//         let regularFee = 0;
//         let additionalFees = 0;

//         response.data?.data.forEach((data) => {
//           data.feeHistory.forEach((fees) => {
//             if (fees?.regularFees.length > 0) {
//               const feeTotal = fees?.regularFees.reduce((total, paid) => {
//                 const paidAmount = Number(paid.paidAmount) || 0;
//                 return total + paidAmount;
//               }, 0);
//               regularFee += feeTotal;
//             }
//           });
//         });

//         response.data?.data.forEach((data) => {
//           data.feeHistory.forEach((fees) => {
//             if (fees?.additionalFees.length > 0) {
//               const feeTotal = fees?.additionalFees.reduce((total, paid) => {
//                 const paidAmount = Number(paid.paidAmount) || 0;
//                 return total + paidAmount;
//               }, 0);
//               additionalFees += feeTotal;
//             }
//           });
//         });
//         let totalDues = response.data?.data.reduce((total, paid) => {
//           const paidAmount = Number(paid.dues) || 0;
//           return total + paidAmount;
//         }, 0);

//         setTotalPaidAmount(additionalFees + regularFee);
//         setAllFees([{ regularFee, additionalFees, totalDues }]);
//       } catch (error) {
//         console.error("Error fetching Fees data: ", error);
//       }
//     };

//     fetchFeeStatus();
//   }, []);

//   useEffect(() => {
//     const newEarningData = [
//       {
//         icon: <FcConferenceCall />,
//         amount: `${studentCount}`,
//         title: "Students",
//         iconColor: "#fff",
//         iconBg: "rgb(254, 201, 15)",
//         pcColor: "red-600",
//         redirect: "allstudent",
//       },
//       {
//         icon: <FcBusinesswoman />,
//         amount: `${teacherCount}`,
//         title: "Teachers",
//         iconColor: "#fff",
//         iconBg: "rgb(254, 201, 15)",
//         pcColor: "green-600",
//         redirect: "allteachers",
//       },
//       {
//         icon: <FcCurrencyExchange />,
//         amount: `${totalPaidAmount}`,
//         // amount: `${totalSellAmount + totalPaidAmount}`,
//         title: "Fee",
//         iconColor: "#fff",
//         iconBg: "rgb(254, 201, 15)",
//         pcColor: "green-600",
//         redirect: "checkfee",
//       },
//       {
//         icon: <BiMaleFemale />,
//         amount: `${admissionCount}`,
//         title: "Admission",
//         iconColor: "#fff",
//         iconBg: "rgb(254, 201, 15)",
//         pcColor: "red-600",
//         redirect: "admission",
//       },
//     ];

//     setEarningData(newEarningData);
//   }, [teacherCount, studentCount, totalPaidAmount, totalSellAmount]);

//   useEffect(() => {
//     window.addEventListener("keydown", function (event) {
//       if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
//         event.preventDefault();
//       }
//     });

//     navigate(location.href, { replace: true });
//     window.addEventListener("popstate", function (event) {
//       navigate(location.href, { replace: true });
//     });
//   }, [navigate]);

//   if (teacherError || studentError) {
//     return <SomthingwentWrong />;
//   }
//   if (teacherLoading || studentLoading) {
//     return <Loading />;
//   }

//   return (
//     <>
    
//       <div className="sm:mt-20 mt-20 md:mt-0 bg-gray-100 dark:bg-main-dark-bg">
//         <div className="relative">
//           {earningData.map((item) => (
//             <div className="w-1/2 sm:w-1/4 float-left" key={item.title}>
//               <div
//                 className={`bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-1 m-2 flex justify-center rounded-md hover:bg-${currentColor}`}
//                 style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//               >
//                 <Link
//                   to={item.redirect}
//                   className="bg-white h-[110px] dark:text-dark dark:bg-secondary-dark-bg md:w-56 p-3  rounded-2xl text-center text-red font-semibold"
//                 >
//                   <button
//                     type="button"
//                     style={{
//                       color: item.iconColor,
//                       background: currentColor,
//                     }}
//                     className="text-2xl opacity-0.9 rounded-full p-2 hover:drop-shadow-2xl"
//                   >
//                     {item.icon}
//                   </button>
//                   <p className=" text-gray-700 dark:text-gray-200">
//                     <span className="text-lg font-semibold">{item.amount}</span>
//                     <span className={`text-sm text-${item.pcColor} ml-2`}>
//                       {item.percentage}
//                     </span>
//                   </p>
//                   <p
//                     className="text-[20px] font-semibold "
//                     style={{ color: currentColor }}
//                   >
//                     {item.title}
//                   </p>
//                 </Link>
//               </div>
//             </div>
//           ))}

//           <div className="clearfix"></div>
//         </div>
//         <div className="grid gap-3 p-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
       
//         <Welcome />
     
//      <div
//        style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//        className="p-2 rounded-md text-center bg-white dark:text-white dark:bg-secondary-dark-bg"
//      >
//         <Marquee list={allBday} time={6} height={"130px"}>
//                 {allBday.map((item, index) => (
//                   <div class=" items-center gap-4 p-1 border rounded-sm shadow-sm bg-white my-[1px] mx-1 ">
//                     <span class="px-2 py-1 bg-gray-100 text-gray-800 text-[10px] font-semibold rounded">
//                       {item.role}
//                     </span>

//                     <div class="flex items-center justify-between w-full">
//                       <div>
//                         <h4 class=" font-bold text-[12px]"> {item.fullName}</h4>
//                         <h4 class="text-gray-600 font-bold text-[10px]">
//                           {" "}
//                           Class : {item.class}-{item.section}{" "}
//                         </h4>
//                         <p class="text-gray-600 text-sm">
//                           {item.bday} Birthday 🎂 🎉
//                         </p>
//                       </div>

//                       <div>
//                         <img
//                           class="w-10 h-10 rounded-full"
//                           src="https://via.placeholder.com/40"
//                           alt="User Avatar"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </Marquee>
//      </div>
//      <div
//        style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//        className="p-2 rounded-md text-center bg-white dark:text-white dark:bg-secondary-dark-bg"
//      >
//        <TeacherNotice />
//      </div>
//    </div>
//         {/* <div className="p-2 md:flex gap-3">
//           <div className="md:w-1/2">
//             <Welcome />
//           </div>
//           <div 
//           className="md:w-1/2 md:flex  gap-3 bg-white rounded-lg dark:bg-main-dark-bg"
//           // className="w-full bg-white rounded-lg"
//               style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//           >
//             <div
//               className="w-full rounded-lg dark:bg-secondary-dark-bg bg-white"
//               // style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//             >
//               <div className="flex justify-between px-1">
//                 <span className="text-[12px] text-start font-bold">
//                   BirthDay List 🎉{" "}
//                 </span>{" "}
              
//               </div>
//               <Marquee list={allBday} time={6} height={"130px"}>
//                 {allBday.map((item, index) => (
//                   <div class=" items-center gap-4 p-1 border rounded-sm shadow-sm bg-white my-[1px] mx-1 ">
//                     <span class="px-2 py-1 bg-gray-100 text-gray-800 text-[10px] font-semibold rounded">
//                       {item.role}
//                     </span>

//                     <div class="flex items-center justify-between w-full">
//                       <div>
//                         <h4 class=" font-bold text-[12px]"> {item.fullName}</h4>
//                         <h4 class="text-gray-600 font-bold text-[10px]">
//                           {" "}
//                           Class : {item.class}-{item.section}{" "}
//                         </h4>
//                         <p class="text-gray-600 text-sm">
//                           {item.bday} Birthday 🎂 🎉
//                         </p>
//                       </div>

//                       <div>
//                         <img
//                           class="w-10 h-10 rounded-full"
//                           src="https://via.placeholder.com/40"
//                           alt="User Avatar"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </Marquee>
//             </div>
//             <div
//               className="w-full bg-white rounded-lg dark:bg-main-dark-bg"
//               // style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//             >
             

//               <TeacherNotice />
//             </div>
//           </div>
//         </div> */}
//         <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-2 px-3">
//           <div
//             className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-md  p-3"
//             style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//           >
//             <EarningChart />
//           </div>
//           {/* <div
//             className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-md  p-3"
//             style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//           >
//             <TeacherNotice />
//             <Bday studentData={studentData}/>
//           </div> */}
//           <div
//             className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-md  p-3 gap-2 flex justify-center items-center flex-col"
//             style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//           >
//             {/* <div className="p-2"> */}
//             <PieChart />
//             {/* </div> */}
//             {/* <div className="p-2"> */}
//             <ActivePieChart />
//             {/* </div> */}
//           </div>
//           <div
//             className="bg-white dark:text-white dark:bg-secondary-dark-bg rounded-md  p-3"
//             style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//           >
//             <Calendar />
//           </div>
//         </div>
//       </div>
     
//       <Footer />
//     </>
//   );
// };

// export default DashboardHome;
