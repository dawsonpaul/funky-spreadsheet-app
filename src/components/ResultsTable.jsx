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

const ResultsTable = ({
  columns,
  filteredData,
  resolvedFqdn,
  showCollected,
  cart,
  loadingFqdn,
  themeMode,
  onCollect,
  onResolve,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  const [copiedRow, setCopiedRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [columnWidths, setColumnWidths] = useState({});
  const resizingColumn = useRef(null);
  const startX = useRef(null);
  const startWidth = useRef(null);

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

  const displayData = resolvedFqdn
    ? filteredData.filter((row) => row.FQDN === resolvedFqdn)
    : showCollected
    ? filteredData.filter((row) => cart.some((item) => item.FQDN === row.FQDN))
    : filteredData;

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const allFqdns = displayData.map((row) => row.FQDN);
      setSelectedRows(allFqdns);
      displayData.forEach((row) => {
        if (!cart.some((item) => item.FQDN === row.FQDN)) {
          onCollect(row);
        }
      });
    } else {
      displayData.forEach((row) => {
        if (cart.some((item) => item.FQDN === row.FQDN)) {
          onCollect(row);
        }
      });
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (event, row) => {
    const isChecked = event.target.checked;
    const fqdn = row.FQDN;

    if (isChecked) {
      setSelectedRows((prev) => [...prev, fqdn]);
      if (!cart.some((item) => item.FQDN === fqdn)) {
        onCollect(row);
      }
    } else {
      setSelectedRows((prev) => prev.filter((id) => id !== fqdn));
      if (cart.some((item) => item.FQDN === fqdn)) {
        onCollect(row);
      }
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
      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{
            color: themeMode === "light" ? "text.primary" : "#90caf9",
          }}
        >
          Showing {paginatedData.length} of {totalRows} results
        </Typography>
      </Box>

      <Table
        sx={{
          minWidth: "100%",
          overflowX: "auto",
          tableLayout: "auto", // Dynamic column sizing
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" sx={tableCellStyles.checkbox}>
              <Checkbox
                color="primary"
                indeterminate={
                  selectedRows.length > 0 &&
                  selectedRows.length < displayData.length
                }
                checked={
                  displayData.length > 0 &&
                  selectedRows.length === displayData.length
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
            <TableCell sx={tableCellStyles.action}>DNS Query</TableCell>
            <TableCell sx={tableCellStyles.action}>Copy</TableCell>
            {columns
              .filter((col) => col !== "FQDN")
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
        </TableHead>

        <TableBody>
          {paginatedData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell padding="checkbox" sx={tableCellStyles.checkbox}>
                <Checkbox
                  color="primary"
                  checked={selectedRows.includes(row.FQDN)}
                  onChange={(event) => handleSelectRow(event, row)}
                />
              </TableCell>
              <TableCell sx={getColumnStyle("FQDN")}>{row.FQDN}</TableCell>
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
                    color:
                      loadingFqdn === row.FQDN
                        ? themeMode === "light"
                          ? "#000"
                          : "#fff"
                        : "#fff",
                  }}
                >
                  {loadingFqdn === row.FQDN ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Resolve"
                  )}
                </Button>
              </TableCell>
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
              {columns
                .filter((col) => col !== "FQDN")
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

      <TablePagination
        component="div"
        count={totalRows}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      />
    </Box>
  );
};

export default ResultsTable;
