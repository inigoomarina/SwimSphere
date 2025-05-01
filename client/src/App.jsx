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
import Loader from './components/common/Loader'; // Add this import
// Import the flowbite CSS if you're getting styled components errors
import 'flowbite/dist/flowbite.min.css';

// Pages
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
import SettingsPage from './pages/SettingsPage'; // Import SettingsPage

// Protected Route component to check authentication
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={props => {
        // Still loading - show loader
        if (loading) {
          return <Loader />;
        }

        // Not authenticated - go to login
        if (!isAuthenticated) {
          console.log("Not authenticated, redirecting to login");
          return <Redirect to="/login" />;
        }

        // User is authenticated, now check onboarding status
        const isOnboardingRoute = rest.path === '/onboarding';
        const onboardingComplete = user?.onboardingComplete === true;

        if (isOnboardingRoute) {
          // If on the onboarding route:
          if (onboardingComplete) {
            // If onboarding is complete, redirect away from onboarding to dashboard
            console.log("Authenticated user has completed onboarding, redirecting from /onboarding to /dashboard");
            return <Redirect to="/dashboard" />;
          } else {
            // If onboarding is not complete, allow access to the onboarding page
            return <Component {...props} />;
          }
        } else {
          // If on any other protected route:
          if (!onboardingComplete && rest.path !== '/logout') {
            // If onboarding is not complete, redirect to onboarding
            console.log("Authenticated user needs onboarding, redirecting to /onboarding");
            return <Redirect to="/onboarding" />;
          } else {
            // If onboarding is complete, allow access to the requested route
            return <Component {...props} />;
          }
        }
      }}
    />
  );
};

// AnimatedRoutes Component
const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated, loading } = useContext(AuthContext);

  const isAuthOrOnboardingPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/onboarding';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Only show header if not on auth or onboarding pages */}
      {!isAuthOrOnboardingPage && <Header />}
      <main className={`flex-grow ${!isAuthOrOnboardingPage ? 'pt-16' : ''}`}>
        <AnimatePresence mode="wait">
          <Switch location={location} key={location.pathname}>
            {/* Root path - always redirect to login if not authenticated, dashboard if authenticated */}
            <Route exact path="/">
              {loading ? <Loader /> : isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
            </Route>
            
            {/* Auth routes */}
            <Route path="/login">
              {loading ? <Loader /> : isAuthenticated ? <Redirect to="/dashboard" /> : <Login />}
            </Route>
            <Route path="/register">
              {loading ? <Loader /> : isAuthenticated ? <Redirect to="/dashboard" /> : <Register />}
            </Route>
            <Route path="/logout" component={Logout} />
            
            {/* Protected routes */}
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/profile" component={ProfilePage} />
            <ProtectedRoute path="/feed" component={Feed} />
            <ProtectedRoute path="/records" component={RecordsPage} />
            <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
            <ProtectedRoute path="/settings" component={SettingsPage} />
            <ProtectedRoute path="/coach" component={CoachDashboard} />
            <ProtectedRoute path="/chat" component={ChatPage} />
            <ProtectedRoute path="/onboarding" component={OnboardingPage} />
          </Switch>
        </AnimatePresence>
      </main>
      {/* Only show footer if not on auth or onboarding pages */}
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