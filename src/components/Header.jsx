import React from "react";
import { Typography, Box, FormControlLabel, Switch } from "@mui/material";
import CartBox from "./CartBox";
import HSBCBlack from "../assets/BBblack.png"; // Adjust path
import HSBCWhite from "../assets/BBwhite.png"; // Adjust path

const Header = ({ themeMode, onThemeToggle, cart, onShowCollected }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", // Spread items evenly
        padding: "10px 20px",
        backgroundColor: themeMode === "light" ? "#f5f5f5" : "#121212",
      }}
    >
      {/* Left Section: Dark Mode Toggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "20px", // Space between items
        }}
      >
        <FormControlLabel
          control={
            <Switch checked={themeMode === "dark"} onChange={onThemeToggle} />
          }
          label="Dark Mode"
          sx={{
            color: themeMode === "light" ? "#1976d2" : "#90caf9",
          }}
        />
      </Box>

      {/* Center Section: Logo and Title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <img
          src={themeMode === "light" ? HSBCBlack : HSBCWhite}
          alt="HSBC Logo"
          style={{
            width: "150px",
            height: "auto",
            transition: "transform 0.5s ease-in-out", // Smooth rotate effect
            transform:
              themeMode === "light" ? "rotate(0deg)" : "rotate(360deg)",
          }}
        />
        <Typography
          variant="h4"
          sx={{
            color: themeMode === "light" ? "#1976d2" : "#90caf9",
          }}
        >
          EIM to FQDN
        </Typography>
      </Box>

      {/* Right Section: CartBox */}
      <CartBox
        cart={cart}
        themeMode={themeMode}
        onShowCollected={onShowCollected}
      />
    </Box>
  );
};

export default Header;
