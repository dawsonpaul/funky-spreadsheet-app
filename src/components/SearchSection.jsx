import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

const SearchSection = ({
  columns,
  selectedColumn,
  searchTerm,
  onColumnChange,
  onSearchTermChange
}) => {
  // Sort columns to prioritize FQDN and APPID
  const sortedColumns = React.useMemo(() => {
    const priorityColumns = ['FQDN', 'APPID'];
    const otherColumns = columns.filter(col => !priorityColumns.includes(col));
    return [...priorityColumns, ...otherColumns];
  }, [columns]);

  return (
    <Box sx={{
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      width: '100%',
      marginBottom: '20px',
    }}>
      <FormControl sx={{ flex: 1 }}>
        <InputLabel id="search-column-label">Search By Column</InputLabel>
        <Select
          labelId="search-column-label"
          label="Search By Column"
          value={selectedColumn || 'FQDN'}  // Default to FQDN if no selection
          onChange={(e) => onColumnChange(e.target.value)}
        >
          {sortedColumns.map((col) => (
            <MenuItem 
              key={col} 
              value={col}
              sx={{
                fontWeight: (col === 'FQDN' || col === 'APPID') ? 'bold' : 'normal'
              }}
            >
              {col}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        sx={{ flex: 2 }}
        placeholder="Enter search term"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
      />
    </Box>
  );
};

export default SearchSection;