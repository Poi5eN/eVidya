import React, { useEffect, useState, useRef } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import Loading from "../../Loading";
import SomthingwentWrong from "../../SomthingwentWrong";
import useCustomQuery from "../../useCustomQuery";
import styles from "./IdCard.module.css";
import { useReactToPrint } from "react-to-print";
import { Button, Grid, TextField } from "@mui/material";
// import "./IdCard.css"

const IdCard = () => {
  const { currentColor } = useStateContext();
  const [filterName, setFilterName] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filteredStudentData, setFilterdStudentData] = useState([]);
  const componentPDF = useRef();
  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    onBeforeGetContent: () => {
      document.title = `All ID Card`;
    },
    onAfterPrint: () => {
      alert("modalData saved in PDF");
      setTimeout(() => {
        document.title = "OriginalTitle";
      }, 100);
    },
  });

  const schoolName = sessionStorage.getItem("schoolName");
  const schoolContact = sessionStorage.getItem("schoolContact");
  const schoolAddress = sessionStorage.getItem("schooladdress");
  const SchoolImage = sessionStorage.getItem("image");

  const [studentData, setStudentData] = useState([]);
  const {
    queryData: idCard,
    loading: idCardLoading,
    error: idCardError,
  } = useCustomQuery(
    "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents"
  );

  useEffect(() => {
    if (idCard) {
      setStudentData(idCard.allStudent);
      setFilterdStudentData(idCard.allStudent);
    }
  }, [idCard]);

  const handleFilterbyname = (e) => {
    const value = e.target.value;
    setFilterName(value);
    filterStudents(filterClass, value);
  };

  const handleFilterByClass = (e) => {
    let value = e.target.value;
    setFilterClass(value);
    filterStudents(value, filterName);
  };

  const filterStudents = (filterClass, nameFilter) => {
    let filteredData = studentData;

    if (filterClass) {
      filteredData = filteredData.filter((student) =>
        student.class.includes(filterClass.toLowerCase())
      );
    }
    if (nameFilter) {
      filteredData = filteredData.filter((student) =>
        student.fullName.toLowerCase().includes(nameFilter)
      );
    }
    setFilterdStudentData(filteredData);
  };

  if (idCardLoading) {
    return <Loading />;
  }

  if (idCardError) {
    return <SomthingwentWrong />;
  }

  return (
    <>
      <div className="">
        <div className="mb-5">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                id="filled-basic"
                label="searchBy class"
                variant="filled"
                type="text"
                onChange={handleFilterByClass}
                value={filterClass}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                id="filled-basic"
                label="filterBy Name"
                variant="filled"
                type="text"
                onChange={handleFilterbyname}
                value={filterName}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <Button
                variant="contained"
                onClick={generatePDF}
                style={{ backgroundColor: currentColor, width: "100%" }}
                className="h-12"
              >
                Download
              </Button>
            </Grid>
          </Grid>
        </div>

        {/* ID Cards Grid */}
        <div
        className={styles.grid}
          // className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 p-2 mx-auto gap-4 pt-2"
          ref={componentPDF}
        >
          {filteredStudentData.map((student, index) => (
            <div
              className={`border-2 border-blue-400 w-60 relative rounded-lg p-2 m-1 ${
                (index + 1) % 9 === 0 ? "page-break" : ""
              }`}
              key={index}
            >
              
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 320"
                  >
                    <path
                      fill="#0099ff"
                      fill-opacity="1"
                      d="M0,128L720,320L1440,96L1440,0L720,0L0,0Z"
                    ></path>
                  </svg>
                  <p className="absolute top-3 right-3 text-white text-xs">
                    IDENTITY CARD
                  </p>
                  <div className=" w-full relative ">
                    <div className="w-10 h-10 object-contain bg-yellow-400 rounded-full absolute left-0 border-2 border-white  overflow-hidden">
                    {/* <div className="w-14 h-14 rounded-full border-2 border-white absolute top-3 ms-10 overflow-hidden"> */}
                      <img className="w-full h-full " src={SchoolImage || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"} />
                    </div>
                    <div className="ml-10">
                      <h1 className="text-blue-400  font-bold text-base text-center">
                        {schoolName}
                      </h1>
                    </div>
                  </div>
                 
                  <div className="text-center bg-blue-300 pt-[2px] pb-2 mt-2 px-5 ">
                    <p className="text-gray-700 font-bold text-[7px]">
                      {schoolAddress} <br />{" "}
                      <span>Tel: +91{schoolContact} </span>
                    </p>
                  </div>
                </div>
                <div className="flex ">
                  <div className=" border-blue-300 mt-2   overflow-hidden">
                    {student.image && student.image.url ? (
                      <img
                        className="w-24 h-24 object-contain  border-1 rounded-md"
                        src={student.image?.url  }
                        alt="Image"
                      />
                    ) : (
                     <img className="w-24 h-24 object-contain "  src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"/>
                    )}
                  </div>
                  <div className="ms-4 w-[50%] dark:text-white">
                    <p className="font-bold text-[12px]">
                      Name : <br />
                    </p>
                    <span className="text-[13px]"> {student.fullName?.slice(0, 15)}</span>
                    <p className="font-bold text-[12px] ">
                      F/Name : <br />
                    </p>
                    <span className="text-[13px]">{student.fatherName?.slice(0, 10)}</span>
                    <p>
                      <span className="font-bold text-[12px] ">Class : </span>{" "}
                     <span  className="text-[13px] ">
                     {student.class}-{student.section}
                     </span>
                    </p>
                    <p>
                      <span className="font-bold text-[12px] ">D.O.B:</span>
                    <span  className="text-[13px] ">
                    {new Date(student.dateOfBirth).toLocaleDateString(
                        "en-US"
                      )}
                    </span>
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="mb-6 dark:text-white text-[10px] border-t-1 border-black">
                    <p className="ms-4 font-bold ">
                      Address : {student.address}
                    </p>
                    <p className="ms-4 font-bold ">
                      Tel : +91{student.contact}{" "}
                    </p>
                  </div>
                  <p className="dark:text-white font-bold absolute bottom-2 right-2 text-gray-400">
                    Principal
                  </p>
                </div>
           
            </div>
          ))}
        </div>
      </div>

      {/* CSS to handle the page breaks and layout for printing */}
  
    </>
  );
};

export default IdCard;


// import React, { useEffect, useState, useRef } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Loading from "../../Loading";
// import SomthingwentWrong from "../../SomthingwentWrong";
// import useCustomQuery from "../../useCustomQuery";
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField } from "@mui/material";

// const IdCard = () => {
//   const { currentColor } = useStateContext();
//   const [filterName, setFilterName] = useState("");
//   const [filterClass, setFilterClass] = useState("");
//   const [filteredStudentData, setFilterdStudentData] = useState([]);
//   const componentPDF = useRef();
//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     onBeforeGetContent: () => {
//       document.title = `All ID Card`;
//     },
//     onAfterPrint: () => {
//       alert("modalData saved in PDF");
//       setTimeout(() => {
//         document.title = "OriginalTitle";
//       }, 100);
//     },
//   });

//   const schoolName = sessionStorage.getItem("schoolName");
//   const schoolContact = sessionStorage.getItem("schoolContact");
//   const schoolAddress = sessionStorage.getItem("schooladdress");
//   const SchoolImage = sessionStorage.getItem("image");

//   const [studentData, setStudentData] = useState([]);
//   const {
//     queryData: idCard,
//     loading: idCardLoading,
//     error: idCardError,
//   } = useCustomQuery(
//     "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents"
//   );

//   useEffect(() => {
//     if (idCard) {
//       setStudentData(idCard.allStudent);
//       setFilterdStudentData(idCard.allStudent);
//     }
//   }, [idCard]);

//   const handleFilterbyname = (e) => {
//     const value = e.target.value;
//     setFilterName(value);
//     filterStudents(filterClass, value);
//   };


//   const handleFilterByClass = (e) => {
//     let value = e.target.value;
//     setFilterClass(value);
//     filterStudents(value, filterName);
//   };
//   const filterStudents = (filterClass, nameFilter) => {
//     let filteredData = studentData;

//     if (filterClass) {
//       filteredData = filteredData.filter((student) =>
//         student.class.includes(filterClass.toLowerCase())
//       );
//     }
//     if (nameFilter) {
//       filteredData = filteredData.filter((student) =>
//         student.fullName.toLowerCase().includes(nameFilter)
//       );
//     }
//     setFilterdStudentData(filteredData);
//   };

//   if (idCardLoading) {
//     return <Loading />;
//   }

//   if (idCardError) {
//     return <SomthingwentWrong />;
//   }
//   return (
//     <>
//       <div className="">
//         <div className="mb-5">
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6} md={4}>
//               <TextField
//                 id="filled-basic"
//                 label="searchBy class"
//                 variant="filled"
//                 type="text"
//                 onChange={handleFilterByClass}
//                 value={filterClass}
//                 fullWidth
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={4}>
//               <TextField
//                 id="filled-basic"
//                 label="filterBy Name"
//                 variant="filled"
//                 type="text"
//                 onChange={handleFilterbyname}
//                 value={filterName}
//                 fullWidth
//               />
//             </Grid>
//             <Grid item xs={12} sm={12} md={4}>
//               <Button
//                 variant="contained"
//                 onClick={generatePDF}
//                 style={{ backgroundColor: currentColor, width: "100%" }}
//                 className="h-12"
//               >
//                 Download
//               </Button>
//             </Grid>
//           </Grid>
//         </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 p-2 mx-auto  " ref={componentPDF}>
//             {filteredStudentData.map((student, index) => (
//               <div className="border-2 border-blue-400 w-60 relative rounded-lg p-2 mb-2">
//                 <div>
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 1440 320"
//                   >
//                     <path
//                       fill="#0099ff"
//                       fill-opacity="1"
//                       d="M0,128L720,320L1440,96L1440,0L720,0L0,0Z"
//                     ></path>
//                   </svg>
//                   <p className="absolute top-3 right-3 text-white text-xs">
//                     IDENTITY CARD
//                   </p>
//                   <div className=" w-full relative ">
//                     <div className="w-10 h-10 object-contain bg-yellow-400 rounded-full absolute left-0 border-2 border-white  overflow-hidden">
//                     {/* <div className="w-14 h-14 rounded-full border-2 border-white absolute top-3 ms-10 overflow-hidden"> */}
//                       <img className="w-full h-full " src={SchoolImage || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"} />
//                     </div>
//                     <div className="ml-10">
//                       <h1 className="text-blue-400  font-bold text-base text-center">
//                         {schoolName}
//                       </h1>
//                     </div>
//                   </div>
                 
//                   <div className="text-center bg-blue-300 pt-[2px] pb-2 mt-2 px-5 ">
//                     <p className="text-gray-700 font-bold text-[7px]">
//                       {schoolAddress} <br />{" "}
//                       <span>Tel: +91{schoolContact} </span>
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex ">
//                   <div className=" border-blue-300 mt-2   overflow-hidden">
//                     {student.image && student.image.url ? (
//                       <img
//                         className="w-24 h-24 object-contain  border-1 rounded-md"
//                         src={student.image?.url  }
//                         alt="Image"
//                       />
//                     ) : (
//                      <img className="w-24 h-24 object-contain "  src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"/>
//                     )}
//                   </div>
//                   <div className="ms-4 w-[50%] dark:text-white">
//                     <p className="font-bold text-[12px]">
//                       Name : <br />
//                     </p>
//                     <span className="text-[13px]"> {student.fullName?.slice(0, 15)}</span>
//                     <p className="font-bold text-[12px] ">
//                       F/Name : <br />
//                     </p>
//                     <span className="text-[13px]">{student.fatherName?.slice(0, 10)}</span>
//                     <p>
//                       <span className="font-bold text-[12px] ">Class : </span>{" "}
//                      <span  className="text-[13px] ">
//                      {student.class}-{student.section}
//                      </span>
//                     </p>
//                     <p>
//                       <span className="font-bold text-[12px] ">D.O.B:</span>
//                     <span  className="text-[13px] ">
//                     {new Date(student.dateOfBirth).toLocaleDateString(
//                         "en-US"
//                       )}
//                     </span>
//                     </p>
//                   </div>
//                 </div>
//                 <div className="mt-2">
//                   <div className="mb-6 dark:text-white text-[10px] border-t-1 border-black">
//                     <p className="ms-4 font-bold ">
//                       Address : {student.address}
//                     </p>
//                     <p className="ms-4 font-bold ">
//                       Tel : +91{student.contact}{" "}
//                     </p>
//                   </div>
//                   <p className="dark:text-white font-bold absolute bottom-2 right-2 text-gray-400">
//                     Principal
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>

//       </div>
//     </>
//   );
// };

// export default IdCard;
