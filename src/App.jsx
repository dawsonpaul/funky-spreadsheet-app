import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Button,
  ThemeProvider,
  Typography,
  CircularProgress,
} from "@mui/material";
import { lightTheme, darkTheme } from "./themes/themes.js";
import Header from "./components/Header";
import CartBox from "./components/CartBox";
import FileUpload from "./components/FileUpload";
import SearchSection from "./components/SearchSection";
import ResultsTable from "./components/ResultsTable";
import DnsResults from "./components/DnsResults";
import ColumnManager from "./components/ColumnManager";
import CertResults from "./components/CertResults.jsx";
import { handleFileRead } from "./utils/fileHandlers";

const DEFAULT_FILE_PATH = "../example.xlsx";

const App = () => {
  const [themeMode, setThemeMode] = useState("light");
  const [fqdnData, setFqdnData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [resolveResults, setResolveResults] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Progress bar
  const [activeTab, setActiveTab] = useState("internal");
  const [activeRecordTab, setActiveRecordTab] = useState("A");
  const [cart, setCart] = useState([]);
  const [showCollected, setShowCollected] = useState(false);
  const [loadingFqdn, setLoadingFqdn] = useState("");
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [certResults, setCertResults] = useState(null);
  const [loadingCert, setLoadingCert] = useState("");
  const [resolvedFqdn, setResolvedFqdn] = useState(null); // For DNS Resolve
  const [certFqdn, setCertFqdn] = useState(null); // For Get Cert

  // Load default data on mount
  useEffect(() => {
    setLoading(true);
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
              setSelectedColumn("FQDN");
              setVisibleColumns(
                newColumns.filter(
                  (col) =>
                    col === "FQDN" ||
                    col === "APPID" ||
                    col.toLowerCase().includes("name") ||
                    col.toLowerCase().includes("email")
                )
              );
              setLoading(false);
            },
            (err) => {
              setError(err);
              setLoading(false);
            }
          );
        };
        reader.readAsBinaryString(blob);
      })
      .catch(() => {
        setError("Failed to load the default file.");
        setLoading(false);
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
      setSelectedColumn("FQDN");
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
    setResolvedFqdn(fqdn); // Set resolved FQDN
    setCertFqdn(null); // Reset certFqdn when resolving
    setCertResults(null); // Clear cert results
    setLoadingFqdn(fqdn); // Show loading spinner for this FQDN
    try {
      const response = await fetch("http://localhost:5005/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fqdn }),
      });
      const data = await response.json();

      // Set resolve results
      setResolveResults(data);
    } catch (error) {
      console.error("Error resolving DNS:", error);
      setResolveResults(null);
    } finally {
      setLoadingFqdn(""); // Reset loading state
    }
  };

  const handleFetchCert = async (fqdn) => {
    setCertFqdn(fqdn); // Set cert FQDN
    setResolvedFqdn(null); // Reset resolvedFqdn when fetching cert
    setResolveResults(null); // Clear resolve results
    setLoadingCert(fqdn); // Show loading spinner for this FQDN
    const timeout = 10000; // Timeout in milliseconds (10 seconds)

    try {
      const response = await Promise.race([
        fetch(`http://localhost:5005/getCertificate?domain=${fqdn}`),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out")), timeout)
        ),
      ]);

      if (!response.ok) {
        throw new Error(`Failed to fetch certificate: ${response.statusText}`);
      }

      const certData = await response.json();
      console.log("Certificate fetched:", certData);
      setCertResults(certData); // Update state with fetched certificate
    } catch (error) {
      console.error("Error fetching certificate:", error.message);
      setCertResults({ error: error.message }); // Display error message in certResults
    } finally {
      setLoadingCert(""); // Reset loading state
    }
  };

  const handleCollect = (row) => {
    setCart((prevCart) => {
      const isAlreadyCollected = prevCart.some(
        (item) => item.uniqueId === row.uniqueId
      );
      return isAlreadyCollected
        ? prevCart.filter((item) => item.uniqueId !== row.uniqueId)
        : [...prevCart, row];
    });
  };

  useEffect(() => {
    console.log("Updated visibleColumns:", visibleColumns);
  }, [visibleColumns]);

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
        {loading ? (
          <Box
            sx={{
              display: "flex",
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
              Loading FQDN and EIM data...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxWidth: "1600px", width: "100%", margin: "0 auto" }}>
            <CartBox
              cart={cart}
              themeMode={themeMode}
              onShowCollected={() => setShowCollected((prev) => !prev)}
              onSearchTermChange={handleSearchTermChange}
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
                  onSearchTermChange={setSearchTerm}
                />

                <ColumnManager
                  allColumns={columns}
                  visibleColumns={visibleColumns}
                  onColumnChange={setVisibleColumns}
                  defaultColumns={defaultColumns}
                />

                <ResultsTable
                  visibleColumns={visibleColumns}
                  columns={visibleColumns}
                  filteredData={filteredData}
                  resolvedFqdn={resolvedFqdn}
                  showCollected={showCollected}
                  cart={cart}
                  loadingFqdn={loadingFqdn}
                  loadingCert={loadingCert}
                  themeMode={themeMode}
                  onResolve={handleResolve}
                  onFetchCert={handleFetchCert}
                  onCollect={handleCollect}
                  certFqdn={certFqdn}
                />

                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                  }}
                >
                  {resolvedFqdn && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setResolvedFqdn(null); // Clear DNS Resolve state
                        setResolveResults(null);
                        setLoadingFqdn("");
                      }}
                    >
                      Reset FQDN
                    </Button>
                  )}

                  {certFqdn && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setCertFqdn(null); // Clear Cert state
                        setCertResults(null);
                      }}
                    >
                      Reset Cert
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            <DnsResults
              resolveResults={resolveResults}
              activeTab={activeTab}
              activeRecordTab={activeRecordTab}
              onTabChange={setActiveTab}
              onRecordTabChange={setActiveRecordTab}
            />

            <CertResults
              certResults={certResults}
              onClose={() => setCertResults(null)}
            />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default App;
