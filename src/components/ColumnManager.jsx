import React from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  OutlinedInput,
  Paper
} from '@mui/material';

const ColumnManager = ({ 
  allColumns, 
  visibleColumns, 
  onColumnChange,
  defaultColumns,
  themeMode 
}) => {
  // Filter out always-visible columns and already selected columns
  const availableColumns = allColumns.filter(col => 
    !defaultColumns.includes(col) && !visibleColumns.includes(col)
  );

  const handleColumnAdd = (event) => {
    const value = event.target.value;
    onColumnChange([...visibleColumns, value]);
  };

  const handleColumnRemove = (columnToRemove) => {
    onColumnChange(visibleColumns.filter(col => col !== columnToRemove));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: themeMode === 'light' 
          ? 'rgba(0, 0, 0, 0.03)'  // Light grey in light mode
          : 'rgba(255, 255, 255, 0.05)',  // Slightly lighter in dark mode
        borderRadius: 1
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {visibleColumns.map((column) => (
            <Chip
              key={column}
              label={column}
              onDelete={() => handleColumnRemove(column)}
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
        
        {availableColumns.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Add Column</InputLabel>
            <Select
              value=""
              onChange={handleColumnAdd}
              input={<OutlinedInput label="Add Column" />}
            >
              {availableColumns.map((column) => (
                <MenuItem key={column} value={column}>
                  {column}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
    </Paper>
  );
};

export default ColumnManager;