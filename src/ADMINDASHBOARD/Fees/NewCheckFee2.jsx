import axios from "axios";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Select from "react-select";
import { toast } from "react-toastify";
import Table from "./Table";
import { LastYearStudents } from "../../Network/AdminApi";
import Modal from "../../Dynamic/Modal";

const NewCheckFee2 = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showForm, setShowForm] = useState([]);
  const [reLoad, setReload] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
  const [additionalFees, setAdditionalFees] = useState([]);
  const [parentData, setParentData] = useState([]);
  const [allStudent, setAllStudent] = useState([]);
  const [formData, setFormData] = useState(
    parentData.map(() => ({
      classFee: "",
      additionalFeeValues: [],
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

  const getAllStudent = async () => {
    try {
      const response = await LastYearStudents();
      if (response) {
        setAllStudent(response?.allStudent);
      }
      console.log("response all student", response?.allStudent);
    } catch (error) {}
  };
  useEffect(() => {
    getAllStudent();
  }, []);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase().trim();
    setSearchTerm(searchValue);
    console.log("searchValue", searchValue);
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
          feeDate: getCurrentDate(),
          paymentMode: "Cash",
          selectedAdditionalFees: [],
          amountSubmitted: 0,
        }));

        setFormData(initialFormData);
        setIsOpen(true);
        setModalOpen(true);
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
        const feesData = response.data
          .filter((feeType) => feeType.className === studentClass)
          .map((fee) => {
            const label = fee.name ? `${fee.name}` : "Unknown Fee";
            const value = fee.amount ? fee.amount : 0;
            return {
              label,
              value,
            };
          });
        console.log("feesData", feesData);
       
        setAdditionalFees(feesData);
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
            additionalFee: updatedFormData[index]?.additionalFee || 0,
          };

          setFormData(updatedFormData);
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
      updatedShowForm[index] = false;
    } else {
      updatedSelectedChildren.push(index);
      updatedShowForm[index] = true;
    }

    setSelectedChildren(updatedSelectedChildren);
    setShowForm(updatedShowForm);
  };

  const handleMonthSelection = (selectedOptions, childIndex) => {
    const selectedMonths = selectedOptions.map((option) => option.value);
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
    const totalClassFee =
      (updatedFormData[childIndex].classFee || 0) * selectedMonths.length;
    updatedFormData[childIndex].totalClassFee = totalClassFee;

    setFormData(updatedFormData);
  };

  const handleMonthFeeChange = (index, month, value) => {
    const updatedFormData = [...formData];
    updatedFormData[index].monthFees[month] = parseFloat(value);
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

  const handleAdditionalFeeChange = (index, feeIndex, month, newValue) => {
    const updatedFormData = [...formData];

    if (!updatedFormData[index].additionalFeeValues) {
      updatedFormData[index].additionalFeeValues = [];
    }

    const feeEntry = updatedFormData[index].additionalFeeValues[feeIndex];
    if (feeEntry) {
      const monthEntry = feeEntry.selectedMonths.find(
        (monthData) => monthData.month === month
      );

      if (monthEntry) {
        monthEntry.value = parseFloat(newValue) || 0;
      } else {
        console.error("Month entry not found.");
      }
    } else {
      console.error("Additional fee entry not found.");
    }

    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const childIndex of selectedChildren) {
        const child = parentData[childIndex];
        const childFormData = formData[childIndex] || {};
        if (!childFormData.paymentMode) {
          toast.error(`Payment mode is required for ${child.fullName}`);
          continue;
        }

        const selectedMonthsData =
          (childFormData.selectedMonths || []).map((month) => {
            const paidAmount = Number(childFormData.monthFees?.[month]) || 0;

            return {
              month: month,
              paidAmount: paidAmount,
            };
          }) || [];

        const totalRegularPaidAmount = selectedMonthsData.reduce(
          (acc, curr) => acc + curr.paidAmount,
          0
        );

        const additionalFeesData = (
          childFormData.additionalFeeValues || []
        ).flatMap((feeData) => {
          return (feeData.selectedMonths || []).map((month) => ({
            name: feeData.fee,
            month: month.month,
            paidAmount: Number(month.value) || 0,
          }));
        });

        const totalAdditionalPaidAmount = additionalFeesData.reduce(
          (acc, curr) => acc + curr.paidAmount,
          0
        );

        const totalPaidAmount =
          totalRegularPaidAmount + totalAdditionalPaidAmount;

        const totalClassFee = childFormData.totalClassFee || 0;
        const totalAdditionalFees = childFormData.additionalFee || 0;
        const totalFeeAmount = parseFloat(totalClassFee + totalAdditionalFees);
        const concessionFee = parseFloat(childFormData.concessionFee) || 0;
        const newPaidAmount = totalPaidAmount - concessionFee;
        const TotalFeeAfterDiscount = concessionFee
          ? totalFeeAmount - concessionFee
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
            paidAfterConcession:
              TotalFeeAfterDiscount + parseFloat(childFormData.previousDues) ||
              0,
            newPaidAmount: newPaidAmount,
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
          setModalOpen(false);
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
    const selectedMonths = selectedOptions.map((option) => ({
      month: option.value,
      fee: formData[index].additionalFeeValues[feeIndex].fee,
      value: formData[index].additionalFeeValues[feeIndex].value,
    }));

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

    updatedFormData[index].additionalFee = totalAdditionalFee;
    setFormData(updatedFormData);
  };
  return (
    <div className="md:min-h-screen md:pl-0 md:px-0">
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
              className="p-2 border-b cursor-pointer hover:bg-gray-100 hover:bg-red-300"
              onClick={() => handleStudentClick(student.parentAdmissionNumber)}
            >
              {student.fullName || "No Name"}, {student.class},{" "}
              {student.fatherName}, {student.admissionNumber}
            </h1>
          ))}
        </div>
      )}
      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={`Create Fees`}>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-2 w-full p-4"
        >
          {parentData.map((child, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-2">
              <div className=" w-full flex items-center flex-row gap-2  mb-2 p-2">
                <div>
                  <input
                    type="checkbox"
                    checked={selectedChildren.includes(index)}
                    onChange={() => handleChildSelection(index)}
                    className="mr-2 "
                  />
                </div>
                <div>
                  <span className=" text-[16px] font-semibold text-blue-800">
                    {child.fullName} ,
                  </span>
                  <span className="text-[16px] text-blue-800">
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
                          checked={formData[index]?.includeClassFee || false}
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
                                "April",
                                "May",
                                "June",
                                "July",
                                "August",
                                "September",
                                "October",
                                "November",
                                "December",
                                "January",
                                "February",
                                "March",
                              ].map((month) => ({
                                value: month,
                                label: month,
                              }))}
                              value={formData[index]?.selectedMonths?.map(
                                (month) => ({
                                  value: month,
                                  label: month,
                                })
                              )}
                              onChange={(selectedOptions) =>
                                handleMonthSelection(selectedOptions, index)
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
                          <div className="w-full flex flex-wrap gap-2 px-2">
                            {formData[index]?.selectedMonths?.map(
                              (month, monthIndex) => (
                                <div
                                  key={monthIndex}
                                  className="bg-gray-200 p-1 rounded-sm"
                                >
                                  <label className="block text-[10px] font-medium text-blue-700">
                                    {month}
                                  </label>
                                  <input
                                    type="number"
                                    className="w-12 border rounded-sm p-1 text-[10px]"
                                    value={formData[index]?.monthFees?.[month]}
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

                  <div className="mb-2 px-2  rounded">
                    <div className="flex flex-row ">
                      <input
                        type="checkbox"
                        checked={
                          formData[index]?.includeAdditionalFees || false
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
                          options={additionalFees}
                          onChange={(selectedOptions) =>
                            handleAdditionalFeesChange(index, selectedOptions)
                          }
                          className="basic-single "
                          classNamePrefix="select"
                        />
                        {formData[index]?.additionalFeeValues?.map(
                          (feeData, feeIndex) => (
                            <div
                              key={feeIndex}
                              className=" mt-1 w-full bg-red-400 p-1 flex flex-wrap gap-2 rounded"
                            >
                              <div className="w-full">
                                <p className="block text-[15px] font-medium text-blue-700">
                                  {feeData.fee}: {feeData.value}
                                </p>
                              </div>
                              <div className="w-full bg-gray-100">
                                <label className="block text-[10px] font-medium text-gray-700">
                                  Months
                                </label>
                                <Select
                                  options={[
                                    "April",
                                    "May",
                                    "June",
                                    "July",
                                    "August",
                                    "September",
                                    "October",
                                    "November",
                                    "December",
                                    "January",
                                    "February",
                                    "March",
                                  ].map((month) => ({
                                    value: month,
                                    label: month,
                                  }))}
                                  value={feeData.selectedMonths?.map(
                                    (month) => ({
                                      value: month.month,
                                      label: month.month,
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
                                  className="text-[10px] mt-1 text-blue-700"
                                  classNamePrefix="select"
                                />

                                <div className="w-full flex flex-wrap gap-2   px-2">
                                  {feeData.selectedMonths?.map(
                                    (monthData, monthIndex) => (
                                      <div
                                        key={monthIndex}
                                        className="bg-gray-200 p-2 rounded"
                                      >
                                        <label className="block text-[10px] font-medium text-blue-700">
                                          {`
                                               
                                                 ${monthData.month}`}
                                        </label>
                                        <input
                                          type="number"
                                          className="w-16 border rounded-sm p-1 text-[10px]"
                                          value={monthData.value || ""}
                                          onChange={(e) =>
                                            handleAdditionalFeeChange(
                                              index,
                                              feeIndex,
                                              monthData.month,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
                    <div className="px-2 ">
                      <label className="block text-[14px] font-medium text-gray-600">
                        Fee Date
                      </label>
                      <input
                        type="date"
                        value={formData[index]?.feeDate || getCurrentDate()}
                        onChange={(e) =>
                          handleInputChange(index, "feeDate", e.target.value)
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

                    <div className="px-2">
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
                  <label className=" px-2 block text-[16px] font-medium text-blue-900">
                    Total Amount :{" "}
                    {`${
                      (formData[index]?.additionalFee || 0) +
                      (formData[index]?.totalClassFee || 0)
                    } + ${formData[index]?.previousDues || 0} -
                                ${formData[index]?.concessionFee || 0} `}{" "}
                    = ₹{" "}
                    {(formData[index]?.additionalFee || 0) +
                      (formData[index]?.totalClassFee || 0) +
                      parseFloat(formData[index]?.previousDues || 0) -
                      (formData[index]?.concessionFee || 0)}
                  </label>

                  <div className="p-2">
                    <label className="block text-[14px] font-medium text-gray-600">
                      Remarks
                    </label>
                    <textarea
                      type="text"
                      value={formData[index]?.remarks || ""}
                      onChange={(e) =>
                        handleInputChange(index, "remarks", e.target.value)
                      }
                      className="w-full border p-1 rounded"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </form>
        <>
          <div className="gap-2 p-2 w-full">
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-blue-500 w-full text-white px-4 py-2 rounded self-end my-2"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="bg-gray-500 w-full text-white px-4 py-2 rounded self-end"
            >
              Cancel
            </button>
          </div>
        </>
      </Modal>
      <Table reLoad={reLoad} />
    </div>
  );
};

export default NewCheckFee2;
