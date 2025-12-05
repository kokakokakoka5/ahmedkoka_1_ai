
import React, { useState, useEffect } from 'react';
import { Sparkles, Instagram, Phone, User, Lock, ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(true); // Will update in useEffect
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const USERS_KEY = 'ahmedkoka_users_db';

  useEffect(() => {
    // Check if we have existing users. If so, default to LOGIN screen to save time.
    const usersStr = localStorage.getItem(USERS_KEY);
    if (usersStr && Object.keys(JSON.parse(usersStr)).length > 0) {
        setIsRegistering(false);
    } else {
        setIsRegistering(true);
    }
  }, []);

  // Clear error when switching modes
  useEffect(() => {
    setError('');
  }, [isRegistering]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
        try {
            const usersStr = localStorage.getItem(USERS_KEY);
            const users = usersStr ? JSON.parse(usersStr) : {};
            const cleanUsername = username.trim();

            if (!cleanUsername || !password.trim()) {
                throw new Error("Please enter both username and password.");
            }

            if (isRegistering) {
                // Registration Logic
                if (users[cleanUsername]) {
                    throw new Error("This username is taken. Please Login instead.");
                }
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match.");
                }

                // Save new user
                users[cleanUsername] = password;
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
                
                // Auto login
                onLogin(cleanUsername);
            } else {
                // Login Logic
                if (!users[cleanUsername]) {
                    throw new Error("Username not found. Please Register first.");
                }
                // Check password exactly
                if (users[cleanUsername] !== password) {
                    throw new Error("Incorrect password.");
                }

                // Success
                onLogin(cleanUsername);
            }
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    }, 800); 
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-700">
      <div className="w-full max-w-md bg-[#121212]/90 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden group">
        
        {/* Animated Background Accents */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-[gradient_3s_linear_infinite] bg-[length:200%_100%]"></div>
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px] group-hover:bg-blue-600/30 transition-all duration-1000"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-600/20 rounded-full blur-[80px] group-hover:bg-purple-600/30 transition-all duration-1000"></div>

        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl relative z-10 border border-white/20 transform hover:scale-110 transition-transform duration-300">
                 <Sparkles size={36} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-400 mb-8 text-sm font-light">
            {isRegistering ? 'Your identity in the ahmedkoka_1_ai universe' : 'Continue your journey with ahmedkoka_1_ai'}
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl text-left flex items-center gap-2 animate-in slide-in-from-left-2 shadow-lg">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="relative group">
                    <User className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-blue-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                    />
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-blue-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                    />
                </div>

                {isRegistering && (
                    <div className="relative group animate-in slide-in-from-top-4 fade-in duration-500">
                        <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                        <input 
                            type="password" 
                            placeholder="Confirm Password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-blue-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                        />
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] hover:bg-[100%_0] hover:scale-[1.02] text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-6 shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-[gradient_3s_ease_infinite]"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        {isRegistering ? 'Create Account' : 'Access System'}
                        <ArrowRight size={18} />
                    </>
                )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
            <span>{isRegistering ? 'Already have an account?' : "Don't have an account?"}</span>
            <button 
                onClick={() => {
                    setIsRegistering(!isRegistering);
                    setUsername('');
                    setPassword('');
                    setConfirmPassword('');
                }}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1 hover:underline underline-offset-4"
            >
                {isRegistering ? (
                    <> <LogIn size={14} /> Login </>
                ) : (
                    <> <UserPlus size={14} /> Create one </>
                )}
            </button>
          </div>

          {/* Developer Info Footer */}
          <div className="mt-8 pt-6 border-t border-white/5 w-full flex flex-col items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
               <User size={12} className="text-blue-400"/>
               <span>Developer: <span className="text-gray-300 font-medium">Ahmed Mohamed</span></span>
            </div>
            <div className="flex gap-4">
                <div className="flex items-center gap-1.5 hover:text-green-400 transition-colors cursor-pointer">
                    <Phone size={12} className="text-green-500"/>
                    <span>01149788432</span>
                </div>
                <a 
                href="https://www.instagram.com/ahmedkoka_1?igsh=enFkcGhoNWdsZmwx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 transition-colors"
                >
                <Instagram size={12} />
                <span>@ahmedkoka_1</span>
                </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
