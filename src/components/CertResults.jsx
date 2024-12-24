import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
} from "@mui/material";

const CertResults = ({ certResults, onClose }) => {
  const [activeTab, setActiveTab] = useState("details");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!certResults) return null;

  const formatSansColumns = (sans) => {
    const columns = [];
    const maxItemsPerColumn = 30;
    for (let i = 0; i < sans.length; i += maxItemsPerColumn) {
      columns.push(sans.slice(i, i + maxItemsPerColumn));
    }
    return columns;
  };

  const sansColumns = certResults.sans
    ? formatSansColumns(certResults.sans)
    : [];
  const sansCount = certResults.sans ? certResults.sans.length : 0;

  return (
    <Box sx={{ width: "100%", marginTop: "20px" }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        centered
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Details" value="details" />
        <Tab label={`SANS (${sansCount})`} value="sans" />
        <Tab label="Raw PEM" value="pem" />
      </Tabs>

      <Card sx={{ marginTop: "20px" }}>
        <CardContent>
          {certResults.error ? (
            <Typography color="error" variant="h6">
              Error: {certResults.error}
            </Typography>
          ) : (
            <>
              {activeTab === "details" && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Certificate Details
                  </Typography>
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
                    <Typography>
                      <strong>Subject:</strong>{" "}
                      {JSON.stringify(certResults.subject, null, 2)}
                    </Typography>
                    <Typography>
                      <strong>Issuer:</strong>{" "}
                      {JSON.stringify(certResults.issuer, null, 2)}
                    </Typography>
                    <Typography>
                      <strong>Valid From:</strong> {certResults.validFrom}
                    </Typography>
                    <Typography>
                      <strong>Valid To:</strong> {certResults.validTo}
                    </Typography>
                    <Typography>
                      <strong>Serial Number:</strong> {certResults.serialNumber}
                    </Typography>
                  </Box>
                </Box>
              )}
              {activeTab === "sans" && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Subject Alternative Names (SANS)
                  </Typography>
                  {sansColumns.length > 0 ? (
                    <Grid container spacing={2}>
                      {sansColumns.map((column, columnIndex) => (
                        <Grid item xs={12} sm={6} md={4} key={columnIndex}>
                          {column.map((san, index) => (
                            <Box
                              key={index}
                              sx={{
                                backgroundColor: (theme) =>
                                  theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(0, 0, 0, 0.02)",
                                padding: "8px",
                                borderRadius: "4px",
                                marginBottom: "8px",
                                wordBreak: "break-word",
                              }}
                            >
                              {san}
                            </Box>
                          ))}
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography>
                      No Subject Alternative Names available.
                    </Typography>
                  )}
                </Box>
              )}
              {activeTab === "pem" && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Raw PEM
                  </Typography>
                  <Typography
                    sx={{
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.02)",
                      padding: "10px",
                      borderRadius: "5px",
                      marginTop: "10px",
                    }}
                  >
                    {certResults.pemEncoded}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CertResults;
