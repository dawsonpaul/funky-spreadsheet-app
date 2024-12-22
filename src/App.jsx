import React, { useState, useMemo } from "react";
import { Box, Button, ThemeProvider } from "@mui/material";
import { lightTheme, darkTheme } from "./themes/themes.js";
import { resolveFqdn } from "./utils/dnsHelpers";
import Header from "./components/Header";
import CartBox from "./components/CartBox";
import FileUpload from "./components/FileUpload";
import SearchSection from "./components/SearchSection";
import ResultsTable from "./components/ResultsTable";
import DnsResults from "./components/DnsResults";
import ColumnManager from "./components/ColumnManager";

const App = () => {
  const [themeMode, setThemeMode] = useState("light");
  const [fqdnData, setFqdnData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [resolveResults, setResolveResults] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("internal");
  const [activeRecordTab, setActiveRecordTab] = useState("A");
  const [cart, setCart] = useState([]);
  const [resolvedFqdn, setResolvedFqdn] = useState(null);
  const [showCollected, setShowCollected] = useState(false);
  const [loadingFqdn, setLoadingFqdn] = useState("");
  const [visibleColumns, setVisibleColumns] = useState([]);

  // Determine default and available columns
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
      setSelectedColumn(newColumns[0]);

      // Set initial visible columns
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

  // Memoized filtered data
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
          alignItems: "center",
          backgroundColor: themeMode === "light" ? "#f5f5f5" : "#121212",
          padding: "20px",
        }}
      >
        <CartBox
          cart={cart}
          themeMode={themeMode}
          onShowCollected={() => setShowCollected((prev) => !prev)}
        />

        <Header themeMode={themeMode} onThemeToggle={handleThemeToggle} />

        <FileUpload onFileUpload={handleFileUpload} error={error} />

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
                sx={{ marginBottom: "20px" }}
                variant="outlined"
                onClick={() => {
                  setResolvedFqdn(null);
                  setResolveResults(null);
                  setLoadingFqdn("");
                }}
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
    </ThemeProvider>
  );
};

export default App;
