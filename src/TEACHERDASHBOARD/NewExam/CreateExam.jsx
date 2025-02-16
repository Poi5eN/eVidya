// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { FaPlus, FaTimesCircle } from "react-icons/fa";
// import ViewExam from "./ViewExam";
// import Modal from "../../Dynamic/Modal";
// import Heading2 from "../../Dynamic/Heading2";
// // import Input from "../../Dynamic/Input"; //Removed custom Input Component

// export default function CreateExam() {
//   const { currentColor } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [examId, setExamId] = useState(null);
//   const [examCreated, setExamCreated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [modalFormData, setModalFormData] = useState({
//     name: "",
//     examType: "",
//     className: "",
//     section: "",
//     startDate: "",
//     endDate: "",
//     Grade: "",
//     resultPublishDate: "",
//     subjects: [],
//   });

//   const [filteredSubjects, setFilteredSubjects] = useState([]);
//   const teacherDetails = JSON.parse(sessionStorage.response);
//   const authToken = Cookies.get("token");

//   useEffect(() => {
//     if (modalOpen) {
//       getAllClasses();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [modalOpen]);

//   // const handleEditExam = (exam) => {
//   //     console.log("exam", exam)
//   //     setEditMode(true);
//   //     setExamId(exam?._id);
//   //     setModalOpen(true);
//   //     setModalFormData({
//   //          examName: exam?.name || "",
//   //         examType: exam?.examType || "",
//   //         className: exam?.className || "",
//   //         section: exam?.section || "",
//   //         startDate: exam?.startDate ?  exam?.startDate?.split('T')[0] :  "",
//   //         endDate: exam?.endDate ?  exam?.endDate?.split('T')[0] :  "",
//   //         Grade: exam?.gradeSystem || "",
//   //          resultPublishDate: exam?.resultPublishDate ? exam?.resultPublishDate?.split('T')[0] :  "",
//   //        subjects: exam?.subjects?.map(subject =>  ({
//   //             name: subject?.name,
//   //             examDate: subject?.examDate ? subject?.examDate?.split('T')[0] : '',
//   //             startTime: subject?.startTime,
//   //             endTime: subject?.endTime,
//   //             totalMarks: subject?.totalMarks,
//   //             passingMarks: subject?.passingMarks,
//   //         })) || [],
//   //     });
//   // };
//   const handleEditExam = (exam) => {
//     console.log("Exam Data:", exam);
//     setEditMode(true);
//     setExamId(exam?._id);
//     setModalOpen(true);
//     setModalFormData({
//       name: exam?.name || "",
//       examType: exam?.examType || "",
//       className: exam?.className || "",
//       section: exam?.section || "",
//       startDate: exam?.startDate ? exam?.startDate?.split("T")[0] : "",
//       endDate: exam?.endDate ? exam?.endDate?.split("T")[0] : "",
//       Grade: exam?.gradeSystem || "",
//       resultPublishDate: exam?.resultPublishDate
//         ? exam?.resultPublishDate?.split("T")[0]
//         : "",
//       subjects:
//         exam?.subjects?.map((subject) => ({
//           name: subject?.name || "",
//           examDate: subject?.examDate ? subject?.examDate?.split("T")[0] : "",
//           startTime: subject?.startTime || "",
//           endTime: subject?.endTime || "",
//           totalMarks: subject?.totalMarks || "",
//           passingMarks: subject?.passingMarks || "",
//         })) || [],
//     });
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setModalFormData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleSubjectChange = (index, field, value) => {
//     setModalFormData((prevData) => {
//       const updatedSubjects = [...prevData.subjects];
//       updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
//       return { ...prevData, subjects: updatedSubjects };
//     });
//   };
//   const handleSubjectNameChange = (index, value) => {
//     handleSubjectChange(index, "name", value);
//   };

//   const addSubject = () => {
//     setModalFormData((prevData) => ({
//       ...prevData,
//       subjects: [
//         ...prevData.subjects,
//         {
//           name: "",
//           examDate: "",
//           startTime: "",
//           endTime: "",
//           totalMarks: "",
//           passingMarks: "",
//         },
//       ],
//     }));
//   };

//   const removeSubject = (index) => {
//     setModalFormData((prevData) => {
//       const updatedSubjects = prevData.subjects.filter((_, i) => i !== index);
//       return { ...prevData, subjects: updatedSubjects };
//     });
//   };

//   const getAllClasses = async () => {
//     try {
//       let response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );
//       if (response?.data?.success) {
//         if (teacherDetails && response.data.classList?.length > 0) {
//           const filteredClass = response.data.classList.find(
//             (cls) =>
//               cls.className === teacherDetails.classTeacher &&
//               cls.sections.includes(teacherDetails.section)
//           );

//           if (filteredClass) {
//             const subjectsArray = filteredClass.subjects
//               .split(",")
//               .map((subject) => subject.trim());
//             setFilteredSubjects(subjectsArray);

//             if (!editMode) {
//               const initialSubjects = subjectsArray.map((subjectName) => ({
//                 name: subjectName,
//                 examDate: "",
//                 startTime: "",
//                 endTime: "",
//                 totalMarks: "",
//                 passingMarks: "",
//               }));
//               setModalFormData((prevData) => ({
//                 ...prevData,
//                 subjects: initialSubjects,
//               }));
//             }
//           } else {
//             setFilteredSubjects([]);
//             setModalFormData((prevData) => ({ ...prevData, subjects: [] }));
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//     }
//   };

//   const handleOpenModal = () => {
//     setModalOpen(true);
//     setEditMode(false);
//     setModalFormData({
//       name: "",
//       examType: "",
//       className: "",
//       section: "",
//       startDate: "",
//       endDate: "",
//       Grade: "",
//       resultPublishDate: "",
//       subjects: [],
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     if (
//       !modalFormData?.name ||
//       !modalFormData?.examType ||
//       !teacherDetails?.classTeacher ||
//       !teacherDetails?.section ||
//       !modalFormData?.Grade ||
//       !modalFormData?.startDate ||
//       !modalFormData?.endDate ||
//       !modalFormData?.resultPublishDate
//     ) {
//       toast.error("Please fill in all the required fields!");
//       setLoading(false);
//       return;
//     }
//     let payload = {
//       name: modalFormData?.name,
//       examType: modalFormData?.examType,
//       className: teacherDetails?.classTeacher,
//       section: teacherDetails?.section,
//       gradeSystem: modalFormData?.Grade,
//       startDate: modalFormData?.startDate,
//       endDate: modalFormData?.endDate,
//       resultPublishDate: modalFormData?.resultPublishDate,
//       subjects: modalFormData?.subjects,
//     };

//     let apiUrl = "https://eserver-i5sm.onrender.com/api/v1/exam/createExams";
//     let method = "post";
//     if (editMode) {
//       apiUrl = `https://eserver-i5sm.onrender.com/api/v1/exam/exams/${examId}`;
//       method = "put";
//     }
//     try {
//       await axios[method](apiUrl, payload, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//           "Content-Type": "application/json",
//         },
//       });
//       setModalFormData({
//         name: "",
//         examType: "",
//         className: "",
//         section: "",
//         startDate: "",
//         endDate: "",
//         Grade: "",
//         resultPublishDate: "",
//         subjects: [],
//       });
//       setEditMode(false);
//       setExamId(null);
//       toast.success(
//         editMode ? "Exam Updated Successfully!" : "Exam Created Successfully!"
//       );
//       setExamCreated(!examCreated);
//       setLoading(false);
//       setModalOpen(false);
//     } catch (error) {
//       setLoading(false);
//       console.log("error", error);
//       toast.error(
//         `Error: ${error?.response?.data?.message || "Something went wrong!"}`
//       );
//     }
//   };
//   console.log("modalFormData", modalFormData);

//   return (
//     <div className="md:px-5 p-1">
//       <Heading2 title={"All EXAMS"}>
//         <button
//           onClick={handleOpenModal}
//           className="py-1 p-3 shadow-md  rounded-tl-lg rounded-tr-lg  flex items-center space-x-1 text-white"
//           style={{ background: currentColor }}
//         >
//           {" "}
//           <FaPlus />
//           <span>Create Exam</span>
//         </button>
//       </Heading2>
//       <Modal
//         isOpen={modalOpen}
//         setIsOpen={setModalOpen}
//         title={editMode ? "Edit Exam" : "Create Exam"}
//       >
//         <div className=" mx-auto bg-gray-50 p-6  ">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="mt-2 grid sm:grid-cols-3  md:grid-cols-4  lg:grid-cols-3 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md ">
//               <div>
//                 <label
//                   htmlFor="name"
//                   className="block text-sm font-medium text-gray-700"
//                 >
//                   Exam Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   id="name"
//                   required={true}
//                   onChange={handleInputChange}
//                   value={modalFormData?.name}
//                   className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                 />
//               </div>

//               <div className="flex flex-col space-y-1 mt-1">
//                 <label
//                   htmlFor="examType"
//                   className="block text-sm font-medium text-gray-700"
//                 >
//                   Exam Type
//                 </label>
//                 <select
//                   name="examType"
//                   id="examType"
//                   value={modalFormData?.examType}
//                   onChange={handleInputChange}
//                   required
//                   className=" w-full border-1 border-black outline-none py-2 bg-inherit mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                 >
//                   <option value="">Select Exam Type</option>
//                   <option value="TERM">Term</option>
//                   <option value="UNIT_TEST">Unit Test</option>
//                   <option value="FINAL">Final</option>
//                   <option value="ENTRANCE">Entrance</option>
//                   <option value="COMPETITIVE">Competitive</option>
//                 </select>
//               </div>

//               <div>
//                 <label
//                   htmlFor="Grade"
//                   className="block text-sm font-medium text-gray-700"
//                 >
//                   Grade System
//                 </label>
//                 <select
//                   name="Grade"
//                   id="Grade"
//                   value={modalFormData?.Grade}
//                   onChange={handleInputChange}
//                   required
//                   className=" w-full border-1 border-black outline-none py-2 bg-inherit mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                 >
//                   <option value="">Grade System</option>
//                   <option value="Percentage">Percentage</option>
//                   <option value="Grade">Grade</option>
//                   <option value="CGPA">CGPA</option>
//                 </select>
//               </div>
//                 <div>
//                   <label
//                     htmlFor="startDate"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Start Date
//                   </label>
//                   <input
//                     type="date"
//                     name="startDate"
//                      id="startDate"
//                     required={true}
//                     onChange={handleInputChange}
//                     value={modalFormData?.startDate}
//                     placeholder=" Start Date"
//                     className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                   />
//                 </div>


//                 <div>
//                   <label
//                     htmlFor="endDate"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     End Date
//                   </label>
//                   <input
//                     type="date"
//                     name="endDate"
//                     id="endDate"
//                     required={true}
//                     onChange={handleInputChange}
//                     value={modalFormData?.endDate}
//                     placeholder="End Date"
//                     className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                   />
//                 </div>
                
//                   <div>
//                     <label
//                       htmlFor="resultPublishDate"
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       Result Publish Date
//                     </label>
//                      <input
//                       type="date"
//                       name="resultPublishDate"
//                        id="resultPublishDate"
//                       required={true}
//                       onChange={handleInputChange}
//                       value={modalFormData?.resultPublishDate}
//                       placeholder="Result Publish Date"
//                        className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                     />
//                   </div>
//             </div>

//             <div>
//               <div className="flex justify-between items-center mb-2">
//                 <h3 className="text-lg font-bold text-gray-800">Subjects</h3>
//                 <button
//                   type="button"
//                   onClick={addSubject}
//                   className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center space-x-1"
//                 >
//                   <FaPlus />
//                   <span>Add Subject</span>
//                 </button>
//               </div>
//               {modalFormData?.subjects?.map((subject, index) => (
              
//                 <div
//                 key={index}
//                 className="mt-2 mx-auto bg-gray-100 rounded-md p-2"  // Added padding for spacing on small screens
//               >
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2"> {/* Using grid for responsive columns */}
//                   <div>
//                     <label
//                       htmlFor={`subjectName-${index}`}
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       Subject Name
//                     </label>
//                     <select
//                         id={`subjectName-${index}`}
//                       value={subject?.name}
//                       onChange={(e) =>
//                         handleSubjectNameChange(index, e.target.value)
//                       }
//                       className="w-full border-1 border-black outline-none py-2 bg-inherit mt-1 p-2 border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                       required
//                     >
//                       <option value="">Select Subject</option>
//                       {filteredSubjects.map((subjectName) => (
//                         <option key={subjectName} value={subjectName}>
//                           {subjectName}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label
//                       htmlFor={`examDate-${index}`}
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       Exam Date
//                     </label>
//                     <input
//                       type="date"
//                       name="examDate"
//                         id={`examDate-${index}`}
//                       required={true}
//                       onChange={(e) =>
//                         handleSubjectChange(index, "examDate", e.target.value)
//                       }
//                       value={subject?.examDate}
//                       placeholder="Exam Date"
//                       className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                     />
//                   </div>
            
            
//                   <div>
//                     <label
//                       htmlFor={`startTime-${index}`}
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       Start Time
//                     </label>
//                     <input
//                       type="time"
//                       name="startTime"
//                         id={`startTime-${index}`}
//                       required={true}
//                       onChange={(e) =>
//                         handleSubjectChange(index, "startTime", e.target.value)
//                       }
//                       value={subject?.startTime}
//                       placeholder="Start Time"
//                         className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                     />
//                   </div>
            
            
//                   <div>
//                     <label
//                       htmlFor={`endTime-${index}`}
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       End Time
//                     </label>
//                     <input
//                       type="time"
//                       name="endTime"
//                         id={`endTime-${index}`}
//                       required={true}
//                       onChange={(e) =>
//                         handleSubjectChange(index, "endTime", e.target.value)
//                       }
//                       value={subject?.endTime}
//                       placeholder="End Time"
//                       className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                     />
//                   </div>
//                   <div>
//                     <label
//                       htmlFor={`totalMarks-${index}`}
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       Total Marks
//                     </label>
//                     <input
//                       type="number"
//                       name="totalMarks"
//                         id={`totalMarks-${index}`}
//                       required={true}
//                       onChange={(e) =>
//                         handleSubjectChange(index, "totalMarks", e.target.value)
//                       }
//                       value={subject.totalMarks}
//                       placeholder="Total Marks"
//                        className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                     />
//                   </div>
            
            
//                   <div>
//                     <label
//                       htmlFor={`passingMarks-${index}`}
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       Passing Marks
//                     </label>
//                     <input
//                       type="number"
//                       name="passingMarks"
//                         id={`passingMarks-${index}`}
//                       required={true}
//                       onChange={(e) =>
//                         handleSubjectChange(index, "passingMarks", e.target.value)
//                       }
//                       value={subject.passingMarks}
//                       placeholder="Passing Marks"
//                         className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                     />
//                   </div>
//                  <div className="flex items-center justify-center">
//                     <button
//                       type="button"
//                       onClick={() => removeSubject(index)}
//                       className="text-red-500 hover:text-red-700 focus:outline-none"
//                     >
//                       <FaTimesCircle size={20} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//               ))}
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md focus:outline-none disabled:bg-indigo-300 disabled:cursor-not-allowed"
//               disabled={loading}
//             >
//               {loading
//                 ? editMode
//                   ? "Updating Exam..."
//                   : "Saving Exam..."
//                 : editMode
//                 ? "Update Exam"
//                 : "Save Exam"}
//             </button>
//           </form>
//         </div>
//       </Modal>
//       <ViewExam onEdit={handleEditExam} />
//     </div>
//   );
// }


// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { FaPlus, FaTimesCircle } from "react-icons/fa";
// import ViewExam from "./ViewExam";
// import Modal from "../../Dynamic/Modal";
// import Heading2 from "../../Dynamic/Heading2";
// // import Input from "../../Dynamic/Input"; //Removed custom Input Component

// export default function CreateExam() {
//     const { currentColor } = useStateContext();
//     const [modalOpen, setModalOpen] = useState(false);
//     const [editMode, setEditMode] = useState(false);
//     const [examId, setExamId] = useState(null);
//     const [examCreated, setExamCreated] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [modalFormData, setModalFormData] = useState({
//         name: "",
//         examType: "",
//         className: "",
//         section: "",
//         startDate: "",
//         endDate: "",
//         Grade: "",
//         resultPublishDate: "",
//         subjects: [],
//     });

//     const [filteredSubjects, setFilteredSubjects] = useState([]);
//     const teacherDetails = JSON.parse(sessionStorage.response);
//     const authToken = Cookies.get("token");


//     useEffect(() => {
//         if (modalOpen) {
//             getAllClasses();
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [modalOpen]);


//     // const handleEditExam = (exam) => {
//     //     console.log("exam", exam)
//     //     setEditMode(true);
//     //     setExamId(exam?._id);
//     //     setModalOpen(true);
//     //     setModalFormData({
//     //          examName: exam?.name || "",
//     //         examType: exam?.examType || "",
//     //         className: exam?.className || "",
//     //         section: exam?.section || "",
//     //         startDate: exam?.startDate ?  exam?.startDate?.split('T')[0] :  "",
//     //         endDate: exam?.endDate ?  exam?.endDate?.split('T')[0] :  "",
//     //         Grade: exam?.gradeSystem || "",
//     //          resultPublishDate: exam?.resultPublishDate ? exam?.resultPublishDate?.split('T')[0] :  "",
//     //        subjects: exam?.subjects?.map(subject =>  ({
//     //             name: subject?.name,
//     //             examDate: subject?.examDate ? subject?.examDate?.split('T')[0] : '',
//     //             startTime: subject?.startTime,
//     //             endTime: subject?.endTime,
//     //             totalMarks: subject?.totalMarks,
//     //             passingMarks: subject?.passingMarks,
//     //         })) || [],
//     //     });
//     // };
//     const handleEditExam = (exam) => {
//       console.log("Exam Data:", exam);
//       setEditMode(true);
//       setExamId(exam?._id);
//       setModalOpen(true);
//       setModalFormData({
//         name: exam?.name || "",
//           examType: exam?.examType || "",
//           className: exam?.className || "",
//           section: exam?.section || "",
//           startDate: exam?.startDate ? exam?.startDate?.split('T')[0] : "",
//           endDate: exam?.endDate ? exam?.endDate?.split('T')[0] : "",
//           Grade: exam?.gradeSystem || "",
//           resultPublishDate: exam?.resultPublishDate ? exam?.resultPublishDate?.split('T')[0] : "",
//           subjects: exam?.subjects?.map(subject => ({
//               name: subject?.name || "",
//               examDate: subject?.examDate ? subject?.examDate?.split('T')[0] : "",
//               startTime: subject?.startTime || "",
//               endTime: subject?.endTime || "",
//               totalMarks: subject?.totalMarks || "",
//               passingMarks: subject?.passingMarks || "",
//           })) || [],
//       });
//   };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setModalFormData((prevData) => ({ ...prevData, [name]: value }));
//     };

//      const handleSubjectChange = (index, field, value) => {
//           setModalFormData((prevData) => {
//            const updatedSubjects = [...prevData.subjects];
//              updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
//            return { ...prevData, subjects: updatedSubjects };
//           });
//         };
//      const handleSubjectNameChange = (index, value) => {
//          handleSubjectChange(index, "name", value);
//      };


//     const addSubject = () => {
//         setModalFormData((prevData) => ({
//             ...prevData,
//             subjects: [
//                 ...prevData.subjects,
//                 {
//                     name: "",
//                     examDate: "",
//                     startTime: "",
//                     endTime: "",
//                     totalMarks: "",
//                     passingMarks: "",
//                 },
//             ],
//         }));
//     };

//     const removeSubject = (index) => {
//         setModalFormData((prevData) => {
//             const updatedSubjects = prevData.subjects.filter((_, i) => i !== index);
//             return { ...prevData, subjects: updatedSubjects };
//         });
//     };

//     const getAllClasses = async () => {
//         try {
//             let response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses",
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                     },
//                 }
//             );
//             if (response?.data?.success) {
//                 if (teacherDetails && response.data.classList?.length > 0) {
//                     const filteredClass = response.data.classList.find(
//                         (cls) =>
//                             cls.className === teacherDetails.classTeacher &&
//                             cls.sections.includes(teacherDetails.section)
//                     );

//                     if (filteredClass) {
//                         const subjectsArray = filteredClass.subjects
//                             .split(",")
//                             .map((subject) => subject.trim());
//                         setFilteredSubjects(subjectsArray);

//                         if (!editMode) {
//                             const initialSubjects = subjectsArray.map(subjectName => ({
//                                 name: subjectName,
//                                 examDate: "",
//                                 startTime: "",
//                                 endTime: "",
//                                 totalMarks: "",
//                                 passingMarks: "",
//                             }));
//                             setModalFormData((prevData) => ({ ...prevData, subjects: initialSubjects }));
//                         }
//                     }
//                     else {
//                         setFilteredSubjects([]);
//                         setModalFormData((prevData) => ({ ...prevData, subjects: [] }));
//                     }
//                 }
//             }

//         } catch (error) {
//             console.error("Error fetching classes:", error);
//         }
//     };


//     const handleOpenModal = () => {
//         setModalOpen(true);
//         setEditMode(false);
//         setModalFormData({
//           name: "",
//             examType: "",
//             className: "",
//             section: "",
//             startDate: "",
//             endDate: "",
//             Grade: "",
//             resultPublishDate: "",
//             subjects: [],
//         });
//     };


//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         if (
//             !modalFormData?.name ||
//             !modalFormData?.examType ||
//             !teacherDetails?.classTeacher ||
//             !teacherDetails?.section ||
//             !modalFormData?.Grade ||
//             !modalFormData?.startDate ||
//             !modalFormData?.endDate ||
//             !modalFormData?.resultPublishDate
//         ) {
//             toast.error("Please fill in all the required fields!");
//             setLoading(false);
//             return;
//         }
//         let payload = {
//             name: modalFormData?.name,
//             examType: modalFormData?.examType,
//             className: teacherDetails?.classTeacher,
//             section: teacherDetails?.section,
//             gradeSystem: modalFormData?.Grade,
//             startDate: modalFormData?.startDate,
//             endDate: modalFormData?.endDate,
//             resultPublishDate: modalFormData?.resultPublishDate,
//             subjects: modalFormData?.subjects,
//         };

//         let apiUrl = "https://eserver-i5sm.onrender.com/api/v1/exam/createExams";
//         let method = "post";
//         if (editMode) {
//             apiUrl = `https://eserver-i5sm.onrender.com/api/v1/exam/updateExam/${examId}`;
//             method = "put";
//         }
//         try {
//             await axios[method](
//                 apiUrl,
//                 payload,
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                         "Content-Type": "application/json",
//                     },
//                 }
//             );
//             setModalFormData({
//               name: "",
//                 examType: "",
//                 className: "",
//                 section: "",
//                 startDate: "",
//                 endDate: "",
//                 Grade: "",
//                 resultPublishDate: "",
//                  subjects: [],
//             });
//             setEditMode(false);
//             setExamId(null);
//             toast.success(editMode ? "Exam Updated Successfully!" : "Exam Created Successfully!");
//             setExamCreated(!examCreated);
//             setLoading(false);
//             setModalOpen(false);
//         } catch (error) {
//             setLoading(false);
//             console.log("error", error);
//             toast.error(
//                 `Error: ${error?.response?.data?.message || "Something went wrong!"}`
//             );
//         }
//     };
// console.log("modalFormData",modalFormData)

//     return (
//         <div className="px-5">
//             <Heading2 title={"All EXAMS"}>
//                 <button
//                     onClick={handleOpenModal}
//                     className="py-1 p-3 shadow-md  rounded-tl-lg rounded-tr-lg  flex items-center space-x-1 text-white"
//                     style={{ background: currentColor }}
//                 >
//                     {" "}
//                     <FaPlus />
//                     <span>Create Exam</span>
//                 </button>
//             </Heading2>
//             <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={editMode ? "Edit Exam" : "Create Exam"}>
//                 <div className=" mx-auto bg-gray-50 p-6  ">
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div className="mt-2 grid sm:grid-cols-3  md:grid-cols-4  lg:grid-cols-3 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md ">
                         
//                             <input
//                                 type="text"
//                                 name="name"
//                                 required={true}
//                                 onChange={handleInputChange}
//                                 value={modalFormData?.name}
//                                 className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                             />
                          
//                             <div className="flex flex-col space-y-1 mt-1">
//                                 <select
//                                     name="examType"
//                                     value={modalFormData?.examType}
//                                     onChange={handleInputChange}
//                                     required
//                                     className=" w-full border-1 border-black outline-none py-2 bg-inherit mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                                 >
//                                     <option value="">Select Exam Type</option>
//                                     <option value="TERM">Term</option>
//                                     <option value="UNIT_TEST">Unit Test</option>
//                                     <option value="FINAL">Final</option>
//                                     <option value="ENTRANCE">Entrance</option>
//                                     <option value="COMPETITIVE">Competitive</option>
//                                 </select>
//                             </div>

//                             <div>
//                                 <select
//                                     name="Grade"
//                                     value={modalFormData?.Grade}
//                                     onChange={handleInputChange}
//                                     required
//                                      className=" w-full border-1 border-black outline-none py-2 bg-inherit mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                                 >
//                                     <option value="">Grade System</option>
//                                     <option value="Percentage">Percentage</option>
//                                     <option value="Grade">Grade</option>
//                                     <option value="CGPA">CGPA</option>
//                                 </select>
//                             </div>
//                              <input
//                                 type="date"
//                                 name="startDate"
//                                 required={true}
//                                 onChange={handleInputChange}
//                                 value={modalFormData?.startDate}
//                                 placeholder=" Start Date"
//                                  className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                             />

//                             <input
//                                 type="date"
//                                 name="endDate"
//                                 required={true}
//                                 onChange={handleInputChange}
//                                 value={modalFormData?.endDate}
//                                 placeholder="End Date"
//                                   className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                             />

//                              <input
//                                 type="date"
//                                 name="resultPublishDate"
//                                 required={true}
//                                 onChange={handleInputChange}
//                                 value={modalFormData?.resultPublishDate}
//                                 placeholder="Result Publish Date"
//                                  className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                             />
//                         </div>

//                         <div>
//                             <div className="flex justify-between items-center mb-2">
//                                 <h3 className="text-lg font-bold text-gray-800">Subjects</h3>
//                                 <button
//                                     type="button"
//                                     onClick={addSubject}
//                                     className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center space-x-1"
//                                 >
//                                     <FaPlus />
//                                     <span>Add Subject</span>
//                                 </button>
//                             </div>
//                             {modalFormData?.subjects?.map((subject, index) => (
//                                 <div
//                                     key={index}
//                                     className="mt-2 grid sm:grid-cols-3  md:grid-cols-6  lg:grid-cols-6 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md "
//                                 >
//                                     <div>
//                                         <select
//                                             value={subject?.name}
//                                             onChange={(e) =>
//                                                 handleSubjectNameChange(index, e.target.value)
//                                             }
//                                             className=" w-full border-1 border-black outline-none py-2 bg-inherit mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                                             required
//                                         >
//                                             <option value="">Select Subject</option>
//                                             {filteredSubjects.map((subjectName) => (
//                                                 <option key={subjectName} value={subjectName}>
//                                                     {subjectName}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <input
//                                         type="date"
//                                         name="examDate"
//                                         required={true}
//                                         onChange={(e) =>
//                                             handleSubjectChange(index, "examDate", e.target.value)
//                                         }
//                                         value={subject?.examDate}
//                                         placeholder="Exam Date"
//                                         className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                                     />

//                                   <input
//                                         type="time"
//                                         name="startTime"
//                                         required={true}
//                                         onChange={(e) =>
//                                             handleSubjectChange(index, "startTime", e.target.value)
//                                         }
//                                         value={subject?.startTime}
//                                         placeholder="Start Time"
//                                         className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                                     />
//                                    <input
//                                         type="time"
//                                         name="endTime"
//                                         required={true}
//                                         onChange={(e) =>
//                                             handleSubjectChange(index, "endTime", e.target.value)
//                                         }
//                                         value={subject?.endTime}
//                                         placeholder="End Time"
//                                         className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                                     />

//                                     <input
//                                         type="number"
//                                         name="totalMarks"
//                                         required={true}
//                                         onChange={(e) =>
//                                             handleSubjectChange(index, "totalMarks", e.target.value)
//                                         }
//                                         value={subject.totalMarks}
//                                         placeholder="Total Marks"
//                                           className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                                     />

//                                    <input
//                                         type="number"
//                                         name="passingMarks"
//                                         required={true}
//                                         onChange={(e) =>
//                                             handleSubjectChange(index, "passingMarks", e.target.value)
//                                         }
//                                         value={subject.passingMarks}
//                                         placeholder="Passing Marks"
//                                           className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                                     />

//                                     <div className="flex items-center justify-center">
//                                         <button
//                                             type="button"
//                                             onClick={() => removeSubject(index)}
//                                             className="text-red-500 hover:text-red-700 focus:outline-none"
//                                         >
//                                             <FaTimesCircle size={20} />
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         <button
//                             type="submit"
//                             className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md focus:outline-none disabled:bg-indigo-300 disabled:cursor-not-allowed"
//                             disabled={loading}
//                         >
//                             {loading ? (editMode ? "Updating Exam..." : "Saving Exam...") : (editMode ? "Update Exam" : "Save Exam")}
//                         </button>
//                     </form>
//                 </div>
//             </Modal>
//             <ViewExam onEdit={handleEditExam} />
//         </div>
//     );
// }



// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { FaPlus, FaTimesCircle } from "react-icons/fa";
// import ViewExam from "./ViewExam";
// import Modal from "../../Dynamic/Modal";
// import Heading2 from "../../Dynamic/Heading2";
// import Input from "../../Dynamic/Input";

// export default function CreateExam() {
//     const { currentColor } = useStateContext();
//     const [modalOpen, setModalOpen] = useState(false);
//     const [editMode, setEditMode] = useState(false);
//     const [examId, setExamId] = useState(null);
//     const [examCreated, setExamCreated] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [modalFormData, setModalFormData] = useState({
//         examName: "",
//         examType: "",
//         className: "",
//         section: "",
//         startDate: "",
//         endDate: "",
//         Grade: "",
//         resultPublishDate: "",
//         subjects: [],
//     });

//     const [filteredSubjects, setFilteredSubjects] = useState([]);
//     const teacherDetails = JSON.parse(sessionStorage.response);
//     const authToken = Cookies.get("token");


//     useEffect(() => {
//         if (modalOpen) {
//             getAllClasses();
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [modalOpen]);


//     const handleEditExam = (exam) => {
//         console.log("exam", exam)
//         setEditMode(true);
//         setExamId(exam?._id);
//         setModalOpen(true);
//         setModalFormData({
//             examName: exam?.name || "",
//             examType: exam?.examType || "",
//             className: exam?.className || "",
//             section: exam?.section || "",
//             startDate: exam?.startDate || "",
//             endDate: exam?.endDate || "",
//             Grade: exam?.gradeSystem || "",
//             resultPublishDate: exam?.resultPublishDate || "",
//             subjects: exam?.subjects?.map(subject => ({
//                 name: subject?.name,
//                 examDate: subject?.examDate,
//                 startTime: subject?.startTime,
//                 endTime: subject?.endTime,
//                 totalMarks: subject?.totalMarks,
//                 passingMarks: subject?.passingMarks,
//             })) || [],
//         });
//     };


//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setModalFormData((prevData) => ({ ...prevData, [name]: value }));
//     };

//     const handleSubjectChange = (index, field, value) => {
//         setModalFormData((prevData) => {
//             const updatedSubjects = [...prevData.subjects];
//             updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
//             return { ...prevData, subjects: updatedSubjects };
//         });
//     };
//      const handleSubjectNameChange = (index, value) => {
//          handleSubjectChange(index, "name", value);
//      };


//     const addSubject = () => {
//         setModalFormData((prevData) => ({
//             ...prevData,
//             subjects: [
//                 ...prevData.subjects,
//                 {
//                     name: "",
//                     examDate: "",
//                     startTime: "",
//                     endTime: "",
//                     totalMarks: "",
//                     passingMarks: "",
//                 },
//             ],
//         }));
//     };

//     const removeSubject = (index) => {
//         setModalFormData((prevData) => {
//             const updatedSubjects = prevData.subjects.filter((_, i) => i !== index);
//             return { ...prevData, subjects: updatedSubjects };
//         });
//     };

//     const getAllClasses = async () => {
//         try {
//             let response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses",
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                     },
//                 }
//             );
//             if (response?.data?.success) {
//                 if (teacherDetails && response.data.classList?.length > 0) {
//                     const filteredClass = response.data.classList.find(
//                         (cls) =>
//                             cls.className === teacherDetails.classTeacher &&
//                             cls.sections.includes(teacherDetails.section)
//                     );

//                     if (filteredClass) {
//                         const subjectsArray = filteredClass.subjects
//                             .split(",")
//                             .map((subject) => subject.trim());
//                         setFilteredSubjects(subjectsArray);

//                         if (!editMode) {
//                             const initialSubjects = subjectsArray.map(subjectName => ({
//                                 name: subjectName,
//                                 examDate: "",
//                                 startTime: "",
//                                 endTime: "",
//                                 totalMarks: "",
//                                 passingMarks: "",
//                             }));
//                             setModalFormData((prevData) => ({ ...prevData, subjects: initialSubjects }));
//                         }
//                     }
//                     else {
//                         setFilteredSubjects([]);
//                         setModalFormData((prevData) => ({ ...prevData, subjects: [] }));
//                     }
//                 }
//             }

//         } catch (error) {
//             console.error("Error fetching classes:", error);
//         }
//     };


//     const handleOpenModal = () => {
//         setModalOpen(true);
//         setEditMode(false);
//         setModalFormData({
//             examName: "",
//             examType: "",
//             className: "",
//             section: "",
//             startDate: "",
//             endDate: "",
//             Grade: "",
//             resultPublishDate: "",
//             subjects: [],
//         });
//     };


//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         if (
//             !modalFormData?.examName ||
//             !modalFormData?.examType ||
//             !teacherDetails?.classTeacher ||
//             !teacherDetails?.section ||
//             !modalFormData?.Grade ||
//             !modalFormData?.startDate ||
//             !modalFormData?.endDate ||
//             !modalFormData?.resultPublishDate
//         ) {
//             toast.error("Please fill in all the required fields!");
//             setLoading(false);
//             return;
//         }
//         let payload = {
//             name: modalFormData?.examName,
//             examType: modalFormData?.examType,
//             className: teacherDetails?.classTeacher,
//             section: teacherDetails?.section,
//             gradeSystem: modalFormData?.Grade,
//             startDate: modalFormData?.startDate,
//             endDate: modalFormData?.endDate,
//             resultPublishDate: modalFormData?.resultPublishDate,
//             subjects: modalFormData?.subjects,
//         };

//         let apiUrl = "https://eserver-i5sm.onrender.com/api/v1/exam/createExams";
//         let method = "post";
//         if (editMode) {
//             apiUrl = `https://eserver-i5sm.onrender.com/api/v1/exam/updateExam/${examId}`;
//             method = "put";
//         }
//         try {
//             await axios[method](
//                 apiUrl,
//                 payload,
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                         "Content-Type": "application/json",
//                     },
//                 }
//             );
//             setModalFormData({
//                 examName: "",
//                 examType: "",
//                 className: "",
//                 section: "",
//                 startDate: "",
//                 endDate: "",
//                 Grade: "",
//                 resultPublishDate: "",
//                 subjects: [],
//             });
//             setEditMode(false);
//             setExamId(null);
//             toast.success(editMode ? "Exam Updated Successfully!" : "Exam Created Successfully!");
//             setExamCreated(!examCreated);
//             setLoading(false);
//             setModalOpen(false);
//         } catch (error) {
//             setLoading(false);
//             console.log("error", error);
//             toast.error(
//                 `Error: ${error?.response?.data?.message || "Something went wrong!"}`
//             );
//         }
//     };


//     return (
//         <div className="px-5">
//             <Heading2 title={"All EXAMS"}>
//                 <button
//                     onClick={handleOpenModal}
//                     className="py-1 p-3 shadow-md  rounded-tl-lg rounded-tr-lg  flex items-center space-x-1 text-white"
//                     style={{ background: currentColor }}
//                 >
//                     {" "}
//                     <FaPlus />
//                     <span>Create Exam</span>
//                 </button>
//             </Heading2>
//             <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={editMode ? "Edit Exam" : "Create Exam"}>
//                 <div className=" mx-auto bg-gray-50 p-6  ">
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div className="mt-2 grid sm:grid-cols-3  md:grid-cols-4  lg:grid-cols-3 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md ">
//                             <Input
//                                 type="text"
//                                 name="examName"
//                                 required={true}
//                                 onChange={handleInputChange}
//                                 value={modalFormData?.examName}
//                                 placeholder="Exam Name"
//                             />

//                             <div className="flex flex-col space-y-1 mt-1">
//                                 <select
//                                     name="examType"
//                                     value={modalFormData?.examType}
//                                     onChange={handleInputChange}
//                                     required
//                                     className=" w-full border-1 border-black outline-none py-2 bg-inherit"
//                                 >
//                                     <option value="">Select Exam Type</option>
//                                     <option value="TERM">Term</option>
//                                     <option value="UNIT_TEST">Unit Test</option>
//                                     <option value="FINAL">Final</option>
//                                     <option value="ENTRANCE">Entrance</option>
//                                     <option value="COMPETITIVE">Competitive</option>
//                                 </select>
//                             </div>

//                             <div>
//                                 <select
//                                     name="Grade"
//                                     value={modalFormData?.Grade}
//                                     onChange={handleInputChange}
//                                     required
//                                     className=" w-full border-1 border-black outline-none py-2 bg-inherit"
//                                 >
//                                     <option value="">Grade System</option>
//                                     <option value="Percentage">Percentage</option>
//                                     <option value="Grade">Grade</option>
//                                     <option value="CGPA">CGPA</option>
//                                 </select>
//                             </div>
//                             <Input
//                                 type="date"
//                                 name="startDate"
//                                 required={true}
//                                 onChange={handleInputChange}
//                                 value={modalFormData?.startDate}
//                                 placeholder=" Start Date"
//                             />

//                             <Input
//                                 type="date"
//                                 name="endDate"
//                                 required={true}
//                                 onChange={handleInputChange}
//                                 value={modalFormData?.endDate}
//                                 placeholder="End Date"
//                             />

//                             <Input
//                                 type="date"
//                                 name="resultPublishDate"
//                                 required={true}
//                                 onChange={handleInputChange}
//                                 value={modalFormData?.resultPublishDate}
//                                 placeholder="Result Publish Date"
//                             />
//                         </div>

//                         <div>
//                             <div className="flex justify-between items-center mb-2">
//                                 <h3 className="text-lg font-bold text-gray-800">Subjects</h3>
//                                 <button
//                                     type="button"
//                                     onClick={addSubject}
//                                     className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center space-x-1"
//                                 >
//                                     <FaPlus />
//                                     <span>Add Subject</span>
//                                 </button>
//                             </div>
//                             {modalFormData?.subjects?.map((subject, index) => (
//                                 <div
//                                     key={index}
//                                     className="mt-2 grid sm:grid-cols-3  md:grid-cols-6  lg:grid-cols-6 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md "
//                                 >
//                                     <div>
//                                         <select
//                                             value={subject?.name}
//                                             onChange={(e) =>
//                                                 handleSubjectNameChange(index, e.target.value)
//                                             }
//                                             className=" w-full border-1 border-black outline-none py-2 bg-inherit"
//                                             required
//                                         >
//                                             <option value="">Select Subject</option>
//                                             {filteredSubjects.map((subjectName) => (
//                                                 <option key={subjectName} value={subjectName}>
//                                                     {subjectName}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <Input
//                                         type="date"
//                                         name="examDate"
//                                         required={true}
//                                         onChange={(e) =>
//                                             handleSubjectChange(index, "examDate", e.target.value)
//                                         }
//                                         value={subject?.examDate}
//                                         placeholder="Exam Date"
//                                     />

//                                     <Input
//                                         type="time"
//                                         name="startTime"
//                                         required={true}
//                                         onChange={(e) =>
//                                             handleSubjectChange(index, "startTime", e.target.value)
//                                         }
//                                         value={subject?.startTime}
//                                         placeholder="Start Time"
//                                     />
//                                     <Input
//                                         type="time"
//                                         name="endTime"
//                                         required={true}
//                                         onChange={(e) =>
//                                             handleSubjectChange(index, "endTime", e.target.value)
//                                         }
//                                         value={subject?.endTime}
//                                         placeholder="End Time"
//                                     />

//                                     <Input
//                                         type="number"
//                                         name="totalMarks"
//                                         required={true}
//                                         onChange={(e) =>
//                                             handleSubjectChange(index, "totalMarks", e.target.value)
//                                         }
//                                         value={subject.totalMarks}
//                                         placeholder="Total Marks"
//                                     />

//                                     <Input
//                                         type="number"
//                                         name="passingMarks"
//                                         required={true}
//                                         onChange={(e) =>
//                                             handleSubjectChange(index, "passingMarks", e.target.value)
//                                         }
//                                         value={subject.passingMarks}
//                                         placeholder="Passing Marks"
//                                     />

//                                     <div className="flex items-center justify-center">
//                                         <button
//                                             type="button"
//                                             onClick={() => removeSubject(index)}
//                                             className="text-red-500 hover:text-red-700 focus:outline-none"
//                                         >
//                                             <FaTimesCircle size={20} />
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         <button
//                             type="submit"
//                             className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md focus:outline-none disabled:bg-indigo-300 disabled:cursor-not-allowed"
//                             disabled={loading}
//                         >
//                             {loading ? (editMode ? "Updating Exam..." : "Saving Exam...") : (editMode ? "Update Exam" : "Save Exam")}
//                         </button>
//                     </form>
//                 </div>
//             </Modal>
//             <ViewExam onEdit={handleEditExam} />
//         </div>
//     );
// }



// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { FaPlus, FaTimesCircle } from "react-icons/fa";
// import ViewExam from "./ViewExam";
// import Modal from "../../Dynamic/Modal";
// import Heading2 from "../../Dynamic/Heading2";
// import Input from "../../Dynamic/Input";

// export default function CreateExam() {
//     const { currentColor } = useStateContext();
//     const [modalOpen, setModalOpen] = useState(false);
//     const [editMode, setEditMode] = useState(false);
//     const [examId, setExamId] = useState(null);
//     const [examCreated, setExamCreated] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [modalFormData, setModalFormData] = useState({
//         examName: "",
//         examType: "",
//         className: "",
//         section: "",
//         startDate: "",
//         endDate: "",
//         Grade: "",
//         resultPublishDate: "",
//         subjects: [],
//     });

//     const [filteredSubjects, setFilteredSubjects] = useState([]);
//     const teacherDetails = JSON.parse(sessionStorage.response);
//     const authToken = Cookies.get("token");


//     useEffect(() => {
//         if (modalOpen) {
//             getAllClasses();
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [modalOpen]);


//     const handleEditExam = (exam) => {
//         console.log("exam", exam)
//         setEditMode(true);
//         setExamId(exam?._id);
//         setModalOpen(true);
//         setModalFormData({
//             examName: exam?.name || "",
//             examType: exam?.examType || "",
//             className: exam?.className || "",
//             section: exam?.section || "",
//             startDate: exam?.startDate || "",
//             endDate: exam?.endDate || "",
//             Grade: exam?.gradeSystem || "",
//             resultPublishDate: exam?.resultPublishDate || "",
//             subjects: exam?.subjects?.map(subject => ({
//                 name: subject?.name,
//                 examDate: subject?.examDate,
//                 startTime: subject?.startTime,
//                 endTime: subject?.endTime,
//                 totalMarks: subject?.totalMarks,
//                 passingMarks: subject?.passingMarks,
//             })) || [],
//         });
//     };


//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setModalFormData((prevData) => ({ ...prevData, [name]: value }));
//     };

//     const handleSubjectChange = (index, field, value) => {
//         setModalFormData((prevData) => {
//             const updatedSubjects = [...prevData.subjects];
//             updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
//             return { ...prevData, subjects: updatedSubjects };
//         });
//     };
//     const handleSubjectNameChange = (index, value) => {
//         handleSubjectChange(index, "name", value);
//     };


//     const addSubject = () => {
//         setModalFormData((prevData) => ({
//             ...prevData,
//             subjects: [
//                 ...prevData.subjects,
//                 {
//                     name: "",
//                     examDate: "",
//                     startTime: "",
//                     endTime: "",
//                     totalMarks: "",
//                     passingMarks: "",
//                 },
//             ],
//         }));
//     };

//     const removeSubject = (index) => {
//         setModalFormData((prevData) => {
//             const updatedSubjects = prevData.subjects.filter((_, i) => i !== index);
//             return { ...prevData, subjects: updatedSubjects };
//         });
//     };

//     const getAllClasses = async () => {
//         try {
//             let response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses",
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                     },
//                 }
//             );
//             if (response?.data?.success) {
//                 if (teacherDetails && response.data.classList?.length > 0) {
//                     const filteredClass = response.data.classList.find(
//                         (cls) =>
//                             cls.className === teacherDetails.classTeacher &&
//                             cls.sections.includes(teacherDetails.section)
//                     );

//                     if (filteredClass) {
//                         const subjectsArray = filteredClass.subjects
//                             .split(",")
//                             .map((subject) => subject.trim());
//                         setFilteredSubjects(subjectsArray);

//                         if (!editMode) {
//                             const initialSubjects = subjectsArray.map(subjectName => ({
//                                 name: subjectName,
//                                 examDate: "",
//                                 startTime: "",
//                                 endTime: "",
//                                 totalMarks: "",
//                                 passingMarks: "",
//                             }));
//                             setModalFormData((prevData) => ({ ...prevData, subjects: initialSubjects }));
//                         }
//                     }
//                     else {
//                         setFilteredSubjects([]);
//                         setModalFormData((prevData) => ({ ...prevData, subjects: [] }));
//                     }
//                 }
//             }

//         } catch (error) {
//             console.error("Error fetching classes:", error);
//         }
//     };


//     const handleOpenModal = () => {
//         setModalOpen(true);
//         setEditMode(false);
//         setModalFormData({
//             examName: "",
//             examType: "",
//             className: "",
//             section: "",
//             startDate: "",
//             endDate: "",
//             Grade: "",
//             resultPublishDate: "",
//             subjects: [],
//         });
//     };


//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         if (
//             !modalFormData?.examName ||
//             !modalFormData?.examType ||
//             !teacherDetails?.classTeacher ||
//             !teacherDetails?.section ||
//             !modalFormData?.Grade ||
//             !modalFormData?.startDate ||
//             !modalFormData?.endDate ||
//             !modalFormData?.resultPublishDate
//         ) {
//             toast.error("Please fill in all the required fields!");
//             setLoading(false);
//             return;
//         }
//         let payload = {
//             name: modalFormData?.examName,
//             examType: modalFormData?.examType,
//             className: teacherDetails?.classTeacher,
//             section: teacherDetails?.section,
//             gradeSystem: modalFormData?.Grade,
//             startDate: modalFormData?.startDate,
//             endDate: modalFormData?.endDate,
//             resultPublishDate: modalFormData?.resultPublishDate,
//             subjects: modalFormData?.subjects,
//         };

//         let apiUrl = "https://eserver-i5sm.onrender.com/api/v1/exam/createExams";
//         let method = "post";
//         if (editMode) {
//             apiUrl = `https://eserver-i5sm.onrender.com/api/v1/exam/updateExam/${examId}`;
//             method = "put";
//         }
//         try {
//             await axios[method](
//                 apiUrl,
//                 payload,
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                         "Content-Type": "application/json",
//                     },
//                 }
//             );
//             setModalFormData({
//                 examName: "",
//                 examType: "",
//                 className: "",
//                 section: "",
//                 startDate: "",
//                 endDate: "",
//                 Grade: "",
//                 resultPublishDate: "",
//                 subjects: [],
//             });
//             setEditMode(false);
//             setExamId(null);
//             toast.success(editMode ? "Exam Updated Successfully!" : "Exam Created Successfully!");
//             setExamCreated(!examCreated);
//             setLoading(false);
//             setModalOpen(false);
//         } catch (error) {
//             setLoading(false);
//             console.log("error", error);
//             toast.error(
//                 `Error: ${error?.response?.data?.message || "Something went wrong!"}`
//             );
//         }
//     };


//     return (
//         <div className="px-5">
//             <Heading2 title={"All EXAMS"}>
//                 <button
//                     onClick={handleOpenModal}
//                     className="py-1 p-3 shadow-md  rounded-tl-lg rounded-tr-lg  flex items-center space-x-1 text-white"
//                     style={{ background: currentColor }}
//                 >
//                     {" "}
//                     <FaPlus />
//                     <span>Create Exam</span>
//                 </button>
//             </Heading2>
//             <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={editMode ? "Edit Exam" : "Create Exam"}>
//                 <div className=" mx-auto bg-gray-50 p-6  ">
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div className="mt-2 grid sm:grid-cols-3  md:grid-cols-4  lg:grid-cols-3 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md ">
//                             <Input
//                                 type="text"
//                                 name="examName"
//                                 required={true}
//                                 onChange={handleInputChange}
//                                 value={modalFormData?.examName}
//                                 placeholder="Exam Name"
//                             />

//                             <div className="flex flex-col space-y-1 mt-1">
//                                 <select
//                                     name="examType"
//                                     value={modalFormData?.examType}
//                                     onChange={handleInputChange}
//                                     required
//                                     className=" w-full border-1 border-black outline-none py-2 bg-inherit"
//                                 >
//                                     <option value="">Select Exam Type</option>
//                                     <option value="TERM">Term</option>
//                                     <option value="UNIT_TEST">Unit Test</option>
//                                     <option value="FINAL">Final</option>
//                                     <option value="ENTRANCE">Entrance</option>
//                                     <option value="COMPETITIVE">Competitive</option>
//                                 </select>
//                             </div>

//                             <div>
//                                 <select
//                                     name="Grade"
//                                     value={modalFormData?.Grade}
//                                     onChange={handleInputChange}
//                                     required
//                                     className=" w-full border-1 border-black outline-none py-2 bg-inherit"
//                                 >
//                                     <option value="">Grade System</option>
//                                     <option value="Percentage">Percentage</option>
//                                     <option value="Grade">Grade</option>
//                                     <option value="CGPA">CGPA</option>
//                                 </select>
//                             </div>
//                             <Input
//                                 type="date"
//                                 name="startDate"
//                                 required={true}
//                                 onChange={handleInputChange}
//                                 value={modalFormData?.startDate}
//                                 placeholder=" Start Date"
//                             />

//                             <Input
//                                 type="date"
//                                 name="endDate"
//                                 required={true}
//                                 onChange={handleInputChange}
//                                 value={modalFormData?.endDate}
//                                 placeholder="End Date"
//                             />

//                             <Input
//                                 type="date"
//                                 name="resultPublishDate"
//                                 required={true}
//                                 onChange={handleInputChange}
//                                 value={modalFormData?.resultPublishDate}
//                                 placeholder="Result Publish Date"
//                             />
//                         </div>

//                         <div>
//                             <div className="flex justify-between items-center mb-2">
//                                 <h3 className="text-lg font-bold text-gray-800">Subjects</h3>
//                                 <button
//                                     type="button"
//                                     onClick={addSubject}
//                                     className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center space-x-1"
//                                 >
//                                     <FaPlus />
//                                     <span>Add Subject</span>
//                                 </button>
//                             </div>
//                             {modalFormData?.subjects?.map((subject, index) => (
//                                 <div
//                                     key={index}
//                                     className="mt-2 grid sm:grid-cols-3  md:grid-cols-6  lg:grid-cols-6 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md "
//                                 >
//                                      <div>
//                                             <select
//                                                 value={subject?.name}
//                                                 onChange={(e) =>
//                                                     handleSubjectNameChange(index, e.target.value)
//                                                 }
//                                                 className=" w-full border-1 border-black outline-none py-2 bg-inherit"
//                                                 required
//                                             >
//                                                 <option value="">Select Subject</option>
//                                                 {filteredSubjects.map((subjectName) => (
//                                                     <option key={subjectName} value={subjectName}>
//                                                         {subjectName}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </div>
//                                     <Input
//                                         type="date"
//                                         name="examDate"
//                                         required={true}
//                                         onChange={(e) =>
//                                             handleSubjectChange(index, "examDate", e.target.value)
//                                         }
//                                         value={subject?.examDate}
//                                         placeholder="Exam Date"
//                                     />

//                                     <Input
//                                         type="time"
//                                         name="startTime"
//                                         required={true}
//                                         onChange={(e) =>
//                                             handleSubjectChange(index, "startTime", e.target.value)
//                                         }
//                                         value={subject?.startTime}
//                                         placeholder="Start Time"
//                                     />
//                                     <Input
//                                         type="time"
//                                         name="endTime"
//                                         required={true}
//                                         onChange={(e) =>
//                                             handleSubjectChange(index, "endTime", e.target.value)
//                                         }
//                                         value={subject?.endTime}
//                                         placeholder="End Time"
//                                     />

//                                     <Input
//                                         type="number"
//                                         name="totalMarks"
//                                         required={true}
//                                         onChange={(e) =>
//                                             handleSubjectChange(index, "totalMarks", e.target.value)
//                                         }
//                                         value={subject.totalMarks}
//                                         placeholder="Total Marks"
//                                     />

//                                     <Input
//                                         type="number"
//                                         name="passingMarks"
//                                         required={true}
//                                         onChange={(e) =>
//                                             handleSubjectChange(index, "passingMarks", e.target.value)
//                                         }
//                                         value={subject.passingMarks}
//                                         placeholder="Passing Marks"
//                                     />

//                                     <div className="flex items-center justify-center">
//                                         <button
//                                             type="button"
//                                             onClick={() => removeSubject(index)}
//                                             className="text-red-500 hover:text-red-700 focus:outline-none"
//                                         >
//                                             <FaTimesCircle size={20} />
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         <button
//                             type="submit"
//                             className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md focus:outline-none disabled:bg-indigo-300 disabled:cursor-not-allowed"
//                             disabled={loading}
//                         >
//                             {loading ? (editMode ? "Updating Exam..." : "Saving Exam...") : (editMode ? "Update Exam" : "Save Exam")}
//                         </button>
//                     </form>
//                 </div>
//             </Modal>
//             <ViewExam onEdit={handleEditExam} />
//         </div>
//     );
// }



import React, { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { FaPlus, FaTimesCircle } from "react-icons/fa";
import ViewExam from "./ViewExam";
import Modal from "../../Dynamic/Modal";
import Heading2 from "../../Dynamic/Heading2";
import Input from "../../Dynamic/Input";

export default function CreateExam() {
  const { currentColor } = useStateContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [examId, setExamId] = useState(null);
  const [examCreated, setExamCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalFormData, setModalFormData] = useState({
    examName: "",
    examType: "",
    className: "",
    section: "",
    startDate: "",
    endDate: "",
    Grade: "",
    resultPublishDate: "",
    subjects: [],
  });

  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const teacherDetails = JSON.parse(sessionStorage.response);
  const authToken = Cookies.get("token");


  useEffect(() => {
    if (modalOpen) {
      getAllClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);


  const handleEditExam = (exam) => {
    console.log("exam", exam)
    setEditMode(true);
    setExamId(exam?._id);
    setModalOpen(true);
    setModalFormData({
      examName: exam?.name || "",
      examType: exam?.examType || "",
      className: exam?.className || "",
      section: exam?.section || "",
      startDate: exam?.startDate || "",
      endDate: exam?.endDate || "",
      Grade: exam?.gradeSystem || "",
      resultPublishDate: exam?.resultPublishDate || "",
      subjects: exam?.subjects?.map(subject => ({
        name: subject?.name,
        examDate: subject?.examDate,
        startTime: subject?.startTime,
        endTime: subject?.endTime,
        totalMarks: subject?.totalMarks,
        passingMarks: subject?.passingMarks,
      })) || [],
    });
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubjectChange = (index, field, value) => {
    setModalFormData((prevData) => {
      const updatedSubjects = [...prevData.subjects];
      updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
      return { ...prevData, subjects: updatedSubjects };
    });
  };

  const addSubject = () => {
    setModalFormData((prevData) => ({
      ...prevData,
      subjects: [
        ...prevData.subjects,
        {
          name: "",
          examDate: "",
          startTime: "",
          endTime: "",
          totalMarks: "",
          passingMarks: "",
        },
      ],
    }));
  };

  const removeSubject = (index) => {
    setModalFormData((prevData) => {
      const updatedSubjects = prevData.subjects.filter((_, i) => i !== index);
      return { ...prevData, subjects: updatedSubjects };
    });
  };

  const getAllClasses = async () => {
    try {
      let response = await axios.get(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (response?.data?.success) {
        if (teacherDetails && response.data.classList?.length > 0) {
          const filteredClass = response.data.classList.find(
            (cls) =>
              cls.className === teacherDetails.classTeacher &&
              cls.sections.includes(teacherDetails.section)
          );

          if (filteredClass) {
            const subjectsArray = filteredClass.subjects
              .split(",")
              .map((subject) => subject.trim());
            setFilteredSubjects(subjectsArray);

            if (!editMode) {
              const initialSubjects = subjectsArray.map(subjectName => ({
                name: subjectName,
                examDate: "",
                startTime: "",
                endTime: "",
                totalMarks: "",
                passingMarks: "",
              }));
              setModalFormData((prevData) => ({ ...prevData, subjects: initialSubjects }));
            }
          }
          else {
            setFilteredSubjects([]);
            setModalFormData((prevData) => ({ ...prevData, subjects: [] }));
          }
        }
      }

    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };


  const handleOpenModal = () => {
    setModalOpen(true);
    setEditMode(false);
    setModalFormData({
      examName: "",
      examType: "",
      className: "",
      section: "",
      startDate: "",
      endDate: "",
      Grade: "",
      resultPublishDate: "",
      subjects: [],
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (
      !modalFormData?.examName ||
      !modalFormData?.examType ||
      !teacherDetails?.classTeacher ||
      !teacherDetails?.section ||
      !modalFormData?.Grade ||
      !modalFormData?.startDate ||
      !modalFormData?.endDate ||
      !modalFormData?.resultPublishDate
    ) {
      toast.error("Please fill in all the required fields!");
      setLoading(false);
      return;
    }
    let payload = {
      name: modalFormData?.examName,
      examType: modalFormData?.examType,
      className: teacherDetails?.classTeacher,
      section: teacherDetails?.section,
      gradeSystem: modalFormData?.Grade,
      startDate: modalFormData?.startDate,
      endDate: modalFormData?.endDate,
      resultPublishDate: modalFormData?.resultPublishDate,
      subjects: modalFormData?.subjects,
    };

    let apiUrl = "https://eserver-i5sm.onrender.com/api/v1/exam/createExams";
    let method = "post";
    if (editMode) {
      apiUrl = `https://eserver-i5sm.onrender.com/api/v1/exam/updateExam/${examId}`;
      method = "put";
    }
    try {
      await axios[method](
        apiUrl,
        payload,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setModalFormData({
        examName: "",
        examType: "",
        className: "",
        section: "",
        startDate: "",
        endDate: "",
        Grade: "",
        resultPublishDate: "",
        subjects: [],
      });
      setEditMode(false);
      setExamId(null);
      toast.success(editMode ? "Exam Updated Successfully!" : "Exam Created Successfully!");
      setExamCreated(!examCreated);
      setLoading(false);
      setModalOpen(false);
    } catch (error) {
      setLoading(false);
      console.log("error", error);
      toast.error(
        `Error: ${error?.response?.data?.message || "Something went wrong!"}`
      );
    }
  };


  return (
    <div className="px-5">
      <Heading2 title={"All EXAMS"}>
        <button
          onClick={handleOpenModal}
          className="py-1 p-3 shadow-md  rounded-tl-lg rounded-tr-lg  flex items-center space-x-1 text-white"
          style={{ background: currentColor }}
        >
          {" "}
          <FaPlus />
          <span>Create Exam</span>
        </button>
      </Heading2>
      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={editMode ? "Edit Exam" : "Create Exam"}>
        <div className=" mx-auto bg-gray-50 p-6  ">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mt-2 grid sm:grid-cols-3  md:grid-cols-4  lg:grid-cols-3 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md ">
              <Input
                type="text"
                name="examName"
                required={true}
                onChange={handleInputChange}
                value={modalFormData?.examName}
                placeholder="Exam Name"
              />

              <div className="flex flex-col space-y-1 mt-1">
                <select
                  name="examType"
                  value={modalFormData?.examType}
                  onChange={handleInputChange}
                  required
                  className=" w-full border-1 border-black outline-none py-2 bg-inherit"
                >
                  <option value="">Select Exam Type</option>
                  <option value="TERM">Term</option>
                  <option value="UNIT_TEST">Unit Test</option>
                  <option value="FINAL">Final</option>
                  <option value="ENTRANCE">Entrance</option>
                  <option value="COMPETITIVE">Competitive</option>
                </select>
              </div>

              <div>
                <select
                  name="Grade"
                  value={modalFormData?.Grade}
                  onChange={handleInputChange}
                  required
                  className=" w-full border-1 border-black outline-none py-2 bg-inherit"
                >
                  <option value="">Grade System</option>
                  <option value="Percentage">Percentage</option>
                  <option value="Grade">Grade</option>
                  <option value="CGPA">CGPA</option>
                </select>
              </div>
              <Input
                type="date"
                name="startDate"
                required={true}
                onChange={handleInputChange}
                value={modalFormData?.startDate}
                placeholder=" Start Date"
              />

              <Input
                type="date"
                name="endDate"
                required={true}
                onChange={handleInputChange}
                value={modalFormData?.endDate}
                placeholder="End Date"
              />

              <Input
                type="date"
                name="resultPublishDate"
                required={true}
                onChange={handleInputChange}
                value={modalFormData?.resultPublishDate}
                placeholder="Result Publish Date"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-800">Subjects</h3>
                <button
                  type="button"
                  onClick={addSubject}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center space-x-1"
                >
                  <FaPlus />
                  <span>Add Subject</span>
                </button>
              </div>
              {modalFormData?.subjects?.map((subject, index) => (
                <div
                  key={index}
                  className="mt-2 grid sm:grid-cols-3  md:grid-cols-6  lg:grid-cols-6 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md "
                >
                  <div>
                      {subject?.name}
                  </div>
                  <Input
                    type="date"
                    name="examDate"
                    required={true}
                    onChange={(e) =>
                      handleSubjectChange(index, "examDate", e.target.value)
                    }
                    value={subject?.examDate}
                    placeholder="Exam Date"
                  />

                  <Input
                    type="time"
                    name="startTime"
                    required={true}
                    onChange={(e) =>
                      handleSubjectChange(index, "startTime", e.target.value)
                    }
                    value={subject?.startTime}
                    placeholder="Start Time"
                  />
                  <Input
                    type="time"
                    name="endTime"
                    required={true}
                    onChange={(e) =>
                      handleSubjectChange(index, "endTime", e.target.value)
                    }
                    value={subject?.endTime}
                    placeholder="End Time"
                  />

                  <Input
                    type="number"
                    name="totalMarks"
                    required={true}
                    onChange={(e) =>
                      handleSubjectChange(index, "totalMarks", e.target.value)
                    }
                    value={subject.totalMarks}
                    placeholder="Total Marks"
                  />

                  <Input
                    type="number"
                    name="passingMarks"
                    required={true}
                    onChange={(e) =>
                      handleSubjectChange(index, "passingMarks", e.target.value)
                    }
                    value={subject.passingMarks}
                    placeholder="Passing Marks"
                  />

                  {/* <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeSubject(index)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      <FaTimesCircle size={20} />
                    </button>
                  </div> */}
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md focus:outline-none disabled:bg-indigo-300 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (editMode ? "Updating Exam..." : "Saving Exam...") : (editMode ? "Update Exam" : "Save Exam")}
            </button>
          </form>
        </div>
      </Modal>
      <ViewExam onEdit={handleEditExam} />
    </div>
  );
}

// import React, {  useState } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { FaPlus, FaTimesCircle } from "react-icons/fa";
// import ViewExam from "./ViewExam";
// import Modal from "../../Dynamic/Modal";
// import Heading2 from "../../Dynamic/Heading2";
// import Input from "../../Dynamic/Input";

// export default function CreateExam() {
//   const { currentColor } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [examId, setExamId] = useState(null);
//   const [examCreated, setExamCreated] = useState(false);
//   const [loading, setLoading] = useState(false);
//     const [modalFormData, setModalFormData] = useState({
//     examName: "",
//     examType: "",
//     className: "",
//     section: "",
//     startDate: "",
//     endDate: "",
//     Grade: "",
//     resultPublishDate: "",
//     subjects: [],
//   });

//   const [filteredSubjects, setFilteredSubjects] = useState([]);

//   const teacherDetails = JSON.parse(sessionStorage.response);
//   const authToken = Cookies.get("token");
//    const handleEditExam = (exam) => {
//     console.log("exam",exam)
//         setEditMode(true);
//          setExamId(exam?._id);
//         setModalOpen(true);
//         setModalFormData({
//             examName: exam?.name || "",
//             examType: exam?.examType || "",
//             className: exam?.className || "",
//             section: exam?.section || "",
//             startDate: exam?.startDate || "",
//             endDate: exam?.endDate || "",
//             Grade: exam?.gradeSystem || "",
//             resultPublishDate: exam?.resultPublishDate || "",
//             subjects: exam?.subjects?.map(subject => ({
//                 name: subject?.name,
//                 examDate: subject?.examDate,
//                 startTime: subject?.startTime,
//                 endTime: subject?.endTime,
//                 totalMarks: subject?.totalMarks,
//                 passingMarks: subject?.passingMarks,
//             })) || [],
//         });
//     };


//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setModalFormData((prevData) => ({ ...prevData, [name]: value }));
//   };

//    const handleSubjectChange = (index, field, value) => {
//      setModalFormData((prevData) => {
//          const updatedSubjects = [...prevData.subjects];
//             updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
//          return { ...prevData, subjects: updatedSubjects };
//          });
//      };

//    const addSubject = () => {
//      setModalFormData((prevData) => ({
//        ...prevData,
//        subjects: [
//          ...prevData.subjects,
//          {
//            name: "",
//            examDate: "",
//            startTime: "",
//            endTime: "",
//            totalMarks: "",
//            passingMarks: "",
//          },
//        ],
//      }));
//     };

//     const removeSubject = (index) => {
//         setModalFormData((prevData) => {
//             const updatedSubjects = prevData.subjects.filter((_, i) => i !== index);
//              return { ...prevData, subjects: updatedSubjects };
//         });
//      };

//   const getAllClasses = async () => {
//     try {
//       let response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );
//      if(response?.data?.success){

//       if (teacherDetails && response.data.classList?.length > 0) {
//         const filteredClass = response.data.classList.find(
//           (cls) =>
//             cls.className === teacherDetails.classTeacher &&
//             cls.sections.includes(teacherDetails.section)
//         );
  
//         if (filteredClass) {
//           const subjectsArray = filteredClass.subjects
//             .split(",")
//             .map((subject) => subject.trim());
//           setFilteredSubjects(subjectsArray);
//         } else {
//           setFilteredSubjects([]);
//         }
//       }
//      }
//     } catch (error) {
//       console.error("Error fetching exams:", error);
//     }
//   };

//   const handleOpenModal = () => {
//     getAllClasses();
//     setModalOpen(true);
//      setEditMode(false); //reset to create mode
//      setModalFormData({
//         examName: "",
//          examType: "",
//         className: "",
//         section: "",
//         startDate: "",
//         endDate: "",
//         Grade: "",
//         resultPublishDate: "",
//         subjects: [],
//     });
// };


//   const handleSubjectNameChange = (index, value) => {
//     handleSubjectChange(index, "name", value);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     if (
//       !modalFormData?.examName ||
//       !modalFormData?.examType ||
//       !teacherDetails?.classTeacher ||
//       !teacherDetails?.section ||
//       !modalFormData?.Grade ||
//       !modalFormData?.startDate ||
//       !modalFormData?.endDate ||
//       !modalFormData?.resultPublishDate
//     ) {
//       toast.error("Please fill in all the required fields!");
//       setLoading(false);
//       return;
//     }
//     let payload = {
//       name: modalFormData?.examName,
//       examType: modalFormData?.examType,
//       className: teacherDetails?.classTeacher,
//       section: teacherDetails?.section,
//       gradeSystem: modalFormData?.Grade,
//       startDate: modalFormData?.startDate,
//       endDate: modalFormData?.endDate,
//       resultPublishDate: modalFormData?.resultPublishDate,
//       subjects: modalFormData?.subjects,
//     };

//       let apiUrl = "https://eserver-i5sm.onrender.com/api/v1/exam/createExams";
//         let method = "post";
//      if (editMode) {
//         apiUrl = `https://eserver-i5sm.onrender.com/api/v1/exam/updateExam/${examId}`;
//         method = "put";
//     }
//     try {
//       await axios[method](
//         apiUrl,
//            payload,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//          setModalFormData({
//             examName: "",
//              examType: "",
//             className: "",
//             section: "",
//             startDate: "",
//             endDate: "",
//             Grade: "",
//             resultPublishDate: "",
//             subjects: [],
//         });
//          setEditMode(false);
//          setExamId(null);
//       toast.success(editMode ? "Exam Updated Successfully!" : "Exam Created Successfully!");
//       setExamCreated(!examCreated);
//       setLoading(false);
//       setModalOpen(false);
//     } catch (error) {
//       setLoading(false);
//       console.log("error", error);
//       toast.error(
//         `Error: ${error?.response?.data?.message || "Something went wrong!"}`
//       );
//     }
//   };


//   return (
//     <div className="px-5">
//       <Heading2 title={"All EXAMS"}>
//         <button
//           onClick={handleOpenModal}
//           className="py-1 p-3 shadow-md  rounded-tl-lg rounded-tr-lg  flex items-center space-x-1 text-white"
//           style={{ background: currentColor }}
//         >
//           {" "}
//           <FaPlus />
//           <span>Create Exam</span>
//         </button>
//       </Heading2>
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={editMode ? "Edit Exam" : "Create Exam"}>
//         <div className=" mx-auto bg-gray-50 p-6  ">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="mt-2 grid sm:grid-cols-3  md:grid-cols-4  lg:grid-cols-3 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md ">
//               <Input
//                 type="text"
//                 name="examName"
//                 required={true}
//                 onChange={handleInputChange}
//                 value={modalFormData?.examName}
//                 placeholder="Exam Name"
//               />

//               <div className="flex flex-col space-y-1 mt-1">
//                 <select
//                   name="examType"
//                   value={modalFormData?.examType}
//                   onChange={handleInputChange}
//                   required
//                   className=" w-full border-1 border-black outline-none py-2 bg-inherit"
//                 >
//                   <option value="">Select Exam Type</option>
//                   <option value="TERM">Term</option>
//                   <option value="UNIT_TEST">Unit Test</option>
//                   <option value="FINAL">Final</option>
//                   <option value="ENTRANCE">Entrance</option>
//                   <option value="COMPETITIVE">Competitive</option>
//                 </select>
//               </div>

//               <div>
//                 <select
//                   name="Grade"
//                   value={modalFormData?.Grade}
//                   onChange={handleInputChange}
//                   required
//                   className=" w-full border-1 border-black outline-none py-2 bg-inherit"
//                 >
//                   <option value="">Grade System</option>
//                   <option value="Percentage">Percentage</option>
//                   <option value="Grade">Grade</option>
//                   <option value="CGPA">CGPA</option>
//                 </select>
//               </div>
//               <Input
//                 type="date"
//                 name="startDate"
//                 required={true}
//                 onChange={handleInputChange}
//                 value={modalFormData?.startDate}
//                 placeholder=" Start Date"
//               />

//               <Input
//                 type="date"
//                 name="endDate"
//                 required={true}
//                 onChange={handleInputChange}
//                 value={modalFormData?.endDate}
//                 placeholder="End Date"
//               />

//               <Input
//                 type="date"
//                 name="resultPublishDate"
//                 required={true}
//                 onChange={handleInputChange}
//                 value={modalFormData?.resultPublishDate}
//                 placeholder="Result Publish Date"
//               />
//             </div>

//             <div>
//               <div className="flex justify-between items-center mb-2">
//                 <h3 className="text-lg font-bold text-gray-800">Subjects</h3>
//                 <button
//                   type="button"
//                   onClick={addSubject}
//                   className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center space-x-1"
//                 >
//                   <FaPlus />
//                   <span>Add Subject</span>
//                 </button>
//               </div>
//               {modalFormData?.subjects?.map((subject, index) => (
//                 <div
//                   key={index}
//                   className="mt-2 grid sm:grid-cols-3  md:grid-cols-6  lg:grid-cols-6 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md "
//                 >
//                   <div>
//                     <select
//                       value={subject?.name}
//                       onChange={(e) =>
//                         handleSubjectNameChange(index, e.target.value)
//                       }
//                       className=" w-full border-1 border-black outline-none py-2 bg-inherit"
//                       required
//                     >
//                       <option value="">Select Subject</option>
//                       {filteredSubjects.map((subjectName) => (
//                         <option key={subjectName} value={subjectName}>
//                           {subjectName}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <Input
//                     type="date"
//                     name="examDate"
//                     required={true}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "examDate", e.target.value)
//                     }
//                     value={subject?.examDate}
//                     placeholder="Exam Date"
//                   />

//                   <Input
//                     type="time"
//                     name="startTime"
//                     required={true}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "startTime", e.target.value)
//                     }
//                     value={subject?.startTime}
//                     placeholder="Start Time"
//                   />
//                   <Input
//                     type="time"
//                     name="endTime"
//                     required={true}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "endTime", e.target.value)
//                     }
//                     value={subject?.endTime}
//                     placeholder="End Time"
//                   />

//                   <Input
//                     type="number"
//                     name="totalMarks"
//                     required={true}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "totalMarks", e.target.value)
//                     }
//                     value={subject.totalMarks}
//                     placeholder="Total Marks"
//                   />

//                   <Input
//                     type="number"
//                     name="passingMarks"
//                     required={true}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "passingMarks", e.target.value)
//                     }
//                     value={subject.passingMarks}
//                     placeholder="Passing Marks"
//                   />

//                   <div className="flex items-center justify-center">
//                     <button
//                       type="button"
//                       onClick={() => removeSubject(index)}
//                       className="text-red-500 hover:text-red-700 focus:outline-none"
//                     >
//                       <FaTimesCircle size={20} />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md focus:outline-none disabled:bg-indigo-300 disabled:cursor-not-allowed"
//               disabled={loading}
//             >
//               {loading ? (editMode ? "Updating Exam..." : "Saving Exam...") :  (editMode ? "Update Exam" : "Save Exam")  }
//             </button>
//           </form>
//         </div>
//       </Modal>
//       <ViewExam  onEdit={handleEditExam} />
//     </div>
//   );
// }



// import React, { useEffect, useState } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { FaPlus, FaTimesCircle } from "react-icons/fa";
// import ViewExam from "./ViewExam";
// import Modal from "../../Dynamic/Modal";
// import Heading2 from "../../Dynamic/Heading2";
// import Input from "../../Dynamic/Input";

// export default function CreateExam() {
//   const { currentColor } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [examId, setExamId] = useState(null);
//   const [examCreated, setExamCreated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [allClass, setAllclass] = useState([]);

//   // **Separate state for modal form data:**
//     const [modalFormData, setModalFormData] = useState({
//     examName: "",
//     examType: "",
//     className: "",
//     section: "",
//     startDate: "",
//     endDate: "",
//     Grade: "",
//     resultPublishDate: "",
//     subjects: [],
//   });
    
//   const [filteredSubjects, setFilteredSubjects] = useState([]);
    
//   const teacherDetails = JSON.parse(sessionStorage.response);
//   const authToken = Cookies.get("token");

//   const handleOpenModal = () => {
//         setModalOpen(true);
//          setEditMode(false); //reset to create mode
//          setModalFormData({
//             examName: "",
//              examType: "",
//             className: "",
//             section: "",
//             startDate: "",
//             endDate: "",
//             Grade: "",
//             resultPublishDate: "",
//             subjects: [],
//         });
//     };
//     const handleEditExam = (exam) => {
//       console.log("exam",exam)
//       setEditMode(true);
//        setExamId(exam?._id);
//        setModalOpen(true);
//      setModalFormData({
//        examName: exam?.name || "an",
//        examType: exam?.examType || "",
//        className: exam?.className || "",
//        section: exam?.section || "",
//        startDate: exam?.startDate?.split("T")[0] || "", // ensure these are formatted
//        endDate: exam?.endDate?.split("T")[0] || "",     // correctly
//        Grade: exam?.gradeSystem || "",
//        resultPublishDate: exam?.resultPublishDate?.split("T")[0] || "",  // And here.
//        subjects: exam?.subjects || [],
//    });
//   };

//   // const handleEditExam = (exam) => {
//   //   setEditMode(true);
//   //   setExamId(exam?._id);
//   //   setModalOpen(true);
//   //     setModalFormData({
//   //       examName: exam?.name || "",
//   //       examType: exam?.examType || "",
//   //       className: exam?.className || "",
//   //       section: exam?.section || "",
//   //       startDate: exam?.startDate.split("T")[0] || "",
//   //       endDate: exam?.endDate.split("T")[0] || "",
//   //       Grade: exam?.gradeSystem || "",
//   //       resultPublishDate: exam?.resultPublishDate?.split("T")[0] || "",
//   //       subjects: exam?.subjects || [],
//   //     });
//   // };
    
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setModalFormData((prevData) => ({ ...prevData, [name]: value }));
//   };

//    const handleSubjectChange = (index, field, value) => {
//      setModalFormData((prevData) => {
//          const updatedSubjects = [...prevData.subjects];
//             updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
//          return { ...prevData, subjects: updatedSubjects };
//          });
//      };

//    const addSubject = () => {
//      setModalFormData((prevData) => ({
//        ...prevData,
//        subjects: [
//          ...prevData.subjects,
//          {
//            name: "",
//            examDate: "",
//            startTime: "",
//            endTime: "",
//            totalMarks: "",
//            passingMarks: "",
//          },
//        ],
//      }));
//     };

//     const removeSubject = (index) => {
//         setModalFormData((prevData) => {
//             const updatedSubjects = prevData.subjects.filter((_, i) => i !== index);
//              return { ...prevData, subjects: updatedSubjects };
//         });
//      };
    
//   const getAllClasses = async () => {
//     try {
//       let response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );
//       setAllclass(response.data.classList);
//     } catch (error) {
//       console.error("Error fetching exams:", error);
//     }
//   };

//   useEffect(() => {
//     getAllClasses();
//   }, []);

//   useEffect(() => {
//     if (teacherDetails && allClass?.length > 0) {
//       const filteredClass = allClass.find(
//         (cls) =>
//           cls.className === teacherDetails.classTeacher &&
//           cls.sections.includes(teacherDetails.section)
//       );

//       if (filteredClass) {
//         const subjectsArray = filteredClass.subjects
//           .split(",")
//           .map((subject) => subject.trim());
//         setFilteredSubjects(subjectsArray);
//       } else {
//         setFilteredSubjects([]);
//       }
//     }
//   }, [allClass, teacherDetails]);

//   const handleSubjectNameChange = (index, value) => {
//     handleSubjectChange(index, "name", value);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     if (
//       !modalFormData?.examName ||
//       !modalFormData?.examType ||
//       !teacherDetails?.classTeacher ||
//       !teacherDetails?.section ||
//       !modalFormData?.Grade ||
//       !modalFormData?.startDate ||
//       !modalFormData?.endDate ||
//       !modalFormData?.resultPublishDate
//     ) {
//       toast.error("Please fill in all the required fields!");
//       setLoading(false);
//       return;
//     }
//     let payload = {
//       name: modalFormData?.examName,
//       examType: modalFormData?.examType,
//       className: teacherDetails?.classTeacher,
//       section: teacherDetails?.section,
//       gradeSystem: modalFormData?.Grade,
//       startDate: modalFormData?.startDate,
//       endDate: modalFormData?.endDate,
//       resultPublishDate: modalFormData?.resultPublishDate,
//       subjects: modalFormData?.subjects,
//     };

//       let apiUrl = "https://eserver-i5sm.onrender.com/api/v1/exam/createExams";
//         let method = "post";
//      if (editMode) {
//         apiUrl = `https://eserver-i5sm.onrender.com/api/v1/exam/updateExam/${examId}`;
//         method = "put";
//     }
//     try {
//       await axios[method](
//         apiUrl,
//            payload,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//          setModalFormData({
//             examName: "",
//              examType: "",
//             className: "",
//             section: "",
//             startDate: "",
//             endDate: "",
//             Grade: "",
//             resultPublishDate: "",
//             subjects: [],
//         });
//          setEditMode(false);
//          setExamId(null);
//       toast.success(editMode ? "Exam Updated Successfully!" : "Exam Created Successfully!");
//       setExamCreated(!examCreated);
//       setLoading(false);
//       setModalOpen(false);
//     } catch (error) {
//       setLoading(false);
//       console.log("error", error);
//       toast.error(
//         `Error: ${error?.response?.data?.message || "Something went wrong!"}`
//       );
//     }
//   };


//   return (
//     <div className="px-5">
//       <Heading2 title={"All EXAMS"}>
//         <button
//           onClick={handleOpenModal}
//           className="py-1 p-3 shadow-md  rounded-tl-lg rounded-tr-lg  flex items-center space-x-1 text-white"
//           style={{ background: currentColor }}
//         >
//           {" "}
//           <FaPlus />
//           <span>Create Exam</span>
//         </button>
//       </Heading2>
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={editMode ? "Edit Exam" : "Create Exam"}>
//         <div className=" mx-auto bg-gray-50 p-6  ">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="mt-2 grid sm:grid-cols-3  md:grid-cols-4  lg:grid-cols-3 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md ">
//               <Input
//                 type="text"
//                 name="examName"
//                 required={true}
//                 onChange={handleInputChange}
//                 value={modalFormData?.examName}
//                 placeholder="Exam Name"
//               />

//               <div className="flex flex-col space-y-1 mt-1">
//                 <select
//                   name="examType"
//                   value={modalFormData?.examType}
//                   onChange={handleInputChange}
//                   required
//                   className=" w-full border-1 border-black outline-none py-2 bg-inherit"
//                 >
//                   <option value="">Select Exam Type</option>
//                   <option value="TERM">Term</option>
//                   <option value="UNIT_TEST">Unit Test</option>
//                   <option value="FINAL">Final</option>
//                   <option value="ENTRANCE">Entrance</option>
//                   <option value="COMPETITIVE">Competitive</option>
//                 </select>
//               </div>

//               <div>
//                 <select
//                   name="Grade"
//                   value={modalFormData?.Grade}
//                   onChange={handleInputChange}
//                   required
//                   className=" w-full border-1 border-black outline-none py-2 bg-inherit"
//                 >
//                   <option value="">Grade System</option>
//                   <option value="Percentage">Percentage</option>
//                   <option value="Grade">Grade</option>
//                   <option value="CGPA">CGPA</option>
//                 </select>
//               </div>
//               <Input
//                 type="date"
//                 name="startDate"
//                 required={true}
//                 onChange={handleInputChange}
//                 value={modalFormData?.startDate}
//                 placeholder=" Start Date"
//               />

//               <Input
//                 type="date"
//                 name="endDate"
//                 required={true}
//                 onChange={handleInputChange}
//                 value={modalFormData?.endDate}
//                 placeholder="End Date"
//               />

//               <Input
//                 type="date"
//                 name="resultPublishDate"
//                 required={true}
//                 onChange={handleInputChange}
//                 value={modalFormData?.resultPublishDate}
//                 placeholder="Result Publish Date"
//               />
//             </div>

//             <div>
//               <div className="flex justify-between items-center mb-2">
//                 <h3 className="text-lg font-bold text-gray-800">Subjects</h3>
//                 <button
//                   type="button"
//                   onClick={addSubject}
//                   className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center space-x-1"
//                 >
//                   <FaPlus />
//                   <span>Add Subject</span>
//                 </button>
//               </div>
//               {modalFormData?.subjects?.map((subject, index) => (
//                 <div
//                   key={index}
//                   className="mt-2 grid sm:grid-cols-3  md:grid-cols-6  lg:grid-cols-6 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md "
//                 >
//                   <div>
//                     <select
//                       value={subject?.name}
//                       onChange={(e) =>
//                         handleSubjectNameChange(index, e.target.value)
//                       }
//                       className=" w-full border-1 border-black outline-none py-2 bg-inherit"
//                       required
//                     >
//                       <option value="">Select Subject</option>
//                       {filteredSubjects.map((subjectName) => (
//                         <option key={subjectName} value={subjectName}>
//                           {subjectName}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <Input
//                     type="date"
//                     name="examDate"
//                     required={true}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "examDate", e.target.value)
//                     }
//                     value={subject?.examDate}
//                     placeholder="Exam Date"
//                   />

//                   <Input
//                     type="time"
//                     name="startTime"
//                     required={true}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "startTime", e.target.value)
//                     }
//                     value={subject?.startTime}
//                     placeholder="Start Time"
//                   />
//                   <Input
//                     type="time"
//                     name="endTime"
//                     required={true}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "endTime", e.target.value)
//                     }
//                     value={subject?.endTime}
//                     placeholder="End Time"
//                   />

//                   <Input
//                     type="number"
//                     name="totalMarks"
//                     required={true}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "totalMarks", e.target.value)
//                     }
//                     value={subject.totalMarks}
//                     placeholder="Total Marks"
//                   />

//                   <Input
//                     type="number"
//                     name="passingMarks"
//                     required={true}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "passingMarks", e.target.value)
//                     }
//                     value={subject.passingMarks}
//                     placeholder="Passing Marks"
//                   />

//                   <div className="flex items-center justify-center">
//                     <button
//                       type="button"
//                       onClick={() => removeSubject(index)}
//                       className="text-red-500 hover:text-red-700 focus:outline-none"
//                     >
//                       <FaTimesCircle size={20} />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md focus:outline-none disabled:bg-indigo-300 disabled:cursor-not-allowed"
//               disabled={loading}
//             >
//               {loading ? (editMode ? "Updating Exam..." : "Saving Exam...") :  (editMode ? "Update Exam" : "Save Exam")  }
//             </button>
//           </form>
//         </div>
//       </Modal>
//       <ViewExam  onEdit={handleEditExam} />
//     </div>
//   );
// }


// import React, { useEffect, useState } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { FaPlus, FaCalendar, FaClock, FaTimesCircle } from "react-icons/fa";
// import ViewExam from "./ViewExam";
// import Modal from "../../Dynamic/Modal";
// import Heading2 from "../../Dynamic/Heading2";
// import Input from "../../Dynamic/Input";

// export default function CreateExam() {
//   const { currentColor, teacherRoleData } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);

//   const handleOpenModal = () => {
//     setModalOpen(true);
//   };
//   const authToken = Cookies.get("token");
//   const [examCreated, setExamCreated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [allClass, setAllclass] = useState([]);
//   const [examData, setExamData] = useState({
//     examName: "",
//     examType: "",
//     className: "",
//     section: "",
//     startDate: "",
//     endDate: "",
//     Grade: "",
//     resultPublishDate: "",
//     subjects: [],
//   });
//   const [filteredSubjects, setFilteredSubjects] = useState([]);
//   const teacherDetails = JSON.parse(sessionStorage.response);
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setExamData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleSubjectChange = (index, field, value) => {
//     const updatedSubjects = [...examData.subjects];
//     updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
//     setExamData((prevData) => ({ ...prevData, subjects: updatedSubjects }));
//   };

//   const addSubject = () => {
//     setExamData((prevData) => ({
//       ...prevData,
//       subjects: [
//         ...prevData.subjects,
//         {
//           name: "",
//           examDate: "",
//           startTime: "",
//           endTime: "",
//           totalMarks: "",
//           passingMarks: "",
//         },
//       ],
//     }));
//   };

//   const getAllClasses = async () => {
//     try {
//       let response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );
//       setAllclass(response.data.classList);
//     } catch (error) {
//       console.error("Error fetching exams:", error);
//     }
//   };

//   useEffect(() => {
//     getAllClasses();
//   }, []);

//   useEffect(() => {
//     if (teacherDetails && allClass?.length > 0) {
//       const filteredClass = allClass.find(
//         (cls) =>
//           cls.className === teacherDetails.classTeacher &&
//           cls.sections.includes(teacherDetails.section)
//       );

//       if (filteredClass) {
//         const subjectsArray = filteredClass.subjects
//           .split(",")
//           .map((subject) => subject.trim());
//         setFilteredSubjects(subjectsArray);
//       } else {
//         setFilteredSubjects([]);
//       }
//     }
//     // }, []);
//   }, [allClass, teacherDetails]);

//   const handleSubjectNameChange = (index, value) => {
//     handleSubjectChange(index, "name", value);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     if (
//       !examData?.examName ||
//       !examData?.examType ||
//       !teacherDetails?.classTeacher ||
//       !teacherDetails?.section ||
//       !examData?.Grade ||
//       !examData?.startDate ||
//       !examData?.endDate ||
//       !examData?.resultPublishDate
//       // ||
//       // examData?.subjects?.length === 0
//     ) {
//       toast.error("Please fill in all the required fields!");
//       setLoading(false);
//       return;
//     }
//     let payload = {
//       name: examData?.examName,
//       examType: examData?.examType,
//       className: teacherDetails?.classTeacher,
//       section: teacherDetails?.section,
//       gradeSystem: examData?.Grade,
//       startDate: examData?.startDate,
//       endDate: examData?.endDate,
//       resultPublishDate: examData?.resultPublishDate,
//       subjects: examData?.subjects,
//     };

//     try {
//       await axios.post(
//         "https://eserver-i5sm.onrender.com/api/v1/exam/createExams",
//            payload,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       setExamData({
//         examName: "",
//         examType: "",
//         startDate: "",
//         endDate: "",
//         resultPublishDate: "",
//         subjects: [],
//         Grade: "",
//       });
//       toast.success("Exam Created Successfully!");
//       setExamCreated(!examCreated);
//       setLoading(false);
//       setModalOpen(false);
//     } catch (error) {
//       setLoading(false);
//       console.log("error", error);
//       toast.error(
//         `Error: ${error?.response?.data?.message || "Something went wrong!"}`
//       );
//     }
//   };
//   const removeSubject = (index) => {
//     const updatedSubjects = examData.subjects.filter((_, i) => i !== index);
//     setExamData((prevData) => ({ ...prevData, subjects: updatedSubjects }));
//   };
//   return (
//     <div className="px-5">
//       <Heading2 title={"All EXAMS"}>
//         <button
//           onClick={handleOpenModal}
//           className="py-1 p-3 shadow-md  rounded-tl-lg rounded-tr-lg  flex items-center space-x-1 text-white"
//           style={{ background: currentColor }}
//         >
//           {" "}
//           <FaPlus />
//           <span>Create Exam</span>
//         </button>
//       </Heading2>
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title="Exam">
//         <div className=" mx-auto bg-gray-50 p-6  ">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="mt-2 grid sm:grid-cols-3  md:grid-cols-4  lg:grid-cols-3 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md ">
//               <Input
//                 type="text"
//                 name="examName"
//                 required={true}
//                 onChange={handleInputChange}
//                 value={examData?.examName}
//                 placeholder="Exam Name"
//               />

//               <div className="flex flex-col space-y-1 mt-1">
//                 <select
//                   name="examType"
//                   value={examData?.examType}
//                   onChange={handleInputChange}
//                   required
//                   className=" w-full border-1 border-black outline-none py-2 bg-inherit"
//                 >
//                   <option value="">Select Exam Type</option>
//                   <option value="TERM">Term</option>
//                   <option value="UNIT_TEST">Unit Test</option>
//                   <option value="FINAL">Final</option>
//                   <option value="ENTRANCE">Entrance</option>
//                   <option value="COMPETITIVE">Competitive</option>
//                 </select>
//               </div>

//               <div>
//                 <select
//                   name="Grade"
//                   value={examData?.Grade}
//                   onChange={handleInputChange}
//                   required
//                   className=" w-full border-1 border-black outline-none py-2 bg-inherit"
//                 >
//                   <option value="">Grade System</option>
//                   <option value="Percentage">Percentage</option>
//                   <option value="Grade">Grade</option>
//                   <option value="CGPA">CGPA</option>
//                 </select>
//               </div>
//               <Input
//                 type="date"
//                 name="startDate"
//                 required={true}
//                 onChange={handleInputChange}
//                 value={examData?.startDate}
//                 placeholder=" Start Date"
//               />

//               <Input
//                 type="date"
//                 name="endDate"
//                 required={true}
//                 onChange={handleInputChange}
//                 value={examData?.endDate}
//                 placeholder="End Date"
//               />

//               <Input
//                 type="date"
//                 name="resultPublishDate"
//                 required={true}
//                 onChange={handleInputChange}
//                 value={examData?.resultPublishDate}
//                 placeholder="Result Publish Date"
//               />
//             </div>

//             <div>
//               <div className="flex justify-between items-center mb-2">
//                 <h3 className="text-lg font-bold text-gray-800">Subjects</h3>
//                 <button
//                   type="button"
//                   onClick={addSubject}
//                   className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center space-x-1"
//                 >
//                   <FaPlus />
//                   <span>Add Subject</span>
//                 </button>
//               </div>
//               {examData?.subjects?.map((subject, index) => (
//                 <div
//                   key={index}
//                   // className="border p-4 mb-2 rounded-md  grid grid-cols-1 md:grid-cols-4 gap-3"
//                   className="mt-2 grid sm:grid-cols-3  md:grid-cols-6  lg:grid-cols-6 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md "
//                 >
//                   <div>
//                     <select
//                       value={subject?.name}
//                       onChange={(e) =>
//                         handleSubjectNameChange(index, e.target.value)
//                       }
//                       className=" w-full border-1 border-black outline-none py-2 bg-inherit"
//                       required
//                     >
//                       <option value="">Select Subject</option>
//                       {filteredSubjects.map((subjectName) => (
//                         <option key={subjectName} value={subjectName}>
//                           {subjectName}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <Input
//                     type="date"
//                     name="examDate"
//                     required={true}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "examDate", e.target.value)
//                     }
//                     value={subject?.examDate}
//                     placeholder="Exam Date"
//                   />

//                   <Input
//                     type="time"
//                     name="startTime"
//                     required={true}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "startTime", e.target.value)
//                     }
//                     value={subject?.startTime}
//                     placeholder="Start Time"
//                   />
//                   <Input
//                     type="time"
//                     name="endTime"
//                     required={true}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "endTime", e.target.value)
//                     }
//                     value={subject?.endTime}
//                     placeholder="End Time"
//                   />

//                   <Input
//                     type="number"
//                     name="totalMarks"
//                     required={true}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "totalMarks", e.target.value)
//                     }
//                     value={subject.totalMarks}
//                     placeholder="Total Marks"
//                   />

//                   <Input
//                     type="number"
//                     name="passingMarks"
//                     required={true}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "passingMarks", e.target.value)
//                     }
//                     value={subject.totalMarks}
//                     placeholder="Passing Marks"
//                   />

//                   <div className="flex items-center justify-center">
//                     <button
//                       type="button"
//                       onClick={() => removeSubject(index)}
//                       className="text-red-500 hover:text-red-700 focus:outline-none"
//                     >
//                       <FaTimesCircle size={20} />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md focus:outline-none disabled:bg-indigo-300 disabled:cursor-not-allowed"
//               disabled={loading}
//             >
//               {loading ? "Saving Exam..." : "Save Exam"}
//             </button>
//           </form>
//         </div>
//       </Modal>
//       <ViewExam />
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import {
//   FaPlus,
//   FaCalendar,
//   FaClock,
//   FaTimesCircle,
// } from "react-icons/fa";
// import ViewExam from "./ViewExam";
// import Modal from "../../Dynamic/Modal";
// import Heading2 from "../../Dynamic/Heading2";

// export default function CreateExam() {
//   const { currentColor, teacherRoleData } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);

//   const handleOpenModal = () => {
//     setModalOpen(true);
//   };
//   const authToken = Cookies.get("token");
//   const [examCreated, setExamCreated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [allClass, setAllclass] = useState([]);
//   const [examData, setExamData] = useState({
//     examName: "",
//     examType: "",
//     className: "",
//     section: "",
//     startDate: "",
//     endDate: "",
//     Grade: "",
//     resultPublishDate: "",
//     subjects: [],
//   });
//   const [filteredSubjects, setFilteredSubjects] = useState([]);
//   const teacherDetails = JSON.parse(sessionStorage.response);
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setExamData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleSubjectChange = (index, field, value) => {
//     const updatedSubjects = [...examData.subjects];
//     updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
//     setExamData((prevData) => ({ ...prevData, subjects: updatedSubjects }));
//   };

//   const addSubject = () => {
//     setExamData((prevData) => ({
//       ...prevData,
//       subjects: [
//         ...prevData.subjects,
//         {
//           name: "",
//           examDate: "",
//           startTime: "",
//           endTime: "",
//           totalMarks: "",
//           passingMarks: "",
//         },
//       ],
//     }));
//   };

//   const getAllClasses = async () => {
//     try {
//       let response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );
//       setAllclass(response.data.classList);
//     } catch (error) {
//       console.error("Error fetching exams:", error);

//     }
//   };

//   useEffect(() => {
//     getAllClasses();
//   }, []);

//   useEffect(() => {
//     if (teacherDetails && allClass?.length > 0) {
//       const filteredClass = allClass.find(
//         (cls) =>
//           cls.className === teacherDetails.classTeacher &&
//           cls.sections.includes(teacherDetails.section)
//       );

//       if (filteredClass) {
//         const subjectsArray = filteredClass.subjects
//           .split(",")
//           .map((subject) => subject.trim());
//         setFilteredSubjects(subjectsArray);
//       } else {
//         setFilteredSubjects([]);
//       }
//     }
//   }, []);
//   // }, [allClass, teacherDetails]);

//   const handleSubjectNameChange = (index, value) => {
//     handleSubjectChange(index, "name", value);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     if (
//       !examData?.examName ||
//       !examData?.examType ||
//       !teacherDetails?.classTeacher ||
//       !teacherDetails?.section ||
//       !examData?.Grade ||
//       !examData?.startDate ||
//       !examData?.endDate ||
//       !examData?.resultPublishDate ||
//       examData?.subjects?.length === 0
//     ) {
//       toast.error("Please fill in all the required fields!");
//       setLoading(false);
//       return;
//     }
//     let payload = {
//       name: examData?.examName,
//       examType: examData?.examType,
//       className: teacherDetails?.classTeacher,
//       section: teacherDetails?.section,
//       gradeSystem: examData?.Grade,
//       startDate: examData?.startDate,
//       endDate: examData?.endDate,
//       resultPublishDate: examData?.resultPublishDate,
//       subjects: examData?.subjects,
//     };

//     try {
//       await axios.post(
//         "https://eserver-i5sm.onrender.com/api/v1/exam/createExams",
//         payload,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       setExamData({
//         examName: "",
//         examType: "",
//         startDate: "",
//         endDate: "",
//         resultPublishDate: "",
//         subjects: [],
//         Grade: "",
//       });
//       toast.success("Exam Created Successfully!");
//       setExamCreated(!examCreated);
//       setLoading(false);
//       setModalOpen(false);
//     } catch (error) {
//       setLoading(false);
//       console.log("error", error);
//       toast.error(
//         `Error: ${error?.response?.data?.message || "Something went wrong!"}`
//       );
//     }
//   };
//   const removeSubject = (index) => {
//     const updatedSubjects = examData.subjects.filter((_, i) => i !== index);
//     setExamData((prevData) => ({ ...prevData, subjects: updatedSubjects }));
//   };
//   return (
//     <div className="px-5">
//     <Heading2 title={ "All EXAMS"}>
//     <button onClick={handleOpenModal}
//        className="py-1 p-3 rounded-tl-lg rounded-tr-lg  flex items-center space-x-1 text-white"
//        style={{ background: currentColor }}
//        >  <FaPlus /><span>Create Exam</span>
//        </button>
//     </Heading2>
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title="Exam">
//       <div className=" mx-auto bg-gray-50 p-6  shadow-xl">

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Exam Name
//             </label>
//             <input
//               type="text"
//               name="examName"
//               value={examData?.examName}
//               onChange={handleInputChange}
//               required
//               className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Exam Type
//             </label>
//             <select
//               name="examType"
//               value={examData?.examType}
//               onChange={handleInputChange}
//               required
//               className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//             >
//               <option value="">Select Exam Type</option>
//               <option value="TERM">Term</option>
//               <option value="UNIT_TEST">Unit Test</option>
//               <option value="FINAL">Final</option>
//               <option value="ENTRANCE">Entrance</option>
//               <option value="COMPETITIVE">Competitive</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Grade System
//             </label>
//             <select
//               name="Grade"
//               value={examData?.Grade}
//               onChange={handleInputChange}
//               required
//               className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//             >
//               <option value="">Grade System</option>
//               <option value="Percentage">Percentage</option>
//               <option value="Grade">Grade</option>
//               <option value="CGPA">CGPA</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Start Date
//             </label>
//             <div className="relative">
//               <input
//                 type="date"
//                 name="startDate"
//                 value={examData?.startDate}
//                 onChange={handleInputChange}
//                 required
//                 className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none pr-10" // Added padding for the icon
//               />
//               <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
//                 <FaCalendar className="text-gray-500" />
//               </div>
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               End Date
//             </label>
//             <div className="relative">
//               <input
//                 type="date"
//                 name="endDate"
//                 value={examData?.endDate}
//                 onChange={handleInputChange}
//                 required
//                 className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none pr-10" // Added padding for the icon
//               />
//               <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
//                 <FaCalendar className="text-gray-500" />
//               </div>
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Result Publish Date
//             </label>
//             <div className="relative">
//               <input
//                 type="date"
//                 name="resultPublishDate"
//                 value={examData?.resultPublishDate}
//                 onChange={handleInputChange}
//                 required
//                 className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none pr-10"
//               />
//               <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
//                 <FaCalendar className="text-gray-500" />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div>
//           <div className="flex justify-between items-center mb-2">
//             <h3 className="text-lg font-bold text-gray-800">Subjects</h3>
//             <button
//               type="button"
//               onClick={addSubject}
//               className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center space-x-1"
//             >
//               <FaPlus />
//               <span>Add Subject</span>
//             </button>
//           </div>
//           {examData?.subjects?.map((subject, index) => (
//             <div
//               key={index}
//               className="border p-4 mb-2 rounded-md  grid grid-cols-1 md:grid-cols-4 gap-3"
//             >
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Subject Name
//                 </label>
//                 <select
//                   value={subject?.name}
//                   onChange={(e) =>
//                     handleSubjectNameChange(index, e.target.value)
//                   }
//                   className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                   required
//                 >
//                   <option value="">Select Subject</option>
//                   {filteredSubjects.map((subjectName) => (
//                     <option key={subjectName} value={subjectName}>
//                       {subjectName}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Exam Date
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="date"
//                     value={subject?.examDate}
//                     onChange={(e) =>
//                       handleSubjectChange(index, "examDate", e.target.value)
//                     }
//                     className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none pr-10"
//                     required
//                   />
//                   <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
//                     <FaCalendar className="text-gray-500" />
//                   </div>
//                 </div>
//               </div>
//               <div className="col-span-2 flex space-x-2">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Start Time
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="time"
//                       value={subject?.startTime}
//                       onChange={(e) =>
//                         handleSubjectChange(index, "startTime", e.target.value)
//                       }
//                       className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none pr-10"
//                       required
//                     />
//                     <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
//                       <FaClock className="text-gray-500" />
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     End Time
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="time"
//                       value={subject?.endTime}
//                       onChange={(e) =>
//                         handleSubjectChange(index, "endTime", e.target.value)
//                       }
//                       className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none pr-10"
//                       required
//                     />
//                     <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
//                       <FaClock className="text-gray-500" />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Total Marks
//                 </label>
//                 <input
//                   type="number"
//                   value={subject.totalMarks}
//                   onChange={(e) =>
//                     handleSubjectChange(index, "totalMarks", e.target.value)
//                   }
//                   className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Passing Marks
//                 </label>
//                 <input
//                   type="number"
//                   value={subject?.passingMarks}
//                   onChange={(e) =>
//                     handleSubjectChange(index, "passingMarks", e.target.value)
//                   }
//                   className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
//                   required
//                 />
//               </div>
//               <div className="flex items-center justify-center">
//                 <button
//                   type="button"
//                   onClick={() => removeSubject(index)}
//                   className="text-red-500 hover:text-red-700 focus:outline-none"
//                 >
//                   <FaTimesCircle size={20} />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md focus:outline-none disabled:bg-indigo-300 disabled:cursor-not-allowed"
//           disabled={loading}
//         >
//           {loading ? "Saving Exam..." : "Save Exam"}
//         </button>
//       </form>
//     </div>
//       </Modal>
//     <ViewExam/>
//     </div>
//   );
// }
