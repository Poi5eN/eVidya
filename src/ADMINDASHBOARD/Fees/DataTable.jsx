import React, { useRef, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Button} from "@mui/material";
import { MdFileDownload } from "react-icons/md";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import { useStateContext } from "../../contexts/ContextProvider";
import FeeRecipt from "./FeeRecipt";
import "tailwindcss/tailwind.css"; // Import Tailwind CSS

function DataTable({ data, handleDelete }) {
  const { currentColor } = useStateContext();
 
  const [modalData, setModalData] = useState(null);
  const componentPDF = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };
  const columns = [
    {
      field: "id",
      headerName: "S. No.",
      minWidth: 50,
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: "#01579b", fontSize: "12px" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "admissionNumber",
      headerName: "Admission No.",
      minWidth: 100,
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: "#ff6d00", fontSize: "12px" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "studentName",
      headerName: "Student Name",
      minWidth: 100,
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: "#01579b", fontSize: "12px" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "studentClass",
      headerName: "Class",
      minWidth: 80,
      flex: 1,
    
      renderCell: (params) => (
        <span style={{ fontSize: "12px", color: "#01579b" }}>
          {`${params.row.studentClass} 
        
          `}
        </span>
      ),
    },
    {
      field: "feeReceiptNumber",
      headerName: "Receipt No",
      minWidth: 100,
      flex: 1,
      renderCell: (params) => (
        <span style={{ fontSize: "12px", color: "#00695c" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "month",
      headerName: "Month",
      minWidth: 100,
      flex: 1,
      renderCell: (params) => (
        <span style={{ fontSize: "12px", color: "#9500ae" }}>
          {params.value}
        </span>
      ),
    },

    {
      field: "paidAmount",
      headerName: "Amount",
      minWidth: 100,
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: "#01579b", fontSize: "12px" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "dues",
      headerName: "Dues",
      minWidth: 100,
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: "#b71c1c", fontSize: "12px" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "paymentMode",
      headerName: "PayMode",
      minWidth: 100,
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            color: params.value == "Online" ? "#004d40" : "#01579b",
            fontSize: "12px",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Paid Status",
      minWidth: 100,
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            color: params.value == "Paid" ? "#1b5e20" : "#e65100",
            fontSize: "12px",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "date",
      headerName: "Collection Date",
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: "#f50057", fontSize: "12px" }}>
          {params.value}
        </span>
      ),
      valueGetter: (params) => {
        const date = new Date(params.row.date);
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 100,
      flex: 1,
      renderCell: (params) => (
        <div className="flex gap-2">
          <IconButton onClick={() => handleOpenModal(params.row)}>
            <MdFileDownload className="text-gray-700 dark:text-white " />
          </IconButton>
        </div>
      ),
    },
  ];
  
  const dataWithIds = Array.isArray(data)
    ? data.map((item, index) => ({ id: index + 1, ...item })).reverse()
    : [];

  const handleOpenModal = (rowData) => {
    setModalData(rowData);
   
    setIsOpen(true);
  };

  const handleCloseModal = () => {
   
    setModalData(null);
  };

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: "All Fee receipt",
    onAfterPrint: () => toast.success("Download Successfuly"),
  });

  return (
    <div className="">
      <div className="flex justify-end mb-4">
        <Button
          variant="contained"
          style={{ backgroundColor: currentColor, color: "white" }}
          onClick={generatePDF}
        >
          Download PDF
        </Button>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-screen bg-white dark:bg-secondary-dark-bg dark:text-white mx-auto">
          <DataGrid
            rows={dataWithIds}
            columns={columns}
            ref={componentPDF}
            className="dark:text-white"
          />
        </div>
      </div>

     

      {isOpen && (
        <div
          id="default-modal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
        >
          <div className="relative p-4 w-full  max-h-full" data-aos="fade-down">
            <div className="relative  rounded-lg shadow dark:bg-gray-700 overflow-auto ">
              <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 bg-white">
                <h3 className="text-xl font-semibold  dark:text-white">
                  Admission Form
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
              <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh]  overflow-auto  bg-gray-50">
                <div className="p-4 md:p-5 space-y-4  ">
                  <h2
                    className="text-2xl font-bold mb-4 uppercase text-center  hover-text "
                    style={{ color: currentColor }}
                  >
                    Fee Receipt
                  </h2>
                  {modalData && (
                    <FeeRecipt
                      modalData={modalData}
                      handleCloseModal={handleCloseModal}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;

// import React, { useRef, useState } from "react";
// import { DataGrid } from "@mui/x-data-grid";
// import { Link, useNavigate } from "react-router-dom";
// import IconButton from "@mui/material/IconButton";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Box from "@mui/material/Box";
// import Modal from "@mui/material/Modal";
// import FeeRecipt from "./FeeRecipt";

// import { MdFileDownload } from "react-icons/md";
// import { useReactToPrint } from "react-to-print";
// import { Button } from "@mui/material";
// import { toast } from "react-toastify";
// function DataTable({ data, handleDelete }) {
//   const { currentColor } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalData, setModalData] = useState(null);
//   const navigate = useNavigate();
//   const componentPDF = useRef();

// const columns = [
//   {
//     field: "id",
//     headerName: "S. No.",
//     width: 50,
//     renderCell: (params) => (
//       <span style={{ color: "#01579b", fontSize: "12px" }}>
//         {params.value}
//       </span>
//     ),
//   },
//   {
//     field: "admissionNumber",
//     headerName: "Admission No.",
//       width: 100,
//     renderCell: (params) => (
//       <span style={{ color: "#01579b", fontSize: "12px" }}>
//         {params.value}
//       </span>
//     ),
//   },
//   {
//     field: "studentName",
//     headerName: "Student Name",
//       width: 100,
//     renderCell: (params) => (
//       <span style={{ color: "#01579b", fontSize: "12px" }}>
//         {params.value}
//       </span>
//     ),
//   },
//   {
//     field: "feeReceiptNumber",
//     headerName: "Receipt No",
//       width: 100,
//     renderCell: (params) => (
//       <span style={{ color: "#01579b", fontSize: "12px",color:"#ff6d00" }}>
//         {params.value}
//       </span>
//     ),
//   },
//   {
//     field: "studentClass",
//     headerName: "Class",
//       width: 80,
//     // renderCell: (params) => (
//     //   <span style={{ color: "#01579b", fontSize: "12px" }}>
//     //     {params.value}
//     //   </span>
//     // ),
//     renderCell: (params) => (
//       <span style={{ fontSize: "12px", color:"#01579b" }}>
//         {`${params.row.studentClass}

//         `}
//       </span>
//     ),
//   },
//   {
//     field: "date",
//     headerName: "Collection Date",
//       width: 100,
//     renderCell: (params) => (
//       <span style={{ color: "#01579b", fontSize: "12px" }}>
//         {params.value}
//       </span>
//     ),
//     valueGetter: (params) => {
//       const date = new Date(params.row.date);
//       return date.toLocaleDateString(); // Format the date as needed
//     },
//   },
//   {
//     field: "paidAmount",
//     headerName: "Amount",
//       width: 100,
//     renderCell: (params) => (
//       <span style={{ color: "#01579b", fontSize: "12px" }}>
//         {params.value}
//       </span>
//     ),
//   },

//   // { field: "paymentMode", headerName: "PayMode", flex: 1 },
//   {
//     field: "dues",
//     headerName: "Dues",
//       width: 100,
//     renderCell: (params) => (
//       <span style={{ color: "#b71c1c", fontSize:"12px" }}>
//         {params.value}
//       </span>
//     ),
//   },
//   {
//     field: "paymentMode",
//     headerName: "PayMode",
//       width: 100,
//     renderCell: (params) => (
//       <span
//         style={{
//           color: params.value == "Online" ? "#004d40" : "#01579b",
//            fontSize:"12px"
//         }}
//       >
//         {params.value}
//       </span>
//     ),
//   },
//   {
//     field: "status",
//     headerName: "Paid Status",
//       width: 100,
//     renderCell: (params) => (
//       <span
//         style={{
//           color: params.value == "Paid" ? "#1b5e20" : "#e65100",
//           fontSize:"12px"
//         }}
//       >
//         {params.value}
//       </span>
//     ),
//   },
//   {
//     field: "actions",
//     headerName: "Actions",
//       width: 100,
//     renderCell: (params) => (
//       <div className="flex gap-2">
//         <IconButton onClick={() => handleOpenModal(params.row)}>
//           <MdFileDownload className="text-gray-700 dark:text-white " />
//         </IconButton>
//       </div>
//     ),
//   },
// ];

//   const dataWithIds = Array.isArray(data)
//     ? data.map((item, index) => ({ id: index + 1, ...item }))
//     : [];

//   const handleOpenModal = (rowData) => {
//     setModalData(rowData);
//     setModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setModalOpen(false);
//     setModalData(null);
//   };

//   // const handleDownloadReceipt = (rowData) => {
//   //   // Implement download logic here using rowData
//   //   // For example, you can pass rowData to FeeRecipt component to generate PDF
//   //   console.log("Downloading receipt for:", rowData.studentName);
//   //   // Implement your PDF generation/download logic here
//   // };

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: "All Fee receipt",
//     onAfterPrint: () => toast.success("Download Successfuly"),
//   });
//   return (
//     <div>
//       <div className="flex justify-end m-2">
//         <Button
//           variant="contained"
//           style={{ backgroundColor: currentColor, color: "white" }}
//           onClick={generatePDF}
//         >
//           Download PDF
//         </Button>
//       </div>
//       <DataGrid
//         rows={dataWithIds}
//         columns={columns}
//         ref={componentPDF}
//         className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white"
//       />

//       <Modal
//         open={modalOpen}
//         onClose={handleCloseModal}
//         aria-labelledby="modal-title"
//         aria-describedby="modal-description"
//       >
//         <Box
//           sx={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             width: 800,
//             bgcolor: "background.paper",
//             border: "2px solid #000",
//             boxShadow: 24,
//             p: 4,

//           }}
//           className="flex justify-center"
//         >
//           <h2 id="modal-title" className="text-lg font-semibold text-center">
//             FEE RECEIPT
//           </h2>
//           {modalData && (
//             <div id="modal-description">
//               <FeeRecipt modalData={modalData} />
//             </div>
//           )}
//         </Box>
//       </Modal>
//     </div>
//   );
// }

// export default DataTable;

// import React, { useState } from "react";
// import { DataGrid } from "@mui/x-data-grid";
// import { Link, useNavigate } from "react-router-dom";
// import IconButton from "@mui/material/IconButton";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Box from "@mui/material/Box";
// import Modal from "@mui/material/Modal";
// import FeeRecipt from "./FeeRecipt";
// function DataTable({data , handleDelete}) {
//   const { currentColor } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalData, setModalData] = useState(null);
//   const navigate = useNavigate();

//     const columns = [
//       { field: "id", headerName: "S. No." , width:50 },
//       { field: "studentName", headerName: "Student Name" ,flex:1 },
//       { field: "studentClass", headerName: "Class", flex:1 },
//       // { field: "date", headerName: "Collection date  ", flex:1 },
//       { field: "date", headerName: "Collection Date",   width: 100,
//         valueGetter: (params) => {
//           const date = new Date(params.row.date);
//           return date.toLocaleDateString(); // Format the date as needed
//         }
//       },
//       { field: "paidAmount", headerName: "Amount", flex:1 },
//       { field: "status", headerName: "Paid Status",   width: 100,
//         renderCell: (params) => (
//           <span style={{ color: params.value === 'paid' ? 'green' : 'red' }}>
//             {params.value}
//           </span>
//         )
//       },

//       {
//         field: "actions", headerName: "Actions",   width: 100,
//         renderCell: (params) => (
//           <IconButton onClick={() => handleOpenModal(params.row)}>
//             <p className="text-[16px] text-gray-100 px-2 py-2 rounded-xl"
//               style={{ border: `2px solid ${currentColor} `, color: currentColor }}
//             >
//               Salary status
//             </p>
//           </IconButton>
//         ),
//       },
//       ];
//   const dataWithIds = Array.isArray(data) ? data.map((item, index) => ({ id: index + 1, ...item})) : [];

//       const handleOpenModal = (rowData) => {
//         setModalData(rowData);
//         setModalOpen(true);
//       };

//       const handleCloseModal = () => {
//         setModalOpen(false);
//         setModalData(null);
//       };
//   return (

//     <div >
//       <DataGrid
//         rows={dataWithIds}
//         columns={columns}
//         className="dark:text-white dark:bg-secondary-dark-bg  mx-auto bg-white"
//       />
//        <Modal
//         open={modalOpen}
//         onClose={handleCloseModal}
//         aria-labelledby="modal-title"
//         aria-describedby="modal-description"
//       >
//         <Box
//           sx={{
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',
//             width: 800,
//             bgcolor: 'background.paper',
//             border: '2px solid #000',
//             boxShadow: 24,
//             p: 4,
//           }}
//         >
//           <h2 id="modal-title" className="text-lg font-semibold">Salary Status</h2>
//           {modalData && (
//             <div id="modal-description">
//               <FeeRecipt modalData={modalData}/>
//             </div>
//           )}
//         </Box>
//       </Modal>
//     </div>
//   );
// }

// export default DataTable;
