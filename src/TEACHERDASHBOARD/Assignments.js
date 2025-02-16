import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useStateContext } from "../contexts/ContextProvider";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Heading2 from "../Dynamic/Heading2";
import Modal from "../Dynamic/Modal";
import Tables from "../Dynamic/Tables";
import Button from "../Dynamic/utils/Button";
const authToken = Cookies.get("token");
const Api_Create =
  "https://eserver-i5sm.onrender.com/api/v1/adminRoute/createAssignment";

const Assignments = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };
  
  const [classData, setClassData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const { teacherRoleData } = useStateContext();
 

  const [assignmentDeleted, setAssignmentDeleted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    className: "",
    section: [],
    subject: [],
    image: null,
  });
  const [assignmentData, setAssignmentsData] = useState([]);
  const [shouldFetchData, setShouldFetchData] = useState(false);
  useEffect(() => {
    axios
      .get(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const { classList } = response.data;
      
        setClassData(classList);
      })
      .catch((error) => {
        console.error("Error fetching class data:", error);
      });
  }, [authToken]);

 

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("dueDate", new Date().toISOString().split("T")[0]);
    
    formDataToSend.append("image", formData.image);
   
    formDataToSend.append("className", teacherRoleData.classTeacher);
   
    formDataToSend.append("section", teacherRoleData.section);
    
    formDataToSend.append("subject", selectedSubject);
    setLoading(true);
    axios
      .post(Api_Create, formDataToSend, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          className: "",
          section: "",
          subject: "",
          image: null,
        });
        setModalOpen(false);
        setShouldFetchData(!shouldFetchData);
       
        setSelectedSubject("");
        setLoading(false);
        toast.success("Created successfully");
      })
      .catch((error) => {
        setLoading(false);
    
        if (error.response && error.response.data && error.response.data.message) {
            toast.error(`Error: ${error.response.data.message}`);
        } else {
            toast.error("Error: Something went wrong!");
        }
        console.error("Error creating assignment:", error);
    });

  };


  useEffect(() => {
    axios
      .get(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllAssignment",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const { allAssignment } = response.data;
        setAssignmentsData(allAssignment);
      })
      .catch((error) => {
        console.error("Error fetching class data:", error);
      });
  }, [shouldFetchData, assignmentDeleted]);

  const handleDeleteAssignment = (index) => {
    const assignmentId = assignmentData[index]._id;
    axios
      .delete(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/deleteAssignment/" +
          assignmentId,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then(() => {
        setAssignmentDeleted(!assignmentDeleted);
        const updatedAssignments = [...assignmentData];
        updatedAssignments.splice(index, 1);
        setAssignmentsData(updatedAssignments);
        toast.success("Deleted Assignment")
      })
      .catch((error) => {
        console.error("Error deleting assignment:", error);
      });
  };

  const THEAD = [
   
    "Title",
    "Description",
    "Date",
    "Class",
    "Section",
    "Subject",
    "File",
    "Actions",
  ];

  return (
    <div className="mx-5">
    <Heading2 title={"Create Homework Assignment"}>

    </Heading2>
    <Button name="Create Assignment" onClick={handleOpenModal}/>
   
    <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={"Create Assignment"}>
      <form onSubmit={handleSubmit} className="bg-gray-100">
        <div className="grid md:grid-cols-3 grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-2 px-5 pb-2">
         

          <div className="">
            <label className="block mb-2">Subject:</label>
            <select
              value={selectedSubject}
              onChange={handleSubjectChange}
              className="p-2 border w-full"
            >
              <option value="">Select Subject</option>
              {classData
                .filter((classItem) => classItem.className === teacherRoleData.classTeacher)
                .flatMap((classItem) =>
                  classItem?.subjects?.split(",").map((subject, index) => (
                    <option key={index} value={subject.trim()}>
                      {subject.trim()}
                    </option>
                  ))
                )}
            </select>
          </div>
          

          <div className="">
            <label
              htmlFor="title"
              className="text-sm font-medium text-gray-600 block  mb-3"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              className="w-full p-2  border  focus:outline-none focus:border-indigo-500"
              placeholder="Enter assignment title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div className="">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-600 block  mb-3"
            >
              Description
            </label>
            <textarea
              id="description"
              className="w-full p-2 border  focus:outline-none focus:border-indigo-500"
              placeholder="Enter assignment description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>
          
          <div className="">
            <label
              htmlFor="pdfFile"
              className="text-sm font-medium text-gray-600 block  mb-3"
            >
              Upload PDF
            </label>
            <input
              type="file"
              accept=".pdf"
              id="pdfFile"
              className="w-full p-2 border focus:outline-none focus:border-indigo-500"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <div className=" text-end mb-2 px-5">
        <Button name="Submit" onClick={handleSubmit} type="submit" width="full"/>
          
         
        </div>
      </form>
      </Modal>
    
     
      <div className="">
      

        {/* <div className="overflow-x-auto"> */}
          <Tables
          
          thead={THEAD}
          tbody={assignmentData.map((val, index) => ({
              
            "Title": val?.title,
            "Description": val?.description,
            "Date":(new Date(val.dueDate).toLocaleDateString("en-GB")),
            "Class": val?.className,
            "Section": val?.section,
            "Subject": val?.subject,
            "File":  <a
            href={val.file.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open File
          </a>,
            "Actions": <button
            onClick={() => handleDeleteAssignment(index)}
            className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
          >
            Delete
          </button>
          }))}
          />
        </div>
      </div>
    // </div>
  );
};

export default Assignments;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { useStateContext } from "../contexts/ContextProvider";
// const authToken = Cookies.get("token");

// const Api_Create =
//   "https://eserver-i5sm.onrender.com/api/v1/adminRoute/createAssignment";
// const Api_Update =
//   "https://eserver-i5sm.onrender.com/api/v1/adminRoute/updateAssignment/";
// const Api_GetAssiignment =
//   "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllAssignment";
// const Api_GetAll =
//   // "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClass";
//   "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses";
// const API_DELETE =
//   "https://eserver-i5sm.onrender.com/api/v1/adminRoute/deleteAssignment/6538e0fb0c6aa38bbddec27b";

// const Assignments = () => {
//   const { currentColor} = useStateContext();
//   const [data, setData] = useState([]);
//   const [selectedGrade, setSelectedGrade] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const [selectedSubject, setSelectedSubject] = useState("");

//   const [assignmentDeleted, setAssignmentDeleted] = useState(false);

//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     dueDate: "",
//     className: "",
//     section: [],
//     subject: [],
//     image: null,
//   });
//   const [assignmentData, setAssignmentsData] = useState([]);
//   const [shouldFetchData, setShouldFetchData] = useState(false);
//   const [showAssignment, setShowAssignment] = useState(false);

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setFormData({ ...formData, image: file });
//   };

//   const handleGradeChange = (e) => {
//     const selectedGrade = e.target.value;
//     setSelectedGrade(selectedGrade);

//     // Set the selected grade's courses in the form data
//     const selectedClass = data.find((item) => item.className === selectedGrade);

//     if (selectedClass) {
//       // setFormData({ ...formData, className: selectedGrade, section:selectedClass.section.join(','), course: selectedClass.subject.join(',') });
//       setFormData({
//         ...formData,
//         className: selectedGrade,
//         section: selectedClass.section,
//         subject: selectedClass.subject,
//       });
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const formDataToSend = new FormData();
//     formDataToSend.append("title", formData.title);
//     formDataToSend.append("description", formData.description);
//     formDataToSend.append("dueDate", formData.dueDate);
//     formDataToSend.append("image", formData.image);
//     formDataToSend.append("className", formData.className);
//     formDataToSend.append("section", formData.section);
//     formDataToSend.append("subject", formData.subject);

//     axios
//       .post(Api_Create, formDataToSend, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//           "Content-Type": "multipart/form-data",
//         },
//       })
//       .then((response) => {
//         setFormData({
//           title: "",
//           description: "",
//           dueDate: "",
//           className: "",
//           section: "",
//           subject: "",
//           image: null,
//         });
//         setShouldFetchData(!shouldFetchData);
//         setSelectedGrade("");
//         setSelectedSection("");
//         setSelectedSubject("");
//       })
//       .catch((error) => {
//         console.error("Error creating assignment:", error);
//       });
//   };

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses",
//         // "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClass",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const { classList } = response.data;
//         console.log("GetALLCLASS--->", classList);
//         setData(classList);
//       })
//       .catch((error) => {
//         console.error("Error fetching class data:", error);
//       });
//   }, []);

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllAssignment",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         console.log("DATA-->", response.data);
//         const { allAssignment } = response.data;
//         console.log("GetALLCLASS--->", allAssignment);
//         setAssignmentsData(allAssignment);
//       })
//       .catch((error) => {
//         console.error("Error fetching class data:", error);
//       });
//   }, [shouldFetchData, assignmentDeleted]);

//   const handleDeleteAssignment = (index) => {
//     const assignmentId = assignmentData[index]._id;
//     axios
//       .delete(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/deleteAssignment/" +
//           assignmentId,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then(() => {
//         setAssignmentDeleted(!assignmentDeleted);
//         const updatedAssignments = [...assignmentData];
//         updatedAssignments.splice(index, 1);
//         setAssignmentsData(updatedAssignments);
//       })
//       .catch((error) => {
//         console.error("Error deleting assignment:", error);
//       });
//   };

//   const handleSectionChange = (e) => {
//     console.log(data);
//     const selectedSection = e.target.value;
//     setSelectedSection(selectedSection);
//     setFormData({ ...formData, section: [selectedSection] });
//   };

//   const handleSubjectChange = (e) => {
//     const selectedSubject = e.target.value;
//     setSelectedSubject(selectedSubject);
//     setFormData({ ...formData, subject: [selectedSubject] });
//   };

//   console.log(assignmentData);
//   return (
//     <>
//       <div className="p-6 w-full max-w-md mx-auto  rounded-md shadow-md"
//       // style={{background:currentColor}}
//       >
//         <h1 className="text-xl font-bold mb-4 uppercase text-center  hover-text "
//         style={{color:currentColor}}
//         >
//           Create Homework Assignment
//         </h1>
//         <form onSubmit={handleSubmit}>
//           <div className="grid md:grid-cols-2 gap-2">
//             <div className="mb-4">
//               <label
//                 htmlFor="classValue"
//                 className="text-sm font-medium text-gray-600 block"
//               >
//                 Class
//               </label>

//               <select
//                 className="w-full p-2 rounded-md border border-indigo-200 focus:outline-none focus:border-indigo-500"
//                 value={selectedGrade}
//                 onChange={handleGradeChange}
//               >
//                 <option value="">Select Grade</option>
//                 {/* {data.map((item) => (
//                   <option key={item.className} value={item.className}>
//                     {item.className}
//                   </option>
//                 ))} */}
//                 {data
//                   .slice()
//                   .sort(
//                     (a, b) =>
//                       parseInt(a.className, 10) - parseInt(b.className, 10)
//                   )
//                   .map((item) => (
//                     <option key={item.className} value={item.className}>
//                       {item.className}
//                     </option>
//                   ))}
//               </select>
//             </div>
//             <div className="mb-4">
//               <label
//                 htmlFor="section"
//                 className="text-sm font-medium text-gray-600 block"
//               >
//                 Section
//               </label>

//               <select
//                 id="section"
//                 className="w-full p-2 rounded-md border border-indigo-200 focus:outline-none focus:border-indigo-500"
//                 value={selectedSection}
//                 onChange={handleSectionChange}
//               >
//                 <option value="">Select Section</option>
//                 {selectedGrade &&
//                   data
//                     .find((item) => item.className === selectedGrade)
//                     .section.map((item, index) => {
//                       console.log(item); // Log each item to the console
//                       return (
//                         <option key={index} value={item}>
//                           {item}
//                         </option>
//                       );
//                     })}
//               </select>
//             </div>

//             <div className="mb-4">
//               <label
//                 htmlFor="subjectValue"
//                 className="text-sm font-medium text-gray-600 block"
//               >
//                 Subject
//               </label>

//               <select
//                 className="w-full p-2 rounded-md border border-indigo-200 focus:outline-none focus:border-indigo-500"
//                 value={selectedSubject}
//                 onChange={handleSubjectChange}
//               >
//                 <option value="">Select Subject</option>
//                 {selectedGrade &&
//                   data
//                     .find((item) => item.className === selectedGrade)
//                     .subject.map((item, index) => {
//                       let str = item;
//                       let result_array = str.split(',');

//                       return result_array.map((data, subIndex) => (
//                         <option key={index + subIndex} value={data}>
//                           {data}
//                         </option>
//                       ));

// })}
//               </select>
//             </div>

//             <div className="mb-4">
//               <label
//                 htmlFor="title"
//                 className="text-sm font-medium text-gray-600 block"
//               >
//                 Title
//               </label>
//               <input
//                 type="text"
//                 id="title"
//                 className="w-full p-2 rounded-md border border-indigo-200 focus:outline-none focus:border-indigo-500"
//                 placeholder="Enter assignment title"
//                 value={formData.title}
//                 onChange={(e) =>
//                   setFormData({ ...formData, title: e.target.value })
//                 }
//                 required
//               />
//             </div>
//             <div className="mb-4">
//               <label
//                 htmlFor="description"
//                 className="text-sm font-medium text-gray-600 block"
//               >
//                 Description
//               </label>
//               <textarea
//                 id="description"
//                 className="w-full p-2 rounded-md border border-indigo-200 focus:outline-none focus:border-indigo-500"
//                 placeholder="Enter assignment description"
//                 value={formData.description}
//                 onChange={(e) =>
//                   setFormData({ ...formData, description: e.target.value })
//                 }
//                 required
//               />
//             </div>
//             <div className="mb-4">
//               <label
//                 htmlFor="dueDate"
//                 className="text-sm font-medium text-gray-600 block"
//               >
//                 Due Date
//               </label>
//               <input
//                 type="date"
//                 id="dueDate"
//                 className="w-full p-2 rounded-md border border-indigo-200 focus:outline-none focus:border-indigo-500"
//                 value={formData.dueDate}
//                 onChange={(e) =>
//                   setFormData({ ...formData, dueDate: e.target.value })
//                 }
//                 required
//               />
//             </div>
//             <div className="mb-4">
//               <label
//                 htmlFor="pdfFile"
//                 className="text-sm font-medium text-gray-600 block"
//               >
//                 Upload PDF
//               </label>
//               <input
//                 type="file"
//                 accept=".pdf"
//                 id="pdfFile"
//                 className="w-full p-2 rounded-md border border-indigo-200 focus:outline-none focus:border-indigo-500"
//                 onChange={handleFileChange}
//               />
//             </div>
//           </div>
//           {/* Existing input fields for title, description, dueDate, and pdfFile go here */}
//          <div className="w-full text-center">
//          <button
//             onclick={handleSubmit}
//             type="submit"
//             className="dark:text-white dark:bg-secondary-dark-bg text-gray-800   mx-auto neu-btn border-2 "
//             style={{border:`2px solid ${currentColor} `,color:currentColor}}
//         // style={{color:currentColor}}
//           >
//             Create Assignment
//           </button>
//          </div>
//         </form>
//       </div>
//       <div className="mt-4 p-3">
//         <h2 className="text-lg font-semibold text-cyan-700 text-center uppercase my-3">
//           Created Assignments
//         </h2>

//         <div className="overflow-x-auto">
//           <table className="min-w-full  rounded-md border-collapse">
//             <thead className=" bg-cyan-600 text-white ">
//               <tr className="border">
//                 <th className="p-4 border">Title</th>
//                 <th className="p-4 border">Description</th>
//                 <th className="p-4 border">Due Date</th>
//                 <th className="p-4 border">Class</th>
//                 <th className="p-4 border">Section</th>
//                 <th className="p-4 border">Subject</th>
//                 <th className="p-4 border">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {assignmentData.map((item, index) => (
//                 <tr key={index} className="border text-center">
//                   <td className="p-4 border">{item.title}</td>
//                   <td className="p-4 border">{item.description}</td>
//                   <td className="p-4 border">{item.dueDate}</td>
//                   <td className="p-4 border">{item.className}</td>
//                   <td className="p-4 border">{item.section}</td>
//                   <td className="p-4 border">{item.subject}</td>
//                   <td className="p-4 border">
//                     <button
//                       onClick={() => handleDeleteAssignment(index)}
//                       className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Assignments;
