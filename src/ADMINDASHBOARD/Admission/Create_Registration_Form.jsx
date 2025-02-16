import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./index.css";
import '../../../src/index.css'
import Switch from "@mui/material/Switch";
import axios from "axios";
import "../../Dynamic/Form/FormStyle.css";
import { useStateContext } from "../../contexts/ContextProvider";
import Cookies from "js-cookie";
import NoDataFound from "../../NoDataFound";
import {  FormControlLabel } from "@mui/material";
import LoadingComponent from "../../Loading";
import BulkAdmission from "./BulkAdmission";
import Input from "../../Dynamic/Input";
import Button from "../../Dynamic/utils/Button";
import Table from "../../Dynamic/Table";
import {  AiFillEye } from 'react-icons/ai';
import moment from "moment/moment";
import Modal from "../../Dynamic/Modal";
import Loading from "../../Loading";
import { LastYearStudents } from "../../Network/AdminApi";
import AdmissionPrint from "./AdmissionPrint";

function Create_Registration_Form() {
  const { currentColor } = useStateContext();
  const authToken = Cookies.get("token");
  const [sibling, setsibling] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState([]);
  const [getClass, setGetClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [availableSections, setAvailableSections] = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [openReceipt, setOpenReceipt] = useState(false);
  const [selectStudent, setSelectStudent] = useState();
  const [searchQuery, setSearchQuery] = useState("");

  const [payload, setPayload] = useState({
    studentFullName: "",
    admissionNumber: "",
    studentContact: "",
    studentAddress: "",
    guardian_name: "",
    studentDateOfBirth: "",
    studentGender: "",
    studentClass: "",
    studentSection: "",
    studentImage: "",
    fatherName: "",
    motherName: "",
    studentImage: null
  });

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const lastYearStudent = async () => {
    setLoading(true);
    try {
      const response = await LastYearStudents();
      if (response?.allStudent) {
        setSubmittedData(response.allStudent);
        setLoading(false);
      } else {
        toast.error(response?.message);
        setLoading(false);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    lastYearStudent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payloadData = {
      studentFullName: payload.studentFullName,
      studentEmail: `${payload.studentFullName}${payload.studentContact}@gmail.com`,
      studentPassword: payload.studentContact,
      studentDateOfBirth: payload.studentDateOfBirth,
      studentGender: payload.studentGender,
      studentJoiningDate: moment(Date.now()).format('DD MMMM YYYY'),
      studentAddress: payload.studentAddress,
      studentContact: payload.studentContact,
      studentClass: selectedClass,
      studentSection: payload?.setPayload,
      fatherName: payload.fatherName,
      motherName: payload.motherName,
      parentEmail: `${payload.fatherName}${payload.studentContact}@gmail.com`,
      parentPassword: payload.studentContact,
      admissionNumber: payload.admissionNumber,
      studentImage: payload.studentImage
    };

    const formDataToSend = new FormData();
    Object.entries(payloadData).forEach(([key, value]) => {
      if (key === "studentImage" || key === "parentImage") {
        if (value) {
          formDataToSend.append(key, value);
        }
      } else {
        formDataToSend.append(key, String(value ?? ""));
      }
    });
    formDataToSend.append("studentImage", payload.studentImage);
    formDataToSend.append("parentImage", payload.parentImage);

    try {
      const response = await axios.post(
        "https://eshikshaserver.onrender.com/api/v1/adminRoute/createStudentParent",
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response?.data?.success === true) {
        toast.success("Student added successfully!");
        toggleModal();
        setLoading(false);
        setModalOpen(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);
    const selectedClassObj = getClass?.find(
      (cls) => cls.className === selectedClassName
    );

    if (selectedClassObj) {
      setAvailableSections(selectedClassObj.sections.split(", "));
    } else {
      setAvailableSections([]);
    }
  };

  const handleFilterClassChange = (e) => {
    setFilterClass(e.target.value);
  };

  useEffect(() => {
    axios
      .get(
        `https://eshikshaserver.onrender.com/api/v1/adminRoute/getAllClasses`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        let classes = response.data.classList;
        setGetClass(classes.sort((a, b) => a - b));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPayload({
        ...payload,
        studentImage: file,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload(() => ({
      ...payload,
      [name]: value
    }));
  };

  const filteredData = filterClass
    ? submittedData?.filter((item) => item.class === filterClass)
    : submittedData;

  const searchFilteredData = filteredData?.filter((item) => {
    return (
      item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const modifiedData = searchFilteredData?.map((item) => ({
    ...item,
    childName: item.children?.map((child) => child.fullName)?.join("\n"),
    childAdmissionNo: item.children?.map((child) => child.admissionNumber).join("\n"),
  }));

  const onClickAdmissionReceipt = (val) => {
    setSelectStudent(val);
    setOpenReceipt(true);
  };

  const THEAD = [
    { id: "SN", label: "S No." },
    { id: "admissionNo", label: "Admission No" },
    { id: "name", label: "Name" },
    { id: "fatherName", label: "Father Name" },
    { id: "class", label: "Class" },
    { id: "contact", label: "Contact" },
    { id: "action", label: "Action" },
  ];

  const tBody = modifiedData.map((val, ind) => ({
    "SN": ind + 1,
    admissionNo: <span className="text-green-800 font-semibold">
      {val.admissionNumber}
    </span>,
    name: val.fullName,
    fatherName: val.fatherName,
    class: val.class,
    contact: val.contact,
    feeStatus: val.feeStatus,
    action:
      <span onClick={() => onClickAdmissionReceipt(val)} className="cursor-pointer">
        <AiFillEye className="text-[25px] text-green-700" />
      </span>
  }));

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-3">
      <div className="flex md:flex-row gap-1">
        <Button name="New Admission" onClick={toggleModal} />
        <BulkAdmission />
        <div className="">
          <select
          style={{background:currentColor,color:"white"}}
          
            id="filterClass"
            value={filterClass}
            onChange={handleFilterClassChange}
            className="border rounded py-1"
          >
            <option value="">All Classes</option>
            {getClass?.map((cls, index) => (
              <option key={index} value={cls.className}>
                {cls?.className}
              </option>
            ))}
          </select>
        </div>
        {/* Add Search Input Field */}
        <div style={{background:currentColor}}>
          <input
          style={{background:currentColor,color:"white"}}
          className=" py-2 text-sm border-none outline-none"
            type="text"
            placeholder="Search by name, class, etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={"Create "}>
        <form onSubmit={handleSubmit}>
          <div className="mt-2 grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 grid-cols-2 gap-3 px-1 mx-auto bg-gray-100 rounded-md ">
            <Input
              type="text"
              name="studentFullName"
              required={true}
              placeholder="studentFullName"
              required_field={true}
              onChange={handleChange}
              value={payload.studentFullName}
            />
            <Input
              type="text"
              name="admissionNumber"
              required={false}
              placeholder="admissionNumber"
              onChange={handleChange}
              value={payload.admissionNumber}
            />
            <Input
              type="tel"
              name="studentContact"
              required={true}
              placeholder="studentContact"
              maxLength={10}
              required_field={true}
              onChange={handleChange}
              value={payload.studentContact}
            />
            <Input
              type="text"
              name="studentAddress"
              placeholder="studentAddress"
              onChange={handleChange}
              value={payload.studentAddress}
            />
            <Input
              type="text"
              name="guardian_name"
              required={false}
              placeholder="guardian_name"
              onChange={handleChange}
              value={payload.guardian_name}
            />
            <div className="flex flex-col space-y-1 mt-[2px]">
              <select
                name="studentGender"
                className="w-full border-1 border-black outline-none py-[3px] bg-inherit"
                onFocus={(e) => (e.target.style.borderColor = currentColor)}
                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                value={payload.studentGender}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select a Section
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input
              type="date"
              name="studentDateOfBirth"
              label="DOB"
              required_field={true}
              onChange={handleChange}
              value={payload.studentDateOfBirth}
            />
            <div className="flex flex-col space-y-1 mt-[2px]">
              <select
                name="studentClass"
                className="w-full border-1 border-black outline-none py-[3px] bg-inherit"
                onFocus={(e) => (e.target.style.borderColor = currentColor)}
                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                value={selectedClass}
                onChange={handleClassChange}
                required
              >
                <option value="" disabled>
                  Select a Class
                </option>
                {getClass?.map((cls, index) => (
                  <option key={index} value={cls.className}>
                    {cls?.className}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-1 mt-[2px]">
              <select
                name="studentSection"
                className="w-full border-1 border-black outline-none py-[3px] bg-inherit"
                onFocus={(e) => (e.target.style.borderColor = currentColor)}
                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                value={selectedClass}
                onChange={handleClassChange}
                required
              >
                <option value="" disabled>
                  Select a Section
                </option>
                {availableSections?.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <Input
              type="file"
              name="studentImage"
              required={false}
              label="Student Image"
              onChange={handleImageChange}
            />
          </div>
          <div className="flex flex-row gap-10 justify-center bg-gray-100 text-center">
            <span className="text-xl text-blue-900">Parent Details</span>
            <FormControlLabel
              control={<Switch onClick={() => setsibling(!sibling)} />}
              label="Sibling"
            />
          </div>
          {sibling ? (
            <div className="grid md:grid-cols-6 lg:grid-cols-5 grid-cols-2 gap-3 px-1 mx-auto bg-gray-100 rounded-md ">
              <Input
                type="text"
                name="fatherName"
                required={true}
                required_field={true}
                onChange={handleChange}
                value={payload.fatherName}
                placeholder="Father's Name"
              />
              <Input
                type="text"
                name="motherName"
                required={false}
                placeholder="Mother's Name"
                onChange={handleChange}
                value={payload.motherName}
              />
            </div>
          ) : (
            <div className="bg-gray-100">
              <div className="px-5 md:max-w-[25%] w-full text-center ">
                <Input
                  type="text"
                  name="parentAdmissionNumber"
                  required={true}
                  placeholder="Parent's Admission Number"
                  onChange={handleChange}
                  value={payload.parentAdmissionNumber}
                />
              </div>
            </div>
          )}
          <div className="mt-4 flex flex-col md:flex-row justify-center gap-2 py-2 px-1">
            <Button
              name="Submit"
              type="submit"
              loading={loading}
              width="full"
            />
            <Button
              name="Cancel"
              color="gray"
              loading={loading}
              width="full"
              onClick={toggleModal}
            />
          </div>
        </form>
      </Modal>
      <Modal isOpen={openReceipt} setIsOpen={setOpenReceipt} title={"Admission Receipt "}>
        <AdmissionPrint studentValues={selectStudent} />
      </Modal>

      {modifiedData.length > 0 ? (
        <Table tHead={THEAD} tBody={tBody} />
      ) : (
        <NoDataFound />
      )}
    </div>
  );
}

export default Create_Registration_Form;


// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import "./index.css";
// import '../../../src/index.css'
// import Switch from "@mui/material/Switch";
// import axios from "axios";
// import "../../Dynamic/Form/FormStyle.css";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Cookies from "js-cookie";
// import NoDataFound from "../../NoDataFound";
// import {  FormControlLabel } from "@mui/material";
// import LoadingComponent from "../../Loading";
// import BulkAdmission from "./BulkAdmission";
// import Input from "../../Dynamic/Input";
// import Button from "../../Dynamic/utils/Button";
// import Table from "../../Dynamic/Table";
// import {  AiFillEye } from 'react-icons/ai';
// import moment from "moment/moment";
// import Modal from "../../Dynamic/Modal";
// import Loading from "../../Loading";
// import { LastYearStudents } from "../../Network/AdminApi";
// import AdmissionPrint from "./AdmissionPrint";
// function Create_Registration_Form() {
//   const { currentColor } = useStateContext();
//   const authToken = Cookies.get("token");
//   const [sibling, setsibling] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [submittedData, setSubmittedData] = useState([]);
//   const [getClass, setGetClass] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [availableSections, setAvailableSections] = useState([]);
//   const [filterClass,setFilterClass]=useState("");
//    const [modalOpen, setModalOpen] = useState(false);
//    const [openReceipt,setOpenReceipt]=useState(false)
//    const [selectStudent,setSelectStudent]=useState()
//   const [payload,setPayload]=useState(
//     {

//     studentFullName: "",
//     admissionNumber: "",
//     studentContact: "",
//     studentAddress: "",
//     guardian_name: "",
//     studentDateOfBirth: "",
//     studentGender: "",
//     studentClass: "",
//     studentSection: "",
//     studentImage: "",
//     fatherName: "",
//     motherName: "",
   
//     studentImage:null
//   }
// )

//   const toggleModal = () => {
//     // setIsOpen(!isOpen);
//     setModalOpen(!modalOpen);
//   };

//   const lastYearStudent=async()=>{
//     setLoading(true)
//     try {
//       const response=await LastYearStudents()
//       console.log("response",response)
// if(response?.allStudent){
//   setSubmittedData(response.allStudent);
//   setLoading(false)
//   // toast.success(response?.message)
// }
// else{
//   toast.error(response?.message)
//   setLoading(false)
// }
//     } catch (error) {
//       console.log("error",error)
//     }
//   }

//   useEffect(()=>{
//     lastYearStudent()
//   },[])
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const payloadData={
//       "studentFullName": payload.studentFullName,
//       "studentEmail":`${payload.studentFullName}${payload.studentContact}@gmail.com`,
//       "studentPassword":  payload.studentContact,
//       "studentDateOfBirth": payload.studentDateOfBirth,
//       "studentGender": payload.studentGender,
//       "studentJoiningDate": moment(Date.now()).format('DD MMMM YYYY'),
//       "studentAddress": payload.studentAddress,
//       "studentContact": payload.studentContact,
//       "studentClass":selectedClass ,
//       "studentSection": payload?.setPayload,
//       "fatherName": payload.fatherName,
//       "motherName": payload.motherName,
//       "parentEmail": `${payload.fatherName}${payload.studentContact}@gmail.com`,
//       "parentPassword":  payload.studentContact,
//       "admissionNumber": payload.admissionNumber,
//       "studentImage":payload.studentImage 
//     }

//     const formDataToSend = new FormData();
//     Object.entries(payloadData).forEach(([key, value]) => {
//       if (key === "studentImage" || key === "parentImage") {
//         if (value) {
//           formDataToSend.append(key, value);
//         }
//       } else {
//         formDataToSend.append(key, String(value ?? ""));
      
//       }    
//     });
//     formDataToSend.append("studentImage", payload.studentImage);
//     formDataToSend.append("parentImage", payload.parentImage);

//     try {

//       const response = await axios.post(
//         "https://eshikshaserver.onrender.com/api/v1/adminRoute/createStudentParent",
//         formDataToSend,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       if(response?.data?.success===true){
//         toast.success("Student added successfully!")
//               toggleModal()
//               setLoading(false);
//               setModalOpen(false);
//             }
    
//     } catch (error) {
//       setLoading(false);
      
//       console.error("Error submitting form:", error);
//     } finally{
//       setLoading(false);
//     }
//   };
//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     const selectedClassObj = getClass?.find(
//       (cls) => cls.className === selectedClassName
//     );

//     if (selectedClassObj) {
//       setAvailableSections(selectedClassObj.sections.split(", "));
//     } else {
//       setAvailableSections([]);
//     }
//   };

//   const handleFilterClassChange = (e) => {
//     setFilterClass(e.target.value);
//   };

//   useEffect(() => {
//     axios
//       .get(
//         `https://eshikshaserver.onrender.com/api/v1/adminRoute/getAllClasses`,
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

//   if(loading){
//     return <LoadingComponent />;
//   }

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPayload({
//         ...payload,
//         studentImage: file,
//       });
//     }
//   };

//   const handleChange=(e)=>{
//    const {name,value}=e.target
//    setPayload(()=>(
//     {
//       ...payload,
//       [name]:value
//     }
//    ))
//   }

//   const filteredData = filterClass
//   ? submittedData?.filter((item) => item.class === filterClass)
//   : submittedData;
//   const modifiedData = filteredData?.map((item) => ({
//     ...item,
//     childName: item.children?.map((child) => child.fullName)?.join("\n"),
//     childAdmissionNo: item.children?.map((child) => child.admissionNumber)
//       .join("\n"),
//   }));

//   const onClickAdmissionReceipt=(val)=>{

//     console.log("first",val)
//     setSelectStudent(val); // Asynchronous state update!
//     setOpenReceipt(true); 

//   }

//   const THEAD = [
    
//     { id: "SN", label: "S No." },
//     { id: "admissionNo", label: "Admission No" },
//     { id: "name", label: "Name" },
//     { id: "fatherName", label: "Father Name" },
//     { id: "class", label: "Class" },
//     { id: "contact", label: "Contact" },
 
//     { id: "action", label: "Action" },
//   ];



//   const tBody = modifiedData.map((val, ind) => ({
//     "SN":ind+1,
//     admissionNo: <span className="text-green-800 font-semibold">
//       {val.admissionNumber}
//     </span>,
//     name: val.fullName,
//     fatherName: val.fatherName,
//     class: val.class,
//     contact: val.contact,
//     feeStatus: val.feeStatus,
//     action: 
//      <span onClick={() =>onClickAdmissionReceipt(val)} className="cursor-pointer">
//         <AiFillEye  className="text-[25px] text-green-700" />
//         </span>
  
//   }));

//   if (loading) {
//     return <Loading />;
// }
//   return (
//     <div className="p-3">
//           <div className=" flex md:flex-row  gap-1">
//    <Button  name="New Admission"   onClick={toggleModal}/>
//    <BulkAdmission 
//     />
//     <div className="">
          
//           <select
//             id="filterClass"
//             value={filterClass}
//             onChange={handleFilterClassChange}
//             className="border rounded py-1"
//           >
//             <option value="">All Classes</option>
//             {getClass?.map((cls, index) => (
//               <option key={index} value={cls.className}>
//                 {cls?.className}
//               </option>
//             ))}
//           </select>
//         </div>
//    </div>
      
//    <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={"Create "}>
//    <form onSubmit={handleSubmit}>
//                   <div
//                    className="mt-2 grid sm:grid-cols-3  md:grid-cols-4  lg:grid-cols-4 grid-cols-2 gap-3 px-1  mx-auto bg-gray-100 rounded-md ">
//                     <Input
//                       type="text"
//                       name="studentFullName"
//                       required={true}
//                       placeholder="studentFullName"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentFullName}
//                     />
//                     <Input
//                       type="text"
//                       name="admissionNumber"
//                       required={false}
//                       placeholder="admissionNumber"
//                       onChange={handleChange}
//                       value={payload.admissionNumber}
//                     />
//                     {/* <Input
//                       type="email"
//                       name="studentEmail"
//                       required={true}
                     
//                       placeholder="studentEmail"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentEmail}
//                     />
//                     <Input
//                       type="password"
//                       name="studentPassword"
//                       required={true}
//                       placeholder="studentPassword"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentPassword}
//                     /> */}
//                     <Input
//                       type="tel"
//                       name="studentContact"
//                       required={true}
//                       placeholder="studentContact"
//                       maxLength={10}
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentContact}
//                     />
//                     {/* <Input
//                       type="tel"
//                       name="alt_mobile_no"
//                       placeholder="alt_mobile_no"
//                       maxLength={10}
//                       onChange={handleChange}
//                       value={payload.alt_mobile_no}
//                     /> */}
//                     <Input
//                       type="text"
//                       name="studentAddress"
//                       placeholder="studentAddress"
//                       onChange={handleChange}
//                       value={payload.studentAddress}
//                     />
//                     {/* <Input
//                       type="text"
//                       name="studentCountry"
                     
//                       placeholder="studentCountry"
//                       onChange={handleChange}
//                       value={payload.studentCountry}
//                     /> */}
//                     {/* <Input
//                       type="text"
//                       name="state"
//                       required={false}
//                       placeholder="state"
//                       onChange={handleChange}
//                       value={payload.state}
//                     /> */}
//                     {/* <Input
//                      type="text"
//                       name="city"
//                       placeholder="city"
//                        onChange={handleChange}
//                        value={payload.city}
//                        /> */}
//                     {/* <Input
//                       type="text"
//                       name="pincode"
//                       required={false}
//                       placeholder="pincode"
//                       onChange={handleChange}
//                       value={payload.pincode}
//                     /> */}
//                     {/* <Input
//                       type="text"
//                       name="nationality"
//                       required={false}
//                       placeholder="nationality"
//                       onChange={handleChange}
//                       value={payload.nationality}
//                     />
//                     <Input
//                       type="text"
//                       name="caste"
//                       required={false}
//                       placeholder="caste"
//                       onChange={handleChange}
//                       value={payload.caste}
//                     />
//                     <Input
//                       type="text"
//                       name="religion"
//                       required={false}
//                       placeholder="religion"
//                       onChange={handleChange}
//                       value={payload.religion}
//                     /> */}
//                     <Input
//                       type="text"
//                       name="guardian_name"
//                       required={false}
//                       placeholder="guardian_name"
//                       onChange={handleChange}
//                       value={payload.guardian_name}
//                     />
//                     {/* <Input
//                       type="text"
//                       name="aadhar_no"
//                       required={false}
//                       placeholder="aadhar_no"
//                       onChange={handleChange}
//                       value={payload.aadhar_no}
//                     /> */}
                    
//                     <div className="flex flex-col space-y-1 mt-[2px]">
//                      <select
//                        name="studentGender"
//                        className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                        onFocus={(e) =>
//                          (e.target.style.borderColor = currentColor)
//                        }
//                        onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                        value={payload.studentGender}
//                        onChange={handleChange}
//                        required
//                      >
//                        <option value="" disabled>
//                       Select a Section
//                        </option>
                       
//                         <option value="Male">
//                         Male
//                       </option>
//                         <option value="Female">
//                         Female
//                       </option>
//                         <option value="Other">
//                         Other
//                       </option>
                     
//                      </select>
//                    </div>
//                     <Input
//                       type="date"
//                       name="studentDateOfBirth"
                     
//                       label="DOB"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentDateOfBirth}
//                     />
//                      <div className="flex flex-col space-y-1 mt-[2px]">
                     
//                       <select
//                         name="studentClass"
//                         className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                         onFocus={(e) =>
//                           (e.target.style.borderColor = currentColor)
//                         }
//                         onBlur={(e) => (e.target.style.borderColor = "#ccc")}
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
//                     <div className="flex flex-col space-y-1 mt-[2px]">
                     
//                       <select
//                         name="studentSection"
//                         className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                         onFocus={(e) =>
//                           (e.target.style.borderColor = currentColor)
//                         }
//                         onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                         value={selectedClass}
//                         onChange={handleClassChange}
//                         required
//                       >
//                         <option value="" disabled>
//                        Select a Section
//                         </option>
//                         {availableSections?.map((item, index) => (
//                          <option key={index} value={item}>
//                          {item}
//                        </option>
//                         ))}
//                       </select>
//                     </div>
//                     <Input
//                       type="file"
//                       name="studentImage"
//                       required={false}
//                       label="Student Image"
//                       onChange={handleImageChange}
//                     />
//                   </div>
//                   <div className="flex flex-row gap-10  justify-center bg-gray-100   text-center">
//                     <span className=" text-xl text-blue-900">
//                       Parent Details
//                     </span>
//                     <FormControlLabel
//                       control={<Switch onClick={() => setsibling(!sibling)} />}
//                       label="Sibling"
//                     />
//                   </div>
//                   {sibling ? (
//                     <div className=" grid  md:grid-cols-6 lg:grid-cols-5 grid-cols-2 gap-3 px-1  mx-auto bg-gray-100 rounded-md ">
//                       <Input
//                         type="text"
//                         name="fatherName"
//                         required={true}
//                         required_field={true}
//                         onChange={handleChange}
//                         value={payload.fatherName}
//                         placeholder="Father's Name"
//                       />
//                       <Input
//                         type="text"
//                         name="motherName"
//                         required={false}
//                         placeholder="Mother's Name"
//                         onChange={handleChange}
//                         value={payload.motherName}

//                       />
//                       {/* <Input
//                         type="email"
//                         name="parentEmail"
//                         required={true}
//                         placeholder="Parent Email"
//                         required_field={true}
//                         onChange={handleChange}
//                         value={payload.parentEmail}
//                       />
//                       <Input
//                         type="password"
//                         name="parentPassword"
//                         required={true}
//                         placeholder="Parent Password"
//                         required_field={true}
//                         onChange={handleChange}
//                         value={payload.parentPassword}
//                       /> */}
//                       {/* <Input
//                         type="tel"
//                         name="parentContact"
//                         required={true}
//                         placeholder="Parent Contact"
//                         required_field={true}
//                         maxLength={10}
//                         onChange={handleChange}
//                         value={payload.parentContact}
//                       /> */}
//                       {/* <Input
//                         type="text"
//                         name="parentIncome"   
//                         placeholder="Parent Income"
//                         onChange={handleChange}
//                         value={payload.parentIncome}
//                       />
//                       <Input
//                         type="text"
//                         name="parentQualification"
                       
//                         placeholder=" Parent Qualification"
//                         onChange={handleChange}
//                         value={payload.parentQualification}
//                       />
//                       <Input
//                         type="file"
//                         name="parentImage"
//                         required={false}
//                         placeholder="Parent Image"
//                         onChange={handleParentImageChange}
//                       /> */}
//                     </div>
//                   ) : (
//                     <div className="  bg-gray-100">
//                       <div className="px-5 md:max-w-[25%] w-full  text-center ">
                        
//                         <Input
//                           type="text"
//                           name="parentAdmissionNumber"
//                           required={true}
//                           placeholder="Parent's Admission Number"
//                           onChange={handleChange}
//                           value={payload.parentAdmissionNumber}
//                         />
//                       </div>
//                     </div>
                    
//                   )}

//                     <div className="mt-4 flex flex-col md:flex-row justify-center gap-2 py-2 px-1" >
//                     <Button name="Submit" 
//                      type="submit"
//                      loading={loading}
//                       width="full" 
                      
//                       />
//                     <Button name="Cancel" 
//                     color="gray"
//                      loading={loading}
//                       width="full" 
//                       onClick={toggleModal}
//                       />
//                     </div>
//                 </form>
//                 </Modal>
//                 <Modal isOpen={openReceipt}  setIsOpen={setOpenReceipt} title={"Admision Receipt "}>
//                 <AdmissionPrint studentValues={selectStudent} />
//                 </Modal>

//       {modifiedData.length > 0 ? (
      
//         <Table
//         tHead={THEAD}
//         tBody={tBody}/>
        
//       ) : (
//         <NoDataFound />
//       )}
      
//     </div>
//   );
// }

// export default Create_Registration_Form;






// import React, { useState, useEffect, useRef } from "react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./index.css";
// import '../../../src/index.css'
// import Switch from "@mui/material/Switch";
// import axios from "axios";
// import "../../Dynamic/Form/FormStyle.css";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Cookies from "js-cookie";
// import NoDataFound from "../../NoDataFound";
// import { FormControlLabel } from "@mui/material";
// import useCustomQuery from "../../useCustomQuery";
// import LoadingComponent from "../../Loading";
// import SomthingwentWrong from "../../SomthingwentWrong";
// import BulkAdmission from "./BulkAdmission";
// import Input from "../../Dynamic/Input";
// import DynamicDataTable from "../../Dynamic/DynamicDataTable";
// import { getAdmissionColumns } from "../../Dynamic/utils/TableUtils";
// import Button from "../../Dynamic/utils/Button";

// // Import react-to-print
// import { useReactToPrint } from 'react-to-print';
// // New import for Modal
// import { Modal } from "@mui/material";

// import { Box } from "@mui/material";
// import { AiFillDelete, AiFillEye, AiFillPrinter } from 'react-icons/ai';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import dayjs from 'dayjs';
// import 'dayjs/locale/en'; // Import the locale
// import Table from "../../Dynamic/Table";
// dayjs.locale('en');
// //Mobile view component
// const MobileRegistrationCard = ({ student, onClose, handleDelete }) => {

//   const uploadPDF = async (pdfBlob) => {
//     // REPLACE THIS WITH YOUR ACTUAL UPLOAD CODE (e.g., Firebase Storage, AWS S3)
//     // This is a placeholder that simulates uploading and returns a temporary URL.
//     // In a real application, you'd use your cloud storage SDK.

//     return new Promise((resolve) => {
//         setTimeout(() => {
//             // Simulate a successful upload and return a dummy URL
//             const dummyURL = "https://example.com/your-uploaded-pdf.pdf"; // Replace with your URL
//             resolve(dummyURL);
//         }, 1500); // Simulate upload delay
//     });
// };





//     const schoolName = sessionStorage.getItem("schoolName");
//     const schoolimage = sessionStorage.getItem("image");
//     const schoolAddress = sessionStorage.getItem("schooladdress");
//     const schoolContact = sessionStorage.getItem("contact");
// console.log("studentstudent",student)
//     // Ref for printing
//     const componentPDF = useRef();

//     // Handle print
//     const handlePrint = useReactToPrint({
//         content: () => componentPDF.current,
//         documentTitle: `Registration_${student.admissionNumber}`,
//         onAfterPrint: () => toast.success("PDF Downloaded Successfully!"),
//     });

//     const handleWhatsAppSharePDF = async () => {
//       const element = componentPDF.current;

//       if (!element) {
//           console.error("Component not found for PDF generation.");
//           toast.error("Failed to generate PDF for sharing.");
//           return;
//       }

//       try {
//           const canvas = await html2canvas(element, {
//               useCORS: true, // Required if images are from different domains
//               scale: 2      // Increase scale for higher resolution
//           });
//           const imgData = canvas.toDataURL('image/png');
//           const pdf = new jsPDF('p', 'mm', 'a4');  // Portrait, millimeters, A4 size
//           const imgWidth = 210;  // A4 width
//           const imgHeight = (canvas.height * imgWidth) / canvas.width; // Keep aspect ratio

//           pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

//           const pdfBlob = pdf.output('blob'); // Create a Blob from the PDF

//           //** Upload the PDF to a server (e.g., Firebase Storage, AWS S3) **
//           toast.info("Uploading PDF..."); // Show a message during upload

//           const pdfURL = await uploadPDF(pdfBlob); // Await the upload and get the URL

//           if (!pdfURL) {
//               toast.error("Failed to upload PDF.");
//               return;
//           }

//           toast.success("PDF uploaded successfully!");

//           // Construct the WhatsApp message with the PDF URL
//           const message = `*${schoolName} Admission Details*\n\n*Admission Number:* ${student.registrationNumber}\n*Student's Name:* ${student.studentFullName}\n*Guardian's Name:* ${student.guardianName}\n*Email:* ${student.studentEmail}\n*Gender:* ${student.gender}\n*Class:* ${student.registerClass}\n*Mobile:* ${student.mobileNumber}\n*Address:* ${student.studentAddress}\n\n${schoolName} - ${schoolAddress} - Contact: ${schoolContact}\n\nCheck out this registration receipt: ${pdfURL}`;
//           const encodedMessage = encodeURIComponent(message);
//           const whatsappURL = `https://wa.me/?text=${encodedMessage}`;

//           // Open a new window/tab for the WhatsApp link
//           window.open(whatsappURL, '_blank');

//       } catch (error) {
//           console.error("Error generating or sharing PDF:", error);
//           toast.error("Error sharing PDF.");
//       }
//   };
//     return (
//         <Modal
//             open={true}
//             onClose={onClose}
//             aria-labelledby="mobile-registration-modal"
//             aria-describedby="mobile-registration-modal-description"
//         >
//             <Box
//                 sx={{
//                     position: 'absolute',
//                     top: '50%',
//                     left: '50%',
//                     transform: 'translate(-50%, -50%)',
//                     width: '90%',
//                     maxWidth: 400, // Increased for better readability
//                     bgcolor: 'background.paper',
//                     border: '1px solid #000',
//                     boxShadow: 24,
//                     p: 2, // Increased padding
//                     overflowY: 'auto',
//                     maxHeight: '95vh', // Slightly larger height
//                 }}
//             >
//                 <div className="w-full flex justify-center">
//                     <div className="max-w-full"> {/* Added max-w-full */}
//                         {/* <div className="border"> */}
//                             <div ref={componentPDF} className=""> {/* Reduced padding for smaller screens */}
//                                 <div className="border border-red-500 p-2 relative"> {/* Reduced padding */}
//                                     <div className="absolute left-2 top-2"> {/* Adjusted positioning */}
//                                         <img
//                                             src={schoolimage}
//                                             alt="Citi Ford School Logo"
//                                             className="w-16 h-16 md:w-20 md:h-20 rounded-full" // Adjusted image size
//                                         />
//                                     </div>
//                                     <div className="flex justify-center">
//                                         <div className="text-center">
//                                             <h1 className="text-xl md:text-2xl font-bold mb-1 text-gray-800"> {/* Reduced font size */}
//                                                 {schoolName}
//                                             </h1>
//                                             <div className="leading-4 md:leading-5">
//                                                 <span className="block text-center text-xs md:text-sm mb-1"> {/* Reduced font size */}
//                                                     {schoolAddress}
//                                                 </span>

//                                                 <span className="block text-center text-xs md:text-sm mb-1"> {/* Reduced font size */}
//                                                     Email:-
//                                                     <br />
//                                                     Contact :- {schoolContact}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                     <div className="text-center">
//                                         <h3 className="text-red-700 font-bold underline text-sm md:text-base"> {/* Reduced font size */}
//                                             [ENGLISH MEDIUM]
//                                         </h3>
//                                     </div>
//                                     <div className="text-center">
//                                         <span className="text-[10px] md:text-[12px]">Session : 2024-25</span> {/* Reduced font size */}
//                                     </div>
//                                     <div className="mb-1 flex justify-between">
//                                         <div className="flex flex-col justify-between">
//                                             <p className="border border-black w-40 md:w-48 p-1 mb-2 text-xs md:text-sm"> {/* Adjusted width and font size */}
//                                                 Admission No :-
//                                                 <span className="text-blue-800 font-bold">
//                                                     {student?.admissionNumber}
//                                                 </span>
//                                             </p>
//                                             <span className="border bg-green-800 text-white p-1 text-center text-xs md:text-sm"> {/* Reduced padding and font size */}
//                                                 APPLICATION FORM RECEIPT
//                                             </span>
//                                         </div>
//                                         <div className="border border-black w-24 h-24 md:w-32 md:h-32 flex items-center justify-center"> {/* Adjusted image container size */}
//                                             <img
//                                                 src={student?.image?.url}
//                                                 alt="img"
//                                                 className="w-full h-full object-contain"
//                                             />
//                                         </div>
//                                     </div>
//                                     <div className="text-[12px] md:text-[14px]"> {/* Reduced font size */}
//                                         <div className="mb-1">
//                                             <tr>
//                                                 <th className="font-semibold text-gray-900 whitespace-nowrap">
//                                                     Name of Student :
//                                                 </th>
//                                                 <td className="border-b border-dashed w-full">
//                                                      {student.fullName}
//                                                 </td>
//                                             </tr>
//                                         </div>

//                                         <div className="flex w-full justify-between mb-1">
//                                             <tr className="w-full">
//                                                 <th className="font-semibold text-gray-900 whitespace-nowrap">
//                                                     Gender :
//                                                 </th>
//                                                 <td className="border-b border-dashed w-full">
//                                                       {student.gender}
//                                                 </td>
//                                             </tr>
//                                             <tr className="w-full">
//                                                 <th className="font-semibold text-gray-900 whitespace-nowrap">
//                                                     Date of Birth :
//                                                 </th>
//                                                 <td className="border-b border-dashed w-full">
//                                                        {dayjs(student?.dateOfBirth).format('DD/MM/YYYY')}
//                                                 </td>
//                                             </tr>
//                                         </div>

//                                         <div className="mb-1">
//                                             <tr>
//                                                 <th className="font-semibold text-gray-900 whitespace-nowrap">
//                                                     Email :
//                                                 </th>
//                                                 <td className="border-b border-dashed w-full">
//                                                       {student.email}
//                                                 </td>
//                                             </tr>
//                                         </div>
//                                         <div className="flex w-full justify-between mb-1">
//                                             <tr className="w-full">
//                                                 <th className="font-semibold text-gray-900 whitespace-nowrap">
//                                                     Father :
//                                                 </th>
//                                                 <td className="border-b border-dashed w-full">
//                                                       {student.fatherName}
//                                                 </td>
//                                             </tr>
//                                             <tr className="w-full">
//                                                 <th className="font-semibold text-gray-900 whitespace-nowrap">
//                                                     Mother :
//                                                 </th>
//                                                 <td className="border-b border-dashed w-full">
//                                                       {student.motherName}
//                                                 </td>
//                                             </tr>
//                                         </div>

//                                         <div className="mb-1">
//                                             <tr>
//                                                 <th className="font-semibold text-gray-900 whitespace-nowrap">
//                                                     Parent Income :
//                                                 </th>
//                                                 <td className="border-b border-dashed w-full">
//                                                       {student.parentIncome}
//                                                 </td>
//                                             </tr>
//                                         </div>
//                                         <div className="mb-1">
//                                             <tr>
//                                                 <th className="font-semibold text-gray-900 whitespace-nowrap">
//                                                     Address :
//                                                 </th>
//                                                 <td className="border-b border-dashed w-full">
//                                                       {student.address},{student.city},
//                                                     {student.state},
//                                                     <span className="text-gray-900 font-bold">
//                                                         {student.pincode}
//                                                     </span>
//                                                 </td>
//                                             </tr>
//                                         </div>
//                                         <div className="mb-1">
//                                             <tr>
//                                                 <th className="font-semibold text-gray-900 whitespace-nowrap">
//                                                     Mobile No. :
//                                                 </th>
//                                                 <td className="border-b border-dashed w-full">
//                                                       {student.contact}
//                                                 </td>
//                                             </tr>
//                                         </div>
//                                         <div className="flex w-full justify-between mb-1">
//                                             <tr className="w-full">
//                                                 <th className="font-semibold text-gray-900 whitespace-nowrap">
//                                                     Caste :
//                                                 </th>
//                                                 <td className="border-b border-dashed w-full">
//                                                       {student.caste}
//                                                 </td>
//                                             </tr>
//                                             <tr className="w-full">
//                                                 <th className="font-semibold text-gray-900 whitespace-nowrap">
//                                                     Religion :
//                                                 </th>
//                                                 <td className="border-b border-dashed w-full">
//                                                       {student.religion}
//                                                 </td>
//                                             </tr>
//                                         </div>
//                                         <div className="flex w-full justify-between mb-1">
//                                             <tr className="w-full">
//                                                 <th className="font-semibold text-gray-900 whitespace-nowrap">
//                                                     Country :
//                                                 </th>
//                                                 <td className="border-b border-dashed w-full">
//                                                       {student.country}
//                                                 </td>
//                                             </tr>
//                                             <tr className="w-full">
//                                                 <th className="font-semibold text-gray-900 whitespace-nowrap">
//                                                     Nationality :
//                                                 </th>
//                                                 <td className="border-b border-dashed w-full">
//                                                       {student.nationality}
//                                                 </td>
//                                             </tr>
//                                         </div>
//                                         <div className="mb-1">
//                                             <tr>
//                                                 <th className="font-semibold text-gray-900 whitespace-nowrap">
//                                                     Class in which admission sought
//                                                 </th>
//                                                 <td className="border-b border-dashed w-full">
//                                                       {student.class}-{student.section}
//                                                 </td>
//                                             </tr>
//                                         </div>
//                                         <div className="flex justify-start mt-2">
//                                             <tr>
//                                                 <th className="font-semibold text-gray-700 whitespace-nowrap">
//                                                     Admission Date :
//                                                 </th>
//                                                 <td className="whitespace-nowrap">
//                                                       {dayjs(student?.joiningDate).format('DD/MM/YYYY')}
//                                                 </td>
//                                             </tr>
//                                         </div>
//                                         <div className="flex justify-end mt-4">
//                                             <tr>
//                                                 <th className="font-semibold text-gray-700 whitespace-nowrap">
//                                                     Principal
//                                                 </th>
//                                             </tr>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         {/* </div> */}
//                     </div>
//                 </div>

//                 {/* Buttons */}
//                 <div className="mt-2 flex justify-between gap-3">
//                     <Button name="Print" onClick={handlePrint} width="full" />
//                     <Button name="Share " onClick={handleWhatsAppSharePDF} width="full" />
//                     <Button name="Close" onClick={onClose} width="full" color="#607093" />

//                 </div>
//             </Box>
//         </Modal>
//     );
// };

// function Create_Registration_Form() {
//     const { currentColor } = useStateContext();
//     const authToken = Cookies.get("token");
//     const [sibling, setsibling] = useState(true);
//     const [loading, setLoading] = useState(false);
//     const [shouldFetchData, setShouldFetchData] = useState(false);
//     const [submittedData, setSubmittedData] = useState([]);
//     const [isOpen, setIsOpen] = useState(false);
//     const [getClass, setGetClass] = useState({});
//     const [selectedClass, setSelectedClass] = useState("");
//     const [availableSections, setAvailableSections] = useState([]);
//     const [parentImagePreview, setParentImagePreview] = useState(null);
//     const [selectedRegistration, setSelectedRegistration] = useState(null); // For mobile modal
//     console.log("selectedRegistration",selectedRegistration)
//     const [payload, setPayload] = useState(
//         {
//             studentFullName: "anand",
//             admissionNumber: "",
//             studentEmail: "",
//             studentPassword: "",
//             studentContact: "9999999999",
//             alt_mobile_no: "77777777777",
//             studentAddress: "bth",
//             studentCountry: "india",
//             state: "bihar",
//             city: "bth",
//             pincode: "845438",
//             nationality: "indian",
//             caste: "OBC",
//             religion: "HIndu",
//             guardian_name: "Guardian",
//             aadhar_no: "2345678998765",
//             aadhar_name: "anand",
//             mothere_tougue: "mother",
//             category: "OBC",
//             minority: "Minority",
//             is_bpl: "bpl",

//             studentDateOfBirth: "17-05-1996",
//             studentGender: "Male",
//             studentJoiningDate: "17-05-2024",
//             studentClass: "III",
//             studentSection: "A",
//             studentImage: "",
//             fatherName: "FatherName",
//             motherName: "motherName",
//             parentEmail: "",
//             parentPassword: "",
//             parentContact: "8767888999",
//             parentIncome: "100000",
//             parentQualification: "BCA",
//             parentImage: "",
//             parentAdmissionNumber: "",
//             studentImage: null
//         }
//     )
//     //use ref for printing
//     const tableRef = useRef();

//     const toggleModal = () => {
//         setIsOpen(!isOpen);
//     };

//     const {
//         queryData: allAdmission,
//         loading: admissionLoading,
//         error: admissionError,
//         refetch: refetchRegistrations,
//     } = useCustomQuery(
//         "https://eshikshaserver.onrender.com/api/v1/adminRoute/getLastYearStudents"
//     );
//     const isMobile = window.innerWidth <= 768;

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const payloadData = {
//             "studentFullName": payload.studentFullName,
//             "studentEmail": payload.studentEmail,
//             "studentPassword": payload.studentPassword,
//             "studentDateOfBirth": payload.studentDateOfBirth,
//             "studentGender": payload.studentGender,
//             "studentJoiningDate": payload.studentJoiningDate,
//             "studentAddress": payload.studentAddress,
//             "studentContact": payload.studentContact,
//             "studentClass": selectedClass,
//             "studentSection": "A",
//             "studentCountry": payload.studentCountry,
//             "studentSubject": "",
//             "fatherName": payload.fatherName,
//             "motherName": payload.motherName,
//             "parentEmail": payload.parentEmail,
//             "parentPassword": payload.parentPassword,
//             "parentContact": payload.parentContact,
//             "parentIncome": payload.parentIncome,
//             "parentQualification": payload.parentQualification,
//             "parentImage": parentImagePreview,
//             "religion": payload.religion,
//             "caste": payload.caste,
//             "nationality": payload.nationality,
//             "pincode": payload.pincode,
//             "state": payload.state,
//             "city": payload.city,
//             "admissionNumber": payload.admissionNumber,
//             "studentImage": payload.studentImage
//         }

//         const formDataToSend = new FormData();
//         Object.entries(payloadData).forEach(([key, value]) => {
//             if (key === "studentImage" || key === "parentImage") {
//                 if (value) {
//                     formDataToSend.append(key, value);
//                 }
//             } else {
//                 formDataToSend.append(key, String(value ?? ""));

//             }
//         });
//         formDataToSend.append("studentImage", payload.studentImage);
//         formDataToSend.append("parentImage", payload.parentImage);

//         try {

//             const response = await axios.post(
//                 "https://eshikshaserver.onrender.com/api/v1/adminRoute/createStudentParent",
//                 formDataToSend,
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                         "Content-Type": "multipart/form-data",
//                     },
//                 }
//             );
//             if (response?.data?.success === true) {
//                 toast.success("Student added successfully!")
//                 toggleModal()
//                 refetchRegistrations();
//                 setLoading(false);
//             }

//         } catch (error) {
//             setLoading(false);

//             console.error("Error submitting form:", error);
//         } finally {
//             setLoading(false);
//         }
//     };
//     const handleClassChange = (e) => {
//         const selectedClassName = e.target.value;
//         setSelectedClass(selectedClassName);
//         const selectedClassObj = getClass?.find(
//             (cls) => cls.className === selectedClassName
//         );

//         if (selectedClassObj) {
//             setAvailableSections(selectedClassObj.sections.split(", "));
//         } else {
//             setAvailableSections([]);
//         }
//     };
//     useEffect(() => {
//         axios
//             .get(
//                 `https://eshikshaserver.onrender.com/api/v1/adminRoute/getAllClasses`,
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                     },
//                 }
//             )
//             .then((response) => {
//                 let classes = response.data.classList;

//                 setGetClass(classes.sort((a, b) => a - b));
//             })
//             .catch((error) => {
//                 console.error("Error fetching data:", error);
//             });
//     }, []);
//     //Hanlde Delete
//     const handleDelete = async (studentEmail) => {
//     const authToken = Cookies.get("token");
//     const ConfirmToast = ({ closeToast }) => (
//       <div style={{ marginTop: '100px' }}> {/* Added inline style */}
//         <p>Are you sure you want to delete this student?</p>
//         <button
//           className="text-red-700 font-bold text-xl"
//           onClick={() => {
//             axios
//               .put(
//                 `https://eshikshaserver.onrender.com/api/v1/adminRoute/deactivateStudent`,
//                 { email: studentEmail },
//                 {
//                   withCredentials: true,
//                   headers: {
//                     Authorization: `Bearer ${authToken}`,
//                   },
//                 }
//               )
//               .then((response) => {
//                 const updatedData = submittedData.filter(
//                   (item) => item.email !== studentEmail
//                 );
//                 setSubmittedData(updatedData);
//                 setShouldFetchData(!shouldFetchData);
//                 refetchRegistrations();
//                 toast.success("Student data deleted successfully");
//                 closeToast();
//               })
//               .catch((error) => {
//                 console.error("Error deleting Student data:", error);
//                 toast.error(
//                   "An error occurred while deleting the Student data.",
//                   error
//                 );
//                 closeToast();
//               });
//           }}
//           style={{ marginRight: "10px" }}
//         >
//           Yes
//         </button>
//         <button onClick={closeToast} className="text-green-800 text-xl">
//           No
//         </button>
//       </div>
//     );
   
//     toast(<ConfirmToast />);
//   };
//     // Handle print
//     const handlePrint = useReactToPrint({
//         content: () => tableRef.current,
//     });

//     useEffect(() => {
//         if (allAdmission) {
//             setSubmittedData(allAdmission.allStudent);
//         }
//     });

//     if (loading) {
//         return <LoadingComponent />;
//     }

//     if (admissionError) {
//         return <SomthingwentWrong />;
//     }

//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setPayload({
//                 ...payload,
//                 studentImage: file,
//             });
//         }
//     };
//     const handleParentImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setPayload({
//                 ...payload,
//                 parentImage: file,
//             });
//         }
//     };
//     const handleChange = (e) => {
//         const { name, value } = e.target
//         setPayload(() => (
//             {
//                 ...payload,
//                 [name]: value
//             }
//         ))
//     }

//     const modifiedData = submittedData?.map((item) => ({
//         ...item,
//         childName: item.children?.map((child) => child.fullName)?.join("\n"),
//         childAdmissionNo: item.children?.map((child) => child.admissionNumber)
//             .join("\n"),
//     }));
//     const renderMobileCards = () => {
//         return (
//             <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//                 {modifiedData.map((student, index) => (
//                     <div
//                         key={index}
//                         className="bg-white rounded-lg shadow-md p-4 relative transition-transform hover:scale-105 cursor-pointer"

//                     >
                     
//                         <div className="absolute top-2 right-2 flex space-x-2 gap-2">  
                           
//                          <span  onClick={() => setSelectedRegistration(student)}>
//                          <AiFillEye  className="text-[25px] text-green-700" />
//                          </span>
//                          <span onClick={() => handleDelete(student.studentEmail)}>
//                          <AiFillDelete  className="text-[25px] text-red-800" />
//                          </span>

//                         </div>
//                         <h3 className="text-lg font-semibold mb-2">
//                             {student.studentFullName}
//                         </h3>

//                         <p>
//                             <strong>Admission No:</strong> {student.admissionNumber}
//                         </p>
//                         <p>
//                             <strong>Guardian Name:</strong> {student.fatherName}
//                         </p>
//                         <p>
//                             <strong>Email:</strong> {student.email}
//                         </p>
//                         <p>
//                             <strong>Class:</strong>{student.class}
//                         </p>
//                         <p>
//                             <strong>Mobile:</strong>{student.contact}
//                         </p>
//                         <p>
//                             <strong>Address:</strong>{student.address}
//                         </p>
//                     </div>
//                 ))}
//             </div>
//         );
//     };


//     // const THEAD=[{
        
//     // }]
//     const THEAD = [
//         { id: "admissionNo", label: "Admission No" },
//         { id: "name", label: "Name" },
//         { id: "fatherName", label: "Father Name" },
//         { id: "class", label: "Class" },
//         { id: "contact", label: "Contact" },
//         // { id: "feeStatus", label: "feeStatus" },
//         // { id: "totalDues", label: "Total Dues" },
//         { id: "action", label: "Action" },
//       ];


//       const tBody = modifiedData.map((val, ind) => ({
//         admissionNo: val.admissionNumber,
//         name: val.fullName,
//         fatherName: val.fatherName,
//         class: val.class,
//         contact: val.contact,
//         feeStatus: val.feeStatus,
        
//         action:  <div className="flex justify-center items-center gap-2"> <span  onClick={() => setSelectedRegistration(student)}>
//         <AiFillEye  className="text-[25px] text-green-700" />
//         </span>
//         <span onClick={() => handleDelete(student.studentEmail)}>
//                          <AiFillDelete  className="text-[25px] text-red-800" />
//                          </span></div>, // Or a button/link with an onClick handler
//       }));



//     return (
//         <div className="p-3">
//             <div className=" flex md:flex-row  gap-2">
//                 <Button name="New Admission" onClick={toggleModal} />
//                 <BulkAdmission refreshRegistrations={refetchRegistrations} />
//             </div>

//             {isOpen && (
//                 <div
//                     id="default-modal"
//                     tabIndex="-1"
//                     aria-hidden="true"
//                     className="fixed top-0 right-0 left-0 z-[99] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//                 >
//                     <div className="relative p-4 w-full  max-h-full" data-aos="fade-down">
//                         <div className="relative  rounded-lg shadow dark:bg-gray-700 overflow-auto ">
//                             <div className="flex items-center justify-between px-2 md:px-2 border-b rounded-t dark:border-gray-600 bg-white">
//                                 <h3
//                                     className="text-[15px] font-semibold  dark:text-white px-5"
//                                     style={{ color: currentColor }}
//                                 >
//                                     Admission Form
//                                 </h3>
//                                 <button
//                                     onClick={toggleModal}
//                                     type="button"
//                                     className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                                 >
//                                     <svg
//                                         className="w-3 h-3"
//                                         aria-hidden="true"
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         fill="none"
//                                         viewBox="0 0 14 14"
//                                     >
//                                         <path
//                                             stroke="currentColor"
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             strokeWidth="2"
//                                             d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
//                                         />
//                                     </svg>
//                                     <span className="sr-only">Close modal</span>
//                                 </button>
//                             </div>
//                             <div className="h-[75vh] sm:h-[70vh] md:h-[70vh] lg:h-[65vh]  overflow-auto  bg-gray-50">
//                                 <form onSubmit={handleSubmit}>
//                                     <div
//                                         className="mt-2 grid sm:grid-cols-3  md:grid-cols-6  lg:grid-cols-6 grid-cols-2 gap-3 px-1  mx-auto bg-gray-100 rounded-md ">
//                                         <Input
//                                             type="text"
//                                             name="studentFullName"
//                                             required={true}
//                                             placeholder="studentFullName"
//                                             required_field={true}
//                                             onChange={handleChange}
//                                             value={payload.studentFullName}
//                                         />
//                                         <Input
//                                             type="text"
//                                             name="admissionNumber"
//                                             required={false}
//                                             placeholder="admissionNumber"
//                                             onChange={handleChange}
//                                             value={payload.admissionNumber}
//                                         />
//                                         <Input
//                                             type="email"
//                                             name="studentEmail"
//                                             required={true}

//                                             placeholder="studentEmail"
//                                             required_field={true}
//                                             onChange={handleChange}
//                                             value={payload.studentEmail}
//                                         />
//                                         <Input
//                                             type="password"
//                                             name="studentPassword"
//                                             required={true}
//                                             placeholder="studentPassword"
//                                             required_field={true}
//                                             onChange={handleChange}
//                                             value={payload.studentPassword}
//                                         />
//                                         <Input
//                                             type="tel"
//                                             name="studentContact"
//                                             required={true}
//                                             placeholder="studentContact"
//                                             maxLength={10}
//                                             required_field={true}
//                                             onChange={handleChange}
//                                             value={payload.studentContact}
//                                         />
//                                         <Input
//                                             type="tel"
//                                             name="alt_mobile_no"
//                                             placeholder="alt_mobile_no"
//                                             maxLength={10}
//                                             onChange={handleChange}
//                                             value={payload.alt_mobile_no}
//                                         />
//                                         <Input
//                                             type="text"
//                                             name="studentAddress"
//                                             placeholder="studentAddress"
//                                             onChange={handleChange}
//                                             value={payload.studentAddress}
//                                         />
//                                         <Input
//                                             type="text"
//                                             name="studentCountry"

//                                             placeholder="studentCountry"
//                                             onChange={handleChange}
//                                             value={payload.studentCountry}
//                                         />
//                                         <Input
//                                             type="text"
//                                             name="state"
//                                             required={false}
//                                             placeholder="state"
//                                             onChange={handleChange}
//                                             value={payload.state}
//                                         />
//                                         <Input
//                                             type="text"
//                                             name="city"
//                                             placeholder="city"
//                                             onChange={handleChange}
//                                             value={payload.city}
//                                         />
//                                         <Input
//                                             type="text"
//                                             name="pincode"
//                                             required={false}
//                                             placeholder="pincode"
//                                             onChange={handleChange}
//                                             value={payload.pincode}
//                                         />
//                                         <Input
//                                             type="text"
//                                             name="nationality"
//                                             required={false}
//                                             placeholder="nationality"
//                                             onChange={handleChange}
//                                             value={payload.nationality}
//                                         />
//                                         <Input
//                                             type="text"
//                                             name="caste"
//                                             required={false}
//                                             placeholder="caste"
//                                             onChange={handleChange}
//                                             value={payload.caste}
//                                         />
//                                         <Input
//                                             type="text"
//                                             name="religion"
//                                             required={false}
//                                             placeholder="religion"
//                                             onChange={handleChange}
//                                             value={payload.religion}
//                                         />
//                                         <Input
//                                             type="text"
//                                             name="guardian_name"
//                                             required={false}
//                                             placeholder="guardian_name"
//                                             onChange={handleChange}
//                                             value={payload.guardian_name}
//                                         />
//                                         <Input
//                                             type="text"
//                                             name="aadhar_no"
//                                             required={false}
//                                             placeholder="aadhar_no"
//                                             onChange={handleChange}
//                                             value={payload.aadhar_no}
//                                         />

//                                         <div className="flex flex-col space-y-1 mt-[2px]">
//                                             <select
//                                                 name="studentGender"
//                                                 className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                                                 onFocus={(e) =>
//                                                     (e.target.style.borderColor = currentColor)
//                                                 }
//                                                 onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                                                 value={payload.studentGender}
//                                                 onChange={handleChange}
//                                                 required
//                                             >
//                                                 <option value="" disabled>
//                                                     Select a Section
//                                                 </option>

//                                                 <option value="Male">
//                                                     Male
//                                                 </option>
//                                                 <option value="Female">
//                                                     Female
//                                                 </option>
//                                                 <option value="Other">
//                                                     Other
//                                                 </option>

//                                             </select>
//                                         </div>
//                                         <Input
//                                             type="date"
//                                             name="studentJoiningDate"

//                                             label="Admission Date"
//                                             required_field={true}
//                                             onChange={handleChange}
//                                             value={payload.studentJoiningDate}
//                                         />
//                                         <div className="flex flex-col space-y-1 mt-[2px]">

//                                             <select
//                                                 name="studentClass"
//                                                 className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                                                 onFocus={(e) =>
//                                                     (e.target.style.borderColor = currentColor)
//                                                 }
//                                                 onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                                                 value={selectedClass}
//                                                 onChange={handleClassChange}
//                                                 required
//                                             >
//                                                 <option value="" disabled>
//                                                     Select a Class
//                                                 </option>
//                                                 {getClass?.map((cls, index) => (
//                                                     <option key={index} value={cls.className}>
//                                                         {cls?.className}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </div>
//                                         <div className="flex flex-col space-y-1 mt-[2px]">

//                                             <select
//                                                 name="studentSection"
//                                                 className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                                                 onFocus={(e) =>
//                                                     (e.target.style.borderColor = currentColor)
//                                                 }
//                                                 onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                                                 value={selectedClass}
//                                                 onChange={handleClassChange}
//                                                 required
//                                             >
//                                                 <option value="" disabled>
//                                                     Select a Section
//                                                 </option>
//                                                 {availableSections?.map((item, index) => (
//                                                     <option key={index} value={item}>
//                                                         {item}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </div>
//                                         <Input
//                                             type="file"
//                                             name="studentImage"
//                                             required={false}
//                                             label="Student Image"
//                                             onChange={handleImageChange}
//                                         />
//                                     </div>
//                                     <div className="flex flex-row gap-10  justify-center bg-gray-100   text-center">
//                                         <span className=" text-xl text-blue-900">
//                                             Parent Details
//                                         </span>
//                                         <FormControlLabel
//                                             control={<Switch onClick={() => setsibling(!sibling)} />}
//                                             label="Sibling"
//                                         />
//                                     </div>
//                                     {sibling ? (
//                                         <div className=" grid  md:grid-cols-6 lg:grid-cols-5 grid-cols-2 gap-3 px-1  
//                                         mx-auto bg-gray-100 rounded-md ">
//                                             <Input
//                                                 type="text"
//                                                 name="fatherName"
//                                                 required={true}
//                                                 required_field={true}
//                                                 onChange={handleChange}
//                                                 value={payload.fatherName}
//                                                 placeholder="Father's Name"
//                                             />
//                                             <Input
//                                                 type="text"
//                                                 name="motherName"
//                                                 required={false}
//                                                 placeholder="Mother's Name"
//                                                 onChange={handleChange}
//                                                 value={payload.motherName}

//                                             />
//                                             <Input
//                                                 type="email"
//                                                 name="parentEmail"
//                                                 required={true}
//                                                 placeholder="Parent Email"
//                                                 required_field={true}
//                                                 onChange={handleChange}
//                                                 value={payload.parentEmail}
//                                             />
//                                             <Input
//                                                 type="password"
//                                                 name="parentPassword"
//                                                 required={true}
//                                                 placeholder="Parent Password"
//                                                 required_field={true}
//                                                 onChange={handleChange}
//                                                 value={payload.parentPassword}
//                                             />
//                                             <Input
//                                                 type="tel"
//                                                 name="parentContact"
//                                                 required={true}
//                                                 placeholder="Parent Contact"
//                                                 required_field={true}
//                                                 maxLength={10}
//                                                 onChange={handleChange}
//                                                 value={payload.parentContact}
//                                             />
//                                             <Input
//                                                 type="text"
//                                                 name="parentIncome"
//                                                 placeholder="Parent Income"
//                                                 onChange={handleChange}
//                                                 value={payload.parentIncome}
//                                             />
//                                             <Input
//                                                 type="text"
//                                                 name="parentQualification"

//                                                 placeholder=" Parent Qualification"
//                                                 onChange={handleChange}
//                                                 value={payload.parentQualification}
//                                             />
//                                             <Input
//                                                 type="file"
//                                                 name="parentImage"
//                                                 required={false}
//                                                 placeholder="Parent Image"
//                                                 onChange={handleParentImageChange}
//                                             />
//                                         </div>
//                                     ) : (
//                                         <div className="  bg-gray-100">
//                                             <div className="px-5 md:max-w-[25%] w-full  text-center ">

//                                                 <Input
//                                                     type="text"
//                                                     name="parentAdmissionNumber"
//                                                     required={true}
//                                                     placeholder="Parent's Admission Number"
//                                                     onChange={handleChange}
//                                                     value={payload.parentAdmissionNumber}
//                                                 />
//                                             </div>
//                                         </div>

//                                     )}

//                                     <div className="mt-4 flex flex-col md:flex-row justify-center gap-2 py-2 px-1" >
//                                         <Button name="Submit"
//                                             type="submit"
//                                             loading={loading}
//                                             width="full"

//                                         />
//                                         <Button name="Cancel"
//                                             color="gray"
//                                             loading={loading}
//                                             width="full"
//                                             onClick={toggleModal}
//                                         />
//                                     </div>
//                                 </form>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
// {console.log("modifiedData",modifiedData)}

//             <>
//                 {isMobile ? (
//                     <>
//                         {modifiedData && modifiedData.length > 0 ? (
//                             renderMobileCards()
//                         ) : (
//                             <NoDataFound />
//                         )}
//                         {selectedRegistration && (
//                             <MobileRegistrationCard
//                                 student={selectedRegistration}
//                                 onClose={() => setSelectedRegistration(null)}
//                                 handleDelete={handleDelete}
//                             />
//                         )}
//                     </>
//                 ) : (
                    
//                     <div ref={tableRef}>
//                         {modifiedData.length > 0 ? (
//                             <Table
//                             tHead={THEAD}
//                             tBody={tBody}
                              
//                             />
//                             // <DynamicDataTable
//                             //     data={modifiedData}
//                             //     columns={getAdmissionColumns(handleDelete)}
//                             //     handleDelete={handleDelete}
//                             //     className="w-full overflow-auto"
//                             //     itemsPerPage={15}
//                             // />

//                         ) : (
//                             <NoDataFound />
//                         )}
//                     </div>
//                 )}
//             </>


//         </div>
//     );
// }

// export default Create_Registration_Form;




// import React, { useState, useEffect, useRef } from "react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./index.css";
// import '../../../src/index.css'
// import Switch from "@mui/material/Switch";
// import axios from "axios";
// import "../../Dynamic/Form/FormStyle.css";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Cookies from "js-cookie";
// import NoDataFound from "../../NoDataFound";
// import { FormControlLabel } from "@mui/material";
// import useCustomQuery from "../../useCustomQuery";
// import LoadingComponent from "../../Loading";
// import SomthingwentWrong from "../../SomthingwentWrong";
// import BulkAdmission from "./BulkAdmission";
// import Input from "../../Dynamic/Input";
// import DynamicDataTable from "../../Dynamic/DynamicDataTable";
// import { getAdmissionColumns } from "../../Dynamic/utils/TableUtils";
// import Button from "../../Dynamic/utils/Button";

// // Import react-to-print
// import { useReactToPrint } from 'react-to-print';
// // New import for Modal
// import { Modal } from "@mui/material";

// import { Box } from "@mui/material";
// import { AiFillDelete, AiFillEye, AiFillPrinter } from 'react-icons/ai';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// //Mobile view component
// const MobileRegistrationCard = ({ student, onClose, handleDelete }) => {
//   console.log("firststudent",student)
//   const schoolName = sessionStorage.getItem("schoolName");
//   const schoolimage = sessionStorage.getItem("image");
//   const schoolAddress = sessionStorage.getItem("schooladdress");
//   const schoolContact = sessionStorage.getItem("contact");

//   // Ref for printing
//   const componentPDF = useRef();

//   // Handle print
//   const handlePrint = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `Registration_${student.registrationNumber}`,
//     onAfterPrint: () => toast.success("PDF Downloaded Successfully!"),
//   });

//   return (
//     <Modal
//       open={true}
//       onClose={onClose}
//       aria-labelledby="mobile-registration-modal"
//       aria-describedby="mobile-registration-modal-description"
//     >
//       <Box
//         sx={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%)',
//           width: '90%', // Mobile ke liye width 90% rakhi hai
//           maxWidth: 350, // Maximum width ko aur chhota kiya
//           bgcolor: 'background.paper',
//           border: '1px solid #000', // Border thickness reduced
//           boxShadow: 24,
//           p: 1, // Padding aur bhi reduce kiya
//           overflowY: 'auto', // Scrolling enable hai
//           maxHeight: '90vh', // Maximum height to fit within the screen
//         }}
//       >
       



//         <div className="w-full flex justify-center" ref={componentPDF} style={{ width: "100%" }}>
//         <div className="a4 ">
//            <div className="content border m-1">
//              <div
//                ref={componentPDF}
//                className="p-12 "
//              >
//                <div className="border border-red-500 p-5 relative">
//                  <div class=" absolute  left-5 ">
//                    <img
//                      src={schoolimage}
//                      alt="Citi Ford School Logo"
//                      class="md:w-36 md:h-36 h-20 w-20 mx-auto rounded-full"
//                    />
//                  </div>
//                  <div class="flex  justify-center inset-0 rounded-md z-50">
//                    <div class="md:w-7/12 w-10/12 text-center">
//                      <h1 class="md:text-3xl text-lg font-bold mb-2 text-center text-gray-800 dark:text-white">
//                        {schoolName}
//                      </h1>
//                      <div class="text- leading-5 ">
//                        <span class="block text-center mb-1  ">
//                          {schoolAddress}
//                        </span>
   
//                        <span class="block text-center mb-1">
//                          Email:- 
//                          <br />
//                          Contact :- {schoolContact}
//                        </span>
//                      </div>
//                    </div>
//                  </div>
//                  <center>
//                    <h3 class="text-red-700 font-bold underline">
//                      [ENGLISH MEDIUM]
//                    </h3>
//                  </center>
//                  <center>
//                    <span class="text-[12px ]">Session : 2024-25</span>
//                  </center>
//                  <div class="mb-1 rounded-md flex justify-between">
//                    <div class="flex flex-col justify-between">
//                      <p class="border border-black w-52 p-2 mb-4">
//                        Admission No :-{" "}
//                        <span className="text-blue-800 font-bold">
//                          {student?.admissionNumber}
//                        </span>
//                      </p>
//                      <span class="border bg-green-800 text-white p-2">
//                        APPLICATION FORM RECEIPT
//                      </span>
//                    </div>
//                    <div class="border border-black w-36 h-36 flex items-center justify-center">
//                      <img
//                        src={student.image?.url}
//                        alt="img"
//                        className="w-full h-full object-contain"
//                      />
//                    </div>
//                  </div>
//                  <div className="dark:text-white text-[16px]">
//                    <div className="mb-3">
//                      <tr class="">
//                        <th
//                          scope="row"
//                          class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                        >
//                          Name of Student :
//                        </th>
//                        <td class=" border-b-2 border-dashed w-full">
//                          &nbsp;{student.fullName}
//                        </td>
//                      </tr>
//                    </div>
   
//                    <div className="">
//                      <div className="mb-3 flex w-full justify-between">
//                        <tr class="w-full">
//                          <th
//                            scope="row"
//                            class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                          >
//                            Gender :
//                          </th>
//                          <td class=" border-b-2 border-dashed w-full">
//                            &nbsp; {student.gender}
//                          </td>
//                        </tr>
//                        <tr class="w-full ">
//                          <th
//                            scope="row"
//                            class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                          >
//                            Date of Birth :
//                          </th>
//                          <td class="  border-b-2 border-dashed w-full">
                          
//                          </td>
//                        </tr>
//                      </div>
   
//                      <div className="mb-3">
//                        <tr class="">
//                          <th
//                            scope="row"
//                            class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                          >
//                            Email :
//                          </th>
//                          <td class=" border-b-2 border-dashed w-full">
//                            &nbsp; {student.email}
//                          </td>
//                        </tr>
//                      </div>
//                      <div className="mb-3 flex w-full justify-between">
//                        <tr class="w-full">
//                          <th
//                            scope="row"
//                            class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                          >
//                            Father :
//                          </th>
//                          <td class=" border-b-2 border-dashed w-full">
//                            &nbsp; {student.fatherName}
//                          </td>
//                        </tr>
//                        <tr class="w-full ">
//                          <th
//                            scope="row"
//                            class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                          >
//                            Mother :
//                          </th>
//                          <td class="  border-b-2 border-dashed w-full">
//                            &nbsp; {student.motherName}
//                          </td>
//                        </tr>
//                      </div>
   
//                      <div className="mb-3">
//                        <tr class="">
//                          <th
//                            scope="row"
//                            class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                          >
//                            Occupation Father :
//                          </th>
//                          <td class=" border-b-2 border-dashed w-full">
//                            &nbsp; {student.fatherName}
//                          </td>
//                        </tr>
//                      </div>
//                      <div className="mb-3">
//                        <tr class="">
//                          <th
//                            scope="row"
//                            class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                          >
//                            Address :
//                          </th>
//                          <td class=" border-b-2 border-dashed w-full">
//                            &nbsp; {student.address},{student.city},
//                            {student.state},
//                            <span className="text-gray-900 font-bold">
//                              {student.pincode}
//                            </span>
//                          </td>
//                        </tr>
//                      </div>
//                      <div className="mb-3">
//                        <tr class="">
//                          <th
//                            scope="row"
//                            class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                          >
//                            Mobile No. : 
//                          </th>
//                          <td class=" border-b-2 border-dashed w-full">
//                            &nbsp; {student.contact}
//                          </td>
//                        </tr>
//                      </div>
//                      <div className="mb-3 flex w-full justify-between">
//                        <tr class="w-full ">
//                          <th
//                            scope="row"
//                            class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                          >
//                            Caste :
//                          </th>
//                          <td class="  border-b-2 border-dashed w-full">
//                            &nbsp; {student.caste}
//                          </td>
//                        </tr>
//                        <tr class="w-full">
//                          <th
//                            scope="row"
//                            class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                          >
//                            Religion :
//                          </th>
//                          <td class=" border-b-2 border-dashed w-full">
//                            &nbsp; {student.religion}
//                          </td>
//                        </tr>
//                      </div>
//                      <div className="mb-3 flex w-full justify-between">
//                        <tr class="w-full ">
//                          <th
//                            scope="row"
//                            class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                          >
//                            Country :
//                          </th>
//                          <td class="  border-b-2 border-dashed w-full">
//                            &nbsp; {student.country}
//                          </td>
//                        </tr>
//                        <tr class="w-full">
//                          <th
//                            scope="row"
//                            class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                          >
//                            Nationality :
//                          </th>
//                          <td class=" border-b-2 border-dashed w-full">
//                            &nbsp; {student.nationality}
//                          </td>
//                        </tr>
//                      </div>
//                      <div className="mb-3">
//                        <tr class="">
//                          <th
//                            scope="row"
//                            class=" font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
//                          >
//                            Class in which admission sought
//                          </th>
//                          <td class=" border-b-2 border-dashed w-full">
//                            &nbsp; {student.class}-{student.section}
//                          </td>
//                        </tr>
//                      </div>
//                      <div className=" flex justify-start mt-4 ">
//                        <tr class="">
//                          <th
//                            scope="row"
//                            class=" font-semibold  text-gray-700 dark:text-white whitespace-nowrap"
//                          >
//                            Admission Date :
                          
//                          </th>
//                        </tr>
//                      </div>
//                      <div className=" flex justify-end ">
//                        <tr class="mt-10">
//                          <th
//                            scope="row"
//                            class=" font-semibold  text-gray-700 dark:text-white whitespace-nowrap"
//                          >
//                            Principal
//                          </th>
//                        </tr>
//                      </div>
//                    </div>
//                  </div>
//                </div>
//              </div>
//            </div>
//          </div>
//         </div>





//         {/* Buttons */}
//         <div className="mt-2 flex justify-between gap-3">
//         <Button name="Print" onClick={handlePrint} width="full" />
//         <Button  name="Close" onClick={onClose} width="full" color="#607093"  />
         
//         </div>
//       </Box>
//     </Modal>
//   );
// };
// function Create_Registration_Form() {
//   const { currentColor } = useStateContext();
//   const authToken = Cookies.get("token");
//   const [sibling, setsibling] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [shouldFetchData, setShouldFetchData] = useState(false);
//   const [submittedData, setSubmittedData] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [getClass, setGetClass] = useState({});
//   const [selectedClass, setSelectedClass] = useState("");
//   const [availableSections, setAvailableSections] = useState([]);
//   const [parentImagePreview, setParentImagePreview] = useState(null);
//   const [selectedRegistration, setSelectedRegistration] = useState(null); // For mobile modal
//   const [payload,setPayload]=useState(
//     {

//     studentFullName: "anand",
//     admissionNumber: "",
//     studentEmail: "",
//     studentPassword: "",
//     studentContact: "9999999999",
//     alt_mobile_no: "77777777777",
//     studentAddress: "bth",
//     studentCountry: "india",
//     state: "bihar",
//     city: "bth",
//     pincode: "845438",
//     nationality: "indian",
//     caste: "OBC",
//     religion: "HIndu",
//     guardian_name: "Guardian",
//     aadhar_no: "2345678998765",
//     aadhar_name: "anand",
//     mothere_tougue: "mother",
//     category: "OBC",
//     minority: "Minority",
//     is_bpl: "bpl",
   
//     studentDateOfBirth: "17-05-1996",
//     studentGender: "Male",
//     studentJoiningDate: "17-05-2024",
//     studentClass: "III",
//     studentSection: "A",
//     studentImage: "",
//     fatherName: "FatherName",
//     motherName: "motherName",
//     parentEmail: "",
//     parentPassword: "",
//     parentContact: "8767888999",
//     parentIncome: "100000",
//     parentQualification: "BCA",
//     parentImage: "",
//     parentAdmissionNumber: "",
//     studentImage:null
//   }
// )
// //use ref for printing
// const tableRef = useRef();

//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };

//   const {
//     queryData: allAdmission,
//     loading: admissionLoading,
//     error: admissionError,
//     refetch: refetchRegistrations,
//   } = useCustomQuery(
//     "https://eshikshaserver.onrender.com/api/v1/adminRoute/getLastYearStudents"
//   );
//    const isMobile = window.innerWidth <= 768;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const payloadData={
//       "studentFullName": payload.studentFullName,
//       "studentEmail": payload.studentEmail,
//       "studentPassword":  payload.studentPassword,
//       "studentDateOfBirth": payload.studentDateOfBirth,
//       "studentGender": payload.studentGender,
//       "studentJoiningDate": payload.studentJoiningDate,
//       "studentAddress": payload.studentAddress,
//       "studentContact": payload.studentContact,
//       "studentClass":selectedClass ,
//       "studentSection": "A",
//       "studentCountry": payload.studentCountry,
//       "studentSubject": "",
//       "fatherName": payload.fatherName,
//       "motherName": payload.motherName,
//       "parentEmail": payload.parentEmail,
//       "parentPassword":  payload.parentPassword,
//       "parentContact":  payload.parentContact,
//       "parentIncome":payload.parentIncome,
//       "parentQualification":payload.parentQualification,
//       "parentImage": parentImagePreview,
//       "religion": payload.religion,
//       "caste":payload.caste,
//       "nationality": payload.nationality,
//       "pincode": payload.pincode,
//       "state":  payload.state,
//       "city": payload.city,
//       "admissionNumber": payload.admissionNumber,
//       "studentImage":payload.studentImage 
//     }

//     const formDataToSend = new FormData();
//     Object.entries(payloadData).forEach(([key, value]) => {
//       if (key === "studentImage" || key === "parentImage") {
//         if (value) {
//           formDataToSend.append(key, value);
//         }
//       } else {
//         formDataToSend.append(key, String(value ?? ""));
      
//       }    
//     });
//     formDataToSend.append("studentImage", payload.studentImage);
//     formDataToSend.append("parentImage", payload.parentImage);

//     try {

//       const response = await axios.post(
//         "https://eshikshaserver.onrender.com/api/v1/adminRoute/createStudentParent",
//         formDataToSend,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       if(response?.data?.success===true){
//         toast.success("Student added successfully!")
//               toggleModal()
//               refetchRegistrations();
//               setLoading(false);
//             }
    
//     } catch (error) {
//       setLoading(false);
      
//       console.error("Error submitting form:", error);
//     } finally{
//       setLoading(false);
//     }
//   };
//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     const selectedClassObj = getClass?.find(
//       (cls) => cls.className === selectedClassName
//     );

//     if (selectedClassObj) {
//       setAvailableSections(selectedClassObj.sections.split(", "));
//     } else {
//       setAvailableSections([]);
//     }
//   };
//   useEffect(() => {
//     axios
//       .get(
//         `https://eshikshaserver.onrender.com/api/v1/adminRoute/getAllClasses`,
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
//     //Hanlde Delete
//   const handleDelete = async (email) => {
//     const authToken = Cookies.get("token");
//     const ConfirmToast = ({ closeToast }) => (
//       <div>
//         <p>Are you sure you want to delete this student?</p>
//         <button
//           className="text-red-700 font-bold text-xl"
//           onClick={() => {
//             axios
//               .put(
//                 `https://eshikshaserver.onrender.com/api/v1/adminRoute/deactivateStudent`,
//                 { email },
//                 {
//                   withCredentials: true,
//                   headers: {
//                     Authorization: `Bearer ${authToken}`,
//                   },
//                 }
//               )
//               .then((response) => {
//                 const updatedData = submittedData.filter(
//                   (item) => item.email !== email
//                 );
//                 setSubmittedData(updatedData);
//                 setShouldFetchData(!shouldFetchData);
//                 refetchRegistrations();
//                 toast.success("Student data deleted successfully");
//                 closeToast();
//               })
//               .catch((error) => {
//                 console.error("Error deleting Student data:", error);
//                 toast.error(
//                   "An error occurred while deleting the Student data.",
//                   error
//                 );
//                 closeToast();
//               });
//           }}
//           style={{ marginRight: "10px" }}
//         >
//           Yes
//         </button>
//         <button onClick={closeToast} className="text-green-800 text-xl">
//           No
//         </button>
//       </div>
//     );
//     toast(<ConfirmToast />);
//   };
//    // Handle print
//   const handlePrint = useReactToPrint({
//     content: () => tableRef.current,
//   });

//   useEffect(() => {
//     if (allAdmission) {
//       setSubmittedData(allAdmission.allStudent);
//     }
//   });

//   if(loading){
//     return <LoadingComponent />;
//   }

//   if (admissionError) {
//     return <SomthingwentWrong />;
//   }

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPayload({
//         ...payload,
//         studentImage: file,
//       });
//     }
//   };
//   const handleParentImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPayload({
//         ...payload,
//         parentImage: file,
//       });
//     }
//   };
//   const handleChange=(e)=>{
//    const {name,value}=e.target
//    setPayload(()=>(
//     {
//       ...payload,
//       [name]:value
//     }
//    ))
//   }

//   const modifiedData = submittedData?.map((item) => ({
//     ...item,
//     childName: item.children?.map((child) => child.fullName)?.join("\n"),
//     childAdmissionNo: item.children?.map((child) => child.admissionNumber)
//       .join("\n"),
//   }));
//     const renderMobileCards = () => {
//         return (
//             <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//                 {modifiedData.map((student, index) => (
//                     <div
//                         key={index}
//                         className="bg-white rounded-lg shadow-md p-4 relative transition-transform hover:scale-105 cursor-pointer"

//                     >
//                         <div className="absolute top-2 right-2 flex space-x-2 gap-2">  {/* Position the buttons top right */}
//                         <Button name="Delete"  onClick={() => handleDelete(student.studentEmail)}width="full" color="red" />
//                         <Button name="View"  onClick={() => setSelectedRegistration(student)} width="full" />
//                          <Button name="Print"  onClick={() => handlePrint(student)} width="full" />
                            
//                         </div>
//                         <h3 className="text-lg font-semibold mb-2">
//                             {student.studentFullName}
//                         </h3>

//                         <p>
//                             <strong>Reg No:</strong> {student.admissionNumber}
//                         </p>
//                         <p>
//                             <strong>Guardian Name:</strong> {student.guardian_name}
//                         </p>
//                         <p>
//                             <strong>Email:</strong> {student.studentEmail}
//                         </p>
//                         <p>
//                             <strong>Class:</strong>{student.studentClass}
//                         </p>
//                         <p>
//                             <strong>Mobile:</strong>{student.studentContact}
//                         </p>
//                         <p>
//                             <strong>Address:</strong>{student.studentAddress}
//                         </p>
//                     </div>
//                 ))}
//             </div>
//         );
//     };

//   return (
//     <div className="p-3">
//           <div className=" flex md:flex-row  gap-2">
//    <Button name="New Admission"   onClick={toggleModal}/>
//    <BulkAdmission refreshRegistrations={refetchRegistrations} />
//    </div>
    
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full  max-h-full" data-aos="fade-down">
//             <div className="relative  rounded-lg shadow dark:bg-gray-700 overflow-auto ">
//               <div className="flex items-center justify-between px-2 md:px-2 border-b rounded-t dark:border-gray-600 bg-white">
//                 <h3
//                   className="text-[15px] font-semibold  dark:text-white px-5"
//                   style={{ color: currentColor }}
//                 >
//                   Admission Form
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
//               <div className="h-[75vh] sm:h-[70vh] md:h-[70vh] lg:h-[65vh]  overflow-auto  bg-gray-50">
//                 <form onSubmit={handleSubmit}>
//                   <div
//                    className="mt-2 grid sm:grid-cols-3  md:grid-cols-6  lg:grid-cols-6 grid-cols-2 gap-3 px-1  mx-auto bg-gray-100 rounded-md ">
//                     <Input
//                       type="text"
//                       name="studentFullName"
//                       required={true}
//                       placeholder="studentFullName"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentFullName}
//                     />
//                     <Input
//                       type="text"
//                       name="admissionNumber"
//                       required={false}
//                       placeholder="admissionNumber"
//                       onChange={handleChange}
//                       value={payload.admissionNumber}
//                     />
//                     <Input
//                       type="email"
//                       name="studentEmail"
//                       required={true}
                     
//                       placeholder="studentEmail"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentEmail}
//                     />
//                     <Input
//                       type="password"
//                       name="studentPassword"
//                       required={true}
//                       placeholder="studentPassword"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentPassword}
//                     />
//                     <Input
//                       type="tel"
//                       name="studentContact"
//                       required={true}
//                       placeholder="studentContact"
//                       maxLength={10}
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentContact}
//                     />
//                     <Input
//                       type="tel"
//                       name="alt_mobile_no"
//                       placeholder="alt_mobile_no"
//                       maxLength={10}
//                       onChange={handleChange}
//                       value={payload.alt_mobile_no}
//                     />
//                     <Input
//                       type="text"
//                       name="studentAddress"
//                       placeholder="studentAddress"
//                       onChange={handleChange}
//                       value={payload.studentAddress}
//                     />
//                     <Input
//                       type="text"
//                       name="studentCountry"
                     
//                       placeholder="studentCountry"
//                       onChange={handleChange}
//                       value={payload.studentCountry}
//                     />
//                     <Input
//                       type="text"
//                       name="state"
//                       required={false}
//                       placeholder="state"
//                       onChange={handleChange}
//                       value={payload.state}
//                     />
//                     <Input
//                      type="text"
//                       name="city"
//                       placeholder="city"
//                        onChange={handleChange}
//                        value={payload.city}
//                        />
//                     <Input
//                       type="text"
//                       name="pincode"
//                       required={false}
//                       placeholder="pincode"
//                       onChange={handleChange}
//                       value={payload.pincode}
//                     />
//                     <Input
//                       type="text"
//                       name="nationality"
//                       required={false}
//                       placeholder="nationality"
//                       onChange={handleChange}
//                       value={payload.nationality}
//                     />
//                     <Input
//                       type="text"
//                       name="caste"
//                       required={false}
//                       placeholder="caste"
//                       onChange={handleChange}
//                       value={payload.caste}
//                     />
//                     <Input
//                       type="text"
//                       name="religion"
//                       required={false}
//                       placeholder="religion"
//                       onChange={handleChange}
//                       value={payload.religion}
//                     />
//                     <Input
//                       type="text"
//                       name="guardian_name"
//                       required={false}
//                       placeholder="guardian_name"
//                       onChange={handleChange}
//                       value={payload.guardian_name}
//                     />
//                     <Input
//                       type="text"
//                       name="aadhar_no"
//                       required={false}
//                       placeholder="aadhar_no"
//                       onChange={handleChange}
//                       value={payload.aadhar_no}
//                     />
                    
//                     <div className="flex flex-col space-y-1 mt-[2px]">
//                      <select
//                        name="studentGender"
//                        className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                        onFocus={(e) =>
//                          (e.target.style.borderColor = currentColor)
//                        }
//                        onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                        value={payload.studentGender}
//                        onChange={handleChange}
//                        required
//                      >
//                        <option value="" disabled>
//                       Select a Section
//                        </option>
                       
//                         <option value="Male">
//                         Male
//                       </option>
//                         <option value="Female">
//                         Female
//                       </option>
//                         <option value="Other">
//                         Other
//                       </option>
                     
//                      </select>
//                    </div>
//                     <Input
//                       type="date"
//                       name="studentJoiningDate"
                     
//                       label="Admission Date"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentJoiningDate}
//                     />
//                      <div className="flex flex-col space-y-1 mt-[2px]">
                     
//                       <select
//                         name="studentClass"
//                         className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                         onFocus={(e) =>
//                           (e.target.style.borderColor = currentColor)
//                         }
//                         onBlur={(e) => (e.target.style.borderColor = "#ccc")}
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
//                     <div className="flex flex-col space-y-1 mt-[2px]">
                     
//                       <select
//                         name="studentSection"
//                         className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                         onFocus={(e) =>
//                           (e.target.style.borderColor = currentColor)
//                         }
//                         onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                         value={selectedClass}
//                         onChange={handleClassChange}
//                         required
//                       >
//                         <option value="" disabled>
//                        Select a Section
//                         </option>
//                         {availableSections?.map((item, index) => (
//                          <option key={index} value={item}>
//                          {item}
//                        </option>
//                         ))}
//                       </select>
//                     </div>
//                     <Input
//                       type="file"
//                       name="studentImage"
//                       required={false}
//                       label="Student Image"
//                       onChange={handleImageChange}
//                     />
//                   </div>
//                   <div className="flex flex-row gap-10  justify-center bg-gray-100   text-center">
//                     <span className=" text-xl text-blue-900">
//                       Parent Details
//                     </span>
//                     <FormControlLabel
//                       control={<Switch onClick={() => setsibling(!sibling)} />}
//                       label="Sibling"
//                     />
//                   </div>
//                   {sibling ? (
//                     <div className=" grid  md:grid-cols-6 lg:grid-cols-5 grid-cols-2 gap-3 px-1  mx-auto bg-gray-100 rounded-md ">
//                       <Input
//                         type="text"
//                         name="fatherName"
//                         required={true}
//                         required_field={true}
//                         onChange={handleChange}
//                         value={payload.fatherName}
//                         placeholder="Father's Name"
//                       />
//                       <Input
//                         type="text"
//                         name="motherName"
//                         required={false}
//                         placeholder="Mother's Name"
//                         onChange={handleChange}
//                         value={payload.motherName}

//                       />
//                       <Input
//                         type="email"
//                         name="parentEmail"
//                         required={true}
//                         placeholder="Parent Email"
//                         required_field={true}
//                         onChange={handleChange}
//                         value={payload.parentEmail}
//                       />
//                       <Input
//                         type="password"
//                         name="parentPassword"
//                         required={true}
//                         placeholder="Parent Password"
//                         required_field={true}
//                         onChange={handleChange}
//                         value={payload.parentPassword}
//                       />
//                       <Input
//                         type="tel"
//                         name="parentContact"
//                         required={true}
//                         placeholder="Parent Contact"
//                         required_field={true}
//                         maxLength={10}
//                         onChange={handleChange}
//                         value={payload.parentContact}
//                       />
//                       <Input
//                         type="text"
//                         name="parentIncome"   
//                         placeholder="Parent Income"
//                         onChange={handleChange}
//                         value={payload.parentIncome}
//                       />
//                       <Input
//                         type="text"
//                         name="parentQualification"
                       
//                         placeholder=" Parent Qualification"
//                         onChange={handleChange}
//                         value={payload.parentQualification}
//                       />
//                       <Input
//                         type="file"
//                         name="parentImage"
//                         required={false}
//                         placeholder="Parent Image"
//                         onChange={handleParentImageChange}
//                       />
//                     </div>
//                   ) : (
//                     <div className="  bg-gray-100">
//                       <div className="px-5 md:max-w-[25%] w-full  text-center ">
                        
//                         <Input
//                           type="text"
//                           name="parentAdmissionNumber"
//                           required={true}
//                           placeholder="Parent's Admission Number"
//                           onChange={handleChange}
//                           value={payload.parentAdmissionNumber}
//                         />
//                       </div>
//                     </div>
                    
//                   )}

//                     <div className="mt-4 flex flex-col md:flex-row justify-center gap-2 py-2 px-1" >
//                     <Button name="Submit" 
//                      type="submit"
//                      loading={loading}
//                       width="full" 
                      
//                       />
//                     <Button name="Cancel" 
//                     color="gray"
//                      loading={loading}
//                       width="full" 
//                       onClick={toggleModal}
//                       />
//                     </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
       
       
//             <>
//                 {isMobile ? (
//                     <>
//                         {modifiedData && modifiedData.length > 0 ? (
//                             renderMobileCards()
//                         ) : (
//                             <NoDataFound />
//                         )}
//                         {selectedRegistration && (
//                             <MobileRegistrationCard
//                                 student={selectedRegistration}
//                                 onClose={() => setSelectedRegistration(null)}
//                                 handleDelete={handleDelete}
//                             />
//                         )}
//                     </>
//                 ) : (
//                         <div ref={tableRef}>
//                     {modifiedData.length > 0 ? (
//         <DynamicDataTable
//           data={modifiedData}
//           columns={getAdmissionColumns(handleDelete)}
//           handleDelete={handleDelete}
//           className="w-full overflow-auto"
//           itemsPerPage={15}
//         />
        
//       ) : (
//         <NoDataFound />
//       )}
//       </div>
//                 )}
//             </>
       
      
//     </div>
//   );
// }

// export default Create_Registration_Form;




// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./index.css";
// import '../../../src/index.css'
// import Switch from "@mui/material/Switch";
// import axios from "axios";
// import "../../Dynamic/Form/FormStyle.css";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Cookies from "js-cookie";
// import NoDataFound from "../../NoDataFound";
// import {  FormControlLabel } from "@mui/material";
// import useCustomQuery from "../../useCustomQuery";
// import LoadingComponent from "../../Loading";
// import SomthingwentWrong from "../../SomthingwentWrong";
// import BulkAdmission from "./BulkAdmission";
// import Input from "../../Dynamic/Input";
// import DynamicDataTable from "../../Dynamic/DynamicDataTable";
// import { getAdmissionColumns } from "../../Dynamic/utils/TableUtils";
// import Button from "../../Dynamic/utils/Button";
// import Table from "../../Dynamic/Table";
// import { AiFillDelete, AiFillEye, AiFillPrinter } from 'react-icons/ai';
// import { Link } from "react-router-dom";
// function Create_Registration_Form() {
//   const { currentColor } = useStateContext();
//   const authToken = Cookies.get("token");
//   const [sibling, setsibling] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [shouldFetchData, setShouldFetchData] = useState(false);
//   const [submittedData, setSubmittedData] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [getClass, setGetClass] = useState({});
//   const [selectedClass, setSelectedClass] = useState("");
//   const [availableSections, setAvailableSections] = useState([]);
//   const [parentImagePreview, setParentImagePreview] = useState(null);
//   const [payload,setPayload]=useState(
//     {

//     studentFullName: "anand",
//     admissionNumber: "",
//     studentEmail: "",
//     studentPassword: "",
//     studentContact: "9999999999",
//     alt_mobile_no: "77777777777",
//     studentAddress: "bth",
//     studentCountry: "india",
//     state: "bihar",
//     city: "bth",
//     pincode: "845438",
//     nationality: "indian",
//     caste: "OBC",
//     religion: "HIndu",
//     guardian_name: "Guardian",
//     aadhar_no: "2345678998765",
//     aadhar_name: "anand",
//     mothere_tougue: "mother",
//     category: "OBC",
//     minority: "Minority",
//     is_bpl: "bpl",
   
//     studentDateOfBirth: "17-05-1996",
//     studentGender: "Male",
//     studentJoiningDate: "17-05-2024",
//     studentClass: "III",
//     studentSection: "A",
//     studentImage: "",
//     fatherName: "FatherName",
//     motherName: "motherName",
//     parentEmail: "",
//     parentPassword: "",
//     parentContact: "8767888999",
//     parentIncome: "100000",
//     parentQualification: "BCA",
//     parentImage: "",
//     parentAdmissionNumber: "",
//     studentImage:null
//   }
// )

//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };

//   const {
//     queryData: allAdmission,
//     loading: admissionLoading,
//     error: admissionError,
//     refetch: refetchRegistrations,
//   } = useCustomQuery(
//     "https://eshikshaserver.onrender.com/api/v1/adminRoute/getLastYearStudents"
//   );

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const payloadData={
//       "studentFullName": payload.studentFullName,
//       "studentEmail": payload.studentEmail,
//       "studentPassword":  payload.studentPassword,
//       "studentDateOfBirth": payload.studentDateOfBirth,
//       "studentGender": payload.studentGender,
//       "studentJoiningDate": payload.studentJoiningDate,
//       "studentAddress": payload.studentAddress,
//       "studentContact": payload.studentContact,
//       "studentClass":selectedClass ,
//       "studentSection": "A",
//       "studentCountry": payload.studentCountry,
//       "studentSubject": "",
//       "fatherName": payload.fatherName,
//       "motherName": payload.motherName,
//       "parentEmail": payload.parentEmail,
//       "parentPassword":  payload.parentPassword,
//       "parentContact":  payload.parentContact,
//       "parentIncome":payload.parentIncome,
//       "parentQualification":payload.parentQualification,
//       "parentImage": parentImagePreview,
//       "religion": payload.religion,
//       "caste":payload.caste,
//       "nationality": payload.nationality,
//       "pincode": payload.pincode,
//       "state":  payload.state,
//       "city": payload.city,
//       "admissionNumber": payload.admissionNumber,
//       "studentImage":payload.studentImage 
//     }

//     const formDataToSend = new FormData();
//     Object.entries(payloadData).forEach(([key, value]) => {
//       if (key === "studentImage" || key === "parentImage") {
//         if (value) {
//           formDataToSend.append(key, value);
//         }
//       } else {
//         formDataToSend.append(key, String(value ?? ""));
      
//       }    
//     });
//     formDataToSend.append("studentImage", payload.studentImage);
//     formDataToSend.append("parentImage", payload.parentImage);

//     try {

//       const response = await axios.post(
//         "https://eshikshaserver.onrender.com/api/v1/adminRoute/createStudentParent",
//         formDataToSend,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       if(response?.data?.success===true){
//         toast.success("Student added successfully!")
//               toggleModal()
//               refetchRegistrations();
//               setLoading(false);
//             }
    
//     } catch (error) {
//       setLoading(false);
      
//       console.error("Error submitting form:", error);
//     } finally{
//       setLoading(false);
//     }
//   };
//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     const selectedClassObj = getClass?.find(
//       (cls) => cls.className === selectedClassName
//     );

//     if (selectedClassObj) {
//       setAvailableSections(selectedClassObj.sections.split(", "));
//     } else {
//       setAvailableSections([]);
//     }
//   };
//   useEffect(() => {
//     axios
//       .get(
//         `https://eshikshaserver.onrender.com/api/v1/adminRoute/getAllClasses`,
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

//   const handleDelete = (email) => {
//     const authToken = Cookies.get("token");
//     const ConfirmToast = ({ closeToast }) => (
//       <div>
//         <p>Are you sure you want to delete this student?</p>
//         <button
//           className="text-red-700 font-bold text-xl"
//           onClick={() => {
//             axios
//               .put(
//                 `https://eshikshaserver.onrender.com/api/v1/adminRoute/deactivateStudent`,
//                 { email },
//                 {
//                   withCredentials: true,
//                   headers: {
//                     Authorization: `Bearer ${authToken}`,
//                   },
//                 }
//               )
//               .then((response) => {
//                 const updatedData = submittedData.filter(
//                   (item) => item.email !== email
//                 );
//                 setSubmittedData(updatedData);
//                 setShouldFetchData(!shouldFetchData);
//                 refetchRegistrations();
//                 toast.success("Student data deleted successfully");
//                 closeToast();
//               })
//               .catch((error) => {
//                 console.error("Error deleting Student data:", error);
//                 toast.error(
//                   "An error occurred while deleting the Student data.",
//                   error
//                 );
//                 closeToast();
//               });
//           }}
//           style={{ marginRight: "10px" }}
//         >
//           Yes
//         </button>
//         <button onClick={closeToast} className="text-green-800 text-xl">
//           No
//         </button>
//       </div>
//     );
//     toast(<ConfirmToast />);
//   };

//   useEffect(() => {
//     if (allAdmission) {
//       setSubmittedData(allAdmission.allStudent);
//     }
//   });

//   if(loading){
//     return <LoadingComponent />;
//   }

//   if (admissionError) {
//     return <SomthingwentWrong />;
//   }

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPayload({
//         ...payload,
//         studentImage: file,
//       });
//     }
//   };
//   const handleParentImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPayload({
//         ...payload,
//         parentImage: file,
//       });
//     }
//   };
//   const handleChange=(e)=>{
//    const {name,value}=e.target
//    setPayload(()=>(
//     {
//       ...payload,
//       [name]:value
//     }
//    ))
//   }

//   const modifiedData = submittedData?.map((item) => ({
//     ...item,
//     childName: item.children?.map((child) => child.fullName)?.join("\n"),
//     childAdmissionNo: item.children?.map((child) => child.admissionNumber)
//       .join("\n"),
//   }));


//   const THEAD = [
//     { id: "admissionNo", label: "Admission No" },
//     { id: "name", label: "Name" },
//     { id: "fatherName", label: "Father Name" },
//     { id: "class", label: "Class" },
//     { id: "contact", label: "Contact" },
//     // { id: "feeStatus", label: "feeStatus" },
//     // { id: "totalDues", label: "Total Dues" },
//     { id: "action", label: "Action" },
//   ];



//   const tBody = modifiedData.map((val, ind) => ({
//     admissionNo: val.admissionNumber,
//     name: val.fullName,
//     fatherName: val.fatherName,
//     class: val.class,
//     contact: val.contact,
//     feeStatus: val.feeStatus,
    
//     action:  <div className="flex justify-center items-center gap-2">
        
//         <Link to={`/admin/admission/view-admission/${val?.admissionNumber}`}>
//         <AiFillEye  className="text-[25px] text-green-700" />
//           </Link>
//         </div>, 
//   }));
//   return (
//     <div className="p-3">
//           <div className=" flex md:flex-row  gap-2">
//    <Button name="New Admission"   onClick={toggleModal}/>
//    <BulkAdmission refreshRegistrations={refetchRegistrations} />
//    </div>
    
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full  max-h-full" data-aos="fade-down">
//             <div className="relative  rounded-lg shadow dark:bg-gray-700 overflow-auto ">
//               <div className="flex items-center justify-between px-2 md:px-2 border-b rounded-t dark:border-gray-600 bg-white">
//                 <h3
//                   className="text-[15px] font-semibold  dark:text-white px-5"
//                   style={{ color: currentColor }}
//                 >
//                   Admission Form
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
//               <div className="h-[75vh] sm:h-[70vh] md:h-[70vh] lg:h-[65vh]  overflow-auto  bg-gray-50">
//                 <form onSubmit={handleSubmit}>
//                   <div
//                    className="mt-2 grid sm:grid-cols-3  md:grid-cols-6  lg:grid-cols-6 grid-cols-2 gap-3 px-1  mx-auto bg-gray-100 rounded-md ">
//                     <Input
//                       type="text"
//                       name="studentFullName"
//                       required={true}
//                       placeholder="studentFullName"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentFullName}
//                     />
//                     <Input
//                       type="text"
//                       name="admissionNumber"
//                       required={false}
//                       placeholder="admissionNumber"
//                       onChange={handleChange}
//                       value={payload.admissionNumber}
//                     />
//                     <Input
//                       type="email"
//                       name="studentEmail"
//                       required={true}
                     
//                       placeholder="studentEmail"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentEmail}
//                     />
//                     <Input
//                       type="password"
//                       name="studentPassword"
//                       required={true}
//                       placeholder="studentPassword"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentPassword}
//                     />
//                     <Input
//                       type="tel"
//                       name="studentContact"
//                       required={true}
//                       placeholder="studentContact"
//                       maxLength={10}
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentContact}
//                     />
//                     <Input
//                       type="tel"
//                       name="alt_mobile_no"
//                       placeholder="alt_mobile_no"
//                       maxLength={10}
//                       onChange={handleChange}
//                       value={payload.alt_mobile_no}
//                     />
//                     <Input
//                       type="text"
//                       name="studentAddress"
//                       placeholder="studentAddress"
//                       onChange={handleChange}
//                       value={payload.studentAddress}
//                     />
//                     <Input
//                       type="text"
//                       name="studentCountry"
                     
//                       placeholder="studentCountry"
//                       onChange={handleChange}
//                       value={payload.studentCountry}
//                     />
//                     <Input
//                       type="text"
//                       name="state"
//                       required={false}
//                       placeholder="state"
//                       onChange={handleChange}
//                       value={payload.state}
//                     />
//                     <Input
//                      type="text"
//                       name="city"
//                       placeholder="city"
//                        onChange={handleChange}
//                        value={payload.city}
//                        />
//                     <Input
//                       type="text"
//                       name="pincode"
//                       required={false}
//                       placeholder="pincode"
//                       onChange={handleChange}
//                       value={payload.pincode}
//                     />
//                     <Input
//                       type="text"
//                       name="nationality"
//                       required={false}
//                       placeholder="nationality"
//                       onChange={handleChange}
//                       value={payload.nationality}
//                     />
//                     <Input
//                       type="text"
//                       name="caste"
//                       required={false}
//                       placeholder="caste"
//                       onChange={handleChange}
//                       value={payload.caste}
//                     />
//                     <Input
//                       type="text"
//                       name="religion"
//                       required={false}
//                       placeholder="religion"
//                       onChange={handleChange}
//                       value={payload.religion}
//                     />
//                     <Input
//                       type="text"
//                       name="guardian_name"
//                       required={false}
//                       placeholder="guardian_name"
//                       onChange={handleChange}
//                       value={payload.guardian_name}
//                     />
//                     <Input
//                       type="text"
//                       name="aadhar_no"
//                       required={false}
//                       placeholder="aadhar_no"
//                       onChange={handleChange}
//                       value={payload.aadhar_no}
//                     />
                    
//                     <div className="flex flex-col space-y-1 mt-[2px]">
//                      <select
//                        name="studentGender"
//                        className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                        onFocus={(e) =>
//                          (e.target.style.borderColor = currentColor)
//                        }
//                        onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                        value={payload.studentGender}
//                        onChange={handleChange}
//                        required
//                      >
//                        <option value="" disabled>
//                       Select a Section
//                        </option>
                       
//                         <option value="Male">
//                         Male
//                       </option>
//                         <option value="Female">
//                         Female
//                       </option>
//                         <option value="Other">
//                         Other
//                       </option>
                     
//                      </select>
//                    </div>
//                     <Input
//                       type="date"
//                       name="studentJoiningDate"
                     
//                       label="Admission Date"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentJoiningDate}
//                     />
//                      <div className="flex flex-col space-y-1 mt-[2px]">
                     
//                       <select
//                         name="studentClass"
//                         className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                         onFocus={(e) =>
//                           (e.target.style.borderColor = currentColor)
//                         }
//                         onBlur={(e) => (e.target.style.borderColor = "#ccc")}
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
//                     <div className="flex flex-col space-y-1 mt-[2px]">
                     
//                       <select
//                         name="studentSection"
//                         className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                         onFocus={(e) =>
//                           (e.target.style.borderColor = currentColor)
//                         }
//                         onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                         value={selectedClass}
//                         onChange={handleClassChange}
//                         required
//                       >
//                         <option value="" disabled>
//                        Select a Section
//                         </option>
//                         {availableSections?.map((item, index) => (
//                          <option key={index} value={item}>
//                          {item}
//                        </option>
//                         ))}
//                       </select>
//                     </div>
//                     <Input
//                       type="file"
//                       name="studentImage"
//                       required={false}
//                       label="Student Image"
//                       onChange={handleImageChange}
//                     />
//                   </div>
//                   <div className="flex flex-row gap-10  justify-center bg-gray-100   text-center">
//                     <span className=" text-xl text-blue-900">
//                       Parent Details
//                     </span>
//                     <FormControlLabel
//                       control={<Switch onClick={() => setsibling(!sibling)} />}
//                       label="Sibling"
//                     />
//                   </div>
//                   {sibling ? (
//                     <div className=" grid  md:grid-cols-6 lg:grid-cols-5 grid-cols-2 gap-3 px-1  mx-auto bg-gray-100 rounded-md ">
//                       <Input
//                         type="text"
//                         name="fatherName"
//                         required={true}
//                         required_field={true}
//                         onChange={handleChange}
//                         value={payload.fatherName}
//                         placeholder="Father's Name"
//                       />
//                       <Input
//                         type="text"
//                         name="motherName"
//                         required={false}
//                         placeholder="Mother's Name"
//                         onChange={handleChange}
//                         value={payload.motherName}

//                       />
//                       <Input
//                         type="email"
//                         name="parentEmail"
//                         required={true}
//                         placeholder="Parent Email"
//                         required_field={true}
//                         onChange={handleChange}
//                         value={payload.parentEmail}
//                       />
//                       <Input
//                         type="password"
//                         name="parentPassword"
//                         required={true}
//                         placeholder="Parent Password"
//                         required_field={true}
//                         onChange={handleChange}
//                         value={payload.parentPassword}
//                       />
//                       <Input
//                         type="tel"
//                         name="parentContact"
//                         required={true}
//                         placeholder="Parent Contact"
//                         required_field={true}
//                         maxLength={10}
//                         onChange={handleChange}
//                         value={payload.parentContact}
//                       />
//                       <Input
//                         type="text"
//                         name="parentIncome"   
//                         placeholder="Parent Income"
//                         onChange={handleChange}
//                         value={payload.parentIncome}
//                       />
//                       <Input
//                         type="text"
//                         name="parentQualification"
                       
//                         placeholder=" Parent Qualification"
//                         onChange={handleChange}
//                         value={payload.parentQualification}
//                       />
//                       <Input
//                         type="file"
//                         name="parentImage"
//                         required={false}
//                         placeholder="Parent Image"
//                         onChange={handleParentImageChange}
//                       />
//                     </div>
//                   ) : (
//                     <div className="  bg-gray-100">
//                       <div className="px-5 md:max-w-[25%] w-full  text-center ">
                        
//                         <Input
//                           type="text"
//                           name="parentAdmissionNumber"
//                           required={true}
//                           placeholder="Parent's Admission Number"
//                           onChange={handleChange}
//                           value={payload.parentAdmissionNumber}
//                         />
//                       </div>
//                     </div>
                    
//                   )}

//                     <div className="mt-4 flex flex-col md:flex-row justify-center gap-2 py-2 px-1" >
//                     <Button name="Submit" 
//                      type="submit"
//                      loading={loading}
//                       width="full" 
                      
//                       />
//                     <Button name="Cancel" 
//                     color="gray"
//                      loading={loading}
//                       width="full" 
//                       onClick={toggleModal}
//                       />
//                     </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {modifiedData.length > 0 ? (
//         // <DynamicDataTable
//         //   data={modifiedData}
//         //   columns={getAdmissionColumns(handleDelete)}
//         //   handleDelete={handleDelete}
//         //   className="w-full overflow-auto"
//         //   itemsPerPage={15}
//         // />
//         <Table
//         tHead={THEAD}
//         tBody={tBody}/>
        
//       ) : (
//         <NoDataFound />
//       )}
      
//     </div>
//   );
// }

// export default Create_Registration_Form;


// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./index.css";
// import '../../../src/index.css'
// import Switch from "@mui/material/Switch";
// import axios from "axios";
// import "../../Dynamic/Form/FormStyle.css";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Cookies from "js-cookie";
// import NoDataFound from "../../NoDataFound";
// import {  FormControlLabel } from "@mui/material";
// import useCustomQuery from "../../useCustomQuery";
// import LoadingComponent from "../../Loading";
// import SomthingwentWrong from "../../SomthingwentWrong";
// import BulkAdmission from "./BulkAdmission";
// import Input from "../../Dynamic/Input";

// import DynamicDataTable from "../../Dynamic/DynamicDataTable";
// import { getAdmissionColumns } from "../../Dynamic/utils/TableUtils";

// import Button from "../../Dynamic/utils/Button";


// function Create_Registration_Form() {
//   const [filterText, setFilterText] = useState("");
//   const { currentColor } = useStateContext();
//   const authToken = Cookies.get("token");
//   const [sibling, setsibling] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [shouldFetchData, setShouldFetchData] = useState(false);
//   const [submittedData, setSubmittedData] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [getClass, setGetClass] = useState({});
//   const [selectedClass, setSelectedClass] = useState("");
//   const [availableSections, setAvailableSections] = useState([]);
//   const [studentImagePreview, setStudentImagePreview] = useState(null);
//   const [parentImagePreview, setParentImagePreview] = useState(null);
//   const [studentImageBinary, setStudentImageBinary] = useState("");


  
//   const [payload,setPayload]=useState(
//     {

//     studentFullName: "anand",
//     admissionNumber: "",
//     studentEmail: "",
//     studentPassword: "",
//     studentContact: "9999999999",
//     alt_mobile_no: "77777777777",
//     studentAddress: "bth",
//     studentCountry: "india",
//     state: "bihar",
//     city: "bth",
//     pincode: "845438",
//     nationality: "indian",
//     caste: "OBC",
//     religion: "HIndu",
//     guardian_name: "Guardian",
//     aadhar_no: "2345678998765",
//     aadhar_name: "anand",
//     mothere_tougue: "mother",
//     category: "OBC",
//     minority: "Minority",
//     is_bpl: "bpl",
//     mainstramed_child: "mainstra",
//     pre_year_schl_status: "preyear",
//     stu_ward: "stuward",
//     pre_class_exam_app: "preclass",
//     perc_pre_class: "perc_pre_class",
//     att_pre_class: "att_pre_class",
//     fac_free_uniform: "fac_free_uniform",
//     received_central_scholarship: "received_central_scholarship",
//     name_central_scholarship: "",
//     received_state_scholarship: "",
//     received_other_scholarship: "",
//     scholarship_amount: "",
//     fac_provided_cwsn: "",
//     SLD_type: "",
//     aut_spec_disorder: "",
//     ADHD: "",
//     inv_ext_curr_activity: "",
//     vocational_course: "",
//     trade_sector_id: "",
//     job_role_id: "",
//     pre_app_exam_vocationalsubject: "",
//     bpl_card_no: "",
//     ann_card_no: "",
//     studentDateOfBirth: "17-05-1996",
//     studentGender: "Male",
//     studentJoiningDate: "17-05-2024",
//     studentClass: "III",
//     studentSection: "A",
//     studentImage: "",
//     fatherName: "FatherName",
//     motherName: "motherName",
//     parentEmail: "",
//     parentPassword: "",
//     parentContact: "8767888999",
//     parentIncome: "100000",
//     parentQualification: "BCA",
//     parentImage: "",
//     parentAdmissionNumber: "",
//     studentImage:null
    
//   }
// )

//   const handleImagePreview = (event, setPreview) => {
//     const file = event.target.files[0];

//     if (file) {
//       // For preview
//       const previewReader = new FileReader();
//       previewReader.onload = () => {
//         setPreview(previewReader.result); // Set image preview
//       };
//       previewReader.readAsDataURL(file);

//       // For binary data
//       const binaryReader = new FileReader();
//       binaryReader.onload = () => {
//         setStudentImageBinary(binaryReader.result); // Set binary data
//       };
//       binaryReader.readAsBinaryString(file);
//     }
//   };

//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };

//   const {
//     queryData: allAdmission,
//     loading: admissionLoading,
//     error: admissionError,
//     refetch: refetchRegistrations,
//   } = useCustomQuery(
//     "https://eshikshaserver.onrender.com/api/v1/adminRoute/getLastYearStudents"
//   );

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const payloadData={
//       "studentFullName": payload.studentFullName,
//       "studentEmail": payload.studentEmail,
//       "studentPassword":  payload.studentPassword,
//       "studentDateOfBirth": payload.studentDateOfBirth,
//       "studentGender": payload.studentGender,
//       "studentJoiningDate": payload.studentJoiningDate,
//       "studentAddress": payload.studentAddress,
//       "studentContact": payload.studentContact,
//       "studentClass":selectedClass ,
//       "studentSection": "A",
//       "studentCountry": payload.studentCountry,
//       "studentSubject": "",
//       "fatherName": payload.fatherName,
//       "motherName": payload.motherName,
//       "parentEmail": payload.parentEmail,
//       "parentPassword":  payload.parentPassword,
//       "parentContact":  payload.parentContact,
//       "parentIncome":payload.parentIncome,
//       "parentQualification":payload.parentQualification,
//       "parentImage": parentImagePreview,
//       "religion": payload.religion,
//       "caste":payload.caste,
//       "nationality": payload.nationality,
//       "pincode": payload.pincode,
//       "state":  payload.state,
//       "city": payload.city,
//       "admissionNumber": payload.admissionNumber,
//       // "studentAdmissionNumber": payload.admissionNumber,
//       // "stu_id": payload.admissionNumber,
//       // "class": selectedClass,
//       // "section":"A",
//       // "roll_no": "",
//       // "student_name":payload.studentFullName,
//       // "gender": payload.studentGender,
//       // "DOB": payload.studentDateOfBirth,
//       // "mother_name": payload.motherName,
//       // "father_name": payload.fatherName,
//       // "gaurdian_name":payload.guardian_name,
//       // // "guardian_name": "N/A",
//       // "aadhar_no":payload.aadhar_no,
//       // "aadhar_name": payload.aadhar_name,
//       // "paddress": payload.studentAddress,
//       // "mobile_no": payload.studentContact,
//       // "email_id": payload.studentEmail,
//       // "mothere_tougue": payload.mothere_tougue,
//       // "category": payload.category,
//       // "minority": payload.minority? payload.minority :"No",
//       // "is_bpl":false,
//       // "is_aay": payload.is_aay?payload.is_aay:0,
//       // "ews_aged_group": "18-30",
//       // "is_cwsn": 0,
//       // "cwsn_imp_type": "None",
//       // "ind_national":payload.nationality?payload.nationality: "INDIAN",
//       // "mainstramed_child": payload.mainstramed_child?payload.mainstramed_child:"No",
//       // "adm_no": payload.admissionNumber,
//       // "adm_date": payload.studentJoiningDate,
//       // "stu_stream": "Science",
//       // "pre_year_schl_status": payload.pre_year_schl_status?payload.pre_year_schl_status:"Passed",
//       // "pre_year_class": "9",
//       // "stu_ward": payload.stu_ward?payload.stu_ward:"N/A",
//       // "pre_class_exam_app": payload.pre_class_exam_app?payload.pre_class_exam_app:"N/A",
//       // "result_pre_exam": payload.result_pre_exam?payload.result_pre_exam:"Passed",
//       // "perc_pre_class": 4,
//       // "att_pre_class": payload.att_pre_class?payload.att_pre_class:"N/A",
//       // "fac_free_uniform": payload.fac_free_uniform?payload.fac_free_uniform:"Yes",
//       // "fac_free_textbook": "Yes",
//       // "received_central_scholarship":  true,
//       // "name_central_scholarship":payload.name_central_scholarship?payload.name_central_scholarship: "N/A",
//       // "received_other_scholarship":payload.received_other_scholarship?payload.received_other_scholarship: true,
//       // "scholarship_amount": Number(payload.scholarship_amount)?Number(payload.scholarship_amount):0,
//       // "fac_provided_cwsn": payload.fac_provided_cwsn? payload.fac_provided_cwsn:"N/A",
//       // "SLD_type":payload.SLD_type?payload.SLD_type: "N/A",
//       // "aut_spec_disorder":payload.aut_spec_disorder?payload.aut_spec_disorder: "N/A",
//       // "ADHD": payload.ADHD?payload.ADHD:"N/A",
//       // "inv_ext_curr_activity":payload.inv_ext_curr_activity?payload.inv_ext_curr_activity: "N/A",
//       // "vocational_course": payload.vocational_course? payload.vocational_course:"N/A",
//       // "trade_sector_id": payload.trade_sector_id? payload.trade_sector_id:"N/A",
//       // "job_role_id": payload.job_role_id?payload.job_role_id:"None",
//       // "pre_app_exam_vocationalsubject": payload.pre_app_exam_vocationalsubject?payload.pre_app_exam_vocationalsubject:"None",
//       // "bpl_card_no": payload.bpl_card_no ?payload.bpl_card_no:"N/A",
//       // "ann_card_no":   payload.ann_card_no?payload.ann_card_no:"N/A",
//       "studentImage":payload.studentImage
      
//     }


//     const formDataToSend = new FormData();
//     Object.entries(payloadData).forEach(([key, value]) => {
//       if (key === "studentImage" || key === "parentImage") {
//         if (value) {
//           formDataToSend.append(key, value);
//         }
//       } else {
//         formDataToSend.append(key, String(value ?? ""));
      
//       }

      
//     });
//     formDataToSend.append("studentImage", payload.studentImage);
//     formDataToSend.append("parentImage", payload.parentImage);

//     try {
//       // setLoading(true);
//       // console.log("start")
//       // const response = AdminCreateStudentParent(formDataToSend);
//       const response = await axios.post(
//         "https://eshikshaserver.onrender.com/api/v1/adminRoute/createStudentParent",
//         formDataToSend,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
// console.log("responseresponse",response)
//       if(response?.data?.success===true){
//         toast.success("Student added successfully!")
//               toggleModal()
//               refetchRegistrations();
//               setLoading(false);
//             }
//       // }else if(response?.data?.success===false){
//       //   toast.error("Student added unsuccessfully!")
//       //   toast.error("Student added unsuccessfully!")
//       // }else{
//       //   console.log("error")
//       // }
     
//     } catch (error) {
//       setLoading(false);
      
//       console.error("Error submitting form:", error);
//     } finally{
//       setLoading(false);
//     }
//   };


//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     const selectedClassObj = getClass?.find(
//       (cls) => cls.className === selectedClassName
//     );

//     if (selectedClassObj) {
//       setAvailableSections(selectedClassObj.sections.split(", "));
//     } else {
//       setAvailableSections([]);
//     }
//   };
//   useEffect(() => {
//     axios
//       .get(
//         `https://eshikshaserver.onrender.com/api/v1/adminRoute/getAllClasses`,
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




// //     const fetchClasses = async () => {
// //         try {
// //           setLoading(true);
// //             const response = await AdminAllClass();
// //             console.log("anandresponse",response)
// //             setGetClass(response?.classList?.sort((a, b) => a - b));
// //             setLoading(false);
// //         } catch (error) {
// //           setLoading(false);
// //             console.error(error.message)
// //         } finally {
// //             setLoading(false)
// //         }
// //     };

// //     useEffect(() => {
// //     fetchClasses();
// // }, []);






//   const handleDelete = (email) => {
//     const authToken = Cookies.get("token");
//     const ConfirmToast = ({ closeToast }) => (
//       <div>
//         <p>Are you sure you want to delete this student?</p>
//         <button
//           className="text-red-700 font-bold text-xl"
//           onClick={() => {
//             axios
//               .put(
//                 `https://eshikshaserver.onrender.com/api/v1/adminRoute/deactivateStudent`,
//                 { email },
//                 {
//                   withCredentials: true,
//                   headers: {
//                     Authorization: `Bearer ${authToken}`,
//                   },
//                 }
//               )
//               .then((response) => {
//                 const updatedData = submittedData.filter(
//                   (item) => item.email !== email
//                 );
//                 setSubmittedData(updatedData);
//                 setShouldFetchData(!shouldFetchData);
//                 refetchRegistrations();
//                 toast.success("Student data deleted successfully");
//                 closeToast();
//               })
//               .catch((error) => {
//                 console.error("Error deleting Student data:", error);
//                 toast.error(
//                   "An error occurred while deleting the Student data.",
//                   error
//                 );
//                 closeToast();
//               });
//           }}
//           style={{ marginRight: "10px" }}
//         >
//           Yes
//         </button>
//         <button onClick={closeToast} className="text-green-800 text-xl">
//           No
//         </button>
//       </div>
//     );
//     toast(<ConfirmToast />);
//   };

//   useEffect(() => {
//     if (allAdmission) {
//       setSubmittedData(allAdmission.allStudent);
//     }
//   });

//   if(loading){
//     return <LoadingComponent />;
//   }
//   // if (admissionLoading) {
//   //   return <Loading />;
//   // }
//   if (admissionError) {
//     return <SomthingwentWrong />;
//   }



//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPayload({
//         ...payload,
//         studentImage: file,
//       });
//     }
//   };
//   const handleParentImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPayload({
//         ...payload,
//         parentImage: file,
//       });
//     }
//   };


//   const handleChange=(e)=>{
//    const {name,value}=e.target
//    setPayload(()=>(
//     {
//       ...payload,
//       [name]:value
//     }
//    ))
//   }
//   const THEAD = [
   
//     "S.No.",
//     "Photo",
//     "adm No",
//     "Class",
//     "Name",
//     "Father",
//     "Gender",
//     "Email",
//     "Contact",
//     "Adm Date",
    
//     "Actions",
   
//   ];
//   const handleFilterChange = (e) => {
//     setFilterText(e.target.value);
//   };
//   const filteredData = submittedData?.filter((row) => {
//     return Object.values(row).some((value) =>
//       value.toString().toLowerCase().includes(filterText.toLowerCase())
//     );
//   });

//   const modifiedData = submittedData?.map((item) => ({
//     ...item,
//     childName: item.children?.map((child) => child.fullName)?.join("\n"),
//     childAdmissionNo: item.children?.map((child) => child.admissionNumber)
//       .join("\n"),
//   }));

//   return (
//     <div className="p-3">
//     {/* // <div className="md:h-screen mt-12 md:mt-1 mx-auto p-1 overflow-hidden"> */}
//     {/* <div className="md:h-screen mt-20 md:mt-0  mx-auto p-3 "> */}
//        {/* <Heading2 title={ "All Admission"}>

//     </Heading2> */}
   
//           <div className=" flex md:flex-row  gap-2">
//    <Button name="New Admission"   onClick={toggleModal}/>
//    <BulkAdmission refreshRegistrations={refetchRegistrations} />
//    </div>
    
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full  max-h-full" data-aos="fade-down">
//             <div className="relative  rounded-lg shadow dark:bg-gray-700 overflow-auto ">
//               <div className="flex items-center justify-between px-2 md:px-2 border-b rounded-t dark:border-gray-600 bg-white">
//                 <h3
//                   className="text-[15px] font-semibold  dark:text-white px-5"
//                   style={{ color: currentColor }}
//                 >
//                   Admission Form
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
//               <div className="h-[75vh] sm:h-[70vh] md:h-[70vh] lg:h-[65vh]  overflow-auto  bg-gray-50">
//                 <form onSubmit={handleSubmit}>
//                   <div
//                    className="mt-2 grid sm:grid-cols-3  md:grid-cols-6  lg:grid-cols-6 grid-cols-2 gap-3 px-1  mx-auto bg-gray-100 rounded-md ">
//                     <Input
//                       type="text"
//                       name="studentFullName"
//                       required={true}
//                       placeholder="studentFullName"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentFullName}
//                     />
//                     <Input
//                       type="text"
//                       name="admissionNumber"
//                       required={false}
//                       placeholder="admissionNumber"
//                       onChange={handleChange}
//                       value={payload.admissionNumber}
//                     />
//                     <Input
//                       type="email"
//                       name="studentEmail"
//                       required={true}
                     
//                       placeholder="studentEmail"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentEmail}
//                     />
//                     <Input
//                       type="password"
//                       name="studentPassword"
//                       required={true}
//                       placeholder="studentPassword"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentPassword}
//                     />
//                     <Input
//                       type="tel"
//                       name="studentContact"
//                       required={true}
//                       placeholder="studentContact"
//                       maxLength={10}
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentContact}
//                     />
//                     <Input
//                       type="tel"
//                       name="alt_mobile_no"
//                       placeholder="alt_mobile_no"
//                       maxLength={10}
//                       onChange={handleChange}
//                       value={payload.alt_mobile_no}
//                     />
//                     <Input
//                       type="text"
//                       name="studentAddress"
//                       placeholder="studentAddress"
//                       onChange={handleChange}
//                       value={payload.studentAddress}
//                     />
//                     <Input
//                       type="text"
//                       name="studentCountry"
                     
//                       placeholder="studentCountry"
//                       onChange={handleChange}
//                       value={payload.studentCountry}
//                     />
//                     <Input
//                       type="text"
//                       name="state"
//                       required={false}
//                       placeholder="state"
//                       onChange={handleChange}
//                       value={payload.state}
//                     />
//                     <Input
//                      type="text"
//                       name="city"
//                       placeholder="city"
//                        onChange={handleChange}
//                        value={payload.city}
//                        />
//                     <Input
//                       type="text"
//                       name="pincode"
//                       required={false}
//                       placeholder="pincode"
//                       onChange={handleChange}
//                       value={payload.pincode}
//                     />
//                     <Input
//                       type="text"
//                       name="nationality"
//                       required={false}
//                       placeholder="nationality"
//                       onChange={handleChange}
//                       value={payload.nationality}
//                     />
//                     <Input
//                       type="text"
//                       name="caste"
//                       required={false}
//                       placeholder="caste"
//                       onChange={handleChange}
//                       value={payload.caste}
//                     />
//                     <Input
//                       type="text"
//                       name="religion"
//                       required={false}
//                       placeholder="religion"
//                       onChange={handleChange}
//                       value={payload.religion}
//                     />
//                     <Input
//                       type="text"
//                       name="guardian_name"
//                       required={false}
//                       placeholder="guardian_name"
//                       onChange={handleChange}
//                       value={payload.guardian_name}
//                     />
//                     <Input
//                       type="text"
//                       name="aadhar_no"
//                       required={false}
//                       placeholder="aadhar_no"
//                       onChange={handleChange}
//                       value={payload.aadhar_no}
//                     />
//                     {/* <Input
//                       type="text"
//                       name="aadhar_name"
//                       required={false}
//                       placeholder="aadhar_name"
//                       onChange={handleChange}
//                       value={payload.aadhar_name}
//                     />
//                     <Input
//                       type="text"
//                       name="mothere_tougue"
//                       required={false}
//                       placeholder="mothere_tougue"
//                       onChange={handleChange}
//                       value={payload.mothere_tougue}
//                     />
//                     <Input
//                       type="text"
//                       name="category"
//                       required={false}
//                       placeholder="category"
//                       onChange={handleChange}
//                       value={payload.category}
//                     />
//                     <Input
//                       type="text"
//                       name="minority"
//                       required={false}
//                       placeholder="minority"
//                       onChange={handleChange}
//                       value={payload.minority}
//                     />
//                     <Input
//                       type="text"
//                       name="is_bpl"
//                       required={false}
//                       placeholder="is_bpl"
//                       onChange={handleChange}
//                       value={payload.is_bpl}
//                     />
//                     <Input
//                       type="text"
//                       name="mainstramed_child"
//                       required={false}
//                       placeholder="mainstramed_child"
//                       onChange={handleChange}
//                       value={payload.mainstramed_child}
//                     />
//                     <Input
//                       type="text"
//                       name="pre_year_schl_status"
//                       required={false}
//                       placeholder="pre_year_schl_status"
//                       onChange={handleChange}
//                       value={payload.pre_year_schl_status}
//                     />
//                     <Input
//                       type="text"
//                       name="pre_year_class"
//                       required={false}
//                       placeholder="pre_year_class"
//                       onChange={handleChange}
//                       value={payload.pre_year_class}
//                     />
//                     <Input
//                       type="text"
//                       name="stu_ward"
//                       required={false}
//                       placeholder="stu_ward"
//                       onChange={handleChange}
//                       value={payload.stu_ward}
//                     />
//                     <Input
//                       type="text"
//                       name="pre_class_exam_app"
//                       required={false}
//                       placeholder="pre_class_exam_app"
//                       onChange={handleChange}
//                       value={payload.pre_class_exam_app}
//                     />
//                     <Input
//                       type="text"
//                       name="result_pre_exam"
//                       required={false}
//                       placeholder="result_pre_exam"
//                       onChange={handleChange}
//                       value={payload.result_pre_exam}
//                     />
//                     <Input
//                       type="text"
//                       name="perc_pre_class"
//                       required={false}
//                       placeholder="perc_pre_class"
//                       onChange={handleChange}
//                       value={payload.perc_pre_class}
//                     />
//                     <Input
//                       type="text"
//                       name="att_pre_class"
//                       required={false}
//                       placeholder="att_pre_class"
//                       onChange={handleChange}
//                       value={payload.att_pre_class}
//                     />
//                     <Input
//                       type="text"
//                       name="fac_free_uniform"
//                       required={false}
//                       placeholder="fac_free_uniform"
//                       onChange={handleChange}
//                       value={payload.fac_free_uniform}
//                     />
//                     <Input
//                       type="text"
//                       name="received_central_scholarship"
//                       required={false}
//                       placeholder="received_central_scholarship"
//                       onChange={handleChange}
//                       value={payload.received_central_scholarship}
//                     />
//                     <Input
//                       type="text"
//                       name="name_central_scholarship"
//                       required={false}
//                       placeholder="name_central_scholarship"
//                       onChange={handleChange}
//                       value={payload.name_central_scholarship}
//                     />
//                     <Input
//                       type="text"
//                       name="received_state_scholarship"
//                       required={false}
//                       placeholder="received_state_scholarship"
//                       onChange={handleChange}
//                       value={payload.received_state_scholarship}
//                     />
//                     <Input
//                       type="text"
//                       name="received_other_scholarship"
//                       required={false}
//                       placeholder="received_other_scholarship"
//                       onChange={handleChange}
//                       value={payload.received_other_scholarship}
//                     />
//                     <Input
//                       type="text"
//                       name="scholarship_amount"
//                       required={false}
//                       placeholder="scholarship_amount"
//                       onChange={handleChange}
//                       value={payload.scholarship_amount}
//                     />
//                     <Input
//                       type="text"
//                       name="fac_provided_cwsn"
//                       required={false}
//                       placeholder="fac_provided_cwsn"
//                       onChange={handleChange}
//                       value={payload.fac_provided_cwsn}
//                     />
//                     <Input
//                       type="text"
//                       name="SLD_type"
//                       required={false}
//                       placeholder="SLD_type"
//                       onChange={handleChange}
//                       value={payload.SLD_type}
//                     />
//                     <Input
//                       type="text"
//                       name="aut_spec_disorder "
//                       required={false}
//                       placeholder="aut_spec_disorder"
//                       onChange={handleChange}
//                       value={payload.aut_spec_disorder}
//                     />
//                     <Input
//                       type="text"
//                       name="ADHD"
//                       required={false}
//                       placeholder="ADHD"
//                       onChange={handleChange}
//                       value={payload.ADHD}
//                     />
//                     <Input
//                       type="text"
//                       name="inv_ext_curr_activity"
//                       required={false}
//                       placeholder="inv_ext_curr_activity"
//                       onChange={handleChange}
//                       value={payload.inv_ext_curr_activity}
//                     />
//                     <Input
//                       type="text"
//                       name="vocational_course"
//                       required={false}
//                       placeholder="vocational_course"
//                       onChange={handleChange}
//                       value={payload.vocational_course}
//                     />
//                     <Input
//                       type="text"
//                       name="trade_sector_id"
//                       required={false}
//                       placeholder="trade_sector_id"
//                       onChange={handleChange}
//                       value={payload.trade_sector_id}
//                     />
//                     <Input
//                       type="text"
//                       name="job_role_id"
//                       required={false}
//                       placeholder="job_role_id"
//                       onChange={handleChange}
//                       value={payload.job_role_id}
//                     />
//                     <Input
//                       type="text"
//                       name="pre_app_exam_vocationalsubject"
//                       required={false}
//                       placeholder="pre_app_exam_vocationalsubject"
//                       onChange={handleChange}
//                       value={payload.pre_app_exam_vocationalsubject}
//                     />
//                     <Input
//                       type="text"
//                       name="bpl_card_no"
//                       required={false}
//                       placeholder="bpl_card_no"
//                       onChange={handleChange}
//                       value={payload.bpl_card_no}
//                     />
//                     <Input
//                       type="text"
//                       name="ann_card_no"
//                       required={false}
//                       onChange={handleChange}
//                       value={payload.ann_card_no}
//                       placeholder="ann_card_no"
//                     />
//                     <Input
//                       type="date"
//                       name="studentDateOfBirth"
//                      staticwidth={"20px"}
//                       label="DOB"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentDateOfBirth}
//                     /> */}
                    


//                     {/* <Selector
//                       label="Gender"
//                       name="studentGender"
//                       options={["Male", "Female", "Other"]}
                     
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentGender}
//                     /> */}
//                     <div className="flex flex-col space-y-1 mt-[2px]">
                     
//                      <select
//                        name="studentGender"
//                        className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                        onFocus={(e) =>
//                          (e.target.style.borderColor = currentColor)
//                        }
//                        onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                        value={payload.studentGender}
//                        onChange={handleChange}
//                        required
//                      >
//                        <option value="" disabled>
//                       Select a Section
//                        </option>
                       
//                         <option value="Male">
//                         Male
//                       </option>
//                         <option value="Female">
//                         Female
//                       </option>
//                         <option value="Other">
//                         Other
//                       </option>
                     
//                      </select>
//                    </div>
//                     <Input
//                       type="date"
//                       name="studentJoiningDate"
                     
//                       label="Admission Date"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentJoiningDate}
//                     />
//                      <div className="flex flex-col space-y-1 mt-[2px]">
                     
//                       <select
//                         name="studentClass"
//                         className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                         onFocus={(e) =>
//                           (e.target.style.borderColor = currentColor)
//                         }
//                         onBlur={(e) => (e.target.style.borderColor = "#ccc")}
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
//                     <div className="flex flex-col space-y-1 mt-[2px]">
                     
//                       <select
//                         name="studentSection"
//                         className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                         onFocus={(e) =>
//                           (e.target.style.borderColor = currentColor)
//                         }
//                         onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                         value={selectedClass}
//                         onChange={handleClassChange}
//                         required
//                       >
//                         <option value="" disabled>
//                        Select a Section
//                         </option>
//                         {availableSections?.map((item, index) => (
//                          <option key={index} value={item}>
//                          {item}
//                        </option>
//                         ))}
//                       </select>
//                     </div>
//                     {/* <Selector
//                       name="studentSection"
//                       options={availableSections}
//                       label="Select a Section"
                     
//                     /> */}


//                     <Input
//                       type="file"
//                       name="studentImage"
//                       required={false}
//                       label="Student Image"
//                       // onChange={(e) =>
//                       //   handleImagePreview(e, setStudentImagePreview)
//                       // }
                      
//                       onChange={handleImageChange}
//                     />
//                   </div>
//                   <div className="flex flex-row gap-10  justify-center bg-gray-100   text-center">
//                     <span className=" text-xl text-blue-900">
//                       Parent Details
//                     </span>
//                     <FormControlLabel
//                       control={<Switch onClick={() => setsibling(!sibling)} />}
//                       label="Sibling"
//                     />
//                   </div>
//                   {sibling ? (
//                     <div className=" grid  md:grid-cols-6 lg:grid-cols-5 grid-cols-2 gap-3 px-1  mx-auto bg-gray-100 rounded-md ">
//                       <Input
//                         type="text"
//                         name="fatherName"
//                         required={true}
//                         required_field={true}
//                         onChange={handleChange}
//                         value={payload.fatherName}
//                         placeholder="Father's Name"
//                       />
//                       <Input
//                         type="text"
//                         name="motherName"
//                         required={false}
//                         placeholder="Mother's Name"
//                         onChange={handleChange}
//                         value={payload.motherName}

//                       />
//                       <Input
//                         type="email"
//                         name="parentEmail"
//                         required={true}
//                         placeholder="Parent Email"
//                         required_field={true}
//                         onChange={handleChange}
//                         value={payload.parentEmail}
//                       />
//                       <Input
//                         type="password"
//                         name="parentPassword"
//                         required={true}
//                         placeholder="Parent Password"
//                         required_field={true}
//                         onChange={handleChange}
//                         value={payload.parentPassword}
//                       />
//                       <Input
//                         type="tel"
//                         name="parentContact"
//                         required={true}
//                         placeholder="Parent Contact"
//                         required_field={true}
//                         maxLength={10}
//                         onChange={handleChange}
//                         value={payload.parentContact}
//                       />
//                       <Input
//                         type="text"
//                         name="parentIncome"
                        
//                         placeholder="Parent Income"
//                         onChange={handleChange}
//                         value={payload.parentIncome}
//                       />
//                       <Input
//                         type="text"
//                         name="parentQualification"
                       
//                         placeholder=" Parent Qualification"
//                         onChange={handleChange}
//                         value={payload.parentQualification}
//                       />
//                       <Input
//                         type="file"
//                         name="parentImage"
//                         required={false}
//                         placeholder="Parent Image"
//                         // onChange={(e) =>
//                         //   handleImagePreview(e, setParentImagePreview)
//                         // }
//                         onChange={handleParentImageChange}
//                       />


//                     </div>
//                   ) : (
//                     <div className="  bg-gray-100">
//                       <div className="px-5 md:max-w-[25%] w-full  text-center ">
                        
//                         <Input
//                           type="text"
//                           name="parentAdmissionNumber"
//                           required={true}
//                           placeholder="Parent's Admission Number"
//                           onChange={handleChange}
//                           value={payload.parentAdmissionNumber}
//                         />
//                       </div>
//                     </div>
                    
//                   )}

//                     <div className="mt-4 flex flex-col md:flex-row justify-center gap-2 py-2 px-1" >
//                     <Button name="Submit" 
                    
//                     //  onClick={handleSubmit} 
//                      type="submit"
//                      loading={loading}
//                       width="full" 
                      
//                       />
//                     <Button name="Cancel" 
//                     color="gray"
                   
//                     //  type="submit"
//                      loading={loading}
//                       width="full" 
//                       onClick={toggleModal}
//                       />
                     
//                     </div>
                
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}


//       {modifiedData.length > 0 ? (
//         <DynamicDataTable
//           data={modifiedData}
//           columns={getAdmissionColumns(handleDelete)}
//           handleDelete={handleDelete}
//           // tableHeight="40vh"
//           className="w-full overflow-auto"
//           itemsPerPage={15}
//         />
        
//       ) : (
//         <NoDataFound />
//       )}
      
//     </div>
//   );
// }

// export default Create_Registration_Form;

// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./index.css";
// import { MdDelete,MdRemoveRedEye } from "react-icons/md";
// import '../../../src/index.css'
// import Switch from "@mui/material/Switch";
// import axios from "axios";
// import "../../Dynamic/Form/FormStyle.css";
// import DynamicDataTable from "./DataTable";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Cookies from "js-cookie";
// import NoDataFound from "../../NoDataFound";
// import { Button, FormControlLabel, TextField } from "@mui/material";
// import useCustomQuery from "../../useCustomQuery";
// import Loading from "../../Loading";
// import SomthingwentWrong from "../../SomthingwentWrong";
// import BulkAdmission from "./BulkAdmission";
// import Input from "../../Dynamic/Input";
// import Selector from "../../Dynamic/Selector";
// import Heading from "../../Dynamic/Heading";
// import Tables from "../../Dynamic/Tables";
// import { Link } from "react-router-dom";

// function Create_Registration_Form() {
//   const [filterText, setFilterText] = useState("");
//   const { currentColor } = useStateContext();
//   const authToken = Cookies.get("token");
//   const [sibling, setsibling] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [shouldFetchData, setShouldFetchData] = useState(false);
//   const [submittedData, setSubmittedData] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [getClass, setGetClass] = useState({});
//   const [selectedClass, setSelectedClass] = useState("");
//   const [availableSections, setAvailableSections] = useState([]);
//   const [studentImagePreview, setStudentImagePreview] = useState(null);
//   const [parentImagePreview, setParentImagePreview] = useState(null);
//   const [studentImageBinary, setStudentImageBinary] = useState("");


  
//   const [payload,setPayload]=useState(
//     {

//     studentFullName: "anand",
//     admissionNumber: "",
//     studentEmail: "",
//     studentPassword: "",
//     studentContact: "9999999999",
//     alt_mobile_no: "77777777777",
//     studentAddress: "bth",
//     studentCountry: "india",
//     state: "bihar",
//     city: "bth",
//     pincode: "845438",
//     nationality: "indian",
//     caste: "OBC",
//     religion: "HIndu",
//     guardian_name: "Guardian",
//     aadhar_no: "2345678998765",
//     aadhar_name: "anand",
//     mothere_tougue: "mother",
//     category: "OBC",
//     minority: "Minority",
//     is_bpl: "bpl",
//     mainstramed_child: "mainstra",
//     pre_year_schl_status: "preyear",
//     stu_ward: "stuward",
//     pre_class_exam_app: "preclass",
//     perc_pre_class: "perc_pre_class",
//     att_pre_class: "att_pre_class",
//     fac_free_uniform: "fac_free_uniform",
//     received_central_scholarship: "received_central_scholarship",
//     name_central_scholarship: "",
//     received_state_scholarship: "",
//     received_other_scholarship: "",
//     scholarship_amount: "",
//     fac_provided_cwsn: "",
//     SLD_type: "",
//     aut_spec_disorder: "",
//     ADHD: "",
//     inv_ext_curr_activity: "",
//     vocational_course: "",
//     trade_sector_id: "",
//     job_role_id: "",
//     pre_app_exam_vocationalsubject: "",
//     bpl_card_no: "",
//     ann_card_no: "",
//     studentDateOfBirth: "17-05-1996",
//     studentGender: "Male",
//     studentJoiningDate: "17-05-2024",
//     studentClass: "III",
//     studentSection: "A",
//     studentImage: "",
//     fatherName: "FatherName",
//     motherName: "motherName",
//     parentEmail: "",
//     parentPassword: "",
//     parentContact: "8767888999",
//     parentIncome: "100000",
//     parentQualification: "BCA",
//     parentImage: "",
//     parentAdmissionNumber: "",
//     studentImage:null
    
//   }
// )



//   const handleImagePreview = (event, setPreview) => {
//     const file = event.target.files[0];

//     if (file) {
//       // For preview
//       const previewReader = new FileReader();
//       previewReader.onload = () => {
//         setPreview(previewReader.result); // Set image preview
//       };
//       previewReader.readAsDataURL(file);

//       // For binary data
//       const binaryReader = new FileReader();
//       binaryReader.onload = () => {
//         setStudentImageBinary(binaryReader.result); // Set binary data
//       };
//       binaryReader.readAsBinaryString(file);
//     }
//   };

//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };

//   const {
//     queryData: allAdmission,
//     loading: admissionLoading,
//     error: admissionError,
//     refetch: refetchRegistrations,
//   } = useCustomQuery(
//     "https://eshikshaserver.onrender.com/api/v1/adminRoute/getLastYearStudents"
//   );

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const payloadData={
//       "studentFullName": payload.studentFullName,
//       "studentEmail": payload.studentEmail,
//       "studentPassword":  payload.studentPassword,
//       "studentDateOfBirth": payload.studentDateOfBirth,
//       "studentGender": payload.studentGender,
//       "studentJoiningDate": payload.studentJoiningDate,
//       "studentAddress": payload.studentAddress,
//       "studentContact": payload.studentContact,
//       "studentClass":selectedClass ,
//       "studentSection": "A",
//       "studentCountry": payload.studentCountry,
//       "studentSubject": "",
//       "fatherName": payload.fatherName,
//       "motherName": payload.motherName,
//       "parentEmail": payload.parentEmail,
//       "parentPassword":  payload.parentPassword,
//       "parentContact":  payload.parentContact,
//       "parentIncome":payload.parentIncome,
//       "parentQualification":payload.parentQualification,
//       "parentImage": parentImagePreview,
//       "religion": payload.religion,
//       "caste":payload.caste,
//       "nationality": payload.nationality,
//       "pincode": payload.pincode,
//       "state":  payload.state,
//       "city": payload.city,
//       "admissionNumber": payload.admissionNumber,
//       "studentAdmissionNumber": payload.admissionNumber,
//       "stu_id": payload.admissionNumber,
//       "class": selectedClass,
//       "section":"A",
//       "roll_no": "",
//       "student_name":payload.studentFullName,
//       "gender": payload.studentGender,
//       "DOB": payload.studentDateOfBirth,
//       "mother_name": payload.motherName,
//       "father_name": payload.fatherName,
//       "gaurdian_name":payload.guardian_name,
//       // "guardian_name": "N/A",
//       "aadhar_no":payload.aadhar_no,
//       "aadhar_name": payload.aadhar_name,
//       "paddress": payload.studentAddress,
//       "mobile_no": payload.studentContact,
//       "email_id": payload.studentEmail,
//       "mothere_tougue": payload.mothere_tougue,
//       "category": payload.category,
//       "minority": payload.minority? payload.minority :"No",
//       "is_bpl":false,
//       "is_aay": payload.is_aay?payload.is_aay:0,
//       "ews_aged_group": "18-30",
//       "is_cwsn": 0,
//       "cwsn_imp_type": "None",
//       "ind_national":payload.nationality?payload.nationality: "INDIAN",
//       "mainstramed_child": payload.mainstramed_child?payload.mainstramed_child:"No",
//       "adm_no": payload.admissionNumber,
//       "adm_date": payload.studentJoiningDate,
//       "stu_stream": "Science",
//       "pre_year_schl_status": payload.pre_year_schl_status?payload.pre_year_schl_status:"Passed",
//       "pre_year_class": "9",
//       "stu_ward": payload.stu_ward?payload.stu_ward:"N/A",
//       "pre_class_exam_app": payload.pre_class_exam_app?payload.pre_class_exam_app:"N/A",
//       "result_pre_exam": payload.result_pre_exam?payload.result_pre_exam:"Passed",
//       "perc_pre_class": 4,
//       "att_pre_class": payload.att_pre_class?payload.att_pre_class:"N/A",
//       "fac_free_uniform": payload.fac_free_uniform?payload.fac_free_uniform:"Yes",
//       "fac_free_textbook": "Yes",
//       "received_central_scholarship":  true,
//       "name_central_scholarship":payload.name_central_scholarship?payload.name_central_scholarship: "N/A",
//       "received_other_scholarship":payload.received_other_scholarship?payload.received_other_scholarship: true,
//       "scholarship_amount": Number(payload.scholarship_amount)?Number(payload.scholarship_amount):0,
//       "fac_provided_cwsn": payload.fac_provided_cwsn? payload.fac_provided_cwsn:"N/A",
//       "SLD_type":payload.SLD_type?payload.SLD_type: "N/A",
//       "aut_spec_disorder":payload.aut_spec_disorder?payload.aut_spec_disorder: "N/A",
//       "ADHD": payload.ADHD?payload.ADHD:"N/A",
//       "inv_ext_curr_activity":payload.inv_ext_curr_activity?payload.inv_ext_curr_activity: "N/A",
//       "vocational_course": payload.vocational_course? payload.vocational_course:"N/A",
//       "trade_sector_id": payload.trade_sector_id? payload.trade_sector_id:"N/A",
//       "job_role_id": payload.job_role_id?payload.job_role_id:"None",
//       "pre_app_exam_vocationalsubject": payload.pre_app_exam_vocationalsubject?payload.pre_app_exam_vocationalsubject:"None",
//       "bpl_card_no": payload.bpl_card_no ?payload.bpl_card_no:"N/A",
//       "ann_card_no":   payload.ann_card_no?payload.ann_card_no:"N/A",
//       "studentImage":payload.studentImage
      
//     }


//     const formDataToSend = new FormData();
//     Object.entries(payloadData).forEach(([key, value]) => {
//       if (key === "studentImage" || key === "parentImage") {
//         // formDataToSend.append(key, String(value));
//         if (value) {
//           formDataToSend.append(key, value);
//         }
//       } else {
//         // Convert other values to strings and append
//         formDataToSend.append(key, String(value ?? ""));
      
//       }
      
//       // if (key !== "parentImage") {
//       //   formDataToSend.append(key, String(value));
//       // }
      
//     });
//     formDataToSend.append("studentImage", payload.studentImage);
//     formDataToSend.append("parentImage", payload.parentImage);

//     try {
//       setLoading(true);
//       const response = await axios.post(
//         "https://eshikshaserver.onrender.com/api/v1/adminRoute/createStudentParent",
//         formDataToSend,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       setIsOpen(!isOpen);
//       refetchRegistrations();
//       // setLoading(false);
//       // setParentImagePreview(null);
//       // setStudentImagePreview(null);
//     } catch (error) {
//       setLoading(false);
//       console.error("Error submitting form:", error);
//     }
//   };


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
//   useEffect(() => {
//     axios
//       .get(
//         `https://eshikshaserver.onrender.com/api/v1/adminRoute/getAllClasses`,
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
//   const handleDelete = (email) => {
//     const authToken = Cookies.get("token");

//     const ConfirmToast = ({ closeToast }) => (
//       <div>
//         <p>Are you sure you want to delete this student?</p>
//         <button
//           className="text-red-700 font-bold text-xl"
//           onClick={() => {
//             axios
//               .put(
//                 `https://eshikshaserver.onrender.com/api/v1/adminRoute/deactivateStudent`,
//                 { email },
//                 {
//                   withCredentials: true,
//                   headers: {
//                     Authorization: `Bearer ${authToken}`,
//                   },
//                 }
//               )
//               .then((response) => {
//                 const updatedData = submittedData.filter(
//                   (item) => item.email !== email
//                 );
//                 setSubmittedData(updatedData);
//                 setShouldFetchData(!shouldFetchData);
//                 refetchRegistrations();
//                 toast.success("Student data deleted successfully");
//                 closeToast();
//               })
//               .catch((error) => {
//                 console.error("Error deleting Student data:", error);
//                 toast.error(
//                   "An error occurred while deleting the Student data.",
//                   error
//                 );
//                 closeToast();
//               });
//           }}
//           style={{ marginRight: "10px" }}
//         >
//           Yes
//         </button>
//         <button onClick={closeToast} className="text-green-800 text-xl">
//           No
//         </button>
//       </div>
//     );
//     toast(<ConfirmToast />);
//   };

//   useEffect(() => {
//     if (allAdmission) {
//       setSubmittedData(allAdmission.allStudent);
//     }
//   });

//   if (admissionLoading) {
//     return <Loading />;
//   }
//   if (admissionError) {
//     return <SomthingwentWrong />;
//   }



//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPayload({
//         ...payload,
//         studentImage: file,
//       });
//     }
//   };
//   const handleParentImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPayload({
//         ...payload,
//         parentImage: file,
//       });
//     }
//   };



//   // const handleImageChange = (e) => {
//   //   const file = e.target.files[0];
//   //   if (file) {
//   //     setFormData({
//   //       ...formData,
//   //       image: file,
//   //     });
//   //   }
//   // };

//   const handleChange=(e)=>{
//    const {name,value}=e.target
//    setPayload(()=>(
//     {
//       ...payload,
//       [name]:value
//     }
//    ))
//   }
//   const THEAD = [
   
//     "S.No.",
//     "Photo",
//     "adm No",
//     "Class",
//     "Name",
//     "Father",
//     "Gender",
//     "Email",
//     "Contact",
//     "Adm Date",
    
//     "Actions",
   
//   ];
//   const handleFilterChange = (e) => {
//     setFilterText(e.target.value);
//   };
//   const filteredData = submittedData.filter((row) => {
//     return Object.values(row).some((value) =>
//       value.toString().toLowerCase().includes(filterText.toLowerCase())
//     );
//   });

//   return (
//     <div className="md:h-screen mt-20 md:mt-1 px-1">
      
//       <Heading Name="New Admission" />
      
//       <Button
//         variant="contained"
//         style={{
//           backgroundColor: currentColor,
//           marginRight: "20px",
//           fontSize: "10px",
//           padding: "5px",
//         }}
//         onClick={toggleModal}
//       >
//         Create Admission
//       </Button>
  
//       <BulkAdmission refreshRegistrations={refetchRegistrations} />
//       <div className="inline-block ml-4">
//       <Input
//         type="text"
//         name="search"
//         required={false}
//         label="Search....."
//         width={"150px"}
//         value={filterText}
//           onChange={handleFilterChange}
//         // Add your onChange handler here for student image
//       />
//       </div>
    
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full  max-h-full" data-aos="fade-down">
//             <div className="relative  rounded-lg shadow dark:bg-gray-700 overflow-auto ">
//               <div className="flex items-center justify-between px-2 md:px-2 border-b rounded-t dark:border-gray-600 bg-white">
//                 <h3
//                   className="text-[15px] font-semibold  dark:text-white px-5"
//                   style={{ color: currentColor }}
//                 >
//                   Admission Form
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
//               <div className="h-[75vh] sm:h-[70vh] md:h-[70vh] lg:h-[65vh]  overflow-auto  bg-gray-50">
//                 <form onSubmit={handleSubmit}>
//                   <div className="mt-2 grid sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6 grid-cols-1 gap-3 px-6  mx-auto bg-gray-100 rounded-md ">
//                     <Input
//                       type="text"
//                       name="studentFullName"
//                       required={true}
//                       label="Full Name"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentFullName}
//                     />
//                     <Input
//                       type="text"
//                       name="admissionNumber"
//                       required={false}
//                       label=" Admission No"
//                       onChange={handleChange}
//                       value={payload.admissionNumber}
//                     />
//                     <Input
//                       type="email"
//                       name="studentEmail"
//                       required={true}
//                       label="Email"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentEmail}
//                     />
//                     <Input
//                       type="password"
//                       name="studentPassword"
//                       required={true}
//                       label="Password"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentPassword}
//                     />
//                     <Input
//                       type="tel"
//                       name="studentContact"
//                       required={true}
//                       label="Contact"
//                       maxLength={10}
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentContact}
//                     />
//                     <Input
//                       type="tel"
//                       name="alt_mobile_no"
                     
//                       label="Alt Mobile No"
//                       maxLength={10}
//                       onChange={handleChange}
//                       value={payload.alt_mobile_no}
//                     />
//                     <Input
//                       type="text"
//                       name="studentAddress"
                     
//                       label="Address"
//                       onChange={handleChange}
//                       value={payload.studentAddress}
//                     />
//                     <Input
//                       type="text"
//                       name="studentCountry"
                     
//                       label="Country"
//                       onChange={handleChange}
//                       value={payload.studentCountry}
//                     />
//                     <Input
//                       type="text"
//                       name="state"
//                       required={false}
//                       label="State"
//                       onChange={handleChange}
//                       value={payload.state}
//                     />
//                     <Input
//                      type="text"
//                       name="city"
                      
//                        label="City" 
//                        onChange={handleChange}
//                        value={payload.city}
//                        />
//                     <Input
//                       type="text"
//                       name="pincode"
//                       required={false}
//                       label="Pincode"
//                       onChange={handleChange}
//                       value={payload.pincode}
//                     />
//                     <Input
//                       type="text"
//                       name="nationality"
//                       required={false}
//                       label="Nationality"
//                       onChange={handleChange}
//                       value={payload.nationality}
//                     />
//                     <Input
//                       type="text"
//                       name="caste"
//                       required={false}
//                       label="Caste"
//                       onChange={handleChange}
//                       value={payload.caste}
//                     />
//                     <Input
//                       type="text"
//                       name="religion"
//                       required={false}
//                       label="Religion"
//                       onChange={handleChange}
//                       value={payload.religion}
//                     />
//                     <Input
//                       type="text"
//                       name="guardian_name"
//                       required={false}
//                       label="Guardian Name"
//                       onChange={handleChange}
//                       value={payload.guardian_name}
//                     />
//                     <Input
//                       type="text"
//                       name="aadhar_no"
//                       required={false}
//                       label="Aadhar No"
//                       onChange={handleChange}
//                       value={payload.aadhar_no}
//                     />
//                     <Input
//                       type="text"
//                       name="aadhar_name"
//                       required={false}
//                       label="Aadhar Name"
//                       onChange={handleChange}
//                       value={payload.aadhar_name}
//                     />
//                     <Input
//                       type="text"
//                       name="mothere_tougue"
//                       required={false}
//                       label="Mothere Tougue"
//                       onChange={handleChange}
//                       value={payload.mothere_tougue}
//                     />
//                     <Input
//                       type="text"
//                       name="category"
//                       required={false}
//                       label="Category"
//                       onChange={handleChange}
//                       value={payload.category}
//                     />
//                     <Input
//                       type="text"
//                       name="minority"
//                       required={false}
//                       label="Minority"
//                       onChange={handleChange}
//                       value={payload.minority}
//                     />
//                     <Input
//                       type="text"
//                       name="is_bpl"
//                       required={false}
//                       label="Is BPL"
//                       onChange={handleChange}
//                       value={payload.is_bpl}
//                     />
//                     <Input
//                       type="text"
//                       name="mainstramed_child"
//                       required={false}
//                       label="Mainstramed Child"
//                       onChange={handleChange}
//                       value={payload.mainstramed_child}
//                     />
//                     <Input
//                       type="text"
//                       name="pre_year_schl_status"
//                       required={false}
//                       label="pre_year_schl_status"
//                       onChange={handleChange}
//                       value={payload.pre_year_schl_status}
//                     />
//                     <Input
//                       type="text"
//                       name="pre_year_class"
//                       required={false}
//                       label="pre_year_class"
//                       onChange={handleChange}
//                       value={payload.pre_year_class}
//                     />
//                     <Input
//                       type="text"
//                       name="stu_ward"
//                       required={false}
//                       label="stu_ward"
//                       onChange={handleChange}
//                       value={payload.stu_ward}
//                     />
//                     <Input
//                       type="text"
//                       name="pre_class_exam_app"
//                       required={false}
//                       label="pre_class_exam_app"
//                       onChange={handleChange}
//                       value={payload.pre_class_exam_app}
//                     />
//                     <Input
//                       type="text"
//                       name="result_pre_exam"
//                       required={false}
//                       label="result_pre_exam"
//                       onChange={handleChange}
//                       value={payload.result_pre_exam}
//                     />
//                     <Input
//                       type="text"
//                       name="perc_pre_class"
//                       required={false}
//                       label="perc_pre_class"
//                       onChange={handleChange}
//                       value={payload.perc_pre_class}
//                     />
//                     <Input
//                       type="text"
//                       name="att_pre_class"
//                       required={false}
//                       label="att_pre_class"
//                       onChange={handleChange}
//                       value={payload.att_pre_class}
//                     />
//                     <Input
//                       type="text"
//                       name="fac_free_uniform"
//                       required={false}
//                       label="fac_free_uniform"
//                       onChange={handleChange}
//                       value={payload.fac_free_uniform}
//                     />
//                     <Input
//                       type="text"
//                       name="received_central_scholarship"
//                       required={false}
//                       label="received_central_scholarship"
//                       onChange={handleChange}
//                       value={payload.received_central_scholarship}
//                     />
//                     <Input
//                       type="text"
//                       name="name_central_scholarship"
//                       required={false}
//                       label="name_central_scholarship"
//                       onChange={handleChange}
//                       value={payload.name_central_scholarship}
//                     />
//                     <Input
//                       type="text"
//                       name="received_state_scholarship"
//                       required={false}
//                       label="received_state_scholarship"
//                       onChange={handleChange}
//                       value={payload.received_state_scholarship}
//                     />
//                     <Input
//                       type="text"
//                       name="received_other_scholarship"
//                       required={false}
//                       label="received_other_scholarship"
//                       onChange={handleChange}
//                       value={payload.received_other_scholarship}
//                     />
//                     <Input
//                       type="text"
//                       name="scholarship_amount"
//                       required={false}
//                       label="scholarship_amount"
//                       onChange={handleChange}
//                       value={payload.scholarship_amount}
//                     />
//                     <Input
//                       type="text"
//                       name="fac_provided_cwsn"
//                       required={false}
//                       label="fac_provided_cwsn"
//                       onChange={handleChange}
//                       value={payload.fac_provided_cwsn}
//                     />
//                     <Input
//                       type="text"
//                       name="SLD_type"
//                       required={false}
//                       label="SLD_type"
//                       onChange={handleChange}
//                       value={payload.SLD_type}
//                     />
//                     <Input
//                       type="text"
//                       name="aut_spec_disorder	"
//                       required={false}
//                       label="aut_spec_disorder	"
//                       onChange={handleChange}
//                       value={payload.aut_spec_disorder}
//                     />
//                     <Input
//                       type="text"
//                       name="ADHD"
//                       required={false}
//                       label="ADHD"
//                       onChange={handleChange}
//                       value={payload.ADHD}
//                     />
//                     <Input
//                       type="text"
//                       name="inv_ext_curr_activity"
//                       required={false}
//                       label="inv_ext_curr_activity"
//                       onChange={handleChange}
//                       value={payload.inv_ext_curr_activity}
//                     />
//                     <Input
//                       type="text"
//                       name="vocational_course"
//                       required={false}
//                       label="vocational_course"
//                       onChange={handleChange}
//                       value={payload.vocational_course}
//                     />
//                     <Input
//                       type="text"
//                       name="trade_sector_id"
//                       required={false}
//                       label="trade_sector_id"
//                       onChange={handleChange}
//                       value={payload.trade_sector_id}
//                     />
//                     <Input
//                       type="text"
//                       name="job_role_id"
//                       required={false}
//                       label="job_role_id"
//                       onChange={handleChange}
//                       value={payload.job_role_id}
//                     />
//                     <Input
//                       type="text"
//                       name="pre_app_exam_vocationalsubject"
//                       required={false}
//                       label="pre_app_exam_vocationalsubject"
//                       onChange={handleChange}
//                       value={payload.pre_app_exam_vocationalsubject}
//                     />
//                     <Input
//                       type="text"
//                       name="bpl_card_no"
//                       required={false}
//                       label="bpl_card_no"
//                       onChange={handleChange}
//                       value={payload.bpl_card_no}
//                     />
//                     <Input
//                       type="text"
//                       name="ann_card_no"
//                       required={false}
//                       label="ann_card_no"
//                       onChange={handleChange}
//                       value={payload.ann_card_no}
//                     />
//                     <Input
//                       type="date"
//                       name="studentDateOfBirth"
                     
//                       label="DOB"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentDateOfBirth}
//                     />
//                     <Selector
//                       label="Gender"
//                       name="studentGender"
//                       options={["Male", "Female", "Other"]}
                     
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentGender}
//                     />
//                     <Input
//                       type="date"
//                       name="studentJoiningDate"
                     
//                       label="Admission Date"
//                       required_field={true}
//                       onChange={handleChange}
//                       value={payload.studentJoiningDate}
//                     />
//                     <div className="flex flex-col space-y-1">
                     
//                       <select
//                         name="studentClass"
//                         className="input_text w-full"
//                         onFocus={(e) =>
//                           (e.target.style.borderColor = currentColor)
//                         }
//                         onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                         value={selectedClass}
//                         onChange={handleClassChange}
//                         required
//                       >
//                         <option value="" disabled>
//                           Select a Class
//                         </option>
//                         {getClass.map((cls, index) => (
//                           <option key={index} value={cls.className}>
//                             {cls?.className}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <Selector
//                       name="studentSection"
//                       options={availableSections}
//                       label="Select a Section"
                     
//                     />

//                     <Input
//                       type="file"
//                       name="studentImage"
//                       required={false}
//                       label="Student Image"
//                       // onChange={(e) =>
//                       //   handleImagePreview(e, setStudentImagePreview)
//                       // }
//                       onChange={handleImageChange}
//                     />
//                   </div>
//                   <div className="flex flex-row gap-10  justify-center bg-gray-100   text-center">
//                     <span className=" text-xl text-blue-900">
//                       Parent Details
//                     </span>
//                     <FormControlLabel
//                       control={<Switch onClick={() => setsibling(!sibling)} />}
//                       label="Sibling"
//                     />
//                   </div>
//                   {sibling ? (
//                     <div className=" grid  md:grid-cols-6 grid-cols-1 gap-3 p-6  mx-auto bg-gray-100 rounded-md ">
//                       <Input
//                         type="text"
//                         name="fatherName"
//                         required={true}
//                         label="Father's Name"
//                         required_field={true}
//                         onChange={handleChange}
//                         value={payload.fatherName}
//                       />
//                       <Input
//                         type="text"
//                         name="motherName"
//                         required={false}
//                         label="Mother's Name"
//                         onChange={handleChange}
//                         value={payload.motherName}

//                       />
//                       <Input
//                         type="email"
//                         name="parentEmail"
//                         required={true}
//                         label="Parent Email"
//                         required_field={true}
//                         onChange={handleChange}
//                         value={payload.parentEmail}
//                       />
//                       <Input
//                         type="password"
//                         name="parentPassword"
//                         required={true}
//                         label="Parent Password"
//                         required_field={true}
//                         onChange={handleChange}
//                         value={payload.parentPassword}
//                       />
//                       <Input
//                         type="tel"
//                         name="parentContact"
//                         required={true}
//                         label="Parent Contact"
//                         required_field={true}
//                         maxLength={10}
//                         onChange={handleChange}
//                         value={payload.parentContact}
//                       />
//                       <Input
//                         type="text"
//                         name="parentIncome"
                        
//                         label="Parent Income"
//                         onChange={handleChange}
//                         value={payload.parentIncome}
//                       />
//                       <Input
//                         type="text"
//                         name="parentQualification"
                       
//                         label=" Parent Qualification"
//                         onChange={handleChange}
//                         value={payload.parentQualification}
//                       />
//                       <Input
//                         type="file"
//                         name="parentImage"
//                         required={false}
//                         label="Parent Image"
//                         // onChange={(e) =>
//                         //   handleImagePreview(e, setParentImagePreview)
//                         // }
//                         onChange={handleParentImageChange}
//                       />


//                     </div>
//                   ) : (
//                     <div className="  bg-gray-100">
//                       <div className="px-5 md:max-w-[25%] w-full  text-center ">
                        
//                         <Input
//                           type="text"
//                           name="parentAdmissionNumber"
//                           required={true}
//                           label="Parent's Admission Number"
//                           onChange={handleChange}
//                           value={payload.parentAdmissionNumber}
//                         />
//                       </div>
//                     </div>
//                   )}

//                   <div className="md:col-span-6 text-right">
//                     <div className="flex items-center gap-5 py-2 md:py-2 md:px-4 px-4 border-t border-gray-200 rounded-b dark:border-gray-600">
//                       <Button
//                         type="submit"
//                         variant="contained"
//                         style={{
//                           backgroundColor: currentColor,
//                           color: "white",
//                           width: "100%",
//                           padding:"2px 2px"
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
//                               d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
//                               fill="currentColor"
//                             />
//                             <path
//                               d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
//                               fill="currentFill"
//                             />
//                           </svg>
//                         ) : (
//                           " Submit"
//                         )}
//                       </Button>
//                       <Button
//                         variant="contained"
//                         onClick={toggleModal}
//                         style={{
//                           backgroundColor: "#616161",
//                           color: "white",
//                           width: "100%",
//                             padding:"2px 2px"
//                         }}
//                       >
//                         Cancel
//                       </Button>
//                     </div>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className=" items-center mt-1"></div>
  
//       <Tables  thead={THEAD} 
//        tbody={ filteredData?.map((val, ind) => ({
//         "S.No.":ind+1,
//         "Photo": (
//           val?.image && val?.image.url ? (
//             <img
//               src={val?.image?.url  }
//               alt="Student"
//               style={{
//                 width: "25px",
//                 height: "25px",
//                 borderRadius: "50%",
//                 objectFit: "cover",
//               }}
//             />
//           ) : (
//             <span><img className="h-[25px] w-[25px] rounded-full object-contain" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png" alt="" /></span>
//           )
//         ),
      
//       //   "Photo": <img
//       //   src={val?.image?.url  }
//       //   alt="Student"
//       //   style={{
//       //     width: "25px",
//       //     height: "25px",
//       //     borderRadius: "50%",
//       //     objectFit: "cover",
//       //   }}
//       // />,
      
//         "adm No": val?. admissionNumber,
//         "Class":val?.class,
//         "Name":val?.fullName,
//         "Father":val?.fatherName,
//         "Gender":val?.gender,
//         "Email":val?.email,
//         "Contact":val?.contact,
//         "Adm Date":val?.joiningDate,
       
//         "Delete":<div className=" w-full flex ">
//          <div className="text-[16px]">
//          <Link to={`/admin/admission/view-admission/${val.admissionNumber}`}><MdRemoveRedEye /></Link>
//          </div>
//           <button onClick={()=>handleDelete(val.email)} className="text-[16px]"> <MdDelete /></button>
//           {/* <button onClick={()=>handleDelete(val.email)} className="text-[16px]"> <MdRemoveRedEye /></button> */}
//         </div>,
//        }))}
      
//       />
//       {/* {submittedData.length > 0 ? (
//         <DynamicDataTable data={submittedData} handleDelete={handleDelete} />
//       ) : (
//         <NoDataFound />
//       )} */}
//     </div>
//   );
// }

// export default Create_Registration_Form;



