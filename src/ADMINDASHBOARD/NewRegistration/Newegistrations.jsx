import React, { useEffect, useState, useRef } from "react";
import { useStateContext } from "../../contexts/ContextProvider.js";
import DynamicDataTable from "./DataTable.jsx";
import NoDataFound from "../../NoDataFound.jsx";
import Loading from "../../Loading.jsx";
import RegForm from "./RegForm.jsx";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { StudentDeleteRegistrations, StudentgetRegistrations } from "../../Network/AdminApi.js";
//Import For Print
import { useReactToPrint } from 'react-to-print';
// New import for Modal
import { Modal } from "@mui/material";

import { Box } from "@mui/material";
import { AiFillDelete, AiFillEye, AiFillPrinter, AiOutlineShareAlt } from 'react-icons/ai';
import Button from "../../Dynamic/utils/Button.jsx";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Table from "../../Dynamic/Table.jsx";
import { Link } from "react-router-dom";

// Placeholder function for uploading PDF (Replace with your actual upload logic)
const uploadPDF = async (pdfBlob) => {
    // REPLACE THIS WITH YOUR ACTUAL UPLOAD CODE (e.g., Firebase Storage, AWS S3)
    // This is a placeholder that simulates uploading and returns a temporary URL.
    // In a real application, you'd use your cloud storage SDK.

    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate a successful upload and return a dummy URL
            const dummyURL = "https://example.com/your-uploaded-pdf.pdf"; // Replace with your URL
            resolve(dummyURL);
        }, 1500); // Simulate upload delay
    });
};

const MobileRegistrationCard = ({ student, onClose, handleDelete }) => {
    const schoolName = sessionStorage.getItem("schoolName");
    const schoolimage = sessionStorage.getItem("image");
    const schoolAddress = sessionStorage.getItem("schooladdress");
    const schoolContact = sessionStorage.getItem("contact");

    // Ref for printing
    const componentPDF = useRef();

    // State to track if printing is in progress
    const [isPrinting, setIsPrinting] = useState(false);

    // Handle print (unchanged - keeps the default print option)
    const handlePrint = useReactToPrint({
        content: () => componentPDF.current,
        documentTitle: `Registration_${student.registrationNumber}`,
        onAfterPrint: () => toast.success("PDF Downloaded Successfully!"),
    });

    // Handle WhatsApp Share of PDF
    const handleWhatsAppSharePDF = async () => {
        const element = componentPDF.current;

        if (!element) {
            console.error("Component not found for PDF generation.");
            toast.error("Failed to generate PDF for sharing.");
            return;
        }

        try {
            const canvas = await html2canvas(element, {
                useCORS: true, // Required if images are from different domains
                scale: 2      // Increase scale for higher resolution
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');  // Portrait, millimeters, A4 size
            const imgWidth = 210;  // A4 width
            const imgHeight = (canvas.height * imgWidth) / canvas.width; // Keep aspect ratio

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            const pdfBlob = pdf.output('blob'); // Create a Blob from the PDF

            //** Upload the PDF to a server (e.g., Firebase Storage, AWS S3) **
            toast.info("Uploading PDF..."); // Show a message during upload

            const pdfURL = await uploadPDF(pdfBlob); // Await the upload and get the URL

            if (!pdfURL) {
                toast.error("Failed to upload PDF.");
                return;
            }

            toast.success("PDF uploaded successfully!");

            // Construct the WhatsApp message with the PDF URL
            const message = `*${schoolName} Registration Details*\n\n*Registration Number:* ${student.registrationNumber}\n*Student's Name:* ${student.studentFullName}\n*Guardian's Name:* ${student.guardianName}\n*Email:* ${student.studentEmail}\n*Gender:* ${student.gender}\n*Class:* ${student.registerClass}\n*Mobile:* ${student.mobileNumber}\n*Address:* ${student.studentAddress}\n\n${schoolName} - ${schoolAddress} - Contact: ${schoolContact}\n\nCheck out this registration receipt: ${pdfURL}`;
            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/?text=${encodedMessage}`;

            // Open a new window/tab for the WhatsApp link
            window.open(whatsappURL, '_blank');

        } catch (error) {
            console.error("Error generating or sharing PDF:", error);
            toast.error("Error sharing PDF.");
        }
    };

    return (
        <Modal
            open={true}
            onClose={onClose}
            aria-labelledby="mobile-registration-modal"
            aria-describedby="mobile-registration-modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%', // Mobile ke liye width 90% rakhi hai
                    maxWidth: 350, // Maximum width ko aur chhota kiya
                    bgcolor: 'background.paper',
                    border: '1px solid #000', // Border thickness reduced
                    boxShadow: 24,
                    p: 1, // Padding aur bhi reduce kiya
                    overflowY: 'auto', // Scrolling enable hai
                    maxHeight: '90vh', // Maximum height to fit within the screen
                }}
            >
                {/* PDF Content */}
                <div ref={componentPDF} style={{ width: "100%" }}>
                    <div className="max-w-2xl mx-auto p-1 border border-black bg-yellow-100 mt-2">
                        <div className="relative">
                            {/* School Logo */}
                            <div className="absolute top-0 left-0 flex justify-between h-[60px] w-[60px] object-cover">
                                <img
                                    className="w-full h-full"
                                    src={schoolimage}
                                    alt="school logo"
                                />
                            </div>
                            {/* Registration Number */}
                            <div className="absolute top-0 right-0 text-sm">
                                <span>Reg.No. {student?.registrationNumber}</span>
                            </div>
                        </div>

                        {/* School Details */}
                        <div className="text-center font-bold text-md mb-2 w-[80%] mx-auto mt-4">
                            {schoolName}
                            <p className="text-xs text-gray-700">{schoolAddress}</p>
                            <p className="text-xs text-gray-700">Mobile No. : {schoolContact}</p>
                            <div className="text-center text-xs mb-2">Registration Receipt</div>
                        </div>

                        {/* Registration Date and Session */}
                        <div className="mb-2">
                            <div className="flex justify-between border-b-1 border-black border-dashed text-xs">
                                <span>Reg. Date : {student?.formattedDate}</span>
                                <span>Session : 2024-25</span>
                            </div>
                        </div>

                        {/* Student Details */}
                        <div className="flex flex-col space-y-1 text-xs">
                            <span>Student's Name : {student?.studentFullName}</span>
                            <span>Guardian's Name : {student?.guardianName}</span>
                            <span>Email: {student?.studentEmail}</span>
                            <span>Gender: {student?.gender}</span>
                            <span>Class : {student?.registerClass}</span>
                            <span>Mob : {student?.mobileNumber}</span>
                            <span>Address : {student?.studentAddress}</span>
                        </div>

                        {/* Payment Details Table */}
                        <div className="my-2">
                            <table className="w-full mb-2 text-xs">
                                <thead>
                                    <tr>
                                        <th className="border border-black p-1">Sr. No.</th>
                                        <th className="border border-black p-1">Particulars</th>
                                        <th className="border border-black p-1">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-black p-1 text-center">1</td>
                                        <td className="border border-black p-1 text-center">
                                            Admission Fee
                                        </td>
                                        <td className="border border-black p-1 text-center">
                                            {student?.amount}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Total Amount */}
                        <div className="flex justify-end mb-2 text-xs">
                            <span>{student?.amount}/-</span>
                        </div>

                        {/* Signatures */}
                        <div className="flex justify-between mb-2 my-4 text-xs">
                            <span>Signature of Centre Head</span>
                            <span>Signature of Student</span>
                        </div>

                        {/* Footer Note */}
                        <div className="text-center text-[10px]">
                            All above mentioned Amount once paid are non-refundable in any case
                            whatsoever.
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-2 flex justify-between gap-3">
                    <Button name="Print" onClick={handlePrint} width="full" />
                    <Button name="Share PDF" onClick={handleWhatsAppSharePDF} width="full" />
                    <Button name="Close" onClick={onClose} width="full" color="#607093" />
                </div>
            </Box>
        </Modal>
    );
};

const Newegistrations = () => {
    const [loading, setLoading] = useState(false);
    const authToken = Cookies.get("token");
    const { currentColor } = useStateContext();
    const [registrationData, setRegistrationData] = useState([]);
    const isMobile = window.innerWidth <= 768;
    const tableRef = useRef();
    const [selectedRegistration, setSelectedRegistration] = useState(null); // For mobile modal

    const getREg = async () => {
        setLoading(true);
        const response = await StudentgetRegistrations();

        if (response.success) {
            setLoading(false);
            setRegistrationData(response.data);
            // toast.success(response.message)
            console.log("Data Received:", response);
        } else {
            
            toast.error(response.message)
            console.error("No Data Received");
        }
    };
    const THEAD = [
    
        { id: "SN", label: "S No." },
        { id: "registrationNumber", label: "Registration No" },
        { id: "studentFullName", label: "Name" },
        { id: "guardianName", label: "Father Name" },
        { id: "gender", label: "Gender" },
        { id: "registerClass", label: "Class" },
        { id: "mobileNumber", label: "Contact" },
        { id: "amount", label: "Reg. Fee" },
        // { id: "feeStatus", label: "feeStatus" },
        // { id: "totalDues", label: "Total Dues" },
        { id: "action", label: "Action" },
      ];
console.log("registrationData",registrationData)
 const tBody = registrationData.map((val, ind) => ({
    "SN":ind+1,
    registrationNumber: <span className="text-red-700 font-semibold">{val.registrationNumber}</span>,
    studentFullName: val.studentFullName,
    guardianName: val.guardianName,
    gender: val.gender,
    registerClass: val.registerClass,
    mobileNumber: val.mobileNumber,
    amount: val.amount,
    feeStatus: val.feeStatus,
    action:  <span onClick={() => setSelectedRegistration(val)} className="cursor-pointer">
    <AiFillEye  className="text-[25px] text-green-700" />
    </span>
    
    // <div className="flex justify-center items-center gap-2">
    //     <Link to={`/admin/admission/view-admission/${val?.admissionNumber}`}>
    //     <AiFillEye  className="text-[25px] text-green-700" />
    //       </Link>
    //     </div>, 
  }));

    useEffect(() => {
        getREg();
    }, []);

    const handlePrint = useReactToPrint({
        content: () => tableRef.current,
    });

    const handleDelete = async (registrationNumber) => {
        const ConfirmToast = ({ closeToast }) => (
            <div style={{ marginTop: '100px' }}>
                <p>Are you sure you want to delete this student?</p>
                <button
                    className="text-red-700 font-bold text-xl"
                    onClick={async () => {
                        try {
                            setLoading(true);
                            const response = await StudentDeleteRegistrations(registrationNumber);
                            console.log("delete respone", response);
                            if (response) {
                                setLoading(false);
                                // refresh
                                getREg();
                            }
                        } catch (error) {
                            console.log(error);
                        } finally {
                            closeToast(); // Close the toast after the operation
                        }
                    }}
                    style={{ marginRight: "10px" }}
                >
                    Yes
                </button>
                <button onClick={closeToast} className="text-green-800 text-xl">
                    No
                </button>
            </div>
        );

        toast(<ConfirmToast />);
    };

    const renderMobileCards = () => {
        return (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {registrationData.map((student, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-md p-4 relative transition-transform hover:scale-105 cursor-pointer"

                    >
                        <div className="absolute top-2 right-2 flex space-x-2 gap-2">  {/* Position the buttons top right */}
                     
                         <span onClick={() => setSelectedRegistration(student)}>
                         <AiFillEye  className="text-[25px] text-green-700" />
                         </span>
                         <span onClick={() => handleDelete(student.registrationNumber)}>
                         <AiFillDelete  className="text-[25px] text-red-800" />
                         </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            {student.studentFullName}
                        </h3>

                        <p>
                            <strong>Reg No:</strong> {student.registrationNumber}
                        </p>
                        <p>
                            <strong>Guardian Name:</strong> {student.guardianName}
                        </p>
                        <p>
                            <strong>Email:</strong> {student.studentEmail}
                        </p>
                        <p>
                            <strong>Class:</strong>{student.registerClass}
                        </p>
                        <p>
                            <strong>Mobile:</strong>{student.mobileNumber}
                        </p>
                        <p>
                            <strong>Address:</strong>{student.studentAddress}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="mx-auto px-3 md:h-screen">
            <h1
                className="text-xl text-center font-bold uppercase"
                style={{ color: currentColor }}
            >
                Registration
            </h1>

            <div className="flex gap-1 md:flex-row">
                <div className="mb-1 md:mb-0">
                    <RegForm />
                </div>
                <div className="md:ml-5">
                </div>
            </div>
            <div ref={tableRef}>
                {isMobile ? (
                    <>
                        {registrationData && registrationData.length > 0 ? (
                            renderMobileCards()
                        ) : (
                            <NoDataFound />
                        )}
                        {/* {selectedRegistration && (
                            <MobileRegistrationCard
                                student={selectedRegistration}
                                onClose={() => setSelectedRegistration(null)}
                                handleDelete={handleDelete}
                            />
                        )} */}
                    </>
                ) : (
                    registrationData && registrationData.length > 0 ? (
                        <Table
                        tHead={THEAD}
                        tBody={tBody}/>
                        // <DynamicDataTable
                        //     data={registrationData}
                        //     handleDelete={handleDelete}
                        // />
                    ) : (
                        <NoDataFound />
                    )
                )}
                 {selectedRegistration && (
                            <MobileRegistrationCard
                                student={selectedRegistration}
                                onClose={() => setSelectedRegistration(null)}
                                handleDelete={handleDelete}
                            />
                        )}
            </div>
        </div>
    );
};

export default Newegistrations;



// import React, { useEffect, useState, useRef } from "react";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// import DynamicDataTable from "./DataTable.jsx";
// import NoDataFound from "../../NoDataFound.jsx";
// import Loading from "../../Loading.jsx";
// import RegForm from "./RegForm.jsx";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { StudentDeleteRegistrations, StudentgetRegistrations } from "../../Network/AdminApi.js";
// //Import For Print
// import { useReactToPrint } from 'react-to-print';
// // New import for Modal
// import { Modal } from "@mui/material";

// import { Box } from "@mui/material";
// import { AiFillDelete, AiFillEye, AiFillPrinter, AiOutlineShareAlt } from 'react-icons/ai';
// import Button from "../../Dynamic/utils/Button.jsx";
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// // Placeholder function for uploading PDF (Replace with your actual upload logic)
// const uploadPDF = async (pdfBlob) => {
//     // REPLACE THIS WITH YOUR ACTUAL UPLOAD CODE (e.g., Firebase Storage, AWS S3)
//     // This is a placeholder that simulates uploading and returns a temporary URL.
//     // In a real application, you'd use your cloud storage SDK.

//     return new Promise((resolve) => {
//         setTimeout(() => {
//             // Simulate a successful upload and return a dummy URL
//             const dummyURL = "https://example.com/your-uploaded-pdf.pdf"; // Replace with your URL
//             resolve(dummyURL);
//         }, 1500); // Simulate upload delay
//     });
// };

// const MobileRegistrationCard = ({ student, onClose, handleDelete }) => {
//     const schoolName = sessionStorage.getItem("schoolName");
//     const schoolimage = sessionStorage.getItem("image");
//     const schoolAddress = sessionStorage.getItem("schooladdress");
//     const schoolContact = sessionStorage.getItem("contact");

//     // Ref for printing
//     const componentPDF = useRef();

//     // State to track if printing is in progress
//     const [isPrinting, setIsPrinting] = useState(false);

//     // Handle print (unchanged - keeps the default print option)
//     const handlePrint = useReactToPrint({
//         content: () => componentPDF.current,
//         documentTitle: `Registration_${student.registrationNumber}`,
//         onAfterPrint: () => toast.success("PDF Downloaded Successfully!"),
//     });

//     // Handle WhatsApp Share of PDF
//     const handleWhatsAppSharePDF = async () => {
//         const element = componentPDF.current;

//         if (!element) {
//             console.error("Component not found for PDF generation.");
//             toast.error("Failed to generate PDF for sharing.");
//             return;
//         }

//         try {
//             const canvas = await html2canvas(element, {
//                 useCORS: true, // Required if images are from different domains
//                 scale: 2      // Increase scale for higher resolution
//             });
//             const imgData = canvas.toDataURL('image/png');
//             const pdf = new jsPDF('p', 'mm', 'a4');  // Portrait, millimeters, A4 size
//             const imgWidth = 210;  // A4 width
//             const imgHeight = (canvas.height * imgWidth) / canvas.width; // Keep aspect ratio

//             pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

//             const pdfBlob = pdf.output('blob'); // Create a Blob from the PDF

//             //** Upload the PDF to a server (e.g., Firebase Storage, AWS S3) **
//             toast.info("Uploading PDF..."); // Show a message during upload

//             const pdfURL = await uploadPDF(pdfBlob); // Await the upload and get the URL

//             if (!pdfURL) {
//                 toast.error("Failed to upload PDF.");
//                 return;
//             }

//             toast.success("PDF uploaded successfully!");

//             // Construct the WhatsApp message with the PDF URL
//             const message = `*${schoolName} Registration Details*\n\n*Registration Number:* ${student.registrationNumber}\n*Student's Name:* ${student.studentFullName}\n*Guardian's Name:* ${student.guardianName}\n*Email:* ${student.studentEmail}\n*Gender:* ${student.gender}\n*Class:* ${student.registerClass}\n*Mobile:* ${student.mobileNumber}\n*Address:* ${student.studentAddress}\n\n${schoolName} - ${schoolAddress} - Contact: ${schoolContact}\n\nCheck out this registration receipt: ${pdfURL}`;
//             const encodedMessage = encodeURIComponent(message);
//             const whatsappURL = `https://wa.me/?text=${encodedMessage}`;

//             // Open a new window/tab for the WhatsApp link
//             window.open(whatsappURL, '_blank');

//         } catch (error) {
//             console.error("Error generating or sharing PDF:", error);
//             toast.error("Error sharing PDF.");
//         }
//     };

//     return (
//         <Modal
//             open={true}
//             onClose={onClose}
//             aria-labelledby="mobile-registration-modal"
//             aria-describedby="mobile-registration-modal-description"
//         >
//             <Box
//                 sx={{
//                     position: 'absolute',
//                     top: '50%',
//                     left: '50%',
//                     transform: 'translate(-50%, -50%)',
//                     width: '90%', // Mobile ke liye width 90% rakhi hai
//                     maxWidth: 350, // Maximum width ko aur chhota kiya
//                     bgcolor: 'background.paper',
//                     border: '1px solid #000', // Border thickness reduced
//                     boxShadow: 24,
//                     p: 1, // Padding aur bhi reduce kiya
//                     overflowY: 'auto', // Scrolling enable hai
//                     maxHeight: '90vh', // Maximum height to fit within the screen
//                 }}
//             >
//                 {/* PDF Content */}
//                 <div ref={componentPDF} style={{ width: "100%" }}>
//                     <div className="max-w-2xl mx-auto p-1 border border-black bg-yellow-100 mt-2">
//                         <div className="relative">
//                             {/* School Logo */}
//                             <div className="absolute top-0 left-0 flex justify-between h-[60px] w-[60px] object-cover">
//                                 <img
//                                     className="w-full h-full"
//                                     src={schoolimage}
//                                     alt="school logo"
//                                 />
//                             </div>
//                             {/* Registration Number */}
//                             <div className="absolute top-0 right-0 text-sm">
//                                 <span>Reg.No. {student?.registrationNumber}</span>
//                             </div>
//                         </div>

//                         {/* School Details */}
//                         <div className="text-center font-bold text-md mb-2 w-[80%] mx-auto mt-4">
//                             {schoolName}
//                             <p className="text-xs text-gray-700">{schoolAddress}</p>
//                             <p className="text-xs text-gray-700">Mobile No. : {schoolContact}</p>
//                             <div className="text-center text-xs mb-2">Registration Receipt</div>
//                         </div>

//                         {/* Registration Date and Session */}
//                         <div className="mb-2">
//                             <div className="flex justify-between border-b-1 border-black border-dashed text-xs">
//                                 <span>Reg. Date : {student?.formattedDate}</span>
//                                 <span>Session : 2024-25</span>
//                             </div>
//                         </div>

//                         {/* Student Details */}
//                         <div className="flex flex-col space-y-1 text-xs">
//                             <span>Student's Name : {student?.studentFullName}</span>
//                             <span>Guardian's Name : {student?.guardianName}</span>
//                             <span>Email: {student?.studentEmail}</span>
//                             <span>Gender: {student?.gender}</span>
//                             <span>Class : {student?.registerClass}</span>
//                             <span>Mob : {student?.mobileNumber}</span>
//                             <span>Address : {student?.studentAddress}</span>
//                         </div>

//                         {/* Payment Details Table */}
//                         <div className="my-2">
//                             <table className="w-full mb-2 text-xs">
//                                 <thead>
//                                     <tr>
//                                         <th className="border border-black p-1">Sr. No.</th>
//                                         <th className="border border-black p-1">Particulars</th>
//                                         <th className="border border-black p-1">Amount</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     <tr>
//                                         <td className="border border-black p-1 text-center">1</td>
//                                         <td className="border border-black p-1 text-center">
//                                             Admission Fee
//                                         </td>
//                                         <td className="border border-black p-1 text-center">
//                                             {student?.amount}
//                                         </td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>

//                         {/* Total Amount */}
//                         <div className="flex justify-end mb-2 text-xs">
//                             <span>{student?.amount}/-</span>
//                         </div>

//                         {/* Signatures */}
//                         <div className="flex justify-between mb-2 my-4 text-xs">
//                             <span>Signature of Centre Head</span>
//                             <span>Signature of Student</span>
//                         </div>

//                         {/* Footer Note */}
//                         <div className="text-center text-[10px]">
//                             All above mentioned Amount once paid are non-refundable in any case
//                             whatsoever.
//                         </div>
//                     </div>
//                 </div>

//                 {/* Buttons */}
//                 <div className="mt-2 flex justify-between gap-3">
//                     <Button name="Print" onClick={handlePrint} width="full" />
//                     <Button name="Share PDF" onClick={handleWhatsAppSharePDF} width="full" />
//                     <Button name="Close" onClick={onClose} width="full" color="#607093" />
//                 </div>
//             </Box>
//         </Modal>
//     );
// };

// const Newegistrations = () => {
//     const [loading, setLoading] = useState(false);
//     const authToken = Cookies.get("token");
//     const { currentColor } = useStateContext();
//     const [registrationData, setRegistrationData] = useState([]);
//     const isMobile = window.innerWidth <= 768;
//     const tableRef = useRef();
//     const [selectedRegistration, setSelectedRegistration] = useState(null); // For mobile modal

//     const getREg = async () => {
//         setLoading(true);
//         const response = await StudentgetRegistrations();

//         if (response.success) {
//             setLoading(false);
//             setRegistrationData(response.data);
//             toast.success(response.message)
//             console.log("Data Received:", response);
//         } else {
//             toast.error(response.message)
//             console.error("No Data Received");
//         }
//     };

//     useEffect(() => {
//         getREg();
//     }, []);

//     const handlePrint = useReactToPrint({
//         content: () => tableRef.current,
//     });

//     const handleDelete = async (registrationNumber) => {
//         const ConfirmToast = ({ closeToast }) => (
//             <div style={{ marginTop: '100px' }}>
//                 <p>Are you sure you want to delete this student?</p>
//                 <button
//                     className="text-red-700 font-bold text-xl"
//                     onClick={async () => {
//                         try {
//                             setLoading(true);
//                             const response = await StudentDeleteRegistrations(registrationNumber);
//                             console.log("delete respone", response);
//                             if (response) {
//                                 setLoading(false);
//                                 // refresh
//                                 getREg();
//                             }
//                         } catch (error) {
//                             console.log(error);
//                         } finally {
//                             closeToast(); // Close the toast after the operation
//                         }
//                     }}
//                     style={{ marginRight: "10px" }}
//                 >
//                     Yes
//                 </button>
//                 <button onClick={closeToast} className="text-green-800 text-xl">
//                     No
//                 </button>
//             </div>
//         );

//         toast(<ConfirmToast />);
//     };

//     const renderMobileCards = () => {
//         return (
//             <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//                 {registrationData.map((student, index) => (
//                     <div
//                         key={index}
//                         className="bg-white rounded-lg shadow-md p-4 relative transition-transform hover:scale-105 cursor-pointer"

//                     >
//                         <div className="absolute top-2 right-2 flex space-x-2 gap-2">  {/* Position the buttons top right */}
                     
//                          <span onClick={() => setSelectedRegistration(student)}>
//                          <AiFillEye  className="text-[25px] text-green-700" />
//                          </span>
//                          <span onClick={() => handleDelete(student.registrationNumber)}>
//                          <AiFillDelete  className="text-[25px] text-red-800" />
//                          </span>
//                         </div>
//                         <h3 className="text-lg font-semibold mb-2">
//                             {student.studentFullName}
//                         </h3>

//                         <p>
//                             <strong>Reg No:</strong> {student.registrationNumber}
//                         </p>
//                         <p>
//                             <strong>Guardian Name:</strong> {student.guardianName}
//                         </p>
//                         <p>
//                             <strong>Email:</strong> {student.studentEmail}
//                         </p>
//                         <p>
//                             <strong>Class:</strong>{student.registerClass}
//                         </p>
//                         <p>
//                             <strong>Mobile:</strong>{student.mobileNumber}
//                         </p>
//                         <p>
//                             <strong>Address:</strong>{student.studentAddress}
//                         </p>
//                     </div>
//                 ))}
//             </div>
//         );
//     };

//     if (loading) {
//         return <Loading />;
//     }

//     return (
//         <div className="mx-auto p-3 md:h-screen">
//             <h1
//                 className="text-xl text-center font-bold uppercase"
//                 style={{ color: currentColor }}
//             >
//                 Registration
//             </h1>

//             <div className="my-4 flex gap-1 md:flex-row">
//                 <div className="mb-1 md:mb-0">
//                     <RegForm />
//                 </div>
//                 <div className="md:ml-5">
//                 </div>
//             </div>
//             <div ref={tableRef}>
//                 {isMobile ? (
//                     <>
//                         {registrationData && registrationData.length > 0 ? (
//                             renderMobileCards()
//                         ) : (
//                             <NoDataFound />
//                         )}
//                         {selectedRegistration && (
//                             <MobileRegistrationCard
//                                 student={selectedRegistration}
//                                 onClose={() => setSelectedRegistration(null)}
//                                 handleDelete={handleDelete}
//                             />
//                         )}
//                     </>
//                 ) : (
//                     registrationData && registrationData.length > 0 ? (
//                         <DynamicDataTable
//                             data={registrationData}
//                             handleDelete={handleDelete}
//                         />
//                     ) : (
//                         <NoDataFound />
//                     )
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Newegistrations;



// import React, { useEffect, useState, useRef } from "react";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// import DynamicDataTable from "./DataTable.jsx";
// import NoDataFound from "../../NoDataFound.jsx";
// import Loading from "../../Loading.jsx";
// import RegForm from "./RegForm.jsx";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast} from "react-toastify";
// import { StudentDeleteRegistrations, StudentgetRegistrations } from "../../Network/AdminApi.js";
// //Import For Print
// import { useReactToPrint } from 'react-to-print';
// // New import for Modal
// import { Modal } from "@mui/material";

// import { Box } from "@mui/material";
// import { AiFillDelete, AiFillEye, AiFillPrinter, AiOutlineShareAlt } from 'react-icons/ai';
// import Button from "../../Dynamic/utils/Button.jsx";
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// const MobileRegistrationCard = ({ student, onClose, handleDelete }) => {
//     const schoolName = sessionStorage.getItem("schoolName");
//     const schoolimage = sessionStorage.getItem("image");
//     const schoolAddress = sessionStorage.getItem("schooladdress");
//     const schoolContact = sessionStorage.getItem("contact");

//     // Ref for printing
//     const componentPDF = useRef();

//     // State to track if printing is in progress
//     const [isPrinting, setIsPrinting] = useState(false);

//     // Handle print (unchanged - keeps the default print option)
//     const handlePrint = useReactToPrint({
//         content: () => componentPDF.current,
//         documentTitle: `Registration_${student.registrationNumber}`,
//         onAfterPrint: () => toast.success("PDF Downloaded Successfully!"),
//     });

//     // Handle WhatsApp Share of PDF
//     const handleWhatsAppSharePDF = async () => {
//         const element = componentPDF.current;

//         if (!element) {
//             console.error("Component not found for PDF generation.");
//             toast.error("Failed to generate PDF for sharing.");
//             return;
//         }

//         try {
//             const canvas = await html2canvas(element, {
//                 useCORS: true, // Required if images are from different domains
//                 scale: 2      // Increase scale for higher resolution
//             });
//             const imgData = canvas.toDataURL('image/png');
//             const pdf = new jsPDF('p', 'mm', 'a4');  // Portrait, millimeters, A4 size
//             const imgWidth = 210;  // A4 width
//             const imgHeight = (canvas.height * imgWidth) / canvas.width; // Keep aspect ratio

//             pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

//             const pdfBlob = pdf.output('blob'); // Create a Blob from the PDF

//             // Create a temporary URL for the Blob
//             const pdfURL = URL.createObjectURL(pdfBlob);

//             // Construct the WhatsApp message
//             const message = `*${schoolName} Registration Details*\n\n*Registration Number:* ${student.registrationNumber}\n*Student's Name:* ${student.studentFullName}\n*Guardian's Name:* ${student.guardianName}\n*Email:* ${student.studentEmail}\n*Gender:* ${student.gender}\n*Class:* ${student.registerClass}\n*Mobile:* ${student.mobileNumber}\n*Address:* ${student.studentAddress}\n\n${schoolName} - ${schoolAddress} - Contact: ${schoolContact}\n\nCheck out this registration receipt!`;
//             const encodedMessage = encodeURIComponent(message);
//             const whatsappURL = `https://wa.me/?text=${encodedMessage}&file=${pdfURL}`;

//             // Open a new window/tab for the WhatsApp link
//             window.open(whatsappURL, '_blank');

//             // Clean up the temporary URL (important!)
//             URL.revokeObjectURL(pdfURL);

//         } catch (error) {
//             console.error("Error generating or sharing PDF:", error);
//             toast.error("Error sharing PDF.");
//         }
//     };

//     return (
//         <Modal
//             open={true}
//             onClose={onClose}
//             aria-labelledby="mobile-registration-modal"
//             aria-describedby="mobile-registration-modal-description"
//         >
//             <Box
//                 sx={{
//                     position: 'absolute',
//                     top: '50%',
//                     left: '50%',
//                     transform: 'translate(-50%, -50%)',
//                     width: '90%', // Mobile ke liye width 90% rakhi hai
//                     maxWidth: 350, // Maximum width ko aur chhota kiya
//                     bgcolor: 'background.paper',
//                     border: '1px solid #000', // Border thickness reduced
//                     boxShadow: 24,
//                     p: 1, // Padding aur bhi reduce kiya
//                     overflowY: 'auto', // Scrolling enable hai
//                     maxHeight: '90vh', // Maximum height to fit within the screen
//                 }}
//             >
//                 {/* PDF Content */}
//                 <div ref={componentPDF} style={{ width: "100%" }}>
//                     <div className="max-w-2xl mx-auto p-1 border border-black bg-yellow-100 mt-2">
//                         <div className="relative">
//                             {/* School Logo */}
//                             <div className="absolute top-0 left-0 flex justify-between h-[60px] w-[60px] object-cover">
//                                 <img
//                                     className="w-full h-full"
//                                     src={schoolimage}
//                                     alt="school logo"
//                                 />
//                             </div>
//                             {/* Registration Number */}
//                             <div className="absolute top-0 right-0 text-sm">
//                                 <span>Reg.No. {student?.registrationNumber}</span>
//                             </div>
//                         </div>

//                         {/* School Details */}
//                         <div className="text-center font-bold text-md mb-2 w-[80%] mx-auto mt-4">
//                             {schoolName}
//                             <p className="text-xs text-gray-700">{schoolAddress}</p>
//                             <p className="text-xs text-gray-700">Mobile No. : {schoolContact}</p>
//                             <div className="text-center text-xs mb-2">Registration Receipt</div>
//                         </div>

//                         {/* Registration Date and Session */}
//                         <div className="mb-2">
//                             <div className="flex justify-between border-b-1 border-black border-dashed text-xs">
//                                 <span>Reg. Date : {student?.formattedDate}</span>
//                                 <span>Session : 2024-25</span>
//                             </div>
//                         </div>

//                         {/* Student Details */}
//                         <div className="flex flex-col space-y-1 text-xs">
//                             <span>Student's Name : {student?.studentFullName}</span>
//                             <span>Guardian's Name : {student?.guardianName}</span>
//                             <span>Email: {student?.studentEmail}</span>
//                             <span>Gender: {student?.gender}</span>
//                             <span>Class : {student?.registerClass}</span>
//                             <span>Mob : {student?.mobileNumber}</span>
//                             <span>Address : {student?.studentAddress}</span>
//                         </div>

//                         {/* Payment Details Table */}
//                         <div className="my-2">
//                             <table className="w-full mb-2 text-xs">
//                                 <thead>
//                                     <tr>
//                                         <th className="border border-black p-1">Sr. No.</th>
//                                         <th className="border border-black p-1">Particulars</th>
//                                         <th className="border border-black p-1">Amount</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     <tr>
//                                         <td className="border border-black p-1 text-center">1</td>
//                                         <td className="border border-black p-1 text-center">
//                                             Admission Fee
//                                         </td>
//                                         <td className="border border-black p-1 text-center">
//                                             {student?.amount}
//                                         </td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>

//                         {/* Total Amount */}
//                         <div className="flex justify-end mb-2 text-xs">
//                             <span>{student?.amount}/-</span>
//                         </div>

//                         {/* Signatures */}
//                         <div className="flex justify-between mb-2 my-4 text-xs">
//                             <span>Signature of Centre Head</span>
//                             <span>Signature of Student</span>
//                         </div>

//                         {/* Footer Note */}
//                         <div className="text-center text-[10px]">
//                             All above mentioned Amount once paid are non-refundable in any case
//                             whatsoever.
//                         </div>
//                     </div>
//                 </div>

//                 {/* Buttons */}
//                 <div className="mt-2 flex justify-between gap-3">
//                     <Button name="Print" onClick={handlePrint} width="full" />
//                     <Button name="Share PDF" onClick={handleWhatsAppSharePDF} width="full" />
//                     <Button name="Close" onClick={onClose} width="full" color="#607093" />
//                 </div>
//             </Box>
//         </Modal>
//     );
// };

// const Newegistrations = () => {
//     const [loading, setLoading] = useState(false);
//     const authToken = Cookies.get("token");
//     const { currentColor } = useStateContext();
//     const [registrationData, setRegistrationData] = useState([]);
//     const isMobile = window.innerWidth <= 768;
//     const tableRef = useRef();
//     const [selectedRegistration, setSelectedRegistration] = useState(null); // For mobile modal

//     const getREg = async () => {
//         setLoading(true);
//         const response = await StudentgetRegistrations();

//         if (response) {
//             setLoading(false);
//             setRegistrationData(response.data);
//             console.log("Data Received:", response);
//         } else {
//             console.error("No Data Received");
//         }
//     };

//     useEffect(() => {
//         getREg();
//     }, []);

//     const handlePrint = useReactToPrint({
//         content: () => tableRef.current,
//     });

//     const handleDelete = async (registrationNumber) => {
//         const ConfirmToast = ({ closeToast }) => (
//             <div>
//                 <p>Are you sure you want to delete this student?</p>
//                 <button
//                     className="text-red-700 font-bold text-xl"
//                     onClick={async () => {
//                         try {
//                             setLoading(true);
//                             const response = await StudentDeleteRegistrations(registrationNumber);
//                             console.log("delete respone", response);
//                             if (response) {
//                                 setLoading(false);
//                                 // refresh
//                                 getREg();
//                             }
//                         } catch (error) {
//                             console.log(error);
//                         } finally {
//                             closeToast(); // Close the toast after the operation
//                         }
//                     }}
//                     style={{ marginRight: "10px" }}
//                 >
//                     Yes
//                 </button>
//                 <button onClick={closeToast} className="text-green-800 text-xl">
//                     No
//                 </button>
//             </div>
//         );

//         toast(<ConfirmToast />);
//     };

//     const renderMobileCards = () => {
//         return (
//             <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//                 {registrationData.map((student, index) => (
//                     <div
//                         key={index}
//                         className="bg-white rounded-lg shadow-md p-4 relative transition-transform hover:scale-105 cursor-pointer"

//                     >
//                         <div className="absolute top-2 right-2 flex space-x-2 gap-2">  {/* Position the buttons top right */}
//                         <Button name="Delete" onClick={() => handleDelete(student.registrationNumber)} width="full" color="red" />
//                         <Button name="View" onClick={() => setSelectedRegistration(student)} width="full" />

//                         </div>
//                         <h3 className="text-lg font-semibold mb-2">
//                             {student.studentFullName}
//                         </h3>

//                         <p>
//                             <strong>Reg No:</strong> {student.registrationNumber}
//                         </p>
//                         <p>
//                             <strong>Guardian Name:</strong> {student.guardianName}
//                         </p>
//                         <p>
//                             <strong>Email:</strong> {student.studentEmail}
//                         </p>
//                         <p>
//                             <strong>Class:</strong>{student.registerClass}
//                         </p>
//                         <p>
//                             <strong>Mobile:</strong>{student.mobileNumber}
//                         </p>
//                         <p>
//                             <strong>Address:</strong>{student.studentAddress}
//                         </p>
//                     </div>
//                 ))}
//             </div>
//         );
//     };

//     if (loading) {
//         return <Loading />;
//     }

//     return (
//         <div className="mx-auto p-3 md:h-screen">
//             <h1
//                 className="text-xl text-center font-bold uppercase"
//                 style={{ color: currentColor }}
//             >
//                 Registration
//             </h1>

//             <div className="my-4 flex gap-1 md:flex-row">
//                 <div className="mb-1 md:mb-0">
//                     <RegForm />
//                 </div>
//                 <div className="md:ml-5">
//                 </div>
//             </div>
//             <div ref={tableRef}>
//                 {isMobile ? (
//                     <>
//                         {registrationData && registrationData.length > 0 ? (
//                             renderMobileCards()
//                         ) : (
//                             <NoDataFound />
//                         )}
//                         {selectedRegistration && (
//                             <MobileRegistrationCard
//                                 student={selectedRegistration}
//                                 onClose={() => setSelectedRegistration(null)}
//                                 handleDelete={handleDelete}
//                             />
//                         )}
//                     </>
//                 ) : (
//                     registrationData && registrationData.length > 0 ? (
//                         <DynamicDataTable
//                             data={registrationData}
//                             handleDelete={handleDelete}
//                         />
//                     ) : (
//                         <NoDataFound />
//                     )
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Newegistrations;



// import React, { useEffect, useState, useRef } from "react";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// import DynamicDataTable from "./DataTable.jsx";
// import NoDataFound from "../../NoDataFound.jsx";
// import Loading from "../../Loading.jsx";
// import RegForm from "./RegForm.jsx";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { StudentDeleteRegistrations, StudentgetRegistrations } from "../../Network/AdminApi.js";
// //Import For Print
// import { useReactToPrint } from 'react-to-print';
// // New import for Modal
// import { Modal } from "@mui/material";

// import { Box } from "@mui/material";
// import { AiFillDelete, AiFillEye, AiFillPrinter, AiOutlineShareAlt } from 'react-icons/ai';
// import Button from "../../Dynamic/utils/Button.jsx";

// const MobileRegistrationCard = ({ student, onClose, handleDelete }) => {
//   const schoolName = sessionStorage.getItem("schoolName");
//   const schoolimage = sessionStorage.getItem("image");
//   const schoolAddress = sessionStorage.getItem("schooladdress");
//   const schoolContact = sessionStorage.getItem("contact");

//   // Ref for printing
//   const componentPDF = useRef();

//   // Handle print (unchanged - keeps the default print option)
//   const handlePrint = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `Registration_${student.registrationNumber}`,
//     onAfterPrint: () => toast.success("PDF Downloaded Successfully!"),
//   });

//   // Handle WhatsApp Share of PDF (Using only useReactToPrint)
//   const handleWhatsAppSharePDF = () => {
//     // Trigger the print process directly.  This will open the browser's
//     // print dialog, where the user can choose to save as PDF.

//     // NOTE: There's NO way to programmatically access the PDF data
//     // generated by the browser's print dialog using ONLY useReactToPrint.
//     // It's a browser security limitation.

//     // Instead, we'll simply open the print dialog and prompt the user
//     // to save as PDF and then share that file manually.

//     handlePrint(); // Open the print dialog

//     // Construct a message to guide the user
//     const message = encodeURIComponent(
//       "1. Save the registration receipt as a PDF.\n" +
//       "2. Share the PDF file via WhatsApp."
//     );
//     const whatsappURL = `https://wa.me/?text=${message}`;

//     // Open a new window/tab for the WhatsApp link
//     window.open(whatsappURL, '_blank');
//   };



//   return (
//     <Modal
//       open={true}
//       onClose={onClose}
//       aria-labelledby="mobile-registration-modal"
//       aria-describedby="mobile-registration-modal-description"
//     >
//       <Box
//         sx={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%)',
//           width: '90%', // Mobile ke liye width 90% rakhi hai
//           maxWidth: 350, // Maximum width ko aur chhota kiya
//           bgcolor: 'background.paper',
//           border: '1px solid #000', // Border thickness reduced
//           boxShadow: 24,
//           p: 1, // Padding aur bhi reduce kiya
//           overflowY: 'auto', // Scrolling enable hai
//           maxHeight: '90vh', // Maximum height to fit within the screen
//         }}
//       >
//         {/* PDF Content */}
//         <div ref={componentPDF} style={{ width: "100%" }}>
//           <div className="max-w-2xl mx-auto p-1 border border-black bg-yellow-100 mt-2">
//             <div className="relative">
//               {/* School Logo */}
//               <div className="absolute top-0 left-0 flex justify-between h-[60px] w-[60px] object-cover">
//                 <img
//                   className="w-full h-full"
//                   src={schoolimage}
//                   alt="school logo"
//                 />
//               </div>
//               {/* Registration Number */}
//               <div className="absolute top-0 right-0 text-sm">
//                 <span>Reg.No. {student?.registrationNumber}</span>
//               </div>
//             </div>

//             {/* School Details */}
//             <div className="text-center font-bold text-md mb-2 w-[80%] mx-auto mt-4">
//               {schoolName}
//               <p className="text-xs text-gray-700">{schoolAddress}</p>
//               <p className="text-xs text-gray-700">Mobile No. : {schoolContact}</p>
//               <div className="text-center text-xs mb-2">Registration Receipt</div>
//             </div>

//             {/* Registration Date and Session */}
//             <div className="mb-2">
//               <div className="flex justify-between border-b-1 border-black border-dashed text-xs">
//                 <span>Reg. Date : {student?.formattedDate}</span>
//                 <span>Session : 2024-25</span>
//               </div>
//             </div>

//             {/* Student Details */}
//             <div className="flex flex-col space-y-1 text-xs">
//               <span>Student's Name : {student?.studentFullName}</span>
//               <span>Guardian's Name : {student?.guardianName}</span>
//               <span>Email: {student?.studentEmail}</span>
//               <span>Gender: {student?.gender}</span>
//               <span>Class : {student?.registerClass}</span>
//               <span>Mob : {student?.mobileNumber}</span>
//               <span>Address : {student?.studentAddress}</span>
//             </div>

//             {/* Payment Details Table */}
//             <div className="my-2">
//               <table className="w-full mb-2 text-xs">
//                 <thead>
//                   <tr>
//                     <th className="border border-black p-1">Sr. No.</th>
//                     <th className="border border-black p-1">Particulars</th>
//                     <th className="border border-black p-1">Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td className="border border-black p-1 text-center">1</td>
//                     <td className="border border-black p-1 text-center">
//                       Admission Fee
//                     </td>
//                     <td className="border border-black p-1 text-center">
//                       {student?.amount}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>

//             {/* Total Amount */}
//             <div className="flex justify-end mb-2 text-xs">
//               <span>{student?.amount}/-</span>
//             </div>

//             {/* Signatures */}
//             <div className="flex justify-between mb-2 my-4 text-xs">
//               <span>Signature of Centre Head</span>
//               <span>Signature of Student</span>
//             </div>

//             {/* Footer Note */}
//             <div className="text-center text-[10px]">
//               All above mentioned Amount once paid are non-refundable in any case
//               whatsoever.
//             </div>
//           </div>
//         </div>

//         {/* Buttons */}
//         <div className="mt-2 flex justify-between gap-3">
//             <Button name="Print" onClick={handlePrint} width="full" />
//             <Button name="Share PDF" onClick={handleWhatsAppSharePDF} width="full" />
//             <Button name="Close" onClick={onClose} width="full" color="#607093" />
//         </div>
//       </Box>
//     </Modal>
//   );
// };

// const Newegistrations = () => {
//     const [loading, setLoading] = useState(false);
//     const authToken = Cookies.get("token");
//     const { currentColor } = useStateContext();
//     const [registrationData, setRegistrationData] = useState([]);
//     const isMobile = window.innerWidth <= 768;
//     const tableRef = useRef();
//     const [selectedRegistration, setSelectedRegistration] = useState(null); // For mobile modal

//     const getREg = async () => {
//         setLoading(true);
//         const response = await StudentgetRegistrations();

//         if (response) {
//             setLoading(false);
//             setRegistrationData(response.data);
//             console.log("Data Received:", response);
//         } else {
//             console.error("No Data Received");
//         }
//     };

//     useEffect(() => {
//         getREg();
//     }, []);

//     const handlePrint = useReactToPrint({
//         content: () => tableRef.current,
//     });

//     const handleDelete = async (registrationNumber) => {
//         const ConfirmToast = ({ closeToast }) => (
//             <div>
//                 <p>Are you sure you want to delete this student?</p>
//                 <button
//                     className="text-red-700 font-bold text-xl"
//                     onClick={async () => {
//                         try {
//                             setLoading(true);
//                             const response = await StudentDeleteRegistrations(registrationNumber);
//                             console.log("delete respone", response);
//                             if (response) {
//                                 setLoading(false);
//                                 // refresh
//                                 getREg();
//                             }
//                         } catch (error) {
//                             console.log(error);
//                         } finally {
//                             closeToast(); // Close the toast after the operation
//                         }
//                     }}
//                     style={{ marginRight: "10px" }}
//                 >
//                     Yes
//                 </button>
//                 <button onClick={closeToast} className="text-green-800 text-xl">
//                     No
//                 </button>
//             </div>
//         );

//         toast(<ConfirmToast />);
//     };

//     const renderMobileCards = () => {
//         return (
//             <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//                 {registrationData.map((student, index) => (
//                     <div
//                         key={index}
//                         className="bg-white rounded-lg shadow-md p-4 relative transition-transform hover:scale-105 cursor-pointer"

//                     >
//                         <div className="absolute top-2 right-2 flex space-x-2 gap-2">  {/* Position the buttons top right */}
//                         <Button name="Delete"  onClick={() => handleDelete(student.registrationNumber)}width="full" color="red" />
//                         <Button name="View"  onClick={() => setSelectedRegistration(student)} width="full" />

//                         </div>
//                         <h3 className="text-lg font-semibold mb-2">
//                             {student.studentFullName}
//                         </h3>

//                         <p>
//                             <strong>Reg No:</strong> {student.registrationNumber}
//                         </p>
//                         <p>
//                             <strong>Guardian Name:</strong> {student.guardianName}
//                         </p>
//                         <p>
//                             <strong>Email:</strong> {student.studentEmail}
//                         </p>
//                         <p>
//                             <strong>Class:</strong>{student.registerClass}
//                         </p>
//                         <p>
//                             <strong>Mobile:</strong>{student.mobileNumber}
//                         </p>
//                         <p>
//                             <strong>Address:</strong>{student.studentAddress}
//                         </p>
//                     </div>
//                 ))}
//             </div>
//         );
//     };

//     if (loading) {
//         return <Loading />;
//     }

//     return (
//         <div className="mx-auto p-3 md:h-screen">
//             <h1
//                 className="text-xl text-center font-bold uppercase"
//                 style={{ color: currentColor }}
//             >
//                 Registration
//             </h1>

//             <div className="my-4 flex gap-1 md:flex-row">
//                 <div className="mb-1 md:mb-0">
//                     <RegForm />
//                 </div>
//                 <div className="md:ml-5">
//                 </div>
//             </div>
//             <div ref={tableRef}>
//                 {isMobile ? (
//                     <>
//                         {registrationData && registrationData.length > 0 ? (
//                             renderMobileCards()
//                         ) : (
//                             <NoDataFound />
//                         )}
//                         {selectedRegistration && (
//                             <MobileRegistrationCard
//                                 student={selectedRegistration}
//                                 onClose={() => setSelectedRegistration(null)}
//                                 handleDelete={handleDelete}
//                             />
//                         )}
//                     </>
//                 ) : (
//                     registrationData && registrationData.length > 0 ? (
//                         <DynamicDataTable
//                             data={registrationData}
//                             handleDelete={handleDelete}
//                         />
//                     ) : (
//                         <NoDataFound />
//                     )
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Newegistrations;


// import React, { useEffect, useState, useRef } from "react";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// import DynamicDataTable from "./DataTable.jsx";
// import NoDataFound from "../../NoDataFound.jsx";
// import Loading from "../../Loading.jsx";
// import RegForm from "./RegForm.jsx";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { StudentDeleteRegistrations, StudentgetRegistrations } from "../../Network/AdminApi.js";
// //Import For Print
// import { useReactToPrint } from 'react-to-print';
// // New import for Modal
// import { Modal } from "@mui/material";

// import { Box } from "@mui/material";
// import { AiFillDelete, AiFillEye, AiFillPrinter, AiOutlineShareAlt } from 'react-icons/ai';
// import Button from "../../Dynamic/utils/Button.jsx";

// const MobileRegistrationCard = ({ student, onClose, handleDelete }) => {
//   const schoolName = sessionStorage.getItem("schoolName");
//   const schoolimage = sessionStorage.getItem("image");
//   const schoolAddress = sessionStorage.getItem("schooladdress");
//   const schoolContact = sessionStorage.getItem("contact");

//   // Ref for printing
//   const componentPDF = useRef();

//   // Handle print
//   const handlePrint = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `Registration_${student.registrationNumber}`,
//     onAfterPrint: () => toast.success("PDF Downloaded Successfully!"),
//   });

//   // Handle WhatsApp Share
//   const handleWhatsAppShare = () => {
//     const message = `*${schoolName} Registration Details*\n\n*Registration Number:* ${student.registrationNumber}\n*Student's Name:* ${student.studentFullName}\n*Guardian's Name:* ${student.guardianName}\n*Email:* ${student.studentEmail}\n*Gender:* ${student.gender}\n*Class:* ${student.registerClass}\n*Mobile:* ${student.mobileNumber}\n*Address:* ${student.studentAddress}\n\n${schoolName} - ${schoolAddress} - Contact: ${schoolContact}`;
//     const encodedMessage = encodeURIComponent(message);
//     const whatsappURL = `https://wa.me/?text=${encodedMessage}`;
//     window.open(whatsappURL, '_blank');
//   };


//   return (
//     <Modal
//       open={true}
//       onClose={onClose}
//       aria-labelledby="mobile-registration-modal"
//       aria-describedby="mobile-registration-modal-description"
//     >
//       <Box
//         sx={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%)',
//           width: '90%', // Mobile ke liye width 90% rakhi hai
//           maxWidth: 350, // Maximum width ko aur chhota kiya
//           bgcolor: 'background.paper',
//           border: '1px solid #000', // Border thickness reduced
//           boxShadow: 24,
//           p: 1, // Padding aur bhi reduce kiya
//           overflowY: 'auto', // Scrolling enable hai
//           maxHeight: '90vh', // Maximum height to fit within the screen
//         }}
//       >
//         {/* PDF Content */}
//         <div ref={componentPDF} style={{ width: "100%" }}>
//           <div className="max-w-2xl mx-auto p-1 border border-black bg-yellow-100 mt-2">
//             <div className="relative">
//               {/* School Logo */}
//               <div className="absolute top-0 left-0 flex justify-between h-[60px] w-[60px] object-cover">
//                 <img
//                   className="w-full h-full"
//                   src={schoolimage}
//                   alt="school logo"
//                 />
//               </div>
//               {/* Registration Number */}
//               <div className="absolute top-0 right-0 text-sm">
//                 <span>Reg.No. {student?.registrationNumber}</span>
//               </div>
//             </div>

//             {/* School Details */}
//             <div className="text-center font-bold text-md mb-2 w-[80%] mx-auto mt-4">
//               {schoolName}
//               <p className="text-xs text-gray-700">{schoolAddress}</p>
//               <p className="text-xs text-gray-700">Mobile No. : {schoolContact}</p>
//               <div className="text-center text-xs mb-2">Registration Receipt</div>
//             </div>

//             {/* Registration Date and Session */}
//             <div className="mb-2">
//               <div className="flex justify-between border-b-1 border-black border-dashed text-xs">
//                 <span>Reg. Date : {student?.formattedDate}</span>
//                 <span>Session : 2024-25</span>
//               </div>
//             </div>

//             {/* Student Details */}
//             <div className="flex flex-col space-y-1 text-xs">
//               <span>Student's Name : {student?.studentFullName}</span>
//               <span>Guardian's Name : {student?.guardianName}</span>
//               <span>Email: {student?.studentEmail}</span>
//               <span>Gender: {student?.gender}</span>
//               <span>Class : {student?.registerClass}</span>
//               <span>Mob : {student?.mobileNumber}</span>
//               <span>Address : {student?.studentAddress}</span>
//             </div>

//             {/* Payment Details Table */}
//             <div className="my-2">
//               <table className="w-full mb-2 text-xs">
//                 <thead>
//                   <tr>
//                     <th className="border border-black p-1">Sr. No.</th>
//                     <th className="border border-black p-1">Particulars</th>
//                     <th className="border border-black p-1">Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td className="border border-black p-1 text-center">1</td>
//                     <td className="border border-black p-1 text-center">
//                       Admission Fee
//                     </td>
//                     <td className="border border-black p-1 text-center">
//                       {student?.amount}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>

//             {/* Total Amount */}
//             <div className="flex justify-end mb-2 text-xs">
//               <span>{student?.amount}/-</span>
//             </div>

//             {/* Signatures */}
//             <div className="flex justify-between mb-2 my-4 text-xs">
//               <span>Signature of Centre Head</span>
//               <span>Signature of Student</span>
//             </div>

//             {/* Footer Note */}
//             <div className="text-center text-[10px]">
//               All above mentioned Amount once paid are non-refundable in any case
//               whatsoever.
//             </div>
//           </div>
//         </div>

//         {/* Buttons */}
//         <div className="mt-2 flex justify-between gap-3">
//         <Button name="Print" onClick={handlePrint} width="full" />
//         <Button  name="Share" onClick={handleWhatsAppShare} width="full" />
//         <Button  name="Close" onClick={onClose} width="full" color="#607093"  />

//         </div>
//       </Box>
//     </Modal>
//   );
// };

// const Newegistrations = () => {
//     const [loading, setLoading] = useState(false);
//     const authToken = Cookies.get("token");
//     const { currentColor } = useStateContext();
//     const [registrationData, setRegistrationData] = useState([]);
//     const isMobile = window.innerWidth <= 768;
//     const tableRef = useRef();
//     const [selectedRegistration, setSelectedRegistration] = useState(null); // For mobile modal

//     const getREg = async () => {
//         setLoading(true);
//         const response = await StudentgetRegistrations();

//         if (response) {
//             setLoading(false);
//             setRegistrationData(response.data);
//             console.log("Data Received:", response);
//         } else {
//             console.error("No Data Received");
//         }
//     };

//     useEffect(() => {
//         getREg();
//     }, []);

//     const handlePrint = useReactToPrint({
//         content: () => tableRef.current,
//     });

//     const handleDelete = async (registrationNumber) => {
//         const ConfirmToast = ({ closeToast }) => (
//             <div>
//                 <p>Are you sure you want to delete this student?</p>
//                 <button
//                     className="text-red-700 font-bold text-xl"
//                     onClick={async () => {
//                         try {
//                             setLoading(true);
//                             const response = await StudentDeleteRegistrations(registrationNumber);
//                             console.log("delete respone", response);
//                             if (response) {
//                                 setLoading(false);
//                                 // refresh
//                                 getREg();
//                             }
//                         } catch (error) {
//                             console.log(error);
//                         } finally {
//                             closeToast(); // Close the toast after the operation
//                         }
//                     }}
//                     style={{ marginRight: "10px" }}
//                 >
//                     Yes
//                 </button>
//                 <button onClick={closeToast} className="text-green-800 text-xl">
//                     No
//                 </button>
//             </div>
//         );

//         toast(<ConfirmToast />);
//     };

//     const renderMobileCards = () => {
//         return (
//             <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//                 {registrationData.map((student, index) => (
//                     <div
//                         key={index}
//                         className="bg-white rounded-lg shadow-md p-4 relative transition-transform hover:scale-105 cursor-pointer"

//                     >
//                         <div className="absolute top-2 right-2 flex space-x-2 gap-2">  {/* Position the buttons top right */}
//                         <Button name="Delete"  onClick={() => handleDelete(student.registrationNumber)}width="full" color="red" />
//                         <Button name="View"  onClick={() => setSelectedRegistration(student)} width="full" />

//                         </div>
//                         <h3 className="text-lg font-semibold mb-2">
//                             {student.studentFullName}
//                         </h3>

//                         <p>
//                             <strong>Reg No:</strong> {student.registrationNumber}
//                         </p>
//                         <p>
//                             <strong>Guardian Name:</strong> {student.guardianName}
//                         </p>
//                         <p>
//                             <strong>Email:</strong> {student.studentEmail}
//                         </p>
//                         <p>
//                             <strong>Class:</strong>{student.registerClass}
//                         </p>
//                         <p>
//                             <strong>Mobile:</strong>{student.mobileNumber}
//                         </p>
//                         <p>
//                             <strong>Address:</strong>{student.studentAddress}
//                         </p>
//                     </div>
//                 ))}
//             </div>
//         );
//     };

//     if (loading) {
//         return <Loading />;
//     }

//     return (
//         <div className="mx-auto p-3 md:h-screen">
//             <h1
//                 className="text-xl text-center font-bold uppercase"
//                 style={{ color: currentColor }}
//             >
//                 Registration
//             </h1>

//             <div className="my-4 flex gap-1 md:flex-row">
//                 <div className="mb-1 md:mb-0">
//                     <RegForm />
//                 </div>
//                 <div className="md:ml-5">
//                 </div>
//             </div>
//             <div ref={tableRef}>
//                 {isMobile ? (
//                     <>
//                         {registrationData && registrationData.length > 0 ? (
//                             renderMobileCards()
//                         ) : (
//                             <NoDataFound />
//                         )}
//                         {selectedRegistration && (
//                             <MobileRegistrationCard
//                                 student={selectedRegistration}
//                                 onClose={() => setSelectedRegistration(null)}
//                                 handleDelete={handleDelete}
//                             />
//                         )}
//                     </>
//                 ) : (
//                     registrationData && registrationData.length > 0 ? (
//                         <DynamicDataTable
//                             data={registrationData}
//                             handleDelete={handleDelete}
//                         />
//                     ) : (
//                         <NoDataFound />
//                     )
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Newegistrations;


// import React, { useEffect, useState, useRef } from "react";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// import DynamicDataTable from "./DataTable.jsx";
// import NoDataFound from "../../NoDataFound.jsx";
// import Loading from "../../Loading.jsx";
// import RegForm from "./RegForm.jsx";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { StudentDeleteRegistrations, StudentgetRegistrations } from "../../Network/AdminApi.js";
// //Import For Print
// import { useReactToPrint } from 'react-to-print';
// // New import for Modal
// import { Modal } from "@mui/material";

// import { Box } from "@mui/material";
// import { AiFillDelete, AiFillEye, AiFillPrinter } from 'react-icons/ai'; 
// import Button from "../../Dynamic/utils/Button.jsx";

// const MobileRegistrationCard = ({ student, onClose, handleDelete }) => {
//   const schoolName = sessionStorage.getItem("schoolName");
//   const schoolimage = sessionStorage.getItem("image");
//   const schoolAddress = sessionStorage.getItem("schooladdress");
//   const schoolContact = sessionStorage.getItem("contact");

//   // Ref for printing
//   const componentPDF = useRef();

//   // Handle print
//   const handlePrint = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `Registration_${student.registrationNumber}`,
//     onAfterPrint: () => toast.success("PDF Downloaded Successfully!"),
//   });

//   return (
//     <Modal
//       open={true}
//       onClose={onClose}
//       aria-labelledby="mobile-registration-modal"
//       aria-describedby="mobile-registration-modal-description"
//     >
//       <Box
//         sx={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%)',
//           width: '90%', // Mobile ke liye width 90% rakhi hai
//           maxWidth: 350, // Maximum width ko aur chhota kiya
//           bgcolor: 'background.paper',
//           border: '1px solid #000', // Border thickness reduced
//           boxShadow: 24,
//           p: 1, // Padding aur bhi reduce kiya
//           overflowY: 'auto', // Scrolling enable hai
//           maxHeight: '90vh', // Maximum height to fit within the screen
//         }}
//       >
//         {/* PDF Content */}
//         <div ref={componentPDF} style={{ width: "100%" }}>
//           <div className="max-w-2xl mx-auto p-1 border border-black bg-yellow-100 mt-2">
//             <div className="relative">
//               {/* School Logo */}
//               <div className="absolute top-0 left-0 flex justify-between h-[60px] w-[60px] object-cover">
//                 <img
//                   className="w-full h-full"
//                   src={schoolimage}
//                   alt="school logo"
//                 />
//               </div>
//               {/* Registration Number */}
//               <div className="absolute top-0 right-0 text-sm">
//                 <span>Reg.No. {student?.registrationNumber}</span>
//               </div>
//             </div>

//             {/* School Details */}
//             <div className="text-center font-bold text-md mb-2 w-[80%] mx-auto mt-4">
//               {schoolName}
//               <p className="text-xs text-gray-700">{schoolAddress}</p>
//               <p className="text-xs text-gray-700">Mobile No. : {schoolContact}</p>
//               <div className="text-center text-xs mb-2">Registration Receipt</div>
//             </div>

//             {/* Registration Date and Session */}
//             <div className="mb-2">
//               <div className="flex justify-between border-b-1 border-black border-dashed text-xs">
//                 <span>Reg. Date : {student?.formattedDate}</span>
//                 <span>Session : 2024-25</span>
//               </div>
//             </div>

//             {/* Student Details */}
//             <div className="flex flex-col space-y-1 text-xs">
//               <span>Student's Name : {student?.studentFullName}</span>
//               <span>Guardian's Name : {student?.guardianName}</span>
//               <span>Email: {student?.studentEmail}</span>
//               <span>Gender: {student?.gender}</span>
//               <span>Class : {student?.registerClass}</span>
//               <span>Mob : {student?.mobileNumber}</span>
//               <span>Address : {student?.studentAddress}</span>
//             </div>

//             {/* Payment Details Table */}
//             <div className="my-2">
//               <table className="w-full mb-2 text-xs">
//                 <thead>
//                   <tr>
//                     <th className="border border-black p-1">Sr. No.</th>
//                     <th className="border border-black p-1">Particulars</th>
//                     <th className="border border-black p-1">Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td className="border border-black p-1 text-center">1</td>
//                     <td className="border border-black p-1 text-center">
//                       Admission Fee
//                     </td>
//                     <td className="border border-black p-1 text-center">
//                       {student?.amount}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>

//             {/* Total Amount */}
//             <div className="flex justify-end mb-2 text-xs">
//               <span>{student?.amount}/-</span>
//             </div>

//             {/* Signatures */}
//             <div className="flex justify-between mb-2 my-4 text-xs">
//               <span>Signature of Centre Head</span>
//               <span>Signature of Student</span>
//             </div>

//             {/* Footer Note */}
//             <div className="text-center text-[10px]">
//               All above mentioned Amount once paid are non-refundable in any case
//               whatsoever.
//             </div>
//           </div>
//         </div>

//         {/* Buttons */}
//         <div className="mt-2 flex justify-between gap-3">
//         <Button name="Print" onClick={handlePrint} width="full" />
//         <Button  name="Close" onClick={onClose} width="full" color="#607093"  />
         
//         </div>
//       </Box>
//     </Modal>
//   );
// };

// const Newegistrations = () => {
//     const [loading, setLoading] = useState(false);
//     const authToken = Cookies.get("token");
//     const { currentColor } = useStateContext();
//     const [registrationData, setRegistrationData] = useState([]);
//     const isMobile = window.innerWidth <= 768;
//     const tableRef = useRef();
//     const [selectedRegistration, setSelectedRegistration] = useState(null); // For mobile modal

//     const getREg = async () => {
//         setLoading(true);
//         const response = await StudentgetRegistrations();

//         if (response) {
//             setLoading(false);
//             setRegistrationData(response.data);
//             console.log("Data Received:", response);
//         } else {
//             console.error("No Data Received");
//         }
//     };

//     useEffect(() => {
//         getREg();
//     }, []);

//     const handlePrint = useReactToPrint({
//         content: () => tableRef.current,
//     });

//     const handleDelete = async (registrationNumber) => {
//         const ConfirmToast = ({ closeToast }) => (
//             <div>
//                 <p>Are you sure you want to delete this student?</p>
//                 <button
//                     className="text-red-700 font-bold text-xl"
//                     onClick={async () => {
//                         try {
//                             setLoading(true);
//                             const response = await StudentDeleteRegistrations(registrationNumber);
//                             console.log("delete respone", response);
//                             if (response) {
//                                 setLoading(false);
//                                 // refresh
//                                 getREg();
//                             }
//                         } catch (error) {
//                             console.log(error);
//                         } finally {
//                             closeToast(); // Close the toast after the operation
//                         }
//                     }}
//                     style={{ marginRight: "10px" }}
//                 >
//                     Yes
//                 </button>
//                 <button onClick={closeToast} className="text-green-800 text-xl">
//                     No
//                 </button>
//             </div>
//         );

//         toast(<ConfirmToast />);
//     };

//     const renderMobileCards = () => {
//         return (
//             <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//                 {registrationData.map((student, index) => (
//                     <div
//                         key={index}
//                         className="bg-white rounded-lg shadow-md p-4 relative transition-transform hover:scale-105 cursor-pointer"

//                     >
//                         <div className="absolute top-2 right-2 flex space-x-2 gap-2">  {/* Position the buttons top right */}
//                         <Button name="Delete"  onClick={() => handleDelete(student.registrationNumber)}width="full" color="red" />
//                         <Button name="View"  onClick={() => setSelectedRegistration(student)} width="full" />
                            
//                         </div>
//                         <h3 className="text-lg font-semibold mb-2">
//                             {student.studentFullName}
//                         </h3>

//                         <p>
//                             <strong>Reg No:</strong> {student.registrationNumber}
//                         </p>
//                         <p>
//                             <strong>Guardian Name:</strong> {student.guardianName}
//                         </p>
//                         <p>
//                             <strong>Email:</strong> {student.studentEmail}
//                         </p>
//                         <p>
//                             <strong>Class:</strong>{student.registerClass}
//                         </p>
//                         <p>
//                             <strong>Mobile:</strong>{student.mobileNumber}
//                         </p>
//                         <p>
//                             <strong>Address:</strong>{student.studentAddress}
//                         </p>
//                     </div>
//                 ))}
//             </div>
//         );
//     };

//     if (loading) {
//         return <Loading />;
//     }

//     return (
//         <div className="mx-auto p-3 md:h-screen">
//             <h1
//                 className="text-xl text-center font-bold uppercase"
//                 style={{ color: currentColor }}
//             >
//                 Registration
//             </h1>
           
//             <div className="my-4 flex gap-1 md:flex-row">
//                 <div className="mb-1 md:mb-0">
//                     <RegForm />
//                 </div>
//                 <div className="md:ml-5">
//                 </div>
//             </div>
//             <div ref={tableRef}>
//                 {isMobile ? (
//                     <>
//                         {registrationData && registrationData.length > 0 ? (
//                             renderMobileCards()
//                         ) : (
//                             <NoDataFound />
//                         )}
//                         {selectedRegistration && (
//                             <MobileRegistrationCard
//                                 student={selectedRegistration}
//                                 onClose={() => setSelectedRegistration(null)}
//                                 handleDelete={handleDelete}
//                             />
//                         )}
//                     </>
//                 ) : (
//                     registrationData && registrationData.length > 0 ? (
//                         <DynamicDataTable
//                             data={registrationData}
//                             handleDelete={handleDelete}
//                         />
//                     ) : (
//                         <NoDataFound />
//                     )
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Newegistrations;


// import React, { useEffect, useState, useRef } from "react";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// import DynamicDataTable from "./DataTable.jsx";
// import NoDataFound from "../../NoDataFound.jsx";
// import Loading from "../../Loading.jsx";
// import RegForm from "./RegForm.jsx";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { StudentDeleteRegistrations, StudentgetRegistrations } from "../../Network/AdminApi.js";
// //Import For Print
// import { useReactToPrint } from 'react-to-print';
// // New import for Modal
// import { Modal } from "@mui/material";
// import { Button } from "@mui/material";
// import { Box } from "@mui/material";
// //New Component For Mobile View
// const MobileRegistrationCard = ({ student, onClose, handleDelete }) => {
//     return (
//         <Modal
//             open={true}
//             onClose={onClose}
//             aria-labelledby="mobile-registration-modal"
//             aria-describedby="mobile-registration-modal-description"
//         >
//             <Box
//                 sx={{
//                     position: 'absolute',
//                     top: '50%',
//                     left: '50%',
//                     transform: 'translate(-50%, -50%)',
//                     width: 400,
//                     bgcolor: 'background.paper',
//                     border: '2px solid #000',
//                     boxShadow: 24,
//                     p: 4,
//                 }}
//             >
//                 <h3 className="text-lg font-semibold mb-2">
//                     {student.studentFullName}
//                 </h3>
//                 <p>
//                     <strong>Reg No:</strong> {student.registrationNumber}
//                 </p>
//                 <p>
//                     <strong>Guardian Name:</strong> {student.guardianName}
//                 </p>
//                 <p>
//                     <strong>Email:</strong> {student.studentEmail}
//                 </p>
//                 <p>
//                     <strong>Class:</strong>{student.registerClass}
//                 </p>
//                 <p>
//                     <strong>Mobile:</strong>{student.mobileNumber}
//                 </p>
//                 <p>
//                     <strong>Address:</strong>{student.studentAddress}
//                 </p>
//                 <div className="mt-4 flex justify-between">
//                   <Button
//                     variant="contained"
//                     color="secondary"
//                     onClick={onClose}
//                   >
//                     Close
//                   </Button>
//                    {/* <Button
//                       variant="contained"
//                       color="error"
//                       onClick={() => handleDelete(student.registrationNumber)}
//                     >
//                       Delete
//                   </Button> */}
//                 </div>
//             </Box>
//         </Modal>
//     );
// };

// const Newegistrations = () => {
//     const [loading, setLoading] = useState(false);
//     const authToken = Cookies.get("token");
//     const { currentColor } = useStateContext();
//     const [registrationData, setRegistrationData] = useState([]);
//     const isMobile = window.innerWidth <= 768;
//     const tableRef = useRef();
//     const [selectedRegistration, setSelectedRegistration] = useState(null); // For mobile modal

//     const getREg = async () => {
//         setLoading(true);
//         const response = await StudentgetRegistrations();

//         if (response) {
//             setLoading(false);
//             setRegistrationData(response.data);
//             console.log("Data Received:", response);
//         } else {
//             console.error("No Data Received");
//         }
//     };

//     useEffect(() => {
//         getREg();
//     }, []);

//     const handlePrint = useReactToPrint({
//         content: () => tableRef.current,
//     });

//     const handleDelete = async (registrationNumber) => {
//         const ConfirmToast = ({ closeToast }) => (
//             <div>
//                 <p>Are you sure you want to delete this student?</p>
//                 <button
//                     className="text-red-700 font-bold text-xl"
//                     onClick={async () => {
//                         try {
//                             setLoading(true);
//                             const response = await StudentDeleteRegistrations(registrationNumber);
//                             console.log("delete respone", response);
//                             if (response) {
//                                 setLoading(false);
//                                 // refresh
//                                 getREg();
//                             }
//                         } catch (error) {
//                             console.log(error);
//                         } finally {
//                             closeToast(); // Close the toast after the operation
//                         }
//                     }}
//                     style={{ marginRight: "10px" }}
//                 >
//                     Yes
//                 </button>
//                 <button onClick={closeToast} className="text-green-800 text-xl">
//                     No
//                 </button>
//             </div>
//         );

//         toast(<ConfirmToast />);
//     };

//     const renderMobileCards = () => {
//         return (
//             <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//                 {registrationData.map((student, index) => (
//                     <div
//                         key={index}
//                         className="bg-white rounded-lg shadow-md p-4 relative transition-transform hover:scale-105 cursor-pointer"
                       
//                     >
//                         <h3 className="text-lg font-semibold mb-2">
//                             {student.studentFullName}
//                         </h3>
//                         <Button
//                       variant="contained"
//                       color="error"
//                       onClick={() => handleDelete(student.registrationNumber)}
//                     >
//                       Delete
//                   </Button>
//                         <Button
//                       variant="contained"
//                       color="error"
                   
//                       onClick={() => setSelectedRegistration(student)}
//                     >
//                       View
//                   </Button>
//                         <p>
//                             <strong>Reg No:</strong> {student.registrationNumber}
//                         </p>
//                         <p>
//                             <strong>Guardian Name:</strong> {student.guardianName}
//                         </p>
//                         <p>
//                             <strong>Email:</strong> {student.studentEmail}
//                         </p>
//                         <p>
//                             <strong>Class:</strong>{student.registerClass}
//                         </p>
//                         <p>
//                             <strong>Mobile:</strong>{student.mobileNumber}
//                         </p>
//                         <p>
//                             <strong>Address:</strong>{student.studentAddress}
//                         </p>
//                     </div>
//                 ))}
//             </div>
//         );
//     };

//     if (loading) {
//         return <Loading />;
//     }

//     return (
//         <div className="mx-auto p-3 md:h-screen">
//             <h1
//                 className="text-xl text-center font-bold uppercase"
//                 style={{ color: currentColor }}
//             >
//                 Registration
//             </h1>
//             {/* <button onClick={handlePrint} style={{ background: currentColor}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
//                 Print
//                 </button> */}
//             <div className="my-4 flex gap-1 md:flex-row">
//                 <div className="mb-1 md:mb-0">
//                     <RegForm />
//                 </div>
//                 <div className="md:ml-5">
//                 </div>
//             </div>
//             <div ref={tableRef}>
//                 {isMobile ? (
//                     <>
//                         {registrationData && registrationData.length > 0 ? (
//                             renderMobileCards()
//                         ) : (
//                             <NoDataFound />
//                         )}
//                         {selectedRegistration && (
//                             <MobileRegistrationCard
//                                 student={selectedRegistration}
//                                 onClose={() => setSelectedRegistration(null)}
//                                 handleDelete={handleDelete}
//                             />
//                         )}
//                     </>
//                 ) : (
//                     registrationData && registrationData.length > 0 ? (
//                         <DynamicDataTable
//                             data={registrationData}
//                             handleDelete={handleDelete}
//                         />
//                     ) : (
//                         <NoDataFound />
//                     )
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Newegistrations;



// import React, { useEffect, useState, useRef } from "react";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// import DynamicDataTable from "./DataTable.jsx";
// import NoDataFound from "../../NoDataFound.jsx";
// import useCustomQuery from "../../useCustomQuery.jsx";
// import Loading from "../../Loading.jsx";
// import SomthingwentWrong from "../../SomthingwentWrong.jsx";
// import RegForm from "./RegForm.jsx";
// import Bulkegistration from "./Bulkegistration.jsx";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import Heading from "../../Dynamic/Heading.jsx";
// import { useReactToPrint } from "react-to-print"; // Import here!
// import { StudentDeleteRegistrations, StudentgetRegistrations } from "../../Network/AdminApi.js";

// const Newegistrations = () => {
//   const [loading, setLoading] = useState(false);  
//   const authToken = Cookies.get("token");
//   const { currentColor } = useStateContext();
//   const [registrationData, setRegistrationData] = useState();
//   const isMobile = window.innerWidth <= 768;
//   const tableRef = useRef();

//   // const {
//   //   queryData: allRegistration,
//   //   error: registrationError,
//   //   loading: registrationLoading,
//   //   refetch: refetchRegistrations,
//   // } = useCustomQuery(
//   //   "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getRegistrations"
//   // );
//   // useEffect(() => {
//   //   if (allRegistration) {
//   //     setRegistrationData(allRegistration.data);
//   //   }
//   // }, [allRegistration]);

//   const getREg = async () => {
//     setLoading(true)
//     const response = await StudentgetRegistrations();

// if (response) {
//   setLoading(false)
//   setRegistrationData(response.data);
//     console.log("Data Received:", response);
// } else {
//     console.error("No Data Received");
// }

//   };
//   useEffect(()=>{
//     getREg()
//   },[])

//     const handlePrint = useReactToPrint({
//         content: () => tableRef.current,
//     });

//   const handleDelete = async(registrationNumber) => {
//     console.log("registrationNumberaaaav",registrationNumber)
//     const ConfirmToast = ({ closeToast }) => (
//       <div>
//         <p>Are you sure you want to delete this student?</p>
//         <button
//           className="text-red-700 font-bold text-xl"
//           onClick={ async() => {
//             try {
//               setLoading(true)
//               const response= await StudentDeleteRegistrations(registrationNumber)
//               console.log("delete respone",response)
// if(response){
//   setLoading(false)
// }
//             } catch (error) {
//               console.log(error);
//             }
//           }}
//           style={{ marginRight: "10px" }}
//         >
//           Yes
//         </button>
//         <button onClick={closeToast} className="text-green-800 text-xl">
//           No
//         </button>
//       </div>
//     );

//     toast(<ConfirmToast />);
//   };

//     const renderMobileCards = () => {
//     return (
//       <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//           {registrationData.map((student, index) => (
//           <div key={index} className="bg-white rounded-lg shadow-md p-4 relative transition-transform hover:scale-105">
//             <h3 className="text-lg font-semibold mb-2">
//               {student.studentFullName}
//             </h3>
//             <p>
//               <strong>Reg No:</strong> {student.registrationNumber}
//             </p>
//             <p>
//               <strong>Guardian Name:</strong> {student.guardianName}
//             </p>
//             <p>
//               <strong>Email:</strong> {student.studentEmail}
//             </p>
//             <p>
//                 <strong>Class:</strong>{student.registerClass}
//             </p>
//             <p>
//                 <strong>Mobile:</strong>{student.mobileNumber}
//             </p>
//             <p>
//                 <strong>Address:</strong>{student.studentAddress}
//             </p>
           
//           </div>
//         ))}
//       </div>
//     );
//   };

// if(loading){
//   return <Loading/>
// }
//   // if (registrationLoading) {
//   //   return <Loading />;
//   // }
//   // if (registrationError) {
//   //   return <SomthingwentWrong />;
//   // }
//   return (
//     <div className="mx-auto p-3 md:h-screen">
//       <h1
//         className="text-xl text-center font-bold uppercase"
//         style={{ color: currentColor }}
//       >
//         Registration
//       </h1>
//         {/* <button onClick={handlePrint} style={{ background: currentColor}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
//         Print
//         </button> */}
//       <div className="my-4 flex gap-1 md:flex-row">
//         <div className="mb-1 md:mb-0">
//            <RegForm
         
//              /> 
//            {/* <RegForm refreshRegistrations={refetchRegistrations} />  */}
//         </div>
//         <div className="md:ml-5">
//           {/* <Bulkegistration refreshRegistrations={refetchRegistrations} /> */}
//         </div>
//       </div>
//       <div ref={tableRef}>
//           {isMobile ? (
//               registrationData && registrationData.length > 0 ? (
//                   renderMobileCards()
//               ) : (
//                   <NoDataFound />
//               )
//           ) : (
//               registrationData && registrationData.length > 0 ? (
//                   <DynamicDataTable
//                       data={registrationData}
//                       handleDelete={handleDelete}
//                   />
//               ) : (
//                   <NoDataFound />
//               )
//           )}
//       </div>
//     </div>
//   );
// };

// export default Newegistrations;




// import React, { useEffect, useState } from "react";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// import DynamicDataTable from "./DataTable.jsx";
// import NoDataFound from "../../NoDataFound.jsx";
// import useCustomQuery from "../../useCustomQuery.jsx";
// import Loading from "../../Loading.jsx";
// import SomthingwentWrong from "../../SomthingwentWrong.jsx";
// import RegForm from "./RegForm.jsx";
// import Bulkegistration from "./Bulkegistration.jsx";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import Heading from "../../Dynamic/Heading.jsx";


// const Newegistrations = () => {
//   const authToken = Cookies.get("token");
//   const { currentColor } = useStateContext();
//   const [registrationData, setRegistrationData] = useState();

//   const {
//     queryData: allRegistration,
//     error: registrationError,
//     loading: registrationLoading,
//     refetch: refetchRegistrations,
//   } = useCustomQuery(
//     "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getRegistrations"
//   );
//   useEffect(() => {
//     if (allRegistration) {
//       setRegistrationData(allRegistration.data);
//     }
//   }, [allRegistration]);

//   const handleDelete = (registrationNumber) => {
//     const ConfirmToast = ({ closeToast }) => (
//       <div>
//         <p>Are you sure you want to delete this student?</p>
//         <button
//           className="text-red-700 font-bold text-xl"
//           onClick={() => {
//             try {
//               console.log("click1");
//               axios
//                 .delete(
//                   `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deleteRegistration/${registrationNumber}`,
//                   {
//                     withCredentials: true,
//                     headers: {
//                       Authorization: `Bearer ${authToken}`,
//                     },
//                   }
//                 )
//                 .then((response) => {
//                   refetchRegistrations();
//                   console.log("firstresponse", response.data.message);
//                   toast.success(response.data.message);
//                 });
//             } catch (error) {
//               console.log(error);
//             }
//           }}
//           style={{ marginRight: "10px" }}
//         >
//           Yes
//         </button>
//         <button onClick={closeToast} className="text-green-800 text-xl">
//           No
//         </button>
//       </div>
//     );

//     toast(<ConfirmToast />);
//   };

//   if (registrationLoading) {
//     return <Loading />;
//   }
//   if (registrationError) {
//     return <SomthingwentWrong />;
//   }
//   return (
//     <div className="mx-auto p-3 md:h-screen">
//      <h1 className="text-xl text-center font-bold uppercase" 
//           style={{color:currentColor}}
//           >Registration</h1>
//       {/* <Heading Name="Registration" /> */}
//       <div className="my-4 flex flex-col md:flex-row"> {/* Changed to flex-col on mobile */}
//         <div className="mb-4 md:mb-0">  {/*Added a margin-bottom on mobile */}
//            <RegForm refreshRegistrations={refetchRegistrations} />
//         </div>
//         <div className="md:ml-5">
//           <Bulkegistration refreshRegistrations={refetchRegistrations} />
//         </div>
//       </div>
//       {registrationData && registrationData.length > 0 ? (
//         <DynamicDataTable data={registrationData} handleDelete={handleDelete} />
//       ) : (
//         <NoDataFound />
//       )}
//     </div>
//   );
// };

// export default Newegistrations;



// import React, { useEffect, useState } from "react";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// import DynamicDataTable from "./DataTable.jsx";
// import NoDataFound from "../../NoDataFound.jsx";
// import useCustomQuery from "../../useCustomQuery.jsx";
// import Loading from "../../Loading.jsx";
// import SomthingwentWrong from "../../SomthingwentWrong.jsx";
// import RegForm from "./RegForm.jsx";
// import Bulkegistration from "./Bulkegistration.jsx";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import Heading from "../../Dynamic/Heading.jsx";

// const Newegistrations = () => {
//   const authToken = Cookies.get("token");
//   const { currentColor } = useStateContext();
//   const [registrationData, setRegistrationData] = useState();

//   const {
//     queryData: allRegistration,
//     error: registrationError,
//     loading: registrationLoading,
//     refetch: refetchRegistrations,
//   } = useCustomQuery(
//     "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getRegistrations"
//   );
//   useEffect(() => {
//     if (allRegistration) {
//       setRegistrationData(allRegistration.data);
//     }
//   }, [allRegistration]);

//   const handleDelete = (registrationNumber) => {
//     const ConfirmToast = ({ closeToast }) => (
//       <div>
//         <p>Are you sure you want to delete this student?</p>
//         <button
//           className="text-red-700 font-bold text-xl"
//           onClick={() => {
//             try {
//               console.log("click1");
//               axios
//                 .delete(
//                   `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deleteRegistration/${registrationNumber}`,
//                   {
//                     withCredentials: true,
//                     headers: {
//                       Authorization: `Bearer ${authToken}`,
//                     },
//                   }
//                 )
//                 .then((response) => {
//                   refetchRegistrations();
//                   console.log("firstresponse", response.data.message);
//                   toast.success(response.data.message);
//                 });
//             } catch (error) {
//               console.log(error);
//             }
//           }}
//           style={{ marginRight: "10px" }}
//         >
//           Yes
//         </button>
//         <button onClick={closeToast} className="text-green-800 text-xl">
//           No
//         </button>
//       </div>
//     );

//     toast(<ConfirmToast />);
//   };

//   if (registrationLoading) {
//     return <Loading />;
//   }
//   if (registrationError) {
//     return <SomthingwentWrong />;
//   }
//   return (
//     <div className=" mx-auto p-3 md:h-screen">
//        <h1 className="text-xl text-center font-bold uppercase" 
//           style={{color:currentColor}}
//           >Registration</h1>
//       {/* <Heading Name="Registration" /> */}
//       <div className=" my-4 flex  ">
//         <RegForm refreshRegistrations={refetchRegistrations} />
//         <div className="ml-5">
//           <Bulkegistration refreshRegistrations={refetchRegistrations} />
//         </div>
//       </div>
//       {registrationData && registrationData.length > 0 ? (
//         <DynamicDataTable data={registrationData} handleDelete={handleDelete} />
//       ) : (
//         <NoDataFound />
//       )}
    
//     </div>
//   );
// };

// export default Newegistrations;
