import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  Divider,
  Chip,
  Stack,
} from "@mui/material";

// Custom JSON renderer component
const JsonRenderer = ({ data, level = 0, expanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const isObject = data !== null && typeof data === "object";
  const indent = level * 16; // 16px per level

  // Handle primitive values (string, number, boolean, null)
  if (!isObject) {
    let valueDisplay;
    let chipColor;

    if (typeof data === "string") {
      valueDisplay = `"${data}"`;
      chipColor = "success";
    } else if (typeof data === "number") {
      valueDisplay = data.toString();
      chipColor = "primary";
    } else if (typeof data === "boolean") {
      valueDisplay = data.toString();
      chipColor = "warning";
    } else if (data === null) {
      valueDisplay = "null";
      chipColor = "error";
    } else {
      valueDisplay = "undefined";
      chipColor = "default";
    }

    return (
      <Box component="span" sx={{ ml: indent / 8 }}>
        <Chip
          size="small"
          label={valueDisplay}
          color={chipColor}
          variant="outlined"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.85rem",
            height: "24px",
          }}
        />
      </Box>
    );
  }

  // Handle arrays and objects
  const isArray = Array.isArray(data);
  const isEmpty = Object.keys(data).length === 0;
  const toggleExpand = () => setIsExpanded(!isExpanded);

  // For empty objects/arrays
  if (isEmpty) {
    return (
      <Box sx={{ ml: indent / 8 }}>
        <Chip
          size="small"
          label={isArray ? "[ ]" : "{ }"}
          variant="outlined"
          sx={{ fontFamily: "monospace" }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ ml: indent / 8, mb: 0.5 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton size="small" onClick={toggleExpand} sx={{ p: 0.5 }}>
          {isExpanded ? (
            <Box component="span" sx={{ fontSize: "18px", lineHeight: 1 }}>
              ▼
            </Box>
          ) : (
            <Box component="span" sx={{ fontSize: "18px", lineHeight: 1 }}>
              ▶
            </Box>
          )}
        </IconButton>

        <Typography
          variant="body2"
          component="span"
          sx={{
            fontWeight: "medium",
            color: (theme) =>
              theme.palette.mode === "dark" ? "primary.light" : "primary.dark",
            fontFamily: "monospace",
          }}
        >
          {isArray ? `Array(${Object.keys(data).length})` : `Object`}
        </Typography>
      </Box>

      <Collapse in={isExpanded}>
        <Box
          sx={{
            ml: 2,
            pl: 1,
            borderLeft: "1px dashed",
            borderColor: "divider",
            mt: 0.5,
          }}
        >
          {Object.entries(data).map(([key, value]) => (
            <Box key={key} sx={{ mb: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{
                    fontWeight: "bold",
                    mr: 1,
                    fontFamily: "monospace",
                    color: (theme) =>
                      theme.palette.mode === "dark"
                        ? "info.light"
                        : "info.dark",
                  }}
                >
                  {isArray ? `[${key}]` : key}:
                </Typography>
                <JsonRenderer
                  data={value}
                  level={level + 1}
                  expanded={level < 2}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

const F5Results = ({ f5Results, themeMode, onClose }) => {
  if (!f5Results) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(f5Results, null, 2));
  };

  return (
    <Box sx={{ width: "100%", marginTop: "20px" }}>
      <Card elevation={2} sx={{ borderRadius: 1 }}>
        <CardContent>
          {f5Results.error ? (
            <Typography color="error" variant="h6">
              Error: {f5Results.error}
            </Typography>
          ) : (
            <>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">F5 Check Results</Typography>
                <IconButton
                  size="small"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  <Box component="span" sx={{ fontSize: "16px" }}>
                    📋
                  </Box>
                </IconButton>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  p: 2,
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(0, 0, 0, 0.02)",
                  borderRadius: 1,
                  maxHeight: "500px",
                  overflow: "auto",
                }}
              >
                <JsonRenderer data={f5Results} />
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default F5Results;
