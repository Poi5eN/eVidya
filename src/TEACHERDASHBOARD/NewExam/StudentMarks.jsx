import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useStateContext } from "../../contexts/ContextProvider";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { toast } from "react-toastify";

const StudentMarks = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExams, setSelectedExams] = useState([]);
  const [examData, setExamData] = useState([]);

  const { currentColor } = useStateContext();
  const componentPDF = useRef();
  const authToken = Cookies.get("token");

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: `All_Students_Marks_Report`,
    onAfterPrint: () => toast.success("Downloaded successfully"),
  });

  useEffect(() => {
    const students = JSON.parse(localStorage.getItem("studentsData"));
    setAllStudents(students || []);
  }, []);

  const getResult = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setMarks(response.data.marks);
    } catch (error) {
      console.error("Error fetching marks:", error);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    getResult();
  }, [getResult]);

  const fetchExams = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setExamData(response.data.exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  }, [authToken]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleSelectChange = (e) => {
    const selectedExamId = e.target.value;
    setSelectedExams([selectedExamId]);
  };

  // Filter marks for all students and selected exams
  const filteredMarks = marks.filter((mark) =>
    selectedExams.includes(mark.examId)
  );

  const renderMarksTable = () => {
    if (filteredMarks.length === 0) {
      return <p>No marks data available for the selected exams.</p>;
    }

    return (
      <div className="flex justify-center items-center p-3" ref={componentPDF}>
        <div className="w-[210mm] h-[273mm] mx-auto">
          <div className="bg-white border-2 border-black py-2 px-3">
            <h2 className="text-center text-xl font-semibold mb-4">
              Marks for All Students
            </h2>

            {/* Scholastic Marks Table */}
            <h3 className="text-lg font-semibold mb-2">Scholastic Marks</h3>
            <table className="w-full border-collapse border border-gray-300 mb-6">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">Student Name</th>
                  <th className="border border-gray-300 p-2">Exam Name</th>
                  <th className="border border-gray-300 p-2">Subject</th>
                
                
                </tr>
              </thead>
              <tbody>
            {    console.log("allStudents",allStudents)},
                {console.log("filteredMarks",filteredMarks)}
                {filteredMarks.map((markEntry, index) =>
                  markEntry.marks.map((mark, subjectIndex) => (
                    <tr
                      key={`${markEntry._id}-${subjectIndex}`}
                      className={index % 2 === 0 ? "bg-gray-100" : ""}
                    >
                      <td className="border border-gray-300 p-2">
                        {
                          allStudents.find(
                            (student) => student._id === markEntry.studentId._id
                          )?.fullName
                        }
                      </td>
                      <td className="border border-gray-300 p-2">
                        {
                          examData.find((exam) => exam._id === markEntry.examId)
                            ?.name
                        }
                      </td>
                      <td className="border border-gray-300 p-2">
                        {mark.subjectName} , {mark.marks}/ {mark.totalMarks}  ,Passing Marks:  {mark.passingMarks}
                      </td>
                    
                     
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Co-Scholastic Marks Table */}
            <h3 className="text-lg font-semibold mb-2">Co-Scholastic Marks</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">Student Name</th>
                  <th className="border border-gray-300 p-2">Exam Name</th>
                  <th className="border border-gray-300 p-2">Activity</th>
                  <th className="border border-gray-300 p-2">Grade</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarks.map((markEntry, index) =>
                  markEntry.coScholasticMarks.map((activity, activityIndex) => (
                    <tr
                      key={`${markEntry._id}-${activityIndex}`}
                      className={index % 2 === 0 ? "bg-gray-100" : ""}
                    >
                      <td className="border border-gray-300 p-2">
                        {
                          allStudents.find(
                            (student) => student._id === markEntry.studentId._id
                          )?.fullName
                        }
                      </td>
                      <td className="border border-gray-300 p-2">
                        {
                          examData.find((exam) => exam._id === markEntry.examId)
                            ?.name
                        }
                      </td>
                      <td className="border border-gray-300 p-2">
                        {activity.activityName}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {activity.grade}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="mb-4 mx-auto">
        <div className="w-full flex">
          <div>
            <h3 className="text-lg font-semibold mb-2">Select Exam</h3>
            <div className="border-2 p-2">
              <select
                className="w-full p-2 border rounded"
                value={selectedExams[0] || ""}
                onChange={(e) => handleSelectChange(e)}
              >
                <option value="" disabled>
                  Select an Exam
                </option>
                {examData?.map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {renderMarksTable()}

      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </>
  );
};

export default StudentMarks;


// import React, { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { useReactToPrint } from "react-to-print";
// import { useRef } from "react";
// import { toast } from "react-toastify";

// const StudentMarks = () => {
//   const [allStudents, setAllStudents] = useState([]);
//   const [marks, setMarks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedExams, setSelectedExams] = useState([]);
//   const [examData, setExamData] = useState([]);

//   const { currentColor } = useStateContext();
//   const componentPDF = useRef();
//   const authToken = Cookies.get("token");

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `All_Students_Marks_Report`,
//     onAfterPrint: () => toast.success("Downloaded successfully"),
//   });

//   useEffect(() => {
//     const students = JSON.parse(localStorage.getItem("studentsData"));
//     setAllStudents(students || []);
//   }, []);

//   const getResult = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       setMarks(response.data.marks);
//     } catch (error) {
//       console.error("Error fetching marks:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [authToken]);

//   useEffect(() => {
//     getResult();
//   }, [getResult]);

//   const fetchExams = useCallback(async () => {
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       setExamData(response.data.exams);
//     } catch (error) {
//       console.error("Error fetching exams:", error);
//     }
//   }, [authToken]);

//   useEffect(() => {
//     fetchExams();
//   }, [fetchExams]);

//   const handleSelectChange = (e) => {
//     const selectedExamId = e.target.value;
//     setSelectedExams([selectedExamId]);
//   };

//   // Filter marks for all students and selected exams
//   const filteredMarks = marks.filter((mark) =>
//     selectedExams.includes(mark.examId)
//   );

//   const renderMarksTable = () => {
//     if (filteredMarks.length === 0) {
//       return <p>No marks data available for the selected exams.</p>;
//     }

//     return (
//       <div className="flex justify-center items-center p-3" ref={componentPDF}>
//         <div className="w-[210mm] h-[273mm] mx-auto">
//           <div className="bg-white border-2 border-black py-2 px-3">
//             <h2 className="text-center text-xl font-semibold mb-4">
//               Marks for All Students
//             </h2>

//             {/* Scholastic Marks Table */}
//             <h3 className="text-lg font-semibold mb-2">Scholastic Marks</h3>
//             <table className="w-full border-collapse border border-gray-300 mb-6">
//               <thead>
//                 <tr className="bg-gray-200">
//                   <th className="border border-gray-300 p-2">Student Name</th>
//                   <th className="border border-gray-300 p-2">Exam Name</th>
//                   <th className="border border-gray-300 p-2">Subject</th>
//                   <th className="border border-gray-300 p-2">Marks Obtained</th>
//                   <th className="border border-gray-300 p-2">Total Marks</th>
//                   <th className="border border-gray-300 p-2">Passing Marks</th>
//                   <th className="border border-gray-300 p-2">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {console.log("filteredMarks",filteredMarks)}
//                 {filteredMarks.map((markEntry, index) =>
//                   markEntry.marks.map((mark, subjectIndex) => (
//                     <tr
//                       key={`${markEntry._id}-${subjectIndex}`}
//                       className={index % 2 === 0 ? "bg-gray-100" : ""}
//                     >
//                       <td className="border border-gray-300 p-2">
//                         {
//                           allStudents.find(
//                             (student) => student._id === markEntry.studentId._id
//                           )?.fullName
//                         }
//                       </td>
//                       <td className="border border-gray-300 p-2">
//                         {
//                           examData.find((exam) => exam._id === markEntry.examId)
//                             ?.name
//                         }
//                       </td>
//                       <td className="border border-gray-300 p-2">
//                         {mark.subjectName}
//                       </td>
//                       <td className="border border-gray-300 p-2 text-center">
//                         {mark.marks}
//                       </td>
//                       <td className="border border-gray-300 p-2 text-center">
//                         {mark.totalMarks}
//                       </td>
//                       <td className="border border-gray-300 p-2 text-center">
//                         {mark.passingMarks}
//                       </td>
//                       <td className="border border-gray-300 p-2 text-center">
//                         {mark.isPassed ? "Pass" : "Fail"}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>

//             {/* Co-Scholastic Marks Table */}
//             <h3 className="text-lg font-semibold mb-2">Co-Scholastic Marks</h3>
//             <table className="w-full border-collapse border border-gray-300">
//               <thead>
//                 <tr className="bg-gray-200">
//                   <th className="border border-gray-300 p-2">Student Name</th>
//                   <th className="border border-gray-300 p-2">Exam Name</th>
//                   <th className="border border-gray-300 p-2">Activity</th>
//                   <th className="border border-gray-300 p-2">Grade</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredMarks.map((markEntry, index) =>
//                   markEntry.coScholasticMarks.map((activity, activityIndex) => (
//                     <tr
//                       key={`${markEntry._id}-${activityIndex}`}
//                       className={index % 2 === 0 ? "bg-gray-100" : ""}
//                     >
//                       <td className="border border-gray-300 p-2">
//                         {
//                           allStudents.find(
//                             (student) => student._id === markEntry.studentId._id
//                           )?.fullName
//                         }
//                       </td>
//                       <td className="border border-gray-300 p-2">
//                         {
//                           examData.find((exam) => exam._id === markEntry.examId)
//                             ?.name
//                         }
//                       </td>
//                       <td className="border border-gray-300 p-2">
//                         {activity.activityName}
//                       </td>
//                       <td className="border border-gray-300 p-2 text-center">
//                         {activity.grade}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       <div className="mb-4 mx-auto">
//         <div className="w-full flex">
//           <div>
//             <h3 className="text-lg font-semibold mb-2">Select Exam</h3>
//             <div className="border-2 p-2">
//               <select
//                 className="w-full p-2 border rounded"
//                 value={selectedExams[0] || ""}
//                 onChange={(e) => handleSelectChange(e)}
//               >
//                 <option value="" disabled>
//                   Select an Exam
//                 </option>
//                 {examData?.map((exam) => (
//                   <option key={exam._id} value={exam._id}>
//                     {exam.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {renderMarksTable()}

//       {loading && (
//         <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//           <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       )}
//     </>
//   );
// };

// export default StudentMarks;




// import React, { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { useReactToPrint } from "react-to-print";
// import { useRef } from "react";
// import { toast } from "react-toastify";

// const StudentMarks = () => {
//   const [allStudents, setAllStudents] = useState([]);
//   const [marks, setMarks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedExams, setSelectedExams] = useState([]);
//   const [examData, setExamData] = useState([]);

//   const { currentColor } = useStateContext();
//   const componentPDF = useRef();
//   const authToken = Cookies.get("token");


//   useEffect(() => {
//     const students = JSON.parse(localStorage.getItem("studentsData"));
//     setAllStudents(students || []);
//   }, []);

//   const getResult = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       setMarks(response.data.marks);
//     } catch (error) {
//       console.error("Error fetching marks:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [authToken]);

//   useEffect(() => {
//     getResult();
//   }, [getResult]);

//   const fetchExams = useCallback(async () => {
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       setExamData(response.data.exams);
//     } catch (error) {
//       console.error("Error fetching exams:", error);
//     }
//   }, [authToken]);

//   useEffect(() => {
//     fetchExams();
//   }, [fetchExams]);

//   const handleSelectChange = (e) => {
//     const selectedExamId = e.target.value;

//     // Handle the selected exam ID. You might need to update selectedExams
//     setSelectedExams([selectedExamId]);
//     // Or do other things based on the selected ID.
//   };


//   // Filter marks for all students and selected exams
//   const filteredMarks = marks.filter((mark) =>
//     selectedExams.includes(mark.examId)
//   );

//   const renderMarksTable = () => {
//     if (filteredMarks.length === 0) {
//       return <p>No marks data available for the selected exams.</p>;
//     }

//     return (
//       <div className="flex justify-center items-center p-3" ref={componentPDF}>
//         <div className="w-[210mm] h-[273mm] mx-auto">
//           <div className="bg-white border-2 border-black py-2 px-3">
//             <h2 className="text-center text-xl font-semibold mb-4">
//               Marks for All Students
//             </h2>
//             <table className="w-full border-collapse border border-gray-300">
//               <thead>
//                 <tr className="bg-gray-200">
//                   <th className="border border-gray-300 p-2">Student Name</th>
//                   <th className="border border-gray-300 p-2">Exam Name</th>
//                   <th className="border border-gray-300 p-2">Subject</th>
//                   <th className="border border-gray-300 p-2">Marks Obtained</th>
//                   <th className="border border-gray-300 p-2">Total Marks</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredMarks.map((markEntry, index) =>
//                   markEntry.marks.map((mark, subjectIndex) => (
//                     <tr
//                       key={`${markEntry._id}-${subjectIndex}`}
//                       className={index % 2 === 0 ? "bg-gray-100" : ""}
//                     >
//                       <td className="border border-gray-300 p-2">
//                         {
//                           allStudents.find(
//                             (student) => student._id === markEntry.studentId._id
//                           )?.fullName
//                         }
//                       </td>
//                       <td className="border border-gray-300 p-2">
//                         {
//                           examData.find((exam) => exam._id === markEntry.examId)
//                             ?.name
//                         }
//                       </td>
//                       <td className="border border-gray-300 p-2">
//                         {mark.subjectName}
//                       </td>
//                       <td className="border border-gray-300 p-2 text-center">
//                         {mark.marks}
//                       </td>
//                       <td className="border border-gray-300 p-2 text-center">
//                         {mark.totalMarks}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       <div className="mb-4 mx-auto">
//         <div className="w-full flex">
//           <div>
//             <h3 className="text-lg font-semibold mb-2">Select Exam</h3>
//             <div className="border-2 p-2">
//               <select
//                 className="w-full p-2 border rounded"
//                 value={selectedExams[0] || ""} // Control the value of select from state
//                 onChange={(e) => handleSelectChange(e)} // Call onChange handler
//               >
//                 <option value="" disabled>
//                   Select an Exam
//                 </option>
//                 {examData?.map((exam) => (
//                   <option key={exam._id} value={exam._id}>
//                     {exam.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {renderMarksTable()}

//       {loading && (
//         <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//           <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       )}
//     </>
//   );
// };

// export default StudentMarks;

// import React, { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import { useReactToPrint } from "react-to-print";
// import { useRef } from "react";
// import { toast } from "react-toastify";

// const StudentMarks = () => {
//   const [allStudents, setAllStudents] = useState([]);
//   const [marks, setMarks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [selectedExams, setSelectedExams] = useState([]);
//   const [examData, setExamData] = useState([]);

//     const { currentColor } = useStateContext();
//   const componentPDF = useRef();
//   const authToken = Cookies.get("token");

//     const generatePDF = useReactToPrint({
//         content: () => componentPDF.current,
//         documentTitle: `${
//             selectedStudent?.fullName || "Student"
//         }_Marks_Report`,
//         onAfterPrint: () => toast.success("Downloaded successfully"),
//     });

//   useEffect(() => {
//     const students = JSON.parse(localStorage.getItem("studentsData"));
//     setAllStudents(students || []);
//   }, []);

//   const getResult = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       setMarks(response.data.marks);
//     } catch (error) {
//       console.error("Error fetching marks:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [authToken]);

//   useEffect(() => {
//     getResult();
//   }, [getResult]);

//     const fetchExams = useCallback(async () => {
//         try {
//             const response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//                 {
//                     withCredentials: true,
//                     headers: { Authorization: `Bearer ${authToken}` },
//                 }
//             );
//             setExamData(response.data.exams);
//         } catch (error) {
//             console.error("Error fetching exams:", error);
//         }
//     }, [authToken]);
//     useEffect(() => {
//         fetchExams();
//     }, [fetchExams]);

//   const handleStudentChange = (e) => {
//     const selectedValue = e.target.value;
//     if (selectedValue) {
//       const selected = allStudents.find(
//         (student) => student?._id === selectedValue
//       );
//       setSelectedStudent(selected);
//     } else {
//         setSelectedStudent(null)
//     }
//   };

//     const handleCheckboxChange = (exam) => {
//         setSelectedExams((prevSelected) => {
//             const isExamSelected = prevSelected.includes(exam._id);
//             let updatedSelectedExams;

//             if (isExamSelected) {
//                 updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//             } else {
//                 updatedSelectedExams = [...prevSelected, exam._id];
//             }
//             return updatedSelectedExams;
//         });
//     };

//     const filteredMarks = marks.filter(
//         (mark) => mark?.studentId?._id === selectedStudent?._id && selectedExams.includes(mark.examId)
//     );

//     const renderMarksTable = () => {
//         if (!selectedStudent || filteredMarks.length === 0) {
//             return <p>No marks data available for the selected student and exam.</p>;
//         }

//         return (
//             <div className="flex justify-center items-center p-3" ref={componentPDF}>
//                 <div className="w-[210mm] h-[273mm]  mx-auto ">
//                     <div className=" bg-white border-2 border-black  py-2  px-3">
//                 <h2 className="text-center text-xl font-semibold mb-4">
//                     Marks for {selectedStudent?.fullName}

//                 </h2>
//                 <table className="w-full border-collapse border border-gray-300">
//                     <thead>
//                         <tr className="bg-gray-200">
//                             <th className="border border-gray-300 p-2">Exam Name</th>
//                             <th className="border border-gray-300 p-2">Subject</th>
//                             <th className="border border-gray-300 p-2">Marks Obtained</th>
//                             <th className="border border-gray-300 p-2">Total Marks</th>

//                         </tr>
//                     </thead>
//                     <tbody>
//                     {filteredMarks.map((markEntry, index) => (
//                         markEntry.marks.map((mark, subjectIndex) => (
//                                 <tr key={`${markEntry._id}-${subjectIndex}`}  className={index % 2 === 0 ? "bg-gray-100" : ""}>
//                                 <td className="border border-gray-300 p-2">{examData?.find(exam => exam._id === markEntry.examId)?.name}</td>
//                                     <td className="border border-gray-300 p-2">{mark.subjectName}</td>
//                                     <td className="border border-gray-300 p-2 text-center">{mark.marks}</td>
//                                     <td className="border border-gray-300 p-2 text-center">{mark.totalMarks}</td>

//                                 </tr>
//                             ))
//                         ))}
//                      </tbody>
//                     </table>
//                     </div>
//                     </div>
//                 </div>
//         );
//     };

//   return (
//     <>
//          <div className="mb-4 mx-auto">
//                 <div
//                     className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//                     style={{
//                         background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//                     }}
//                 >
//                     <p className="text-lg">Report Card</p>
//                     <MdDownload
//                         onClick={generatePDF}
//                         className="text-2xl cursor-pointer"
//                     />
//                 </div>
//                 <div className="w-full flex">
//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//                         <select
//                             className="p-2 border rounded"
//                             onChange={handleStudentChange}
//                             value={ selectedStudent?._id || ""}
//                         >
//                             <option value="">Select a student</option>
//                             {allStudents.map((student) => (
//                                 <option key={student?._id} value={student?._id}>
//                                     {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                                     (Roll No: {student?.rollNo})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//                         <form className="flex gap-4 items-center justify-center border-2 p-2">
//                             {examData?.map((exam) => (
//                                 <div key={exam._id} className="flex items-center">
//                                     <input
//                                         type="checkbox"
//                                         id={exam?._id}
//                                         value={exam?._id}
//                                         checked={selectedExams.includes(exam?._id)}
//                                         onChange={() => handleCheckboxChange(exam)}
//                                         className="mr-2"
//                                     />
//                                     <label htmlFor={exam._id}>{exam.name}</label>
//                                 </div>
//                             ))}
//                         </form>
//                     </div>
//                 </div>
//             </div>

//         {renderMarksTable()}

//         {loading && (
//           <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//             <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//           </div>
//         )}
//     </>
//   );
// };

// export default StudentMarks;
