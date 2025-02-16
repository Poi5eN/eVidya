import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Select, MenuItem } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
const authToken = Cookies.get("token");

const EditPrimary = () => {
  const navigate = useNavigate();
  const { className } = useParams();
  const [classData, setClassData] = useState({});
  const [formData, setFormData] = useState({
    className: "",
    subjects: "",
    sections: "",
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    axios
      .get(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses?className=${className}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const data = response.data.classList.filter((classN)=>classN.className ===className)[0];
  
        setClassData(data);
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...data,
        }));
      })
      .catch((error) => {
        console.error("Error fetching class data:", error);
      });
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();

    axios
      .put(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/updateClass`,
        formData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        navigate("/admin/classes");
      })
      .catch((error) => {
        console.error("Error updating class data:", error);
      });
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "900" }}>Edit Class</h1>
      <form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <Box className="py-5 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-4 bg-white rounded-md shadow-lg">
          <TextField
            label="Class Name"
            name="className"
            type="text"
            value={formData.className}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
            
          />
          
          <TextField
            label="Sections"
            name="sections"
            type="text"
            value={formData.sections.toString()}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Subjects"
            name="subjects"
            type="text"
            value={formData.subjects.toString()}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
        </Box>
        <Link to="/admin/classes">
          <div className="button flex w-full" style={{ marginTop: "10px" }}>
            <Button
              variant="contained"
              onClick={handleFormSubmit}
              style={{ width: "50%", marginRight: "10px" }}
            >
              Update
            </Button>
            <Button variant="contained" style={{ width: "50%" }}>
              Cancel
            </Button>
          </div>
        </Link>
      </form>
    </div>
  );
};

export default EditPrimary;
