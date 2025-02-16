import axios from "axios";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Select from "react-select";
import { toast } from "react-toastify";
import Table from "./Table";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import DuesTable from "./DuesTable";


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`action-tabpanel-${index}`}
      aria-labelledby={`action-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `action-tab-${index}`,
    "aria-controls": `action-tabpanel-${index}`,
  };
}

const NewCheckFee2 = () => {
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showForm, setShowForm] = useState([]);
  const [reLoad, setReload] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
  const [allFees, setAllFees] = useState([]);
  const [parentData, setParentData] = useState([]);
  const [allStudent, setAllStudent] = useState([]);
  
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

 
  const getCurrentMonth = () => {
    const today = new Date();
    const month = today.toLocaleString("default", { month: "long" });
    return month;
  };
  const [formData, setFormData] = useState(
    parentData.map(() => ({
      classFee: "",
      additionalFeeValues: [],
      // feeStatus: "Unpaid",
      feeDate: "",
      paymentMode: "Cash",
      selectedMonths: [],
      previousDues: "",
      remarks: "",
      transactionId: "",
      chequeBookNo: "",
    }))
  );

  const authToken = Cookies.get("token");

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  useEffect(() => {
    axios
      .get(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        setAllStudent(response.data.allStudent);
      });
  }, [authToken]);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase().trim();
    setSearchTerm(searchValue);
    if (searchValue === "") {
      setFilteredStudents([]);
    } else {
      const filtered = allStudent.filter(
        (student) =>
          student.fullName &&
          student.fullName.toLowerCase().includes(searchValue)
      );
      setFilteredStudents(filtered);
    }
  };
  const handleSearchbyAdmissionNo = (event) => {
    const searchValue = event.target.value.toLowerCase().trim();
    setSearchTermbyadmissionNo(searchValue);
    if (searchValue === "") {
      setFilteredStudents([]);
    } else {
      const filtered = allStudent.filter(
        (student) =>
          student.admissionNumber &&
          student.admissionNumber.toLowerCase().includes(searchValue)
      );
      setFilteredStudents(filtered);
    }
  };

  const handleStudentClick = (admissionNumber) => {
    axios
      .get(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getParentWithChildren/${admissionNumber}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const children = response.data.children;
        setParentData(children);
        const initialFormData = children.map((child) => ({
          admissionNumber: child.admissionNumber,
          feeAmount: "",
          selectedMonths: [],
          //   selectedMonths: [getCurrentMonth()],
          feeDate: getCurrentDate(),
          // feeStatus: "Paid",
          paymentMode: "Cash",
          selectedAdditionalFees: [],
          amountSubmitted: 0,
          //   getFee: 0,
        }));

      
        setFormData(initialFormData);
        setIsOpen(true);
      })
      .catch((error) => {
        console.error("Error fetching parent data:", error);
      });
  };

  const handleChildSelection = (index) => {
    const selectedChild = parentData[index];
    const studentClass = selectedChild.class;

    axios
      .get(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const feesData = response.data.map((fee) => {
          const label =
            fee.name && fee.amount
              ? `${fee.name}`
              // ? `${fee.name} (${fee.amount})`
              : "Unknown Fee";
          const value = fee.amount ? fee.amount : 0;
          // const value = fee.amount ? fee.amount.toString() : "0";

          return {
            label,
            value,
          };
        });
        setAllFees(feesData);
      });

    axios
      .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        const data = response.data;

        if (Array.isArray(data)) {
          const studentFeeAmount =
            data
              .filter((feeType) => feeType.className === studentClass)
              .map((classData) => classData.amount)[0] || 0;

          const updatedFormData = [...formData];
          updatedFormData[index] = {
            ...updatedFormData[index],
            classFee: studentFeeAmount,
            selectedMonths: updatedFormData[index]?.selectedMonths || [],
            totalRegularFee:
              studentFeeAmount *
              (updatedFormData[index]?.selectedMonths.length || 1),
            additionalFee: updatedFormData[index]?.additionalFee || 0, // Add this line
          };

          setFormData(updatedFormData);
          //   setClassFee(studentFeeAmount);
        } else {
          console.error("Invalid or undefined feeTypeArray");
        }
      })
      .catch((error) => {
        console.log(error);
      });

    const updatedSelectedChildren = [...selectedChildren];
    const updatedShowForm = [...showForm];

    if (updatedSelectedChildren.includes(index)) {
      updatedSelectedChildren.splice(updatedSelectedChildren.indexOf(index), 1);
      updatedShowForm[index] = false; // Hide the form when unchecked
    } else {
      updatedSelectedChildren.push(index);
      updatedShowForm[index] = true; // Show the form when checked
    }

    setSelectedChildren(updatedSelectedChildren);
    setShowForm(updatedShowForm);
  };

  const handleMonthSelection = (selectedOptions, childIndex) => {
    const selectedMonths = selectedOptions.map((option) => option.value);

    // Initialize fee amounts for selected months
    const updatedFormData = [...formData];
    selectedMonths.forEach((month) => {
      if (!updatedFormData[childIndex].monthFees) {
        updatedFormData[childIndex].monthFees = {};
      }
      if (!updatedFormData[childIndex].monthFees[month]) {
        updatedFormData[childIndex].monthFees[month] =
          updatedFormData[childIndex].classFee || 0;
      }
    });

    updatedFormData[childIndex].selectedMonths = selectedMonths;

    // Calculate the total class fee based on selected months
    const totalClassFee =
      (updatedFormData[childIndex].classFee || 0) * selectedMonths.length;
    updatedFormData[childIndex].totalClassFee = totalClassFee;

    setFormData(updatedFormData);
  };

  const handleMonthFeeChange = (index, month, value) => {
    const updatedFormData = [...formData];
    updatedFormData[index].monthFees[month] = parseFloat(value);

    // Recalculate the total class fee whenever an input changes
    const totalClassFee =
      (updatedFormData[index].classFee || 0) *
      updatedFormData[index].selectedMonths.length;
    updatedFormData[index].totalClassFee = totalClassFee;

    setFormData(updatedFormData);
  };

  const handleInputChange = (index, field, value) => {
    const updatedFormData = [...formData];
    updatedFormData[index] = {
      ...updatedFormData[index],
      [field]: value,
    };
    setFormData(updatedFormData);
  };

  const toggleModal = () => {
    setIsOpen(!isOpen);

    if (isOpen) {
      setSelectedChildren([]);
    }
  };

  const handleAdditionalFeeChange = (index, feeIndex, month, value) => {
    const updatedFormData = [...formData];
    const feeData = updatedFormData[index].additionalFeeValues[feeIndex];

    // Update specific month fee value
    feeData.monthFees[month] = parseFloat(value) || 0;

    // Recalculate total for this fee
    const totalFeeForCurrent = feeData.selectedMonths.reduce(
      (total, month) => total + (feeData.monthFees[month] || 0),
      0
    );
    feeData.totalFee = totalFeeForCurrent;

    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const childIndex of selectedChildren) {
        const child = parentData[childIndex];
        const childFormData = formData[childIndex] || {}; // Ensure formData exists

        // Basic validation: Check if required fields are filled
        if (!childFormData.paymentMode) {
          toast.error(`Payment mode is required for ${child.fullName}`);
          continue; // Skip to next iteration
        }

        const selectedMonthsData =
          (childFormData.selectedMonths || []).map((month) => {
            const paidAmount = Number(childFormData.monthFees?.[month]) || 0;
         

            return {
              month: month,
              paidAmount: paidAmount,
              // status: "Paid",
            };
          }) || [];

        const additionalFeesData = (
          childFormData.additionalFeeValues || []
        ).flatMap((feeData) => {
         console.log("feeData",feeData)

          // Flatten selected months into separate objects
          return (feeData.selectedMonths || []).map((month) => ({
           
            name: feeData.fee , 
            // name:"Bus",
            month: month , 
            paidAmount: feeData.monthFees ? feeData.monthFees[month] || 0 : 0, 
            // status: "Paid", 
          }));
        });

        // Calculate Total Class Fee
        const totalClassFee = childFormData.totalClassFee || 0;
        // console.log("totalClassFee", childFormData);

        // Calculate Total Additional Fees
        const totalAdditionalFees = childFormData.additionalFee || 0;
        // console.log("totalAdditionalFees", totalAdditionalFees);

        // Calculate Total Fee Amount (Class Fee + Additional Fees)
        let previousDues = parseFloat(childFormData.previousDues) || 0;
        const totalFeeAmount = parseFloat(
          totalClassFee + totalAdditionalFees 
        );

        const concessionFee =
          parseFloat(childFormData.concessionFee) || 0;

        const TotalFeeAfterDiscount = concessionFee
          ? totalFeeAmount - (concessionFee) 
          : totalFeeAmount; 

        const newFeeData = {
          admissionNumber: child?.admissionNumber || "",
          className: child?.class || "",
          feeHistory: {
            regularFees: selectedMonthsData,
            additionalFees: additionalFeesData,
            status: childFormData.feeStatus || "Pending",
            paymentMode: childFormData.paymentMode || "Cash",

            transactionId: childFormData.transactionId,
            previousDues: parseFloat(childFormData.previousDues) || 0,
            remark: childFormData.remarks || "",
            totalFeeAmount: totalFeeAmount,
            concessionFee: parseFloat(childFormData.concessionFee || ""),
            paidAfterConcession: TotalFeeAfterDiscount + parseFloat(childFormData.previousDues) || 0,
            newPaidAmount: parseFloat(childFormData.paidAmount || ""),
          },
        };

        if (childFormData.paymentMode === "Cheque") {
          newFeeData.chequeBookNo = childFormData.chequeBookNo || "";
        } else if (childFormData.paymentMode === "Online") {
          newFeeData.transactionId = childFormData.transactionId || "";
        }

        try {
          const response = await axios.post(
            "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus",
            newFeeData,
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          toast.success(
            `Fee created for ${child.fullName}: ${response.data.message}`
          );
         
          setReload((preReload) => !preReload);
          setIsOpen(false);
        } catch (error) {
          console.error("Error Posting Data: ", error);
          toast.error(
            `Error creating fee for ${child.fullName}: ${
              error.response?.data?.error || "Server error"
            }`
          );
        }
      }
    } catch (error) {
      console.error("Unhandled Error: ", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      // setIsOpen(false);
    }
  };

  const handleAdditionalFeesChange = (index, selectedOptions) => {
    const additionalFeeValues = selectedOptions.map((option) => ({
      fee: option.label,
      value: option.value, 
      selectedMonths: [], 
      monthFees: {}, 
    }));

    const totalAdditionalFee = additionalFeeValues.reduce((total, fee) => {
      const monthCount = fee.selectedMonths.length; 
      const feeAmount = parseFloat(fee.value); 
      return total + feeAmount * monthCount; 
    }, 0);

    const updatedFormData = [...formData];
    updatedFormData[index] = {
      ...updatedFormData[index],
      additionalFee: totalAdditionalFee,

      additionalFeeValues: additionalFeeValues,
    };

    setFormData(updatedFormData);
  };

  const handleAdditionalFeeMonthSelection = (
    index,
    feeIndex,
    selectedOptions
  ) => {
    const selectedMonths = selectedOptions.map((option) => option.value);

    const updatedFormData = [...formData];
    updatedFormData[index].additionalFeeValues[feeIndex].selectedMonths =
      selectedMonths;

    const feeValue = updatedFormData[index].additionalFeeValues[feeIndex].value;
    const monthCount = selectedMonths.length;
    const totalFeeForCurrent = feeValue * monthCount;
    updatedFormData[index].additionalFeeValues[feeIndex].totalFee =
      totalFeeForCurrent;

    const totalAdditionalFee = updatedFormData[
      index
    ].additionalFeeValues.reduce((total, fee) => {
      return total + (fee.totalFee || 0);
    }, 0);
    console.log("totalAdditionalFee", totalAdditionalFee);

    updatedFormData[index].additionalFee = totalAdditionalFee;
    setFormData(updatedFormData);
  };

  return (
    <div className="md:min-h-screen px-5 pl-10 md:pl-0 md:px-0">
      <div className="">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={handleSearch}
          className="p-1 border border-gray-300 rounded mb-4 mr-2"
        />
        <input
          type="text"
          placeholder="Search by Admission No"
          value={searchTermbyadmissionNo}
          onChange={handleSearchbyAdmissionNo}
          className="p-1 border border-gray-300 rounded mb-4"
        />
      </div>
      {filteredStudents.length > 0 && (
        <div className="max-h-60 overflow-y-auto border md:w-1/2 border-gray-300 rounded mb-2">
          {filteredStudents.map((student, index) => (
            <h1
              key={index}
              className="p-2 border-b cursor-pointer hover:bg-gray-100"
              onClick={() => handleStudentClick(student.parentAdmissionNumber)}
            >
              {student.fullName || "No Name"}, {student.class},{" "}
              
              {student.fatherName}, {student.admissionNumber}
            </h1>
          ))}
        </div>
      )}
      {isOpen && (
        <div
          id="default-modal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed top-0 right-0 left-0 z-[9] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
        >
          <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  School Fees
                </h3>
                <button
                  onClick={toggleModal}
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-toggle="default-modal"
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
                      d="M1 1l12 12M13 1L1 13"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              {/* <div className="flex-grow max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh] overflow-auto"> */}
              <div className=" max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh] overflow-auto">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-wrap md:flex-row flex-col w-full gap-4"
                >
                  {parentData.map((child, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-md p-2 w-full md:w-[48%] lg:w-[32%]"
                    >
                      <div className=" w-full flex items-center flex-row gap-2 bg-gray-100 mb-2 p-2">
                        <div>
                          <input
                            type="checkbox"
                            checked={selectedChildren.includes(index)}
                            onChange={() => handleChildSelection(index)}
                            className="mr-2 "
                          />
                        </div>
                        <div>
                          <span className=" text-[16px] font-semibold text-gray-800">
                            Student : {child.fullName} ,
                          </span>
                          <span className="text-[16px] text-gray-600">
                            {" "}
                            Class : {child.class} ,
                          </span>
                          <span className="text-[16px] text-red-600">
                            {" "}
                            Total Dues : {child.dues}
                          </span>
                        </div>
                      </div>
                      {showForm[index] && (
                        <>
                          <div className="mb-2 bg-gray-100 flex items-center p-2 rounded">
                            <div className="w-full ">
                              <div className="flex flex-row bg-gray-100 rounded">
                                <input
                                  type="checkbox"
                                  checked={
                                    formData[index]?.includeClassFee || false
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      "includeClassFee",
                                      e.target.checked
                                    )
                                  }
                                  className="mr-2"
                                />
                                <label
                                  htmlFor=""
                                  className="block text-sm font-medium text-red-700"
                                >
                                  Class Fee
                                </label>
                              </div>
                              {formData[index]?.includeClassFee && (
                                <>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mt-2">
                                      Months
                                    </label>
                                    <Select
                                      options={[
                                        "January",
                                        "February",
                                        "March",
                                        "April",
                                        "May",
                                        "June",
                                        "July",
                                        "August",
                                        "September",
                                        "October",
                                        "November",
                                        "December",
                                      ].map((month) => ({
                                        value: month,
                                        label: month,
                                      }))}
                                      value={formData[
                                        index
                                      ]?.selectedMonths?.map((month) => ({
                                       
                                        value: month,
                                        label: month,
                                      }))}
                                      onChange={(selectedOptions) =>
                                        handleMonthSelection(
                                          selectedOptions,
                                          index
                                        )
                                      }
                                      isMulti
                                      name="months"
                                      className="basic-multi-select mt-2"
                                      classNamePrefix="select"
                                    />
                                  </div>
                                  <div className="mt-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Total Class Fee: ₹
                                      {formData[index]?.totalClassFee || 0}
                                    </label>
                                  </div>
                                  <div className="w-full flex flex-wrap gap-2 p-2">
                                    {formData[index]?.selectedMonths?.map(
                                      (month, monthIndex) => (
                                        <div
                                          key={monthIndex}
                                          className="bg-gray-200 p-2 rounded"
                                        >
                                          <label className="block text-[10px] font-medium text-gray-700">
                                            {month}' Fee : ₹
                                          </label>
                                          <input
                                         
                                            type="number"
                                            className="w-20 border rounded-sm p-1 text-[10px]"
                                            value={
                                              formData[index]?.monthFees?.[
                                                month
                                              ]
                                            }
                                            onChange={(e) =>
                                              handleMonthFeeChange(
                                                index,
                                                month,
                                                e.target.value
                                              )
                                            }
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="mb-2 p-2 bg-gray-100 rounded">
                            <div className="flex flex-row ">
                              <input
                                type="checkbox"
                                checked={
                                  formData[index]?.includeAdditionalFees ||
                                  false
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    "includeAdditionalFees",
                                    e.target.checked
                                  )
                                }
                                className="mr-2"
                              />
                              <label className="block text-sm font-medium text-red-700">
                                Additional Fees
                              </label>
                            </div>
                            {formData[index]?.includeAdditionalFees && (
                              <>
                                <label className="block text-[12px] font-medium text-gray-700 mt-2">
                                  Additional Fees Total Amount: ₹
                                  {formData[index]?.additionalFee || 0}
                                </label>
                                <Select
                                  isMulti
                                  options={allFees}
                                  onChange={(selectedOptions) =>
                                    handleAdditionalFeesChange(
                                      index,
                                      selectedOptions
                                    )
                                  }
                                  className="basic-single mt-2"
                                  classNamePrefix="select"
                                />
                                {formData[index]?.additionalFeeValues?.map(
                                  (feeData, feeIndex) => (
                                    <div
                                      key={feeIndex}
                                      className="bg-gray-100 mt-1 w-full flex flex-wrap gap-2 p-2 rounded"
                                    >
                                      <div className="w-full">
                                        <p className="block text-[10px] font-medium text-gray-700">
                                          {feeData.fee}
                                        </p>
                                      </div>
                                      <div className="w-full">
                                        <label className="block text-[10px] font-medium text-gray-700">
                                          Months
                                        </label>
                                        <Select
                                          options={[
                                            "January",
                                            "February",
                                            "March",
                                            "April",
                                            "May",
                                            "June",
                                            "July",
                                            "August",
                                            "September",
                                            "October",
                                            "November",
                                            "December",
                                          ].map((month) => ({
                                            value: month,
                                            label: month,
                                          }))}
                                          value={feeData.selectedMonths.map(
                                            (month) => ({
                                              value: month,
                                              label: month,
                                            })
                                          )}
                                          onChange={(selectedOptions) =>
                                            handleAdditionalFeeMonthSelection(
                                              index,
                                              feeIndex,
                                              selectedOptions
                                            )
                                          }
                                          isMulti
                                          name="months"
                                          className="text-[10px] mt-1"
                                          classNamePrefix="select"
                                        />
                                        {feeData.selectedMonths?.map(
                                          (month) => (
                                            <div
                                              key={month}
                                              className="bg-gray-200 p-2 rounded"
                                            >
                                              <label className="block text-[10px] font-medium text-gray-700">
                                                {`${feeData.fee}, ${month},${feeData.value}`}
                                             {   console.log("feeData",feeData)}
                                              </label>
                                              <input
                                                type="number"
                                                className="w-20 border rounded-sm p-1 text-[10px]"
                                                value={feeData.monthFees[month]}
                                                onChange={(e) =>
                                                  handleAdditionalFeeChange(
                                                    index,
                                                    feeIndex,
                                                    month,
                                                    e.target.value
                                                  )
                                                }
                                              />
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}
                              </>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
                            
                            <div className="p-2 ">
                              <label className="block text-[14px] font-medium text-gray-600">
                                Fee Date
                              </label>
                              <input
                                type="date"
                                value={
                                  formData[index]?.feeDate || getCurrentDate()
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    "feeDate",
                                    e.target.value
                                  )
                                }
                                className="w-full border p-1 rounded"
                              />
                            </div>
                            <div className="p-2 ">
                              <div className="">
                                <label className="block text-[14px] font-medium text-gray-600">
                                  Payment Mode
                                </label>
                                <select
                                  value={formData[index]?.paymentMode || "Cash"}
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      "paymentMode",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border p-1 rounded"
                                >
                                  {" "}
                                  <option value="Cash">Cash</option>
                                  <option value="Online">Online</option>
                                  <option value="Cheque">Cheque</option>
                                </select>
                              </div>

                              {formData[index]?.paymentMode === "Online" && (
                                <div className="mb-4">
                                  <label className="block text-[14px] font-medium text-gray-600">
                                    Transaction ID
                                  </label>
                                  <input
                                    type="text"
                                    value={formData[index]?.transactionId || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        index,
                                        "transactionId",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border p-1 rounded"
                                  />
                                </div>
                              )}

                              {formData[index]?.paymentMode === "Cheque" && (
                                <div className="mb-2">
                                  <label className="block text-[14px] font-medium text-gray-600">
                                    Cheque Book No
                                  </label>
                                  <input
                                    type="text"
                                    value={formData[index]?.transactionId || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        index,
                                        "transactionId",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border p-1 rounded"
                                  />
                                </div>
                              )}
                            
                            </div>

                          <div className="p-2">
                            <label className="block text-[14px] font-medium text-gray-600">
                            Concession Amount
                            </label>
                            <input
                              type="number"
                              placeholder="amount"
                              value={formData[index]?.concessionFee}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "concessionFee",
                                  e.target.value
                                )
                              }
                              className="w-full border p-1 rounded"
                            />
                          </div>

                            </div>
                            <label className="block text-[16px] font-medium text-blue-900">
                               Total Amount : {`${
                               ( (formData[index]?.additionalFee || 0) +
                                (formData[index]?.totalClassFee || 0))} + ${formData[index]?.previousDues || 0} -
                                ${(formData[index]?.concessionFee || 0) } `
                              } = ₹ {
                                ((formData[index]?.additionalFee || 0) +
                                  (formData[index]?.totalClassFee || 0) + parseFloat(formData[index]?.previousDues || 0)) 
                                  -
                                  (formData[index]?.concessionFee || 0) 
                              }
                            </label>

                             <div className="p-2">
                            <label className="block text-[14px] font-medium text-gray-600">
                              Paid Amount
                            </label>
                            <input
                            required
                              type="number"
                              placeholder="amount"
                              value={formData[index]?.paidAmount}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "paidAmount",
                                  e.target.value
                                )
                              }
                              className="w-full border p-1 rounded"
                            />
                          </div>
                          <div className="p-2">
                            <label className="block text-[14px] font-medium text-gray-600">
                              Remarks
                            </label>
                            <textarea
                              type="text"
                              value={formData[index]?.remarks || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "remarks",
                                  e.target.value
                                )
                              }
                              className="w-full border p-1 rounded"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div className="w-full gap-5 grid grid-cols-1 md:grid-cols-2 p-4">
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className="bg-blue-500 w-full text-white px-4 py-2 rounded self-end"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={toggleModal}
                      className="bg-gray-500 w-full text-white px-4 py-2 rounded self-end"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* <div className="">
        <Table reLoad={reLoad} />
      </div> */}
        <Box
          sx={{
            bgcolor: "background.paper",
            position: "relative",
            minHeight: 200,
          }}
        >
          <AppBar position="static" color="default">
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              aria-label="action tabs example"
            >
              <Tab label="Fee History" {...a11yProps(0)} />
              <Tab label="Management" {...a11yProps(1)} />
              {/* <Tab label="Theme Three" {...a11yProps(2)} /> */}
            </Tabs>
          </AppBar>
          <SwipeableViews
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={value}
            onChangeIndex={handleChangeIndex}
          >
            <TabPanel value={value} index={0} dir={theme.direction}>
            <Table reLoad={reLoad} />
            
            </TabPanel>
            <TabPanel value={value} index={1} dir={theme.direction}>
            <DuesTable/>

            </TabPanel>
            {/* <TabPanel value={value} index={2} dir={theme.direction}>
              Comming soon.....
            </TabPanel> */}
          </SwipeableViews>
         
        </Box>
    </div>
  );
};

export default NewCheckFee2;
