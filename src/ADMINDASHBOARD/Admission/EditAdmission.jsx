// import React, { useState, useEffect } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { Button } from "@mui/material";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// const authToken = Cookies.get("token");

// const EditAdmission = () => {
//   const navigate = useNavigate();
//   const { currentColor } = useStateContext();
//   const { email } = useParams();
//   const [studentData, setStudentData] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     dateOfBirth: "",
//     rollNo: "",
//     gender: "",
//     joiningDate: "",
//     address: "",
//     contact: "",
//     class: "",
//     section: "",
//     country: "",
//     subject: "",
//     password: "",
//     fatherName: "",
//     motherName: "",
//     parentEmail: "",
//     parentPassword: "",
//     parentContact: "",
//     parentIncome: "",
//     parentQualification: "",
//     city: "",
//     state: "",
//     pincode: "",
//     nationality: "",
//     caste: "",
//     religion: "",
//     studentImage: null,
//     parentImage: null,
//   });
//   const formattedDate = new Date(formData.dateOfBirth).toLocaleDateString();
//   const AdmissionDate = new Date(formData.joiningDate).toLocaleDateString();
//   const handleOnChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleImageChange = (e) => {
//     const { name, files } = e.target;
//     if (files[0]) {
//       setFormData({
//         ...formData,
//         [name]: files[0],
//       });
//     }
//   };

//   useEffect(() => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getDataByAdmissionNumber/${email}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const data = response.data.studentData;
//         console.log(
//           "firstresponse.data.studentData;",
//           response.data.studentData
//         );

//         setStudentData(data);
//         setFormData((prevFormData) => ({
//           ...prevFormData,
//           ...data,
//         }));
//       })
//       .catch((error) => {
//         console.error("Error fetching student data:", error);
//       });
//   }, [email]);

//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const data = new FormData();
//     const { studentImage, parentImage, ...formDataWithoutImages } = formData;

//     for (const key in formDataWithoutImages) {
//       data.append(key, formDataWithoutImages[key]);
//     }

//     if (studentImage && studentImage instanceof File) {
//       data.append("studentImage", studentImage);
//     }
//     if (parentImage && parentImage instanceof File) {
//       data.append("parentImage", parentImage);
//     }

//     axios
//       .put(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/updateStudent`,
//         data,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       )
//       .then((response) => {
//         console.log("Student data updated successfully", response);
//         navigate("/admin/admission");
//       })
//       .catch((error) => {
//         console.error("Error updating student data:", error);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   };

//   return (
//     <div className="text-center p-5">
//       <h1 className="text-3xl font-bold mb-5">Edit Student's Details</h1>
//       <form onSubmit={handleFormSubmit} encType="multipart/form-data">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-white rounded-md shadow-lg">
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="text"
//             name="fullName"
//             value={formData.fullName}
//             onChange={handleOnChange}
//             placeholder="Full Name"
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="text"
//             name="rollNo"
//             value={formData.rollNo}
//             onChange={handleOnChange}
//             placeholder="Roll No"
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="email"
//             name="studentEmail"
//             value={formData.email}
//             readOnly
//             placeholder="Email"
//             readOnly
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="date"
//             name="dateOfBirth"
//             // value= {formattedDate}
//             value={
//               formData.dateOfBirth
//                 ? new Date(formData.dateOfBirth).toISOString().split("T")[0]
//                 : ""
//             }
//             // value={formData.studentDateOfBirth ? new Date(formData.studentDateOfBirth).toISOString().split('T')[0] : ''}
//             onChange={handleOnChange}
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="text"
//             name="gender"
//             value={formData.gender}
//             onChange={handleOnChange}
//             placeholder="Gender"
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="text"
//             name="subject"
//             value={formData.subject}
//             onChange={handleOnChange}
//             placeholder="Subject"
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="date"
//             name="joiningDate"
//             value={formData.joiningDate}
//             onChange={handleOnChange}
//             placeholder="Joining Date"
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="text"
//             name="address"
//             value={formData.address}
//             onChange={handleOnChange}
//             placeholder="Address"
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="text"
//             name="country"
//             value={formData.country}
//             onChange={handleOnChange}
//             placeholder="Country"
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="text"
//             name="contact"
//             value={formData.contact}
//             onChange={handleOnChange}
//             placeholder="Contact"
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="text"
//             name="class"
//             value={formData.class}
//             onChange={handleOnChange}
//             placeholder="Class"
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="text"
//             name="section"
//             value={formData.section}
//             onChange={handleOnChange}
//             placeholder="Section"
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="text"
//             name="fatherName"
//             value={formData.fatherName}
//             onChange={handleOnChange}
//             placeholder="Father's Name"
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="text"
//             name="motherName"
//             value={formData.motherName}
//             onChange={handleOnChange}
//             placeholder="Mother's Name"
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="email"
//             name="parentEmail"
//             value={formData.parentEmail}
//             onChange={handleOnChange}
//             placeholder="Parent's Email"
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="text"
//             name="parentContact"
//             value={formData.parentContact}
//             onChange={handleOnChange}
//             placeholder="Parent's Contact"
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="text"
//             name="parentIncome"
//             value={formData.parentIncome}
//             onChange={handleOnChange}
//             placeholder="Parent's Income"
//           />
//           <input
//             className="w-full p-2 border border-gray-300 rounded"
//             type="text"
//             name="parentQualification"
//             value={formData.parentQualification}
//             onChange={handleOnChange}
//             placeholder="Parent's Qualification"
//           />
// <input
//   className="w-full p-2 border border-gray-300 rounded"
//   type="text"
//   name="city"
//   value={formData.city}
//   onChange={handleOnChange}
//   placeholder="City"
// />
// <input
//   className="w-full p-2 border border-gray-300 rounded"
//   type="text"
//   name="state"
//   value={formData.state}
//   onChange={handleOnChange}
//   placeholder="State"
// />
// <input
//   className="w-full p-2 border border-gray-300 rounded"
//   type="text"
//   name="pincode"
//   value={formData.pincode}
//   onChange={handleOnChange}
//   placeholder="Pincode"
// />
// <input
//   className="w-full p-2 border border-gray-300 rounded"
//   type="text"
//   name="nationality"
//   value={formData.nationality}
//   onChange={handleOnChange}
//   placeholder="Nationality"
// />
// <input
//   className="w-full p-2 border border-gray-300 rounded"
//   type="text"
//   name="caste"
//   value={formData.caste}
//   onChange={handleOnChange}
//   placeholder="Caste"
// />
// <input
//   className="w-full p-2 border border-gray-300 rounded"
//   type="text"
//   name="religion"
//   value={formData.religion}
//   onChange={handleOnChange}
//   placeholder="Religion"
// />

//           <div className="flex flex-col items-center">
//             <label>Student Image</label>
//             <input
//               className="w-full p-2 border border-gray-300 rounded"
//               type="file"
//               name="studentImage"
//               accept="image/*"
//               onChange={handleImageChange}
//             />
//             {formData.image && (
//               <img
//                 src={formData.image.url}
//                 alt="Student Preview"
//                 className="w-20 h-20 mt-2 rounded-full object-cover"
//               />
//             )}
//           </div>
//           <div className="flex flex-col items-center">
//             <label>Parent Image</label>
//             <input
//               className="w-full p-2 border border-gray-300 rounded"
//               type="file"
//               name="parentImage"
//               accept="image/*"
//               onChange={handleImageChange}
//             />
//             {formData.parentImagePreview && (
//               <img
//                 src={formData.image.url}
//                 alt="Parent Preview"
//                 className="w-32 h-32 mt-2"
//               />
//             )}
//           </div>
//         </div>

// <div className="flex justify-between gap-5 mt-5">
//   <Button
//     className="w-full  text-white font-bold py-2 px-4 rounded mr-2"
//     type="submit"
//     variant="contained"
//     disabled={loading}
//     style={{
//       backgroundColor: currentColor,
//       color: "white",
//     }}
//   >
//     {loading ? "Updating..." : "Update"}
//   </Button>
//   <Link
//               className="w-full "
//     to="/admin/admission"
//   >
//     <Button
//       variant="contained"
//       className="w-full   text-white font-bold py-2 px-4 rounded mr-2"
//       style={{
//         backgroundColor: "#616161",
//         color: "white",
//       }}
//     >
//       Cancel
//     </Button>
//   </Link>
// </div>
//       </form>
//     </div>
//   );
// };

// export default EditAdmission;

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@mui/material";
import { useStateContext } from "../../contexts/ContextProvider.js";
import Cookies from "js-cookie";

const authToken = Cookies.get("token");

const EditAdmission = () => {
  const { currentColor } = useStateContext();
  const navigate = useNavigate();
  const { email } = useParams();
  const [studentData, setStudentData] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    rollNo: "",
    gender: "",
    joiningDate: "",
    address: "",
    contact: "",
    class: "",
    section: "",
    country: "",

    city: "",
    state: "",
    pincode: "",
    nationality: "",
    caste: "",
    religion: "",
    image: null,
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });
    }
  };

  useEffect(() => {
    axios
      .get(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents?email=${email}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const data = response.data.allStudent[0];
        setStudentData(data);
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...data,
        }));
      })
      .catch((error) => {
        console.error("Error fetching teacher data:", error);
      });
  }, [email]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    const { image, ...formDataWithoutImage } = formData;

    for (const key in formDataWithoutImage) {
      data.append(key, formDataWithoutImage[key]);
    }

    if (image && image instanceof File) {
      data.append("image", image);
    }
    // console.log("data",data)

    axios
      .put(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/updateStudent`,
        data,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        navigate("/admin/admission");
      })
      .catch((error) => {
        console.error("Error updating student data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="text-center p-5">
      <h1 className="text-3xl font-bold mb-5">Edit Student's Details</h1>
      
      <form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-white rounded-md shadow-lg">
          <div>
            <label htmlFor="fullName">Full Name</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleOnChange}
              placeholder="Full Name"
            />
          </div>
          <div>
            <label htmlFor="rollNo">Roll No</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="rollNo"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleOnChange}
              placeholder="Roll No"
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              readOnly
              placeholder="Email"
            />
          </div>
          <div>
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={
                formData.dateOfBirth
                  ? new Date(formData.dateOfBirth).toISOString().split("T")[0]
                  : ""
              }
              onChange={handleOnChange}
            />
          </div>
          <div>
            <label htmlFor="gender">Gender</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleOnChange}
              placeholder="Gender"
            />
          </div>
         
          <div>
            <label htmlFor="subject">Subject</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleOnChange}
              placeholder="Subject"
            />
          </div>
          <div>
            <label htmlFor="joiningDate">Joining Date</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="date"
              id="joiningDate"
              name="joiningDate"
              // value={formData.joiningDate}
              value={
                formData.joiningDate
                  ? new Date(formData.joiningDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={handleOnChange}
              placeholder="Joining Date"
            />
          </div>
          <div>
            <label htmlFor="address">Address</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleOnChange}
              placeholder="Address"
            />
          </div>
          <div>
            <label htmlFor="country">Country</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleOnChange}
              placeholder="Country"
            />
          </div>
          <div>
            <label htmlFor="contact">Contact</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleOnChange}
              placeholder="Contact"
            />
          </div>
          <div>
            <label htmlFor="city">City</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleOnChange}
              placeholder="City"
            />
          </div>
          <div>
            <label htmlFor="state">State</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleOnChange}
              placeholder="State"
            />
          </div>
          <div>
            <label htmlFor="pincode">Pincode</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleOnChange}
              placeholder="Pincode"
            />
          </div>
          <div>
            <label htmlFor="nationality">Nationality</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleOnChange}
              placeholder="Nationality"
            />
          </div>
          <div>
            <label htmlFor="caste">Caste</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="caste"
              name="caste"
              value={formData.caste}
              onChange={handleOnChange}
              placeholder="Caste"
            />
          </div>
          <div>
            <label htmlFor="religion">Religion</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="religion"
              name="religion"
              value={formData.religion}
              onChange={handleOnChange}
              placeholder="Religion"
            />
          </div>
          <div>
            <label htmlFor="class">Class</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="class"
              name="class"
              value={formData.class}
              onChange={handleOnChange}
              placeholder="Class"
            />
          </div>
          <div>
            <label htmlFor="section">Section</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="section"
              name="section"
              value={formData.section}
              onChange={handleOnChange}
              placeholder="Section"
            />
          </div>
          <div>
            <label htmlFor="image">Image</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div>
            <label htmlFor="section">Father's Name</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="fatherName"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleOnChange}
              placeholder="fatherName"
            />
          </div>
          <div>
            <label htmlFor="section">Mother's Name</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="motherName"
              name="motherName"
              value={formData.motherName}
              onChange={handleOnChange}
              placeholder="motherName"
            />
          </div>
        </div>
        <div className="flex justify-between gap-5 mt-5">
          <Button
            className="w-full text-white font-bold py-2 px-4 rounded mr-2"
            type="submit"
            variant="contained"
            disabled={loading}
            style={{
              backgroundColor: currentColor,
              color: "white",
            }}
          >
            {loading ? "Updating..." : "Update"}
          </Button>
          <Link className="w-full" to="/admin/admission">
            <Button
              variant="contained"
              className="w-full text-white font-bold py-2 px-4 rounded mr-2"
              style={{
                backgroundColor: "#616161",
                color: "white",
              }}
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditAdmission;
