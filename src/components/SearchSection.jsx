import React, { useCallback } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import _ from 'lodash';

const SearchSection = ({
  columns,
  selectedColumn,
  searchTerm,
  onColumnChange,
  onSearchTermChange
}) => {
  // Debounce the search to prevent excessive filtering
  const debouncedSearch = useCallback(
    _.debounce((value) => {
      onSearchTermChange(value);
    }, 300),
    [onSearchTermChange]
  );

  const handleSearchChange = (e) => {
    // Update the input value immediately for UI responsiveness
    e.persist();
    // Debounce the actual search
    debouncedSearch(e.target.value);
  };

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
          value={selectedColumn}
          onChange={(e) => onColumnChange(e.target.value)}
        >
          {columns.map((col) => (
            <MenuItem key={col} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        sx={{ flex: 2 }}
        placeholder="Enter search term (minimum 3 characters)"
        onChange={handleSearchChange}
      />
    </Box>
  );
};

export default SearchSection;