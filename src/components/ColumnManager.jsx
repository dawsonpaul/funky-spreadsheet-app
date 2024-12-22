import React from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  OutlinedInput,
  Button
} from '@mui/material';

const ColumnManager = ({ 
  allColumns, 
  visibleColumns, 
  onColumnChange,
  defaultColumns 
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
    <Box sx={{ mb: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
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
  );
};

export default ColumnManager;