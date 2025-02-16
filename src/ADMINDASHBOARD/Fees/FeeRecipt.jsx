import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { format, parseISO } from "date-fns";
import { MdFileDownload } from "react-icons/md";
import DownloadIcon from "@mui/icons-material/Download";
import { useStateContext } from "../../contexts/ContextProvider.js";
import { toWords } from "number-to-words";
import { Button } from "@mui/material"
import "./Print.css"
const FeeRecipt = ({ modalData, handleCloseModal }) => {
  const { currentColor } = useStateContext();
  const schoolName = sessionStorage.getItem("schoolName");
  const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));
  console.log("SchoolDetails",SchoolDetails)
  const schoolContact = sessionStorage.getItem("schoolContact");
  const schoolAddress = sessionStorage.getItem("schooladdress");
  const SchoolImage = sessionStorage.getItem("image");
  const componentPDF = useRef();

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    onBeforeGetContent: () => {
      document.title = `${modalData.studentName}'s FeeReceipt`;
    },
    onAfterPrint: () => {
      alert("modalData saved in PDF");
      handleCloseModal();
      setTimeout(() => {
        document.title = "OriginalTitle";
      }, 100);
    },
  });
  const Repees = () => {
    return modalData.totalAmountPaid;
  };
  const date = () => {
    let newDate = parseISO(modalData.date);
    return format(newDate, "dd/MM/yyyy");
  };

  return (
    <div >
      <a
        // variant="contained"
        onClick={generatePDF}
        // startIcon={<DownloadIcon />}
        className="text-black absolute right-16 top-3 cursor-pointer bg-red-400"
        // style={{ backgroundColor: currentColor,  }}
      >
      <DownloadIcon />
      </a>
        <div className=" flex flex-1 p-2 " ref={componentPDF} >
          <div className="w-[400px] pe-[15px] border-r border-dashed border-gray-800   rounded-sm dark:text-white">
            <div className="flex justify-between ">
              <div className=" h-auto w-[150px]  dark:text-white  ">
                <img
                  className="h-12 w-12 rounded-full "
                  src={SchoolImage}
                  alt="logo"
                />
              </div>
              <div className="text-end  dark:text-white">
                <h1 className="font-semibold whitespace-nowrap">{SchoolDetails?.fullName}</h1>
                <p className="text-sm">Address: {SchoolDetails?.address} </p>
                <p className="text-sm">Contact: {SchoolDetails?.contact}</p>
              </div>
            </div>
            <div className="bg-gray-300 text-center  border-b-2 border-red-500 ">
              <h3 class="font-bold text-[9px] scale-125">Fee receipt :</h3>
            </div>
            <div className="flex justify-between text-[12px] dark:text-white">
              <div>
                <div className="text-[12px]">
                  Rec.No.: <strong>{modalData.feeReceiptNumber}</strong>
                </div>
                <div className="text-[12px]">
                  Name: <strong>{modalData.studentName}</strong>
                </div>
                <div className="text-[12px]">
                  Class: <strong> {modalData.studentClass}</strong>
                </div>
                <div className="text-[12px]">
                  S/D. of: <strong>......</strong>
                </div>
                {
                modalData.transactionId.length>4 &&  <div className="text-[12px]">
                checkBook/transactionId: <strong>{modalData.transactionId}</strong>
               </div>
                }
               
              </div>
              <div>
                <div className="text-[12px]">
                  Date: <strong>{date()}</strong>
                </div>
                <div className="text-[12px]">
                  Adm No: <strong>{modalData.admissionNumber}</strong>
                </div>
                <div className="text-[12px]">
                  Mode: <strong>{modalData.paymentMode}</strong>
                </div>
               
              </div>
            </div>
            {(modalData.regularFees.length > 0  || modalData.additionalFees.length > 0) ? (
              <table class="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th class="border border-gray-500 pl-2 text-[12px]">Name</th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Month
                    </th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Amount
                    </th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Dues
                    </th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Status{" "}
                    </th>
                  </tr>
                </thead>

                {modalData.regularFees.length > 0 && (
                  <tbody>
                    {modalData.regularFees.map((addFee) => (
                      <tr>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          MONTHLY FEE{" "}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.month}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.paidAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.dueAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
                {modalData.additionalFees.length > 0 && (
                  <tbody>
                    {modalData.additionalFees.map((addFee) => (
                      <tr>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.name}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.month}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.paidAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.dueAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            ) : (
              <h1 className="text-center">No Fee</h1>
            )}

            <div class="mt-1">
              <table class="w-full border border-gray-500 text-[12px]">
                <tbody>
                <tr>
                    <td class="border border-gray-500 pl-2">Total Fee Amount.</td>
                    <td class="border border-gray-500 pl-2"> ₹ {modalData.totalFeeAmount}</td>
                  </tr>
                  {/* <tr>
                    <td class="border border-gray-500 pl-2">
                      Paid Previous Dues
                      Late Fine
                      </td>
                    <td class="border border-gray-500 pl-2">
                    ₹ {modalData.previousDues}
                    </td>
                  </tr> */}
                 
                  <tr>
                    <td class="border border-gray-500 pl-2">Concession Amount </td>
                    <td class="border border-gray-500 pl-2"> ₹ {modalData.concessionFee}</td>
                  </tr>
                  {/* <tr>
                    <td class="border border-gray-500 pl-2">Total fee after Concession.</td>
                    <td class="border border-gray-500 pl-2">₹  {modalData.paidAfterConcession}</td>
                  </tr> */}
                  {/* <tr>
                    <td class="border border-gray-500 pl-2">Total Fee Amount.</td>
                    <td class="border border-gray-500 pl-2">{modalData.totalFeeAmount}</td>
                  </tr> */}
                  
                  <tr>
                    <td class="border border-gray-500 pl-2">Paid Amount</td>
                    <td class="border border-gray-500 pl-2">
                    {/* ₹  {modalData.totalAmountPaid} */}
                    ₹  {modalData.newPaidAmount}
                    </td>
                  </tr>
                  <tr>
                    <td class="border border-gray-500 pl-2">Total Dues</td>
                    <td class="border border-gray-500 pl-2 text-red-600">
                    {/* ₹  {modalData.totalAmountPaid} */}
                    ₹  {modalData.totalDues}
                    </td>
                  </tr>
                  {/* <tr>
                    <td class="border border-gray-500 pl-2">Paid Amount</td>
                    <td class="border border-gray-500 pl-2">
                      {modalData.totalAmountPaid}
                    </td>
                  </tr> */}
                </tbody>
              </table>
            </div>

            <p class="mt-2 text-[12px]">{toWords(Repees()).toUpperCase()} ONLY</p>
            <p className="text-[9px]">
              {" "}
              Remarks:{" "}
              <strong className="">{modalData.remark}</strong>
            </p>
            <div class="flex justify-between text-[9px]">
              <div>Fee Collected: ................</div>
              <div>Authorised sign</div>
            </div>

            <div class=" text-[9px]">
              <p>Note:</p>
              <ol class="list-decimal ml-5">
                <li>
                  Cheque is subject to the realization. Rs.500/- Extra will be
                  charged in case of cheque dishonour.
                </li>
                <li>
                  Fee receipt and Fee card both should be kept in safe place for
                  future.
                </li>
                <li>
                  Please check the entry made by fee clerk in fee Card and fee
                  Receipt
                </li>
              </ol>
            </div>
          </div>
          <div className="w-[400px] ps-[15px] rounded-sm dark:text-white">
            <div className="flex justify-between ">
              <div className=" h-auto w-[150px]  dark:text-white  ">
                <img
                  className="h-12 w-12 rounded-full "
                  src={SchoolImage}
                  alt="logo"
                />
              </div>
              <div className="text-end  dark:text-white">
                <h1 className="font-semibold whitespace-nowrap">{SchoolDetails?.fullName}</h1>
                <p className="text-sm">Address: {SchoolDetails?.address} </p>
                <p className="text-sm">Contact: {SchoolDetails?.contact}</p>
              </div>
            </div>
            <div className="bg-gray-300 text-center  border-b-2 border-red-500 ">
              <h3 class="font-bold text-[9px] scale-125">Fee receipt :</h3>
            </div>
            <div className="flex justify-between text-[12px] dark:text-white">
              <div>
                <div className="text-[12px]">
                  Rec.No.: <strong>{modalData.feeReceiptNumber}</strong>
                </div>
                <div className="text-[12px]">
                  Name: <strong>{modalData.studentName}</strong>
                </div>
                <div className="text-[12px]">
                  Class: <strong> {modalData.studentClass}</strong>
                </div>
                <div className="text-[12px]">
                  S/D. of: <strong>......</strong>
                </div>
                {
                modalData.transactionId.length>4 &&  <div className="text-[12px]">
                checkBook/transactionId: <strong>{modalData.transactionId}</strong>
               </div>
                }
               
              </div>
              <div>
                <div className="text-[12px]">
                  Date: <strong>{date()}</strong>
                </div>
                <div className="text-[12px]">
                  Adm No: <strong>{modalData.admissionNumber}</strong>
                </div>
                <div className="text-[12px]">
                  Mode: <strong>{modalData.paymentMode}</strong>
                </div>
               
              </div>
            </div>
            {(modalData.regularFees.length > 0  || modalData.additionalFees.length > 0) ? (
              <table class="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th class="border border-gray-500 pl-2 text-[12px]">Name</th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Month
                    </th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Amount
                    </th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Dues
                    </th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Status{" "}
                    </th>
                  </tr>
                </thead>

                {modalData.regularFees.length > 0 && (
                  <tbody>
                    {modalData.regularFees.map((addFee) => (
                      <tr>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          MONTHLY FEE{" "}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.month}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.paidAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.dueAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
                {modalData.additionalFees.length > 0 && (
                  <tbody>
                    {modalData.additionalFees.map((addFee) => (
                      <tr>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.name}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.month}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.paidAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.dueAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            ) : (
              <h1 className="text-center">No Fee</h1>
            )}

            <div class="mt-1">
              <table class="w-full border border-gray-500 text-[12px]">
                <tbody>
                <tr>
                    <td class="border border-gray-500 pl-2">Total Fee Amount.</td>
                    <td class="border border-gray-500 pl-2"> ₹ {modalData.totalFeeAmount}</td>
                  </tr>
                  {/* <tr>
                    <td class="border border-gray-500 pl-2">
                     
                      Late Fine
                      </td>
                    <td class="border border-gray-500 pl-2">
                    ₹ {modalData.previousDues}
                    </td>
                  </tr> */}
                 
                  <tr>
                    <td class="border border-gray-500 pl-2">Concession Amount </td>
                    <td class="border border-gray-500 pl-2"> ₹ {modalData.concessionFee}</td>
                  </tr>
                  {/* <tr>
                    <td class="border border-gray-500 pl-2">Total fee after Concession.</td>
                    <td class="border border-gray-500 pl-2">₹  {modalData.paidAfterConcession}</td>
                  </tr> */}
                  {/* <tr>
                    <td class="border border-gray-500 pl-2">Total Fee Amount.</td>
                    <td class="border border-gray-500 pl-2">{modalData.totalFeeAmount}</td>
                  </tr> */}
                  
                  <tr>
                    <td class="border border-gray-500 pl-2">Paid Amount</td>
                    <td class="border border-gray-500 pl-2">
                    {/* ₹  {modalData.totalAmountPaid} */}
                    ₹  {modalData.newPaidAmount}
                    </td>
                  </tr>
                  <tr>
                    <td class="border border-gray-500 pl-2">Total Dues</td>
                    <td class="border border-gray-500 pl-2 text-red-600">
                    {/* ₹  {modalData.totalAmountPaid} */}
                    ₹  {modalData.totalDues}
                    </td>
                  </tr>
                  {/* <tr>
                    <td class="border border-gray-500 pl-2">Paid Amount</td>
                    <td class="border border-gray-500 pl-2">
                      {modalData.totalAmountPaid}
                    </td>
                  </tr> */}
                </tbody>
              </table>
            </div>

            <p class="mt-2 text-[12px]">{toWords(Repees()).toUpperCase()} ONLY</p>
            <p className="text-[9px]">
              {" "}
              Remarks:{" "}
              <strong className="">{modalData.remark}</strong>
            </p>
            <div class="flex justify-between text-[9px]">
              <div>Fee Collected: ................</div>
              <div>Authorised sign</div>
            </div>

            <div class=" text-[9px]">
              <p>Note:</p>
              <ol class="list-decimal ml-5">
                <li>
                  Cheque is subject to the realization. Rs.500/- Extra will be
                  charged in case of cheque dishonour.
                </li>
                <li>
                  Fee receipt and Fee card both should be kept in safe place for
                  future.
                </li>
                <li>
                  Please check the entry made by fee clerk in fee Card and fee
                  Receipt
                </li>
              </ol>
            </div>
          </div>
        </div>
     
    </div>
  );
};

export default FeeRecipt;



// import React, { useRef } from "react";
// import { useReactToPrint } from "react-to-print";
// import { format, parseISO } from "date-fns";
// import { MdFileDownload } from "react-icons/md";
// import DownloadIcon from "@mui/icons-material/Download";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// import { toWords } from "number-to-words";
// import { Button } from "@mui/material"
// import "./Print.css"
// const FeeRecipt = ({ modalData, handleCloseModal }) => {
//   const { currentColor } = useStateContext();
//   const schoolName = sessionStorage.getItem("schoolName");
//   const schoolContact = sessionStorage.getItem("schoolContact");
//   const schoolAddress = sessionStorage.getItem("schooladdress");
//   const SchoolImage = sessionStorage.getItem("image");
//   const componentPDF = useRef();

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     onBeforeGetContent: () => {
//       document.title = `${modalData.studentName}'s FeeReceipt`;
//     },
//     onAfterPrint: () => {
//       alert("modalData saved in PDF");
//       handleCloseModal();
//       setTimeout(() => {
//         document.title = "OriginalTitle";
//       }, 100);
//     },
//   });
//   const Repees = () => {
//     return modalData.totalAmountPaid;
//   };
//   const date = () => {
//     let newDate = parseISO(modalData.date);
//     return format(newDate, "dd/MM/yyyy");
//   };

//   return (
//     <div>
//       <a
//         // variant="contained"
//         onClick={generatePDF}
//         // startIcon={<DownloadIcon />}
//         className="text-black absolute right-16 top-16 cursor-pointer"
//         // style={{ backgroundColor: currentColor,  }}
//       >
//       <DownloadIcon />
//       </a>

//       {/* <div className=" w-full  " ref={componentPDF}> */}
//         <div className="grid  grid-cols-1 md:grid-cols-2 mx-auto justify-around  gap-3" ref={componentPDF}>
//           <div className=" pe-5  border-r border-gray-800   rounded-sm p-2 dark:text-white">
//             <div className="flex justify-between ">
//               <div className=" h-auto w-[150px]  dark:text-white  ">
//                 <img
//                   className="h-12 w-12 rounded-full "
//                   src={SchoolImage}
//                   alt="logo"
//                 />
//               </div>
//               <div className="text-end  dark:text-white">
//                 <h1 className="font-semibold">{schoolName}</h1>
//                 <p className="text-sm">Address: {schoolAddress} </p>
//                 <p className="text-sm">Contact: {schoolContact}</p>
//               </div>
//             </div>
//             <div className="bg-gray-300 text-center  border-b-2 border-red-500 ">
//               <h3 class="font-bold ">Fee receipt :</h3>
//             </div>
//             <div className="flex justify-between text-[12px] gap-5 dark:text-white mt-1">
//               <div>
//                 <div className="text-sm">
//                   Rec.No.: <strong>{modalData.feeReceiptNumber}</strong>
//                 </div>
//                 <div className="text-sm">
//                   Name: <strong>{modalData.studentName}</strong>
//                 </div>
//                 <div className="text-sm">
//                   Class: <strong> {modalData.studentClass}</strong>
//                 </div>
//                 <div className="text-sm">
//                   S/D. of: <strong>......</strong>
//                 </div>
//               </div>
//               <div>
//                 <div className="text-sm">
//                   Date: <strong>{date()}</strong>
//                 </div>
//                 <div className="text-sm">
//                   Adm No: <strong>{modalData.admissionNumber}</strong>
//                 </div>
//                 <div className="text-sm">
//                   Mode: <strong>{modalData.paymentMode}</strong>
//                 </div>
//               </div>
//             </div>
//             {modalData.regularFees.length > 0 ? (
//               <table class="min-w-full leading-normal mt-1">
//                 <thead>
//                   <tr>
//                     <th class="border border-gray-500 p-1 text-[12px]">Name</th>
//                     <th class="border border-gray-500 p-1 text-[12px]">
//                       {" "}
//                       Month
//                     </th>
//                     <th class="border border-gray-500 p-1 text-[12px]">
//                       {" "}
//                       Amount (Rs)
//                     </th>
//                     <th class="border border-gray-500 p-1 text-[12px]">
//                       {" "}
//                       Dues
//                     </th>
//                     <th class="border border-gray-500 p-1 text-[12px]">
//                       {" "}
//                       Status{" "}
//                     </th>
//                   </tr>
//                 </thead>

//                 {modalData.regularFees.length > 0 && (
//                   <tbody>
//                     {modalData.regularFees.map((addFee) => (
//                       <tr>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           MONTHLY FEE{" "}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {" "}
//                           {addFee.month}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {" "}
//                           {addFee.paidAmount}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {" "}
//                           {addFee.dueAmount}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {addFee.status}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 )}
//                 {modalData.additionalFees.length > 0 && (
//                   <tbody>
//                     {modalData.additionalFees.map((addFee) => (
//                       <tr>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {addFee.name}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {addFee.month}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {" "}
//                           {addFee.paidAmount}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {addFee.dueAmount}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {addFee.status}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 )}
//               </table>
//             ) : (
//               <h1 className="text-center">No Fee</h1>
//             )}

//             <div class="mt-1">
//               <table class="w-full border border-gray-500 text-sm">
//                 <tbody>
//                   <tr>
//                     <td class="border border-gray-500 p-1">Total Fee</td>
//                     <td class="border border-gray-500 p-1">.....</td>
//                   </tr>

//                   <tr>
//                     <td class="border border-gray-500 p-1">Previous Dues</td>
//                     <td class="border border-gray-500 p-1">
//                       {modalData.previousDues}
//                     </td>
//                   </tr>
//                   <tr>
//                     <td class="border border-gray-500 p-1">Concession</td>
//                     <td class="border border-gray-500 p-1">....</td>
//                   </tr>
//                   <tr>
//                     <td class="border border-gray-500 p-1">Total Amount.</td>
//                     <td class="border border-gray-500 p-1">....</td>
//                   </tr>
//                   <tr>
//                     <td class="border border-gray-500 p-1">Paid Amount</td>
//                     <td class="border border-gray-500 p-1">
//                       {modalData.totalAmountPaid}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>

//             <p class="mt-2 text-sm">{toWords(Repees()).toUpperCase()} ONLY</p>
//             <p>
//               {" "}
//               Remarks:{" "}
//               <strong className="text-[13px]">{modalData.remark}</strong>
//             </p>
//             <div class="flex justify-between text-sm">
//               <div>Fee Collected: ................</div>
//               <div>Authorised sign</div>
//             </div>

//             <div class="mt-4 text-xs">
//               <p>Note:</p>
//               <ol class="list-decimal ml-5">
//                 <li>
//                   Cheque is subject to the realization. Rs.500/- Extra will be
//                   charged in case of cheque dishonour.
//                 </li>
//                 <li>
//                   Fee receipt and Fee card both should be kept in safe place for
//                   future.
//                 </li>
//                 <li>
//                   Please check the entry made by fee clerk in fee Card and fee
//                   Receipt
//                 </li>
//               </ol>
//             </div>
//           </div>
//           <div className=" pe-5  border-r border-gray-800   rounded-sm p-2 dark:text-white">
//             <div className="flex justify-between mb-1 ">
//               <div className=" h-auto w-[150px]  dark:text-white  ">
//                 <img
//                   className="h-12 w-12 rounded-full "
//                   src={SchoolImage}
//                   alt="logo"
//                 />
//               </div>
//               <div className="text-end  dark:text-white">
//                 <h1 className="font-semibold">{schoolName}</h1>
//                 <p className="text-sm">Address: {schoolAddress} </p>
//                 <p className="text-sm">Contact: {schoolContact}</p>
//               </div>
//             </div>
//             <div className="bg-gray-300 text-center  border-b-2 border-red-500 ">
//               <h3 class="font-bold mt-2">Fee receipt :</h3>
//             </div>
//             <div className="flex justify-between text-[12px] gap-5 dark:text-white mt-4">
//               <div>
//                 <div className="text-sm">
//                   Rec.No.: <strong>{modalData.feeReceiptNumber}</strong>
//                 </div>
//                 <div className="text-sm">
//                   Name: <strong>{modalData.studentName}</strong>
//                 </div>
//                 <div className="text-sm">
//                   Class: <strong> {modalData.studentClass}</strong>
//                 </div>
//                 <div className="text-sm">
//                   S/D. of: <strong>......</strong>
//                 </div>
//               </div>
//               <div>
//                 <div className="text-sm">
//                   Date: <strong>{date()}</strong>
//                 </div>
//                 <div className="text-sm">
//                   Adm No: <strong>{modalData.admissionNumber}</strong>
//                 </div>
//                 <div className="text-sm">
//                   Mode: <strong>{modalData.paymentMode}</strong>
//                 </div>
//               </div>
//             </div>
//             {modalData.regularFees.length > 0 ? (
//               <table class="min-w-full leading-normal mt-1">
//                 <thead>
//                   <tr>
//                     <th class="border border-gray-500 p-1 text-[12px]">Name</th>
//                     <th class="border border-gray-500 p-1 text-[12px]">
//                       {" "}
//                       Month
//                     </th>
//                     <th class="border border-gray-500 p-1 text-[12px]">
//                       {" "}
//                       Amount (Rs)
//                     </th>
//                     <th class="border border-gray-500 p-1 text-[12px]">
//                       {" "}
//                       Dues
//                     </th>
//                     <th class="border border-gray-500 p-1 text-[12px]">
//                       {" "}
//                       Status{" "}
//                     </th>
//                   </tr>
//                 </thead>

//                 {modalData.regularFees.length > 0 && (
//                   <tbody>
//                     {modalData.regularFees.map((addFee) => (
//                       <tr>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           MONTHLY FEE{" "}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {" "}
//                           {addFee.month}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {" "}
//                           {addFee.paidAmount}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {" "}
//                           {addFee.dueAmount}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {addFee.status}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 )}
//                 {modalData.additionalFees.length > 0 && (
//                   <tbody>
//                     {modalData.additionalFees.map((addFee) => (
//                       <tr>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {addFee.name}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {addFee.month}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {" "}
//                           {addFee.paidAmount}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {addFee.dueAmount}
//                         </td>
//                         <td class="border border-gray-500 p-1 text-[12px]">
//                           {addFee.status}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 )}
//               </table>
//             ) : (
//               <h1 className="text-center">No Fee</h1>
//             )}

//             <div class="mt-1">
//               <table class="w-full border border-gray-500 text-sm">
//                 <tbody>
//                   <tr>
//                     <td class="border border-gray-500 p-1">Total Fee</td>
//                     <td class="border border-gray-500 p-1">.....</td>
//                   </tr>

//                   <tr>
//                     <td class="border border-gray-500 p-1">Previous Dues</td>
//                     <td class="border border-gray-500 p-1">
//                       {modalData.previousDues}
//                     </td>
//                   </tr>
//                   <tr>
//                     <td class="border border-gray-500 p-1">Concession</td>
//                     <td class="border border-gray-500 p-1">....</td>
//                   </tr>
//                   <tr>
//                     <td class="border border-gray-500 p-1">Total Amount.</td>
//                     <td class="border border-gray-500 p-1">....</td>
//                   </tr>
//                   <tr>
//                     <td class="border border-gray-500 p-1">Paid Amount</td>
//                     <td class="border border-gray-500 p-1">
//                       {modalData.totalAmountPaid}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>

//             <p class="mt-2 text-sm">{toWords(Repees()).toUpperCase()} ONLY</p>
//             <p>
//               {" "}
//               Remarks:{" "}
//               <strong className="text-[13px]">{modalData.remark}</strong>
//             </p>
//             <div class="flex justify-between text-sm">
//               <div>Fee Collected: ................</div>
//               <div>Authorised sign</div>
//             </div>

//             <div class="mt-4 text-xs">
//               <p>Note:</p>
//               <ol class="list-decimal ml-5">
//                 <li>
//                   Cheque is subject to the realization. Rs.500/- Extra will be
//                   charged in case of cheque dishonour.
//                 </li>
//                 <li>
//                   Fee receipt and Fee card both should be kept in safe place for
//                   future.
//                 </li>
//                 <li>
//                   Please check the entry made by fee clerk in fee Card and fee
//                   Receipt
//                 </li>
//               </ol>
//             </div>
//           </div>
//           {/* <div className=" pe-5 border-gray-800   rounded-sm p-2 dark:text-white">
//             <div className="flex justify-between border-b-2 border-red-600 mb-1 ">
//               <div className=" h-auto w-[150px]  dark:text-white  ">
//                 <img
//                   className="h-24 w-24 rounded-full "
//                   src={SchoolImage}
//                   alt="logo"
//                 />
//               </div>
//               <div className="text-end  dark:text-white">
//                 <h1 className="font-semibold">{schoolName}</h1>
//                 <p className="text-sm">Address: {schoolAddress} </p>
//                 <p className="text-sm">Contact: {schoolContact}</p>
//               </div>
//             </div>
//             <div className="bg-black text-white text-center">
//               <h3 class="font-bold mt-2">Fee receipt :</h3>
//             </div>
//             <h1 className="text-center text-lg ">Parent Copy</h1>
//             <div className="flex justify-between text-[12px] gap-5 dark:text-white">
//               <div>
//                 <div className="text-sm">
//                   Rec.No.: <strong>{modalData.feeReceiptNumber}</strong>
//                 </div>
//                 <div className="text-sm">
//                   Name: <strong>{modalData.studentName}</strong>
//                 </div>
//                 <div className="text-sm">
//                   Class: <strong> {modalData.studentClass}</strong>
//                 </div>
//                 <div className="text-sm">
//                   S/D. of: <strong>......</strong>
//                 </div>
//               </div>
//               <div>
//                 <div className="text-sm">
//                   Date: <strong>{date()}</strong>
//                 </div>
//                 <div className="text-sm">
//                   Adm No: <strong>{modalData.admissionNumber}</strong>
//                 </div>
//                 <div className="text-sm">
//                   Mode: <strong>{modalData.paymentMode}</strong>
//                 </div>
//               </div>
//             </div>
//             {modalData.regularFees.length > 0 ? (
//               <table class="min-w-full leading-normal">
//                 <thead>
//                   <tr>
//                     <th class="p-1 py-1 border-b-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700 uppercase text-left tracking-wider">
//                       Name
//                     </th>
//                     <th class="p-1 py-1 border-b-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700 uppercase  text-left tracking-wider">
//                       Month
//                     </th>
//                     <th class="p-1 py-1 border-b-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700 uppercase text-left tracking-wider">
//                       Amount
//                     </th>
//                     <th class="p-1 py-1 border-b-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700 uppercase text-left tracking-wider">
//                       Dues
//                     </th>
//                     <th class="p-1 py-1 border-b-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700 uppercase text-left tracking-wider">
//                       Status
//                     </th>
//                     <th class="p-1 py-1 border-b-2 border-gray-200 bg-gray-100"></th>
//                   </tr>
//                 </thead>
//                 {modalData.regularFees.length > 0 && (
//                   <tbody>
//                     {modalData.regularFees.map((addFee) => (
//                       <tr>
//                         <td class="p-1  border-b border-gray-200 bg-white text-sm">
//                           <p class="text-gray-900 whitespace-no-wrap uppercase text-[12px]">
//                             Class Fee
//                           </p>
//                         </td>
//                         <td class="p-1 border-b border-gray-200 bg-white text-sm">
//                           <p class="text-gray-900 whitespace-no-wrap">
//                             {addFee.month}
//                           </p>
//                         </td>
//                         <td class="p-1 border-b border-gray-200 bg-white text-sm">
//                           <p class="text-gray-900 whitespace-no-wrap">
//                             {addFee.paidAmount}
//                           </p>
//                         </td>
//                         <td class="p-1 border-b border-gray-200 bg-white text-[12px]">
//                           <p class="text-gray-900 whitespace-no-wrap">
//                             {addFee.dueAmount}
//                           </p>
//                         </td>
//                         <td class="p-1 border-b border-gray-200 bg-white text-sm">
//                           <span class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
//                             <span
//                               aria-hidden
//                               class="absolute inset-0 bg-green-200 opacity-50 rounded-full"
//                             ></span>
//                             <span class="relative">{addFee.status}</span>
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 )}
//                 {modalData.additionalFees.length > 0 && (
//                   <tbody>
//                     {modalData.additionalFees.map((addFee) => (
//                       <tr>
//                         <td class="p-1  border-b border-gray-200 bg-white text-sm">
//                           <p class="text-gray-900 whitespace-no-wrap uppercase text-[12px]">
//                             {addFee.name}
//                           </p>
//                         </td>
//                         <td class="p-1 border-b border-gray-200 bg-white text-sm">
//                           <p class="text-gray-900 whitespace-no-wrap">
//                             {addFee.month}
//                           </p>
//                         </td>
//                         <td class="p-1 border-b border-gray-200 bg-white text-sm">
//                           <p class="text-gray-900 whitespace-no-wrap">
//                             {addFee.paidAmount}
//                           </p>
//                         </td>
//                         <td class="p-1 border-b border-gray-200 bg-white text-sm">
//                           <p class="text-gray-900 whitespace-no-wrap">
//                             {addFee.dueAmount}
//                           </p>
//                         </td>
//                         <td class="p-1 border-b border-gray-200 bg-white text-[12px]">
//                           <span class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
//                             <span
//                               aria-hidden
//                               class="absolute inset-0 bg-green-200 opacity-50 rounded-full text-[10px]"
//                             ></span>
//                             <span class="relative">{addFee.status}</span>
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 )}
//               </table>
//             ) : (
//               <h1 className="text-center">No Fee</h1>
//             )}

//             <div className="">
             
//               <div className="text-sm">
//                 Previous Dues: <strong>{modalData.previousDues}</strong>
//               </div>
//               <div className="text-sm">
//                 Total Paid Amount: <strong>{modalData.totalAmountPaid}</strong>
//               </div>
//             </div>
//             <div className="text-sm mb-1">
//               Rupees: <strong>{toWords(Repees())} only</strong>
//             </div>
//             <div className="text-sm">
//               Remarks: <strong>{modalData.remark}</strong>
//             </div>

//             <div className="flex justify-between">
//               <div className="text-sm">
//                 Fee Collected By: <strong>.....</strong>
//               </div>
//             </div>
//             <div className="text-xs mt-2">
//               <p>Note:</p>
//               <p>
//                 1. Cheque is subject to the realization.Rs.500/- Extra will be
//                 charged in case of cheque dishonour.
//               </p>
//               <p>
//                 2. Fee receipt and Fee card both should be kept in safe place
//                 for future.
//               </p>
//               <p>
//                 3. Please check the entry made by fee clerk in fee Card and fee
//                 Receipt
//               </p>
//             </div>
//             <div className="flex justify-end dark:text-white mt-4">
//               <div>Authorised Sign</div>
//             </div>
//           </div> */}
//         </div>
//       {/* </div> */}
//     </div>
//   );
// };

// export default FeeRecipt;
