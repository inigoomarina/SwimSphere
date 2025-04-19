# SwimSphere - Swimming Performance Tracker

A comprehensive web application designed for swimmers, coaches, and swimming enthusiasts.

## How to Run the Project

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local instance or MongoDB Atlas account)

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd SwimSphere

# Install root dependencies
npm install
```

### Step 2: Set Up and Run the Backend

```bash
# Navigate to the server directory
cd server

# Install backend dependencies
npm install

# Create .env file from example
# On Windows:
copy .env.example .env
# On macOS/Linux:
# cp .env.example .env

# Edit the .env file to use a local MongoDB instance:
# MONGO_URI=mongodb://localhost:27017/swimsphere

# Then start the server
npm start
```

The backend will run on http://localhost:5000

### Step 3: Set Up and Run the Frontend

```bash
# Open a new terminal window/tab
# Navigate to the client directory
cd client  # (or cd ../client if you're still in the server directory)

# Install frontend dependencies - use the --legacy-peer-deps flag to avoid compatibility issues
npm install --legacy-peer-deps

# Install additional required dependencies for UI enhancements
npm install --save @mui/x-date-pickers @mui/lab dayjs framer-motion react-icons --legacy-peer-deps

# Create .env file from example
# On Windows:
copy .env.example .env
# On macOS/Linux:
# cp .env.example .env

# Fix security vulnerabilities:
npm audit fix --force
# For remaining vulnerabilities, add specific overrides:
npm install --save-dev --legacy-peer-deps nth-check@2.1.1 postcss@8.4.31

# Start the React development server
npm start
```

The frontend will run on http://localhost:3000

### Step 4: Set Up Google OAuth Authentication

1. **Create OAuth credentials**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application" as the application type
   - Add "http://localhost:3000" to the authorized JavaScript origins
   - Add "http://localhost:5000/api/auth/google-login" to the authorized redirect URIs
   - Click "Create" and note your Client ID and Client Secret

2. **Configure environment variables**:
   - In `client/.env`, update the Google Client ID:
     ```
     REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
     ```
   - In `server/.env`, update the Google credentials:
     ```
     GOOGLE_CLIENT_ID=your_google_client_id_here
     GOOGLE_CLIENT_SECRET=your_google_client_secret_here
     ```

3. **Restart both servers** after updating the environment variables.

### Step 5: Access the Application
Open your browser and navigate to:
http://localhost:3000

## Running Both Simultaneously

You can also run both backend and frontend concurrently from the root directory:

```bash
npm run dev
```

## Handling Security Vulnerabilities

The client dependencies have several security vulnerabilities. Here are your options:

1. **For development only**: You can ignore these warnings as they primarily affect production builds
2. **Quick fix**: Run `npm audit fix --force` in the client directory (may cause breaking changes)
3. **Recommended fix**: Update react-scripts to version 5.0.1 and install all required dependencies:
   ```bash
   cd client
   # Update react-scripts to 5.0.1
   npm install react-scripts@5.0.1 --legacy-peer-deps
   
   # Install missing dependencies that might occur after the upgrade
   npm install --legacy-peer-deps chart.js@3.9.1 react-chartjs-2@4.3.1 socket.io-client
   
   # Fix remaining vulnerabilities
   npm install --save-dev --legacy-peer-deps nth-check@2.1.1 postcss@8.4.31
   ```

## Troubleshooting

If you encounter "Module not found" errors after updating dependencies:

1. Check for missing dependencies in the error message
2. Install them using: `npm install --legacy-peer-deps [package-name]`
3. For chart.js related issues, make sure to install compatible versions:
   ```bash
   npm install --legacy-peer-deps chart.js@3.9.1 react-chartjs-2@4.3.1
   ```

4. If you see ESLint warnings, you can either:
   - Fix the issues in the code
   - Add `/* eslint-disable */` at the top of problematic files (development only)
   - Create or update `.eslintrc.js` to adjust the rules

### Persistent Security Vulnerabilities

If you still see security vulnerabilities after running the recommended fixes:

1. **Run the enhanced fixer script**:
   ```bash
   npm run fix-deps
   ```

2. **Apply manual overrides**:
   Add the following to your package.json:
   ```json
   "overrides": {
     "nth-check": "^2.1.1",
     "postcss": "^8.4.31",
     "css-select": "^5.1.0", 
     "svgo": "^3.3.2",
     "semver": "^7.5.4",
     "terser": "^5.14.2",
     "tough-cookie": "^4.1.3",
     "webpack-dev-middleware": "^5.3.4",
     "shell-quote": "^1.7.3"
   }
   ```

3. **Clean and reinstall**:
   ```bash
   npm cache clean --force
   rm -rf node_modules  # or "rmdir /s /q node_modules" on Windows
   npm install --legacy-peer-deps
   ```

## Features

- User Authentication
- Performance Tracking
- Visual Analytics
- Global Leaderboards
- Swimming Records
- Social Feed
- Real-time Chat
- Coach Dashboard
- Responsive Design
- Animated Toast Notifications
- Material UI Components

## License
This project is licensed under the MIT License.