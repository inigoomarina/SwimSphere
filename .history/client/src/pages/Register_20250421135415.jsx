import React, { useState, useContext } from 'react';
import { useHistory, Link as RouterLink } from 'react-router-dom';
import { registerUser, googleLogin } from '../utils/api';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext.jsx'; // Update import to use .jsx extension

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
} from '@mui/material';
import { 
  LockOutlined,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
} from '@mui/icons-material';

// Animation imports
import { motion } from 'framer-motion';

const Register = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const history = useHistory();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const data = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      // Store JWT in localStorage
      localStorage.setItem('token', data.data.token);
      
      // Update auth context
      login(data.data.user);
      
      // Redirect to onboarding
      history.push('/onboarding');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await googleLogin(credentialResponse.credential);
      
      if (data.status === 'success') {
        localStorage.setItem('token', data.data.token);
        const loggedInUser = data.data.user;
        login(loggedInUser);
        // Check if profile seems incomplete (e.g., missing role or name)
        if (!loggedInUser.role || !loggedInUser.firstName) {
          history.push('/onboarding');
        } else {
          history.push('/dashboard');
        }
      } else {
        setError(data.message || 'Google registration failed');
      }
    } catch (err) {
      setError('Google registration failed. Please try again.');
    }
  };

  const handleGoogleFailure = () => {
    setError('Google registration failed. Please try again.');
  };

  return (
    <Grid container component="main" sx={{ height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: 'url(/images/swimming-background.jpg)', // Updated path
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) => t.palette.grey[50],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative', // Ensure parent is relative for absolute positioning
        }}
      >
        {/* Add SwimSphere logo/text - Centered */}
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
              fontFamily: "'DM Sans', sans-serif", // Ensure consistent font
              marginRight: '15px' // Add space between text and logo
            }}
          >
            swimsphere
          </Typography>
          <img 
            src="/images/LOGO.png" 
            alt="SwimSphere Logo" 
            style={{ 
              height: '50px', // Adjust size as needed
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
      <Grid 
        item 
        xs={12} 
        sm={8} 
        md={5} 
        component={Paper} 
        elevation={6} 
        square 
        sx={{ 
          height: '100vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
            margin: 'auto'
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
            Create Account
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
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>
            
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
              Sign Up
            </Button>
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2" sx={{ color: 'primary.main' }}>
                  Already have an account? Sign in
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
                  width="100%"
                  useOneTap
                  text="signup_with" // Change text to "Sign up with Google"
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Register;