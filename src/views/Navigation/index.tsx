import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import { useLoginUserStore } from '../../stores';
import Cookie from 'react-cookies'

export default function Navigation() {
  const { loginUser, resetLoginUser } = useLoginUserStore();

  const logOutHandler = () => {
    Cookie.remove('token');
    resetLoginUser();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            News
          </Typography>
          { loginUser ? (
            <IconButton color="inherit" onClick={() => logOutHandler()}>
              <PersonIcon />
            </IconButton>
          ) : (
            <Button color="inherit">Login</Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
