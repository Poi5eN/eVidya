import React, { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider.js";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

import Modal from "../../Dynamic/Modal.jsx";
import Button from "../../Dynamic/utils/Button.jsx";
import { StudentCreateRegistrations } from "../../Network/AdminApi.js";

const RegForm = ({ refreshRegistrations }) => {
  const authToken = Cookies.get("token");
  const [modalOpen, setModalOpen] = useState(false);
  const { currentColor } = useStateContext();
  const [loading, setLoading] = useState(false);
  const [getClass, setGetClass] = useState([]);

  const initialData = {
    studentFullName: "",
    guardianName: "",
    studentEmail: "@gmail.com",
    studentAddress: "",
    mobileNumber: "",
    registerClass: "NURSERY",
    gender: "Male",
    amount: "",
  };
  const [formData, setFormData] = useState(initialData);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };
// const createStudent=async()=>{
//   setLoading(true);
//   try {
//     const response=await StudentCreateRegistrations(formData)
//     console.log("response",response)
//     if(response?.success){
//       toast.success(response.message)
//       setFormData(initialData);
//       setModalOpen(false);
//       refreshRegistrations();
//       setLoading(false);
//     }
//     else{
//       toast.error(response.message)
//       setLoading(false);
//     }
//   } catch (error) {
//     console.log("error",error)
//   }
// }



  const postData = async () => {
    try {
      setLoading(true);
    const response=  await axios.post(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/createRegistration",
        formData,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log("response",response)
      toast.success("Created successfully!");
      setFormData(initialData);
      setModalOpen(false);
      refreshRegistrations();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get("https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((response) => {
        console.log(response.data);
        setGetClass(response.data.classList || []);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    postData();
    // createStudent()
  };

  return (
    <>
      {/* <Button onClick={toggleModal} variant="contained" style={{ backgroundColor: currentColor }}>
        New Registration
      </Button> */}
      <Button  name=" New Registration" onClick={toggleModal}  />

      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={"Create "}>
      <form
                  onSubmit={handleSubmit}
                  className=" dark:text-white dark:bg-secondary-dark-bg bg-gray-50 p-2 "
                >
                  <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3 ">
                    <div className="lg:col-span-6">
                      <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6 ">
                        <div className="md:col-span-3 ">
                          <label htmlFor="studentFullName">Full Name</label>
                          <input
                            type="text"
                            name="studentFullName"
                            id="studentFullName"
                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                            value={formData.studentFullName}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label htmlFor="fatherName">Guardian's Name</label>
                          <input
                            type="text"
                            name="guardianName"
                            id="guardianName"
                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                            value={formData.guardianName}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="md:col-span-6">
                          <label htmlFor="studentEmail">Email Address</label>
                          <input
                            type="email"
                            name="studentEmail"
                            id="studentEmail"
                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                            value={formData.studentEmail}
                            onChange={handleChange}
                            placeholder="email@domain.com"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label htmlFor="studentAddress">
                            Address / Street
                          </label>
                          <input
                            type="text"
                            name="studentAddress"
                            id="studentAddress"
                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                            value={formData.studentAddress}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label htmlFor="mobileNumber">Mobile</label>
                          <input
                            type="number"
                            name="mobileNumber"
                            id="mobileNumber"
                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            maxLength="10"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label htmlFor="registerClass">Class</label>
                          <select
                            name="registerClass"
                            id="registerClass"
                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                            value={formData.registerClass}
                            onChange={handleChange}
                          >
                            {
                            getClass &&
                            getClass.map((className) => (
                              <option
                                key={className._id}
                                value={className.className}
                                className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                              >
                                {className.className}
                              </option>
                            ))}
                           
                          </select>
                        </div>
                        <div className="md:col-span-3">
                          <label htmlFor="gender">Gender</label>
                          <div className="flex items-center mt-1">
                            <label className="mr-4">
                              <input
                                type="radio"
                                name="gender"
                                value="Male"
                                checked={formData.gender === "Male"}
                                onChange={handleChange}
                                className="mr-2"
                              />
                              Male
                            </label>
                            <label className="mr-4">
                              <input
                                type="radio"
                                name="gender"
                                value="Female"
                                checked={formData.gender === "Female"}
                                onChange={handleChange}
                                className="mr-2"
                              />
                              Female
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="gender"
                                value="Other"
                                checked={formData.gender === "Other"}
                                onChange={handleChange}
                                className="mr-2"
                              />
                              Other
                            </label>
                          </div>
                          <div className="md:col-span-3">
                            <label htmlFor="mobileNumber">Amount</label>
                            <input
                              type="amount"
                              name="amount"
                              id="amount"
                              className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                              value={formData.amount}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                  <Button  type="submit" name= {loading ? "Submitting..." : "Submit"}  width="full" />
          {/* <Button type="submit" variant="contained" style={{ backgroundColor: currentColor }}>
            {loading ? "Submitting..." : "Submit"}
          </Button> */}
        </form>
      </Modal>
    </>
  );
};

export default RegForm;


// import React, { useState ,useEffect} from "react";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { Button } from "@mui/material";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import Modal from "../../Dynamic/Modal.jsx";
// AOS.init();

// const RegForm = ({ refreshRegistrations }) => {
//   const authToken = Cookies.get("token");
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [getClass,setGetClass]=useState({})

//   // console.log("firstgetClass",getClass)
//   const { currentColor } = useStateContext();
//   const initialData = {
//     studentFullName: "",
//     guardianName: "",
//     studentEmail: "@gmail.com",
//     studentAddress: "",
//     mobileNumber: "",
//     registerClass: "NURSERY",
//     gender: "Male",
//     amount: "",
//   };
//   const [formData, setFormData] = useState(initialData);

//   const postData = async () => {
//     try {
//       setLoading(true);
//       await axios
//         .post(
//           "https://eserver-i5sm.onrender.com/api/v1/adminRoute/createRegistration",
//           formData,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           toast.success("Created successfully!");
//           setFormData(initialData);
//           setIsOpen(false);
//           refreshRegistrations();
//           setLoading(false);
//         })
//         .catch((error) => {
//           console.log(error);
//           setLoading(false);
//         });
//     } catch (error) {
//       console.log(error);
//       setLoading(false);
//     }
//   };
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
//         // setSubmittedData(response.data.classList);
//         setGetClass(response.data.classList)
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     postData();
//   };

//   return (
//     <>
//       <Button
//         onClick={toggleModal}
//         variant="contained"
//         className="dark:text-white dark:bg-secondary-dark-bg "
//         style={{ backgroundColor: currentColor }}
//       >
//         New Registration
//       </Button>


//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={"Create Curriculum"}>
//                 <form
//                   onSubmit={handleSubmit}
//                   className=" dark:text-white dark:bg-secondary-dark-bg "
//                 >
//                   <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3 ">
//                     <div className="lg:col-span-6">
//                       <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6 ">
//                         <div className="md:col-span-3 ">
//                           <label htmlFor="studentFullName">Full Name</label>
//                           <input
//                             type="text"
//                             name="studentFullName"
//                             id="studentFullName"
//                             className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                             value={formData.studentFullName}
//                             onChange={handleChange}
//                           />
//                         </div>
//                         <div className="md:col-span-3">
//                           <label htmlFor="fatherName">Guardian's Name</label>
//                           <input
//                             type="text"
//                             name="guardianName"
//                             id="guardianName"
//                             className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                             value={formData.guardianName}
//                             onChange={handleChange}
//                           />
//                         </div>
//                         <div className="md:col-span-6">
//                           <label htmlFor="studentEmail">Email Address</label>
//                           <input
//                             type="email"
//                             name="studentEmail"
//                             id="studentEmail"
//                             className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                             value={formData.studentEmail}
//                             onChange={handleChange}
//                             placeholder="email@domain.com"
//                           />
//                         </div>
//                         <div className="md:col-span-3">
//                           <label htmlFor="studentAddress">
//                             Address / Street
//                           </label>
//                           <input
//                             type="text"
//                             name="studentAddress"
//                             id="studentAddress"
//                             className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                             value={formData.studentAddress}
//                             onChange={handleChange}
//                           />
//                         </div>
//                         <div className="md:col-span-3">
//                           <label htmlFor="mobileNumber">Mobile</label>
//                           <input
//                             type="number"
//                             name="mobileNumber"
//                             id="mobileNumber"
//                             className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                             value={formData.mobileNumber}
//                             onChange={handleChange}
//                             maxLength="10"
//                           />
//                         </div>

//                         <div className="md:col-span-3">
//                           <label htmlFor="registerClass">Class</label>
//                           <select
//                             name="registerClass"
//                             id="registerClass"
//                             className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                             value={formData.registerClass}
//                             onChange={handleChange}
//                           >
//                             {
//                             getClass &&
//                             getClass.map((className) => (
//                               <option
//                                 key={className._id}
//                                 value={className.className}
//                                 className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                               >
//                                 {className.className}
//                               </option>
//                             ))}
                           
//                           </select>
//                         </div>
//                         <div className="md:col-span-3">
//                           <label htmlFor="gender">Gender</label>
//                           <div className="flex items-center mt-1">
//                             <label className="mr-4">
//                               <input
//                                 type="radio"
//                                 name="gender"
//                                 value="Male"
//                                 checked={formData.gender === "Male"}
//                                 onChange={handleChange}
//                                 className="mr-2"
//                               />
//                               Male
//                             </label>
//                             <label className="mr-4">
//                               <input
//                                 type="radio"
//                                 name="gender"
//                                 value="Female"
//                                 checked={formData.gender === "Female"}
//                                 onChange={handleChange}
//                                 className="mr-2"
//                               />
//                               Female
//                             </label>
//                             <label>
//                               <input
//                                 type="radio"
//                                 name="gender"
//                                 value="Other"
//                                 checked={formData.gender === "Other"}
//                                 onChange={handleChange}
//                                 className="mr-2"
//                               />
//                               Other
//                             </label>
//                           </div>
//                           <div className="md:col-span-3">
//                             <label htmlFor="mobileNumber">Amount</label>
//                             <input
//                               type="amount"
//                               name="amount"
//                               id="amount"
//                               className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                               value={formData.amount}
//                               onChange={handleChange}
//                             />
//                           </div>
//                         </div>
//                         <div className="md:col-span-6 text-right mt-3">
//                           <div className="flex items-center gap-5 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
//                             <Button
//                               type="submit"
//                               variant="contained"
//                               style={{
//                                 backgroundColor: currentColor,
//                                 color: "white",
//                                 width: "100%",
//                               }}
//                             >
//                               {loading ? (
//                                 <svg
//                                   aria-hidden="true"
//                                   className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
//                                   viewBox="0 0 100 101"
//                                   fill="none"
//                                   xmlns="http://www.w3.org/2000/svg"
//                                 >
//                                   <path
//                                     d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
//                                     fill="currentColor"
//                                   />
//                                   <path
//                                     d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
//                                     fill="currentFill"
//                                   />
//                                 </svg>
//                               ) : (
//                                 " Submit"
//                               )}
//                             </Button>
//                             <Button
//                               variant="contained"
//                               onClick={toggleModal}
//                               style={{
//                                 backgroundColor: "#616161",
//                                 color: "white",
//                                 width: "100%",
//                               }}
//                             >
//                               Cancel
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </form>
//                 <Modal/>
     
     
//     </>
//   );
// };

// export default RegForm;
