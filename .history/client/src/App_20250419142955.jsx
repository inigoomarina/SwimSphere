import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthContext } from './context/AuthContext'; // Changed from default to named import
import { ToastProvider } from './context/ToastContext';
import { ChatProvider } from './context/ChatContext';

// Page imports
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/dashboard/Dashboard';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import Feed from './pages/Feed';
import RecordsPage from './pages/RecordsPage';
import Logout from './pages/Logout';
import CoachDashboard from './pages/coach/CoachDashboard';
import ChatPage from './pages/ChatPage';
import OnboardingPage from './pages/OnboardingPage';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Protected Route component
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  return (
    <Route
      {...rest}
      render={(props) =>
        loading ? (
          <div>Loading...</div>
        ) : user ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ChatProvider>
            <div className="app-container">
              <Header />
              <main className="main-content">
                <Switch>
                  <Route exact path="/" component={Home} />
                  <Route path="/login" component={Login} />
                  <Route path="/register" component={Register} />
                  <ProtectedRoute path="/dashboard" component={Dashboard} />
                  <ProtectedRoute path="/profile/:userId?" component={ProfilePage} />
                  <ProtectedRoute path="/settings" component={SettingsPage} />
                  <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
                  <ProtectedRoute path="/feed" component={Feed} />
                  <ProtectedRoute path="/records" component={RecordsPage} />
                  <ProtectedRoute path="/logout" component={Logout} />
                  <ProtectedRoute path="/coach" component={CoachDashboard} />
                  <ProtectedRoute path="/chat" component={ChatPage} />
                  <ProtectedRoute path="/onboarding" component={OnboardingPage} />
                </Switch>
              </main>
              <Footer />
            </div>
          </ChatProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;