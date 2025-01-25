import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Button,
  ThemeProvider,
  Typography,
  CircularProgress,
} from "@mui/material";
import ReactJson from "react-json-view";
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
import F5Results from "./components/F5Results";

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
    setF5Results(null); // Clear Check F5

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
    setF5Results(null); // Clear Check F5

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

  const [f5Results, setF5Results] = useState(null);
  const [loadingF5, setLoadingF5] = useState("");

  const handleCheckF5 = async (fqdn) => {
    console.log("Starting Check F5 with FQDN:", fqdn);

    // Reset other states
    setResolvedFqdn(null); // Clear Resolve
    setCertFqdn(null); // Clear Get Cert
    setResolveResults(null); // Clear DNS Resolve results
    setCertResults(null); // Clear Cert results

    setLoadingF5(fqdn); // Set loading for Check F5

    try {
      const response = await fetch("http://localhost:5006/checkF5", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fqdn }),
      });

      if (!response.ok) {
        throw new Error(
          `API error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Check F5 data:", data);

      setF5Results({ fqdn, ...data });
    } catch (error) {
      console.error("Error checking F5:", error.message);
      setF5Results({ error: `Error: ${error.message}` });
    } finally {
      setLoadingF5(""); // Reset loading state
    }
  };

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
            {/* <CartBox
              cart={cart}
              themeMode={themeMode}
              onShowCollected={() => setShowCollected((prev) => !prev)}
              onSearchTermChange={handleSearchTermChange}
            /> */}
            
            <Header
              themeMode={themeMode}
              onThemeToggle={handleThemeToggle}
              cart={cart} // Pass cart state
              onShowCollected={() => setShowCollected((prev) => !prev)} // Pass handler for collected items
            />
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
                  loadingF5={loadingF5}
                  onCheckF5={handleCheckF5}
                  f5Results={f5Results} 
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
                      Reset Resolve
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
                      Reset Get Cert
                    </Button>
                  )}

                  {f5Results && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setF5Results(null); // Clear F5 results
                        setLoadingF5(""); // Reset F5 loading state
                      }}
                    >
                      Reset Check F5
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

            <F5Results f5Results={f5Results} themeMode={themeMode} />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default App;
