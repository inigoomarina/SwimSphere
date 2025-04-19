import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ChatProvider } from './context/ChatContext';

// Page imports - start with only necessary ones
import Home from './pages/Home';

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
              <main className="main-content">
                <Switch>
                  <Route exact path="/" component={Home} />
                  {/* Add other routes back once we fix the error */}
                </Switch>
              </main>
            </div>
          </ChatProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;