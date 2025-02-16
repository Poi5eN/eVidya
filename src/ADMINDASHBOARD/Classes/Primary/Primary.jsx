import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import NoDataFound from "../../../../src/NoDataFound";
import Modal from "react-modal";
import axios from "axios";
import "../../../Dynamic/Form/FormStyle.css";
import DynamicDataTable from "./DataTable";
import InputForm from "../../../Dynamic/Form/InputForm";
import { useStateContext } from "../../../contexts/ContextProvider";
import Cookies from "js-cookie";
import { Button } from "@mui/material";

function Primary() {
  const authToken = Cookies.get("token");
  const { currentColor } = useStateContext();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    className: "NURSERY",
    subjects: ["HINDI", "ENGLISH", "MATHS"],
    sections: ["A"],
  });
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  // const [createBookDependency, setCreateBookDependency] = useState(false);
  useEffect(() => {
    axios
      .get(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        setSubmittedData(response.data.classList);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);
  // }, [createBookDependency]);

  const handleFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const handleImageChange = (e) => {
    const name = e.target.name;
    const file = e.target.files[0];

    setFormData({
      ...formData,
      [name]: file,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Ensure subjects and sections are arrays before converting to strings
      const formattedFormData = {
        ...formData,
        subjects: Array.isArray(formData.subjects)
          ? formData.subjects.join(",")
          : formData.subjects,
        sections: Array.isArray(formData.sections)
          ? formData.sections.join(",")
          : formData.sections,
      };

      axios
        .post(
          "https://eserver-i5sm.onrender.com/api/v1/adminRoute/createClass",
          formattedFormData,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        )
        .then((response) => {
          setFormData({
            className: "",
            subjects: "",
            sections: "",
          });

          setSubmittedData([...submittedData, formData]);
          setLoading(false);
          toast.success("Form submitted successfully!");
          setIsOpen(false);
          // setCreateBookDependency(!createBookDependency);
        })
        .catch((error) => {
          // toast.error(error.response.data?.message);
          setLoading(false);
        });
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while submitting the form.");
    }
  };
  const handleDelete = async (classId) => {
    try {
      await axios.delete(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deleteClass/${classId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setSubmittedData((prevData) =>
        prevData.filter((item) => item._id !== classId)
      );
      // setCreateBookDependency(!createBookDependency);

      toast.success("Class data deleted successfully");
    } catch (error) {
      console.error("Error deleting class data:", error);
      toast.error("An error occurred while deleting the class data.");
    }
  };

  const formFields = [
    {
      label: "Class",
      name: "className",
      type: "select",
      value: formData.className,
      required: true,
      selectOptions: [
        "KG",
        "NURSERY",
        "LKG",
        "UKG",
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
        "XII",
      ],
    },
    // {
    //   label: "Class",
    //   name: "className",
    //   type: "text",
    //   value: Array.isArray(formData.className)
    //     ? formData.className.join(",")
    //     : formData.className,
    // },
    {
      label: "Subjects",
      name: "subjects",
      type: "text",
      value: Array.isArray(formData.subjects)
        ? formData.subjects.join(",")
        : formData.subjects,
    },
    {
      label: "Sections",
      name: "sections",
      type: "text",
      value: Array.isArray(formData.sections)
        ? formData.sections.join(",")
        : formData.sections,
    },
  ];

  return (
    <div className="md:h-screen mt-12 md:mt-1 mx-auto p-3">
      <h1
        className="text-4xl font-bold mb-4 uppercase text-center hover-text"
        style={{ color: currentColor }}
      >
        Class
      </h1>
      <Button
        onClick={toggleModal}
        variant="contained"
        style={{ color: "white", backgroundColor: currentColor }}
      >
        Add Class
      </Button>
      {isOpen && (
        <div
          id="default-modal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
        >
          <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
            <div className="relative rounded-lg shadow dark:bg-gray-700 overflow-auto">
              <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 bg-white">
                <h3 className="text-xl font-semibold dark:text-white">
                  Add Class
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
              <div className="max-h-[80vh] sm:max-h-[70vh] md:max-h-[70vh] lg:max-h-[70vh] overflow-auto bg-gray-50">
                <div className="p-4 md:p-5 space-y-4">
                  <InputForm
                    fields={formFields}
                    handleChange={handleFieldChange}
                    handleImageChange={handleImageChange}
                  />
                  <div className="md:col-span-6 text-right mt-3">
                    <div className="flex items-center gap-5 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                      <Button
                        type="submit"
                        variant="contained"
                        onClick={handleSubmit}
                        style={{
                          backgroundColor: currentColor,
                          color: "white",
                          width: "100%",
                        }}
                      >
                        {loading ? (
                          <svg
                            aria-hidden="true"
                            className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08163 50.5908C9.08163 73.204 27.3868 91.5092 50 91.5092C72.6132 91.5092 90.9184 73.204 90.9184 50.5908C90.9184 27.9775 72.6132 9.67233 50 9.67233C27.3868 9.67233 9.08163 27.9775 9.08163 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7234 75.2124 7.41289C69.5422 4.10237 63.2754 1.94025 56.7335 1.05126C51.7666 0.367443 46.7499 0.446768 41.8068 1.27873C39.3253 1.69428 37.861 4.19778 38.4981 6.62326C39.1352 9.04874 41.608 10.4717 44.1142 10.1071C47.851 9.53541 51.6815 9.5263 55.4424 10.0864C60.8782 10.8666 66.0928 12.719 70.7544 15.5537C75.416 18.3885 79.429 22.1352 82.5849 26.5826C84.9175 29.7395 86.7991 33.2084 88.1812 36.8895C89.0839 39.2648 91.5423 40.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                        ) : (
                          "Submit"
                        )}
                      </Button>
                      <Button
                        variant="contained"
                        onClick={toggleModal}
                        style={{
                          backgroundColor: "#616161",
                          color: "white",
                          width: "100%",
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div>
        {submittedData.length > 0 ? (
          <DynamicDataTable
            data={submittedData}
            loading={loading}
            handleDelete={handleDelete}
          />
        ) : (
          <NoDataFound />
        )}
      </div>
    </div>
  );
}

export default Primary;
// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import ErrorPage from "../../../../src/ErrorPage";
// import Modal from "react-modal";
// import axios from "axios";
// import "../../../Dynamic/Form/FormStyle.css";
// import DynamicDataTable from "./DataTable";
// import InputForm from "../../../Dynamic/Form/InputForm";
// import { useStateContext } from "../../../contexts/ContextProvider";
// import Cookies from "js-cookie";
// import { Button } from "@mui/material";

// function Primary() {
//   const authToken = Cookies.get("token");
//   const { currentColor } = useStateContext();

//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     className: "NURSERY",
//     subjects: ["HINDI", "ENGLISH", "MATHS"],
//     sections: ["A"],
//   });
//   const [submittedData, setSubmittedData] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };

//   // const [createBookDependency, setCreateBookDependency] = useState(false);
//   useEffect(() => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setSubmittedData(response.data.classList);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   }, []);
//   // }, [createBookDependency]);

//   const handleFieldChange = (fieldName, value) => {
//     setFormData({
//       ...formData,
//       [fieldName]: value,
//     });
//   };

//   const handleImageChange = (e) => {
//     const name = e.target.name;
//     const file = e.target.files[0];

//     setFormData({
//       ...formData,
//       [name]: file,
//     });
//   };

//   const handleSubmit = async () => {
//     try {
//       setLoading(true);

//       // Ensure subjects and sections are arrays before converting to strings
//       const formattedFormData = {
//         ...formData,
//         subjects: Array.isArray(formData.subjects)
//           ? formData.subjects.join(",")
//           : formData.subjects,
//         sections: Array.isArray(formData.sections)
//           ? formData.sections.join(",")
//           : formData.sections,
//       };

//       axios
//         .post(
//           "https://eserver-i5sm.onrender.com/api/v1/adminRoute/createClass",
//           formattedFormData,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           setFormData({
//             className: "",
//             subjects: "",
//             sections: "",
//           });

//           setSubmittedData([...submittedData, formData]);
//           setLoading(false);
//           toast.success("Form submitted successfully!");
//           setIsOpen(false);
//           // setCreateBookDependency(!createBookDependency);
//         })
//         .catch((error) => {
//           // toast.error(error.response.data?.message);
//           setLoading(false);
//         });
//     } catch (error) {
//       console.error("Error:", error);
//       toast.error("An error occurred while submitting the form.");
//     }
//   };
//   const handleDelete = async (classId) => {
//     try {

//      await axios.delete(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deleteClass/${classId}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       setSubmittedData((prevData) =>
//         prevData.filter((item) => item._id !== classId)
//       );
//       // setCreateBookDependency(!createBookDependency);

//       toast.success("Class data deleted successfully");
//     } catch (error) {
//       console.error("Error deleting class data:", error);
//       toast.error("An error occurred while deleting the class data.");
//     }
//   };

//   const formFields = [
//     {
//       label: "Class",
//       name: "className",
//       type: "select",
//       value: formData.className,
//       required: true,
//       selectOptions: [
//         "NURSERY",
//         "LKG",
//         "UKG",
//         "1",
//         "2",
//         "3",
//         "4",
//         "5",
//         "6",
//         "7",
//         "8",
//         "9",
//         "10",
//         "11",
//         "12",
//       ],
//     },
//     {
//       label: "Subjects",
//       name: "subjects",
//       type: "text",
//       value: Array.isArray(formData.subjects)
//         ? formData.subjects.join(",")
//         : formData.subjects,
//     },
//     {
//       label: "Sections",
//       name: "sections",
//       type: "text",
//       value: Array.isArray(formData.sections)
//         ? formData.sections.join(",")
//         : formData.sections,
//     },
//   ];

//   return (
//     <div className="mt-12 md:mt-1 mx-auto p-3">
//       <h1
//         className="text-4xl font-bold mb-4 uppercase text-center hover-text"
//         style={{ color: currentColor }}
//       >
//         Class
//       </h1>
//       <Button
//         onClick={toggleModal}
//         variant="contained"
//         style={{ color: "white", backgroundColor: currentColor }}
//       >
//         Add Class
//       </Button>
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
//             <div className="relative rounded-lg shadow dark:bg-gray-700 overflow-auto">
//               <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 bg-white">
//                 <h3 className="text-xl font-semibold dark:text-white">
//                   Add Class
//                 </h3>
//                 <button
//                   onClick={toggleModal}
//                   type="button"
//                   className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                 >
//                   <svg
//                     className="w-3 h-3"
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 14 14"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
//                     />
//                   </svg>
//                   <span className="sr-only">Close modal</span>
//                 </button>
//               </div>
//               <div className="max-h-[80vh] sm:max-h-[70vh] md:max-h-[70vh] lg:max-h-[70vh] overflow-auto bg-gray-50">
//                 <div className="p-4 md:p-5 space-y-4">
//                   <InputForm
//                     fields={formFields}
//                     handleChange={handleFieldChange}
//                     handleImageChange={handleImageChange}
//                   />
//                   <div className="md:col-span-6 text-right mt-3">
//                     <div className="flex items-center gap-5 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
//                       <Button
//                         type="submit"
//                         variant="contained"
//                         onClick={handleSubmit}
//                         style={{
//                           backgroundColor: currentColor,
//                           color: "white",
//                           width: "100%",
//                         }}
//                       >
//                         {loading ? (
//                           <svg
//                             aria-hidden="true"
//                             className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
//                             viewBox="0 0 100 101"
//                             fill="none"
//                             xmlns="http://www.w3.org/2000/svg"
//                           >
//                             <path
//                               d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08163 50.5908C9.08163 73.204 27.3868 91.5092 50 91.5092C72.6132 91.5092 90.9184 73.204 90.9184 50.5908C90.9184 27.9775 72.6132 9.67233 50 9.67233C27.3868 9.67233 9.08163 27.9775 9.08163 50.5908Z"
//                               fill="currentColor"
//                             />
//                             <path
//                               d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7234 75.2124 7.41289C69.5422 4.10237 63.2754 1.94025 56.7335 1.05126C51.7666 0.367443 46.7499 0.446768 41.8068 1.27873C39.3253 1.69428 37.861 4.19778 38.4981 6.62326C39.1352 9.04874 41.608 10.4717 44.1142 10.1071C47.851 9.53541 51.6815 9.5263 55.4424 10.0864C60.8782 10.8666 66.0928 12.719 70.7544 15.5537C75.416 18.3885 79.429 22.1352 82.5849 26.5826C84.9175 29.7395 86.7991 33.2084 88.1812 36.8895C89.0839 39.2648 91.5423 40.6781 93.9676 39.0409Z"
//                               fill="currentFill"
//                             />
//                           </svg>
//                         ) : (
//                           "Submit"
//                         )}
//                       </Button>
//                       <Button
//                         variant="contained"
//                         onClick={toggleModal}
//                         style={{
//                           backgroundColor: "#616161",
//                           color: "white",
//                           width: "100%",
//                         }}
//                       >
//                         Cancel
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//       <div>
//        { submittedData ? ( <DynamicDataTable
//          data={submittedData}
//          loading={loading}
//          handleDelete={handleDelete}
//        />):(<ErrorPage/>)

//        }
//       </div>
//     </div>
//   );
// }

// export default Primary;
