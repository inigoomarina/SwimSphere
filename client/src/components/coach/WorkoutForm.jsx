import React, { useState } from 'react';
import Button from '../common/Button';

const WorkoutForm = ({ onSubmit, workout = null, loading }) => {
    const [formData, setFormData] = useState({
        title: workout?.title || '',
        description: workout?.description || '',
        duration: workout?.duration || 30,
        distance: workout?.distance || 1000,
        difficulty: workout?.difficulty || 'intermediate',
        focusArea: workout?.focusArea || 'mixed',
        exercises: workout?.exercises || []
    });
    
    const [mediaFile, setMediaFile] = useState(null);
    const [currentExercise, setCurrentExercise] = useState({
        name: '',
        reps: 1,
        distance: 50,
        notes: ''
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleFileChange = (e) => {
        setMediaFile(e.target.files[0]);
    };
    
    const handleAddExercise = () => {
        if (!currentExercise.name) return;
        
        setFormData(prev => ({
            ...prev,
            exercises: [...prev.exercises, {...currentExercise}]
        }));
        
        setCurrentExercise({
            name: '',
            reps: 1,
            distance: 50,
            notes: ''
        });
    };
    
    const handleExerciseChange = (e) => {
        const { name, value } = e.target;
        setCurrentExercise(prev => ({
            ...prev,
            [name]: name === 'name' || name === 'notes' ? value : parseInt(value)
        }));
    };
    
    const removeExercise = (index) => {
        setFormData(prev => ({
            ...prev,
            exercises: prev.exercises.filter((_, i) => i !== index)
        }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        onSubmit({
            ...formData,
            mediaFile
        });
    };
    
    return (
        <form onSubmit={handleSubmit} className="workout-form">
            <div className="form-group">
                <label htmlFor="title">Workout Title*</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter workout title"
                    required
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="description">Description*</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter workout description"
                    rows="4"
                    required
                />
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="duration">Duration (minutes)*</label>
                    <input
                        type="number"
                        id="duration"
                        name="duration"
                        min="1"
                        value={formData.duration}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="distance">Distance (meters)*</label>
                    <input
                        type="number"
                        id="distance"
                        name="distance"
                        min="25"
                        step="25"
                        value={formData.distance}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="difficulty">Difficulty Level</label>
                    <select
                        id="difficulty"
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                    >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label htmlFor="focusArea">Focus Area</label>
                    <select
                        id="focusArea"
                        name="focusArea"
                        value={formData.focusArea}
                        onChange={handleChange}
                    >
                        <option value="mixed">Mixed</option>
                        <option value="endurance">Endurance</option>
                        <option value="speed">Speed</option>
                        <option value="technique">Technique</option>
                        <option value="recovery">Recovery</option>
                    </select>
                </div>
            </div>
            
            <div className="form-group">
                <label htmlFor="workout-media">Workout Media (optional)</label>
                <input
                    type="file"
                    id="workout-media"
                    name="workout-media"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                />
                <small>Upload an image or video to demonstrate the workout</small>
            </div>
            
            <div className="exercises-section">
                <h3>Exercises</h3>
                
                {formData.exercises.length > 0 && (
                    <div className="exercises-list">
                        {formData.exercises.map((exercise, index) => (
                            <div key={index} className="exercise-item">
                                <div className="exercise-details">
                                    <strong>{exercise.name}</strong> - {exercise.reps} reps, {exercise.distance}m
                                    {exercise.notes && <p className="exercise-notes">{exercise.notes}</p>}
                                </div>
                                <Button 
                                    type="button" 
                                    className="remove-exercise-btn"
                                    onClick={() => removeExercise(index)}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="add-exercise">
                    <div className="form-row">
                        <div className="form-group">
                            <input
                                type="text"
                                name="name"
                                placeholder="Exercise Name"
                                value={currentExercise.name}
                                onChange={handleExerciseChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <input
                                type="number"
                                name="reps"
                                placeholder="Reps"
                                value={currentExercise.reps}
                                onChange={handleExerciseChange}
                                min="1"
                            />
                        </div>
                        
                        <div className="form-group">
                            <input
                                type="number"
                                name="distance"
                                placeholder="Distance (m)"
                                value={currentExercise.distance}
                                onChange={handleExerciseChange}
                                min="25"
                                step="25"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="text"
                            name="notes"
                            placeholder="Notes (optional)"
                            value={currentExercise.notes}
                            onChange={handleExerciseChange}
                        />
                    </div>
                    
                    <Button 
                        type="button" 
                        onClick={handleAddExercise}
                        className="add-exercise-btn"
                        disabled={!currentExercise.name}
                    >
                        Add Exercise
                    </Button>
                </div>
            </div>
            
            <div className="form-actions">
                <Button 
                    type="submit" 
                    className="submit-workout-btn"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : (workout ? 'Update Workout' : 'Create Workout')}
                </Button>
            </div>
        </form>
    );
};

export default WorkoutForm;
