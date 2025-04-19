const express = require('express');
const { 
    createWorkout,
    getWorkouts,
    getWorkoutById,
    updateWorkout,
    deleteWorkout,
    createChallenge,
    getChallenges,
    getChallengeById,
    updateChallenge,
    deleteChallenge
} = require('../controllers/coachController');
const { authenticate, isCoach } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and coach role check to all routes
router.use(authenticate, isCoach);

// Workout routes
router.post('/workouts', createWorkout);
router.get('/workouts', getWorkouts);
router.get('/workouts/:id', getWorkoutById);
router.put('/workouts/:id', updateWorkout);
router.delete('/workouts/:id', deleteWorkout);

// Challenge routes
router.post('/challenges', createChallenge);
router.get('/challenges', getChallenges);
router.get('/challenges/:id', getChallengeById);
router.put('/challenges/:id', updateChallenge);
router.delete('/challenges/:id', deleteChallenge);

module.exports = router;
