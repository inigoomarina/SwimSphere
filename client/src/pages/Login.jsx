import React, { useState, useContext } from 'react';
import { useHistory, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx'; // Update import to use .jsx extension
import { GoogleLogin } from '@react-oauth/google';
import { loginUser, googleLogin } from '../utils/api';

// Material UI imports
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Box,
  Grid,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff, Email } from '@mui/icons-material';

// Animation imports
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useContext(AuthContext);
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await loginUser({ email, password });
      // Store JWT in localStorage
      localStorage.setItem('token', data.data.token);
      // Update auth context
      login(data.data.user);
      // Directly redirect to dashboard, never to onboarding
      history.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse || !credentialResponse.credential) {
        setError('Invalid Google response. Please try again.');
        return;
      }
      
      console.log("Google login credential received:", credentialResponse.credential.substring(0, 20) + "...");
      const data = await googleLogin(credentialResponse.credential);

      if (data.status === 'success') {
        localStorage.setItem('token', data.data.token);
        const loggedInUser = data.data.user;
        login(loggedInUser);
        
        // Only redirect to onboarding if this is a new user
        if (data.data.isNewUser === true) {
          history.push('/onboarding');
        } else {
          // For returning users, always go to dashboard
          history.push('/dashboard');
        }
      } else {
        setError(data.message || 'Google login failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google login failed. Please try again.');
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google login failure:', error);
    setError('Google login failed. Please try again.');
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: 'url(/images/swimming-background.jpg)', // Updated path
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#f5f5f5', // Fallback color
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative', // Ensure parent is relative for absolute positioning
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%', // Center vertically
            left: '50%', // Center horizontally
            transform: 'translate(-50%, -50%)', // Adjust position to true center
            display: 'flex', // Use flexbox to align items
            alignItems: 'center', // Vertically center items
            zIndex: 2,
          }}
        >
          <Typography
            sx={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '50px', // Adjust size as needed
              fontFamily: "'DM Sans', sans-serif",
              marginRight: '15px' // Add space between text and logo
            }}
          >
            swimsphere
          </Typography>
          <img 
            src="/images/LOGO.png" 
            alt="SwimSphere Logo" 
            style={{ 
              height: '50px', // Adjust size as needed, match Typography fontSize if desired
            }} 
          />
        </Box>
        
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 102, 204, 0.4)',
          }}
        />
      </Grid>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlined />
            </Avatar>
          </motion.div>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', marginTop: '16px' }}
            >
              <Alert severity="error">{error}</Alert>
            </motion.div>
          )}
          
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
              }}
              component={motion.button}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </Button>
            
            <Grid container>
              <Grid item xs>
                <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ color: 'primary.main' }}>
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2" sx={{ color: 'primary.main' }}>
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                OR
              </Typography>
              <Box sx={{ width: '100%' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                  useOneTap
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Login;