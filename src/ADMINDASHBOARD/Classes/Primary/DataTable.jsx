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
    { field: "className", headerName: "Class", flex: 1 , minWidth: 70,},
    { field: "subjects", headerName: "subjects", flex: 1, minWidth: 120 },
    { field: "sections", headerName: "Sections", flex: 1, minWidth: 120 },

    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
       minWidth: 120,
      renderCell: (params) => (
        <div>
          {/* /admin/classes/view-classes/:_id */}
          <Link to={`/admin/classes/view-classes/${params.row._id}`}>
            <IconButton>
              <VisibilityIcon className="text-blue-600" />
            </IconButton>
          </Link>
         
          <Link to={`/admin/classes/edit-classes/${params.row.className}`}>
            <IconButton>
              <EditIcon className="text-green-600" />
            </IconButton>
          </Link>

          <IconButton onClick={() => handleDeleteClick(params.row._id)}>
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
    <div className="h-[450px] dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
      <div className=" min-w-[1000px]  w-full">
        <DataGrid
          className="dark:text-white dark:bg-secondary-dark-bg  mx-auto bg-white"
          rows={dataWithIds}
          columns={columns}
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
    </div>
  );
}

export default DynamicDataTable;
