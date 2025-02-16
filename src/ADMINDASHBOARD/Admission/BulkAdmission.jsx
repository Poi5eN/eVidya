import React, { useState } from "react";
import { useStateContext } from "../../contexts/ContextProvider.js";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

import AOS from "aos";
import * as XLSX from "xlsx";
import "aos/dist/aos.css";
import { FaPlus } from "react-icons/fa";
import Button from "../../Dynamic/utils/Button.jsx";
import Modal from "../../Dynamic/Modal.jsx";

AOS.init();

const authToken = Cookies.get("token");

const BulkAdmission = ({ refreshRegistrations }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentColor } = useStateContext();
  const [file, setFile] = useState(null);
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };
  const [isOpen, setIsOpen] = useState(false);

  const processFile = async () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        try {
          setLoading(true);
          await axios.post(
            "https://eserver-i5sm.onrender.com/api/v1/adminRoute/createBulkStudentParent",
            { students: worksheet },
            // { registrations: worksheet },
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          toast.success("Bulk registration created successfully!");
          setIsOpen(false);
          setModalOpen(false);
          setLoading(false);
          refreshRegistrations();
        } catch (error) {
          toast.error("Failed to create bulk registration.", error);
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };
  return (
    <>
      <Button
        name="Bulk Admission"
        onClick={() => setModalOpen(true)}
        //  onClick={toggleModal}
      />

      <Modal
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
        title={`Bulk Admission`}
      >
        <div className="grid md:grid-cols-1 grid-cols-1 gap-2 p-5 bg-gray-50">
        {/* <div className="bg-white rounded  p-4 px-4 mb-6"> */}
          {/* <h2
            className="text-2xl font-bold mb-4 uppercase text-center  hover-text "
            style={{ color: currentColor }}
          >
            Upload Bulk Admission
          </h2> */}

          {/* <div className="flex items-center gap-5 flex-wrap"> */}
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".xlsx, .xls"
              className="h-10  border mt-1 rounded px-4  bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
            />
          {/* </div> */}
          <div className="mt-4 flex flex-col md:flex-row justify-center gap-2">
            <Button
              loading={loading}
              type="submit"
              name="Submit"
              width="full"
              onClick={processFile}
            />
            {/* <Button name="Back"  onClick={toggleModal}  width="full" /> */}
            <Button
              name="Cancel"
              onClick={() => setModalOpen(false)}
              width="full"
              color="gray"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BulkAdmission;
