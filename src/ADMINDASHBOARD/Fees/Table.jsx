import axios from "axios";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import FeeRecipt from "./FeeRecipt";
import NoDataFound from "../../NoDataFound";
import { format, parseISO } from 'date-fns';
import { Button, Grid, TextField } from "@mui/material";
const Table = ({reLoad}) => {
  const authToken = Cookies.get("token");
  // const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
  const { currentColor } = useStateContext();
  const [modalData, setModalData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [feeHistory, setFeeHistory] = useState([]);
  const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(getCurrentDate());
  const [error, setError] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  const handleOpenModal = (rowData) => {
    setModalData(rowData);
    setIsOpen(true);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  const totalPages = Math.ceil(filteredFeeHistory.length / itemsPerPage);
useEffect(()=>{
  // api/v1/fees/getFeeHistoryAndDues/QYO284
  console.log("first")
  const getFeeHistory = async () => {
  try {
    const response = await axios.get(
      // "https://eserver-i5sm.onrender.com/api/v1/fees/getFeeStatus",
      "https://eserver-i5sm.onrender.com/api/v1/fees/getFeeHistoryAndDues/RWN599",
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    console.log("feeresponse",response.data)
    // setFeeHistory(response.data.data);
  
    // setFilteredFeeHistory(response.data.data);
   
  } catch (error) {
    console.error("Error fetching fee history:", error);
  }}
  getFeeHistory()
},[])

  
  const getFeeHistory = async () => {
    try {
      const response = await axios.get(
        "https://eserver-i5sm.onrender.com/api/v1/fees/feeHistory",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setFeeHistory(response.data.data);
    
      setFilteredFeeHistory(response.data.data);
     
    } catch (error) {
      console.error("Error fetching fee history:", error);
    }
  };

  useEffect(() => {
    getFeeHistory();
  }, [reLoad]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const handleDateFilter = () => {
    const filteredData = feeHistory.filter((fee) => {
      const feeDate = new Date(fee.date);
      return feeDate >= new Date(startDate) && feeDate <= new Date(endDate);
    });
    setFilteredFeeHistory(filteredData);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate(getCurrentDate());
    setFilteredFeeHistory(feeHistory);
  };


  return (
    <div className="md:min-h-screen">
      {loading && <p>Loading data...</p>}
      {error && <p>{error}</p>}

      <div className="flex items-center  mb-5">

        <Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    <TextField
      variant="standard"
      InputLabelProps={{ shrink: true }}
      type="date"
      label="Start Date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      fullWidth // Ensures the input field takes up full width
    />
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    <TextField
      variant="standard"
      InputLabelProps={{ shrink: true }}
      type="date"
      label="End Date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      fullWidth // Ensures the input field takes up full width
    />
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Button
      onClick={handleDateFilter}
      variant="contained"
      style={{ backgroundColor: currentColor, color: "white" }}
      fullWidth 
    >
      Filter
    </Button>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Button
      onClick={clearDateFilter}
      variant="contained"
      style={{ backgroundColor: "#424242", color: "white" }}
      fullWidth
    >
      Clear
    </Button>
  </Grid>
</Grid>

      </div>


        {feeHistory.length > 0 ? (<div className="relative  md:max-h-screen overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  S No.
                </th>
                <th scope="col" className="px-6 py-3">
                  Admission No.
                </th>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Class
                </th>
                <th scope="col" className="px-6 py-3">
                  Receipt No.
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Additional Fee
                </th> */}
                <th scope="col" className="px-6 py-3">
                  Regular Fee
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Pay Mode
                </th> */}
                <th scope="col" className="px-2 py-3">
                  Pay Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Remarks
                </th>

                <th scope="col" className="px-6 py-3">
                  Dues
                </th>
                <th scope="col" className="px-6 py-3">
                 Paid
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Previous Dues
                </th> */}
                <th scope="col" className="px-1 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFeeHistory
                ? filteredFeeHistory.map((fees, index) => (
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 text-bold">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </td>
                      <td className="px-6 py-4">{fees.admissionNumber}</td>
                      <td className="px-6 py-4">{fees.studentName}</td>
                      <td className="px-6 py-4">{fees.studentClass}</td>
                      <td className="px-6 py-4">{fees.feeReceiptNumber}</td>
                      
                      <td className="px-2">
                        <div class="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                          <div class="inline-block min-w-full  rounded-lg overflow-hidden">
                            {fees.regularFees.length > 0 || fees.additionalFees.length >0 ? (
                              <table class="min-w-full leading-normal">
                                <thead>
                                  <tr>
                                    <th class="p-1  border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Name
                                    </th>
                                    <th class="p-1  border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Month
                                    </th>
                                    <th class="p-1  border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Amount
                                    </th>
                                    <th class="p-1  border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Dues
                                    </th>
                                    <th class="p-1  border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Status
                                    </th>
                                    <th class="p-1  border-b-2 border-gray-200 bg-gray-50"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {fees.regularFees &&
                                    fees.regularFees.map((addFee) => (
                                      <tr>
                                        <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                          <p class="text-gray-900 whitespace-no-wrap">
                                            Class Fee
                                          </p>
                                        </td>
                                        <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                          <p class="text-gray-900 whitespace-no-wrap">
                                            {addFee.month}
                                          </p>
                                        </td>
                                        <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                          <p class="text-gray-900 whitespace-no-wrap">
                                            {addFee.paidAmount}
                                          </p>
                                        </td>
                                        <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                          <p class="text-gray-900 whitespace-no-wrap">
                                            {addFee.dueAmount}
                                          </p>
                                        </td>
                                        <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                          <span class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                                            <span
                                              aria-hidden
                                              class="absolute inset-0  opacity-50 rounded-full"
                                            ></span>
                                            <span class={`${addFee.status==="Paid" ? "text-green-600":"text-red-600" }`}>
                                              {addFee.status}
                                            </span>
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                                <tbody>
                                  {fees.additionalFees.map((addFee, index) => (
                                    <tr key={index}>
                                      <td class="px-1  border-b border-gray-200 bg-white text-sm">
                                        <p class="text-gray-900 whitespace-no-wrap">
                                          {addFee.name}
                                        </p>
                                      </td>
                                      <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                        <p class="text-gray-900 whitespace-no-wrap">
                                          {addFee.month}
                                        </p>
                                      </td>
                                      <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                        <p class="text-gray-900 whitespace-no-wrap">
                                          {addFee.paidAmount}
                                        </p>
                                      </td>
                                      <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                        <p class="text-gray-900 whitespace-no-wrap">
                                          {addFee.dueAmount}
                                        </p>
                                      </td>
                                      <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                        <span class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                                          <span
                                            aria-hidden
                                            class="absolute inset-0  opacity-50 rounded-full"
                                          ></span>
                                         <span class={`${addFee.status==="Paid" ? "text-green-600":"text-red-600" }`}>
                                            {addFee.status}
                                          </span>
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <h1 className="text-center">No Fee</h1>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* <td className="px-6 py-4">{fees.paymentMode}</td>             */}
                      <td className="px-2 py-4">{format(parseISO(fees.date), 'dd/MM/yyyy')}</td>
                      <td className="px-6 py-4"><p className="max-w-[150px] break-words">{fees.remark}</p></td>
                      <td className="px-6 py-4">{fees.dues}</td>
                      <td className="px-6 py-4">{fees.totalAmountPaid}</td>
                      <td className="px-4 py-4 ">
                        <a
                          onClick={() => handleOpenModal(fees)}
                          className="font-medium text-blue-600 cursor-pointer dark:text-blue-500 hover:underline mr-2"
                        >
                          View
                        </a>
                       
                      </td>
                    </tr>
                  ))
                : ""}
            </tbody>
          </table>
         
          {isOpen && (
            <div
              id="default-modal"
              tabIndex="-1"
              aria-hidden="true"
              className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-[100vh] bg-gray-900 bg-opacity-50"
            >
              <div
                data-aos="fade-down"
              >
                  <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 bg-white">
                    <h3 className="text-xl font-semibold  dark:text-white">
                      FEE RECEIPT
                    </h3>
                    <button
                      onClick={toggleModal}
                      type="button"
                      className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      <svg
                        className="w-3 h-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                        />
                      </svg>
                      <span className="sr-only">Close modal</span>
                    </button>
                  </div>
                  <div
                   className="  bg-gray-50"
                  //  className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh]  overflow-auto  bg-gray-50"
                   >
                   
                      {modalData && (
                        <FeeRecipt
                          modalData={modalData}
                          handleCloseModal={toggleModal}
                        />
                      )}
                    {/* </div> */}
                  </div>
                </div>
              </div>
            // </div>
          )}
        </div>) : <NoDataFound/>}
        
    </div>
  );
};

export default Table;

// import axios from "axios";
// import Cookies from "js-cookie";
// import React, { useEffect, useState } from "react";
// const Table = (data) => {
//   const authToken = Cookies.get("token");
//   const [feeHistory, setFeeHistory] = useState([]);
//   const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
//   const getFeeHistory = async () => {
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/fees/feeHistory",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );
//       setFeeHistory(response.data.data);
//       console.log("response.data.data", response.data.data);
//       setFilteredFeeHistory(response.data.data);
//     } catch (error) {
//       console.error("Error fetching fee history:", error);
//     }
//   };
//   useEffect(() => {
//     getFeeHistory();
//   }, []);

//   const groupAndSortByDate = () => {
//     const groupedData = {};
//     filteredFeeHistory.forEach((fee) => {
//       const dateKey = new Date(fee.date).toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "long",
//         year: "numeric",
//       });
//       if (!groupedData[dateKey]) {
//         groupedData[dateKey] = [];
//       }
//       groupedData[dateKey].push(fee);
//     });

//     const groupedDataArray = Object.entries(groupedData);
//     groupedDataArray.sort((a, b) => new Date(b[0]) - new Date(a[0]));
//     return groupedDataArray;
//   };

//   return (
//     <>
//       <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
//         <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
//           <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
//             <tr>
//               <th scope="col" className="px-6 py-3">
//                 S No.
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Admission No.
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Name
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Class
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Receipt No.
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Additional Fee
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Regular Fee
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Pay Mode
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Payment Date
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Remarks
//               </th>

//               <th scope="col" className="px-6 py-3">
//                 Dues
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Total Paid
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Previous Dues
//               </th>
//               <th scope="col" className="px-1 py-3">
//                 Action
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {feeHistory
//               ? feeHistory.map((fees, index) => (
//                   <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
//                     <td className="px-6 py-4 text-bold">{index + 1}</td>
//                     <td className="px-6 py-4">{fees.admissionNumber}</td>
//                     <td className="px-6 py-4">{fees.studentName}</td>
//                     <td className="px-6 py-4">{fees.studentClass}</td>
//                     <td className="px-6 py-4">{fees.feeReceiptNumber}</td>
//                     <td className="px-2">
//                       <div class="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
//                         <div class="inline-block min-w-full  rounded overflow-hidden">
//                           {fees.additionalFees.length > 0 ? (
//                             <table class="min-w-full leading-normal">
//                               <thead>
//                                 <tr>
//                                   <th class="p-1 py-3 border-b-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                     Name
//                                   </th>
//                                   <th class="p-1 py-3 border-b-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                     Month
//                                   </th>
//                                   <th class="p-1 py-3 border-b-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                     Amount
//                                   </th>
//                                   <th class="p-1 py-3 border-b-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                     Dues
//                                   </th>
//                                   <th class="p-1 py-3 border-b-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                     Status
//                                   </th>
//                                   <th class="p-1 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
//                                 </tr>
//                               </thead>

//                               <tbody>
//                                 {fees.additionalFees.map((addFee) => (
//                                   <tr>
//                                     <td class="p-1  border-b border-gray-200 bg-white text-sm">
//                                       <p class="text-gray-900 whitespace-no-wrap">
//                                         {addFee.name}
//                                       </p>
//                                     </td>
//                                     <td class="p-1 border-b border-gray-200 bg-white text-sm">
//                                       <p class="text-gray-900 whitespace-no-wrap">
//                                         {addFee.month}
//                                       </p>
//                                     </td>
//                                     <td class="p-1 border-b border-gray-200 bg-white text-sm">
//                                       <p class="text-gray-900 whitespace-no-wrap">
//                                         {addFee.paidAmount}
//                                       </p>
//                                     </td>
//                                     <td class="p-1 border-b border-gray-200 bg-white text-sm">
//                                       <p class="text-gray-900 whitespace-no-wrap">
//                                         {addFee.dueAmount}
//                                       </p>
//                                     </td>
//                                     <td class="p-1 border-b border-gray-200 bg-white text-sm">
//                                       <span class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
//                                         <span
//                                           aria-hidden
//                                           class="absolute inset-0 bg-green-200 opacity-50 rounded-full"
//                                         ></span>
//                                         <span class="relative">
//                                           {addFee.status}
//                                         </span>
//                                       </span>
//                                     </td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           ) : (
//                             <h1 className="text-center">No Fee</h1>
//                           )}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-2">
//                       <div class="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
//                         <div class="inline-block min-w-full  rounded-lg overflow-hidden">
//                           {fees.regularFees.length > 0 ? (
//                             <table class="min-w-full leading-normal">
//                               <thead>
//                                 <tr>
//                                   <th class="p-1 py-3 border-b-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                     Month
//                                   </th>
//                                   <th class="p-1 py-3 border-b-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                     Amount
//                                   </th>
//                                   <th class="p-1 py-3 border-b-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                     Dues
//                                   </th>
//                                   <th class="p-1 py-3 border-b-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                     Status
//                                   </th>
//                                   <th class="p-1 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
//                                 </tr>
//                               </thead>

//                               <tbody>
//                                 {fees.regularFees &&
//                                   fees.regularFees.map((addFee) => (
//                                     <tr>
//                                       <td class="p-1 border-b border-gray-200 bg-white text-sm">
//                                         <p class="text-gray-900 whitespace-no-wrap">
//                                           {addFee.month}
//                                         </p>
//                                       </td>
//                                       <td class="p-1 border-b border-gray-200 bg-white text-sm">
//                                         <p class="text-gray-900 whitespace-no-wrap">
//                                           {addFee.paidAmount}
//                                         </p>
//                                       </td>
//                                       <td class="p-1 border-b border-gray-200 bg-white text-sm">
//                                         <p class="text-gray-900 whitespace-no-wrap">
//                                           {addFee.dueAmount}
//                                         </p>
//                                       </td>
//                                       <td class="p-1 border-b border-gray-200 bg-white text-sm">
//                                         <span class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
//                                           <span
//                                             aria-hidden
//                                             class="absolute inset-0 bg-green-200 opacity-50 rounded-full"
//                                           ></span>
//                                           <span class="relative">
//                                             {addFee.status}
//                                           </span>
//                                         </span>
//                                       </td>
//                                     </tr>
//                                   ))}
//                               </tbody>
//                             </table>
//                           ) : (
//                             <h1 className="text-center">No Fee</h1>
//                           )}
//                         </div>
//                       </div>
//                     </td>

//                     <td className="px-6 py-4">{fees.paymentMode}</td>

//                     <td className="px-6 py-4">{fees.date}</td>
//                     <td className="px-6 py-4">{fees.remark}</td>
//                     <td className="px-6 py-4">{fees.dues}</td>

//                     <td className="px-6 py-4">{fees.totalAmountPaid}</td>
//                     <td className="px-6 py-4">{fees.previousDues}</td>
//                     <td className="px-4 py-4 ">
//                       <a
//                         // href="#"
//                         onClick={() => handleOpenModal(params.row)}
//                         className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-2"
//                       >
//                         View
//                       </a>
//                       <a
//                         href="#"
//                         className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
//                       >
//                         Edit
//                       </a>
//                     </td>
//                   </tr>
//                 ))
//               : ""}
//           </tbody>
//         </table>
//         {/* <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
//         <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto">Showing <span className="font-semibold text-gray-900 dark:text-white">1-10</span> of <span className="font-semibold text-gray-900 dark:text-white">1000</span></span>
//         <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
//             <li>
//                 <a href="#" className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Previous</a>
//             </li>
//             <li>
//                 <a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">1</a>
//             </li>
//             <li>
//                 <a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">2</a>
//             </li>
//             <li>
//                 <a href="#" aria-current="page" className="flex items-center justify-center px-3 h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white">3</a>
//             </li>
//             <li>
//                 <a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">4</a>
//             </li>
//             <li>
//                 <a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">5</a>
//             </li>
//             <li>
//         <a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Next</a>
//             </li>
//         </ul>
//     </nav> */}
//       </div>
//     </>
//   );
// };

// export default Table;
