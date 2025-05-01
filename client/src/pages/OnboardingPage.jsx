import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Stepper, { Step } from '../components/onboarding/OnboardingStepper';
import { AuthContext } from '../context/AuthContext.jsx';
import { updateUserProfile } from '../utils/api';
import Loader from '../components/common/Loader';
import '../components/common/ButtonFixes.css'; // Add this import

// Material UI for form elements
import { TextField, Select, MenuItem, FormControl, InputLabel, RadioGroup, Radio } from '@mui/material';

const OnboardingPage = () => {
  const { user, login } = useContext(AuthContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Personal info
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username ? '@' + user?.username : '',
    city: user?.city || '',
    country: user?.country || '',
    
    // Role
    role: user?.role || '',
    
    // Swimmer specific
    favoriteStroke: user?.favoriteStroke || 'freestyle',
    favoriteEvent: user?.favoriteEvent || '100m Freestyle',
    
    // Coach specific
    team: user?.swimTeam || '',
    coachRole: user?.coachRole || 'assistant',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [followedUsers, setFollowedUsers] = useState({});

  // Determine theme based on selected role
  const theme = formData.role === 'coach' ? 'purple' : 'blue';

  // Redirect if user data is missing or onboarding is already complete
  useEffect(() => {
    if (!user) {
      console.log("No user found, redirecting to login");
      history.push('/login');
      return;
    }

    // Check the onboardingComplete flag from the context
    if (user.onboardingComplete === true) {
      console.log("User already completed onboarding (context check), redirecting to dashboard");
      history.push('/dashboard');
    }
  }, [user, history]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData(prev => ({ ...prev, role: newRole }));
    
    // Reset fields specific to the other role
    if (newRole === 'swimmer') {
      setFormData(prev => ({ ...prev, team: '', coachRole: 'assistant' }));
    } else if (newRole === 'coach') {
      setFormData(prev => ({ ...prev, favoriteStroke: 'freestyle', favoriteEvent: '100m Freestyle' }));
    }
  };

  const handleFollowToggle = (userId) => {
    setFollowedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      // Clean up form data before submission
      const submissionData = {
        ...formData,
        username: formData.username.startsWith('@') ? formData.username.substring(1) : formData.username,
        swimTeam: formData.team || formData.swimTeam,
        onboardingComplete: true // Explicitly set onboardingComplete to true
      };
      delete submissionData.team; // Remove the temporary 'team' field if it exists

      const response = await updateUserProfile(submissionData);

      if (response.status === 'success' && response.data) {
        // Update the user in context with the *full* response data from the API
        // This ensures onboardingComplete and all other fields are correctly set
        const updatedUserFromApi = {
          ...user, // Keep existing user data like ID
          ...response.data, // Overwrite with the latest data from the API response
          onboardingComplete: true // Ensure this is explicitly true in the context update
        };
        login(updatedUserFromApi); // Update the context

        // Redirect to dashboard AFTER context update
        history.push('/dashboard');
      } else {
        setError(response.message || 'Failed to update profile. Please try again.');
        setLoading(false); // Stop loading on failure
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      console.error('Error in onboarding:', err);
      setLoading(false); // Stop loading on error
    }
  };

  // Recommendation data
  const swimmerRecommendations = [
    { id: 'rec1', name: 'Michael Phelps', team: 'Retired Legend', profileImage: '/images/placeholder-avatar-1.png' },
    { id: 'rec2', name: 'Katie Ledecky', team: 'Team USA', profileImage: '/images/placeholder-avatar-2.png' },
    { id: 'rec3', name: 'Caeleb Dressel', team: 'Team USA', profileImage: '/images/placeholder-avatar-3.png' },
  ];
  
  const coachRecommendations = [
    { id: 'rec4', name: 'Alex Popov', team: 'City Swim Club', profileImage: '/images/placeholder-avatar-1.png' },
    { id: 'rec5', name: 'Inge de Bruijn', team: 'University Team', profileImage: '/images/placeholder-avatar-2.png' },
  ];

  const recommendations = formData.role === 'coach' ? coachRecommendations : swimmerRecommendations;
  const recommendationTitle = formData.role === 'coach' ? 'Connect with Swimmers' : 'Follow Swimmers';

  // Swimming events for dropdown
  const swimmingEvents = [
    // Freestyle events
    '50m Freestyle', '100m Freestyle', '200m Freestyle', '400m Freestyle', '800m Freestyle', '1500m Freestyle',
    // Backstroke events
    '50m Backstroke', '100m Backstroke', '200m Backstroke',
    // Breaststroke events
    '50m Breaststroke', '100m Breaststroke', '200m Breaststroke',
    // Butterfly events
    '50m Butterfly', '100m Butterfly', '200m Butterfly',
    // Individual Medley events
    '100m Individual Medley', '200m Individual Medley', '400m Individual Medley',
    // Open water
    '5km Open Water', '10km Open Water',
  ];

  if (!user) {
    return <Loader />;
  }

  return (
    <div
      className="onboarding-container"
      style={{
        minHeight: '100vh',
        backgroundImage: 'url(/images/swimming-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stepper
        initialStep={currentStep}
        onStepChange={setCurrentStep}
        onFinalStepCompleted={handleSubmit}
        theme={theme}
        disableStepIndicators={loading}
        completeButtonText={loading ? 'Saving...' : 'Go to Dashboard'}
        nextButtonProps={{ disabled: loading }}
        backButtonProps={{ disabled: loading }}
      >
        {/* Step 1: Personal Information */}
        <Step>
          <h2>Welcome to SwimSphere!</h2>
          <p>Let's start with your personal information.</p>
          
          <div className="form-group">
            <TextField
              placeholder="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
          </div>
          
          <div className="form-group">
            <TextField
              placeholder="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
          </div>
          
          <div className="form-group">
            <TextField
              placeholder="Username Tag"
              name="username"
              value={formData.username || '@' + (user?.username || '')}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: formData.username && !formData.username.startsWith('@') ? 
                  <span>@</span> : undefined
              }}
            />
          </div>
          
          <div className="form-group">
            <TextField
              placeholder="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </div>
          
          <div className="form-group">
            <TextField
              placeholder="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </div>
        </Step>

        {/* Step 2: Role Selection */}
        <Step>
          <h2>Are you a Swimmer or a Coach?</h2>
          <p>This helps us tailor your experience.</p>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              aria-label="role"
              name="role"
              value={formData.role}
              onChange={handleRoleChange}
              className="role-selection"
            >
              <label className={`role-option ${formData.role === 'swimmer' ? 'selected' : ''}`}>
                <Radio value="swimmer" />
                <div>
                  <h3>Swimmer</h3>
                  <p>Track your times, connect with others, and analyze performance.</p>
                </div>
              </label>
              <label className={`role-option ${formData.role === 'coach' ? 'selected' : ''}`}>
                <Radio value="coach" />
                <div>
                  <h3>Coach</h3>
                  <p>Manage your team, create workouts, and monitor swimmer progress.</p>
                </div>
              </label>
            </RadioGroup>
          </FormControl>
        </Step>

        {/* Step 3: Role-specific details */}
        {/* For swimmers */}
        {formData.role === 'swimmer' && (
          <Step>
            <h2>Swimmer Details</h2>
            <p>Tell us about your swimming preferences.</p>
            <FormControl fullWidth variant="outlined" className="form-group">
              <InputLabel id="favorite-stroke-label" shrink>Favorite Stroke</InputLabel>
              <Select
                labelId="favorite-stroke-label"
                id="favoriteStroke"
                name="favoriteStroke"
                value={formData.favoriteStroke}
                onChange={handleChange}
                label="Favorite Stroke"
              >
                <MenuItem value="freestyle">Freestyle</MenuItem>
                <MenuItem value="backstroke">Backstroke</MenuItem>
                <MenuItem value="breaststroke">Breaststroke</MenuItem>
                <MenuItem value="butterfly">Butterfly</MenuItem>
                <MenuItem value="individualMedley">Individual Medley</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined" className="form-group">
              <InputLabel id="favorite-event-label" shrink>Favorite Event</InputLabel>
              <Select
                labelId="favorite-event-label"
                id="favoriteEvent"
                name="favoriteEvent"
                value={formData.favoriteEvent}
                onChange={handleChange}
                label="Favorite Event"
              >
                {swimmingEvents.map(event => (
                  <MenuItem key={event} value={event}>{event}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Step>
        )}

        {/* For coaches */}
        {formData.role === 'coach' && (
          <Step>
            <h2>Coach Details</h2>
            <p>Tell us about your coaching role.</p>
            <div className="form-group">
              <TextField
                label="Swim Team Name"
                name="team"
                value={formData.team}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                placeholder="e.g., City Swim Club"
              />
            </div>
            <FormControl fullWidth variant="outlined" className="form-group">
              <InputLabel id="coach-role-label" shrink>Your Role</InputLabel>
              <Select
                labelId="coach-role-label"
                id="coachRole"
                name="coachRole"
                value={formData.coachRole}
                onChange={handleChange}
                label="Your Role"
              >
                <MenuItem value="head">Head Coach</MenuItem>
                <MenuItem value="assistant">Assistant Coach</MenuItem>
                <MenuItem value="volunteer">Volunteer Coach</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Step>
        )}

        {/* Step 4: Recommendations */}
        <Step>
          <h2>Almost Finished!</h2>
          <p>{recommendationTitle}</p>
          <div className="recommendation-list">
            {recommendations.map(rec => (
              <div key={rec.id} className="recommendation-item">
                <img src={rec.profileImage || '/images/default-avatar.png'} alt={rec.name} />
                <div className="recommendation-info">
                  <h4>{rec.name}</h4>
                  {rec.team && <p>{rec.team}</p>}
                </div>
                <button
                  onClick={() => handleFollowToggle(rec.id)}
                  className={`follow-button ${followedUsers[rec.id] ? 'following' : ''}`}
                >
                  {followedUsers[rec.id] ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
            {recommendations.length === 0 && <p>No recommendations available right now.</p>}
          </div>
        </Step>

        {/* Step 5: Final step */}
        <Step>
          <div className="final-step-content">
            <h2>All Set!</h2>
            <p>Your profile is ready. Let's dive into SwimSphere!</p>
            {loading && <Loader />}
            {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
          </div>
        </Step>
      </Stepper>
    </div>
  );
};

export default OnboardingPage;
