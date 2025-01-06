import React, { useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  TablePagination,
  Box,
  Typography,
  Tooltip,
  Checkbox,
} from "@mui/material";
import EmailHoverMenu from "./EmailHoverMenu";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const tableCellStyles = {
  checkbox: {
    width: "48px",
    padding: "0 8px",
  },
  fqdn: {
    whiteSpace: "nowrap",
    position: "relative",
    userSelect: "text",
  },
  standard: {
    whiteSpace: "nowrap",
    position: "relative",
    userSelect: "text",
    padding: "0 8px",
  },
  action: {
    padding: "8px",
  },
  resizeHandle: {
    position: "absolute",
    right: 0,
    top: 0,
    height: "100%",
    width: "4px",
    cursor: "col-resize",
    "&:hover": {
      backgroundColor: "#90caf9",
    },
  },
};

const createUniqueId = (row, index) => {
  return `${row.FQDN}_${index}`;
};

const ResultsTable = ({
  columns,
  filteredData,
  resolvedFqdn,
  showCollected,
  cart,
  loadingFqdn,
  loadingCert,
  themeMode,
  onCollect,
  onResolve,
  onFetchCert,
  certFqdn,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  const [copiedRow, setCopiedRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [columnWidths, setColumnWidths] = useState({});
  const resizingColumn = useRef(null);
  const startX = useRef(null);
  const startWidth = useRef(null);
  const [columnFilters, setColumnFilters] = useState({});

  const handleResizeStart = (e, columnId) => {
    resizingColumn.current = columnId;
    startX.current = e.pageX;
    const currentWidth =
      columnWidths[columnId] || (columnId === "FQDN" ? 300 : 200);
    startWidth.current = currentWidth;

    const handleResizeMove = (e) => {
      if (resizingColumn.current) {
        const diff = e.pageX - startX.current;
        const newWidth = Math.max(startWidth.current + diff, 50); // Minimum 50px
        setColumnWidths((prev) => ({
          ...prev,
          [resizingColumn.current]: newWidth,
        }));
      }
    };

    const handleResizeEnd = () => {
      resizingColumn.current = null;
      startX.current = null;
      startWidth.current = null;
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const getColumnStyle = (columnId) => {
    const baseStyle =
      columnId === "FQDN" ? tableCellStyles.fqdn : tableCellStyles.standard;

    return {
      ...baseStyle,
      width: columnWidths[columnId] || baseStyle.width || baseStyle.minWidth,
    };
  };

  const displayData = filteredData
    .filter((row) => {
      // Apply column filters
      return Object.keys(columnFilters).every((col) =>
        row[col]
          ?.toString()
          .toLowerCase()
          .includes(columnFilters[col].toLowerCase())
      );
    })
    .filter((row) => {
      // Apply resolvedFqdn or certFqdn filter if set
      if (resolvedFqdn) return row.FQDN === resolvedFqdn;
      if (certFqdn) return row.FQDN === certFqdn;
      return true;
    })
    .filter((row) => {
      // Apply cart filter if showing collected rows
      return !showCollected || cart.some((item) => item.FQDN === row.FQDN);
    })
    .map((row, index) => ({
      ...row,
      uniqueId: createUniqueId(row, index),
    }));

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      // Add all unique IDs from the paginated data to the selected rows
      const pageUniqueIds = paginatedData.map((row) => row.uniqueId);
      setSelectedRows((prev) => [...new Set([...prev, ...pageUniqueIds])]);

      // Add all paginated rows to the cart
      paginatedData.forEach((row) => {
        if (!cart.some((item) => item.uniqueId === row.uniqueId)) {
          onCollect(row);
        }
      });
    } else {
      // Remove all paginated rows from the selected rows
      const pageUniqueIds = paginatedData.map((row) => row.uniqueId);
      setSelectedRows((prev) =>
        prev.filter((id) => !pageUniqueIds.includes(id))
      );

      // Remove all paginated rows from the cart
      paginatedData.forEach((row) => {
        if (cart.some((item) => item.uniqueId === row.uniqueId)) {
          onCollect(row);
        }
      });
    }
  };

  const handleSelectRow = (event, row) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      // Add the row to the selected state and cart if it's not already there
      if (!selectedRows.includes(row.uniqueId)) {
        setSelectedRows((prev) => [...prev, row.uniqueId]);
        onCollect(row);
      }
    } else {
      // Remove the row from the selected state and cart
      setSelectedRows((prev) => prev.filter((id) => id !== row.uniqueId));
      onCollect(row, true); // Pass a flag indicating removal
    }
  };

  const totalRows = displayData.length;
  const paginatedData = displayData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCopyRow = (row) => {
    const rowValues = ["FQDN", ...columns.filter((col) => col !== "FQDN")]
      .map((col) => row[col])
      .join("\t");

    navigator.clipboard
      .writeText(rowValues)
      .then(() => {
        setCopiedRow(row.FQDN);
        setTimeout(() => setCopiedRow(null), 2000);
      })
      .catch((err) => console.error("Failed to copy row:", err));
  };

  if (totalRows === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography>No results found.</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setColumnFilters({}); // Reset all filters
            setPage(0); // Reset pagination to the first page
          }}
          sx={{ mt: 2 }}
        >
          Reset Filters
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        "& .MuiTable-root": {
          minWidth: "max-content",
        },
      }}
    >
      {/* Pagination and Results Count */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between", // Align text and pagination on the same line
          alignItems: "center", // Vertically align them
          mb: 2, // Add space below
        }}
      >
        {/* Showing X of X Results */}
        <Typography
          sx={{
            fontSize: "0.9rem", // Ensure consistent font size
            color: themeMode === "light" ? "text.primary" : "#90caf9",
          }}
        >
          Showing {paginatedData.length} of {totalRows} results
        </Typography>

        {/* Pagination Controls */}
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          sx={{
            "& .MuiTablePagination-toolbar": {
              padding: 0, // Remove default padding
              minHeight: "36px", // Match height with Typography
            },
            "& .MuiTablePagination-selectLabel, .MuiTablePagination-input": {
              fontSize: "0.9rem", // Match Typography font size
            },
          }}
        />
      </Box>

      <Table
        sx={{
          minWidth: "100%",
          overflowX: "auto",
          tableLayout: "auto", // Dynamic column sizing
        }}
      >
        <TableHead>
          {/* Headers Row */}
          <TableRow>
            <TableCell padding="checkbox" sx={tableCellStyles.checkbox}>
              <Checkbox
                color="primary"
                indeterminate={
                  paginatedData.some((row) =>
                    selectedRows.includes(row.uniqueId)
                  ) &&
                  !paginatedData.every((row) =>
                    selectedRows.includes(row.uniqueId)
                  )
                }
                checked={
                  paginatedData.length > 0 &&
                  paginatedData.every((row) =>
                    selectedRows.includes(row.uniqueId)
                  )
                }
                onChange={handleSelectAllClick}
              />
            </TableCell>
            <TableCell sx={getColumnStyle("FQDN")}>
              FQDN
              <div
                style={tableCellStyles.resizeHandle}
                onMouseDown={(e) => handleResizeStart(e, "FQDN")}
              />
            </TableCell>
            <TableCell sx={getColumnStyle("APPID")}>
              APPID
              <div
                style={tableCellStyles.resizeHandle}
                onMouseDown={(e) => handleResizeStart(e, "APPID")}
              />
            </TableCell>
            <TableCell sx={tableCellStyles.action}>DNS Query</TableCell>
            <TableCell sx={tableCellStyles.action}>Get Cert</TableCell>
            <TableCell sx={tableCellStyles.action}>Copy</TableCell>
            {columns
              .filter((col) => col !== "FQDN" && col !== "APPID")
              .map((col) => (
                <TableCell key={col} sx={getColumnStyle(col)}>
                  {col}
                  <div
                    style={tableCellStyles.resizeHandle}
                    onMouseDown={(e) => handleResizeStart(e, col)}
                  />
                </TableCell>
              ))}
          </TableRow>

          {/* Filters Row */}
          <TableRow>
            <TableCell
              padding="checkbox"
              sx={tableCellStyles.checkbox}
            ></TableCell>
            <TableCell sx={getColumnStyle("FQDN")}>
              <input
                type="text"
                placeholder="Filter FQDN"
                value={columnFilters["FQDN"] || ""}
                onChange={(e) =>
                  setColumnFilters((prev) => ({
                    ...prev,
                    FQDN: e.target.value,
                  }))
                }
                style={{
                  width: "70%",
                  padding: "1px",
                  boxSizing: "border-box",
                }}
              />
            </TableCell>
            <TableCell sx={getColumnStyle("APPID")}>
              <input
                type="text"
                placeholder="Filter APPID"
                value={columnFilters["APPID"] || ""}
                onChange={(e) =>
                  setColumnFilters((prev) => ({
                    ...prev,
                    APPID: e.target.value,
                  }))
                }
                style={{
                  width: "70%",
                  padding: "2px",
                  boxSizing: "border-box",
                }}
              />
            </TableCell>
            <TableCell sx={tableCellStyles.action}></TableCell>
            <TableCell sx={tableCellStyles.action}></TableCell>
            <TableCell sx={tableCellStyles.action}></TableCell>
            {columns
              .filter((col) => col !== "FQDN" && col !== "APPID")
              .map((col) => (
                <TableCell key={col} sx={getColumnStyle(col)}>
                  <input
                    type="text"
                    placeholder={`Filter ${col}`}
                    value={columnFilters[col] || ""}
                    onChange={(e) =>
                      setColumnFilters((prev) => ({
                        ...prev,
                        [col]: e.target.value,
                      }))
                    }
                    style={{
                      width: "70%",
                      padding: "2px",
                      boxSizing: "border-box",
                    }}
                  />
                </TableCell>
              ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {/* Checkbox for Row Selection */}
              <TableCell padding="checkbox" sx={tableCellStyles.checkbox}>
                <Checkbox
                  color="primary"
                  checked={selectedRows.includes(row.uniqueId)}
                  onChange={(event) => handleSelectRow(event, row)}
                />
              </TableCell>
              {/* Fixed FQDN Column */}
              <TableCell sx={getColumnStyle("FQDN")}>{row.FQDN}</TableCell>
              {/* Fixed APPID Column */}
              <TableCell sx={getColumnStyle("APPID")}>{row.APPID}</TableCell>
              {/* DNS Query Action */}
              <TableCell sx={tableCellStyles.action}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onResolve(row.FQDN)}
                  disabled={loadingFqdn === row.FQDN}
                  sx={{
                    backgroundColor:
                      loadingFqdn === row.FQDN
                        ? themeMode === "light"
                          ? "#e0e0e0"
                          : "#424242"
                        : themeMode === "light"
                        ? "#1976d2"
                        : "#90caf9",
                    color: themeMode === "dark" ? "#000" : "#fff", // Black text in dark mode
                  }}
                >
                  {loadingFqdn === row.FQDN ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Resolve"
                  )}
                </Button>
              </TableCell>
              {/* Get Certificate Action */}
              <TableCell sx={tableCellStyles.action}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onFetchCert(row.FQDN)}
                  disabled={loadingCert === row.FQDN}
                  sx={{
                    backgroundColor:
                      loadingCert === row.FQDN
                        ? themeMode === "light"
                          ? "#e0e0e0"
                          : "#424242"
                        : themeMode === "light"
                        ? "#1976d2"
                        : "#90caf9",
                    color: themeMode === "dark" ? "#000" : "#fff", // Black text in dark mode
                  }}
                >
                  {loadingCert === row.FQDN ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Get Cert"
                  )}
                </Button>
              </TableCell>
              {/* Copy Action */}
              <TableCell sx={tableCellStyles.action}>
                <Tooltip
                  title={copiedRow === row.FQDN ? "Copied!" : "Copy row"}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleCopyRow(row)}
                    sx={{
                      minWidth: "40px",
                      backgroundColor:
                        copiedRow === row.FQDN
                          ? themeMode === "light"
                            ? "#e8f5e9"
                            : "#1b5e20"
                          : "transparent",
                    }}
                  >
                    <span role="img" aria-label="copy">
                      📋
                    </span>
                  </Button>
                </Tooltip>
              </TableCell>
              {/* Dynamic Columns */}
              {columns
                .filter((col) => col !== "FQDN" && col !== "APPID")
                .map((col, colIndex) => (
                  <TableCell key={colIndex} sx={getColumnStyle(col)}>
                    {col.toLowerCase().includes("email") ? (
                      <EmailHoverMenu email={row[col]} />
                    ) : (
                      row[col]
                    )}
                  </TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ResultsTable;
