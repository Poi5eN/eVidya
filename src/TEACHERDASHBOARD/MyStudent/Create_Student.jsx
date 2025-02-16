import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useStateContext } from "../../contexts/ContextProvider";
import Cookies from "js-cookie";
import { getStudentData_TeacherColumns } from "../../Dynamic/utils/TableUtils";
import NoDataFound from "../../NoDataFound";
import DynamicDataTable from "../../Dynamic/DynamicDataTable";
import Heading2 from "../../Dynamic/Heading2";
import Loading from "../../Loading";
import { useReactToPrint } from "react-to-print";
import Button from "../../Dynamic/utils/Button";
import studentImg from "../../Icone/icons8-student-48.png";

function Create_Student() {
    const { currentColor } = useStateContext();
    const [isLoading, setIsLoading] = useState(false);
    const authToken = Cookies.get("token");
    const [createdStudent, setCreatedStudent] = useState(false);
    const [submittedData, setSubmittedData] = useState([]);
    const teacherDetails = JSON.parse(sessionStorage.response);
    const classTeacherClass = teacherDetails.classTeacher;
    const classTeacherSection = teacherDetails.section;
    const filteredData = submittedData.filter(
        (teacherDetails) =>
            teacherDetails.class === classTeacherClass &&
            teacherDetails.section === classTeacherSection
    );

    const tableRef = useRef(); // Ref for printing
    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        setIsLoading(true);
        axios
            .get(
                "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            )
            .then((response) => {
                if (Array.isArray(response.data.allStudent)) {
                    setSubmittedData(response.data.allStudent);
                    setIsLoading(false);
                } else {
                    console.error("Data format is not as expected:", response.allStudent);
                }
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, [createdStudent]);


    const handlePrint = useReactToPrint({
        content: () => tableRef.current,
    });

    if (isLoading) {
        return <Loading />;
    }


     const renderMobileStudentCards = () => {
         return (
             <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredData.map((student, index) => (
                     <div key={index} className="bg-white rounded-lg shadow-md p-4 relative transition-transform hover:scale-105">
                            <img
                            src={student?.image?.url}
                            alt="Student"
                             className="absolute top-2 right-2 h-8 w-8 rounded-full object-cover"
                          />
                            <h3 className="text-lg font-semibold mb-2">{student.name}</h3>
                            <p><strong>Roll No:</strong> {student.rollNo}</p>
                            <p><strong>Adm No:</strong> {student.admissionNumber}</p>
                            {/* <p><strong>Class:</strong> {student.class}</p>
                            <p><strong>Section:</strong> {student.section}</p> */}
                            <p><strong>Father's Name:</strong> {student.fatherName}</p>
                            <p><strong>Mother's Name:</strong> {student.motherName}</p>
                            <p><strong>Contact:</strong> {student.contact}</p>
                        </div>
                    ))}
            </div>
        );
    };

    return (
        <div className="">
          <h1 className="text-xl text-center font-bold uppercase" 
          style={{color:currentColor}}
          >Student</h1>
            {/* <Heading2 title={"Students"} /> */}
             {/* <Button name="Print" onClick={handlePrint}  /> */}
            <div ref={tableRef}>
            {isMobile ? (
                   filteredData.length > 0 ? (
                    renderMobileStudentCards()
                    ) : (
                       <NoDataFound />
                     )
               ) : (
                    <>
                      {filteredData.length > 0 ? (
                            <DynamicDataTable
                                data={filteredData}
                                columns={getStudentData_TeacherColumns()}
                                className="w-full overflow-auto"
                                itemsPerPage={15}
                            />
                         ) : (
                            <NoDataFound />
                         )}
                    </>
                )}
          </div>
        </div>
    );
}

export default Create_Student;




// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Cookies from "js-cookie";
// import { getStudentData_TeacherColumns } from "../../Dynamic/utils/TableUtils";
// import NoDataFound from "../../NoDataFound";
// import DynamicDataTable from "../../Dynamic/DynamicDataTable";
// import Heading2 from "../../Dynamic/Heading2";
// import Loading from "../../Loading";
// import { useReactToPrint } from "react-to-print";
// import Button from "../../Dynamic/utils/Button";

// function Create_Student() {
//   const { currentColor } = useStateContext();
//   const [isLoading, setIsLoading] = useState(false);
//   const authToken = Cookies.get("token");
//   const [createdStudent, setCreatedStudent] = useState(false);
//   const [submittedData, setSubmittedData] = useState([]);
//   const teacherDetails = JSON.parse(sessionStorage.response);
//   const classTeacherClass = teacherDetails.classTeacher;
//   const classTeacherSection = teacherDetails.section;
//   const filteredData = submittedData.filter(
//     (teacherDetails) =>
//       teacherDetails.class === classTeacherClass &&
//       teacherDetails.section === classTeacherSection
//   );

//     const tableRef = useRef(); // Ref for printing
//     const isMobile = window.innerWidth <= 768;


//     useEffect(() => {
//         setIsLoading(true);
//         axios
//             .get(
//                 "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                     },
//                 }
//             )
//             .then((response) => {
//                 if (Array.isArray(response.data.allStudent)) {
//                     setSubmittedData(response.data.allStudent);
//                     setIsLoading(false);
//                 } else {
//                     console.error("Data format is not as expected:", response.allStudent);
//                 }
//             })
//             .catch((error) => {
//                 console.error("Error fetching data:", error);
//             });
//     }, [createdStudent]);


//     const handlePrint = useReactToPrint({
//         content: () => tableRef.current,
//     });

//     if (isLoading) {
//         return <Loading />;
//     }

//     const renderMobileStudentCards = () => {
//         return (
//             <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
//                 {filteredData.map((student, index) => (
//                      <div key={index} className="bg-white rounded-lg shadow-md p-4 transition-transform hover:scale-105">
//                             <h3 className="text-lg font-semibold mb-2">{student.name}</h3>
//                             <p><strong>Roll No:</strong> {student.rollNo}</p>
//                             <p><strong>Class:</strong> {student.class}</p>
//                             <p><strong>Section:</strong> {student.section}</p>
//                              <p><strong>Father's Name:</strong> {student.fatherName}</p>
//                             <p><strong>Mother's Name:</strong> {student.motherName}</p>

//                         </div>
//                 ))}
//             </div>
//         );
//     };

//     return (
//         <div className="p-3">
//             <Heading2 title={"Students"} />
           
//             <Button name="Print" onClick={handlePrint} />
//             <div ref={tableRef}>
//                  {isMobile ? (
//                     filteredData.length > 0 ? (
//                        renderMobileStudentCards()
//                    ) : (
//                          <NoDataFound />
//                    )
//                ) : (
//                 <>
//                  {filteredData.length > 0 ? (
//                      <DynamicDataTable
//                        data={filteredData}
//                        columns={getStudentData_TeacherColumns()}
//                         className="w-full overflow-auto"
//                        itemsPerPage={15}
//                      />
//                      ) : (
//                        <NoDataFound />
//                      )}
//                  </>
//             )}

//             </div>
//         </div>
//     );
// }

// export default Create_Student;

// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Cookies from "js-cookie";
// import { getStudentData_TeacherColumns } from "../../Dynamic/utils/TableUtils";
// import NoDataFound from "../../NoDataFound";
// import DynamicDataTable from "../../Dynamic/DynamicDataTable";
// import Heading2 from "../../Dynamic/Heading2";
// import Loading from "../../Loading";
// import { useReactToPrint } from "react-to-print";
// import Button from "../../Dynamic/utils/Button";

// function Create_Student() {
//   const { currentColor } = useStateContext();
//   const [isLoading, setIsLoading] = useState(false);
//   const authToken = Cookies.get("token");
//   const [createdStudent, setCreatedStudent] = useState(false);
//   const [submittedData, setSubmittedData] = useState([]);
//   const teacherDetails = JSON.parse(sessionStorage.response);
//   const classTeacherClass = teacherDetails.classTeacher;
//   const classTeacherSection = teacherDetails.section;
//   const filteredData = submittedData.filter(
//     (teacherDetails) =>
//       teacherDetails.class === classTeacherClass &&
//       teacherDetails.section === classTeacherSection
//   );

//   const tableRef = useRef(); // Ref for printing

//   useEffect(() => {
//     setIsLoading(true);
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         if (Array.isArray(response.data.allStudent)) {
//           setSubmittedData(response.data.allStudent);
//           setIsLoading(false);
//         } else {
//           console.error("Data format is not as expected:", response.allStudent);
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   }, [createdStudent]);

//   const handlePrint = useReactToPrint({
//     content: () => tableRef.current,
//   });

//   if (isLoading) {
//     return <Loading />;
//   }

//   return (
//     <div className="p-3">
//       <Heading2 title={"Students"} />
     
//       <Button name="Print"   onClick={handlePrint}/>
//       <div ref={tableRef}>
//         {filteredData.length > 0 ? (
//           <DynamicDataTable
//             data={filteredData}
//             columns={getStudentData_TeacherColumns()}
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

// export default Create_Student;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "../../Dynamic/Form/FormStyle.css";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Cookies from "js-cookie";
// import { getStudentData_TeacherColumns } from "../../Dynamic/utils/TableUtils";
// import NoDataFound from "../../NoDataFound";
// import DynamicDataTable from "../../Dynamic/DynamicDataTable";
// import Heading2 from "../../Dynamic/Heading2";
// import Loading from "../../Loading";

// function Create_Student() {
//   const { currentColor } = useStateContext();
//   const [isLoading,setIsloading]=useState(false)
//   const authToken = Cookies.get("token");
//   const [createdStudent, setCreatedStudent] = useState(false);
//   const [submittedData, setSubmittedData] = useState([]);
//   const teacherDetails = JSON.parse(sessionStorage.response);
//   const classTeacherClass = teacherDetails.classTeacher;
//   const classTeacherSection = teacherDetails.section;
//   const filteredData = submittedData.filter(
//     (teacherDetails) =>
//       teacherDetails.class == classTeacherClass &&
//       teacherDetails.section == classTeacherSection
//   );

//   useEffect(() => {
//     setIsloading(true)
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         if (Array.isArray(response.data.allStudent)) {
//           setSubmittedData(response.data.allStudent);
//           setIsloading(false)
//         } else {
//           console.error("Data format is not as expected:", response.allStudent);
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   }, [createdStudent]);

//   useEffect(() => {
//     const data = JSON.parse(sessionStorage.response);
//   }, []);



//   if(isLoading){
//   return  <Loading/>
//   }
//   return (
//     <div className=" mt-12 md:mt-1 p-3  ">
//       <Heading2 title={"Students"}>
   
//     </Heading2>
     
//        {filteredData.length > 0 ? (
//         <DynamicDataTable
//           data={filteredData}
//           columns={getStudentData_TeacherColumns()}
//           className="w-full overflow-auto"
//           itemsPerPage={15}
//         />
//       ) : (
//         <NoDataFound />
//       )}
//     </div>
//   );
// }

// export default Create_Student;
