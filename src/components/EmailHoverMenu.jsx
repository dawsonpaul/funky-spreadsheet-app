import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Popper, 
  Paper, 
  ClickAwayListener,
  Fade 
} from '@mui/material';

const EmailHoverMenu = ({ email }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${email}`;
    setAnchorEl(null);
  };

  const handleTeamsClick = () => {
    window.location.href = `msteams://teams.microsoft.com/l/chat/0/0?users=${email}`;
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <span style={{ cursor: 'pointer' }}>{email}</span>
      <Popper 
        open={open} 
        anchorEl={anchorEl} 
        placement="right"
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper sx={{ p: 1, display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={handleEmailClick}>
                <span role="img" aria-label="email">✉️</span>
              </IconButton>
              <IconButton size="small" onClick={handleTeamsClick}>
                <span role="img" aria-label="teams">👥</span>
              </IconButton>
            </Paper>
          </Fade>
        )}
      </Popper>
    </div>
  );
};

export default EmailHoverMenu;