import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { processGoogleAuth } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        // Get token and userId from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userId = urlParams.get('userId');

        if (!token || !userId) {
          toast({
            title: "Authentication Error",
            description: "Invalid authentication parameters",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        // Use the processGoogleAuth function for Google OAuth
        await processGoogleAuth(token, userId);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error processing authentication:', error);
        toast({
          title: "Authentication Failed",
          description: "There was a problem signing you in. Please try again.",
          variant: "destructive"
        });
        navigate('/login');
      }
    };

    handleAuthSuccess();
  }, [navigate, processGoogleAuth, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Processing your login...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthSuccess;