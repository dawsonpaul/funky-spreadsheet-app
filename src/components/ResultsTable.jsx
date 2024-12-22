import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Button,
  CircularProgress,
  TablePagination,
  Box,
  Typography,
  Tooltip 
} from '@mui/material';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const ResultsTable = ({
  columns,
  filteredData,
  resolvedFqdn,
  showCollected,
  cart,
  loadingFqdn,
  themeMode,
  onCollect,
  onResolve
}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(ROWS_PER_PAGE_OPTIONS[0]);
  const [copiedRow, setCopiedRow] = React.useState(null); // Track which row was just copied

  // Get the data to display based on filters
  const displayData = resolvedFqdn
    ? filteredData.filter((row) => row.FQDN === resolvedFqdn)
    : showCollected
    ? filteredData.filter((row) =>
        cart.some((item) => item.FQDN === row.FQDN)
      )
    : filteredData;

  // Calculate pagination
  const totalRows = displayData.length;
  const paginatedData = displayData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCopyRow = (row) => {
    // Create a string of all visible column values
    const rowValues = ['FQDN', ...columns.filter(col => col !== 'FQDN')]
      .map(col => row[col])
      .join('\t');
      
    navigator.clipboard.writeText(rowValues)
      .then(() => {
        setCopiedRow(row.FQDN);
        setTimeout(() => setCopiedRow(null), 2000); // Reset after 2 seconds
      })
      .catch(err => console.error('Failed to copy row:', err));
  };

  if (totalRows === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography>No results found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Typography>
          Showing {paginatedData.length} of {totalRows} results
        </Typography>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>FQDN</TableCell>
            <TableCell>Collection</TableCell>
            <TableCell>DNS Query</TableCell>
            <TableCell>Copy</TableCell>
            {columns
              .filter((col) => col !== 'FQDN')
              .map((col, index) => (
                <TableCell key={index}>{col}</TableCell>
              ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell>{row.FQDN}</TableCell>

              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onCollect(row)}
                  sx={{
                    backgroundColor: cart.some((item) => item.FQDN === row.FQDN)
                      ? themeMode === 'light'
                        ? '#bbdefb'
                        : '#0d47a1'
                      : themeMode === 'light'
                      ? '#1976d2'
                      : '#90caf9',
                    color: cart.some((item) => item.FQDN === row.FQDN)
                      ? themeMode === 'light'
                        ? '#000'
                        : '#fff'
                      : '#fff',
                  }}
                >
                  {cart.some((item) => item.FQDN === row.FQDN)
                    ? 'Remove'
                    : 'Collect'}
                </Button>
              </TableCell>

              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onResolve(row.FQDN)}
                  disabled={loadingFqdn === row.FQDN}
                  sx={{
                    backgroundColor: loadingFqdn === row.FQDN
                      ? themeMode === 'light'
                        ? '#e0e0e0'
                        : '#424242'
                      : themeMode === 'light'
                      ? '#1976d2'
                      : '#90caf9',
                    color: loadingFqdn === row.FQDN
                      ? themeMode === 'light'
                        ? '#000'
                        : '#fff'
                      : '#fff',
                  }}
                >
                  {loadingFqdn === row.FQDN ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    'Resolve'
                  )}
                </Button>
              </TableCell>

              <TableCell>
                <Tooltip title={copiedRow === row.FQDN ? "Copied!" : "Copy row"}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleCopyRow(row)}
                    sx={{
                      minWidth: '40px',
                      backgroundColor: copiedRow === row.FQDN
                        ? themeMode === 'light'
                          ? '#e8f5e9'
                          : '#1b5e20'
                        : 'transparent'
                    }}
                  >
                    <span role="img" aria-label="copy">📋</span>
                  </Button>
                </Tooltip>
              </TableCell>

              {columns
                .filter((col) => col !== 'FQDN')
                .map((col, colIndex) => (
                  <TableCell key={colIndex}>{row[col]}</TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={totalRows}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      />
    </Box>
  );
};

export default ResultsTable;