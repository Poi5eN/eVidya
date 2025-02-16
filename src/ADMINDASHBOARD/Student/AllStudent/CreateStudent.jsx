import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "../../../Dynamic/Form/FormStyle.css";
import { useStateContext } from "../../../contexts/ContextProvider.js";
import Cookies from "js-cookie";
import Loading from "../../../Loading";
import useCustomQuery from "../../../useCustomQuery";
import SomthingwentWrong from "../../../SomthingwentWrong";
import NoDataFound from "../../../NoDataFound.jsx";
import Heading2 from "../../../Dynamic/Heading2.jsx";
import DynamicDataTable from "../../../Dynamic/DynamicDataTable.jsx";
import { getAllStudentColumns } from "../../../Dynamic/utils/TableUtils.jsx";
import { useReactToPrint } from "react-to-print";
import PrintTable from "./PrintTable"; // Import PrintTable component
import ExportToExcel from "./ExportToExcel"; // Import ExportToExcel component
import pdf from '../../../Icone/pdf.png'
function CreateStudent() {
  const authToken = Cookies.get("token");
  const { currentColor } = useStateContext();
  const [getClass, setGetClass] = useState([]); // All classes
  const [selectedClass, setSelectedClass] = useState(""); // Selected class
  const [selectedSection, setSelectedSection] = useState(""); // Selected section
  const [availableSections, setAvailableSections] = useState([]); // Sections for selected class
  const [submittedData, setSubmittedData] = useState([]); // All student data
  const [filteredData, setFilteredData] = useState([]); // Filtered student data

  const { queryData: studentData, error: studentError, loading: studentLoading } =
    useCustomQuery(
      "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents"
    );

  const printRef = useRef(); // Ref for the PrintTable component

  // Fetch all classes
  useEffect(() => {
    axios
      .get(`https://eshikshaserver.onrender.com/api/v1/adminRoute/getAllClasses`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        let classes = response.data.classList;
        setGetClass(classes.sort((a, b) => a - b));
      })
      .catch((error) => {
        console.error("Error fetching classes:", error);
      });
  }, []);

  // Fetch all student data
  useEffect(() => {
    if (studentData) {
      setSubmittedData(studentData.allStudent);
      setFilteredData(studentData.allStudent); // Initially, show all students
    }
  }, [studentData]);

  // Filter data based on class and section
  useEffect(() => {
    let filtered = submittedData;

    if (selectedClass) {
      filtered = filtered.filter((student) => student.class === selectedClass);
    }

    if (selectedSection) {
      filtered = filtered.filter((student) => student.section === selectedSection);
    }

    setFilteredData(filtered);
  }, [selectedClass, selectedSection, submittedData]);

  // Handle class selection
  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);

    const selectedClassObj = getClass?.find(
      (cls) => cls.className === selectedClassName
    );

    if (selectedClassObj) {
      setAvailableSections(selectedClassObj.sections.split(", "));
    } else {
      setAvailableSections([]);
    }

    setSelectedSection(""); // Reset section when class changes
  };

  // Handle section selection
  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  // Handle delete student
  const handleDelete = (email) => {
    axios
      .put(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deactivateStudent`,
        { email },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then(() => {
        const filterData = submittedData.filter((item) => item.email !== email);
        setSubmittedData(filterData);
        toast.success("Student data deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting Student data:", error);
        toast.error("An error occurred while deleting the Student data.");
      });
  };

  // Print functionality
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @media print {
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        body {
          font-family: Arial, sans-serif;
          -webkit-print-color-adjust: exact;
        }
        .page {
          page-break-after: always;
        }
        .print-header {
          font-size: 20px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 10px;
        }
        .print-table {
          width: 100%;
          border-collapse: collapse;
        }
        .print-table th, .print-table td {
          border: 1px solid black;
          padding: 5px;
          text-align: left;
        }
        .print-table th {
          background-color: #f2f2f2;
        }
      }
    `,
  });

  if (studentError) {
    return <SomthingwentWrong />;
  }
  if (studentLoading) {
    return <Loading />;
  }

  return (
    <div className="md:h-screen mt-12 md:mt-1 mx-auto p-1 overflow-hidden">
      <Heading2 title={"Students"} />
<div className="flex justify-between">
<div className="flex space-x-4 ">
        <select
          name="studentClass"
          className="border px-2 py-1 rounded"
          value={selectedClass}
          onChange={handleClassChange}
        >
          <option value="">Select Class</option>
          {getClass?.map((cls, index) => (
            <option key={index} value={cls.className}>
              {cls.className}
            </option>
          ))}
        </select>
        <select
          name="studentSection"
          className="border px-2 py-1 rounded"
          value={selectedSection}
          onChange={handleSectionChange}
          disabled={!selectedClass}
        >
          <option value="">Select Section</option>
          {availableSections?.map((section, index) => (
            <option key={index} value={section}>
              {section}
            </option>
          ))}
        </select>
      </div>

      {/* Print & Export Buttons */}
      <div className="flex space-x-2">
        {/* <button
          onClick={handlePrint}
          style={{ backgroundColor: currentColor }}
          className="px-4 py-2 text-white rounded shadow-md no-print"
        >
          Print Student Data
        </button> */}
        <img src={pdf} alt=""  className="h-8 cursor-pointer"   onClick={handlePrint} />
       
        <ExportToExcel data={filteredData} fileName="Students_Report" />
      </div>
</div>
      {filteredData.length > 0 ? (
        <DynamicDataTable
          data={filteredData}
          columns={getAllStudentColumns(handleDelete)}
          handleDelete={handleDelete}
          className="w-full overflow-auto"
          // itemsPerPage={15}
        />
      ) : (
        <NoDataFound />
      )}

      {/* Hidden Printable Table */}{}
    <div className="hidden"> 
    <PrintTable ref={printRef} data={filteredData} itemsPerPage={25} />
    </div>
    </div>
  );
}

export default CreateStudent;




// import React, { useState, useEffect, useRef } from "react";
// import { toast } from "react-toastify";
// import axios from "axios";
// import "../../../Dynamic/Form/FormStyle.css";
// import { useStateContext } from "../../../contexts/ContextProvider.js";
// import Cookies from "js-cookie";
// import Loading from "../../../Loading";
// import useCustomQuery from "../../../useCustomQuery";
// import SomthingwentWrong from "../../../SomthingwentWrong";
// import NoDataFound from "../../../NoDataFound.jsx";
// import Heading2 from "../../../Dynamic/Heading2.jsx";
// import DynamicDataTable from "../../../Dynamic/DynamicDataTable.jsx";
// import { getAllStudentColumns } from "../../../Dynamic/utils/TableUtils.jsx";
// import { useReactToPrint } from "react-to-print";
// import PrintTable from "./PrintTable"; // Import PrintTable component
// import ExportToExcel from "./ExportToExcel"; // Import ExportToExcel component

// function CreateStudent() {
//   const authToken = Cookies.get("token");
//    const [getClass, setGetClass] = useState([]);
//      const [selectedClass, setSelectedClass] = useState("");
//        const [availableSections, setAvailableSections] = useState([]);
//   const { currentColor } = useStateContext();
//   const [submittedData, setSubmittedData] = useState([]);
//   const { queryData: studentData, error: studentError, loading: studentLoading } = useCustomQuery("https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents");

//   const printRef = useRef(); // Ref for the PrintTable component
//   useEffect(() => {
//     axios
//       .get(
//         `https://eshikshaserver.onrender.com/api/v1/adminRoute/getAllClasses`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         let classes = response.data.classList;

//         setGetClass(classes.sort((a, b) => a - b));
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   }, []);

//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     const selectedClassObj = getClass?.find(
//       (cls) => cls.className === selectedClassName
//     );

//     if (selectedClassObj) {
//       setAvailableSections(selectedClassObj.sections.split(", "));
//     } else {
//       setAvailableSections([]);
//     }
//   };

//   // Fetch data from API
//   useEffect(() => {
//     if (studentData) {
//       setSubmittedData(studentData.allStudent);
//     }
//   }, [studentData]);

//   // Handle delete student
//   const handleDelete = (email) => {
//     axios
//       .put(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deactivateStudent`,
//         { email },
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then(() => {
//         const filterData = submittedData.filter((item) => item.email !== email);
//         setSubmittedData(filterData);
//         toast.success("Student data deleted successfully");
//       })
//       .catch((error) => {
//         console.error("Error deleting Student data:", error);
//         toast.error("An error occurred while deleting the Student data.");
//       });
//   };

//   // Print functionality
//   const handlePrint = useReactToPrint({
//     content: () => printRef.current, // Specify the PrintTable component
//     pageStyle: `
//       @media print {
//         @page {
//           size: A4 portrait; /* Portrait mode */
//           margin: 15mm; /* Adjust margins */
//         }
//         body {
//           font-family: Arial, sans-serif;
//           -webkit-print-color-adjust: exact; /* Ensure colors print correctly */
//         }
//         .page {
//           page-break-after: always;
//         }
//         .print-header {
//           font-size: 20px;
//           font-weight: bold;
//           text-align: center;
//           margin-bottom: 10px;
//         }
//         .print-table {
//           width: 100%; /* Full width for portrait */
//           border-collapse: collapse; /* Remove spacing between table cells */
//         }
//         .print-table th, .print-table td {
//           border: 1px solid black; /* Border around cells */
//           padding: 5px; /* Space inside cells */
//           text-align: left; /* Default alignment */
//         }
//         .print-table th {
//           background-color: #f2f2f2; /* Header background color */
//         }
//       }
//     `,
//   });

//   if (studentError) {
//     return <SomthingwentWrong />;
//   }
//   if (studentLoading) {
//     return <Loading />;
//   }

//   return (
//     <div className="md:h-screen mt-12 md:mt-1 mx-auto p-1 overflow-hidden">
//       <Heading2 title={"Students"} />

//       {/* Print & Export Buttons */}
//       <div>
//       <div className="flex flex-col space-y-1 mt-[2px]">
                     
//                      <select
//                        name="studentClass"
//                        className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                        onFocus={(e) =>
//                          (e.target.style.borderColor = currentColor)
//                        }
//                        onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                        value={selectedClass}
//                        onChange={handleClassChange}
//                        required
//                      >
//                        <option value="" disabled>
//                          Select a Class
//                        </option>
//                        {getClass?.map((cls, index) => (
//                          <option key={index} value={cls.className}>
//                            {cls?.className}
//                          </option>
//                        ))}
//                      </select>
//                    </div>
//                    <div className="flex flex-col space-y-1 mt-[2px]">
                    
//                      <select
//                        name="studentSection"
//                        className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                        onFocus={(e) =>
//                          (e.target.style.borderColor = currentColor)
//                        }
//                        onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                        value={selectedClass}
//                        onChange={handleClassChange}
//                        required
//                      >
//                        <option value="" disabled>
//                       Select a Section
//                        </option>
//                        {availableSections?.map((item, index) => (
//                         <option key={index} value={item}>
//                         {item}
//                       </option>
//                        ))}
//                      </select>
//                    </div>
//       </div>
//       <div className="flex justify-end mb-4 space-x-2">
//         <button
//           onClick={handlePrint}
//           style={{ backgroundColor: currentColor }}
//           className="px-4 py-2 text-white rounded shadow-md no-print"
//         >
//           Print Student Data
//         </button>
//         <ExportToExcel data={submittedData} fileName="Students_Report" />
//       </div>

//       {/* Existing Dynamic Data Table */}
//       {submittedData.length > 0 ? (
//         <DynamicDataTable
//           data={submittedData}
//           columns={getAllStudentColumns(handleDelete)}
//           handleDelete={handleDelete}
//           className="w-full overflow-auto"
//           itemsPerPage={15}
//         />
//       ) : (
//         <NoDataFound />
//       )}

//       {/* Hidden Printable Table */}
//       <PrintTable ref={printRef} data={submittedData} itemsPerPage={25} />
//     </div>
//   );
// }

// export default CreateStudent;




// import React, { useState, useEffect, useRef } from "react";
// import { toast } from "react-toastify";
// import axios from "axios";
// import "../../../Dynamic/Form/FormStyle.css";
// import { useStateContext } from "../../../contexts/ContextProvider.js";
// import Cookies from "js-cookie";
// import Loading from "../../../Loading";
// import useCustomQuery from '../../../useCustomQuery';
// import SomthingwentWrong from "../../../SomthingwentWrong";
// import NoDataFound from "../../../NoDataFound.jsx";
// import Heading2 from "../../../Dynamic/Heading2.jsx";
// import DynamicDataTable from "../../../Dynamic/DynamicDataTable.jsx";
// import { getAllStudentColumns } from "../../../Dynamic/utils/TableUtils.jsx";
// import { useReactToPrint } from "react-to-print";
// import PrintTable from "./PrintTable"; // Import PrintTable component

// function CreateStudent() {
//   const authToken = Cookies.get("token");
//   const { currentColor } = useStateContext();
//   const [submittedData, setSubmittedData] = useState([]);
//   const { queryData: studentData, error: studentError, loading: studentLoading } = useCustomQuery("https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents");

//   const printRef = useRef(); // Ref for the PrintTable component

//   // Fetch data from API
//   useEffect(() => {
//     if (studentData) {
//       setSubmittedData(studentData.allStudent);
//     }
//   }, [studentData]);

//   // Handle delete student
//   const handleDelete = (email) => {
//     axios
//       .put(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deactivateStudent`,
//         { email },
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then(() => {
//         const filterData = submittedData.filter((item) => item.email !== email);
//         setSubmittedData(filterData);
//         toast.success("Student data deleted successfully");
//       })
//       .catch((error) => {
//         console.error("Error deleting Student data:", error);
//         toast.error("An error occurred while deleting the Student data.");
//       });
//   };

//   // Print functionality
//   // const handlePrint = useReactToPrint({
//   //   content: () => printRef.current,
//   //   pageStyle: `
//   //     @media print {
//   //       @page {
//   //         size: A4 portrait; /* Portrait mode */
//   //         margin: 15mm; /* Reduced margins */
//   //       }
//   //       body {
//   //         font-family: Arial, sans-serif;
//   //         -webkit-print-color-adjust: exact;
//   //       }
//   //       .print-header {
//   //         font-size: 20px;
//   //         font-weight: bold;
//   //         text-align: center;
//   //         margin-bottom: 10px;
//   //       }
//   //       .print-table {
//   //         width: 100%; /* Full-width table */
//   //         border-collapse: collapse; /* Compact cells */
//   //       }
//   //       .print-table th, .print-table td {
//   //         border: 1px solid black;
//   //         padding: 4px 8px; /* Reduced padding for compact height */
//   //         text-align: left;
//   //         font-size: 12px; /* Smaller font size */
//   //       }
//   //       .print-table th {
//   //         background-color: #f2f2f2;
//   //         font-size: 13px; /* Slightly larger for headers */
//   //       }
//   //       .print-table td {
//   //         line-height: 1.2; /* Compact row height */
//   //       }
//   //     }
//   //   `,
//   // });
  
//   const handlePrint = useReactToPrint({
//     content: () => printRef.current, // Specify the PrintTable component
//     pageStyle: `
//       @media print {
//         @page {
//           size: A4 portrait; /* Portrait mode */
//           margin: 15mm; /* Adjust margins */
//         }
//         body {
//           font-family: Arial, sans-serif;
//           -webkit-print-color-adjust: exact; /* Ensure colors print correctly */
//         }
//         .page {
//           page-break-after: always;
//         }
//         .print-header {
//           font-size: 20px;
//           font-weight: bold;
//           text-align: center;
//           margin-bottom: 10px;
//         }
//         .print-table {
//           width: 100%; /* Full width for portrait */
//           border-collapse: collapse; /* Remove spacing between table cells */
//         }
//         .print-table th, .print-table td {
//           border: 1px solid black; /* Border around cells */
//           padding: 5px; /* Space inside cells */
//           text-align: left; /* Default alignment */
//         }
//         .print-table th {
//           background-color: #f2f2f2; /* Header background color */
//         }
//         /* Optional: Adjust specific column alignment */
//         .print-table .center {
//           text-align: center;
//         }
//         .print-table .right {
//           text-align: right;
//         }
//       }
//     `,
//   });
  

//   if (studentError) {
//     return <SomthingwentWrong />;
//   }
//   if (studentLoading) {
//     return <Loading />;
//   }

//   return (
//     <div className="md:h-screen mt-12 md:mt-1 mx-auto p-1 overflow-hidden">
//       <Heading2 title={"Students"} />

//       {/* Print Button */}
//       <div className="flex justify-end mb-4">
//         <button
//           onClick={handlePrint}
//           style={{ backgroundColor: currentColor }}
//           className="px-4 py-2 text-white rounded shadow-md no-print"
//         >
//           Print Student Data
//         </button>
//       </div>

//       {/* Existing Dynamic Data Table */}
//       {submittedData.length > 0 ? (
//         <DynamicDataTable
//           data={submittedData}
//           columns={getAllStudentColumns(handleDelete)}
//           handleDelete={handleDelete}
//           className="w-full overflow-auto"
//           itemsPerPage={15}
//         />
//       ) : (
//         <NoDataFound />
//       )}

//       {/* Hidden Printable Table */}
//       <PrintTable ref={printRef} data={submittedData} itemsPerPage={25} />
//     </div>
//   );
// }

// export default CreateStudent;



// import React, { useState, useEffect, useRef } from "react";
// import { toast } from "react-toastify";
// import axios from "axios";
// import "../../../Dynamic/Form/FormStyle.css";
// import { useStateContext } from "../../../contexts/ContextProvider.js";
// import Cookies from "js-cookie";
// import Loading from "../../../Loading";
// import useCustomQuery from '../../../useCustomQuery';
// import SomthingwentWrong from "../../../SomthingwentWrong";
// import NoDataFound from "../../../NoDataFound.jsx";
// import Heading2 from "../../../Dynamic/Heading2.jsx";
// import DynamicDataTable from "../../../Dynamic/DynamicDataTable.jsx";
// import { getAllStudentColumns } from "../../../Dynamic/utils/TableUtils.jsx";
// import { useReactToPrint } from "react-to-print";

// function CreateStudent() {
//   const authToken = Cookies.get("token");
//   const { currentColor } = useStateContext();
//   const [submittedData, setSubmittedData] = useState([]);
//   const { queryData: studentData, error: studentError, loading: studentLoading } = useCustomQuery("https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents");

//   const printRef = useRef(); // Ref for the printable content

//   // Fetch data from API
//   useEffect(() => {
//     if (studentData) {
//       setSubmittedData(studentData.allStudent);
//     }
//   }, [studentData]);

//   // Handle delete student
//   const handleDelete = (email) => {
//     axios
//       .put(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deactivateStudent`,
//         { email },
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then(() => {
//         const filterData = submittedData.filter((item) => item.email !== email);
//         setSubmittedData(filterData);
//         toast.success("Student data deleted successfully");
//       })
//       .catch((error) => {
//         console.error("Error deleting Student data:", error);
//         toast.error("An error occurred while deleting the Student data.");
//       });
//   };

//   // Print functionality
//   const handlePrint = useReactToPrint({
//     content: () => printRef.current, // Specify the content to print
//     pageStyle: `
//       @media print {
//         @page {
//           size: A4;
//           margin: 20mm;
//         }
//         body {
//           font-family: Arial, sans-serif;
//           line-height: 1.5;
//         }
//         .page {
//           page-break-after: always;
//         }
//         .no-print {
//           display: none;
//         }
//         .print-header {
//           font-size: 20px;
//           font-weight: bold;
//           text-align: center;
//           margin-bottom: 10px;
//         }
//         .print-table {
//           width: 100%;
//           border-collapse: collapse;
//         }
//         .print-table th, .print-table td {
//           border: 1px solid black;
//           padding: 8px;
//           text-align: left;
//         }
//         .print-table th {
//           background-color: #f2f2f2;
//         }
//       }
//     `,
//   });

//   if (studentError) {
//     return <SomthingwentWrong />;
//   }
//   if (studentLoading) {
//     return <Loading />;
//   }

//   // Paginate data for print
//   const itemsPerPage = 20; // Number of students per page
//   const paginatedData = [];
//   for (let i = 0; i < submittedData.length; i += itemsPerPage) {
//     paginatedData.push(submittedData.slice(i, i + itemsPerPage));
//   }

//   return (
//     <div className="md:h-screen mt-12 md:mt-1 mx-auto p-1 overflow-hidden">
//       <Heading2 title={"Students"} />

//       {/* Print Button */}
//       <div className="flex justify-end mb-4">
//         <button
//           onClick={handlePrint}
//           style={{ backgroundColor: currentColor }}
//           className="px-4 py-2 text-white rounded shadow-md no-print"
//         >
//           Print Student Data
//         </button>
//       </div>

//       {/* Existing Dynamic Data Table */}
//       {submittedData.length > 0 ? (
//         <DynamicDataTable
//           data={submittedData}
//           columns={getAllStudentColumns(handleDelete)}
//           handleDelete={handleDelete}
//           className="w-full overflow-auto"
//           itemsPerPage={15}
//         />
//       ) : (
//         <NoDataFound />
//       )}

//       {/* Hidden Printable Table */}
//       <div ref={printRef}>
//         {paginatedData.map((pageData, pageIndex) => (
//           <div key={pageIndex} className="page">
//             <div className="print-header">
//               Students Report - Page {pageIndex + 1}
//             </div>
//             <table className="print-table">
//               <thead>
//                 <tr>
//                   <th>S.No</th>
//                   <th>Name</th>
//                   <th>Email</th>
//                   <th>Class</th>
//                   <th>Section</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {pageData.map((student, index) => (
//                   <tr key={student.email}>
//                     <td>{index + 1 + pageIndex * itemsPerPage}</td>
//                     <td>{student.name}</td>
//                     <td>{student.email}</td>
//                     <td>{student.class}</td>
//                     <td>{student.section}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default CreateStudent;



// import React, { useState, useEffect, useRef } from "react";
// import { toast } from "react-toastify";
// import axios from "axios";
// import "../../../Dynamic/Form/FormStyle.css";
// import { useStateContext } from "../../../contexts/ContextProvider.js";
// import Cookies from "js-cookie";
// import Loading from "../../../Loading";
// import useCustomQuery from '../../../useCustomQuery';
// import SomthingwentWrong from "../../../SomthingwentWrong";
// import { useReactToPrint } from "react-to-print";

// function CreateStudent() {
//   const authToken = Cookies.get("token");
//   const { currentColor } = useStateContext();
//   const [submittedData, setSubmittedData] = useState([]);
//   const { queryData: studentData, error: studentError, loading: studentLoading } = useCustomQuery("https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents");

//   const printRef = useRef(); // Ref for the printable content

//   // Fetch data from API
//   useEffect(() => {
//     if (studentData) {
//       setSubmittedData(studentData.allStudent);
//     }
//   }, [studentData]);

//   // Print functionality
//   const handlePrint = useReactToPrint({
//     content: () => printRef.current, // Specify the content to print
//     pageStyle: `
//       @media print {
//         @page {
//           size: A4;
//           margin: 20mm;
//         }
//         body {
//           font-family: Arial, sans-serif;
//           line-height: 1.5;
//         }
//         .page {
//           page-break-after: always;
//         }
//         .no-print {
//           display: none;
//         }
//         .print-header {
//           font-size: 20px;
//           font-weight: bold;
//           text-align: center;
//           margin-bottom: 10px;
//         }
//         .print-table {
//           width: 100%;
//           border-collapse: collapse;
//         }
//         .print-table th, .print-table td {
//           border: 1px solid black;
//           padding: 8px;
//           text-align: left;
//         }
//         .print-table th {
//           background-color: #f2f2f2;
//         }
//       }
//     `,
//   });

//   if (studentError) {
//     return <SomthingwentWrong />;
//   }
//   if (studentLoading) {
//     return <Loading />;
//   }

//   // Paginate data
//   const itemsPerPage = 20; // Number of students per page
//   const paginatedData = [];
//   for (let i = 0; i < submittedData.length; i += itemsPerPage) {
//     paginatedData.push(submittedData.slice(i, i + itemsPerPage));
//   }

//   return (
//     <div className="md:h-screen mt-12 md:mt-1 mx-auto p-1 overflow-hidden">
//       <button
//         onClick={handlePrint}
//         style={{ backgroundColor: currentColor }}
//         className="px-4 py-2 text-white rounded shadow-md no-print"
//       >
//         Print Student Data
//       </button>

//       <div ref={printRef}>
//         {paginatedData.map((pageData, pageIndex) => (
//           <div key={pageIndex} className="page">
//             <div className="print-header">
//               Students Report - Page {pageIndex + 1}
//             </div>
//             <table className="print-table">
//               <thead>
//                 <tr>
//                   <th>S.No</th>
//                   <th>Name</th>
//                   <th>Email</th>
//                   <th>Class</th>
//                   <th>Section</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {pageData.map((student, index) => (
//                   <tr key={student.email}>
//                     <td>{index + 1 + pageIndex * itemsPerPage}</td>
//                     <td>{student.name}</td>
//                     <td>{student.email}</td>
//                     <td>{student.class}</td>
//                     <td>{student.section}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default CreateStudent;



// import React, { useState, useEffect, useRef } from "react";
// import { toast } from "react-toastify";
// import axios from "axios";
// import "../../../Dynamic/Form/FormStyle.css";
// import { useStateContext } from "../../../contexts/ContextProvider.js";
// import Cookies from "js-cookie";
// import Loading from "../../../Loading";
// import useCustomQuery from '../../../useCustomQuery';
// import SomthingwentWrong from "../../../SomthingwentWrong";
// import NoDataFound from "../../../NoDataFound.jsx";
// import Heading2 from "../../../Dynamic/Heading2.jsx";
// import DynamicDataTable from "../../../Dynamic/DynamicDataTable.jsx";
// import { getAllStudentColumns } from "../../../Dynamic/utils/TableUtils.jsx";
// import { useReactToPrint } from "react-to-print";

// function CreateStudent() {
//   const authToken = Cookies.get("token");
//   const { currentColor } = useStateContext();
//   const [submittedData, setSubmittedData] = useState([]);
//   const { queryData: studentData, error: studentError, loading: studentLoading } = useCustomQuery("https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents");

//   const tableRef = useRef(); // Ref for printable content

//   // Fetch data from API
//   useEffect(() => {
//     if (studentData) {
//       setSubmittedData(studentData.allStudent);
//     }
//   }, [studentData]);

//   // Handle delete student
//   const handleDelete = (email) => {
//     axios
//       .put(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deactivateStudent`,
//         { email },
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then(() => {
//         const filterData = submittedData.filter(
//           (item) => item.email !== email
//         );
//         setSubmittedData(filterData);
//         toast.success("Student data deleted successfully");
//       })
//       .catch((error) => {
//         console.error("Error deleting Student data:", error);
//         toast.error("An error occurred while deleting the Student data.");
//       });
//   };

//   // Print functionality using useReactToPrint
//   const handlePrint = useReactToPrint({
//     content: () => tableRef.current, // Specify the content to print
//   });

//   // Error handling
//   if (studentError) {
//     return <SomthingwentWrong />;
//   }
//   if (studentLoading) {
//     return <Loading />;
//   }

//   return (
//     <div className="md:h-screen mt-12 md:mt-1 mx-auto p-1 overflow-hidden">
//       <Heading2 title={"Students"} />

//       {/* <div className="flex justify-end mb-4"> */}
//         <button
//           onClick={handlePrint}
//           style={{ backgroundColor: currentColor }}
//           className="px-4 py-2 text-white rounded shadow-md"
//         >
//           Print Table
//         </button>
//       {/* </div> */}

//       <div ref={tableRef}>
//         {submittedData.length > 0 ? (
//           <DynamicDataTable
//             data={submittedData}
//             columns={getAllStudentColumns(handleDelete)}
//             handleDelete={handleDelete}
//             className="w-full overflow-auto"
//             itemsPerPage={15}
//           />
//         ) : (
//           <NoDataFound />
//         )}
//       </div>
//     </div>
//   );
// }

// export default CreateStudent;



// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import axios from "axios";
// import "../../../Dynamic/Form/FormStyle.css";
// import { useStateContext } from "../../../contexts/ContextProvider.js";
// import Cookies from "js-cookie";
// import Loading from "../../../Loading";
// import useCustomQuery from '../../../useCustomQuery'
// import SomthingwentWrong from "../../../SomthingwentWrong";
// import NoDataFound from "../../../NoDataFound.jsx";
// import Heading from "../../../Dynamic/Heading.jsx";
// import DynamicDataTable from "../../../Dynamic/DynamicDataTable.jsx";
// import { getAllStudentColumns } from "../../../Dynamic/utils/TableUtils.jsx";
// import Heading2 from "../../../Dynamic/Heading2.jsx";


// function CreateStudent() {
//   const authToken = Cookies.get("token");
//   const { currentColor } = useStateContext();
//   const [submittedData, setSubmittedData] = useState([]);
//   const { queryData: studentData, error: studentError, loading: studentLoading } = useCustomQuery("https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents");
//   useEffect(() => {
//     if (studentData) {
//       setSubmittedData(studentData.allStudent);
//     }
//   }, [studentData])

//   const handleDelete = (email) => {
//     axios
//       .put(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deactivateStudent`,
//         { email },
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const filterData = submittedData.filter(
//           (item) => item.email !== email
//         );
//         setSubmittedData(filterData);
//         toast.success("Student data deleted successfully");
//       })
//       .catch((error) => {
//         console.error("Error deleting Student data:", error);
//         toast.error("An error occurred while deleting the Student data.");
//       });
//   };


//   if (studentError) {
//     return <SomthingwentWrong />
//   }
//   if (studentLoading) {
//     return <Loading />
//   }
//   return (
//     <div className="md:h-screen mt-12 md:mt-1  mx-auto p-1 overflow-hidden">

//       <Heading2 title={"Students"}>

//     </Heading2>
//       {submittedData.length > 0 ? (
//         <DynamicDataTable
//           data={submittedData}
//           columns={getAllStudentColumns(handleDelete)}
//           handleDelete={handleDelete}
//           // tableHeight="40vh"
//           className="w-full overflow-auto"
//           itemsPerPage={15}
//         />
//       ) : (
//         <NoDataFound />
//       )}

//     </div>
//   );
// }

// export default CreateStudent;
