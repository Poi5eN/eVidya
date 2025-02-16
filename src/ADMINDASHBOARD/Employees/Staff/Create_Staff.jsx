import React, { useState, useEffect } from "react";
import InputForm from "../../../Dynamic/Form/InputForm";
import { toast } from "react-toastify";
import Modal from "react-modal";
import axios from "axios";
import '../../../Dynamic/Form/FormStyle.css'
import { useStateContext } from "../../../contexts/ContextProvider";
import DynamicDataTable from "./DataTable";
import Cookies from 'js-cookie';
const authToken = Cookies.get('token');


function Create_Staff() {
  const { currentColor } = useStateContext();
  const modalStyle = {
    content: {
      // width: "80%",
      // top: "50%",
      // left: "50%",
      // right: "auto",
      // bottom: "auto",
      // marginRight: "-50%",
      // transform: "translate(-50%, -50%)",
      zIndex: 1000,
      // background:currentColor
    },
  };
  
  const [loading,setLoading]=useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    password: "",
    dateOfBirth: "",
    qualification: "",
    salary: "",
    gender: "",
    joiningDate: "",
    address: "",
    contact: "",
    image: null,
  });
  const [submittedData, setSubmittedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch data from the server when the component mounts
    axios.get('https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllEmployees', {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      }, // Set withCredentials to true
    })
    .then((response) => {
      
      if (Array.isArray(response.data.allEmployee)) {
        // Update the state with the array
        setSubmittedData(response.data.allEmployee);
      } else {
        console.error("Data format is not as expected:", response.data);
      }
    })
    
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
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

  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "image") {
        formDataToSend.append(key, String(value));
      }
    });
    formDataToSend.append("image", formData.image);

    try {
      setLoading(true)
      const response = await axios.post(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/createEmployee",
        formDataToSend,
        {
          withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "multipart/form-data",
      },
        }
      );
      
      setSubmittedData([...submittedData, formData]);
      setLoading(false)
      toast.success("Form submitted successfully!");
      closeModal();
    } catch (error) {
      
      console.error("Error:", error);
      toast.error("An error occurred while submitting the form.");
    }
  };

  const handleDelete = (email) => {
    axios.put(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/deactivateEmployee`, { email }, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => {
        const updatedData = submittedData.filter((item) => item.email !== email);
        setSubmittedData(updatedData);

        toast.success("Staff data deleted successfully");
      })
      .catch((error) => {
        
        console.error("Error deleting Staff data:", error);
        toast.error("An error occurred while deleting the staff data.");
      });
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };


  const formFields = [
    {
      label: "Full Name",
      name: "fullName",
      type: "text",
      value: formData.fullName,
      required: true,
    },
    {
      label: "Employee ID",
      name: "employeeId",
      type: "text",
      value: formData.employeeId,
      required: true,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      value: formData.email,
      required: true,
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      value: formData.password,
      required: true,
    },
    {
      label: "Date of Birth",
      name: "dateOfBirth",
      type: "date",
      value: formData.dateOfBirth,
      required: true,
    },
   
    {
      label: "Qualification",
      name: "qualification",
      type: "text",
      value: formData.qualification,
      required: true,
    },
    {
      label: "Salary",
      name: "salary",
      type: "number",
      value: formData.salary,
      required: true,
    },
    {
      label: "Gender",
      name: "gender",
      type: "select",
      value: formData.gender,
      required: true,
      selectOptions: ["Gender","Male", "Female","Other"],
    },
    {
      label: "Joining Date",
      name: "joiningDate",
      type: "date",
      value: formData.joiningDate,
      required: true,
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      value: formData.address,
      required: true,
    },
    {
      label: "Contact",
      name: "contact",
      type: "tel",
      value: formData.contact,
      required: true,
    },
    {
      label: "Profile Pic",
      name: "image",
      type: "file",
      accept: "image/*",
      required: true,
    },
  ];


  return (
    <div className=" mt-12 md:mt-1  mx-auto p-3">
      <h1 
      className="text-4xl font-bold mb-4 uppercase text-center  hover-text "
      style={{color:currentColor}}
      >All Staff Here</h1>
      <button
        onClick={openModal}
        className="dark:text-white dark:bg-secondary-dark-bg text-gray-800  neu-btn border-2 "
        style={{border:`2px solid ${currentColor} `,color:currentColor}}
      >
        Add Staff
      </button>
      {isModalOpen && <div className="modal-blur"></div>}
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Create Form"
        style={modalStyle}
        overlayClassName="overlay"
      >
        <h1
className="text-xl font-bold mb-4 uppercase text-center  hover-text "
style={{color:currentColor}}
        >
          Create Staff
        </h1>
        <InputForm
          fields={formFields}
          handleChange={handleFieldChange}
          handleImageChange={handleImageChange}
        />
        <div 
         style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}
         >
          <button
            onClick={handleSubmit}
            className="dark:text-white dark:bg-secondary-dark-bg text-gray-800  neu-btn border-2 "
            style={{border:`2px solid ${currentColor} `,color:currentColor}}
            
          >
           { loading ?
               ( <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
               <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
           </svg>): " Submit"
            }
          </button>
          <button onClick={closeModal} className="dark:text-white dark:bg-secondary-dark-bg ml-2 text-red-600  neu-btn border-2 "
            style={{border:`2px solid red `,}}
            >
            Cancel
          </button>
        </div>
      </Modal>

      <DynamicDataTable data={submittedData} handleDelete={handleDelete}/>
    </div>
  );
}

export default Create_Staff;
