import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx'; // Explicitly import .jsx
import { ChatProvider } from './context/ChatContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './context/ToastContext';
import theme from './theme';
// Import the flowbite CSS if you're getting styled components errors
import 'flowbite/dist/flowbite.min.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Logout from './pages/Logout';
import ProfilePage from './pages/ProfilePage';
import Feed from './pages/Feed';
import RecordsPage from './pages/RecordsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import Dashboard from './components/dashboard/Dashboard';
import CoachDashboard from './pages/coach/CoachDashboard';
import ChatPage from './pages/ChatPage';
import OnboardingPage from './pages/OnboardingPage'; // Import OnboardingPage
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Protected Route component to check authentication
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  
  return (
    <Route
      {...rest}
      render={props => {
        // If still loading auth state, return nothing yet
        if (loading) {
          return null;
        }
        
        // Special case for onboarding route
        if (rest.path === '/onboarding') {
          // If not authenticated, redirect to login
          if (!isAuthenticated) {
            return <Redirect to="/login" />;
          }
          
          // If user has already completed onboarding, redirect to dashboard
          if (user && user.role && user.firstName && user.lastName) {
            return <Redirect to="/dashboard" />;
          }
          
          // Otherwise, allow access to onboarding
          return <Component {...props} />;
        }
        
        // For all other protected routes, redirect to login if not authenticated
        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        }
        
        // If user is authenticated but hasn't completed basic profile setup,
        // redirect to onboarding (except for logout route)
        if (user && (!user.role || !user.firstName) && rest.path !== '/logout') {
          return <Redirect to="/onboarding" />;
        }
        
        // If user is authenticated, render the component
        return <Component {...props} />;
      }}
    />
  );
};

// Animated Routes Component
const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated, loading } = useContext(AuthContext);

  // Determine if we should show header and footer
  // Add '/onboarding' to the list of pages without header/footer
  const isAuthOrOnboardingPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/onboarding';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Conditionally render Header based on the page */}
      {!isAuthOrOnboardingPage && <Header />}
      {/* Adjust main content padding based on header presence */}
      <main className={`flex-grow ${!isAuthOrOnboardingPage ? 'pt-16' : ''}`}>
        <AnimatePresence mode="wait">
          <Switch location={location} key={location.pathname}>
            <Route exact path="/">
              {loading ? null : isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
            </Route>
            <Route path="/login">
              {loading ? null : isAuthenticated ? <Redirect to="/dashboard" /> : <Login />}
            </Route>
            <Route path="/register">
              {loading ? null : isAuthenticated ? <Redirect to="/dashboard" /> : <Register />}
            </Route>
            <Route path="/logout" component={Logout} />
            <ProtectedRoute path="/profile" component={ProfilePage} />
            <ProtectedRoute path="/feed" component={Feed} />
            <ProtectedRoute path="/records" component={RecordsPage} />
            <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/coach" component={CoachDashboard} />
            <ProtectedRoute path="/chat" component={ChatPage} />
            {/* Onboarding route remains protected but won't show header/footer */}
            <ProtectedRoute path="/onboarding" component={OnboardingPage} />
          </Switch>
        </AnimatePresence>
      </main>
      {/* Conditionally render Footer based on the page */}
      {!isAuthOrOnboardingPage && <Footer />}
    </div>
  );
};

const App = () => {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <ToastProvider>
            <ChatProvider>
              <Router>
                <AnimatedRoutes />
              </Router>
            </ChatProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App;