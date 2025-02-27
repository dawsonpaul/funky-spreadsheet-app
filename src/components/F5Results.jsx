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

// Helper function to determine if a key is LTM-related
const isLtmKey = (key) => {
  const ltmKeywords = ['ltm', 'virtual', 'pool', 'node', 'member', 'profile', 'rule', 'snat', 'monitor'];
  return ltmKeywords.some(keyword => key.toLowerCase().includes(keyword));
};

// Helper function to render nested objects
const renderNestedObject = (data, level = 0, path = "") => {
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
      <Box 
        sx={{ 
          pl: 1.5,
          maxHeight: level === 0 ? "none" : "300px",
          overflow: level === 0 ? "visible" : "auto",
          border: level > 0 ? "1px solid rgba(0,0,0,0.1)" : "none",
          borderRadius: level > 0 ? 1 : 0,
          mb: 1
        }}
      >
        {data.map((item, index) => (
          <Box key={index} sx={{ display: "flex", mb: 0.5 }}>
            <Typography
              color="text.secondary"
              sx={{ mr: 0.5, fontSize: "0.875rem" }}
            >
              [{index}]:
            </Typography>
            {renderNestedObject(item, level + 1, `${path}[${index}]`)}
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

  // For top-level objects, don't use a table container
  if (level === 0) {
    return (
      <Box sx={{ width: "100%" }}>
        {keys.map((key) => {
          const isLtm = isLtmKey(key);
          return (
            <Box 
              key={key} 
              sx={{ 
                mb: 2,
                backgroundColor: isLtm 
                  ? (theme) => theme.palette.mode === "dark" 
                    ? "rgba(255, 255, 255, 0.07)" 
                    : "rgba(0, 0, 0, 0.04)"
                  : "transparent",
                borderRadius: 1,
                overflow: "hidden"
              }}
            >
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  p: 1,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  backgroundColor: isLtm 
                    ? (theme) => theme.palette.mode === "dark" 
                      ? "rgba(255, 255, 255, 0.1)" 
                      : "rgba(0, 0, 0, 0.06)"
                    : (theme) => theme.palette.mode === "dark" 
                      ? "rgba(255, 255, 255, 0.05)" 
                      : "rgba(0, 0, 0, 0.03)",
                }}
              >
                <Typography 
                  sx={{ 
                    fontSize: "1rem", 
                    fontWeight: "bold",
                    flexGrow: 1
                  }}
                >
                  {key} {isLtm && <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>(LTM)</span>}
                </Typography>
                {typeof data[key] === "object" && data[key] !== null && (
                  <CopyableObject data={data[key]} />
                )}
              </Box>
              <Box sx={{ p: 1 }}>
                {renderNestedObject(data[key], level + 1, `${path}.${key}`)}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        mb: 0.5,
        mt: 0.5,
        width: "100%",
        maxHeight: "300px",
        overflow: "auto",
        "& .MuiTable-root": {
          width: "100%",
        },
      }}
    >
      <Table size="small" padding="none">
        <TableBody>
          {keys.map((key) => {
            const isLtm = isLtmKey(key);
            const currentPath = `${path}.${key}`;
            
            return (
              <TableRow
                key={key}
                sx={{ 
                  "&:last-child td, &:last-child th": { border: 0 },
                  backgroundColor: isLtm 
                    ? (theme) => theme.palette.mode === "dark" 
                      ? "rgba(255, 255, 255, 0.07)" 
                      : "rgba(0, 0, 0, 0.04)"
                    : "transparent"
                }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    fontWeight: "bold",
                    width: "180px",
                    maxWidth: "180px",
                    verticalAlign: "top",
                    fontSize: "0.875rem",
                    padding: "8px 12px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    borderBottom: "1px solid",
                    borderColor: "divider",
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
                    {key} {isLtm && <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>(LTM)</span>}
                  </Typography>
                </TableCell>
                <TableCell 
                  sx={{ 
                    padding: "8px 12px",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {typeof data[key] === "object" && data[key] !== null ? (
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: "0.875rem", mr: 1 }}
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
                      {renderNestedObject(data[key], level + 1, currentPath)}
                    </Box>
                  ) : (
                    renderNestedObject(data[key], level + 1, currentPath)
                  )}
                </TableCell>
              </TableRow>
            );
          })}
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
      <Card elevation={2} sx={{ borderRadius: 1, width: "100%" }}>
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
                <Typography variant="h6">F5 Check Results</Typography>
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

              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  width: "100%",
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
