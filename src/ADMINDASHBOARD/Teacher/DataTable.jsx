import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

function DynamicDataTable({ data, handleDelete }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDelete(deletingItem);
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const columns = [
    { field: "id", headerName: "S. No.", minWidth: 50,flex:1, renderCell: (params) => (
      <span style={{ color: "#01579b", fontSize: "12px" }}>
        {params.value}
      </span>
    ), },
    {
      field: "image.url",
      headerName: "Photo",
      minWidth: 70,
      flex:1,

      renderCell: (params) => (
        <img
        
          src={params.row.image.url}
          alt="Student"
          style={{ width: "40px", height: "40px", borderRadius: "50%",objectFit: "cover",  }}
        />
      ),
    },
    { field: "fullName", headerName: "Full Name", minWidth:150,flex:1, renderCell: (params) => (
      <span style={{ color: "#01579b", fontSize: "12px" }}>
        {params.value}
      </span>
    ), },
    { field: "employeeId", headerName: "Employee ID",  minWidth:100, flex:1, renderCell: (params) => (
      <span style={{ color: "#01579b", fontSize: "12px" }}>
        {params.value}
      </span>
    ),},
    { field: "email", headerName: "Email",  minWidth:160,flex:1, renderCell: (params) => (
      <span style={{ color: "#ff3d00", fontSize: "12px" }}>
        {params.value}
      </span>
    ), },
    // { field: "classTeacher", headerName: "Class Teacher", minWidth:100,flex:1, renderCell: (params) => (
    //   <span style={{ color: "#01579b", fontSize: "12px" }}>
    //     {params.value}
    //   </span>
    // ), },
    {
      field: "classTeacher",
      headerName: "Class Teacher",
      minWidth: 100,
      flex: 1,
      renderCell: (params) => {
        const { classTeacher, section } = params.row; // Assuming className and section are in the row data
        return (
          <span style={{ color: "#01579b", fontSize: "12px" }}>
            {`${classTeacher} - ${section}`}
          </span>
        );
      },
    }
,    
    { field: "salary", headerName: "Salary", minWidth:60,flex:1, renderCell: (params) => (
      <span style={{ color: "#01579b", fontSize: "12px" }}>
        {params.value}
      </span>
    ), },
  
    {
      field: "joiningDate",
      headerName: "Joining Date",
      minWidth: 100,
      flex:1,
      renderCell: (params) => (
        <span style={{ color: "#f50057", fontSize: "12px" }}>
          {new Date(params.value).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
        </span>
      ),
    },
    { field: "contact", headerName: "Contact",  minWidth:110,flex:1, renderCell: (params) => (
      <span style={{ color: "#e65100", fontSize: "12px" }}>
        {params.value}
      </span>
    ), },
    { field: "experience", headerName: "Experience",  minWidth:90 ,flex:1, renderCell: (params) => (
      <span style={{ color: "#01579b", fontSize: "12px" }}>
        {params.value}
      </span>
    ),},
    {
      field: "actions",
      headerName: "Actions",
      minWidth:150,flex:1,
      renderCell: (params) => (
        <div>
          <Link to={`/admin/allteachers/view-profile/${params.row.email}`}>
            <IconButton>
              <VisibilityIcon className="text-blue-600" />
            </IconButton>
          </Link>
          <Link to={`/admin/allteachers/edit-profile/${params.row.email}`}>
            <IconButton>
              <EditIcon className="text-green-600" />
            </IconButton>
          </Link>
          <IconButton onClick={() => handleDeleteClick(params.row.email)}>
            <DeleteIcon className="text-red-600" />
          </IconButton>
        </div>
      ),
    },
  ];
  const dataWithIds = Array.isArray(data)
    ? data.map((item, index) => ({ id: index + 1, ...item }))
    : [];
  return (
    <>
   {/* <div className="h-[350px]  mx-auto  bg-white mt-2 rounded-md"> */}
   <div className="max-h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-auto w-full">
      {/* <div style={{ height: 400, minWidth: "100%" }}> */}
        <DataGrid
          rows={dataWithIds}
          columns={columns}
          className="dark:text-white dark:bg-secondary-dark-bg  mx-auto bg-white"
        />
      </div>
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you really want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmDelete} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    {/* // </div> */}
   </>
  );
}

export default DynamicDataTable;
