import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";

// Add a CopyableValue component for fields that can be copied
const CopyableValue = ({ value }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Don't add copy button for objects/arrays
  if (typeof value === "object" && value !== null) {
    return null;
  }

  return (
    <Tooltip title={copied ? "Copied!" : "Copy value"}>
      <IconButton
        size="small"
        onClick={handleCopy}
        sx={{
          ml: 0.5,
          opacity: 0.4,
          "&:hover": { opacity: 1 },
          padding: "2px",
          fontSize: "0.75rem",
        }}
      >
        <Box component="span" role="img" aria-label="copy">
          {copied ? "✓" : "📋"}
        </Box>
      </IconButton>
    </Tooltip>
  );
};

// Add a component for copying objects/arrays
const CopyableObject = ({ data }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [copied, setCopied] = React.useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopy = (format) => {
    let textToCopy;

    // Create a copy of the data without uniqueId
    const filteredData = Array.isArray(data)
      ? data.map((item) => {
          if (typeof item === "object" && item !== null) {
            const { uniqueId, ...rest } = item;
            return rest;
          }
          return item;
        })
      : typeof data === "object" && data !== null
      ? (({ uniqueId, ...rest }) => rest)(data)
      : data;

    if (format === "json") {
      textToCopy = JSON.stringify(filteredData, null, 2);
    } else if (format === "compact") {
      textToCopy = JSON.stringify(filteredData);
    } else if (format === "values") {
      // For arrays, join values with commas
      if (Array.isArray(filteredData)) {
        textToCopy = filteredData
          .map((item) =>
            typeof item === "object" ? JSON.stringify(item) : String(item)
          )
          .join(", ");
      } else {
        // For objects, join key-value pairs
        textToCopy = Object.entries(filteredData)
          .map(
            ([key, val]) =>
              `${key}: ${typeof val === "object" ? JSON.stringify(val) : val}`
          )
          .join(", ");
      }
    }

    navigator.clipboard.writeText(textToCopy || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Copy options">
        <IconButton
          size="small"
          onClick={handleClick}
          sx={{
            ml: 0.5,
            opacity: 0.4,
            "&:hover": { opacity: 1 },
            padding: "2px",
            fontSize: "0.75rem",
          }}
        >
          <Box component="span" role="img" aria-label="copy">
            {copied ? "✓" : "📋"}
          </Box>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={() => handleCopy("json")}>
          Copy as formatted JSON
        </MenuItem>
        <MenuItem onClick={() => handleCopy("compact")}>
          Copy as compact JSON
        </MenuItem>
        <MenuItem onClick={() => handleCopy("values")}>
          Copy values only
        </MenuItem>
      </Menu>
    </>
  );
};

// Helper function to render nested objects
const renderNestedObject = (data, level = 0) => {
  if (data === null)
    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography color="error" sx={{ fontSize: "0.875rem" }}>
          null
        </Typography>
        <CopyableValue value="null" />
      </Box>
    );

  if (typeof data !== "object") {
    // Render primitive values with copy button
    const valueComponent = (() => {
      if (typeof data === "string") {
        return (
          <Typography color="success.main" sx={{ fontSize: "0.875rem" }}>
            "{data}"
          </Typography>
        );
      } else if (typeof data === "boolean") {
        return (
          <Typography color="warning.main" sx={{ fontSize: "0.875rem" }}>
            {data.toString()}
          </Typography>
        );
      } else if (typeof data === "number") {
        return (
          <Typography color="primary.main" sx={{ fontSize: "0.875rem" }}>
            {data}
          </Typography>
        );
      }
      return (
        <Typography sx={{ fontSize: "0.875rem" }}>{String(data)}</Typography>
      );
    })();

    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {valueComponent}
        <CopyableValue value={String(data)} />
      </Box>
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0)
      return (
        <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
          [ ]
        </Typography>
      );

    return (
      <Box sx={{ pl: 1.5 }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ display: "flex", mb: 0.5 }}>
            <Typography
              color="text.secondary"
              sx={{ mr: 0.5, fontSize: "0.875rem" }}
            >
              [{index}]:
            </Typography>
            {renderNestedObject(item, level + 1)}
          </Box>
        ))}
      </Box>
    );
  }

  // It's an object
  const keys = Object.keys(data)
    // Filter out uniqueId field
    .filter((key) => key !== "uniqueId");

  if (keys.length === 0)
    return (
      <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
        {}
      </Typography>
    );

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        mb: 0.5,
        mt: 0.5,
        width: "auto",
        maxWidth: "100%",
        "& .MuiTable-root": {
          width: "auto",
          tableLayout: "fixed",
        },
      }}
    >
      <Table size="small" padding="none">
        <TableBody>
          {keys.map((key) => (
            <TableRow
              key={key}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell
                component="th"
                scope="row"
                sx={{
                  fontWeight: "bold",
                  width: "120px",
                  maxWidth: "120px",
                  verticalAlign: "top",
                  fontSize: "0.875rem",
                  padding: "4px 8px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {key}
                </Typography>
              </TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>
                {typeof data[key] === "object" && data[key] !== null ? (
                  <Accordion
                    disableGutters
                    elevation={0}
                    sx={{
                      "&:before": { display: "none" },
                      backgroundColor: "transparent",
                      width: "auto",
                    }}
                  >
                    <AccordionSummary
                      sx={{
                        padding: 0,
                        minHeight: "unset",
                        "& .MuiAccordionSummary-content": { margin: 0 },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: "0.875rem" }}
                        >
                          {Array.isArray(data[key])
                            ? `Array [${data[key].length}]`
                            : `Object {${
                                Object.keys(data[key]).filter(
                                  (k) => k !== "uniqueId"
                                ).length
                              }}`}
                        </Typography>
                        <CopyableObject data={data[key]} />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ padding: 0 }}>
                      {renderNestedObject(data[key], level + 1)}
                    </AccordionDetails>
                  </Accordion>
                ) : (
                  renderNestedObject(data[key], level + 1)
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const F5Results = ({ f5Results, themeMode }) => {
  if (!f5Results) return null;

  const copyToClipboard = () => {
    // Create a copy of f5Results without uniqueId
    const { uniqueId, ...filteredResults } = f5Results;
    const jsonString = JSON.stringify(filteredResults, null, 2);
    navigator.clipboard.writeText(jsonString);
  };

  return (
    <Box sx={{ width: "100%", marginTop: "20px" }}>
      <Card elevation={2} sx={{ borderRadius: 1, maxWidth: "800px" }}>
        <CardContent sx={{ padding: 2, "&:last-child": { paddingBottom: 2 } }}>
          {f5Results.error ? (
            <Typography color="error" variant="h6">
              Error: {f5Results.error}
            </Typography>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1">F5 Check Results</Typography>
                <IconButton
                  size="small"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  <Box component="span" sx={{ fontSize: "14px" }}>
                    📋
                  </Box>
                </IconButton>
              </Box>

              <Divider sx={{ mb: 1 }} />

              <Box
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(0, 0, 0, 0.02)",
                  borderRadius: 1,
                  maxHeight: "500px",
                  overflow: "auto",
                  p: 1.5,
                }}
              >
                {renderNestedObject(f5Results)}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default F5Results;
