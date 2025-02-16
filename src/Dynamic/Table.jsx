import React from 'react';
import { useStateContext } from '../contexts/ContextProvider';

const bgGreenClass = "bg-green-600"; // Light green
const bgRedClass = "bg-red-200";   // Light red
const bgYellowClass = "bg-yellow-200"; // Light yellow

const Table = ({ tHead, tBody }) => {
   const { currentColor } = useStateContext();
  const getStatusColorClass = (feeStatus) => {
    switch (feeStatus) {
      case "Paid":
        return bgGreenClass;
      case "Unpaid":
        return bgRedClass;
      case "Partial":
        return bgYellowClass;
      default:
        return "";
    }
  };

  return (
    <section className="py-1 bg-blueGray-50">
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded ">
      {/* <div class="rounded-t mb-0 px-4 py-3 border-0">
      <div class="flex flex-wrap items-center">
        <div class="relative w-full px-4 max-w-full flex-grow flex-1">
          <h3 class="font-semibold text-base text-blueGray-700">Page Visits</h3>
        </div>
        <div class="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
          <button class="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button">See all</button>
        </div>
      </div>
    </div> */}
        <div className="block w-full overflow-x-auto">
          <table className="items-center bg-transparent w-full border-collapse ">
            <thead>
              <tr>
                {tHead.map((header) => (
                  <th
                  style={{background:currentColor,color:"white"}}
                    key={header.id}
                    className="px-6 py-2 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100  text-xs uppercase  whitespace-nowrap font-semibold text-left"
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {tBody.map((row, index) => {
                const rowClassName = getStatusColorClass(row.feeStatus); // Get class for the row

                return (
                  <tr key={index} className={rowClassName}>
                    {tHead.map((header) => (
                      <td
                        key={`${index}-${header.id}`}
                        className="border px-6 align-middle text-xs whitespace-nowrap text-left text-blueGray-700"
                      >
                        {row[header.id]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Table;


// import React from 'react';

// const bgGreenClass = "bg-green-200"; // Light green
// const bgRedClass = "bg-red-200";   // Light red
// const bgYellowClass = "bg-yellow-200"; // Light yellow

// const Table = ({ tHead, tBody }) => {
//   console.log("tBody",tBody)
//   const getStatusColorClass = (feeStatus) => {
//     switch (feeStatus) {
//       case "Paid":
//         return bgGreenClass;
//       case "Unpaid":
//         return bgRedClass;
//       case "Partial":
//         return bgYellowClass;
//       default:
//         return "";
//     }
//   };

//   return (
//     <section className="py-1 bg-blueGray-50">
//       <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded ">
//         <div className="block w-full overflow-x-auto">
//           <table className="items-center bg-transparent w-full border-collapse ">
//             <thead>
//               <tr>
//                 {tHead.map((header) => (
//                   <th
//                     key={header.id}
//                     className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100  text-xs uppercase  whitespace-nowrap font-semibold text-left"
//                   >
//                     {header.label}
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody>
//               {tBody.map((row, index) => (
//                 <tr key={index}>
//                   {tHead.map((header) => {
//                     let cellClassName = "border px-6 align-middle text-xs whitespace-nowrap text-left text-blueGray-700";
//                     if (header.id === "feeStatus") {
//                       cellClassName += ` ${getStatusColorClass(row.feeStatus)}`;
//                     }

//                     return (
//                       <td
//                         key={`${index}-${header.id}`}
//                         className={cellClassName}
//                       >
//                         {row[header.id]}
//                       </td>
//                     );
//                   })}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Table;


// import React from 'react';

// const Table = ({ tHead, tBody }) => {
//   const getStatusColorClass = (feeStatus) => {
//     switch (feeStatus) {
//       case "Paid":
//         return "bg-green-200"; // Light green
//       case "Unpaid":
//         return "bg-red-200";   // Light red
//       case "Partial":
//         return "bg-yellow-200"; // Light yellow
//       default:
//         return ""; // No background color
//     }
//   };

//   return (
//     <section className="py-1 bg-blueGray-50">
//       {/* ... (rest of your Table component code) ... */}
//       <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded ">
//         <div className="block w-full overflow-x-auto">
//           <table className="items-center bg-transparent w-full border-collapse ">
//             <thead>
//               <tr>
//                 {tHead.map((header) => (
//                   <th
//                     key={header.id}
//                     className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100  text-xs uppercase  whitespace-nowrap font-semibold text-left"
//                   >
//                     {header.label}
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody>
//               {tBody.map((row, index) => (
//                 <tr key={index}>
//                   {tHead.map((header) => {
//                     let cellClassName = "border px-6 align-middle   text-xs whitespace-nowrap  text-left text-blueGray-700";
//                     if (header.id === "feeStatus") {
//                       cellClassName += ` ${getStatusColorClass(row.feeStatus)}`;
//                     }

//                     return (
//                       <td
//                         key={`${index}-${header.id}`}
//                         className={cellClassName}
//                       >
//                         {row[header.id]}
//                       </td>
//                     );
//                   })}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Table;


// import React from 'react';

// const Table = ({ tHead, tBody }) => {
//   return (
//     <section className="py-1 bg-blueGray-50">
//       <div className="rounded-t mb-0 px-4 py-3 border-0">
//         <div className="flex flex-wrap items-center">
//           <div className="relative w-full px-4 max-w-full flex-grow flex-1">
//             <h3 className="font-semibold text-base text-blueGray-700">Dynamic Table</h3>
//           </div>
//           <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
//             {/* You can remove this button if you don't need it */}
//             <button
//               className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
//               type="button"
//             >
//               See all
//             </button>
//           </div>
//         </div>
//       </div>
//       <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded ">
//         <div className="block w-full overflow-x-auto">
//           <table className="items-center bg-transparent w-full border-collapse ">
//             <thead>
//               <tr>
//                 {tHead.map((header) => (
//                   <th
//                     key={header.id}
//                     className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100  text-xs uppercase  whitespace-nowrap font-semibold text-left"
//                   >
//                     {header.label}
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody>
//               {tBody.map((row, index) => (
//                 <tr key={index}>
//                   {tHead.map((header) => (
//                     <td
//                       key={`${index}-${header.id}`}  // Unique key for each cell
//                       className="border px-6 align-middle  text-xs whitespace-nowrap  text-left text-blueGray-700"
//                     >
//                       {row[header.id]}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Table;



// import React from 'react'

// const Table = ({tHead,tBody}) => {


//   return (
//     <section class="py-1 bg-blueGray-50">
//       <div class="rounded-t mb-0 px-4 py-3 border-0">
//       <div class="flex flex-wrap items-center">
//         <div class="relative w-full px-4 max-w-full flex-grow flex-1">
//           <h3 class="font-semibold text-base text-blueGray-700">Page Visits</h3>
//         </div>
//         <div class="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
//           <button class="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button">See all</button>
//         </div>
//       </div>
//     </div>
//     <div class="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded ">
//       <div class="block w-full overflow-x-auto">
//         <table class="items-center bg-transparent w-full border-collapse ">
//           <thead>
//           <tr >
//             {
//                 tHead.map((val,ind)=>(
//                 <th key={val?.id} class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100  text-xs uppercase  whitespace-nowrap font-semibold text-left">
//                   {val?.label}
//                   </th>
//                 ))
//             }
//            </tr >
             
//           </thead>
  
//           <tbody>
//             <tr>
//                 {
//                     tBody.map((val,ind)=>(
//                         <th class="border px-6 align-middle  text-xs whitespace-nowrap  text-left text-blueGray-700 ">
//                         {val}
//                       </th>
//                     ))
//                 }
             
//             </tr>
           
//           </tbody>
  
//         </table>
//       </div>
//     </div>
 
//   </section>
//   )
// }

// export default Table