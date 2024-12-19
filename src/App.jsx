import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { CircularProgress } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  ThemeProvider,
  createTheme,
} from "@mui/material";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#d32f2f" },
    background: { default: "#f5f5f5" },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" },
    secondary: { main: "#f48fb1" },
    background: { default: "#121212" },
  },
});

const App = () => {
  const [themeMode, setThemeMode] = useState("light");
  const [fqdnData, setFqdnData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [resolveResults, setResolveResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("internal");
  const [activeRecordTab, setActiveRecordTab] = useState("A");

  const handleThemeToggle = () => {
    setThemeMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const handleFileUpload = (event) => {
    setError("");
    const file = event.target.files[0];
    if (!file) {
      setError("Please upload a valid file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (jsonData.length === 0) {
          setError("The file is empty or invalid.");
          return;
        }

        setColumns(Object.keys(jsonData[0]));
        setSelectedColumn(Object.keys(jsonData[0])[0]);
        setFqdnData(jsonData);
      } catch (err) {
        setError("Failed to parse the file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const [loadingFqdn, setLoadingFqdn] = useState(""); // Track which FQDN is being resolved

  const handleResolve = async (fqdn) => {
    setLoadingFqdn(fqdn); // Set the currently resolving FQDN
    try {
      const response = await axios.post("http://localhost:5005/resolve", {
        fqdn,
      });
      setResolveResults(response.data);
    } catch (error) {
      console.error("Error resolving FQDN:", error);
      setResolveResults({
        error: "Failed to resolve the FQDN. Please try again.",
      });
    } finally {
      setLoadingFqdn(""); // Clear the loader for the resolved FQDN
    }
  };

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
    setResolveResults(null); // Clear DNS results when starting a new search
  };

  const filteredData =
    searchTerm.length > 2
      ? fqdnData.filter((row) =>
          selectedColumn
            ? row[selectedColumn]
                ?.toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            : true
        )
      : [];

  const renderDnsRecords = (recordType, records) => {
    if (!records || records.error) {
      return (
        <Typography>
          No {recordType} records found or failed to resolve.
        </Typography>
      );
    }

    return records.map((record, index) => (
      <Box key={index} sx={{ marginBottom: "10px" }}>
        <Typography>Name: {record.name}</Typography>
        <Typography>TTL: {record.ttl}</Typography>
        <Typography>Type: {record.type}</Typography>
        <Typography>Value: {record.value}</Typography>
        <hr />
      </Box>
    ));
  };

  return (
      <ThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
        <Box
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            backgroundColor: themeMode === "light" ? "#f5f5f5" : "#121212",
            padding: "20px",
          }}
        >
          {/* Heading Section */}
          <Box
            sx={{
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: themeMode === "light" ? "#1976d2" : "#90caf9",
              }}
            >
              FQDN Resolver
            </Typography>
    
            <FormControlLabel
              control={
                <Switch
                  checked={themeMode === "dark"}
                  onChange={handleThemeToggle}
                />
              }
              label="Dark Mode"
              sx={{
                color: themeMode === "light" ? "#1976d2" : "#90caf9",
              }}
            />
          </Box>
    
          {/* Upload Section */}
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
                onChange={handleFileUpload}
              />
            </Button>
            {error && (
              <Typography color="error" sx={{ marginTop: "10px" }}>
                {error}
              </Typography>
            )}
          </Box>
    
          {/* Search and Results Section */}
          {fqdnData.length > 0 && (
            <Box
              sx={{
                width: "100%",
                maxWidth: "800px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Search Section */}
              <Box
                sx={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  width: "100%",
                  marginBottom: "20px",
                }}
              >
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Search By Column</InputLabel>
                  <Select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                  >
                    {columns.map((col) => (
                      <MenuItem key={col} value={col}>
                        {col}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  sx={{ flex: 2 }}
                  placeholder="Enter search term"
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                />
              </Box>
    
              {/* Results Table */}
              <Table>
                <TableHead>
                  <TableRow>
                    {columns.map((col, index) => (
                      <TableCell key={index}>{col}</TableCell>
                    ))}
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((col, colIndex) => (
                        <TableCell key={colIndex}>{row[col]}</TableCell>
                      ))}
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleResolve(row.FQDN)}
                            disabled={loadingFqdn === row.FQDN}
                          >
                            {loadingFqdn === row.FQDN ? (
                              <CircularProgress size={20} />
                            ) : (
                              "Resolve"
                            )}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
    
          {/* Results Section */}
          {resolveResults && (
            <Box sx={{ width: "100%", maxWidth: "800px", marginTop: "20px" }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                centered
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Internal DNS" value="internal" />
                <Tab label="External DNS" value="external" />
              </Tabs>
    
              {resolveResults[activeTab] ? (
                <Box>
                  <Tabs
                    value={activeRecordTab}
                    onChange={(e, newValue) => setActiveRecordTab(newValue)}
                    centered
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{ marginTop: "20px" }}
                  >
                    {Object.keys(resolveResults[activeTab]).map((recordType) => (
                      <Tab key={recordType} label={recordType} value={recordType} />
                    ))}
                  </Tabs>
    
                  <Card sx={{ marginTop: "20px", padding: "20px" }}>
                    <CardContent>
                      <Typography variant="h6">
                        {activeRecordTab} Records ({activeTab})
                      </Typography>
                      {resolveResults[activeTab][activeRecordTab]?.length > 0 ? (
                        resolveResults[activeTab][activeRecordTab].map(
                          (record, index) => (
                            <Box key={index} sx={{ marginBottom: "10px" }}>
                              <Typography>Name: {record.name}</Typography>
                              <Typography>TTL: {record.ttl}</Typography>
                              <Typography>Type: {record.type}</Typography>
                              <Typography>Value: {record.value}</Typography>
                              <hr />
                            </Box>
                          )
                        )
                      ) : (
                        <Typography>
                          No {activeRecordTab} records found or failed to resolve.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              ) : (
                <Typography sx={{ marginTop: "20px" }}>
                  No data available for {activeTab} DNS.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </ThemeProvider>
    );
    
};

export default App;
