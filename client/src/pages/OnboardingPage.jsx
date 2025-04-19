import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Stepper, { Step } from '../components/onboarding/OnboardingStepper';
import { AuthContext } from '../context/AuthContext';
import { updateUserProfile } from '../utils/api'; // Assuming you have this
import Loader from '../components/common/Loader'; // Assuming you have a Loader

// Material UI for form elements (optional, can use plain HTML)
import { TextField, Select, MenuItem, FormControl, InputLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const OnboardingPage = () => {
  const { user, login } = useContext(AuthContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    role: user?.role || '',
    // Swimmer specific
    favoriteStroke: user?.favoriteStroke || 'freestyle',
    // Coach specific
    team: user?.swimTeam || '',
    coachRole: user?.coachRole || 'assistant', // e.g., head, assistant, volunteer
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [followedUsers, setFollowedUsers] = useState({}); // Track followed state

  // Determine theme based on selected role
  const theme = formData.role === 'coach' ? 'purple' : 'blue';

  // Redirect if user data is missing or already onboarded (basic check)
  useEffect(() => {
    if (!user) {
      history.push('/login');
      return;
    }
    
    // If user has completed onboarding before (check for role or other onboarding flags)
    if (user.role && user.firstName && user.lastName) {
      // This is a returning user who already completed onboarding
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
    // Reset fields specific to the *other* role if needed
    if (newRole === 'swimmer') {
      setFormData(prev => ({ ...prev, team: '', coachRole: 'assistant' }));
    } else if (newRole === 'coach') {
      setFormData(prev => ({ ...prev, favoriteStroke: 'freestyle' }));
    }
  };

  const handleFollowToggle = (userId) => {
    setFollowedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
    // Here you might call an API to actually follow/unfollow the user
    // console.log(`${followedUsers[userId] ? 'Unfollowed' : 'Followed'} user ${userId}`);
  };

  const handleFinalStep = async () => {
    setLoading(true);
    setError('');
    try {
      // Prepare data based on role
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        ...(formData.role === 'swimmer' && { favoriteStroke: formData.favoriteStroke }),
        ...(formData.role === 'coach' && { swimTeam: formData.team, coachRole: formData.coachRole }),
        // Add flag to indicate onboarding is complete
        onboardingComplete: true,
      };

      const response = await updateUserProfile(profileData);

      if (response.status === 'success') {
        // Update user context with the latest data
        login(response.data);
        // Redirect to dashboard after a short delay to show the final step message
        setTimeout(() => {
          history.push('/dashboard');
        }, 1500); // 1.5 second delay
      } else {
        setError(response.message || 'Failed to update profile.');
        setLoading(false); // Stop loading on error
      }
    } catch (err) {
      setError('An error occurred while saving your profile.');
      console.error(err);
      setLoading(false); // Stop loading on error
    }
  };

  // Placeholder recommendations
  const swimmerRecommendations = [
    { id: 'rec1', name: 'Michael Phelps', team: 'Retired Legend', profileImage: '/placeholder-avatar-1.png' },
    { id: 'rec2', name: 'Katie Ledecky', team: 'Team USA', profileImage: '/placeholder-avatar-2.png' },
    { id: 'rec3', name: 'Caeleb Dressel', team: 'Team USA', profileImage: '/placeholder-avatar-3.png' },
  ];
  const coachRecommendations = [
    { id: 'rec4', name: 'Alex Popov', team: 'City Swim Club', profileImage: '/placeholder-avatar-1.png' },
    { id: 'rec5', name: 'Inge de Bruijn', team: 'University Team', profileImage: '/placeholder-avatar-2.png' },
  ];

  const recommendations = formData.role === 'coach' ? coachRecommendations : swimmerRecommendations;
  const recommendationTitle = formData.role === 'coach' ? 'Connect with Swimmers' : 'Follow Swimmers';

  if (!user) {
    return <Loader />; // Show loader while user data is loading or redirecting
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
        onFinalStepCompleted={handleFinalStep}
        theme={theme} // Pass theme to Stepper
        disableStepIndicators={loading} // Disable steps while loading final step
        completeButtonText={loading ? 'Saving...' : 'Go to Dashboard'}
        nextButtonProps={{ disabled: loading }}
        backButtonProps={{ disabled: loading }}
      >
        {/* Step 1: Name */}
        <Step>
          <h2>Welcome to SwimSphere!</h2>
          <p>Let's get your profile set up. What's your name?</p>
          <div className="form-group">
            <TextField
              label="First Name"
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
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
          </div>
        </Step>

        {/* Step 2: Role */}
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

        {/* Step 3: Swimmer Details */}
        {formData.role === 'swimmer' && (
          <Step>
            <h2>Swimmer Details</h2>
            <p>Tell us a bit about your swimming.</p>
            <FormControl fullWidth variant="outlined" className="form-group">
              <InputLabel id="favorite-stroke-label">Favorite Stroke</InputLabel>
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
            {/* Add more swimmer-specific questions here if needed */}
          </Step>
        )}

        {/* Step 3: Coach Details */}
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
              <InputLabel id="coach-role-label">Your Role</InputLabel>
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
                <img src={rec.profileImage || '/default-avatar.png'} alt={rec.name} />
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

        {/* Step 5: All Set */}
        <Step>
          <div className="final-step-content">
            <h2>All Set!</h2>
            <p>Your profile is ready. Let's dive into SwimSphere!</p>
            {/* The main "Complete" button of the stepper handles the final action */}
            {loading && <Loader />}
            {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
          </div>
        </Step>
      </Stepper>
    </div>
  );
};

export default OnboardingPage;
