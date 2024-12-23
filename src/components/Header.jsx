import React from 'react';
import { Typography, Box, FormControlLabel, Switch } from '@mui/material';

const Header = ({ themeMode, onThemeToggle }) => {
  return (
    <Box sx={{ textAlign: 'center', marginBottom: '20px' }}>
      <Typography
        variant="h4"
        sx={{
          color: themeMode === 'light' ? '#1976d2' : '#90caf9',
        }}
      >
        EIM to FQDN
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={themeMode === 'dark'}
            onChange={onThemeToggle}
          />
        }
        label="Dark Mode"
        sx={{
          color: themeMode === 'light' ? '#1976d2' : '#90caf9',
        }}
      />
    </Box>
  );
};

export default Header;