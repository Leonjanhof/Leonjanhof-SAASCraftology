import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabase/supabase';
import { toast } from '@/components/ui/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { searchParams } = new URL(window.location.href);
        const code = searchParams.get('code');
        const next = searchParams.get('next') ?? '/dashboard';

        if (code) {
          // Exchange the code for a session
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          if (sessionError) throw sessionError;

          // Fetch the user data after successful authentication
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          
          if (user) {
            // Check if user exists in our users table
            const { data: existingUser, error: checkError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();

            if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected for new users
              console.error("Error checking existing user:", checkError);
              throw checkError;
            }

            if (!existingUser) {
              // Get Discord-specific user data from the metadata
              const discordData = user.user_metadata;
              
              // Create new user record - role will be created by trigger
              const { error: insertError } = await supabase
                .from("users")
                .insert({
                  id: user.id,
                  email: user.email,
                  full_name: discordData.full_name || discordData.name || discordData.username,
                  avatar_url: discordData.avatar_url, // Discord avatar
                  token_identifier: user.id,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });

              if (insertError) {
                console.error("Error creating user record:", insertError);
                throw insertError;
              }

              toast({
                title: "Account Created",
                description: "Your account has been successfully created and you are now signed in.",
                variant: "default",
              });
            } else {
              toast({
                title: "Welcome Back",
                description: "You have successfully signed in.",
                variant: "default",
              });
            }
          }

          navigate(next);
        }
      } catch (error: any) {
        console.error('Error in auth callback:', error);
        toast({
          title: "Authentication Error",
          description: error.message || "There was a problem signing you in. Please try again.",
          variant: "destructive",
        });
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Signing you in...</h2>
        <p className="text-sm text-gray-500">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
} 