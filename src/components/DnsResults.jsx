import React from 'react';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography
} from '@mui/material';

const DnsResults = ({
  resolveResults,
  activeTab,
  activeRecordTab,
  onTabChange,
  onRecordTabChange
}) => {
  if (!resolveResults) return null;

  const renderRecordData = (record, index) => (
    <Box key={index} sx={{ marginBottom: '10px' }}>
      <Typography>Name: {record.name}</Typography>
      <Typography>TTL: {record.ttl}</Typography>
      <Typography>Type: {record.type}</Typography>
      <Typography>Value: {record.value}</Typography>
      <hr />
    </Box>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', marginTop: '20px' }}>
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => onTabChange(newValue)}
        centered
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Internal DNS" value="internal" />
        <Tab label="External DNS" value="external" />
      </Tabs>

      {resolveResults[activeTab] ? (
        <Box>
          <Tabs
            value={activeRecordTab}
            onChange={(e, newValue) => onRecordTabChange(newValue)}
            centered
            indicatorColor="primary"
            textColor="primary"
            sx={{ marginTop: '20px' }}
          >
            {Object.keys(resolveResults[activeTab]).map((recordType) => (
              <Tab
                key={recordType}
                label={recordType}
                value={recordType}
              />
            ))}
          </Tabs>

          <Card sx={{ marginTop: '20px', padding: '20px' }}>
            <CardContent>
              <Typography variant="h6">
                {activeRecordTab} Records ({activeTab})
              </Typography>
              {resolveResults[activeTab][activeRecordTab]?.length > 0 ? (
                resolveResults[activeTab][activeRecordTab].map((record, index) => 
                  renderRecordData(record, index)
                )
              ) : (
                <Typography>
                  No {activeRecordTab} records found or failed to resolve.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Typography sx={{ marginTop: '20px' }}>
          No data available for {activeTab} DNS.
        </Typography>
      )}
    </Box>
  );
};

export default DnsResults;