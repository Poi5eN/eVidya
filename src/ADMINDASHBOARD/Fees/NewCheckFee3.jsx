







import axios from "axios";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { useStateContext } from "../../contexts/ContextProvider";
import AOS from "aos";
import "./index.css";
import "aos/dist/aos.css";
import "./Card.css";
import Select from "react-select";

const NewCheckFee3 = () => {
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [allStudent, setAllStudent] = useState([]);
  const [dues, setDues] = useState(0);
  const [feeValues, setFeeValues] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allFees, setAllFees] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [parentData, setParentData] = useState([]);
  const [isRegularFeeChecked, setIsRegularFeeChecked] = useState(false);
  const [isAdditionalFeeChecked, setIsAdditionalFeeChecked] = useState(false);
  const [feeAmount, setFeeAmount] = useState();
  const [getFee, setGetFee] = useState({});
  const [AdditionalFees, setAdditionalFees] = useState([]);
  const [selectedAdditionalFees, setSelectedAdditionalFees] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const [formData, setFormData] = useState({
    admissionNumer: "",
    classFee: getFee,
    feeAmount: feeAmount,
    FeeMonth: "",
    feeDate: getCurrentDate(),
    feeStatus: "Paid",
    paymentMode: "Online",
    transactionId: "",
    chequeBookNo: "",
    preDues: "",
  });
  const authToken = Cookies.get("token");

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const getCurrentMonth = () => {
    const today = new Date();
    const month = today.toLocaleString("default", { month: "long" });
    return month;
  };


  useEffect(() => {
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
        console.log("getAdditionalFees", response);
        const feesData = response.data.map((fee) => {
          const label =
            fee.name && fee.amount
              ? `${fee.name} (${fee.amount})`
              : "Unknown Fee";
          const value = fee.amount ? fee.amount.toString() : "0";

          return {
            label,
            value,
          };
        });

        setAdditionalFees(feesData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);


  useEffect(() => {
    axios
      .get("https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        const feesData = response.data.map((fee) => {
          const label =
            fee.name && fee.amount
              ? `${fee.name} (${fee.amount})`
              : "Unknown Fee";
          const value = fee.amount ? fee.amount.toString() : "0";

          return {
            label,
            value,
          };
        });

        setAllFees(feesData);
      });
  }, [authToken]);
  const handleChildSelection = (childIndex) => {
    setSelectedChildren((prevSelected) =>
      prevSelected.includes(childIndex)
        ? prevSelected.filter((index) => index !== childIndex)
        : [...prevSelected, childIndex]
    );

    if (Array.isArray(formData)) {
      const updatedFormData = [...formData];
      updatedFormData[childIndex] = {
        ...updatedFormData[childIndex],
        totalAmount: 0,
        additionalFeeValues: [],
      };
      setFormData(updatedFormData);
    } else {
      console.error("formData is not an array.");
    }
  };

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


  useEffect(() => {
    const totalFee = feeValues.reduce((total, value) => total + value, 0);
    const totalAmount = formData.length > 0 ? formData[0]?.totalAmount || 0 : 0;
    setDues(totalFee - totalAmount);
  }, [feeValues, formData]);
  //   new code

  const [previousDues, setPreviousDues] = useState(0);
  const [selectedMonths, setSelectedMonths] = useState([getCurrentMonth()]);
  const handleDateChange = (e) => {
    setFormData({ ...formData, feeDate: e.target.value });
  };
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name === "regularFee") {
      setIsRegularFeeChecked(checked);
    } else if (name === "additionalFee") {
      setIsAdditionalFeeChecked(checked);
    }
  };
  const totalAmount = () => {
    return getTotalPaidAmount() + previousDues;
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
          selectedMonths: [getCurrentMonth()],
          feeDate: getCurrentDate(),
          feeStatus: "Paid",
          paymentMode: "Online",
          selectedAdditionalFees: [],
          additionalFeeValues: [],
          totalAmount: 0,
        }));

        setFormData(initialFormData);
        setIsOpen(true);
      });
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
  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToPost = {};

    if (isRegularFeeChecked) {
      dataToPost.classFee = formData.classFee;
      dataToPost.amountSubmitted = formData.amountSubmitted;
    }

    if (isAdditionalFeeChecked) {
      dataToPost.additionalFees = selectedAdditionalFees.map((fee) => ({
        feeId: fee.value,
        paidAmount: additionalFeeValues[fee.value] || 0,
      }));
    }

    // Add other necessary form data
    dataToPost.feeStatus = formData.feeStatus;
    dataToPost.paymentMode = formData.paymentMode;
    dataToPost.feeDate = formData.feeDate;

    const dues = getTotalDuesAmount;
    const feeStatus = dues === 0 ? "Paid" : "Unpaid";

    const additionalFeesArray = selectedAdditionalFees.map((fee) => ({
      feeName: fee.label.split(" ")[0], // Extract the fee name from the label
      paidAmount: additionalFeeValues[fee.value] || 0, // Get the amount from the additionalFeeValues
    }));
    const newExamData = {
      admissionNumber: selectedStudent.admissionNumber,
      className: selectedStudent.class,
      status: feeStatus,
      date: formData.feeDate,
      reMark: formData.reMark,
      preDues: formData.preDues,
      paymentMode: formData.paymentMode,
      totalAmount: totalAmount(),

      dues: getTotalDuesAmount(),
      months: selectedMonths, // Posting the months array separately
    };

    // Conditionally add `regularFee` if it contains data
    if (formData.classFee) {
      newExamData.regularFee = {
        paidAmount: formData.classFee,
      };
    }
    if (formData.transactionId) {
      newExamData.transactionId = formData.transactionId;
    }
    if (formData.chequeBookNo) {
      newExamData.chequeBookNo = formData.chequeBookNo;
    }

    // Conditionally add `additionalFee` if there are selected additional fees
    if (selectedAdditionalFees.length > 0) {
      newExamData.additionalFee = selectedAdditionalFees.map((fee) => ({
        feeName: fee.label,
        paidAmount: additionalFeeValues[fee.value] || 0, // Get the amount from additionalFeeValues state
      }));
    }

    const apiUrl =
      "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus";
    axios
      .post(apiUrl, newExamData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        toast.success(response.data.message);
        // getFeeHistory();
      })
      .catch((error) => {
        console.error("Error Posting Data: ", error);
        toast.error(error.response.data.message);
      });

    setModalIsOpen(false);
  };

  const handleMonthsChange = (selectedOptions) => {
    setSelectedMonths(selectedOptions.map((option) => option.value));
  };

  const [additionalFeeValues, setAdditionalFeeValues] = useState({});

  const handleAdditionalFeesChange = (selectedOptions) => {
    setSelectedAdditionalFees(selectedOptions);

    // Update the additionalFeeValues state with default values
    const newAdditionalFeeValues = {};
    selectedOptions.forEach((fee) => {
      newAdditionalFeeValues[fee.value] =
        parseFloat(fee.label.match(/\((\d+)\)/)?.[1]) || 0;
    });

    setAdditionalFeeValues(newAdditionalFeeValues);
  };

  const handleAdditionalFeeValueChange = (feeKey, value) => {
    setAdditionalFeeValues((prevValues) => ({
      ...prevValues,
      [feeKey]: value, // Here feeKey is the unique key for each additional fee and value is the amount entered
    }));
  };
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedStudent(null);
  };
  useEffect(() => {
    AOS.init({
      easing: "linear",
    });
  }, []);

  const getTotalFeesAmount = () => {
    const regularFeesAmount = isRegularFeeChecked
      ? getFee * selectedMonths.length
      : 0;

    const additionalFeesAmount = isAdditionalFeeChecked
      ? selectedAdditionalFees.reduce(
          (total, fee) => total + (parseFloat(fee.value) || 0),
          0
        )
      : 0;

    const totalAmount = regularFeesAmount + additionalFeesAmount + previousDues;

    return totalAmount;
  };

  // Calculate total amount paid
  const getTotalPaidAmount = () => {
    const regularFeePaid = isRegularFeeChecked
      ? parseFloat(formData.classFee)
      : 0;
    const additionalFeesPaid = selectedAdditionalFees.reduce(
      (total, fee) => total + (additionalFeeValues[fee.value] || 0),
      0
    );
    return regularFeePaid + additionalFeesPaid;
  };

  const getTotalDuesAmount = () => {
    const totalFees = getTotalFeesAmount();
    const totalPaid = getTotalPaidAmount();
    return totalFees - totalPaid - previousDues;
  };

  const feeDisplay =
    typeof getFee === "object" ? JSON.stringify(getFee) : getFee;
  return (
    <div>
      <input
        type="text"
        placeholder="Search by name"
        value={searchTerm}
        onChange={handleSearch}
        className="p-2 border border-gray-300 rounded mb-4"
      />
      {filteredStudents.length > 0 && (
        <div className="max-h-60 overflow-y-auto border border-gray-300 rounded">
          {filteredStudents.map((student, index) => (
            <div
              key={index}
              className="p-2 border-b cursor-pointer hover:bg-gray-100"
              onClick={() => handleStudentClick(student.parentAdmissionNumber)}
            >
              {student.fullName || "No Name"}, {student.class},{" "}
              {student.fatherName}, {student.admissionNumber}
            </div>
          ))}
        </div>
      )}
      {isOpen && (
        <div
          id="default-modal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
        >
          <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
            <div className="relative bg-gray-600 rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Fees Form
                </h3>
                <button
                  onClick={toggleModal}
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    aria-hidden="true"
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="flex-col justify-start p-5">
                  {parentData.map((child, index) => (
                    <div
                      key={index}
                      className={`p-4 mb-4 border ${
                        selectedChildren.includes(index)
                          ? "border-blue-500"
                          : "border-gray-300"
                      } rounded-lg`}
                    >
                      <h4 className="text-lg font-semibold mb-2">
                        {child.fullName} ({child.class})
                      </h4>

                      <label className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          checked={selectedChildren.includes(index)}
                          onChange={() => handleChildSelection(index)}
                          className="form-checkbox"
                        />
                        <span className="ml-2">Select Child</span>
                      </label>

                      {selectedChildren.includes(index) && (
                        <>
                          

                          <div className="w-full grid grid-cols-2 md:grid-cols-2 gap-5">
                            <div className="flex items-center mb-4">
                              <input
                                type="checkbox"
                                name="regularFee"
                                checked={isRegularFeeChecked}
                                onChange={handleCheckboxChange}
                              />
                              <label className="ml-2 text-white">
                                Regular Fee
                              </label>
                            </div>

                            {/* Regular Fee Inputs */}
                            {isRegularFeeChecked && (
                              <>
                                <h2 className="text-white">
                                  Class Fee: {feeDisplay} ,{" "}
                                </h2>
                                <div className="flex justify-between">
                                  <div className="md:mb-4">
                                    <label className="block text-white">
                                      Regular Fee
                                    </label>
                                    <input
                                      type="number"
                                      className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
                                      value={formData.classFee}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          classFee: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Additional Fee Checkbox */}
                            <div className="flex items-center mb-4">
                              <input
                                type="checkbox"
                                name="additionalFee"
                                checked={isAdditionalFeeChecked}
                                onChange={handleCheckboxChange}
                              />
                              <label className="ml-2 text-white">
                                Additional Fee
                              </label>
                            </div>

                            {/* Additional Fee Inputs */}
                            {isAdditionalFeeChecked && (
                              <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                                <div>
                                  <label className="block text-white">
                                    Additional Fees
                                  </label>
                                  <Select
                                    id="additional-fees"
                                    options={AdditionalFees}
                                    value={selectedAdditionalFees}
                                    onChange={handleAdditionalFeesChange}
                                    isMulti
                                    placeholder="Select additional fees"
                                  />
                                </div>

                                {selectedAdditionalFees.map((fee) => (
                                  <div key={fee.value} className="md:mb-4">
                                    <label className="block text-white">
                                      {fee.label}
                                    </label>
                                    <input
                                      type="number"
                                      className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
                                      value={
                                        additionalFeeValues[fee.value] || ""
                                      }
                                      onChange={(e) =>
                                        handleAdditionalFeeValueChange(
                                          fee.value,
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Other form inputs */}
                            <div className="">
                              <label className="block text-white dark:text-white">
                                Months
                              </label>
                              <Select
                                className="dark:bg-secondary-dark-bg"
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
                                value={selectedMonths.map((month) => ({
                                  value: month,
                                  label: month,
                                }))}
                                onChange={handleMonthsChange}
                                isMulti
                                placeholder="Select months"
                              />
                            </div>

                            <div className="">
                              <label className="block text-white">
                                Fee Status
                              </label>
                              <select
                                className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
                                value={formData.feeStatus || "Unpaid"}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    feeStatus: e.target.value,
                                  })
                                }
                              >
                                <option className="dark:bg-secondary-dark-bg dark:text-white">
                                  Select Status
                                </option>
                                <option
                                  value="Paid"
                                  className="dark:bg-secondary-dark-bg dark:text-white"
                                >
                                  Paid
                                </option>
                                <option
                                  value="Unpaid"
                                  className="dark:bg-secondary-dark-bg dark:text-white"
                                >
                                  Unpaid
                                </option>
                              </select>
                            </div>

                            <div className="">
                              <label className="block text-white">
                                Payment Mode
                              </label>
                              <select
                                className="w-full border rounded-lg p-2"
                                value={formData.paymentMode || "Cash"}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    paymentMode: e.target.value,
                                  })
                                }
                              >
                                <option value="Cash">Cash</option>
                                <option value="Online">Online</option>
                                <option value="Cheque">Cheque</option>
                              </select>
                            </div>

                            {/* Transaction ID Field */}
                            {formData.paymentMode === "Online" && (
                              <div className="md:mb-4 m-0">
                                <label className="block text-white">
                                  Transaction ID
                                </label>
                                <input
                                  type="text"
                                  className="w-full border rounded-lg p-2"
                                  value={formData.transactionId || ""}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      transactionId: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            )}

                            {/* Cheque Book No Field */}
                            {formData.paymentMode === "Cheque" && (
                              <div className="md:mb-4 m-0">
                                <label className="block text-white">
                                  Cheque Book No
                                </label>
                                <input
                                  type="text"
                                  className="w-full border rounded-lg p-2"
                                  value={formData.chequeBookNo || ""}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      chequeBookNo: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            )}

                            <div className="md:mb-4 m-0">
                              <label className="block text-white">
                                Fee Date
                              </label>
                              <input
                                type="date"
                                className="w-full border rounded-lg p-2"
                                value={formData.feeDate}
                                onChange={handleDateChange}
                              />
                            </div>

                            <div className="md:mb-4 m-0">
                              <label className="block text-white">
                                Total Amount
                              </label>
                              <input
                                type="text"
                                className="w-full border rounded-lg p-2"
                                value={totalAmount()}
                                readOnly
                              />
                            </div>
                            <div className="md:mb-4 m-0">
                              <label className="block text-white">Remark</label>
                              <input
                                type="text"
                                className="w-full border rounded-lg p-2"
                                value={formData.reMark}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    reMark: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="md:mb-4 m-0">
                              <label className="block text-white">
                                Pre Dues Paid
                              </label>
                              <input
                                type="text"
                                className="w-full border rounded-lg p-2"
                                value={formData.preDues}
                                onChange={(e) =>
                                  setFormData(
                                    {
                                      ...formData,
                                      preDues: e.target.value,
                                    },
                                    setPreviousDues(
                                      parseFloat(e.target.value) || 0
                                    )
                                  )
                                }
                              />
                            </div>

                            <p className="text-white font-bold">
                              Total Fees Amount: {getTotalFeesAmount()}
                            </p>

                            <p className="text-white font-bold">
                              Total Dues: {getTotalDuesAmount()}
                            </p>

                            <div className="text-right space-x-3">
                              <button
                                type="submit"
                                className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2 mb-2"
                              >
                                Submit
                              </button>
                              <button
                                onClick={closeModal}
                                className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2 mb-2 border-gray-500"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end p-4 border-t dark:border-gray-600 w-full">
                  <button
                    type="submit"
                    className="px-4 py-2  bg-blue-600 text-white rounded w-full"
                  >
                    Submit Fees
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewCheckFee3;








// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { useStateContext } from "../../contexts/ContextProvider";
// import AOS from "aos";
// import "./index.css";
// import "aos/dist/aos.css";
// import "./Card.css";
// import Select from "react-select";

// const NewCheckFee3 = () => {
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [dues, setDues] = useState(0);
//   const [feeValues, setFeeValues] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [allFees, setAllFees] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [parentData, setParentData] = useState([]);
//   const [isRegularFeeChecked, setIsRegularFeeChecked] = useState(false);
//   const [isAdditionalFeeChecked, setIsAdditionalFeeChecked] = useState(false);
//   const [feeAmount, setFeeAmount] = useState();
//   const [getFee, setGetFee] = useState({});
//   const [AdditionalFees, setAdditionalFees] = useState([]);
//   const [selectedAdditionalFees, setSelectedAdditionalFees] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [modalIsOpen, setModalIsOpen] = useState(false);

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };
//   const [formData, setFormData] = useState({
//     admissionNumer: "",
//     classFee: getFee,
//     feeAmount: feeAmount,
//     FeeMonth: "",
//     feeDate: getCurrentDate(),
//     feeStatus: "Paid",
//     paymentMode: "Online",
//     transactionId: "",
//     chequeBookNo: "",
//     preDues: "",
//   });
//   const authToken = Cookies.get("token");

//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };

//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };


//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         console.log("getAdditionalFees", response);
//         const feesData = response.data.map((fee) => {
//           const label =
//             fee.name && fee.amount
//               ? `${fee.name} (${fee.amount})`
//               : "Unknown Fee";
//           const value = fee.amount ? fee.amount.toString() : "0";

//           return {
//             label,
//             value,
//           };
//         });

//         setAdditionalFees(feesData);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   }, []);


//   useEffect(() => {
//     axios
//       .get("https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees", {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         const feesData = response.data.map((fee) => {
//           const label =
//             fee.name && fee.amount
//               ? `${fee.name} (${fee.amount})`
//               : "Unknown Fee";
//           const value = fee.amount ? fee.amount.toString() : "0";

//           return {
//             label,
//             value,
//           };
//         });

//         setAllFees(feesData);
//       });
//   }, [authToken]);
//   const handleChildSelection = (childIndex) => {
//     setSelectedChildren((prevSelected) =>
//       prevSelected.includes(childIndex)
//         ? prevSelected.filter((index) => index !== childIndex)
//         : [...prevSelected, childIndex]
//     );

//     if (Array.isArray(formData)) {
//       const updatedFormData = [...formData];
//       updatedFormData[childIndex] = {
//         ...updatedFormData[childIndex],
//         totalAmount: 0,
//         additionalFeeValues: [],
//       };
//       setFormData(updatedFormData);
//     } else {
//       console.error("formData is not an array.");
//     }
//   };

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.fullName &&
//           student.fullName.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };


//   useEffect(() => {
//     const totalFee = feeValues.reduce((total, value) => total + value, 0);
//     const totalAmount = formData.length > 0 ? formData[0]?.totalAmount || 0 : 0;
//     setDues(totalFee - totalAmount);
//   }, [feeValues, formData]);
//   //   new code

//   const [previousDues, setPreviousDues] = useState(0);
//   const [selectedMonths, setSelectedMonths] = useState([getCurrentMonth()]);
//   const handleDateChange = (e) => {
//     setFormData({ ...formData, feeDate: e.target.value });
//   };
//   const handleCheckboxChange = (e) => {
//     const { name, checked } = e.target;
//     if (name === "regularFee") {
//       setIsRegularFeeChecked(checked);
//     } else if (name === "additionalFee") {
//       setIsAdditionalFeeChecked(checked);
//     }
//   };
//   const totalAmount = () => {
//     return getTotalPaidAmount() + previousDues;
//   };
//   const handleStudentClick = (admissionNumber) => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getParentWithChildren/${admissionNumber}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const children = response.data.children;
//         setParentData(children);
//         const initialFormData = children.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           selectedMonths: [getCurrentMonth()],
//           feeDate: getCurrentDate(),
//           feeStatus: "Paid",
//           paymentMode: "Online",
//           selectedAdditionalFees: [],
//           additionalFeeValues: [],
//           totalAmount: 0,
//         }));

//         setFormData(initialFormData);
//         setIsOpen(true);
//       });
//   };


//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setAllStudent(response.data.allStudent);
//       });
//   }, [authToken]);
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const dataToPost = {};

//     if (isRegularFeeChecked) {
//       dataToPost.classFee = formData.classFee;
//       dataToPost.amountSubmitted = formData.amountSubmitted;
//     }

//     if (isAdditionalFeeChecked) {
//       dataToPost.additionalFees = selectedAdditionalFees.map((fee) => ({
//         feeId: fee.value,
//         paidAmount: additionalFeeValues[fee.value] || 0,
//       }));
//     }

//     // Add other necessary form data
//     dataToPost.feeStatus = formData.feeStatus;
//     dataToPost.paymentMode = formData.paymentMode;
//     dataToPost.feeDate = formData.feeDate;

//     const dues = getTotalDuesAmount;
//     const feeStatus = dues === 0 ? "Paid" : "Unpaid";

//     const additionalFeesArray = selectedAdditionalFees.map((fee) => ({
//       feeName: fee.label.split(" ")[0], // Extract the fee name from the label
//       paidAmount: additionalFeeValues[fee.value] || 0, // Get the amount from the additionalFeeValues
//     }));
//     const newExamData = {
//       admissionNumber: selectedStudent.admissionNumber,
//       className: selectedStudent.class,
//       status: feeStatus,
//       date: formData.feeDate,
//       reMark: formData.reMark,
//       preDues: formData.preDues,
//       paymentMode: formData.paymentMode,
//       totalAmount: totalAmount(),

//       dues: getTotalDuesAmount(),
//       months: selectedMonths, // Posting the months array separately
//     };

//     // Conditionally add `regularFee` if it contains data
//     if (formData.classFee) {
//       newExamData.regularFee = {
//         paidAmount: formData.classFee,
//       };
//     }
//     if (formData.transactionId) {
//       newExamData.transactionId = formData.transactionId;
//     }
//     if (formData.chequeBookNo) {
//       newExamData.chequeBookNo = formData.chequeBookNo;
//     }

//     // Conditionally add `additionalFee` if there are selected additional fees
//     if (selectedAdditionalFees.length > 0) {
//       newExamData.additionalFee = selectedAdditionalFees.map((fee) => ({
//         feeName: fee.label,
//         paidAmount: additionalFeeValues[fee.value] || 0, // Get the amount from additionalFeeValues state
//       }));
//     }

//     const apiUrl =
//       "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus";
//     axios
//       .post(apiUrl, newExamData, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         toast.success(response.data.message);
//         getFeeHistory();
//       })
//       .catch((error) => {
//         console.error("Error Posting Data: ", error);
//         toast.error(error.response.data.message);
//       });

//     setModalIsOpen(false);
//   };

//   const handleMonthsChange = (selectedOptions) => {
//     setSelectedMonths(selectedOptions.map((option) => option.value));
//   };

//   const [additionalFeeValues, setAdditionalFeeValues] = useState({});

//   const handleAdditionalFeesChange = (selectedOptions) => {
//     setSelectedAdditionalFees(selectedOptions);

//     // Update the additionalFeeValues state with default values
//     const newAdditionalFeeValues = {};
//     selectedOptions.forEach((fee) => {
//       newAdditionalFeeValues[fee.value] =
//         parseFloat(fee.label.match(/\((\d+)\)/)?.[1]) || 0;
//     });

//     setAdditionalFeeValues(newAdditionalFeeValues);
//   };

//   const handleAdditionalFeeValueChange = (feeKey, value) => {
//     setAdditionalFeeValues((prevValues) => ({
//       ...prevValues,
//       [feeKey]: value, // Here feeKey is the unique key for each additional fee and value is the amount entered
//     }));
//   };
//   const closeModal = () => {
//     setModalIsOpen(false);
//     setSelectedStudent(null);
//   };
//   useEffect(() => {
//     AOS.init({
//       easing: "linear",
//     });
//   }, []);

//   const getTotalFeesAmount = () => {
//     const regularFeesAmount = isRegularFeeChecked
//       ? getFee * selectedMonths.length
//       : 0;

//     const additionalFeesAmount = isAdditionalFeeChecked
//       ? selectedAdditionalFees.reduce(
//           (total, fee) => total + (parseFloat(fee.value) || 0),
//           0
//         )
//       : 0;

//     const totalAmount = regularFeesAmount + additionalFeesAmount + previousDues;

//     return totalAmount;
//   };

//   // Calculate total amount paid
//   const getTotalPaidAmount = () => {
//     const regularFeePaid = isRegularFeeChecked
//       ? parseFloat(formData.classFee)
//       : 0;
//     const additionalFeesPaid = selectedAdditionalFees.reduce(
//       (total, fee) => total + (additionalFeeValues[fee.value] || 0),
//       0
//     );
//     return regularFeePaid + additionalFeesPaid;
//   };

//   const getTotalDuesAmount = () => {
//     const totalFees = getTotalFeesAmount();
//     const totalPaid = getTotalPaidAmount();
//     return totalFees - totalPaid - previousDues;
//   };

//   const feeDisplay =
//     typeof getFee === "object" ? JSON.stringify(getFee) : getFee;
//   return (
//     <div>
//       <input
//         type="text"
//         placeholder="Search by name"
//         value={searchTerm}
//         onChange={handleSearch}
//         className="p-2 border border-gray-300 rounded mb-4"
//       />
//       {filteredStudents.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border border-gray-300 rounded">
//           {filteredStudents.map((student, index) => (
//             <div
//               key={index}
//               className="p-2 border-b cursor-pointer hover:bg-gray-100"
//               onClick={() => handleStudentClick(student.parentAdmissionNumber)}
//             >
//               {student.fullName || "No Name"}, {student.class},{" "}
//               {student.fatherName}, {student.admissionNumber}
//             </div>
//           ))}
//         </div>
//       )}
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
//             <div className="relative bg-gray-600 rounded-lg shadow dark:bg-gray-700">
//               <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                   Fees Form
//                 </h3>
//                 <button
//                   onClick={toggleModal}
//                   type="button"
//                   className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                 >
//                   <svg
//                     aria-hidden="true"
//                     className="w-3 h-3"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M6 18L18 6M6 6l12 12"
//                     ></path>
//                   </svg>
//                   <span className="sr-only">Close modal</span>
//                 </button>
//               </div>
//               <form onSubmit={handleSubmit}>
//                 <div className="flex-col justify-start p-5">
//                   {parentData.map((child, index) => (
//                     <div
//                       key={index}
//                       className={`p-4 mb-4 border ${
//                         selectedChildren.includes(index)
//                           ? "border-blue-500"
//                           : "border-gray-300"
//                       } rounded-lg`}
//                     >
//                       <h4 className="text-lg font-semibold mb-2">
//                         {child.fullName} ({child.class})
//                       </h4>

//                       <label className="flex items-center mb-4">
//                         <input
//                           type="checkbox"
//                           checked={selectedChildren.includes(index)}
//                           onChange={() => handleChildSelection(index)}
//                           className="form-checkbox"
//                         />
//                         <span className="ml-2">Select Child</span>
//                       </label>

//                       {selectedChildren.includes(index) && (
//                         <>
                          

//                           <div className="w-full grid grid-cols-2 md:grid-cols-2 gap-5">
//                             <div className="flex items-center mb-4">
//                               <input
//                                 type="checkbox"
//                                 name="regularFee"
//                                 checked={isRegularFeeChecked}
//                                 onChange={handleCheckboxChange}
//                               />
//                               <label className="ml-2 text-white">
//                                 Regular Fee
//                               </label>
//                             </div>

//                             {/* Regular Fee Inputs */}
//                             {isRegularFeeChecked && (
//                               <>
//                                 <h2 className="text-white">
//                                   Class Fee: {feeDisplay} ,{" "}
//                                 </h2>
//                                 <div className="flex justify-between">
//                                   <div className="md:mb-4">
//                                     <label className="block text-white">
//                                       Regular Fee
//                                     </label>
//                                     <input
//                                       type="number"
//                                       className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                                       value={formData.classFee}
//                                       onChange={(e) =>
//                                         setFormData({
//                                           ...formData,
//                                           classFee: e.target.value,
//                                         })
//                                       }
//                                     />
//                                   </div>
//                                 </div>
//                               </>
//                             )}

//                             {/* Additional Fee Checkbox */}
//                             <div className="flex items-center mb-4">
//                               <input
//                                 type="checkbox"
//                                 name="additionalFee"
//                                 checked={isAdditionalFeeChecked}
//                                 onChange={handleCheckboxChange}
//                               />
//                               <label className="ml-2 text-white">
//                                 Additional Fee
//                               </label>
//                             </div>

//                             {/* Additional Fee Inputs */}
//                             {isAdditionalFeeChecked && (
//                               <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
//                                 <div>
//                                   <label className="block text-white">
//                                     Additional Fees
//                                   </label>
//                                   <Select
//                                     id="additional-fees"
//                                     options={AdditionalFees}
//                                     value={selectedAdditionalFees}
//                                     onChange={handleAdditionalFeesChange}
//                                     isMulti
//                                     placeholder="Select additional fees"
//                                   />
//                                 </div>

//                                 {selectedAdditionalFees.map((fee) => (
//                                   <div key={fee.value} className="md:mb-4">
//                                     <label className="block text-white">
//                                       {fee.label}
//                                     </label>
//                                     <input
//                                       type="number"
//                                       className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                                       value={
//                                         additionalFeeValues[fee.value] || ""
//                                       }
//                                       onChange={(e) =>
//                                         handleAdditionalFeeValueChange(
//                                           fee.value,
//                                           parseFloat(e.target.value) || 0
//                                         )
//                                       }
//                                     />
//                                   </div>
//                                 ))}
//                               </div>
//                             )}

//                             {/* Other form inputs */}
//                             <div className="">
//                               <label className="block text-white dark:text-white">
//                                 Months
//                               </label>
//                               <Select
//                                 className="dark:bg-secondary-dark-bg"
//                                 options={[
//                                   "January",
//                                   "February",
//                                   "March",
//                                   "April",
//                                   "May",
//                                   "June",
//                                   "July",
//                                   "August",
//                                   "September",
//                                   "October",
//                                   "November",
//                                   "December",
//                                 ].map((month) => ({
//                                   value: month,
//                                   label: month,
//                                 }))}
//                                 value={selectedMonths.map((month) => ({
//                                   value: month,
//                                   label: month,
//                                 }))}
//                                 onChange={handleMonthsChange}
//                                 isMulti
//                                 placeholder="Select months"
//                               />
//                             </div>

//                             <div className="">
//                               <label className="block text-white">
//                                 Fee Status
//                               </label>
//                               <select
//                                 className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                                 value={formData.feeStatus || "Unpaid"}
//                                 onChange={(e) =>
//                                   setFormData({
//                                     ...formData,
//                                     feeStatus: e.target.value,
//                                   })
//                                 }
//                               >
//                                 <option className="dark:bg-secondary-dark-bg dark:text-white">
//                                   Select Status
//                                 </option>
//                                 <option
//                                   value="Paid"
//                                   className="dark:bg-secondary-dark-bg dark:text-white"
//                                 >
//                                   Paid
//                                 </option>
//                                 <option
//                                   value="Unpaid"
//                                   className="dark:bg-secondary-dark-bg dark:text-white"
//                                 >
//                                   Unpaid
//                                 </option>
//                               </select>
//                             </div>

//                             <div className="">
//                               <label className="block text-white">
//                                 Payment Mode
//                               </label>
//                               <select
//                                 className="w-full border rounded-lg p-2"
//                                 value={formData.paymentMode || "Cash"}
//                                 onChange={(e) =>
//                                   setFormData({
//                                     ...formData,
//                                     paymentMode: e.target.value,
//                                   })
//                                 }
//                               >
//                                 <option value="Cash">Cash</option>
//                                 <option value="Online">Online</option>
//                                 <option value="Cheque">Cheque</option>
//                               </select>
//                             </div>

//                             {/* Transaction ID Field */}
//                             {formData.paymentMode === "Online" && (
//                               <div className="md:mb-4 m-0">
//                                 <label className="block text-white">
//                                   Transaction ID
//                                 </label>
//                                 <input
//                                   type="text"
//                                   className="w-full border rounded-lg p-2"
//                                   value={formData.transactionId || ""}
//                                   onChange={(e) =>
//                                     setFormData({
//                                       ...formData,
//                                       transactionId: e.target.value,
//                                     })
//                                   }
//                                 />
//                               </div>
//                             )}

//                             {/* Cheque Book No Field */}
//                             {formData.paymentMode === "Cheque" && (
//                               <div className="md:mb-4 m-0">
//                                 <label className="block text-white">
//                                   Cheque Book No
//                                 </label>
//                                 <input
//                                   type="text"
//                                   className="w-full border rounded-lg p-2"
//                                   value={formData.chequeBookNo || ""}
//                                   onChange={(e) =>
//                                     setFormData({
//                                       ...formData,
//                                       chequeBookNo: e.target.value,
//                                     })
//                                   }
//                                 />
//                               </div>
//                             )}

//                             <div className="md:mb-4 m-0">
//                               <label className="block text-white">
//                                 Fee Date
//                               </label>
//                               <input
//                                 type="date"
//                                 className="w-full border rounded-lg p-2"
//                                 value={formData.feeDate}
//                                 onChange={handleDateChange}
//                               />
//                             </div>

//                             <div className="md:mb-4 m-0">
//                               <label className="block text-white">
//                                 Total Amount
//                               </label>
//                               <input
//                                 type="text"
//                                 className="w-full border rounded-lg p-2"
//                                 value={totalAmount()}
//                                 readOnly
//                               />
//                             </div>
//                             <div className="md:mb-4 m-0">
//                               <label className="block text-white">Remark</label>
//                               <input
//                                 type="text"
//                                 className="w-full border rounded-lg p-2"
//                                 value={formData.reMark}
//                                 onChange={(e) =>
//                                   setFormData({
//                                     ...formData,
//                                     reMark: e.target.value,
//                                   })
//                                 }
//                               />
//                             </div>
//                             <div className="md:mb-4 m-0">
//                               <label className="block text-white">
//                                 Pre Dues Paid
//                               </label>
//                               <input
//                                 type="text"
//                                 className="w-full border rounded-lg p-2"
//                                 value={formData.preDues}
//                                 onChange={(e) =>
//                                   setFormData(
//                                     {
//                                       ...formData,
//                                       preDues: e.target.value,
//                                     },
//                                     setPreviousDues(
//                                       parseFloat(e.target.value) || 0
//                                     )
//                                   )
//                                 }
//                               />
//                             </div>

//                             <p className="text-white font-bold">
//                               Total Fees Amount: {getTotalFeesAmount()}
//                             </p>

//                             <p className="text-white font-bold">
//                               Total Dues: {getTotalDuesAmount()}
//                             </p>

//                             <div className="text-right space-x-3">
//                               <button
//                                 type="submit"
//                                 className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2 mb-2"
//                               >
//                                 Submit
//                               </button>
//                               <button
//                                 onClick={closeModal}
//                                 className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2 mb-2 border-gray-500"
//                               >
//                                 Close
//                               </button>
//                             </div>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//                 <div className="flex justify-end p-4 border-t dark:border-gray-600 w-full">
//                   <button
//                     type="submit"
//                     className="px-4 py-2  bg-blue-600 text-white rounded w-full"
//                   >
//                     Submit Fees
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NewCheckFee3;
