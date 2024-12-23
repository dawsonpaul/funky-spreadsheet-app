import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab, Card, CardContent, Typography } from "@mui/material";

const DnsResults = ({
  resolveResults,
  activeTab,
  activeRecordTab,
  onTabChange,
  onRecordTabChange,
}) => {
  const [validRecordTypes, setValidRecordTypes] = useState([]);

  // Debug to log received resolveResults
  useEffect(() => {
    console.log("resolveResults received by DnsResults:", resolveResults);
  }, [resolveResults]);

  // Determine valid record types based on resolveResults
  useEffect(() => {
    if (resolveResults && resolveResults[activeTab]) {
      const types = Object.keys(resolveResults[activeTab]).filter((type) => {
        const records = resolveResults[activeTab][type];
        // Include all arrays even if they are empty
        return type !== "Stats" && Array.isArray(records);
      });

      setValidRecordTypes(types);

      // Ensure activeRecordTab defaults to a valid type
      if (types.length > 0 && !types.includes(activeRecordTab)) {
        onRecordTabChange(types[0]); // Default to the first valid record type
      }
    }
  }, [resolveResults, activeTab, activeRecordTab, onRecordTabChange]);

  // Render individual DNS records
  const renderRecordData = (record, index) => {
    if (!record || typeof record !== "object") return null;

    return (
      <Box
        key={index}
        sx={{
          marginBottom: "10px",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.02)",
          padding: 2,
          borderRadius: 1,
        }}
      >
        {record.name && (
          <Typography>
            <strong>Name:</strong> {record.name}
          </Typography>
        )}
        {record.ttl && (
          <Typography>
            <strong>TTL:</strong> {record.ttl}
          </Typography>
        )}
        {record.type && (
          <Typography>
            <strong>Type:</strong> {record.type}
          </Typography>
        )}
        {record.value && (
          <Typography
            sx={{
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            <strong>Value:</strong> {record.value}
          </Typography>
        )}
      </Box>
    );
  };

  if (!resolveResults) {
    return (
      <Typography sx={{ marginTop: "20px" }}>
        No data available. Please resolve an FQDN.
      </Typography>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: "800px", marginTop: "20px" }}>
      {/* Tab navigation for internal and external DNS */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => onTabChange(newValue)}
        centered
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Internal DNS" value="internal" />
        <Tab label="External DNS" value="external" />
      </Tabs>

      {/* DNS records rendering */}
      {resolveResults[activeTab] ? (
        <Box>
          {validRecordTypes.length > 0 ? (
            <>
              <Tabs
                value={activeRecordTab}
                onChange={(e, newValue) => onRecordTabChange(newValue)}
                centered
                indicatorColor="primary"
                textColor="primary"
                sx={{ marginTop: "20px" }}
              >
                {validRecordTypes.map((recordType) => (
                  <Tab key={recordType} label={recordType} value={recordType} />
                ))}
              </Tabs>

              <Card sx={{ marginTop: "20px" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {activeRecordTab} Records ({activeTab})
                  </Typography>
                  {resolveResults[activeTab][activeRecordTab]?.length > 0 ? (
                    resolveResults[activeTab][activeRecordTab].map(
                      (record, index) => renderRecordData(record, index)
                    )
                  ) : (
                    <Typography>No records available for this type.</Typography>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card sx={{ marginTop: "20px" }}>
              <CardContent>
                <Typography>
                  No DNS records found for {activeTab} DNS.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      ) : (
        <Typography sx={{ marginTop: "20px" }}>
          No data available for {activeTab} DNS.
        </Typography>
      )}
    </Box>
  );
};

export default DnsResults;
