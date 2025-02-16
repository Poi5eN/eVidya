import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useStateContext } from "../../../contexts/ContextProvider";

function FeesDataTable({ data, handleDelete, handleEdit }) {
  const { currentColor } = useStateContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);

  const handleDeleteClick = (itemId) => {
    setDeletingItemId(itemId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDelete(deletingItemId);
    setDeleteDialogOpen(false);
    setDeletingItemId(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingItemId(null);
  };

  const columns = [
    { field: "id", headerName: "S. No.", width: 80 },
    { field: "className", headerName: "Class", flex: 1 },
    { field: "feeType", headerName: "Fee Type", flex: 1 },
    { field: "amount", headerName: "Amount", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        return (
          <div>
            <IconButton onClick={() => handleEdit(params.row)}>
              <EditIcon className="text-cyan-600" style={{ color: currentColor }} />
            </IconButton>
            <IconButton onClick={() => handleDeleteClick(params.row._id)}>
              <DeleteIcon className="text-red-600" />
            </IconButton>
          </div>
        );
      },
    },
  ];

  const dataWithIds = Array.isArray(data)
    ? data.map((item, index) => ({ id: index + 1, ...item }))
    : [];

  return (
    <div className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-auto w-full">
      <div style={{ height: 480, width: "100%" }}>
        <DataGrid rows={dataWithIds} columns={columns} className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white" />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Do you really want to delete this item?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">No</Button>
          <Button onClick={handleConfirmDelete} color="primary">Yes</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default FeesDataTable;



// import React, { useState } from "react";
// import { DataGrid } from "@mui/x-data-grid";
// import { Link} from "react-router-dom";
// import IconButton from "@mui/material/IconButton";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import Dialog from "@mui/material/Dialog";
// import DialogActions from "@mui/material/DialogActions";
// import DialogContent from "@mui/material/DialogContent";
// import DialogContentText from "@mui/material/DialogContentText";
// import DialogTitle from "@mui/material/DialogTitle";
// import Button from "@mui/material/Button";
// import { useStateContext } from "../../../contexts/ContextProvider"

// function FeesDataTable({ data, handleDelete }) {
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [deletingItemId, setDeletingItemId] = useState(null);

//   const handleDeleteClick = (itemId) => {
//     setDeletingItemId(itemId);
//     setDeleteDialogOpen(true);
//   };

//   const handleConfirmDelete = () => {
//     handleDelete(deletingItemId);
//     setDeleteDialogOpen(false);
//     setDeletingItemId(null);
//   };

//   const handleCancelDelete = () => {
//     setDeleteDialogOpen(false);
//     setDeletingItemId(null);
//   };

//   const columns = [
//     { field: "id", headerName: "S. No.", width: 50 },
//     { field: "className", headerName: "Class", flex: 1 },
//     { field: "feeType", headerName: "FeeType", flex: 1 },
//     { field: "amount", headerName: "Amount", flex: 1 },
//     {
//       field: "actions",
//       headerName: "Actions",
//       flex: 1,
//       renderCell: (params) => {
//         return (
//           <div>
//             <Link to={`/admin/classwise/edit-fees/${params.row._id}`}>
//               <IconButton>
//                 <EditIcon 
//                className="text-cyan-600"
//               // style={{color:currentColor}}
//                 />
//               </IconButton>
//             </Link>
//             <IconButton onClick={() => handleDeleteClick(params.row._id)}>
//               <DeleteIcon className="text-red-600" />
//             </IconButton>
//           </div>
//         );
//       },
//     },
//   ];


//   const dataWithIds = Array.isArray(data)
//     ? data.map((item, index) => ({ id: index + 1, ...item }))
//     : [];

//   return (
//     // <div className="h-[350px] mx-auto bg-white mt-2 rounded-md">
//     <div className=" dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-auto w-full">
//     <div style={{ height: 480, width: "100%" }}>
//       <DataGrid rows={dataWithIds} columns={columns} className="dark:text-white dark:bg-secondary-dark-bg  mx-auto bg-white"/>
//       </div>
//       <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
//         <DialogTitle>Confirm Delete</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Do you really want to delete this item?
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCancelDelete} color="primary">
//             No
//           </Button>
//           <Button onClick={handleConfirmDelete} color="primary">
//             Yes
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// }

// export default FeesDataTable;