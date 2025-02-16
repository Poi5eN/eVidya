
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Loading from "../../../Loading";
import useCustomQuery from "../../../useCustomQuery";
import axios from "axios";
import { useStateContext } from "../../../contexts/ContextProvider";
import DynamicDataTable from "./DataTable";
import Cookies from "js-cookie";
import NoDataFound from "../../../NoDataFound";
import Heading from "../../../Dynamic/Heading";
import { getParentColumns } from "../../../Dynamic/utils/TableUtils";

const authToken = Cookies.get("token");

function CreateParents() {
  const { currentColor } = useStateContext();
  const [submittedData, setSubmittedData] = useState([]);
  const { queryData: allParent, loading: parentLoading, error: parentError } =
    useCustomQuery(
      "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllParentsWithChildren"
    );

  useEffect(() => {
    if (allParent) {
      setSubmittedData(allParent.data.map((p) => p.parent));
    }
  }, [allParent]);

  const handleDelete = (email) => {
    axios
      .put(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deactivateParent`,
        { email },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const updatedData = submittedData.filter((item) => item.email !== email);
        setSubmittedData(updatedData);
        toast.success("Parent data deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting Parent data:", error);
        toast.error("An error occurred while deleting the Parent data.");
      });
  };

  if (parentLoading) {
    return <Loading />;
  }

  const modifiedData = submittedData.map((item) => ({
    ...item,
    childName: item.children.map((child) => child.fullName).join("\n"),
    childAdmissionNo: item.children
      .map((child) => child.admissionNumber)
      .join("\n"),
  }));

  return (
    <div className=" mt-12  mx-auto p-3">
    {/* <div className="md:h-screen mt-12 md:mt-1 mx-auto p-3"> */}
      <Heading Name="Parent Details" />
      {modifiedData.length > 0 ? (
        <DynamicDataTable
          data={modifiedData}
          columns={getParentColumns()}
          handleDelete={handleDelete}
          // tableHeight="40vh"
          className="w-full overflow-auto"
          itemsPerPage={15}
        />
      ) : (
        <NoDataFound />
      )}
    </div>
  );
}

export default CreateParents;

// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import Loading from "../../../Loading";
// import useCustomQuery from "../../../useCustomQuery";
// import axios from "axios";
// import { useStateContext } from "../../../contexts/ContextProvider";
// import DynamicDataTable from "./DataTable";
// import Cookies from "js-cookie";
// import NoDataFound from "../../../NoDataFound";
// import Heading from "../../../Dynamic/Heading";

// const authToken = Cookies.get("token");
// function CreateParents() {
//   const { currentColor } = useStateContext();
//   const [submittedData, setSubmittedData] = useState([]);
//   const { queryData: allParent, loading: parentLoading, error: parentError } =
//     useCustomQuery(
//       "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllParentsWithChildren"
//     );
//   useEffect(() => {
//     if (allParent) {
//       setSubmittedData(allParent.data.map((p) => p.parent));
//     }
//   }, [allParent]);

//   const handleDelete = (email) => {
//     axios
//       .put(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deactivateParent`,
//         { email },
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const updatedData = submittedData.filter((item) => item.email !== email);
//         setSubmittedData(updatedData);
//         toast.success("Parent data deleted successfully");
//       })
//       .catch((error) => {
//         console.error("Error deleting Parent data:", error);
//         toast.error("An error occurred while deleting the Parent data.");
//       });
//   };

//   const parentColumns = [
//     { field: "id", headerName: "S. No.", width: 50 },
//     {
//       field: "admissionNumber",
//       headerName: "Admission No.",
//       minWidth: 80,
//       renderCell: (params) => (
//         <span style={{ fontSize: "14px", color: "#ff6d00" }}>
//           {params.value}
//         </span>
//       ),
//     },
//     {
//       field: "fullName",
//       headerName: "Father Name",
//       flex: 1,
//       minWidth: 80,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "nowrap", color: "#01579b" }}>
//           {params.value}
//         </div>
//       ),
//     },
//     {
//       field: "motherName",
//       headerName: "Mother Name",
//       flex: 1,
//       minWidth: 80,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "nowrap", color: "#01579b" }}>
//           {params.value}
//         </div>
//       ),
//     },
//     {
//       field: "email",
//       headerName: "Email",
//       flex: 1,
//       minWidth: 200,
//       renderCell: (params) => (
//         <span style={{ fontSize: "14px", color: "#1a237e" }}>
//           {params.value}
//         </span>
//       ),
//     },
//     { field: "contact", headerName: "Contact", flex: 1, minWidth: 80 },
//     {
//       field: "childName",
//       headerName: "Children",
//       flex: 1,
//       minWidth: 100,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "nowrap", color: "#01579b" }}>
//           {params.value}
//         </div>
//       ),
//     },
//     {
//       field: "childAdmissionNo",
//       headerName: "Admission No",
//       flex: 1,
//       minWidth: 100,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "nowrap", color: "#ff6d00" }}>
//           {params.value}
//         </div>
//       ),
//     },
//   ];

//   if (parentLoading) {
//     return <Loading />;
//   }

//   const modifiedData = submittedData.map((item) => ({
//     ...item,
//     childName: item.children.map((child) => child.fullName).join("\n"),
//     childAdmissionNo: item.children
//       .map((child) => child.admissionNumber)
//       .join("\n"),
//   }));
//   console.log("modifiedData length:", modifiedData.length);
//   return (
//     <div className="md:h-screen mt-12 md:mt-1  mx-auto p-3 ">
//       <Heading Name="Parent Details" />
      
// {modifiedData.length > 0 ? (
//   <DynamicDataTable
//     data={modifiedData}
//     columns={parentColumns}
//     handleDelete={handleDelete}
//     tableHeight="90vh"  
//     className="w-full overflow-auto"
//     itemsPerPage={20}
//   />
// ) : (
//   <NoDataFound />
// )}
//     </div>
//   );
// }

// export default CreateParents;


// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import Loading from "../../../Loading";
// import useCustomQuery from "../../../useCustomQuery";
// import axios from "axios";
// import { useStateContext } from "../../../contexts/ContextProvider";
// import DynamicDataTable from "./DataTable";
// import Cookies from "js-cookie";
// import NoDataFound from "../../../NoDataFound";
// import Heading from "../../../Dynamic/Heading";

// const authToken = Cookies.get("token");
// function CreateParents() {
//   const { currentColor } = useStateContext();
//   const [submittedData, setSubmittedData] = useState([]);
//   const { queryData: allParent, loading: parentLoading, error: parentError } =
//     useCustomQuery(
//       "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllParentsWithChildren"
//     );
//   useEffect(() => {
//     if (allParent) {
//       setSubmittedData(allParent.data.map((p) => p.parent));
//     }
//   }, [allParent]);

//   const handleDelete = (email) => {
//     axios
//       .put(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deactivateParent`,
//         { email },
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const updatedData = submittedData.filter((item) => item.email !== email);
//         setSubmittedData(updatedData);
//         toast.success("Parent data deleted successfully");
//       })
//       .catch((error) => {
//         console.error("Error deleting Parent data:", error);
//         toast.error("An error occurred while deleting the Parent data.");
//       });
//   };

//   const parentColumns = [
//     { field: "id", headerName: "S. No.", width: 50 },
//     {
//       field: "admissionNumber",
//       headerName: "Admission No.",
//       minWidth: 80,
//       renderCell: (params) => (
//         <span style={{ fontSize: "14px", color: "#ff6d00" }}>
//           {params.value}
//         </span>
//       ),
//     },
//     {
//       field: "fullName",
//       headerName: "Father Name",
//       flex: 1,
//       minWidth: 80,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "pre-line", color: "#01579b" }}>
//           {params.value}
//         </div>
//       ),
//     },
//     {
//       field: "motherName",
//       headerName: "Mother Name",
//       flex: 1,
//       minWidth: 80,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "pre-line", color: "#01579b" }}>
//           {params.value}
//         </div>
//       ),
//     },
//     {
//       field: "email",
//       headerName: "Email",
//       flex: 1,
//       minWidth: 200,
//       renderCell: (params) => (
//         <span style={{ fontSize: "14px", color: "#1a237e" }}>
//           {params.value}
//         </span>
//       ),
//     },
//     { field: "contact", headerName: "Contact", flex: 1, minWidth: 80 },
//     {
//       field: "childName",
//       headerName: "Children",
//       flex: 1,
//       minWidth: 100,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "pre-line", color: "#01579b" }}>
//           {params.value}
//         </div>
//       ),
//     },
//     {
//       field: "childAdmissionNo",
//       headerName: "Admission No",
//       flex: 1,
//       minWidth: 100,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "pre-line", color: "#ff6d00" }}>
//           {params.value}
//         </div>
//       ),
//     },
//   ];

//   if (parentLoading) {
//     return <Loading />;
//   }

//   const modifiedData = submittedData.map((item) => ({
//     ...item,
//     childName: item.children.map((child) => child.fullName).join("\n"),
//     childAdmissionNo: item.children
//       .map((child) => child.admissionNumber)
//       .join("\n"),
//   }));
//   console.log("modifiedData", modifiedData);
//   return (
//     <div className="md:max-h-screen mt-12 md:mt-1  mx-auto p-3 ">
//       <Heading Name="Parent Details" />
//       {modifiedData.length > 0 ? (
//         <DynamicDataTable
//           data={modifiedData}
//           columns={parentColumns}
//           handleDelete={handleDelete}
//           tableHeight="h-[50vh]"
//           className="w-full overflow-auto"
//           itemsPerPage={5}
//         />
//       ) : (
//         <NoDataFound />
//       )}
//     </div>
//   );
// }

// export default CreateParents;

// // CreateParents.jsx
// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import Loading from "../../../Loading";
// import useCustomQuery from "../../../useCustomQuery";
// import axios from "axios";
// import { useStateContext } from "../../../contexts/ContextProvider";
// import DynamicDataTable from "./DataTable"; // Corrected import path
// import Cookies from "js-cookie";
// import NoDataFound from "../../../NoDataFound";
// import Heading from "../../../Dynamic/Heading";

// const authToken = Cookies.get("token");
// function CreateParents() {
//   const { currentColor } = useStateContext();
//   const [submittedData, setSubmittedData] = useState([]);
//   const { queryData: allParent, loading: parentLoading, error: parentError } =
//     useCustomQuery(
//       "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllParentsWithChildren"
//     );
//   useEffect(() => {
//     if (allParent) {
//       setSubmittedData(allParent.data.map((p) => p.parent));
//     }
//   }, [allParent]);

//   const handleDelete = (email) => {
//     axios
//       .put(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deactivateParent`,
//         { email },
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const updatedData = submittedData.filter((item) => item.email !== email);
//         setSubmittedData(updatedData);
//         toast.success("Parent data deleted successfully");
//       })
//       .catch((error) => {
//         console.error("Error deleting Parent data:", error);
//         toast.error("An error occurred while deleting the Parent data.");
//       });
//   };

//   const parentColumns = [
//     { field: "id", headerName: "S. No.", width: 50 },
//     {
//       field: "admissionNumber",
//       headerName: "Admission No.",
//       minWidth: 80,
//       renderCell: (params) => (
//         <span style={{ fontSize: "14px", color: "#ff6d00" }}>
//           {params.value}
//         </span>
//       ),
//     },
//     {
//       field: "fullName",
//       headerName: "Father Name",
//       flex: 1,
//       minWidth: 80,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "pre-line", color: "#01579b" }}>
//           {params.value}
//         </div>
//       ),
//     },
//     {
//       field: "motherName",
//       headerName: "Mother Name",
//       flex: 1,
//       minWidth: 80,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "pre-line", color: "#01579b" }}>
//           {params.value}
//         </div>
//       ),
//     },
//     {
//       field: "email",
//       headerName: "Email",
//       flex: 1,
//       minWidth: 200,
//       renderCell: (params) => (
//         <span style={{ fontSize: "14px", color: "#1a237e" }}>
//           {params.value}
//         </span>
//       ),
//     },
//     { field: "contact", headerName: "Contact", flex: 1, minWidth: 80 },
//     {
//       field: "childName",
//       headerName: "Children",
//       flex: 1,
//       minWidth: 100,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "pre-line", color: "#01579b" }}>
//           {params.value}
//         </div>
//       ),
//     },
//     {
//       field: "childAdmissionNo",
//       headerName: "Admission No",
//       flex: 1,
//       minWidth: 100,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "pre-line", color: "#ff6d00" }}>
//           {params.value}
//         </div>
//       ),
//     },
//   ];

//   if (parentLoading) {
//     return <Loading />;
//   }

//   const modifiedData = submittedData.map((item) => ({
//     ...item,
//     childName: item.children.map((child) => child.fullName).join("\n"),
//     childAdmissionNo: item.children
//       .map((child) => child.admissionNumber)
//       .join("\n"),
//   }));

//   return (
//     <div className="md:h-screen mt-12 md:mt-1  mx-auto p-3 ">
//       <Heading Name="Parent Details" />
//         {modifiedData.length > 0 ? (
//          <DynamicDataTable
//               data={modifiedData}
//               columns={parentColumns}
//               handleDelete={handleDelete}
//               tableHeight="h-[45vh]"
//               className="w-full overflow-auto"
//               itemsPerPage={10}
//         />
//         ) : (
//           <NoDataFound />
//          )}
//     </div>
//   );
// }

// export default CreateParents;



// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import Loading from "../../../Loading";
// import useCustomQuery from "../../../useCustomQuery";
// import axios from "axios";
// import { useStateContext } from "../../../contexts/ContextProvider";
// import DynamicDataTable from "./DataTable";
// import Cookies from "js-cookie";
// import NoDataFound from "../../../NoDataFound";
// import Heading from "../../../Dynamic/Heading";
// const authToken = Cookies.get("token");
// function CreateParents() {
//   const { currentColor } = useStateContext();
//   const [submittedData, setSubmittedData] = useState([]);
//   const { queryData: allParent, loading: parentLoading, error: parentError } =
//     useCustomQuery(
//       "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllParentsWithChildren"
//     );
//   useEffect(() => {
//     if (allParent) {
//       setSubmittedData(allParent.data.map((p) => p.parent));
//     }
//   }, [allParent]);

//   const handleDelete = (email) => {
//     axios
//       .put(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deactivateParent`,
//         { email },
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const updatedData = submittedData.filter((item) => item.email !== email);
//         setSubmittedData(updatedData);
//         toast.success("Parent data deleted successfully");
//       })
//       .catch((error) => {
//         console.error("Error deleting Parent data:", error);
//         toast.error("An error occurred while deleting the Parent data.");
//       });
//   };

//   const parentColumns = [
//     { field: "id", headerName: "S. No.", width: 50 },
//     {
//       field: "admissionNumber",
//       headerName: "Admission No.",
//       minWidth: 80,
//       renderCell: (params) => (
//         <span style={{ fontSize: "14px", color: "#ff6d00" }}>
//           {params.value}
//         </span>
//       ),
//     },

//     {
//       field: "fullName",
//       headerName: "Father Name",
//       flex: 1,
//       minWidth: 80,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "pre-line", color: "#01579b" }}>
//           {params.value}
//         </div>
//       ),
//     },
//     {
//       field: "motherName",
//       headerName: "Mother Name",
//       flex: 1,
//       minWidth: 80,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "pre-line", color: "#01579b" }}>
//           {params.value}
//         </div>
//       ),
//     },
//     {
//       field: "email",
//       headerName: "Email",
//       flex: 1,
//       minWidth: 200,
//       renderCell: (params) => (
//         <span style={{ fontSize: "14px", color: "#1a237e" }}>
//           {params.value}
//         </span>
//       ),
//     },
//     { field: "contact", headerName: "Contact", flex: 1, minWidth: 80 },
//     {
//       field: "childName",
//       headerName: "Children",
//       flex: 1,
//       minWidth: 100,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "pre-line", color: "#01579b" }}>
//           {params.value}
//         </div>
//       ),
//     },
//     {
//       field: "childAdmissionNo",
//       headerName: "Admission No",
//       flex: 1,
//       minWidth: 100,
//       renderCell: (params) => (
//         <div style={{ whiteSpace: "pre-line", color: "#ff6d00" }}>
//           {params.value}
//         </div>
//       ),
//     },
//   ];
//   if (parentLoading) {
//     return <Loading />;
//   }
//   const modifiedData = submittedData.map((item) => ({
//     ...item,
//     childName: item.children.map((child) => child.fullName).join("\n"),
//     childAdmissionNo: item.children
//       .map((child) => child.admissionNumber)
//       .join("\n"),
//   }));

//   return (
//     <div className="md:h-screen mt-12 md:mt-1  mx-auto p-3 ">
//       <Heading Name="Parent Details" />
//       {modifiedData.length > 0 ? (
      
//         <DynamicDataTable
//     data={modifiedData}
//     columns={parentColumns}
//     handleDelete={handleDelete}
//     tableHeight="h-[45vh]"
//     className="w-full overflow-auto"
//      itemsPerPage={10} // or any value
//   />
//       ) : (
//         <NoDataFound />
//       )}
//     </div>
//   );
// }

// export default CreateParents;


// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import Loading from "../../../Loading"
// import useCustomQuery from "../../../useCustomQuery";
// import axios from "axios";
// import { useStateContext } from "../../../contexts/ContextProvider";
// import DynamicDataTable from "./DataTable";
// import Cookies from 'js-cookie';
// import NoDataFound from "../../../NoDataFound";
// import Heading from "../../../Dynamic/Heading";
// const authToken = Cookies.get('token');
// function CreateParents() {
//   const { currentColor } = useStateContext();
//   const [submittedData, setSubmittedData] = useState([]);
//   const { queryData: allParent, loading: parentLoading, error: parentError } = useCustomQuery("https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllParentsWithChildren")
//   useEffect(() => {
//     if (allParent) {
//       setSubmittedData(allParent.data.map((p) => p.parent));

//     }
//   }, [allParent])

//   const handleDelete = (email) => {
//     axios.put(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/deactivateParent`, { email }, {
//       withCredentials: true,
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//       },
//     })
//       .then((response) => {
//         const updatedData = submittedData.filter((item) => item.email !== email);
//         setSubmittedData(updatedData);
//         toast.success("Parent data deleted successfully");
//       })
//       .catch((error) => {
//         console.error("Error deleting Parent data:", error);
//         toast.error("An error occurred while deleting the Parent data.");
//       });
//   };

//   if (parentLoading) {
//     return <Loading />
//   }
//   return (
//     <div className="md:h-screen mt-12 md:mt-1  mx-auto p-3 ">
//       <Heading Name="Parent Details" />
//       {
//         submittedData.length > 0 ? (<DynamicDataTable data={submittedData} handleDelete={handleDelete} />) : <NoDataFound />
//       }
//     </div>
//   );

// }

// export default CreateParents;


