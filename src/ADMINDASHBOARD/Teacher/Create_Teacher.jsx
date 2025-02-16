import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../Loading";
import SomthingwentWrong from "../../SomthingwentWrong";

import "../../Dynamic/Form/FormStyle.css";
import InputForm from "../../Dynamic/Form/InputForm";
import DynamicDataTable from "./DataTable";
import { useStateContext } from "../../contexts/ContextProvider";
import Cookies from "js-cookie";
import { Button } from "@mui/material";
import useCustomQuery from "../../useCustomQuery";
import NoDataFound from "../../NoDataFound";
import Heading from "../../Dynamic/Heading";
const authToken = Cookies.get("token");

const toastifyTiming = {
  autoClose: 1000,
};

const initialState = {
  fullName: "",
  employeeId: "",
  email: "",
  password: "",
  dateOfBirth: "",
  qualification: "",
  salary: "",
  subject: "",
  gender: "",
  joiningDate: "",
  address: "",
  contact: "",
  experience: "",
  section: "",
  classTeacher: "",
  image: null,
};

function CreateTeacher() {
  const { currentColor } = useStateContext();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [getClass, setGetClass] = useState([]);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };
  const {
    queryData: alleacher,
    error: teacherError,
    loading: teacherLoading,
    refetch: refetchRegistrations,
  } = useCustomQuery(
    "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getTeachers"
  );

  useEffect(() => {
    if (alleacher) {
      setSubmittedData(alleacher.data);
    }
  }, [alleacher]);

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
      setLoading(true);
      const response = await axios.post(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/createTeacher",
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFormData(initialState);
      setLoading(false);

      toast.success("Form submitted successfully!");

      setIsOpen(false);
      refetchRegistrations();
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);

      if (error.response && error.response.status === 400) {
        toast.error("Email already exists.", toastifyTiming);
        return;
      }
      toast.error(
        "An error occurred while submitting the form.",
        toastifyTiming
      );
    }
  };
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
        let classes=response.data.classList.map((cls)=>cls.className)
      
        setGetClass(classes.sort((a,b)=>a-b));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);


  const handleDelete = (email) => {
    axios
      .put(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deactivateTeacher`,
        { email },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then(() => {
        const updatedData = submittedData.filter(
          (item) => item.email !== email
        );
        setSubmittedData(updatedData);
        toast.success("Teacher data deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting teacher data:", error);
        toast.error("An error occurred while deleting the teacher data.");
      });
  };

  const formFields = [
    {
      label: "Full Name",
      name: "fullName",
      type: "text",
      value: formData.fullName,
   
    },
    {
      label: "Employee ID",
      name: "employeeId",
      type: "text",
      value: formData.employeeId,
   
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      value: formData.email,
   
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      value: formData.password,
   
    },
    {
      label: "Date of Birth",
      name: "dateOfBirth",
      type: "date",
      value: formData.dateOfBirth,
   
    },
    {
      label: "Qualification",
      name: "qualification",
      type: "text",
      value: formData.qualification,
   
    },
    {
      label: "Salary",
      name: "salary",
      type: "number",
      value: formData.salary,
   
    },
    {
      label: "Subject",
      name: "subject",
      type: "text",
      value: formData.subject,
   
    },
    {
      label: "Joining Date",
      name: "joiningDate",
      type: "date",
      value: formData.joiningDate,
   
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      value: formData.address,
   
    },
    {
      label: "Contact",
      name: "contact",
      type: "tel",
      value: formData.contact,
   
    },
    {
      label: "Experience",
      name: "experience",
      type: "select",
      value: formData.experience,
   
      selectOptions: [
        "Experience",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
      ],
    },
    {
      label: "Gender",
      name: "gender",
      type: "select",
      value: formData.gender,
   
      selectOptions: ["Gender", "Male", "Female", "Other"],
    },
    {
      label: "Class Teacher",
      name: "classTeacher",
      type: "select",
      value: formData.classTeacher,
      required: true,

      selectOptions: [
        "Class",
        ...getClass 
      ],
    },
    // {
    //   label: "Class",
    //   name: "className",
    //   type: "select",
    //   value: formData.className,
    //   required: true,

    //   selectOptions: [
    //     "Class",
    //     ...getClass 
    //   ],
    // },
    {
      label: "Section",
      name: "section",
      type: "select",
      value: formData.section,
   
      selectOptions: ["Section", "A", "B", "C", "D", "E"],
    },
   
    // {
    //   label: "Class",
    //   name: "classTeacher",
    //   type: "select",
    //   value: formData.classTeacher,
    //
    //   selectOptions: [
    //     "Class",
    //     "NURSERY",
    //     "LKG",
    //     "UKG",
    //     "1",
    //     "2",
    //     "3",
    //     "4",
    //     "5",
    //     "6",
    //     "7",
    //     "8",
    //     "9",
    //     "10",
    //     "11",
    //     "12",
    //   ],
    // },
    {
      label: "Profile Pic",
      name: "image",
      type: "file",
      accept: "image/*",
   
    },
  ];
  if (teacherLoading) {
    return <Loading />;
  }
  if (teacherError) {
    return <SomthingwentWrong />;
  }

  return (
    <div className=" mt-12 md:mt-1  mx-auto p-3   md:h-[100vh]">
      {/* <div>
        <h1
          className="text-4xl font-bold mb-4 uppercase text-center  hover-text "
          style={{ color: currentColor }}
        >
          All Teacher{" "}
        </h1>
      </div> */}
   <Heading Name="All Teacher" />
      <div className="mb-4">
        <Button
          variant="contained"
          style={{ backgroundColor: currentColor }}
          onClick={toggleModal}
        >
          Add Teacher
        </Button>
      </div>
      {isOpen && (
        <div
          id="default-modal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
        >
          <div className="relative p-4 w-full  max-h-full" data-aos="fade-down">
            <div className="relative  rounded-lg shadow dark:bg-gray-700 overflow-auto ">
              <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 bg-white">
                <h3 className="text-xl font-semibold  dark:text-white">
                  Add Teacher
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
              <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh]  overflow-auto  bg-gray-50">
                <div className="p-4 md:p-5 space-y-4  ">
                  <InputForm
                    fields={formFields}
                    handleChange={handleFieldChange}
                    handleImageChange={handleImageChange}
                  />

                  <div className="md:col-span-6 text-right mt-3 ">
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
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                        ) : (
                          " Submit"
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

      {
        submittedData.length>0 ?(
        <DynamicDataTable data={submittedData} handleDelete={handleDelete} />):<NoDataFound/>
      }
    </div>
  );
}

export default CreateTeacher;
