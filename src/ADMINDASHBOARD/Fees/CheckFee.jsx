// add field bank ,chequebook,dues,preDues,totalAmount

import axios from "axios";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { useStateContext } from "../../contexts/ContextProvider";
import Modal from "react-modal";
import AOS from "aos";
import "./index.css";
import "aos/dist/aos.css";
import "./Card.css";
import Select from "react-select";
import { Button, Grid, Stack, TextField } from "@mui/material";
import ErrorPage from "../../NoDataFound";
import Table from "./Table";
Modal.setAppElement("#root");
function CheckFee() {
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [feeHistory, setFeeHistory] = useState([]);
  const [previousDues, setPreviousDues] = useState(0);

  const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
  const getFeeHistory = async () => {
    try {
      const response = await axios.get(
        "https://eserver-i5sm.onrender.com/api/v1/fees/feeHistory",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setFeeHistory(response.data.data);

      setFilteredFeeHistory(response.data.data);
    } catch (error) {
      console.error("Error fetching fee history:", error);
    }
  };

  useEffect(() => {
    getFeeHistory();
  }, []);

  const groupAndSortByDate = () => {
    const groupedData = {};
    filteredFeeHistory.forEach((fee) => {
      const dateKey = new Date(fee.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = [];
      }
      groupedData[dateKey].push(fee);
    });

    const groupedDataArray = Object.entries(groupedData);
    groupedDataArray.sort((a, b) => new Date(b[0]) - new Date(a[0]));
    return groupedDataArray;
  };
  const groupedFeeHistory = groupAndSortByDate();
  const [isRegularFeeChecked, setIsRegularFeeChecked] = useState(false);
  const [isAdditionalFeeChecked, setIsAdditionalFeeChecked] = useState(false);
  const [feeAmount, setFeeAmount] = useState();
  const { currentColor } = useStateContext();
  const authToken = Cookies.get("token");
  const [getFee, setGetFee] = useState({});
  const [AdditionalFees, setAdditionalFees] = useState([]);
  const [selectedAdditionalFees, setSelectedAdditionalFees] = useState([]);
  const [allData, setAllData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [totalDues, setTotalDues] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };
  const getCurrentMonth = () => {
    const today = new Date();
    const month = today.toLocaleString("default", { month: "long" });
    return month;
  };

  const [selectedMonths, setSelectedMonths] = useState([getCurrentMonth()]);
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
  const handlePaymentModeChange = (e) => {
    const selectedMode = e.target.value;
    setFormData({
      ...formData,
      paymentMode: selectedMode,
      transactionId: selectedMode === "Cash" ? "" : formData.transactionId, // Clear transaction ID if Cash is selected
    });
  };
  const handleTransactionIdChange = (e) => {
    setFormData({
      ...formData,
      transactionId: e.target.value,
    });
  };
  const getData = async () => {
    try {
      const response = await axios.get(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getDataByAdmissionNumber/${search}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setAllData(response.data.studentData);

      setTotalDues(response.data.feeStatusData.dues);
      toast.success("Student get successfully");
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

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

    // const totalAmount = getTotalFeesAmount();
    // setFeeAmount(totalAmount);
    // const dues = totalAmount - formData.amountSubmitted;
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
        getFeeHistory();
      })
      .catch((error) => {
        console.error("Error Posting Data: ", error);
        toast.error(error.response.data.message);
      });

    setModalIsOpen(false);
  };

  const handleAmountSubmittedChange = (e) => {
    setFormData({ ...formData, amountSubmitted: e.target.value });
  };
  const addtionalFee = async () => {
    try {
      await axios
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
          // console.log("getAdditionalFees", response);
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
    } catch (error) {
      console.error("Error ", error);
    }
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      getData();
      setIsOpen(true);
    }, 500);
    // setIsOpen(true)
  };
  const handleClick = async (student) => {
    setSelectedStudent(student);
    setModalIsOpen(true);
    addtionalFee();
    setIsOpen(!isOpen);

    if (!student) {
      console.error("Selected student is null or undefined");
      return;
    }

    try {
      const response = await axios.get(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = response.data;
      const feeTypeArray = data;
      const studentClass = student.class;
      if (Array.isArray(feeTypeArray)) {
        const studentFeeAmount = feeTypeArray
          .filter((feeType) => feeType.className === studentClass)
          .map((classData) => classData.amount);
        setGetFee(studentFeeAmount);
      } else {
        console.error("Invalid or undefined feeTypeArray");
      }
    } catch (error) {
      console.error("Error fetching Fee data: ", error);
      toast.error("Failed to fetch fee data");
    }
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

  // Calculate total dues amount
  const getTotalDuesAmount = () => {
    const totalFees = getTotalFeesAmount();
    const totalPaid = getTotalPaidAmount();
    return totalFees - totalPaid - previousDues;
  };

  return (
    <div className="md:h-screen p-5 ">
      <Stack direction="row" spacing={2} className="mb-10">
        <TextField
          id="standard-basic"
          fullWidth
          size="small"
          type="text"
          onChange={(e) => setSearch(e.target.value)}
          label="Enter Admission No..."
          variant="standard"
        />

        <Button
          onClick={handleSearchSubmit}
          variant="contained"
          style={{ backgroundColor: currentColor, color: "white" }}
          fullWidth
        >
          Filter
        </Button>
      </Stack>

      {isOpen && (
        <div
          id="default-modal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
        >
          <div className="relative p-4 bg-white" data-aos="fade-down">
            <div className="relative  rounded-lg shadow dark:bg-gray-700 overflow-auto ">
              <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 ">
                <h3 className="text-xl font-semibold  dark:text-white">
                  Student details
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
                  {allData.admissionNumber ? (
                    <div
                      onClick={() => handleClick(allData)}
                      className="md:mt-10"
                    >
                      <div className="overflow-hidden">
                        <div>
                          <div className="id-card-tag"></div>
                          <div className="id-card-tag-strip"></div>
                          <div className="id-card-hook"></div>
                          <div className="id-card-holder">
                            <div
                              className="id-card cursor-pointer"
                              onClick={() => handleClick(allData)}
                            >
                              <div className="header">
                                {allData.image ? (
                                  <img
                                    className=""
                                    src={allData.image?.url}
                                    alt=""
                                  />
                                ) : (
                                  <img src="" alt="" />
                                )}
                              </div>
                              <div className="qr-code"></div>
                              <h3>Name : {allData.fullName}</h3>
                              <h3>Admission No. : {allData.admissionNumber}</h3>
                              <h3>
                                Class : {allData.class}-{allData.section}
                              </h3>
                              <h3>Roll No :{allData.rollNo}</h3>
                              <h3>F Name :{allData.fatherName}</h3>

                              <hr />
                              <p>
                                <strong>Address : </strong> {allData.address}
                              </p>
                              <p>Ph:{allData.contact}</p>
                              <h1 className="text-red-700 font-bold">
                                {" "}
                                Total Dues : {totalDues}
                              </h1>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="">
        {filteredFeeHistory.length === 0 ? (
          <ErrorPage />
        ) : (
          // <DataTable data={filteredFeeHistory} />
          <Table data={filteredFeeHistory} />
        )}
      </div>

      <div>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Student Details"
          className="md:w-[60%] w-full mx-auto h-auto  flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 dark:text-white   "
        >
          {selectedStudent && (
            <>
              <div
                style={{ background: currentColor }}
                className={`md:p-5 px-2  bg-[${currentColor}]`}
                data-aos="fade-down"
                data-aos-easing="linear"
                data-aos-duration="500"
              >
                <form onSubmit={handleSubmit}>
                  <div className="text-center">
                    <h1 className="text-2xl font-semibold mb-4 text-white">
                      Create Fee
                    </h1>
                  </div>
                  <div className="w-full grid grid-cols-2 md:grid-cols-2 gap-5">
                    {/* Regular Fee Checkbox */}
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        name="regularFee"
                        checked={isRegularFeeChecked}
                        onChange={handleCheckboxChange}
                      />
                      <label className="ml-2 text-white">Regular Fee</label>
                    </div>

                    {/* Regular Fee Inputs */}
                    {isRegularFeeChecked && (
                      <>
                        <h2 className="text-white">Class Fee: {getFee} , </h2>
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
                      <label className="ml-2 text-white">Additional Fee</label>
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
                              value={additionalFeeValues[fee.value] || ""}
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
                      <label className="block text-white">Fee Status</label>
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
                      <label className="block text-white">Payment Mode</label>
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
                      <label className="block text-white">Fee Date</label>
                      <input
                        type="date"
                        className="w-full border rounded-lg p-2"
                        value={formData.feeDate}
                        onChange={handleDateChange}
                      />
                    </div>

                    <div className="md:mb-4 m-0">
                      <label className="block text-white">Total Amount</label>
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
                      <label className="block text-white">Pre Dues Paid</label>
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
                            setPreviousDues(parseFloat(e.target.value) || 0)
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
                </form>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default CheckFee;







// // add field bank ,chequebook,dues,preDues,totalAmount

// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Modal from "react-modal";
// import AOS from "aos";
// import "./index.css";
// import "aos/dist/aos.css";
// import "./Card.css";
// import Select from "react-select";
// import { Button, Grid, Stack, TextField } from "@mui/material";
// import ErrorPage from "../../ErrorPage";
// import Table from "./Table";
// Modal.setAppElement("#root");
// function CheckFee() {
//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const [feeHistory, setFeeHistory] = useState([]);
//   const [previousDues, setPreviousDues] = useState(0);

//   const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
//   const getFeeHistory = async () => {
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/fees/feeHistory",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );
//       setFeeHistory(response.data.data);

//       setFilteredFeeHistory(response.data.data);
//     } catch (error) {
//       console.error("Error fetching fee history:", error);
//     }
//   };

//   useEffect(() => {
//     getFeeHistory();
//   }, []);

//   const groupAndSortByDate = () => {
//     const groupedData = {};
//     filteredFeeHistory.forEach((fee) => {
//       const dateKey = new Date(fee.date).toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "long",
//         year: "numeric",
//       });
//       if (!groupedData[dateKey]) {
//         groupedData[dateKey] = [];
//       }
//       groupedData[dateKey].push(fee);
//     });

//     const groupedDataArray = Object.entries(groupedData);
//     groupedDataArray.sort((a, b) => new Date(b[0]) - new Date(a[0]));
//     return groupedDataArray;
//   };
//   const groupedFeeHistory = groupAndSortByDate();
//   const [isRegularFeeChecked, setIsRegularFeeChecked] = useState(false);
//   const [isAdditionalFeeChecked, setIsAdditionalFeeChecked] = useState(false);
//   const [feeAmount, setFeeAmount] = useState();
//   const { currentColor } = useStateContext();
//   const authToken = Cookies.get("token");
//   const [getFee, setGetFee] = useState({});
//   const [AdditionalFees, setAdditionalFees] = useState([]);
//   const [selectedAdditionalFees, setSelectedAdditionalFees] = useState([]);
//   const [allData, setAllData] = useState([]);
//   const [search, setSearch] = useState("");
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [modalIsOpen, setModalIsOpen] = useState(false);
//   const [totalDues, setTotalDues] = useState(0);
//   const [isOpen, setIsOpen] = useState(false);
//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };
//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };

//   const [selectedMonths, setSelectedMonths] = useState([getCurrentMonth()]);
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
//   const handlePaymentModeChange = (e) => {
//     const selectedMode = e.target.value;
//     setFormData({
//       ...formData,
//       paymentMode: selectedMode,
//       transactionId: selectedMode === "Cash" ? "" : formData.transactionId, // Clear transaction ID if Cash is selected
//     });
//   };
//   const handleTransactionIdChange = (e) => {
//     setFormData({
//       ...formData,
//       transactionId: e.target.value,
//     });
//   };
//   const getData = async () => {
//     try {
//       const response = await axios.get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getDataByAdmissionNumber/${search}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       setAllData(response.data.studentData);

//       setTotalDues(response.data.feeStatusData.dues);
//       toast.success("Student get successfully");
//     } catch (error) {
//       console.error("Error fetching data", error);
//     }
//   };

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

//     // const totalAmount = getTotalFeesAmount();
//     // setFeeAmount(totalAmount);
//     // const dues = totalAmount - formData.amountSubmitted;
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

//   const handleAmountSubmittedChange = (e) => {
//     setFormData({ ...formData, amountSubmitted: e.target.value });
//   };
//   const addtionalFee = async () => {
//     try {
//       await axios
//         .get(
//           "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           console.log("getAdditionalFees", response);
//           const feesData = response.data.map((fee) => {
//             const label =
//               fee.name && fee.amount
//                 ? `${fee.name} (${fee.amount})`
//                 : "Unknown Fee";
//             const value = fee.amount ? fee.amount.toString() : "0";

//             return {
//               label,
//               value,
//             };
//           });

//           setAdditionalFees(feesData);
//         })
//         .catch((error) => {
//           console.error("Error fetching data:", error);
//         });
//     } catch (error) {
//       console.error("Error ", error);
//     }
//   };
//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     setTimeout(() => {
//       getData();
//       setIsOpen(true);
//     }, 500);
//     // setIsOpen(true)
//   };
//   const handleClick = async (student) => {
//     setSelectedStudent(student);
//     setModalIsOpen(true);
//     addtionalFee();
//     setIsOpen(!isOpen);

//     if (!student) {
//       console.error("Selected student is null or undefined");
//       return;
//     }

//     try {
//       const response = await axios.get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       const data = response.data;
//       const feeTypeArray = data;
//       const studentClass = student.class;
//       if (Array.isArray(feeTypeArray)) {
//         const studentFeeAmount = feeTypeArray
//           .filter((feeType) => feeType.className === studentClass)
//           .map((classData) => classData.amount);
//         setGetFee(studentFeeAmount);
//       } else {
//         console.error("Invalid or undefined feeTypeArray");
//       }
//     } catch (error) {
//       console.error("Error fetching Fee data: ", error);
//       toast.error("Failed to fetch fee data");
//     }
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

//   // Calculate total dues amount
//   const getTotalDuesAmount = () => {
//     const totalFees = getTotalFeesAmount();
//     const totalPaid = getTotalPaidAmount();
//     return totalFees - totalPaid - previousDues;
//   };

//   return (
//     <div className="md:h-screen p-5 ">
//       <Stack direction="row" spacing={2} className="mb-10">
//         <TextField
//           id="standard-basic"
//           fullWidth
//           size="small"
//           type="text"
//           onChange={(e) => setSearch(e.target.value)}
//           label="Enter Admission No..."
//           variant="standard"
//         />

//         <Button
//           onClick={handleSearchSubmit}
//           variant="contained"
//           style={{ backgroundColor: currentColor, color: "white" }}
//           fullWidth
//         >
//           Filter
//         </Button>
//       </Stack>

//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 bg-white" data-aos="fade-down">
//             <div className="relative  rounded-lg shadow dark:bg-gray-700 overflow-auto ">
//               <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 ">
//                 <h3 className="text-xl font-semibold  dark:text-white">
//                   Student details
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
//               <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh]  overflow-auto  bg-gray-50">
//                 <div className="p-4 md:p-5 space-y-4  ">
//                   {allData.admissionNumber ? (
//                     <div
//                       onClick={() => handleClick(allData)}
//                       className="md:mt-10"
//                     >
//                       <div className="overflow-hidden">
//                         <div>
//                           <div className="id-card-tag"></div>
//                           <div className="id-card-tag-strip"></div>
//                           <div className="id-card-hook"></div>
//                           <div className="id-card-holder">
//                             <div
//                               className="id-card cursor-pointer"
//                               onClick={() => handleClick(allData)}
//                             >
//                               <div className="header">
//                                 {allData.image ? (
//                                   <img
//                                     className=""
//                                     src={allData.image?.url}
//                                     alt=""
//                                   />
//                                 ) : (
//                                   <img src="" alt="" />
//                                 )}
//                               </div>
//                               <div className="qr-code"></div>
//                               <h3>Name : {allData.fullName}</h3>
//                               <h3>Admission No. : {allData.admissionNumber}</h3>
//                               <h3>
//                                 Class : {allData.class}-{allData.section}
//                               </h3>
//                               <h3>Roll No :{allData.rollNo}</h3>
//                               <h3>F Name :{allData.fatherName}</h3>

//                               <hr />
//                               <p>
//                                 <strong>Address : </strong> {allData.address}
//                               </p>
//                               <p>Ph:{allData.contact}</p>
//                               <h1 className="text-red-700 font-bold">
//                                 {" "}
//                                 Total Dues : {totalDues}
//                               </h1>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ) : null}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="">
//         {filteredFeeHistory.length === 0 ? (
//           <ErrorPage />
//         ) : (
//           // <DataTable data={filteredFeeHistory} />
//           <Table data={filteredFeeHistory} />
//         )}
//       </div>

//       <div>
//         <Modal
//           isOpen={modalIsOpen}
//           onRequestClose={closeModal}
//           contentLabel="Student Details"
//           className="md:w-[60%] w-full mx-auto h-auto  flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 dark:text-white   "
//         >
//           {selectedStudent && (
//             <>
//               <div
//                 style={{ background: currentColor }}
//                 className={`md:p-5 px-2  bg-[${currentColor}]`}
//                 data-aos="fade-down"
//                 data-aos-easing="linear"
//                 data-aos-duration="500"
//               >
//                 <form onSubmit={handleSubmit}>
//                   <div className="text-center">
//                     <h1 className="text-2xl font-semibold mb-4 text-white">
//                       Create Fee
//                     </h1>
//                   </div>
//                   <div className="w-full grid grid-cols-2 md:grid-cols-2 gap-5">
//                     {/* Regular Fee Checkbox */}
//                     <div className="flex items-center mb-4">
//                       <input
//                         type="checkbox"
//                         name="regularFee"
//                         checked={isRegularFeeChecked}
//                         onChange={handleCheckboxChange}
//                       />
//                       <label className="ml-2 text-white">Regular Fee</label>
//                     </div>

//                     {/* Regular Fee Inputs */}
//                     {isRegularFeeChecked && (
//                       <>
//                         <h2 className="text-white">Class Fee: {getFee} , </h2>
//                         <div className="flex justify-between">
//                           <div className="md:mb-4">
//                             <label className="block text-white">
//                               Regular Fee
//                             </label>
//                             <input
//                               type="number"
//                               className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                               value={formData.classFee}
//                               onChange={(e) =>
//                                 setFormData({
//                                   ...formData,
//                                   classFee: e.target.value,
//                                 })
//                               }
//                             />
//                           </div>
//                         </div>
//                       </>
//                     )}

//                     {/* Additional Fee Checkbox */}
//                     <div className="flex items-center mb-4">
//                       <input
//                         type="checkbox"
//                         name="additionalFee"
//                         checked={isAdditionalFeeChecked}
//                         onChange={handleCheckboxChange}
//                       />
//                       <label className="ml-2 text-white">Additional Fee</label>
//                     </div>

//                     {/* Additional Fee Inputs */}
//                     {isAdditionalFeeChecked && (
//                       <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
//                         <div>
//                           <label className="block text-white">
//                             Additional Fees
//                           </label>
//                           <Select
//                             id="additional-fees"
//                             options={AdditionalFees}
//                             value={selectedAdditionalFees}
//                             onChange={handleAdditionalFeesChange}
//                             isMulti
//                             placeholder="Select additional fees"
//                           />
//                         </div>

//                         {selectedAdditionalFees.map((fee) => (
//                           <div key={fee.value} className="md:mb-4">
//                             <label className="block text-white">
//                               {fee.label}
//                             </label>
//                             <input
//                               type="number"
//                               className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                               value={additionalFeeValues[fee.value] || ""}
//                               onChange={(e) =>
//                                 handleAdditionalFeeValueChange(
//                                   fee.value,
//                                   parseFloat(e.target.value) || 0
//                                 )
//                               }
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     {/* Other form inputs */}
//                     <div className="">
//                       <label className="block text-white dark:text-white">
//                         Months
//                       </label>
//                       <Select
//                         className="dark:bg-secondary-dark-bg"
//                         options={[
//                           "January",
//                           "February",
//                           "March",
//                           "April",
//                           "May",
//                           "June",
//                           "July",
//                           "August",
//                           "September",
//                           "October",
//                           "November",
//                           "December",
//                         ].map((month) => ({
//                           value: month,
//                           label: month,
//                         }))}
//                         value={selectedMonths.map((month) => ({
//                           value: month,
//                           label: month,
//                         }))}
//                         onChange={handleMonthsChange}
//                         isMulti
//                         placeholder="Select months"
//                       />
//                     </div>

//                     <div className="">
//                       <label className="block text-white">Fee Status</label>
//                       <select
//                         className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                         value={formData.feeStatus || "Unpaid"}
//                         onChange={(e) =>
//                           setFormData({
//                             ...formData,
//                             feeStatus: e.target.value,
//                           })
//                         }
//                       >
//                         <option className="dark:bg-secondary-dark-bg dark:text-white">
//                           Select Status
//                         </option>
//                         <option
//                           value="Paid"
//                           className="dark:bg-secondary-dark-bg dark:text-white"
//                         >
//                           Paid
//                         </option>
//                         <option
//                           value="Unpaid"
//                           className="dark:bg-secondary-dark-bg dark:text-white"
//                         >
//                           Unpaid
//                         </option>
//                       </select>
//                     </div>

//                     <div className="">
//                       <label className="block text-white">Payment Mode</label>
//                       <select
//                         className="w-full border rounded-lg p-2"
//                         value={formData.paymentMode || "Cash"}
//                         onChange={(e) =>
//                           setFormData({
//                             ...formData,
//                             paymentMode: e.target.value,
//                           })
//                         }
//                       >
//                         <option value="Cash">Cash</option>
//                         <option value="Online">Online</option>
//                         <option value="Cheque">Cheque</option>
//                       </select>
//                     </div>

//                     {/* Transaction ID Field */}
//                     {formData.paymentMode === "Online" && (
//                       <div className="md:mb-4 m-0">
//                         <label className="block text-white">
//                           Transaction ID
//                         </label>
//                         <input
//                           type="text"
//                           className="w-full border rounded-lg p-2"
//                           value={formData.transactionId || ""}
//                           onChange={(e) =>
//                             setFormData({
//                               ...formData,
//                               transactionId: e.target.value,
//                             })
//                           }
//                         />
//                       </div>
//                     )}

//                     {/* Cheque Book No Field */}
//                     {formData.paymentMode === "Cheque" && (
//                       <div className="md:mb-4 m-0">
//                         <label className="block text-white">
//                           Cheque Book No
//                         </label>
//                         <input
//                           type="text"
//                           className="w-full border rounded-lg p-2"
//                           value={formData.chequeBookNo || ""}
//                           onChange={(e) =>
//                             setFormData({
//                               ...formData,
//                               chequeBookNo: e.target.value,
//                             })
//                           }
//                         />
//                       </div>
//                     )}

//                     <div className="md:mb-4 m-0">
//                       <label className="block text-white">Fee Date</label>
//                       <input
//                         type="date"
//                         className="w-full border rounded-lg p-2"
//                         value={formData.feeDate}
//                         onChange={handleDateChange}
//                       />
//                     </div>

//                     <div className="md:mb-4 m-0">
//                       <label className="block text-white">Total Amount</label>
//                       <input
//                         type="text"
//                         className="w-full border rounded-lg p-2"
//                         value={totalAmount()}
//                         readOnly
//                       />
//                     </div>
//                     <div className="md:mb-4 m-0">
//                       <label className="block text-white">Remark</label>
//                       <input
//                         type="text"
//                         className="w-full border rounded-lg p-2"
//                         value={formData.reMark}
//                         onChange={(e) =>
//                           setFormData({
//                             ...formData,
//                             reMark: e.target.value,
//                           })
//                         }
//                       />
//                     </div>
//                     <div className="md:mb-4 m-0">
//                       <label className="block text-white">Pre Dues Paid</label>
//                       <input
//                         type="text"
//                         className="w-full border rounded-lg p-2"
//                         value={formData.preDues}
//                         onChange={(e) =>
//                           setFormData(
//                             {
//                               ...formData,
//                               preDues: e.target.value,
//                             },
//                             setPreviousDues(parseFloat(e.target.value) || 0)
//                           )
//                         }
//                       />
//                     </div>

//                     <p className="text-white font-bold">
//                       Total Fees Amount: {getTotalFeesAmount()}
//                     </p>

//                     <p className="text-white font-bold">
//                       Total Dues: {getTotalDuesAmount()}
//                     </p>

//                     <div className="text-right space-x-3">
//                       <button
//                         type="submit"
//                         className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2 mb-2"
//                       >
//                         Submit
//                       </button>
//                       <button
//                         onClick={closeModal}
//                         className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2 mb-2 border-gray-500"
//                       >
//                         Close
//                       </button>
//                     </div>
//                   </div>
//                 </form>
//               </div>
//             </>
//           )}
//         </Modal>
//       </div>
//     </div>
//   );
// }

// export default CheckFee;



// all completed likes : additonal fee regular fee dues

// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Modal from "react-modal";
// import AOS from "aos";
// import "./index.css";
// import "aos/dist/aos.css";
// import "./Card.css";
// import Select from "react-select";
// import { Button, Grid, Stack, TextField } from "@mui/material";
// import ErrorPage from "../../ErrorPage";
// import Table from "./Table";
// Modal.setAppElement("#root");
// function CheckFee() {
//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const [feeHistory, setFeeHistory] = useState([]);
//   const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
//   const getFeeHistory = async () => {
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/fees/feeHistory",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );
//       setFeeHistory(response.data.data);

//       setFilteredFeeHistory(response.data.data);
//     } catch (error) {
//       console.error("Error fetching fee history:", error);
//     }
//   };

//   useEffect(() => {
//     getFeeHistory();
//   }, []);

//   const groupAndSortByDate = () => {
//     const groupedData = {};
//     filteredFeeHistory.forEach((fee) => {
//       const dateKey = new Date(fee.date).toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "long",
//         year: "numeric",
//       });
//       if (!groupedData[dateKey]) {
//         groupedData[dateKey] = [];
//       }
//       groupedData[dateKey].push(fee);
//     });

//     const groupedDataArray = Object.entries(groupedData);
//     groupedDataArray.sort((a, b) => new Date(b[0]) - new Date(a[0]));
//     return groupedDataArray;
//   };
//   const groupedFeeHistory = groupAndSortByDate();
//   const [isRegularFeeChecked, setIsRegularFeeChecked] = useState(false);
//   const [isAdditionalFeeChecked, setIsAdditionalFeeChecked] = useState(false);
//   const [feeAmount, setFeeAmount] = useState();
//   const { currentColor } = useStateContext();
//   const authToken = Cookies.get("token");
//   const [getFee, setGetFee] = useState({});
//   const [AdditionalFees, setAdditionalFees] = useState([]);
//   const [selectedAdditionalFees, setSelectedAdditionalFees] = useState([]);
//   const [allData, setAllData] = useState([]);
//   const [search, setSearch] = useState("");
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [modalIsOpen, setModalIsOpen] = useState(false);
//   const [totalDues, setTotalDues] = useState(0);
//   const [isOpen, setIsOpen] = useState(false);
//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };
//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };

//   const [selectedMonths, setSelectedMonths] = useState([getCurrentMonth()]);
//   const [formData, setFormData] = useState({
//     admissionNumer: "",
//     classFee: getFee,
//     feeAmount: feeAmount,
//     FeeMonth: "",
//     feeDate: getCurrentDate(),
//     feeStatus: "Paid",
//     paymentMode: "Online",
//   });

//   const getData = async () => {
//     try {
//       const response = await axios.get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getDataByAdmissionNumber/${search}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       setAllData(response.data.studentData);

//       setTotalDues(response.data.feeStatusData.dues);
//       toast.success("Student get successfully");
//     } catch (error) {
//       console.error("Error fetching data", error);
//     }
//   };

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

//     const totalAmount = getTotalFeesAmount();
//     setFeeAmount(totalAmount);
//     const dues = totalAmount - formData.amountSubmitted;
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
//       reMark:formData.reMark,
//       paymentMode: formData.paymentMode,
//       dues: getTotalDuesAmount(),
//       months: selectedMonths, // Posting the months array separately
//     };

//     // Conditionally add `regularFee` if it contains data
//     if (formData.classFee) {
//       newExamData.regularFee = {
//         paidAmount: formData.classFee,
//       };
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

//   const handleAmountSubmittedChange = (e) => {
//     setFormData({ ...formData, amountSubmitted: e.target.value });
//   };
//   const addtionalFee = async () => {
//     try {
//       await axios
//         .get(
//           "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           console.log("getAdditionalFees", response);
//           const feesData = response.data.map((fee) => {
//             const label =
//               fee.name && fee.amount
//                 ? `${fee.name} (${fee.amount})`
//                 : "Unknown Fee";
//             const value = fee.amount ? fee.amount.toString() : "0";

//             return {
//               label,
//               value,
//             };
//           });

//           setAdditionalFees(feesData);
//         })
//         .catch((error) => {
//           console.error("Error fetching data:", error);
//         });
//     } catch (error) {
//       console.error("Error ", error);
//     }
//   };
//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     setTimeout(() => {
//       getData();
//       setIsOpen(true);
//     }, 500);
//     // setIsOpen(true)
//   };
//   const handleClick = async (student) => {
//     setSelectedStudent(student);
//     setModalIsOpen(true);
//     addtionalFee();
//     setIsOpen(!isOpen);

//     if (!student) {
//       console.error("Selected student is null or undefined");
//       return;
//     }

//     try {
//       const response = await axios.get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       const data = response.data;
//       const feeTypeArray = data;
//       const studentClass = student.class;
//       if (Array.isArray(feeTypeArray)) {
//         const studentFeeAmount = feeTypeArray
//           .filter((feeType) => feeType.className === studentClass)
//           .map((classData) => classData.amount);
//         setGetFee(studentFeeAmount);
//       } else {
//         console.error("Invalid or undefined feeTypeArray");
//       }
//     } catch (error) {
//       console.error("Error fetching Fee data: ", error);
//       toast.error("Failed to fetch fee data");
//     }
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

//  const getTotalFeesAmount = () => {
//     const regularFeesAmount = isRegularFeeChecked
//       ? getFee * selectedMonths.length
//       : 0;

//     const additionalFeesAmount = isAdditionalFeeChecked
//       ? selectedAdditionalFees.reduce(
//           (total, fee) => total + (parseFloat(fee.value) || 0),
//           0
//         )
//       : 0;

//     const totalAmount = regularFeesAmount + additionalFeesAmount;

//     return totalAmount;
//   };

// // Calculate total amount paid
// const getTotalPaidAmount = () => {
//   const regularFeePaid = isRegularFeeChecked ? parseFloat(formData.classFee) : 0;
//   const additionalFeesPaid = selectedAdditionalFees.reduce(
//     (total, fee) => total + (additionalFeeValues[fee.value] || 0),
//     0
//   );
//   return regularFeePaid + additionalFeesPaid;
// };

// // Calculate total dues amount
// const getTotalDuesAmount = () => {
//   const totalFees = getTotalFeesAmount();
//   const totalPaid = getTotalPaidAmount();
//   return totalFees - totalPaid  ;
// };

//   return (
//     <div className="md:h-screen p-5 ">
//       <Stack direction="row" spacing={2} className="mb-10">
//         <TextField
//           id="standard-basic"
//           fullWidth
//           size="small"
//           type="text"
//           onChange={(e) => setSearch(e.target.value)}
//           label="Enter Admission No..."
//           variant="standard"
//         />

//         <Button
//           onClick={handleSearchSubmit}
//           variant="contained"
//           style={{ backgroundColor: currentColor, color: "white" }}
//           fullWidth
//         >
//           Filter
//         </Button>
//       </Stack>

//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 bg-white" data-aos="fade-down">
//             <div className="relative  rounded-lg shadow dark:bg-gray-700 overflow-auto ">
//               <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 ">
//                 <h3 className="text-xl font-semibold  dark:text-white">
//                   Student details
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
//               <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh]  overflow-auto  bg-gray-50">
//                 <div className="p-4 md:p-5 space-y-4  ">
//                   {allData.admissionNumber ? (
//                     <div
//                       onClick={() => handleClick(allData)}
//                       className="md:mt-10"
//                     >
//                       <div className="overflow-hidden">
//                         <div>
//                           <div className="id-card-tag"></div>
//                           <div className="id-card-tag-strip"></div>
//                           <div className="id-card-hook"></div>
//                           <div className="id-card-holder">
//                             <div
//                               className="id-card cursor-pointer"
//                               onClick={() => handleClick(allData)}
//                             >
//                               <div className="header">
//                                 {allData.image ? (
//                                   <img
//                                     className=""
//                                     src={allData.image?.url}
//                                     alt=""
//                                   />
//                                 ) : (
//                                   <img src="" alt="" />
//                                 )}
//                               </div>
//                               <div className="qr-code"></div>
//                               <h3>Name : {allData.fullName}</h3>
//                               <h3>Admission No. : {allData.admissionNumber}</h3>
//                               <h3>
//                                 Class : {allData.class}-{allData.section}
//                               </h3>
//                               <h3>Roll No :{allData.rollNo}</h3>
//                               <h3>F Name :{allData.fatherName}</h3>

//                               <hr />
//                               <p>
//                                 <strong>Address : </strong> {allData.address}
//                               </p>
//                               <p>Ph:{allData.contact}</p>
//                               <h1 className="text-red-700 font-bold">
//                                 {" "}
//                                 Total Dues : {totalDues}
//                               </h1>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ) : null}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="">
//         {filteredFeeHistory.length === 0 ? (
//           <ErrorPage />
//         ) : (
//           // <DataTable data={filteredFeeHistory} />
//           <Table data={filteredFeeHistory} />
//         )}
//       </div>

//       <div>
//         <Modal
//           isOpen={modalIsOpen}
//           onRequestClose={closeModal}
//           contentLabel="Student Details"
//           className="md:w-[60%] w-full mx-auto h-auto  flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 dark:text-white   "
//         >
//           {selectedStudent && (
//             <>
//               <div
//                 style={{ background: currentColor }}
//                 className={`md:p-5 px-2  bg-[${currentColor}]`}
//                 data-aos="fade-down"
//                 data-aos-easing="linear"
//                 data-aos-duration="500"
//               >

//                 <form onSubmit={handleSubmit}>
//   <div className="text-center">
//     <h1 className="text-2xl font-semibold mb-4 text-white">Create Fee</h1>
//   </div>

//   {/* Regular Fee Checkbox */}
//   <div className="flex items-center mb-4">
//     <input
//       type="checkbox"
//       name="regularFee"
//       checked={isRegularFeeChecked}
//       onChange={handleCheckboxChange}
//     />
//     <label className="ml-2 text-white">Regular Fee</label>
//   </div>

//   {/* Regular Fee Inputs */}
//   {isRegularFeeChecked && (
//     <>
//       <h2 className="text-white">Class Fee: {getFee} , </h2>
//       <div className="flex justify-between">
//         <div className="md:mb-4">
//           <label className="block text-white">Regular Fee</label>
//           <input
//             type="number"
//             className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//             value={formData.classFee}
//             onChange={(e) =>
//               setFormData({
//                 ...formData,
//                 classFee: e.target.value,
//               })
//             }
//           />
//         </div>
//       </div>
//     </>
//   )}

//   {/* Additional Fee Checkbox */}
//   <div className="flex items-center mb-4">
//     <input
//       type="checkbox"
//       name="additionalFee"
//       checked={isAdditionalFeeChecked}
//       onChange={handleCheckboxChange}
//     />
//     <label className="ml-2 text-white">Additional Fee</label>
//   </div>

//   {/* Additional Fee Inputs */}
//   {isAdditionalFeeChecked && (
//     <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
//       <div>
//         <label className="block text-white">Additional Fees</label>
//         <Select
//           id="additional-fees"
//           options={AdditionalFees}
//           value={selectedAdditionalFees}
//           onChange={handleAdditionalFeesChange}
//           isMulti
//           placeholder="Select additional fees"
//         />
//       </div>

//       {selectedAdditionalFees.map((fee) => (
//         <div key={fee.value} className="md:mb-4">
//           <label className="block text-white">{fee.label}</label>
//           <input
//             type="number"
//             className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//             value={additionalFeeValues[fee.value] || ""}
//             onChange={(e) =>
//               handleAdditionalFeeValueChange(
//                 fee.value,
//                 parseFloat(e.target.value) || 0
//               )
//             }
//           />
//         </div>
//       ))}
//     </div>
//   )}

//   {/* Other form inputs */}
//   <div className="">
//     <label className="block text-white dark:text-white">Months</label>
//     <Select
//       className="dark:bg-secondary-dark-bg"
//       options={[
//         "January", "February", "March", "April", "May", "June",
//         "July", "August", "September", "October", "November", "December",
//       ].map((month) => ({
//         value: month,
//         label: month,
//       }))}
//       value={selectedMonths.map((month) => ({
//         value: month,
//         label: month,
//       }))}
//       onChange={handleMonthsChange}
//       isMulti
//       placeholder="Select months"
//     />
//   </div>

//   <div className="">
//     <label className="block text-white">Fee Status</label>
//     <select
//       className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//       value={formData.feeStatus || "Unpaid"}
//       onChange={(e) =>
//         setFormData({
//           ...formData,
//           feeStatus: e.target.value,
//         })
//       }
//     >
//       <option  className="dark:bg-secondary-dark-bg dark:text-white">Select Status</option>
//       <option value="Paid" className="dark:bg-secondary-dark-bg dark:text-white">Paid</option>
//       <option value="Unpaid" className="dark:bg-secondary-dark-bg dark:text-white">Unpaid</option>
//     </select>
//   </div>

//   <div className="">
//     <label className="block text-white">Payment Mode</label>
//     <select
//       className="w-full border rounded-lg p-2"
//       value={formData.paymentMode || "Cash"}
//       onChange={(e) =>
//         setFormData({
//           ...formData,
//           paymentMode: e.target.value,
//         })
//       }
//     >
//       <option>Select Mode</option>
//       <option value="Cash">Cash</option>
//       <option value="Online">Online</option>
//       <option value="Online">Cheque</option>
//     </select>
//   </div>

//   <div className="md:mb-4 m-0">
//     <label className="block text-white">Fee Date</label>
//     <input
//       type="date"
//       className="w-full border rounded-lg p-2"
//       value={formData.feeDate}
//       onChange={handleDateChange}
//     />
//   </div>

//   <div className="md:mb-4 m-0">
//     <label className="block text-white">Remark</label>
//     <input
//       type="text"
//       className="w-full border rounded-lg p-2"
//       value={formData.reMark}
//       onChange={(e) =>
//         setFormData({
//           ...formData,
//           reMark: e.target.value,
//         })
//       }
//     />
//   </div>

//   <p className="text-white font-bold">
//     Total Fees Amount: {getTotalFeesAmount()}
//   </p>

//   <p className="text-white font-bold">
//     Total Dues: {getTotalDuesAmount()}
//   </p>

//   <div className="text-right space-x-3">
//     <button
//       type="submit"
//       className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2 mb-2"
//     >
//       Submit
//     </button>
//     <button
//       onClick={closeModal}
//       className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2 mb-2 border-gray-500"
//     >
//       Close
//     </button>
//   </div>
// </form>

//               </div>
//             </>
//           )}
//         </Modal>
//       </div>
//     </div>
//   );
// }

// export default CheckFee;

// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Modal from "react-modal";
// import AOS from "aos";
// import "./index.css";
// import "aos/dist/aos.css";
// import "./Card.css";
// import Select from "react-select";
// import { Button, Grid, Stack, TextField } from "@mui/material";
// import ErrorPage from "../../ErrorPage";
// import Table from "./Table";
// Modal.setAppElement("#root");
// function CheckFee() {
//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const [feeHistory, setFeeHistory] = useState([]);
//   const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
//   const getFeeHistory = async () => {
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/fees/feeHistory",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );
//       setFeeHistory(response.data.data);

//       setFilteredFeeHistory(response.data.data);
//     } catch (error) {
//       console.error("Error fetching fee history:", error);
//     }
//   };

//   useEffect(() => {
//     getFeeHistory();
//   }, []);

//   const groupAndSortByDate = () => {
//     const groupedData = {};
//     filteredFeeHistory.forEach((fee) => {
//       const dateKey = new Date(fee.date).toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "long",
//         year: "numeric",
//       });
//       if (!groupedData[dateKey]) {
//         groupedData[dateKey] = [];
//       }
//       groupedData[dateKey].push(fee);
//     });

//     const groupedDataArray = Object.entries(groupedData);
//     groupedDataArray.sort((a, b) => new Date(b[0]) - new Date(a[0]));
//     return groupedDataArray;
//   };
//   const groupedFeeHistory = groupAndSortByDate();
//   const [isRegularFeeChecked, setIsRegularFeeChecked] = useState(false);
//   const [isAdditionalFeeChecked, setIsAdditionalFeeChecked] = useState(false);
//   const [feeAmount, setFeeAmount] = useState();
//   const { currentColor } = useStateContext();
//   const authToken = Cookies.get("token");
//   const [getFee, setGetFee] = useState({});
//   const [AdditionalFees, setAdditionalFees] = useState([]);
//   const [selectedAdditionalFees, setSelectedAdditionalFees] = useState([]);
//   const [allData, setAllData] = useState([]);
//   const [search, setSearch] = useState("");
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [modalIsOpen, setModalIsOpen] = useState(false);
//   const [totalDues, setTotalDues] = useState(0);
//   const [isOpen, setIsOpen] = useState(false);
//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };
//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };

//   const [selectedMonths, setSelectedMonths] = useState([getCurrentMonth()]);
//   const [formData, setFormData] = useState({
//     admissionNumer: "",
//     classFee: getFee,
//     feeAmount: feeAmount,
//     FeeMonth: "",
//     feeDate: getCurrentDate(),
//     feeStatus: "Paid",
//     paymentMode: "Online",
//   });

//   const getData = async () => {
//     try {
//       const response = await axios.get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getDataByAdmissionNumber/${search}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       setAllData(response.data.studentData);

//       setTotalDues(response.data.feeStatusData.dues);
//       toast.success("Student get successfully");
//     } catch (error) {
//       console.error("Error fetching data", error);
//     }
//   };

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

//     // if (selectedMonths.length === 0) {
//     //   alert("Please select at least one month for regular fees.");
//     //   return;
//     // }

//     const totalAmount = getTotalFeesAmount();
//     setFeeAmount(totalAmount);
//     const dues = totalAmount - formData.amountSubmitted;
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
//       paymentMode: formData.paymentMode,
//       dues: dues,
//       months: selectedMonths, // Posting the months array separately
//     };

//     // Conditionally add `regularFee` if it contains data
//     if (formData.classFee) {
//       newExamData.regularFee = {
//         paidAmount: formData.classFee,
//       };
//     }

//     // Conditionally add `additionalFee` if there are selected additional fees
//     if (selectedAdditionalFees.length > 0) {
//       newExamData.additionalFee = selectedAdditionalFees.map((fee) => ({
//         feeName: fee.label,
//         paidAmount: additionalFeeValues[fee.value] || 0, // Get the amount from additionalFeeValues state
//       }));
//     }

//     // const newExamData = {
//     //   admissionNumber: selectedStudent.admissionNumber,
//     //   className: selectedStudent.class,
//     //   status: feeStatus,
//     //   date: formData.feeDate,
//     //   month:selectedMonths,
//     //   paymentMode: formData.paymentMode,
//     //   regularFee: selectedMonths.map((month) => ({
//     //     paidAmount: formData.classFee,
//     //     // month: month,
//     //   })),
//     //   // additionalFee: additionalFeesArray, // Include the additional fees array
//     //   additionalFee: selectedAdditionalFees.map((fee) => ({
//     //     feeName: fee.label,
//     //     paidAmount: additionalFeeValues[fee.value] || 0, // Get the amount from additionalFeeValues state
//     //   })),
//     //   dues: dues,
//     // };
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

//     const totalAmount = regularFeesAmount + additionalFeesAmount;

//     return totalAmount;
//   };

//   const handleAmountSubmittedChange = (e) => {
//     setFormData({ ...formData, amountSubmitted: e.target.value });
//   };
//   const addtionalFee = async () => {
//     try {
//       await axios
//         .get(
//           "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           console.log("getAdditionalFees", response);
//           const feesData = response.data.map((fee) => {
//             const label =
//               fee.name && fee.amount
//                 ? `${fee.name} (${fee.amount})`
//                 : "Unknown Fee";
//             const value = fee.amount ? fee.amount.toString() : "0";

//             return {
//               label,
//               value,
//             };
//           });

//           setAdditionalFees(feesData);
//         })
//         .catch((error) => {
//           console.error("Error fetching data:", error);
//         });
//     } catch (error) {
//       console.error("Error ", error);
//     }
//   };
//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     setTimeout(() => {
//       getData();
//       setIsOpen(true);
//     }, 500);
//     // setIsOpen(true)
//   };
//   const handleClick = async (student) => {
//     setSelectedStudent(student);
//     setModalIsOpen(true);
//     addtionalFee();
//     setIsOpen(!isOpen);

//     if (!student) {
//       console.error("Selected student is null or undefined");
//       return;
//     }

//     try {
//       const response = await axios.get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       const data = response.data;
//       const feeTypeArray = data;
//       const studentClass = student.class;
//       if (Array.isArray(feeTypeArray)) {
//         const studentFeeAmount = feeTypeArray
//           .filter((feeType) => feeType.className === studentClass)
//           .map((classData) => classData.amount);
//         setGetFee(studentFeeAmount);
//       } else {
//         console.error("Invalid or undefined feeTypeArray");
//       }
//     } catch (error) {
//       console.error("Error fetching Fee data: ", error);
//       toast.error("Failed to fetch fee data");
//     }
//   };

//   const handleMonthsChange = (selectedOptions) => {
//     setSelectedMonths(selectedOptions.map((option) => option.value));
//   };

//   const [additionalFeeValues, setAdditionalFeeValues] = useState({});
//   // const handleAdditionalFeesChange = (selectedOptions) => {
//   //   setSelectedAdditionalFees(selectedOptions);
//   //   const updatedAdditionalFeeValues = { ...additionalFeeValues };
//   //   selectedOptions.forEach((option) => {
//   //     if (!(option.value in updatedAdditionalFeeValues)) {
//   //       updatedAdditionalFeeValues[option.value] = ""; // Default value, adjust as needed
//   //     }
//   //   });
//   //   setAdditionalFeeValues(updatedAdditionalFeeValues);
//   // };

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
//   return (
//     <div className="md:h-screen p-5 ">
//       <Stack direction="row" spacing={2} className="mb-10">
//         <TextField
//           id="standard-basic"
//           fullWidth
//           size="small"
//           type="text"
//           onChange={(e) => setSearch(e.target.value)}
//           label="Enter Admission No..."
//           variant="standard"
//         />

//         <Button
//           onClick={handleSearchSubmit}
//           variant="contained"
//           style={{ backgroundColor: currentColor, color: "white" }}
//           fullWidth // Ensures the button takes up full width
//         >
//           Filter
//         </Button>
//       </Stack>

//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 bg-white" data-aos="fade-down">
//             <div className="relative  rounded-lg shadow dark:bg-gray-700 overflow-auto ">
//               <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 ">
//                 <h3 className="text-xl font-semibold  dark:text-white">
//                   Student details
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
//               <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh]  overflow-auto  bg-gray-50">
//                 {/* <div className="h-[80vh] md:h-auto overflow-auto  bg-yellow-400"> */}
//                 <div className="p-4 md:p-5 space-y-4  ">
//                   {allData.admissionNumber ? (
//                     <div
//                       onClick={() => handleClick(allData)}
//                       className="md:mt-10"
//                     >
//                       <div className="overflow-hidden">
//                         <div>
//                           <div className="id-card-tag"></div>
//                           <div className="id-card-tag-strip"></div>
//                           <div className="id-card-hook"></div>
//                           <div className="id-card-holder">
//                             <div
//                               className="id-card cursor-pointer"
//                               onClick={() => handleClick(allData)}
//                             >
//                               <div className="header">
//                                 {allData.image ? (
//                                   <img
//                                     className=""
//                                     src={allData.image?.url}
//                                     alt=""
//                                   />
//                                 ) : (
//                                   <img src="" alt="" />
//                                 )}
//                               </div>
//                               <div className="qr-code"></div>
//                               <h3>Name : {allData.fullName}</h3>
//                               <h3>Admission No. : {allData.admissionNumber}</h3>
//                               <h3>
//                                 Class : {allData.class}-{allData.section}
//                               </h3>
//                               <h3>Roll No :{allData.rollNo}</h3>
//                               <h3>F Name :{allData.fatherName}</h3>

//                               <hr />
//                               <p>
//                                 <strong>Address : </strong> {allData.address}
//                               </p>
//                               <p>Ph:{allData.contact}</p>
//                               <h1 className="text-red-700 font-bold">
//                                 {" "}
//                                 Total Dues : {totalDues}
//                               </h1>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ) : null}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="">
//         {filteredFeeHistory.length === 0 ? (
//           <ErrorPage />
//         ) : (
//           // <DataTable data={filteredFeeHistory} />
//           <Table data={filteredFeeHistory} />
//         )}
//       </div>

//       <div>
//         <Modal
//           isOpen={modalIsOpen}
//           onRequestClose={closeModal}
//           contentLabel="Student Details"
//           className="md:w-[60%] w-full mx-auto h-auto  flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 dark:text-white   "
//         >
//           {selectedStudent && (
//             <>
//               <div
//                 style={{ background: currentColor }}
//                 className={`md:p-5 px-2  bg-[${currentColor}]`}
//                 data-aos="fade-down"
//                 data-aos-easing="linear"
//                 data-aos-duration="500"
//               >
//                 <form onSubmit={handleSubmit}>
//                   <div className="text-center">
//                     <h1 className="text-2xl font-semibold mb-4 text-white">
//                       Create Fee
//                     </h1>
//                   </div>

//                   {/* Regular Fee Checkbox */}
//                   <div className="flex items-center mb-4">
//                     <input
//                       type="checkbox"
//                       name="regularFee"
//                       checked={isRegularFeeChecked}
//                       onChange={handleCheckboxChange}
//                     />
//                     <label className="ml-2 text-white">Regular Fee</label>
//                   </div>

//                   {/* Regular Fee Inputs */}
//                   {isRegularFeeChecked && (
//                     <div className="flex justify-between">
//                       <div className="md:mb-4">
//                         <label className="block text-white">Regular Fee</label>
//                         <input
//                           type="number"
//                           className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                           value={formData.classFee}
//                           onChange={(e) =>
//                             setFormData({
//                               ...formData,
//                               classFee: e.target.value,
//                             })
//                           }
//                         />
//                       </div>
//                     </div>
//                   )}

//                   {/* Additional Fee Checkbox */}
//                   <div className="flex items-center mb-4">
//                     <input
//                       type="checkbox"
//                       name="additionalFee"
//                       checked={isAdditionalFeeChecked}
//                       onChange={handleCheckboxChange}
//                     />
//                     <label className="ml-2 text-white">Additional Fee</label>
//                   </div>

//                   {/* Additional Fee Inputs */}
//                   {isAdditionalFeeChecked && (
//                     <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
//                       <div>
//                         <label className="block text-white">
//                           Additional Fees
//                         </label>
//                         <Select
//                           id="additional-fees"
//                           options={AdditionalFees}
//                           value={selectedAdditionalFees}
//                           onChange={handleAdditionalFeesChange}
//                           isMulti
//                           placeholder="Select additional fees"
//                         />
//                       </div>

//                       {selectedAdditionalFees.map((fee) => (
//                         <div key={fee.value} className="md:mb-4">
//                           <label className="block text-white">
//                             {fee.label}
//                           </label>
//                           <input
//                             type="number"
//                             className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                             value={additionalFeeValues[fee.value] || ""} // Display the current value from state
//                             onChange={(e) =>
//                               handleAdditionalFeeValueChange(
//                                 fee.value,
//                                 parseFloat(e.target.value) || 0 // Ensure that the value is a number
//                               )
//                             }
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   {/* Other form inputs */}
//                   <div className="">
//                     <label className="block text-white dark:text-white">
//                       Months
//                     </label>
//                     <Select
//                       className="dark:bg-secondary-dark-bg "
//                       options={[
//                         "January",
//                         "February",
//                         "March",
//                         "April",
//                         "May",
//                         "June",
//                         "July",
//                         "August",
//                         "September",
//                         "October",
//                         "November",
//                         "December",
//                       ].map((month) => ({
//                         value: month,
//                         label: month,
//                       }))}
//                       value={selectedMonths.map((month) => ({
//                         value: month,
//                         label: month,
//                       }))}
//                       onChange={handleMonthsChange}
//                       isMulti
//                       placeholder="Select months"
//                     />
//                   </div>
//                   <div className="">
//                     <label className="block text-white">Fee Status</label>
//                     <select
//                       className="w-full border rounded-lg p-2  dark:bg-secondary-dark-bg  dark:text-white"
//                       value={formData.feeStatus || "Unpaid"}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           feeStatus: e.target.value,
//                         })
//                       }
//                     >
//                       <option
//                         value="Paid"
//                         className=" dark:bg-secondary-dark-bg  dark:text-white"
//                       >
//                         Paid
//                       </option>
//                       <option
//                         value="Unpaid"
//                         className=" dark:bg-secondary-dark-bg  dark:text-white"
//                       >
//                         Unpaid
//                       </option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-white">Payment Mode</label>
//                     <select
//                       className="w-full border rounded-lg p-2"
//                       value={formData.paymentMode || "Cash"}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           paymentMode: e.target.value,
//                         })
//                       }
//                     >
//                       <option value="Cash">Cash</option>
//                       <option value="Online">Online</option>
//                     </select>
//                   </div>
//                   <div className="md:mb-4 m-0">
//                     <label className="block text-white">Fee Date</label>
//                     <input
//                       type="date"
//                       className="w-full border rounded-lg p-2"
//                       value={formData.feeDate}
//                       onChange={handleDateChange}
//                     />
//                   </div>
//                   <p className="text-white font-bold">
//                     {" "}
//                     Total Fees Amount : {getTotalFeesAmount()}
//                   </p>

//                   <div className="text-right space-x-3">
//                     <button
//                       type="submit"
//                       className="dark:text-white dark:bg-secondary-dark-bg text-gray-800  neu-btn border-2 mb-2"
//                     >
//                       Submit
//                     </button>
//                     <button
//                       onClick={closeModal}
//                       className="dark:text-white dark:bg-secondary-dark-bg text-gray-800  neu-btn border-2 mb-2 border-gray-500"
//                     >
//                       Close
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </>
//           )}
//         </Modal>
//       </div>
//     </div>
//   );
// }

// export default CheckFee;

// import DataTable from "./DataTable";
// import Loading from "../../Loading";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Modal from "react-modal";
// import AOS from "aos";
// import "./index.css";
// import "aos/dist/aos.css";
// import "./Card.css";
// import Select from "react-select";

// import { Button, Grid, Stack, TextField } from "@mui/material";
// import ErrorPage from "../../ErrorPage";
// import Table from "./Table";
// Modal.setAppElement("#root");
// function CheckFee() {
//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const [feeHistory, setFeeHistory] = useState([]);
//   const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState(getCurrentDate());
//   const getFeeHistory = async () => {
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/fees/feeHistory",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );
//       setFeeHistory(response.data.data);

//       setFilteredFeeHistory(response.data.data);
//     } catch (error) {
//       console.error("Error fetching fee history:", error);
//     }
//   };

//   useEffect(() => {
//     getFeeHistory();
//   }, []);
//   const handleDateFilter = () => {
//     const filteredData = feeHistory.filter((fee) => {
//       const feeDate = new Date(fee.date);
//       return feeDate >= new Date(startDate) && feeDate <= new Date(endDate);
//     });
//     setFilteredFeeHistory(filteredData);
//   };

//   const clearDateFilter = () => {
//     setStartDate("");
//     setEndDate("");
//     setFilteredFeeHistory(feeHistory);
//   };

//   const groupAndSortByDate = () => {
//     const groupedData = {};
//     filteredFeeHistory.forEach((fee) => {
//       const dateKey = new Date(fee.date).toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "long",
//         year: "numeric",
//       });
//       if (!groupedData[dateKey]) {
//         groupedData[dateKey] = [];
//       }
//       groupedData[dateKey].push(fee);
//     });

//     const groupedDataArray = Object.entries(groupedData);
//     groupedDataArray.sort((a, b) => new Date(b[0]) - new Date(a[0]));
//     return groupedDataArray;
//   };
//   const groupedFeeHistory = groupAndSortByDate();

//   const [feeAmount, setFeeAmount] = useState();
//   const { currentColor } = useStateContext();
//   const authToken = Cookies.get("token");
//   const [getFee, setGetFee] = useState({});
//   const [AdditionalFees, setAdditionalFees] = useState([]);
//   const [selectedAdditionalFees, setSelectedAdditionalFees] = useState([]);
//   const [allData, setAllData] = useState([]);
//   const [search, setSearch] = useState("");
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [modalIsOpen, setModalIsOpen] = useState(false);
//   const [totalDues, setTotalDues] = useState(0);
//   const [isOpen, setIsOpen] = useState(false);
//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };
//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };

//   const [selectedMonths, setSelectedMonths] = useState([getCurrentMonth()]);
//   const [formData, setFormData] = useState({
//     admissionNumer: "",
//     feeAmount: feeAmount,
//     FeeMonth: "",
//     feeDate: getCurrentDate(),
//     feeStatus: "Paid",
//     paymentMode: "Online",
//   });

//   const getData = async () => {
//     try {
//       const response = await axios.get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getDataByAdmissionNumber/${search}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       setAllData(response.data.studentData);

//       setTotalDues(response.data.feeStatusData.dues);
//       toast.success("Student get successfully");
//     } catch (error) {
//       console.error("Error fetching data", error);
//     }
//   };

//   const handleDateChange = (e) => {
//     setFormData({ ...formData, feeDate: e.target.value });
//   };
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (selectedMonths.length === 0) {
//       alert("Please select at least one month for regular fees.");
//       return;
//     }

//     const totalAmount = getTotalFeesAmount();
//     setFeeAmount(totalAmount);
//     const dues = totalAmount - formData.amountSubmitted;
//     const feeStatus = dues === 0 ? "Paid" : "Unpaid";

//     const newExamData = {
//       admissionNumber: selectedStudent.admissionNumber,
//       className: selectedStudent.class,
//       feeHistory: selectedMonths.map((month) => ({
//         paidAmount: formData.amountSubmitted,
//         month: month,
//         status: feeStatus,
//         date: formData.feeDate,
//         paymentMode: formData.paymentMode,
//       })),
//       dues: dues,
//     };

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
//   const getTotalFeesAmount = () => {
//     const regularFeesAmount = getFee * selectedMonths.length;
//     const additionalFeesAmount = Array.isArray(selectedAdditionalFees)
//       ? selectedAdditionalFees.reduce(
//           (total, fee) => total + parseFloat(fee.value),
//           0
//         )
//       : 0;

//     return regularFeesAmount + additionalFeesAmount;
//   };

//   const handleAmountSubmittedChange = (e) => {
//     setFormData({ ...formData, amountSubmitted: e.target.value });
//   };
//   const addtionalFee = async () => {
//     try {
//       await axios
//         .get(
//           // "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllFees",
//           "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           const feesData = response.data.map((fee) => {
//             const label =
//               fee.name && fee.amount
//                 ? `${fee.name} (${fee.amount})`
//                 : "Unknown Fee";
//             const value = fee.amount ? fee.amount.toString() : "0";

//             return {
//               label,
//               value,
//             };
//           });

//           setAdditionalFees(feesData);
//         })
//         .catch((error) => {
//           console.error("Error fetching data:", error);
//         });
//     } catch (error) {
//       console.error("Error ", error);
//     }
//   };
//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     setTimeout(() => {
//       getData();
//       setIsOpen(true);
//     }, 500);
//     // setIsOpen(true)
//   };
//   const handleClick = async (student) => {
//     setSelectedStudent(student);
//     setModalIsOpen(true);
//     addtionalFee();
//     setIsOpen(!isOpen);

//     if (!student) {
//       console.error("Selected student is null or undefined");
//       return;
//     }

//     try {
//       const response = await axios.get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       const data = response.data;
//       const feeTypeArray = data;
//       const studentClass = student.class;
//       if (Array.isArray(feeTypeArray)) {
//         const studentFeeAmount = feeTypeArray
//           .filter((feeType) => feeType.className === studentClass)
//           .map((classData) => classData.amount);
//         setGetFee(studentFeeAmount);
//       } else {
//         console.error("Invalid or undefined feeTypeArray");
//       }
//     } catch (error) {
//       console.error("Error fetching Fee data: ", error);
//       toast.error("Failed to fetch fee data");
//     }
//   };

//   const closeModal = () => {
//     setModalIsOpen(false);
//     setSelectedStudent(null);
//   };

//   const handleMonthsChange = (selectedOptions) => {
//     setSelectedMonths(selectedOptions.map((option) => option.value));
//   };
//   // const handleAdditionalFeesChange = (selectedOptions) => {
//   //   setSelectedAdditionalFees(selectedOptions);
//   // };

//   useEffect(() => {
//     AOS.init({
//       easing: "linear",
//     });
//   }, []);

//   // const [selectedAdditionalFees, setSelectedAdditionalFees] = useState([]);
//   const [additionalFeeValues, setAdditionalFeeValues] = useState({});

//   const handleAdditionalFeesChange = (selectedOptions) => {
//     setSelectedAdditionalFees(selectedOptions);

//     // Remove any additional fees that are no longer selected
//     const updatedAdditionalFeeValues = { ...additionalFeeValues };
//     selectedOptions.forEach((option) => {
//       if (!(option.value in updatedAdditionalFeeValues)) {
//         updatedAdditionalFeeValues[option.value] = ""; // Default value, adjust as needed
//       }
//     });
//     setAdditionalFeeValues(updatedAdditionalFeeValues);
//   };

//   const handleAdditionalFeeValueChange = (feeName, value) => {
//     setAdditionalFeeValues((prevValues) => ({
//       ...prevValues,
//       [feeName]: value,
//     }));
//   };

//   return (
//     <div className="md:h-screen p-5 ">
//       <Stack direction="row" spacing={2} className="mb-10">
//         <TextField
//           id="standard-basic"
//           fullWidth
//           size="small"
//           type="text"
//           onChange={(e) => setSearch(e.target.value)}
//           label="Enter Admission No..."
//           variant="standard"
//         />

//         <Button
//           onClick={handleSearchSubmit}
//           variant="contained"
//           style={{ backgroundColor: currentColor, color: "white" }}
//           fullWidth // Ensures the button takes up full width
//         >
//           Filter
//         </Button>
//       </Stack>

//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 bg-white" data-aos="fade-down">
//             <div className="relative  rounded-lg shadow dark:bg-gray-700 overflow-auto ">
//               <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 ">
//                 <h3 className="text-xl font-semibold  dark:text-white">
//                   Student details
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
//               <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh]  overflow-auto  bg-gray-50">
//                 {/* <div className="h-[80vh] md:h-auto overflow-auto  bg-yellow-400"> */}
//                 <div className="p-4 md:p-5 space-y-4  ">
//                   {allData.admissionNumber ? (
//                     <div
//                       onClick={() => handleClick(allData)}
//                       className="md:mt-10"
//                     >
//                       <div className="overflow-hidden">
//                         <div>
//                           <div className="id-card-tag"></div>
//                           <div className="id-card-tag-strip"></div>
//                           <div className="id-card-hook"></div>
//                           <div className="id-card-holder">
//                             <div
//                               className="id-card cursor-pointer"
//                               onClick={() => handleClick(allData)}
//                             >
//                               <div className="header">
//                                 {allData.image ? (
//                                   <img
//                                     className=""
//                                     src={allData.image?.url}
//                                     alt=""
//                                   />
//                                 ) : (
//                                   <img src="" alt="" />
//                                 )}
//                               </div>
//                               <div className="qr-code"></div>
//                               <h3>Name : {allData.fullName}</h3>
//                               <h3>Admission No. : {allData.admissionNumber}</h3>
//                               <h3>
//                                 Class : {allData.class}-{allData.section}
//                               </h3>
//                               <h3>Roll No :{allData.rollNo}</h3>
//                               <h3>F Name :{allData.fatherName}</h3>

//                               <hr />
//                               <p>
//                                 <strong>Address : </strong> {allData.address}
//                               </p>
//                               <p>Ph:{allData.contact}</p>
//                               <h1 className="text-red-700 font-bold">
//                                 {" "}
//                                 Total Dues : {totalDues}
//                               </h1>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ) : null}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="">
//         <div className="flex items-center  mb-5">
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6} md={4}>
//               <TextField
//                 variant="standard"
//                 InputLabelProps={{ shrink: true }}
//                 type="date"
//                 label="Start Date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 fullWidth // Ensures the input field takes up full width
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={4}>
//               <TextField
//                 variant="standard"
//                 InputLabelProps={{ shrink: true }}
//                 type="date"
//                 label="End Date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 fullWidth // Ensures the input field takes up full width
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={2}>
//               <Button
//                 onClick={handleDateFilter}
//                 variant="contained"
//                 style={{ backgroundColor: currentColor, color: "white" }}
//                 fullWidth
//               >
//                 Filter
//               </Button>
//             </Grid>
//             <Grid item xs={12} sm={6} md={2}>
//               <Button
//                 onClick={clearDateFilter}
//                 variant="contained"
//                 style={{ backgroundColor: "#424242", color: "white" }}
//                 fullWidth
//               >
//                 Clear
//               </Button>
//             </Grid>
//           </Grid>
//         </div>
//         {filteredFeeHistory.length === 0 ? (
//           <ErrorPage />
//         ) : (
//           // <DataTable data={filteredFeeHistory} />
//           <Table data={filteredFeeHistory} />
//         )}
//       </div>

//       <div>
//         <Modal
//           isOpen={modalIsOpen}
//           onRequestClose={closeModal}
//           contentLabel="Student Details"
//           className="md:w-[60%] w-full mx-auto h-auto  flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 dark:text-white   "
//         >
//           {selectedStudent && (
//             <>
//               <div
//                 style={{ background: currentColor }}
//                 className={`md:p-5 px-2  bg-[${currentColor}]`}
//                 data-aos="fade-down"
//                 data-aos-easing="linear"
//                 data-aos-duration="500"
//               >
//                 <form>
//                   <div className="text-center">
//                     <h1 className="text-2xl font-semibold mb-4 text-white ">
//                       Create Fee
//                     </h1>
//                   </div>
//                   <div className=" flex justify-between">
//                     <label className="block text-white dark:text-white">
//                       Regular Fee :{" "}
//                       {Array.isArray(getFee) && getFee.length > 0 ? (
//                         ` ${getFee} `
//                       ) : (
//                         <p>No fee data available</p>
//                       )}
//                     </label>
//                     <div className="">
//                       <label className="block text-white dark:text-white ">
//                         Dues : {getTotalFeesAmount() - formData.amountSubmitted}
//                       </label>
//                     </div>
//                   </div>

//                   <div className="grid md:grid-cols-1 grid-cols-1 gap-4 ">
//                     <div className="">
//                       <label className="block text-white dark:text-white">
//                         Months
//                       </label>
//                       <Select
//                         className="dark:bg-secondary-dark-bg "
//                         options={[
//                           "January",
//                           "February",
//                           "March",
//                           "April",
//                           "May",
//                           "June",
//                           "July",
//                           "August",
//                           "September",
//                           "October",
//                           "November",
//                           "December",
//                         ].map((month) => ({
//                           value: month,
//                           label: month,
//                         }))}
//                         value={selectedMonths.map((month) => ({
//                           value: month,
//                           label: month,
//                         }))}
//                         onChange={handleMonthsChange}
//                         isMulti
//                         placeholder="Select months"
//                       />
//                     </div>

//                     <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
//                       <div>
//                         <label className="block text-white">
//                           Additional Fees
//                         </label>
//                         <Select
//                           id="additional-fees"
//                           options={AdditionalFees}
//                           value={selectedAdditionalFees}
//                           onChange={handleAdditionalFeesChange}
//                           isMulti={true}
//                           placeholder="Select additional fees"
//                         />
//                       </div>

//                       {selectedAdditionalFees.map((fee) => (
//                         <div key={fee.value} className="md:mb-4">
//                           <label className="block text-white">
//                             {fee.label} Amount
//                           </label>
//                           <input
//                             type="number"
//                             className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                             value={additionalFeeValues[fee.value]}
//                             onChange={(e) =>
//                               handleAdditionalFeeValueChange(
//                                 fee.value,
//                                 e.target.value
//                               )
//                             }
//                             placeholder={`Enter ${fee.label} amount`}
//                           />
//                         </div>
//                       ))}
//                     </div>
//                     <div className="">
//                       <label className="block text-white">Fee Status</label>
//                       <select
//                         className="w-full border rounded-lg p-2  dark:bg-secondary-dark-bg  dark:text-white"
//                         value={formData.feeStatus || "Unpaid"}
//                         onChange={(e) =>
//                           setFormData({
//                             ...formData,
//                             feeStatus: e.target.value,
//                           })
//                         }
//                       >
//                         <option
//                           value="Paid"
//                           className=" dark:bg-secondary-dark-bg  dark:text-white"
//                         >
//                           Paid
//                         </option>
//                         <option
//                           value="Unpaid"
//                           className=" dark:bg-secondary-dark-bg  dark:text-white"
//                         >
//                           Unpaid
//                         </option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-white">Payment Mode</label>
//                       <select
//                         className="w-full border rounded-lg p-2"
//                         value={formData.paymentMode || "Cash"}
//                         onChange={(e) =>
//                           setFormData({
//                             ...formData,
//                             paymentMode: e.target.value,
//                           })
//                         }
//                       >
//                         <option value="Cash">Cash</option>
//                         <option value="Online">Online</option>
//                       </select>
//                     </div>
//                     <div className="md:mb-4">
//                       <label className="block text-white">
//                         Amount Submitted
//                       </label>
//                       <input
//                         type="number"
//                         className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                         value={formData.amountSubmitted}
//                         // value={formData.amountSubmitted || getFee}
//                         onChange={handleAmountSubmittedChange}
//                       />
//                     </div>
//                     <div className="md:mb-4 m-0">
//                       <label className="block text-white">Fee Date</label>
//                       <input
//                         type="date"
//                         className="w-full border rounded-lg p-2"
//                         value={formData.feeDate}
//                         onChange={handleDateChange}
//                       />
//                     </div>
//                     <p className="text-white font-bold">
//                       {" "}
//                       Total Fees Amount : {getTotalFeesAmount()}
//                     </p>
//                   </div>
//                   {/* </div> */}
//                   <div className="text-right space-x-3">
//                     <button
//                       className="dark:text-white dark:bg-secondary-dark-bg text-gray-800  neu-btn border-2 mb-2"
//                       style={{
//                         border: `2px solid ${currentColor} `,
//                         color: currentColor,
//                       }}
//                       //  className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
//                       onClick={handleSubmit}
//                     >
//                       Submit
//                     </button>
//                     <button
//                       onClick={closeModal}
//                       className="dark:text-white dark:bg-secondary-dark-bg text-gray-800  neu-btn border-2 mb-2 border-gray-500"
//                     >
//                       Close
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </>
//           )}
//         </Modal>
//       </div>
//     </div>
//   );
// }

// export default CheckFee;

// import DataTable from "./DataTable";
// import Loading from "../../Loading";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Modal from "react-modal";
// import AOS from "aos";
// import "./index.css";
// import "aos/dist/aos.css";
// import "./Card.css";
// import Select from "react-select";

// import { Button, Grid, Stack, TextField } from "@mui/material";
// import ErrorPage from "../../ErrorPage";
// import Table from "./Table";
// Modal.setAppElement("#root");
// function CheckFee() {
//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const [feeHistory, setFeeHistory] = useState([]);
//   const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState(getCurrentDate());
//   const getFeeHistory = async () => {
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/fees/feeHistory",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );
//       setFeeHistory(response.data.data);

//       setFilteredFeeHistory(response.data.data);
//     } catch (error) {
//       console.error("Error fetching fee history:", error);
//     }
//   };

//   useEffect(() => {
//     getFeeHistory();
//   }, []);
//   const handleDateFilter = () => {
//     const filteredData = feeHistory.filter((fee) => {
//       const feeDate = new Date(fee.date);
//       return feeDate >= new Date(startDate) && feeDate <= new Date(endDate);
//     });
//     setFilteredFeeHistory(filteredData);
//   };

//   const clearDateFilter = () => {
//     setStartDate("");
//     setEndDate("");
//     setFilteredFeeHistory(feeHistory);
//   };

//   const groupAndSortByDate = () => {
//     const groupedData = {};
//     filteredFeeHistory.forEach((fee) => {
//       const dateKey = new Date(fee.date).toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "long",
//         year: "numeric",
//       });
//       if (!groupedData[dateKey]) {
//         groupedData[dateKey] = [];
//       }
//       groupedData[dateKey].push(fee);
//     });

//     const groupedDataArray = Object.entries(groupedData);
//     groupedDataArray.sort((a, b) => new Date(b[0]) - new Date(a[0]));
//     return groupedDataArray;
//   };
//   const groupedFeeHistory = groupAndSortByDate();

//   const [feeAmount, setFeeAmount] = useState();
//   const { currentColor } = useStateContext();
//   const authToken = Cookies.get("token");
//   const [getFee, setGetFee] = useState({});
//   const [AdditionalFees, setAdditionalFees] = useState([]);
//   const [selectedAdditionalFees, setSelectedAdditionalFees] = useState([]);
//   const [allData, setAllData] = useState([]);
//   const [search, setSearch] = useState("");
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [modalIsOpen, setModalIsOpen] = useState(false);
//   const [totalDues, setTotalDues] = useState(0);
//   const [isOpen, setIsOpen] = useState(false);
//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };
//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };

//   const [selectedMonths, setSelectedMonths] = useState([getCurrentMonth()]);
//   const [formData, setFormData] = useState({
//     admissionNumer: "",
//     feeAmount: feeAmount,
//     FeeMonth: "",
//     feeDate: getCurrentDate(),
//     feeStatus: "Paid",
//     paymentMode: "Online",
//   });

//   const getData = async () => {
//     try {
//       const response = await axios.get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getDataByAdmissionNumber/${search}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       setAllData(response.data.studentData);

//       setTotalDues(response.data.feeStatusData.dues);
//       toast.success("Student get successfully");
//     } catch (error) {
//       console.error("Error fetching data", error);
//     }
//   };

//   const handleDateChange = (e) => {
//     setFormData({ ...formData, feeDate: e.target.value });
//   };
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (selectedMonths.length === 0) {
//       alert("Please select at least one month for regular fees.");
//       return;
//     }

//     const totalAmount = getTotalFeesAmount();
//     setFeeAmount(totalAmount);
//     const dues = totalAmount - formData.amountSubmitted;
//     const feeStatus = dues === 0 ? "Paid" : "Unpaid";

//     const newExamData = {
//       admissionNumber: selectedStudent.admissionNumber,
//       className: selectedStudent.class,
//       feeHistory: selectedMonths.map((month) => ({
//         paidAmount: formData.amountSubmitted,
//         month: month,
//         status: feeStatus,
//         date: formData.feeDate,
//         paymentMode: formData.paymentMode,
//       })),
//       dues: dues,
//     };

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
//   const getTotalFeesAmount = () => {
//     const regularFeesAmount = getFee * selectedMonths.length;
//     const additionalFeesAmount = Array.isArray(selectedAdditionalFees)
//       ? selectedAdditionalFees.reduce(
//           (total, fee) => total + parseFloat(fee.value),
//           0
//         )
//       : 0;

//     return regularFeesAmount + additionalFeesAmount;
//   };

//   const handleAmountSubmittedChange = (e) => {
//     setFormData({ ...formData, amountSubmitted: e.target.value });
//   };
//   const addtionalFee = async () => {
//     try {
//       await axios
//         .get(
//           "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllFees",
//           // "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           const feesData = response.data.map((fee) => {
//             const label =
//               fee.name && fee.amount
//                 ? `${fee.name} (${fee.amount})`
//                 : "Unknown Fee";
//             const value = fee.amount ? fee.amount.toString() : "0";

//             return {
//               label,
//               value,
//             };
//           });

//           setAdditionalFees(feesData);
//         })
//         .catch((error) => {
//           console.error("Error fetching data:", error);
//         });
//     } catch (error) {
//       console.error("Error ", error);
//     }
//   };
//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     setTimeout(() => {
//       getData();
//       setIsOpen(true);
//     }, 500);
//     // setIsOpen(true)
//   };
//   const handleClick = async (student) => {
//     setSelectedStudent(student);
//     setModalIsOpen(true);
//     addtionalFee();
//     setIsOpen(!isOpen);

//     if (!student) {
//       console.error("Selected student is null or undefined");
//       return;
//     }

//     try {
//       const response = await axios.get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       const data = response.data;
//       const feeTypeArray = data;
//       const studentClass = student.class;
//       if (Array.isArray(feeTypeArray)) {
//         const studentFeeAmount = feeTypeArray
//           .filter((feeType) => feeType.className === studentClass)
//           .map((classData) => classData.amount);
//         setGetFee(studentFeeAmount);
//       } else {
//         console.error("Invalid or undefined feeTypeArray");
//       }
//     } catch (error) {
//       console.error("Error fetching Fee data: ", error);
//       toast.error("Failed to fetch fee data");
//     }
//   };

//   const closeModal = () => {
//     setModalIsOpen(false);
//     setSelectedStudent(null);
//   };

//   const handleMonthsChange = (selectedOptions) => {
//     setSelectedMonths(selectedOptions.map((option) => option.value));
//   };
//   const handleAdditionalFeesChange = (selectedOptions) => {
//     setSelectedAdditionalFees(selectedOptions);
//   };

//   useEffect(() => {
//     AOS.init({
//       easing: "linear",
//     });
//   }, []);

//   return (
//     <div className="md:h-screen p-5 ">
//       <Stack direction="row" spacing={2} className="mb-10">
//         <TextField
//           id="standard-basic"
//           fullWidth
//           size="small"
//           type="text"
//           onChange={(e) => setSearch(e.target.value)}
//           label="Enter Admission No..."
//           variant="standard"
//         />

//         <Button
//           onClick={handleSearchSubmit}
//           variant="contained"
//           style={{ backgroundColor: currentColor, color: "white" }}
//           fullWidth // Ensures the button takes up full width
//         >
//           Filter
//         </Button>
//       </Stack>

//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 bg-white" data-aos="fade-down">
//             <div className="relative  rounded-lg shadow dark:bg-gray-700 overflow-auto ">
//               <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 ">
//                 <h3 className="text-xl font-semibold  dark:text-white">
//                   Student details
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
//               <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh]  overflow-auto  bg-gray-50">
//                 {/* <div className="h-[80vh] md:h-auto overflow-auto  bg-yellow-400"> */}
//                 <div className="p-4 md:p-5 space-y-4  ">
//                   {allData.admissionNumber ? (
//                     <div
//                       onClick={() => handleClick(allData)}
//                       className="md:mt-10"
//                     >
//                       <div className="overflow-hidden">
//                         <div>
//                           <div className="id-card-tag"></div>
//                           <div className="id-card-tag-strip"></div>
//                           <div className="id-card-hook"></div>
//                           <div className="id-card-holder">
//                             <div
//                               className="id-card cursor-pointer"
//                               onClick={() => handleClick(allData)}
//                             >
//                               <div className="header">
//                                 {allData.image ? (
//                                   <img
//                                     className=""
//                                     src={allData.image?.url}
//                                     alt=""
//                                   />
//                                 ) : (
//                                   <img
//                                     src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAAAZlBMVEX///+np6f8/PykpKT19fWrq6vt7e2goKAAAADZ2dni4uLExMSurq7V1dW4uLjc3NzOzs5AQEB9fX2SkpIvLy9wcHAgICAqKipYWFg2NjaDg4MRERFdXV1KSkqampq+vr5mZmYYGBjbL5X2AAAJJklEQVR4nO1ciZKrKhBVRIy44RaXuGT+/ydfN2hiEs04STRUvXvq1tyoiIemu+lWwDD+4X8PQpkEJd9mglR4IELfciaw/FAE/Ev0CBN96NuWZZrw7waWZfthL/i+vCgLQscCmHbYe8KNOHYddiGPXOH1oW3iVScMGN2JEhOhDcKx7V5204M8iOzW0LZBZnYo2A6MUEam6Xvurw9jkecP8tqWkueDztgeX6fHhHIP5AVN2IwW4SE0HBj9SYEJl/LqN1F7wntotC/+buuECpCvvQEt1lumFbov1kuiEG7vP9uJFFXDf5USAmihMn7OQxAXfORblFQtoFv2u7WMoD20UXygjVSAvPuPCCsC9xx+SBtQM2337WqoB2IKPmY3JABDfFezGLimT4npWqP/Vo3Qdab4FJ0RoFl29PrtgfXW7UvgoKXBi/cSzzLDTUIPGpqW95KeAifrM/b7CNpbL7Ei4IFfa82q2sGow7+Por1pfVzFpxCW2f+RFcppU07A6q+yAuluKycEyOpP+gF2tzknlJXlrS8dWH8p/TrAvlf7q+jvOvga0JpWOmdmb+QzHwFe1F41DlLftPdKIQ1qm/6ah4GSbzDeLSFapezRDs5gCrFCBiDPcA8uV4S/agvYwzrN+xzArn6xdff1SOdlQNT2NGynv7LeANg7zzrQs/buPASzn1kgXN3V8kaIJ7IAOa7yZB8H+OtFreG/aNx2APvi81dAUH+PUD8Dsigqbq8dsj8P17LnRRV+TVAy/O7nzrOvaRQCtGrOAD3L/+JHDOLP+Srmf8dHjRBzrz2CHUO7OcAI9zjqhhvmw2sAWd1DzMQcc8F97QVuOvf9B8PPl7/VkYeBF9KKXTK9Z/DukygI/77ce9h/d7FCYH0nPpgCYoVb+/u27SHu7Y84e+Z6S4ChZioZ/pUw+B4Q+E4VGxzC16hMcOMUSG/NBg4gwqaUV2jjqGPrXOZTm3BiOOBlqRrF87JW57vSutRhn5umlh933KYpEfm8VYXWJNSj4VK2x+PqjBWwOMXDvirqLvlprw1KD0gqU6WMMKtyVWNcNerBxC+OSZqeTyUoSFCdU4QzTyqwJp6K+UteisdN7F9IeVXO8RtpGV/MQpEq0kr63rKuEtXmrP9R3tg6pozgTTVEa0H2VE34NFLg9pKe88xKSjqSaipVTMT1KGZF6tiXSIYdgqMilee0kTJjVTMUxbkCQfGUFLMnQfGN2O5I2UFmDqTEsRtO59V480Aq9A7wTOdMfyQpNw4NP8YyfjbV1qDwn5G6USNhLaVdICkjaZkiZR7H8bE7jTcPpHzWhgYDazhJUlbMjEj2expPHWBQ1R6gXwgnweCuV5b9OZKKqk6R6orxFv800htI2UaaU+/IFCka498cOo4kLcqLtXHbgsAD+A+grGaG1NSn+4svqJGUUcec3pKyT+OvCymRsaQ1FClxcse/texE6jh15aCiO4wDljy1MK/da1lLeYwkxeNUSio8ju2oj3c6BfpbpUU/kEqyChBn4LOcaqAfSFLPFR3Sv4t3M5ZHPknKSKugTdHylRMCV1qObb2S6n6wp5AUbxM5KyiHUhfjENkKUpHpjD/JciisSLE2l2qQHqV0SXo1qSsp7qC1ICmzUmYQVFA8P4rhwPnV+jAkHpWbOuZSJ/NCyrPLMiTFmqxzuUhPycUuFKmfiwAOiUGaeKi3BclGcdwJzkX900nrCyWW3KJ58fXsCalWPo7mpeoFp6yyuJmEPU6FpNrLmbgGax0Vw0Etp10JCtbmKFy3LKX5lQvqwlaRIsNUMTZOGWOuuJk5RfmklCxo0MsRVXNu4J6AU1XdgAUPxK4ZDZD6eiysQPUnpUHciWCakrroozakJi7hifPcGRPn+WSY2RmTYebJgGyouaXXGabjMZm/fHtNYlrwevZxzipiOiAvhy72AbMVoz4MQR3PZIbQHFTUa6Q/IOPgNI2PkkOuHmgeEHEn05jTkOUY3kmePpzmHjcNXRaDPJq3MYZzcoiXJWXwGbXlECY4GFi6cTe5pWhapaH+jy+ElxQYz0eXIqJKhcTM426CvMVwWGReLpt4bpVVnGMsmLYiDhdI+bFbqBb4B6mpMsybkCqWP3LehMOLiUMaE1uGjrYKQCCXwnvb2jirQOGBFM0TWrcDKampThWtJXWTOCylWBSj8wrjBBZLgXUZPscDDQtPfJZUEPeQgQlFCovwBrPSdaRuUqylZLTPAhX/G6RGRWGNzLcTeAxTWvZAqsvgWpOiGP0ir+ukbLETpzp1rhFzIehNMrqQtpMc7aiX6YKHMaMnW8ljrLDGHPWR1BEl2sVMkUqSpDyLO1JNjrCMR9yoESjYnEyDqoPQx8Xw3KDlmRi1zJDtSsDpUJrlPSnv2MO14ISWjTpFCE0xdZh2n28s+ambFxwLr4KcQvqUomXywKWZVKymkI4mQ1O/I0XqTF1rjIv18aJeq1O374dnX5qRNuc8inifYTUQ5PqyI92TCZlbxNOCP5CK2g7TOu7EwcX61pNit58iZ18vjreTEjMryHWlHQ3pJTwH+2ggNY5Y5lGNVxw5KOsjHaZVq0jdvV6c8+kkiQfpdQWaQVgcTUMmdaokRY5dJUm1UndTWg15DMmhy/2fPMnzMkukS1BFEiKyUv7KH7rm4UPIzCtrVo+8gwQzEVon2HKRj/0ewnFYwzkOlo/oeD7W6uWR4cmTqdTdsUhKouFX8kDq4ZW1li/3tfwMouUHIz0/rX39QwjY3uPLDy0/12r5YVvLKQB6TpYwvjf/ZnlaCU7A+ZqoFifg4Jwu7aYqaTmpS8/pb1pOFNRzSqWek0+1nKar54RmOfV71w4kv0/91nOSvJ7LCeQKjT0XXqxbeaLjEhU9F/PouexJzwViei6l03LRoZ7LM/VcyKrnkt8tF0ezlxdHG5stI4/eWEZubLPgnoDZvddUHbcm0HMTB2OD7S4+oqU6bgyi5xYqxtDG9zabcf3PbjaDeHNbHneDbXmMD2xgFG61r5JuWz1J6LcplqIV+Ku3D3OxCZbjb7x9mHqYCLH5oCVPN1ozVZk9NlqTwC3pLIlxSzqutqTj45Z06uqOW9IpLG3eZw2b93l7b9438tJum8M7enJHSKoBlX/4Ov4DD0KBva/eI90AAAAASUVORK5CYII="
//                                     alt=""
//                                   />
//                                 )}
//                               </div>
//                               <div className="qr-code"></div>
//                               <h3>Name : {allData.fullName}</h3>
//                               <h3>Admission No. : {allData.admissionNumber}</h3>
//                               <h3>
//                                 Class : {allData.class}-{allData.section}
//                               </h3>
//                               <h3>Roll No :{allData.rollNo}</h3>
//                               <h3>F Name :{allData.fatherName}</h3>

//                               <hr />
//                               <p>
//                                 <strong>Address : </strong> {allData.address}
//                               </p>
//                               <p>Ph:{allData.contact}</p>
//                               <h1 className="text-red-700 font-bold">
//                                 {" "}
//                                 Total Dues : {totalDues}
//                               </h1>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ) : null}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="">
//         <div className="flex items-center  mb-5">
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6} md={4}>
//               <TextField
//                 variant="standard"
//                 InputLabelProps={{ shrink: true }}
//                 type="date"
//                 label="Start Date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 fullWidth // Ensures the input field takes up full width
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={4}>
//               <TextField
//                 variant="standard"
//                 InputLabelProps={{ shrink: true }}
//                 type="date"
//                 label="End Date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 fullWidth // Ensures the input field takes up full width
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={2}>
//               <Button
//                 onClick={handleDateFilter}
//                 variant="contained"
//                 style={{ backgroundColor: currentColor, color: "white" }}
//                 fullWidth
//               >
//                 Filter
//               </Button>
//             </Grid>
//             <Grid item xs={12} sm={6} md={2}>
//               <Button
//                 onClick={clearDateFilter}
//                 variant="contained"
//                 style={{ backgroundColor: "#424242", color: "white" }}
//                 fullWidth
//               >
//                 Clear
//               </Button>
//             </Grid>
//           </Grid>
//         </div>
//         {filteredFeeHistory.length === 0 ? (
//           <ErrorPage />
//         ) : (
//           // <DataTable data={filteredFeeHistory} />
//           <Table data={filteredFeeHistory} />
//         )}
//       </div>

//       <div>
//         <Modal
//           isOpen={modalIsOpen}
//           onRequestClose={closeModal}
//           contentLabel="Student Details"
//           className="md:w-[60%] w-full mx-auto h-auto  flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 dark:text-white   "
//         >
//           {selectedStudent && (
//             <>
//               <div
//                 style={{ background: currentColor }}
//                 className={`md:p-5 px-2  bg-[${currentColor}]`}
//                 data-aos="fade-down"
//                 data-aos-easing="linear"
//                 data-aos-duration="500"
//               >
//                 <form>
//                   <div className="text-center">
//                     <h1 className="text-2xl font-semibold mb-4 text-white ">
//                       Create Fee
//                     </h1>
//                   </div>
//                   <div className=" flex justify-between">
//                     <label className="block text-white dark:text-white">
//                       Regular Fee :{" "}
//                       {Array.isArray(getFee) && getFee.length > 0 ? (
//                         ` ${getFee} `
//                       ) : (
//                         <p>No fee data available</p>
//                       )}
//                     </label>
//                     <div className="">
//                       <label className="block text-white dark:text-white ">
//                         Dues : {getTotalFeesAmount() - formData.amountSubmitted}
//                       </label>
//                     </div>
//                   </div>

//                   <div className="grid md:grid-cols-2 grid-cols-1 gap-4 ">
//                     <div className="">
//                       <label className="block text-white dark:text-white">
//                         Months
//                       </label>
//                       <Select
//                         className="dark:bg-secondary-dark-bg "
//                         options={[
//                           "January",
//                           "February",
//                           "March",
//                           "April",
//                           "May",
//                           "June",
//                           "July",
//                           "August",
//                           "September",
//                           "October",
//                           "November",
//                           "December",
//                         ].map((month) => ({
//                           value: month,
//                           label: month,
//                         }))}
//                         value={selectedMonths.map((month) => ({
//                           value: month,
//                           label: month,
//                         }))}
//                         onChange={handleMonthsChange}
//                         isMulti
//                         placeholder="Select months"
//                       />
//                     </div>
//                     <div className="">
//                       <label className="block text-white">
//                         Additional Fees
//                       </label>
//                       <Select
//                         id="additional-fees"
//                         options={AdditionalFees}
//                         value={selectedAdditionalFees}
//                         onChange={handleAdditionalFeesChange}
//                         isMulti={true}
//                         placeholder="Select additional fees"
//                       />
//                     </div>
//                     <div className="">
//                       <label className="block text-white">Fee Status</label>
//                       <select
//                         className="w-full border rounded-lg p-2  dark:bg-secondary-dark-bg  dark:text-white"
//                         value={formData.feeStatus || "Unpaid"}
//                         onChange={(e) =>
//                           setFormData({
//                             ...formData,
//                             feeStatus: e.target.value,
//                           })
//                         }
//                       >
//                         <option
//                           value="Paid"
//                           className=" dark:bg-secondary-dark-bg  dark:text-white"
//                         >
//                           Paid
//                         </option>
//                         <option
//                           value="Unpaid"
//                           className=" dark:bg-secondary-dark-bg  dark:text-white"
//                         >
//                           Unpaid
//                         </option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-white">Payment Mode</label>
//                       <select
//                         className="w-full border rounded-lg p-2"
//                         value={formData.paymentMode || "Cash"}
//                         onChange={(e) =>
//                           setFormData({
//                             ...formData,
//                             paymentMode: e.target.value,
//                           })
//                         }
//                       >
//                         <option value="Cash">Cash</option>
//                         <option value="Online">Online</option>
//                       </select>
//                     </div>
//                     <div className="md:mb-4">
//                       <label className="block text-white">
//                         Amount Submitted
//                       </label>
//                       <input
//                         type="number"
//                         className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                         value={formData.amountSubmitted}
//                         // value={formData.amountSubmitted || getFee}
//                         onChange={handleAmountSubmittedChange}
//                       />
//                     </div>
//                     <div className="md:mb-4 m-0">
//                       <label className="block text-white">Fee Date</label>
//                       <input
//                         type="date"
//                         className="w-full border rounded-lg p-2"
//                         value={formData.feeDate}
//                         onChange={handleDateChange}
//                       />
//                     </div>
//                     <p className="text-white font-bold">
//                       {" "}
//                       Total Fees Amount : {getTotalFeesAmount()}
//                     </p>
//                   </div>
//                   {/* </div> */}
//                   <div className="text-right space-x-3">
//                     <button
//                       className="dark:text-white dark:bg-secondary-dark-bg text-gray-800  neu-btn border-2 mb-2"
//                       style={{
//                         border: `2px solid ${currentColor} `,
//                         color: currentColor,
//                       }}
//                       //  className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
//                       onClick={handleSubmit}
//                     >
//                       Submit
//                     </button>
//                     <button
//                       onClick={closeModal}
//                       className="dark:text-white dark:bg-secondary-dark-bg text-gray-800  neu-btn border-2 mb-2 border-gray-500"
//                     >
//                       Close
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </>
//           )}
//         </Modal>
//       </div>
//     </div>
//   );
// }

// export default CheckFee;
