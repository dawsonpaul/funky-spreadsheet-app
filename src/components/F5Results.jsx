import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import ReactJson from "react-json-view";

const F5Results = ({ f5Results, themeMode, onClose }) => {
  if (!f5Results) return null;

  return (
    <Box sx={{ width: "100%", marginTop: "20px" }}>
      <Card>
        <CardContent>
          {f5Results.error ? (
            <Typography color="error" variant="h6">
              Error: {f5Results.error}
            </Typography>
          ) : (
            <>
              {/* Title */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                F5 Check Results
              </Typography>

              {/* JSON Viewer */}
              <Box
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.02)",
                  padding: "10px",
                  borderRadius: "4px",
                }}
              >
                <ReactJson
                  src={f5Results} // Pass the F5 results JSON
                  name={false} // Disable root name
                  theme={themeMode === "light" ? "solarized" : "monokai"} // Dynamic theme
                  enableClipboard={true} // Enable copy-to-clipboard
                  displayDataTypes={false} // Hide data types
                  collapsed={1} // Collapse nested objects by default
                  style={{ fontSize: "16px" }} // Adjust font size
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default F5Results;
