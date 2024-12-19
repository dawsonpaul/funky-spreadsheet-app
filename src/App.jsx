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
  const [cart, setCart] = useState([]);
  const [resolvedFqdn, setResolvedFqdn] = useState(null);

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
    setResolvedFqdn(fqdn); // Filter table to show only the resolving FQDN immediately
    setLoadingFqdn(fqdn); // Set the currently loading FQDN
    try {
      const response = await axios.post("http://localhost:5005/resolve", {
        fqdn,
      });
      setResolveResults(response.data); // Store the resolve results
    } catch (error) {
      console.error("Error resolving FQDN:", error);
      setResolveResults({
        error: "Failed to resolve the FQDN. Please try again.",
      });
    } finally {
      setLoadingFqdn(""); // Ensure button state is reset
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

  const handleCollect = (row) => {
    setCart((prevCart) => {
      // Check if the row is already in the cart
      const isAlreadyCollected = prevCart.some(
        (item) => item.FQDN === row.FQDN
      );
      if (isAlreadyCollected) {
        // Remove the row from the cart
        return prevCart.filter((item) => item.FQDN !== row.FQDN);
      } else {
        // Add the row to the cart
        return [...prevCart, row];
      }
    });
  };

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

  const handleDownloadCart = () => {
    const blob = new Blob([JSON.stringify(cart, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "collected_rows.json";
    link.click();
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
        {/* Cart Box */}
        <Box
          sx={{
            position: "absolute",
            top: "20px",
            right: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: themeMode === "dark" ? "#2c2c2c" : "#f5f5f5", // Dark gray in dark mode, light gray in light mode
            padding: "10px 20px",
            borderRadius: "20px",
            boxShadow:
              themeMode === "dark"
                ? "0 4px 8px rgba(0, 0, 0, 0.6)" // Darker shadow in dark mode
                : "0 4px 8px rgba(0, 0, 0, 0.2)", // Subtle shadow in light mode
          }}
        >
          <Typography
            sx={{ color: themeMode === "light" ? "#1976d2" : "#90caf9" }}
          >
            {cart.length} Collected
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleDownloadCart}
            sx={{
              color: themeMode === "light" ? "#1976d2" : "#90caf9", // Text color: Blue in both modes
              borderColor: themeMode === "light" ? "#1976d2" : "#90caf9", // Border color: Blue in both modes
              backgroundColor: "transparent", // No background for the button
            }}
          >
            <span role="img" aria-label="Cart">
              🛒
            </span>
          </Button>
        </Box>

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
                <InputLabel id="search-column-label">
                  Search By Column
                </InputLabel>
                <Select
                  labelId="search-column-label"
                  label="Search By Column"
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

            {resolvedFqdn && (
              <Button
                sx={{ marginBottom: "20px" }}
                variant="outlined"
                onClick={() => {
                  setResolvedFqdn(null);
                  setResolveResults(null); // Clear the DNS results
                  setLoadingFqdn(""); // Ensure loading state is cleared
                }}
              >
                Reset
              </Button>
            )}

            {/* Results Table */}
            {/* Results Table */}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>FQDN</TableCell>
                  <TableCell>Collection</TableCell>
                  <TableCell>DNS Query</TableCell>{" "}
                  {/* For Collect and Resolve */}
                  {columns
                    .filter((col) => col !== "FQDN") // Exclude FQDN
                    .map((col, index) => (
                      <TableCell key={index}>{col}</TableCell>
                    ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {resolvedFqdn
                  ? filteredData
                      .filter((row) => row.FQDN === resolvedFqdn) // Filter by resolved FQDN
                      .map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          <TableCell>{row.FQDN}</TableCell>

                          {/* Collect Button */}
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleCollect(row)}
                              sx={{
                                backgroundColor:
                                  themeMode === "light" ? "#1976d2" : "#90caf9",
                                color: themeMode === "light" ? "#fff" : "#000",
                              }}
                            >
                              {cart.some((item) => item.FQDN === row.FQDN)
                                ? "Remove"
                                : "Collect"}
                            </Button>
                          </TableCell>

                          {/* Resolve Button */}
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleResolve(row.FQDN)}
                              disabled={loadingFqdn === row.FQDN} // Disable only the resolving FQDN
                              sx={{
                                backgroundColor:
                                  loadingFqdn === row.FQDN
                                    ? themeMode === "light"
                                      ? "#e0e0e0" // Light grey while resolving
                                      : "#424242" // Dark grey while resolving
                                    : themeMode === "light"
                                    ? "#1976d2" // Regular blue in light mode
                                    : "#90caf9", // Regular light blue in dark mode
                                color:
                                  loadingFqdn === row.FQDN
                                    ? themeMode === "light"
                                      ? "#000" // Black text while resolving
                                      : "#fff" // White text while resolving
                                    : "#fff", // Regular white text
                              }}
                            >
                              {loadingFqdn === row.FQDN ? (
                                <CircularProgress size={20} color="inherit" /> // Show spinner while resolving
                              ) : (
                                "Resolve"
                              )}
                            </Button>
                          </TableCell>

                          {/* Other Columns */}
                          {columns
                            .filter((col) => col !== "FQDN")
                            .map((col, colIndex) => (
                              <TableCell key={colIndex}>{row[col]}</TableCell>
                            ))}
                        </TableRow>
                      ))
                  : filteredData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        <TableCell>{row.FQDN}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleCollect(row)}
                            sx={{
                              backgroundColor:
                                themeMode === "light" ? "#1976d2" : "#90caf9",
                              color: themeMode === "light" ? "#fff" : "#000",
                            }}
                          >
                            {cart.some((item) => item.FQDN === row.FQDN)
                              ? "Remove"
                              : "Collect"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleResolve(row.FQDN)}
                            disabled={loadingFqdn === row.FQDN} // Disable only the resolving FQDN
                            sx={{
                              backgroundColor:
                                loadingFqdn === row.FQDN
                                  ? themeMode === "light"
                                    ? "#e0e0e0" // Light grey while resolving
                                    : "#424242" // Dark grey while resolving
                                  : themeMode === "light"
                                  ? "#1976d2" // Regular blue in light mode
                                  : "#90caf9", // Regular light blue in dark mode
                              color:
                                loadingFqdn === row.FQDN
                                  ? themeMode === "light"
                                    ? "#000" // Black text while resolving
                                    : "#fff" // White text while resolving
                                  : "#fff", // Regular white text
                            }}
                          >
                            {loadingFqdn === row.FQDN ? (
                              <CircularProgress size={20} color="inherit" /> // Show spinner while resolving
                            ) : (
                              "Resolve"
                            )}
                          </Button>
                        </TableCell>
                        {columns
                          .filter((col) => col !== "FQDN")
                          .map((col, colIndex) => (
                            <TableCell key={colIndex}>{row[col]}</TableCell>
                          ))}
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
                    <Tab
                      key={recordType}
                      label={recordType}
                      value={recordType}
                    />
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
