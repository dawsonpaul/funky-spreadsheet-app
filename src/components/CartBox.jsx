import React from 'react';
import { Box, Typography, Button, Menu, MenuItem } from '@mui/material';
import * as XLSX from 'xlsx';
import { useState } from 'react';

const CartBox = ({ cart, themeMode, onShowCollected }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const exportToJson = () => {
    const blob = new Blob([JSON.stringify(cart, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
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
      headers.join(','),
      ...cart.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
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
    <Box
      sx={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: themeMode === 'dark' ? '#2c2c2c' : '#f5f5f5',
        padding: '10px 20px',
        borderRadius: '20px',
        boxShadow: themeMode === 'dark'
          ? '0 4px 8px rgba(0, 0, 0, 0.6)'
          : '0 4px 8px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Typography
        onClick={onShowCollected}
        sx={{
          cursor: 'pointer',
          color: themeMode === 'light' ? '#1976d2' : '#90caf9',
          textDecoration: 'underline',
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
          color: themeMode === 'light' ? '#1976d2' : '#90caf9',
          borderColor: themeMode === 'light' ? '#1976d2' : '#90caf9',
          backgroundColor: 'transparent',
          '&.Mui-disabled': {
            color: themeMode === 'light' ? 'rgba(25, 118, 210, 0.3)' : 'rgba(144, 202, 249, 0.3)',
            borderColor: themeMode === 'light' ? 'rgba(25, 118, 210, 0.3)' : 'rgba(144, 202, 249, 0.3)',
          }
        }}
      >
        <span role="img" aria-label="Export">📥</span>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'export-button',
        }}
      >
        <MenuItem onClick={exportToJson}>Export as JSON</MenuItem>
        <MenuItem onClick={exportToCsv}>Export as CSV</MenuItem>
        <MenuItem onClick={exportToXlsx}>Export as XLSX</MenuItem>
      </Menu>
    </Box>
  );
};

export default CartBox;