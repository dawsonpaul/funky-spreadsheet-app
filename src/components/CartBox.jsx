import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Menu, MenuItem, Paper } from "@mui/material";
import * as XLSX from "xlsx";
import { useSpring, animated } from "@react-spring/web";

const CartBox = ({ cart, themeMode, onShowCollected }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [prevCartLength, setPrevCartLength] = useState(cart.length); // Previous cart length
  const [isHovered, setIsHovered] = useState(false); // Hover state for popup
  const open = Boolean(anchorEl);

  // React Spring animation for the bubble
  const [style, api] = useSpring(() => ({
    transform: "scale(1)",
    backgroundColor: themeMode === "dark" ? "#424242" : "#ffffff", // Default color
    config: { tension: 200, friction: 20 },
  }));

  // Update animation when `themeMode` changes
  useEffect(() => {
    api.start({
      backgroundColor: themeMode === "dark" ? "#424242" : "#ffffff",
    });
  }, [themeMode, api]);

  // Trigger animation when cart changes
  useEffect(() => {
    if (cart.length !== prevCartLength) {
      const isAdding = cart.length > prevCartLength;
      setPrevCartLength(cart.length);

      // Start animation
      api.start({
        transform: "scale(1.2)",
        backgroundColor: isAdding ? "#a5d6a7" : "#ef9a9a", // Light green for add, light red for remove
      });

      // Reset animation
      setTimeout(
        () =>
          api.start({
            transform: "scale(1)",
            backgroundColor: themeMode === "dark" ? "#424242" : "#ffffff",
          }),
        200
      );
    }
  }, [cart, prevCartLength, api, themeMode]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const exportToJson = () => {
    const blob = new Blob([JSON.stringify(cart, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "collected_fqdns.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleClose();
  };

  const exportToCsv = () => {
    const headers = Object.keys(cart[0] || {});
    const csvContent = [
      headers.join(","),
      ...cart.map((row) =>
        headers.map((header) => JSON.stringify(row[header] || "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "collected_fqdns.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleClose();
  };

  const exportToXlsx = () => {
    const ws = XLSX.utils.json_to_sheet(cart);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FQDNs");
    XLSX.writeFile(wb, "collected_fqdns.xlsx");
    handleClose();
  };

  return (
    <animated.div
      style={{
        ...style, // Apply React Spring animation
        position: "fixed",
        top: "100px",
        right: "100px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        padding: "10px 20px",
        borderRadius: "20px",
        boxShadow:
          themeMode === "dark"
            ? "0 4px 8px rgba(0, 0, 0, 0.8)"
            : "0 4px 8px rgba(0, 0, 0, 0.2)",
        zIndex: 10,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Basket (Text and Icon) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: themeMode === "dark" ? "#e0e0e0" : "#000", // Ensure text color matches theme
        }}
      >
        <Typography
          onClick={onShowCollected}
          sx={{
            cursor: "pointer",
            color: themeMode === "light" ? "#1976d2" : "#90caf9",
            textDecoration: "underline",
          }}
        >
          #{cart.length} Collected
        </Typography>

        <Button
          variant="outlined"
          size="small"
          onClick={handleClick}
          disabled={cart.length === 0}
          sx={{
            color: themeMode === "light" ? "#1976d2" : "#90caf9",
            borderColor: themeMode === "light" ? "#1976d2" : "#90caf9",
            backgroundColor: "transparent",
            "&.Mui-disabled": {
              color:
                themeMode === "light"
                  ? "rgba(25, 118, 210, 0.3)"
                  : "rgba(144, 202, 249, 0.3)",
              borderColor:
                themeMode === "light"
                  ? "rgba(25, 118, 210, 0.3)"
                  : "rgba(144, 202, 249, 0.3)",
            },
          }}
        >
          📥
        </Button>
      </Box>

      {/* Popup */}
      {isHovered && cart.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            top: "50px", // Offset slightly below the basket
            right: "10px",
            padding: "10px",
            borderRadius: "8px",
            backgroundColor: themeMode === "dark" ? "#424242" : "#ffffff",
            color: themeMode === "dark" ? "#e0e0e0" : "#000",
            boxShadow:
              themeMode === "dark"
                ? "0 4px 8px rgba(0, 0, 0, 0.8)"
                : "0 4px 8px rgba(0, 0, 0, 0.2)",
            maxWidth: "300px",
            overflowY: "auto",
            maxHeight: "200px", // Limit height
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              color: themeMode === "dark" ? "#e0e0e0" : "#000",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Collected FQDNs:
          </Typography>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              color: themeMode === "dark" ? "#e0e0e0" : "#000",
            }}
          >
            {cart.map((item, index) => (
              <li key={index} style={{ fontSize: "0.85rem" }}>
                {item.FQDN || "Unknown"}
              </li>
            ))}
          </ul>
        </Paper>
      )}
    </animated.div>
  );
};

export default CartBox;
