// Main App Component with Routing
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import FollowList from './pages/FollowList';
import Following from './pages/Following';
import Explore from './pages/Explore';
import Settings from './pages/Settings';
import SearchResults from './pages/SearchResults';
import GroupPage from './pages/GroupPage';


// Protected Route Component - only accessible when logged in
function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// Public Route Component - only accessible when NOT logged in
function PublicRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated() ? children : <Navigate to="/feed" replace />;
}

function AppContent() {
    return (
        <Routes>
            {/* Default route - redirect to login or feed */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public routes (only accessible when NOT logged in) */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />

            {/* Protected routes (only accessible when logged in) */}
            <Route
                path="/feed"
                element={
                    <ProtectedRoute>
                        <Feed />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile/:userId"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile/:userId/:type"
                element={
                    <ProtectedRoute>
                        <FollowList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/following"
                element={
                    <ProtectedRoute>
                        <Following />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/explore"
                element={
                    <ProtectedRoute>
                        <Explore />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/SearchResults"
                element={
                    <ProtectedRoute>
                        <SearchResults />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/group/:groupId"
                element={
                    <ProtectedRoute>
                        <GroupPage />
                    </ProtectedRoute>
                }
            />


            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;