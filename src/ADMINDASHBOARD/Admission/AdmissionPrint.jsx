import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { useStateContext } from "../../contexts/ContextProvider.js";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";

import { MdFileDownload } from "react-icons/md";

function AdmissionPrint({studentValues}) {
  console.log("studentValues?",studentValues)
  const { currentColor } = useStateContext();
  const authToken = Cookies.get("token");
  const schoolName = sessionStorage.getItem("schoolName");
  const SchoolImage = sessionStorage.getItem("image");
  const SchoolEmail = sessionStorage.getItem("email");
  const schoolAddress = sessionStorage.getItem("schooladdress");
  const schoolContact = sessionStorage.getItem("contact");
  const { email } = useParams();

  const componentPDF = useRef();
  // const [studentValues?, setstudentValues?] = useState({});
  const formattedDate = new Date(studentValues?.dateOfBirth).toLocaleDateString();
  const AdmissionDate = new Date(studentValues?.joiningDate).toLocaleDateString();
  useEffect(() => {
    axios
      .get(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getDataByAdmissionNumber/${email}`,
        // `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents?email=${email}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      )
      .then((response) => {
        // const data = response.data.allStudent[0];
        // console.log("response", response.data);
        // setstudentValues?(response.data.studentValues?);
      })
      .catch((error) => console.log("error", error));
  }, []);

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: `${studentValues?.fullName},Admission form`,
    onAfterPrint: () => alert("Downloaded"),
  });
  return (
    <>
    
     <div className="bg-gray-200 border border-gray-300 w-full flex justify-center items-center px-5">
        {/* <div className="w-full mx-auto flex justify-start gap-2 text-[10px] ">
          <Link to="/admin">Dashboard » </Link>
          <Link to="/admin/admission">Students » </Link>
          <Link to="" className="text-gray-500">
            Students Details
          </Link>
        </div> */}
        <span  onClick={generatePDF} style={{cursor:"pointer"}} className="whitespace-nowrap flex items-center"><MdFileDownload/> Download Pdf</span>
      </div>
     

     <div className="w-full flex justify-center">
     <div className="a4 ">
        <div className="content border m-1">
          <div
            ref={componentPDF}
            className="p-12 "
            // ye A4 size hai
          >
            <div className="border border-red-500 p-5 relative">
              <div class=" absolute  left-5 ">
                <img
                  src={SchoolImage}
                  alt="Citi Ford School Logo"
                  class="md:w-36 md:h-36 h-20 w-20 mx-auto rounded-full"
                />
              </div>
              <div class="flex  justify-center inset-0 rounded-md z-50">
                <div class="md:w-7/12 w-10/12 text-center">
                  <h1 class="md:text-3xl text-lg font-bold mb-2 text-center text-gray-800 dark:text-white">
                    {schoolName}
                  </h1>
                  <div class="text- leading-5 ">
                    <span class="block text-center mb-1  ">
                      {schoolAddress}
                    </span>

                    <span class="block text-center mb-1">
                      Email:- {SchoolEmail}
                      <br />
                      Contact :- {schoolContact}
                    </span>
                  </div>
                </div>
              </div>
              <center>
                <h3 class="text-red-700 font-bold underline">
                  [ENGLISH MEDIUM]
                </h3>
              </center>
              <center>
                <span class="text-[12px ]">Session : 2024-25</span>
              </center>
              <div class="mb-1 rounded-md flex justify-between">
                <div class="flex flex-col justify-between">
                  <p class="border border-black w-52 p-2 mb-4">
                    Admission No :-{" "}
                    <span className="text-blue-800 font-bold">
                      {studentValues?.admissionNumber}
                    </span>
                  </p>
                  <span class="border bg-green-800 text-white p-2">
                    APPLICATION FORM RECEIPT
                  </span>
                </div>
                <div class="border border-black w-36 h-36 flex items-center justify-center">
                  <img
                    src={studentValues?.image?.url}
                    alt="img"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="dark:text-white text-[16px]">
                <div className="mb-3">
                  <tr class="">
                    <th
                      scope="row"
                      class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                    >
                      Name of Student :
                    </th>
                    <td class=" border-b-2 border-dashed w-full">
                      &nbsp;{studentValues?.fullName}
                    </td>
                  </tr>
                </div>

                <div className="">
                  <div className="mb-3 flex w-full justify-between">
                    <tr class="w-full">
                      <th
                        scope="row"
                        class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        Gender :
                      </th>
                      <td class=" border-b-2 border-dashed w-full">
                        &nbsp; {studentValues?.gender}
                      </td>
                    </tr>
                    <tr class="w-full ">
                      <th
                        scope="row"
                        class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        Date of Birth :
                      </th>
                      <td class="  border-b-2 border-dashed w-full">
                        &nbsp; {formattedDate}
                      </td>
                    </tr>
                  </div>

                  <div className="mb-3">
                    <tr class="">
                      <th
                        scope="row"
                        class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        Email :
                      </th>
                      <td class=" border-b-2 border-dashed w-full">
                        &nbsp; {studentValues?.email}
                      </td>
                    </tr>
                  </div>
                  <div className="mb-3 flex w-full justify-between">
                    <tr class="w-full">
                      <th
                        scope="row"
                        class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        Father :
                      </th>
                      <td class=" border-b-2 border-dashed w-full">
                        &nbsp; {studentValues?.fatherName}
                      </td>
                    </tr>
                    <tr class="w-full ">
                      <th
                        scope="row"
                        class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        Mother :
                      </th>
                      <td class="  border-b-2 border-dashed w-full">
                        &nbsp; {studentValues?.motherName}
                      </td>
                    </tr>
                  </div>

                  <div className="mb-3">
                    <tr class="">
                      <th
                        scope="row"
                        class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        Occupation Father :
                      </th>
                      <td class=" border-b-2 border-dashed w-full">
                        &nbsp; {studentValues?.fatherName}
                      </td>
                    </tr>
                  </div>
                  <div className="mb-3">
                    <tr class="">
                      <th
                        scope="row"
                        class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        Address :
                      </th>
                      <td class=" border-b-2 border-dashed w-full">
                        &nbsp; {studentValues?.address},{studentValues?.city},
                        {studentValues?.state},
                        <span className="text-gray-900 font-bold">
                          {studentValues?.pincode}
                        </span>
                      </td>
                    </tr>
                  </div>
                  <div className="mb-3">
                    <tr class="">
                      <th
                        scope="row"
                        class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        Mobile No. : 
                      </th>
                      <td class=" border-b-2 border-dashed w-full">
                        &nbsp; {studentValues?.contact}
                      </td>
                    </tr>
                  </div>
                  <div className="mb-3 flex w-full justify-between">
                    <tr class="w-full ">
                      <th
                        scope="row"
                        class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        Caste :
                      </th>
                      <td class="  border-b-2 border-dashed w-full">
                        &nbsp; {studentValues?.caste}
                      </td>
                    </tr>
                    <tr class="w-full">
                      <th
                        scope="row"
                        class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        Religion :
                      </th>
                      <td class=" border-b-2 border-dashed w-full">
                        &nbsp; {studentValues?.religion}
                      </td>
                    </tr>
                  </div>
                  <div className="mb-3 flex w-full justify-between">
                    <tr class="w-full ">
                      <th
                        scope="row"
                        class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        Country :
                      </th>
                      <td class="  border-b-2 border-dashed w-full">
                        &nbsp; {studentValues?.country}
                      </td>
                    </tr>
                    <tr class="w-full">
                      <th
                        scope="row"
                        class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        Nationality :
                      </th>
                      <td class=" border-b-2 border-dashed w-full">
                        &nbsp; {studentValues?.nationality}
                      </td>
                    </tr>
                  </div>
                  <div className="mb-3">
                    <tr class="">
                      <th
                        scope="row"
                        class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        Class in which admission sought
                      </th>
                      <td class=" border-b-2 border-dashed w-full">
                        &nbsp; {studentValues?.class}-{studentValues?.section}
                      </td>
                    </tr>
                  </div>
                  <div className=" flex justify-start mt-4 ">
                    <tr class="">
                      <th
                        scope="row"
                        class=" font-semibold  text-gray-700 dark:text-white whitespace-nowrap"
                      >
                        Admission Date : &nbsp; {AdmissionDate}
                      </th>
                    </tr>
                  </div>
                  <div className=" flex justify-end ">
                    <tr class="mt-10">
                      <th
                        scope="row"
                        class=" font-semibold  text-gray-700 dark:text-white whitespace-nowrap"
                      >
                        Principal
                      </th>
                    </tr>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
     </div>
    </>
  );
}

export default AdmissionPrint;



// import React, { useEffect, useRef, useState } from "react";
// import Cookies from "js-cookie";
// import { Link, useParams } from "react-router-dom";
// import axios from "axios";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// import { Button } from "@mui/material";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import DownloadIcon from "@mui/icons-material/Download";
// function AdmissionPrint() {
//   const { currentColor } = useStateContext();
//   const authToken = Cookies.get("token");
//   const schoolName = sessionStorage.getItem("schoolName");
//   const SchoolImage = sessionStorage.getItem("image");
//   const SchoolEmail = sessionStorage.getItem("email");
//   const schoolAddress = sessionStorage.getItem("schooladdress");
//   const schoolContact = sessionStorage.getItem("contact");
//   const { email } = useParams();

//   const componentPDF = useRef();
//   const [studentData, setStudentData] = useState({});
//   const formattedDate = new Date(studentData.dateOfBirth).toLocaleDateString();
//   const AdmissionDate = new Date(studentData.joiningDate).toLocaleDateString();
//   useEffect(() => {

//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getDataByAdmissionNumber/${email}`,
//         // `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents?email=${email}`,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       )
//       .then((response) => {
//         // const data = response.data.allStudent[0];
//         // console.log("response", response.data);
//         setStudentData(response.data.studentData);
//       })
//       .catch((error) => console.log("error", error));
//   }, []);

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `${studentData.fullName},Admission form`,
//     onAfterPrint: () => alert("Downloaded"),
//   });
//   return (
//     <>
//       <div className="flex justify-between md:w-[90%] mx-auto w-full z-[999999]">
//         <Link to="/admin/admission">
//           <Button
//             variant="contained"
//             startIcon={<ArrowBackIcon />}
//             style={{ backgroundColor: currentColor, color: "white" }}
//           >
//             Back
//           </Button>
//         </Link>
//         <Button
//           variant="contained"
//           onClick={generatePDF}
//           startIcon={<DownloadIcon />}
//           style={{ backgroundColor: currentColor, color: "white" }}
//         >
//           download
//         </Button>
//       </div>

//       <div
//         ref={componentPDF}
//         className="dark:text-white relative dark:bg-secondary-dark-bg inset-4 border-2 border-black md:w-10/12 w-full mx-auto bg-cover bg-center bg-no-repeat md:p-5 mt-3"
//       >
//          <div class=" mb-5 absolute top-0 left-5">
//             <img
//               src={SchoolImage}
//               alt="Citi Ford School Logo"
//               class="md:w-36 md:h-36 h-20 w-20 mx-auto rounded-full"
//             />
//           </div>
//         <div class="flex  justify-center inset-0 rounded-md z-50">

//           <div class="md:w-7/12 w-10/12 text-center">
//             <h1 class="md:text-3xl text-lg font-bold mb-2 text-center text-gray-800 dark:text-white">
//               {schoolName}
//             </h1>
//             <div class="text- leading-5 ">
//               <span class="block text-center mb-1  ">{schoolAddress}</span>

//               <span class="block text-center mb-1">
//                 Email:- {SchoolEmail}
//                 <br />
//                 Contact :- {schoolContact}
//               </span>
//             </div>
//           </div>
//         </div>
//         <center>
//           <h3 class="text-red-700 font-bold underline">[ENGLISH MEDIUM]</h3>
//         </center>
//         <center>
//           <span class="text-[12px ]">Session : 2024-25</span>
//         </center>
//         <div class=" m-5 rounded-md flex justify-between">
//           <div class="flex flex-col justify-between">
//             <p class="border border-black w-52 p-2 mb-4">
//               Admission No :- <span className="text-blue-800 font-bold">{studentData?.admissionNumber}</span>
//             </p>
//             <span class="border bg-green-800 text-white p-2">
//               APPLICATION FORM RECEIPT
//             </span>
//           </div>
//           <div class="border border-black w-36 h-36 flex items-center justify-center">
//             <img src={studentData.image?.url} alt="img"  className="w-full h-full object-contain"/>
//           </div>
//         </div>
//         <div className="dark:text-white">
//           <div className="mb-3">
//             <tr class="">
//               <th
//                 scope="row"
//                 class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//               >
//                 Name of Student :
//               </th>
//               <td class="px-6 border-b-2 border-dashed w-full">
//                 {studentData.fullName}
//               </td>
//             </tr>
//           </div>

//           <div className="">
//             <div className="mb-3 flex w-full justify-between">
//               <tr class="w-full">
//                 <th
//                   scope="row"
//                   class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                 >
//                   Gender :
//                 </th>
//                 <td class="px-6 border-b-2 border-dashed w-full">
//                   {studentData.gender}
//                 </td>
//               </tr>
//               <tr class="w-full ">
//                 <th
//                   scope="row"
//                   class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                 >
//                   Date of Birth :
//                 </th>
//                 <td class="px-6  border-b-2 border-dashed w-full">
//                   {formattedDate}
//                 </td>
//               </tr>
//             </div>

//             <div className="mb-3">
//               <tr class="">
//                 <th
//                   scope="row"
//                   class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                 >
//                   Email :
//                 </th>
//                 <td class="px-6 border-b-2 border-dashed w-full">
//                   {studentData.email}
//                 </td>
//               </tr>
//             </div>
//             <div className="mb-3 flex w-full justify-between">
//               <tr class="w-full">
//                 <th
//                   scope="row"
//                   class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                 >
//                  Father :
//                 </th>
//                 <td class="px-6 border-b-2 border-dashed w-full">
//                   {studentData.fatherName}
//                 </td>
//               </tr>
//               <tr class="w-full ">
//                 <th
//                   scope="row"
//                   class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                 >
//                  Mother :
//                 </th>
//                 <td class="px-6  border-b-2 border-dashed w-full">
//                   {studentData.motherName}
//                 </td>
//               </tr>
//             </div>

//             <div className="mb-3">
//               <tr class="">
//                 <th
//                   scope="row"
//                   class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                 >
//                   Occupation Father :
//                 </th>
//                 <td class="px-6 border-b-2 border-dashed w-full">
//                   {studentData.fatherName}
//                 </td>
//               </tr>
//             </div>
//             <div className="mb-3">
//               <tr class="">
//                 <th
//                   scope="row"
//                   class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                 >
//                   Address :
//                 </th>
//                 <td class="px-6 border-b-2 border-dashed w-full">
//                   {studentData.address},{studentData.city},{studentData.state},
//                   <span className="text-gray-900 font-bold">
//                     {studentData.pincode}
//                   </span>
//                 </td>
//               </tr>
//             </div>
//             <div className="mb-3">
//               <tr class="">
//                 <th
//                   scope="row"
//                   class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                 >
//                   Mobile No.
//                 </th>
//                 <td class="px-6 border-b-2 border-dashed w-full">
//                   {studentData.contact}
//                 </td>
//               </tr>
//             </div>
//             <div className="mb-3 flex w-full justify-between">
//               <tr class="w-full ">
//                 <th
//                   scope="row"
//                   class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                 >
//                   Caste :
//                 </th>
//                 <td class="px-6  border-b-2 border-dashed w-full">
//                   {studentData.caste}
//                 </td>
//               </tr>
//               <tr class="w-full">
//                 <th
//                   scope="row"
//                   class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                 >
//                   Religion :
//                 </th>
//                 <td class="px-6 border-b-2 border-dashed w-full">
//                   {studentData.religion}
//                 </td>
//               </tr>
//             </div>
//             <div className="mb-3 flex w-full justify-between">
//               <tr class="w-full ">
//                 <th
//                   scope="row"
//                   class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                 >
//                   Country :
//                 </th>
//                 <td class="px-6  border-b-2 border-dashed w-full">
//                   {studentData.country}
//                 </td>
//               </tr>
//               <tr class="w-full">
//                 <th
//                   scope="row"
//                   class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                 >
//                   Nationality :
//                 </th>
//                 <td class="px-6 border-b-2 border-dashed w-full">
//                   {studentData.nationality}
//                 </td>
//               </tr>
//             </div>
//             <div className="mb-3">
//               <tr class="">
//                 <th
//                   scope="row"
//                   class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                 >
//                   Class in which admission sought
//                 </th>
//                 <td class="px-6 border-b-2 border-dashed w-full">
//                   {studentData.class}-{studentData.section}
//                 </td>
//               </tr>
//             </div>
//             <div className=" flex justify-start mt-4 ">
//               <tr class="">
//                 <th
//                   scope="row"
//                   class="px-6 font-semibold  text-gray-700 dark:text-white whitespace-nowrap"
//                 >
//                 Admission Date : {AdmissionDate}
//                 </th>
//               </tr>
//             </div>
//             <div className=" flex justify-end ">
//               <tr class="mt-10">
//                 <th
//                   scope="row"
//                   class="px-6 font-semibold  text-gray-700 dark:text-white whitespace-nowrap"
//                 >
//                   Principal
//                 </th>
//               </tr>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default AdmissionPrint;
