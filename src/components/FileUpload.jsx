import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { handleFileRead } from "../utils/fileHandlers";

const FileUpload = ({ onFileUpload, error }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      onFileUpload(null, null, "Please upload a valid file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      handleFileRead(
        e.target.result,
        (jsonData, columns) => onFileUpload(jsonData, columns, ""),
        (error) => onFileUpload(null, null, error)
      );
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "800px",
        textAlign: "center",
        marginBottom: "20px",
      }}
    >
      <Button
        variant="contained"
        component="label"
        sx={{ marginBottom: "20px" }}
      >
        Upload Spreadsheet
        <input
          type="file"
          hidden
          accept=".xlsx, .xls"
          onChange={handleFileChange}
        />
      </Button>
      {error && (
        <Typography color="error" sx={{ marginTop: "10px" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;
