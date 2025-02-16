import React, { useState, useEffect } from "react";
import { Box, Button, TextField, MenuItem } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

const authToken = Cookies.get("token");

const EditTeacher = () => {
  const [getClass, setGetClass] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const navigate = useNavigate();
  const { email } = useParams();
  const [teacherData, setTeacherData] = useState({});
  const [formData, setFormData] = useState({
    sNo: 1,
    fullName: "",
    employeeId: "",
    email: "",
    dateOfBirth: "",
    status: "Active",
    qualification: "",
    salary: "",
    subject: "",
    gender: "Male",
    // joiningDate: "",
    joiningDate: new Date().toISOString().slice(0, 10),
    address: "",
    contact: "",
    experience: "",
    section: "",
    classTeacher: "", // Ensure this is in the formData
    image: null,
  });
  const [loading, setLoading] = useState(false);

  // Fetch all classes for the dropdown
  useEffect(() => {
    axios
      .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        const classes = response.data.classList;
       

        setGetClass(classes.sort((a, b) => a.className.localeCompare(b.className)));
      })
      .catch((error) => {
        console.error("Error fetching classes data:", error);
      });
  }, []);

  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);
    const selectedClassObj = getClass.find((cls) => cls.className === selectedClassName);

    if (selectedClassObj) {
      setAvailableSections(selectedClassObj.sections.split(", "));
    } else {
      setAvailableSections([]);
    }

    // Update classTeacher in formData when class changes
    setFormData((prevFormData) => ({
      ...prevFormData,
      classTeacher: selectedClassName, // Set classTeacher here
    }));
  };

  // Handle form input changes
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
  };

  // Fetch teacher data by email for pre-filling the form
  useEffect(() => {
    axios
      .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getTeachers?email=${email}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        const data = response.data.data[0];
       
        setTeacherData(data);
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...data,
          classTeacher: data.classTeacher || "", // Ensure classTeacher is set correctly
        }));
        setSelectedClass(data.classTeacher || ""); // Set selected class
        handleClassChange({ target: { value: data.classTeacher || "" } }); // Update available sections
      })
      .catch((error) => {
        console.error("Error fetching teacher data:", error);
      });
  }, [email]);

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();

    if (formData.image instanceof File) {
      data.append("image", formData.image);
    }

    for (const key in formData) {
      if (key !== "image" && formData.hasOwnProperty(key)) {
        data.append(key, formData[key]);
      }
    }

    axios
      .put(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/updateTeacher`, data, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("Teacher data updated successfully", response);
        navigate("/admin/allteachers");
      })
      .catch((error) => {
        console.error("Error updating teacher data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "900" }}>
        Edit Teacher Profile
      </h1>
      <form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <Box className="py-5 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-4 bg-white rounded-md shadow-lg">
          <TextField
            label="Full Name"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Employee ID"
            name="employeeId"
            type="text"
            value={formData.employeeId}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleOnChange}
            required
            readOnly
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            // value={new Date(formData.dateOfBirth).toISOString().slice(0, 10)}
            value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().slice(0, 10) : ''}

            // value={formData.dateOfBirth}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Salary"
            name="salary"
            value={formData.salary}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          {/* <TextField
            label="Joining Date"
            name="joiningDate"
             type="date"
            value={formData.joiningDate}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          /> */}
          <TextField
  label="Joining Date"
  name="joiningDate"
  value={formData.joiningDate ? new Date(formData.joiningDate).toISOString().slice(0, 10) : ''}
  type="date" // This ensures a native date picker with "YYYY-MM-DD" format
  // value={new Date(formData.joiningDate).toISOString().slice(0, 10)} // Convert "2024-10-18T00:00:00.000Z" to "YYYY-MM-DD"
  onChange={handleOnChange} // Handle the date change as usual
  required
  style={{ width: "70%", paddingBottom: "20px" }}
/>

          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Contact"
            name="contact"
            value={formData.contact}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Experience"
            name="experience"
            type="text"
            value={formData.experience}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />

          <TextField
            label="Class Teacher"
            name="classTeacher"
            select
            value={selectedClass}
            onChange={handleClassChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          >
            <MenuItem value="" disabled>
              Select a Class
            </MenuItem>
            {getClass.map((cls, index) => (
              <MenuItem key={index} value={cls.className}>
                {cls.className}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Section"
            name="section"
            select
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          >
            <MenuItem value="" disabled>
              Select a Section
            </MenuItem>
            {availableSections.map((section, index) => (
              <MenuItem key={index} value={section}>
                {section}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Image"
            name="image"
            type="file"
            onChange={handleImageChange}
            style={{ width: "70%", paddingBottom: "20px" }}
          />
        </Box>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "20px" }}>
          <Button
            type="submit"
            variant="contained"
            style={{ width: "50%" }}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/admin/allteachers")}
            style={{ width: "50%", backgroundColor: "red" }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditTeacher;


// import React, { useState, useEffect } from "react";
// import { Box, Button, TextField } from "@mui/material";
// import { Link, useParams } from "react-router-dom";
// import axios from "axios";
// import { MenuItem } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import Cookies from "js-cookie";
// const authToken = Cookies.get("token");

// const EditTeacher = () => {
//   const [getClass, setGetClass] = useState([]);
//   const [availableSections, setAvailableSections] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const navigate = useNavigate();
//   const { email } = useParams();
//   const [teacherData, setTeacherData] = useState({});
//   const [formData, setFormData] = useState({
//     sNo: 1,
//     fullName: "",
//     employeeId: "",
//     email: "",
//     dateOfBirth: "",
//     status: "Active",
//     qualification: "",
//     salary: "",
//     subject: "",
//     gender: "Male",
//     joiningDate: "",
//     address: "",
//     contact: "",
//     experience: "",
//     section: "",
//     classTeacher: "",
//     image: null,
//   });
//   const [loading, setLoading] = useState(false);

//   // Fetch all classes for the dropdown
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
//         let classes = response.data.classList;
//         setGetClass(classes.sort((a, b) => a - b));
//       })
//       .catch((error) => {
//         console.error("Error fetching classes data:", error);
//       });
//   }, []);

//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     const selectedClassObj = getClass.find(
//       (cls) => cls.className === selectedClassName
//     );

//     if (selectedClassObj) {
//       setAvailableSections(selectedClassObj.sections.split(", "));
//     } else {
//       setAvailableSections([]);
//     }
//   };

//   // Handle form input changes
//   const handleOnChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   // Handle image file change
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     setFormData({ ...formData, image: file });
//   };

//   // Fetch teacher data by email for pre-filling the form
//   useEffect(() => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getTeachers?email=${email}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const data = response.data.data[0];
//         setTeacherData(data);
//         setFormData((prevFormData) => ({
//           ...prevFormData,
//           ...data,
//         }));
//       })
//       .catch((error) => {
//         console.error("Error fetching teacher data:", error);
//       });
//   }, [email]);

//   useEffect(() => {
//     if (teacherData.classTeacher) {
//       setSelectedClass(teacherData.classTeacher);
//       handleClassChange({ target: { value: teacherData.classTeacher } });
//     }
//   }, [teacherData, getClass]);

//   // Handle form submission
//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const data = new FormData();

//     if (formData.image instanceof File) {
//       data.append("image", formData.image);
//     }

//     for (const key in formData) {
//       if (key !== "image" && formData.hasOwnProperty(key)) {
//         data.append(key, formData[key]);
//       }
//     }

//     axios
//       .put(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/updateTeacher`,
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
//         console.log("Teacher data updated successfully", response);
//         navigate("/admin/allteachers");
//       })
//       .catch((error) => {
//         console.error("Error updating teacher data:", error);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   };

//   return (
//     <div style={{ textAlign: "center", padding: "20px" }}>
//       <h1 style={{ fontSize: "30px", fontWeight: "900" }}>
//         Edit Teacher Profile
//       </h1>
//       <form onSubmit={handleFormSubmit} encType="multipart/form-data">
//         <Box className="py-5 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-4 bg-white rounded-md shadow-lg">
//           <TextField
//             label="Full Name"
//             name="fullName"
//             type="text"
//             value={formData.fullName}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom: "20px" }}
//           />
//           <TextField
//             label="Employee ID"
//             name="employeeId"
//             type="text"
//             value={formData.employeeId}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom: "20px" }}
//           />
//           <TextField
//             label="Email"
//             name="email"
//             type="email"
//             value={formData.email}
//             onChange={handleOnChange}
//             required
//             readOnly
//             style={{ width: "70%", paddingBottom: "20px" }}
//           />
//           <TextField
//             label="Date of Birth"
//             name="dateOfBirth"
//             value={formData.dateOfBirth}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom: "20px" }}
//           />
//           <TextField
//             label="Salary"
//             name="salary"
//             value={formData.salary}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom: "20px" }}
//           />
//           <TextField
//             label="Subject"
//             name="subject"
//             value={formData.subject}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom: "20px" }}
//           />
//           <TextField
//             label="Joining Date"
//             name="joiningDate"
//             value={formData.joiningDate}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom: "20px" }}
//           />
//           <TextField
//             label="Address"
//             name="address"
//             value={formData.address}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom: "20px" }}
//           />
//           <TextField
//             label="Contact"
//             name="contact"
//             value={formData.contact}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom: "20px" }}
//           />
//           <TextField
//             label="Experience"
//             name="experience"
//             type="text"
//             value={formData.experience}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom: "20px" }}
//           />

//           <TextField
//             label="classTeacher"
//             name="classTeacher"
//             select
//             value={selectedClass}
//             onChange={handleClassChange}
//             required
//             style={{ width: "70%", paddingBottom: "20px" }}
//           >
//             <MenuItem value="" disabled>
//               Select a Class
//             </MenuItem>
//             {getClass?.map((cls, index) => (
//               <MenuItem key={index} value={cls.className}>
//                 {cls?.className}
//               </MenuItem>
//             ))}
//           </TextField>

//           <TextField
//             label="Section"
//             name="teacherSection"
//             select
//             value={formData.section}
//             onChange={(e) =>
//               setFormData({ ...formData, section: e.target.value })
//             }
//             required
//             style={{ width: "70%", paddingBottom: "20px" }}
//           >
//             <MenuItem value="" disabled>
//               Select a Section
//             </MenuItem>
//             {availableSections.map((section, index) => (
//               <MenuItem key={index} value={section}>
//                 {section}
//               </MenuItem>
//             ))}
//           </TextField>

//           <TextField
//             name="image"
//             type="file"
//             accept="image/*"
//             onChange={handleImageChange}
//             style={{ width: "70%", paddingBottom: "20px" }}
//           />
//         </Box>

//         <div className="button flex w-full" style={{ marginTop: "10px" }}>
//           <Button
//             variant="contained"
//             type="submit"
//             style={{ width: "50%", marginRight: "10px" }}
//           >
//             {loading ? (
//               <svg
//                 aria-hidden="true"
//                 className="w-8 h-8 mr-2 text-gray-200 animate-spin"
//                 viewBox="0 0 100 101"
//                 fill="none"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   d="M100 50.59c0-27.614-22.386-50-50-50S0 22.976 0 50.59c0 27.614 22.386 50 50 50s50-22.386 50-50z"
//                   fill="#E5E7EB"
//                 />
//               </svg>
//             ) : (
//               "Update"
//             )}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default EditTeacher;

// import React, { useState, useEffect } from "react";
// import { Box, Button, TextField, Select, MenuItem } from "@mui/material";
// import { Link, useParams } from "react-router-dom";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import Cookies from 'js-cookie';
// const authToken = Cookies.get('token');

// const EditTeacher = () => {
//   const [getClass, setGetClass] = useState([]);
//   const [availableSections, setAvailableSections] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const navigate = useNavigate();
//   const { email } = useParams();
//   const [teacherData, setTeacherData] = useState({});
//   const qualifications = ["Bachelor's", "Master's", "Ph.D."];
//   const genders = ["Male", "Female", "Other"];
//   const [formData, setFormData] = useState({
//     sNo: 1,
//     fullName: "",
//     employeeId: "",
//     email: "",
//     dateOfBirth: "",
//     status: "Active",
//     qualification: "",
//     salary: "",
//     subject: "",
//     gender: "Male",
//     joiningDate: "",
//     address: "",
//     contact: "",
//     experience: "",
//     section: "",
//     classTeacher: "",
//     image:null
//   });
//   const [loading,setLoading]=useState(false)

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
//         let classes = response.data.classList;

//         setGetClass(classes.sort((a, b) => a - b));
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   }, []);
//   // console.log("classes",getClass)
//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     const selectedClassObj = getClass.find(
//       (cls) => cls.className === selectedClassName
//     );

//     if (selectedClassObj) {
//       setAvailableSections(selectedClassObj.sections.split(", "));
//     } else {
//       setAvailableSections([]);
//     }
//   };

//   const handleOnChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     setFormData({ ...formData, image: file }); // Update the "image" field in formData
//   };

//   useEffect(() => {
//     axios.get(
//       `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getTeachers?email=${email}`,
//       {
//         withCredentials: true,
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//       }, // Set withCredentials to true
//       }
//     )
//       .then((response) => {
//         const  data  = response.data.data[0];
//         setTeacherData(data);
//         setFormData((prevFormData) => ({
//           ...prevFormData,
//           ...data,
//         }));
//       })
//       .catch((error) => {
//         console.error("Error fetching teacher data:", error);
//       });
//   }, [email]);

//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const data = new FormData();

//     if (formData.image instanceof File) {
//       data.append('image', formData.image);
//     }

//     // Append the rest of the form data to the FormData
//     for (const key in formData) {
//       if (key !== 'image' && formData.hasOwnProperty(key)) {
//         data.append(key, formData[key]);
//       }
//     }

//     axios.put(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/updateTeacher`, data, {
//       withCredentials: true,
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//         'Content-Type': 'multipart/form-data',
//       },
//     })
//       .then((response) => {
//         console.log("Teacher data updated successfully", response);
//         navigate("/admin/allteachers");
//       })
//       .catch((error) => {
//         console.error("Error updating teacher data:", error);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   };

//   return (

//     <div style={{textAlign: "center", padding: "20px", }}>
//       <h1 style={{ fontSize: "30px", fontWeight: "900" }}>Edit Teacher Profile</h1>
//       <form onSubmit={handleFormSubmit} encType="multipart/form-data">
//         <Box className="py-5 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-4 bg-white rounded-md shadow-lg">
//           <TextField
//             label="FullName"
//             name="fullName"
//             type="text"
//             value={formData.fullName}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom:"20px" }}
//           />
//           <TextField
//             label="EmployeeId"
//             name="employeeId"
//             type="text"
//             value={formData.employeeId}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom:"20px" }}
//           />
//           <TextField
//             label="Email"
//             name="email"
//             type="email"
//             value={formData.email}
//             onChange={handleOnChange}
//             required
//             readOnly
//             style={{ width: "70%", paddingBottom:"20px" }}
//           />

//           <TextField
//             label="DateOfBirth"
//             name="dateOfBirth"
//             value={formData.dateOfBirth}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom:"20px" }}
//           />
//           {/* <Select
//             label="Status"
//             name="status"
//             value={formData.status}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom:"20px" }}
//           >
//             <MenuItem value="Active">Active</MenuItem>
//             <MenuItem value="Inactive">Inactive</MenuItem>
//           </Select> */}
//           {/* <Select
//             label="Qualification"
//             name="qualification"
//             value={formData.qualification}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom:"20px" }}
//           >
//             {qualifications.map((qualification) => (
//               <MenuItem key={qualification} value={qualification}>
//                 {qualification}
//               </MenuItem>
//             ))}
//           </Select> */}
//           <TextField
//             label="Salary"
//             name="salary"
//             value={formData.salary}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom:"20px" }}
//           />
//           <TextField
//             label="Subject"
//             name="subject"
//             value={formData.subject}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom:"20px" }}
//           />
//           {/* <Select
//             label="Gender"
//             name="gender"
//             value={formData.gender}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom:"20px" }}
//           >
//             {genders.map((gender) => (
//               <MenuItem key={gender} value={gender}>
//                 {gender}
//               </MenuItem>
//             ))}
//           </Select> */}
//           <TextField
//             label="Joining Date"
//             name="joiningDate"
//             value={formData.joiningDate}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom:"20px" }}
//           />
//           <TextField
//             label="Address"
//             name="address"
//             value={formData.address}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom:"20px" }}
//           />
//           <TextField
//             label="Contact"
//             name="contact"
//             value={formData.contact}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom:"20px" }}
//           />
//           <TextField
//             label="Experience"
//             name="experience"
//             type="text"
//             value={formData.experience}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom:"20px" }}
//           />
//                  <div className="flex flex-col space-y-1">
//                       <label className="block text-[12px] font-medium text-gray-700">
//                         Class:
//                       </label>
//                       <select
//                         name="studentClass"
//                         className="border border-gray-300 px-2 py-1  rounded"
//                         value={selectedClass}
//                         onChange={handleClassChange}
//                         required
//                       >
//                         <option value="" disabled>
//                           Select a Class
//                         </option>
//                         {getClass?.map((cls, index) => (
//                           <option key={index} value={cls.className}>
//                             {cls?.className}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="flex flex-col space-y-1">
//                       <label className="block text-[12px] font-medium text-gray-700">
//                         Section:
//                       </label>
//                       <select
//                         name="studentSection"
//                         className="border border-gray-300 px-2 py-1  rounded"
//                         required
//                       >
//                         <option value="" disabled>
//                           Select a Section
//                         </option>
//                         {availableSections.map((section, index) => (
//                           <option key={index} value={section}>
//                             {section}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//           {/* <TextField
//             label="Section"
//             name="section"
//             value={formData.section}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom:"20px" }}
//           />
//           <TextField
//             label="Class"
//             name="classTeacher"
//             value={formData.classTeacher}
//             onChange={handleOnChange}
//             required
//             style={{ width: "70%", paddingBottom:"20px" }}
//           /> */}
//           <TextField
//             name="image"
//             type="file"
//             accept="image/*"
//             required
//             onChange={handleImageChange}
//             style={{ width: "70%", paddingBottom:"20px" }}
//             // value={formData.image}
//          />
//         </Box>
//           <Link to="/admin/allteachers">
//           <div className="button flex w-full" style={{ marginTop: '10px' }}>
//             <Button variant="contained" onClick={handleFormSubmit} style={{ width: '50%', marginRight: '10px' }}>
//             { loading ?
//                ( <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
//                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
//                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
//            </svg>): " Update"
//             }
//             </Button>
//             <Button variant="contained" style={{ width: '50%' }}>
//               Cancel
//             </Button>
//           </div>
//           </Link>
//       </form>
//     </div>
//   );
// };

// export default EditTeacher;
