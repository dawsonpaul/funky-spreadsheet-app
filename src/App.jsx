import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Button,
  ThemeProvider,
  Typography,
  CircularProgress,
} from "@mui/material";
import { lightTheme, darkTheme } from "./themes/themes.js";
import { resolveFqdn } from "./utils/dnsHelpers";
import Header from "./components/Header";
import CartBox from "./components/CartBox";
import FileUpload from "./components/FileUpload";
import SearchSection from "./components/SearchSection";
import ResultsTable from "./components/ResultsTable";
import DnsResults from "./components/DnsResults";
import ColumnManager from "./components/ColumnManager";
import { handleFileRead } from "./utils/fileHandlers";

const DEFAULT_FILE_PATH = "../dummy_data_200_rows.xlsx";

const App = () => {
  const [themeMode, setThemeMode] = useState("light");
  const [fqdnData, setFqdnData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [resolveResults, setResolveResults] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Added for progress bar
  const [activeTab, setActiveTab] = useState("internal");
  const [activeRecordTab, setActiveRecordTab] = useState("A");
  const [cart, setCart] = useState([]);
  const [resolvedFqdn, setResolvedFqdn] = useState(null);
  const [showCollected, setShowCollected] = useState(false);
  const [loadingFqdn, setLoadingFqdn] = useState("");
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  // Load default data on mount
  useEffect(() => {
    setLoading(true); // Ensure loader is immediately visible
    fetch(DEFAULT_FILE_PATH)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          handleFileRead(
            e.target.result,
            (jsonData, newColumns) => {
              setFqdnData(jsonData);
              setColumns(newColumns);
              setSelectedColumn("FQDN"); // Ensure FQDN is selected by default
              setVisibleColumns(
                newColumns.filter(
                  (col) =>
                    col === "FQDN" ||
                    col === "APPID" ||
                    col.toLowerCase().includes("name") ||
                    col.toLowerCase().includes("email")
                )
              );
              setLoading(false); // Stop loading after data is processed
            },
            (err) => {
              setError(err);
              setLoading(false); // Stop loading even on error
            }
          );
        };
        reader.readAsBinaryString(blob);
      })
      .catch(() => {
        setError("Failed to load the default file.");
        setLoading(false); // Stop loading even on fetch failure
      });
  }, []);

  const defaultColumns = useMemo(() => {
    if (!columns.length) return [];
    return columns.filter(
      (col) =>
        col === "FQDN" ||
        col === "APPID" ||
        col.toLowerCase().includes("name") ||
        col.toLowerCase().includes("email")
    );
  }, [columns]);

  const handleThemeToggle = () => {
    setThemeMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const handleFileUpload = (jsonData, newColumns, errorMessage) => {
    setError(errorMessage);
    if (jsonData && newColumns) {
      setFqdnData(jsonData);
      setColumns(newColumns);
      setSelectedColumn("FQDN"); // Ensure FQDN is selected by default

      const initialVisibleColumns = newColumns.filter(
        (col) =>
          col === "FQDN" ||
          col === "APPID" ||
          col.toLowerCase().includes("name") ||
          col.toLowerCase().includes("email")
      );
      setVisibleColumns(initialVisibleColumns);
    }
  };

  const handleResolve = async (fqdn) => {
    setResolvedFqdn(fqdn);
    setLoadingFqdn(fqdn);
    const results = await resolveFqdn(fqdn);
    setResolveResults(results);
    setLoadingFqdn("");
  };

  const handleCollect = (row) => {
    setCart((prevCart) => {
      const isAlreadyCollected = prevCart.some(
        (item) => item.FQDN === row.FQDN
      );
      return isAlreadyCollected
        ? prevCart.filter((item) => item.FQDN !== row.FQDN)
        : [...prevCart, row];
    });
  };

  const handleSearchTermChange = (value) => {
    setSearchTerm(value);
    setResolveResults(null);
  };

  const filteredData = useMemo(() => {
    if (searchTerm.length < 3) return [];

    return fqdnData.filter((row) => {
      if (!selectedColumn || !row[selectedColumn]) return false;
      const value = row[selectedColumn].toString().toLowerCase();
      const search = searchTerm.toLowerCase();
      return value.includes(search);
    });
  }, [fqdnData, selectedColumn, searchTerm]);

  return (
    <ThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
      <Box
        sx={{
          width: "100vw",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: themeMode === "light" ? "#f5f5f5" : "#121212",
          padding: "20px",
        }}
      >
        {loading ? ( // Show progress bar while loading
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: themeMode === "light" ? "#f5f5f5" : "#121212",
              zIndex: 9999,
            }}
          >
            <CircularProgress />
            <Typography sx={{ marginTop: "10px" }}>
              Loading FQDN and EIM data ...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
            <CartBox
              cart={cart}
              themeMode={themeMode}
              onShowCollected={() => setShowCollected((prev) => !prev)}
            />

            <Header themeMode={themeMode} onThemeToggle={handleThemeToggle} />

            <FileUpload onFileUpload={handleFileUpload} error={error} />

            {fqdnData.length > 0 && (
              <Box>
                <SearchSection
                  columns={columns}
                  selectedColumn={selectedColumn}
                  searchTerm={searchTerm}
                  onColumnChange={setSelectedColumn}
                  onSearchTermChange={handleSearchTermChange}
                />

                <ColumnManager
                  allColumns={columns}
                  visibleColumns={visibleColumns}
                  onColumnChange={setVisibleColumns}
                  defaultColumns={defaultColumns}
                />

                {resolvedFqdn && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setResolvedFqdn(null);
                      setResolveResults(null);
                      setLoadingFqdn("");
                    }}
                    sx={{ mb: 2 }}
                  >
                    Reset
                  </Button>
                )}

                <ResultsTable
                  columns={visibleColumns}
                  filteredData={filteredData}
                  resolvedFqdn={resolvedFqdn}
                  showCollected={showCollected}
                  cart={cart}
                  loadingFqdn={loadingFqdn}
                  themeMode={themeMode}
                  onCollect={handleCollect}
                  onResolve={handleResolve}
                />
              </Box>
            )}

            <DnsResults
              resolveResults={resolveResults}
              activeTab={activeTab}
              activeRecordTab={activeRecordTab}
              onTabChange={setActiveTab}
              onRecordTabChange={setActiveRecordTab}
            />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default App;
