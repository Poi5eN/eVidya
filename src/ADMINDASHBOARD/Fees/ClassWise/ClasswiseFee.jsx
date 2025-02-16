import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@mui/material";
import useCustomQuery from "../../../useCustomQuery";
import FeesDataTable from "./DataTable";
import NoDataFound from "../../../NoDataFound";
import Modal from "../../../Dynamic/Modal";
import { useStateContext } from "../../../contexts/ContextProvider";

const authToken = Cookies.get("token");

function ClasswiseFee() {
  const { currentColor } = useStateContext();
  const { queryData: classData, loading: classLoading, error: classError } = useCustomQuery(
    "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees"
  );

  const [formData, setFormData] = useState({ className: "", feeType: "", amount: "" });
  const [submittedData, setSubmittedData] = useState([]);
  const [getClass, setGetClass] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  useEffect(() => {
    if (classData) {
      setSubmittedData(classData);
    }
  }, [classData]);

  useEffect(() => {
    axios
      .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((response) => {
        let classes = response.data.classList.map((cls) => cls.className);
        setGetClass(classes.sort((a, b) => a - b));
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      let apiUrl = "https://eserver-i5sm.onrender.com/api/v1/adminRoute/createFees";
      let method = "post";

      if (editMode && editItemId) {
        apiUrl = `https://eserver-i5sm.onrender.com/api/v1/adminRoute/updateFees/${editItemId}`;
        method = "put";
      }

      await axios({
        method: method,
        url: apiUrl,
        data: formData,
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      });

      if (editMode) {
        const updatedData = submittedData.map((item) =>
          item._id === editItemId ? { ...item, ...formData } : item
        );
        setSubmittedData(updatedData);
        toast.success("Fees updated successfully!");
      } else {
        setSubmittedData([...submittedData, formData]);
        toast.success("Fees created successfully!");
      }

      setLoading(false);
      closeModal();
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      toast.error("An error occurred while submitting the form.");
    }
  };

  const handleDelete = (itemId) => {
    axios
      .delete(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/deleteFees/${itemId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then(() => {
        setSubmittedData(submittedData.filter((item) => item._id !== itemId));
        toast.success("Fees deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting Fees:", error);
        toast.error("An error occurred while deleting the Fees.");
      });
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setEditItemId(item._id);
    setFormData({
      className: item.className,
      feeType: item.feeType,
      amount: item.amount,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setEditItemId(null);
    setFormData({ className: "", feeType: "", amount: "" });
  };

  return (
    <div className=" mx-auto ">
      <h1 className="text-xl font-bold  uppercase text-center" style={{ color: currentColor }}>
        Create Class Fee
      </h1>
      <div className="mb-1">
        <Button
          variant="contained"
          style={{ backgroundColor: currentColor }}
          onClick={() => {
            setEditMode(false);
            setEditItemId(null);
            setFormData({ className: "", feeType: "", amount: "" });
            setModalOpen(true);
          }}
        >
          Create Fee
        </Button>
      </div>

      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={editMode ? "Edit Class Fee" : "Create Class Fee"}>
        <div className="p-4 space-y-4 bg-gray-50">
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium">Class</label>
              <select name="className" value={formData.className} onChange={handleFieldChange} className="border rounded p-2 w-full">
                <option value="">Select Class</option>
                {getClass.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Fee Type</label>
              <select name="feeType" value={formData.feeType} onChange={handleFieldChange} className="border rounded p-2 w-full">
                <option value="">Select Fee Type</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half Yearly">Half Yearly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Amount</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleFieldChange} className="border rounded p-2 w-full" />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="contained" onClick={handleSubmit} style={{ backgroundColor: currentColor, color: "white" }}>
              {loading ? "Processing..." : editMode ? "Update" : "Submit"}
            </Button>
            <Button variant="contained" onClick={closeModal} style={{ backgroundColor: "#616161", color: "white" }}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {submittedData.length > 0 ? (
        <FeesDataTable data={submittedData} handleDelete={handleDelete} handleEdit={handleEdit} />
      ) : (
        <NoDataFound />
      )}
    </div>
  );
}

export default ClasswiseFee;