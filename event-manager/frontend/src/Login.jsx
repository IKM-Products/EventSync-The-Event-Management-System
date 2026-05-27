import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  // view can be: 'login', 'signup', or 'forgot'
  const [view, setView] = useState('login');
  // role can be: 'User' or 'Admin'
  const [role, setRole] = useState('User');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(`Submitting ${view} request for role: ${role}`);

    if (view === 'signup') {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      
      try {
        const response = await fetch('http://localhost:5000/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role, fullName }),
        });
        const data = await response.json();
        if (data.success) {
          alert("Account created successfully! Switching to Login.");
          setView('login');
        } else {
          alert(data.message || "Failed to create account.");
        }
      } catch (err) {
        console.error("Signup network error:", err);
        alert("Unable to reach the server. Ensure the backend is running on port 5000.");
      }

    } else if (view === 'forgot') {
      try {
        const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (data.success) {
          alert(`A password reset link has been successfully sent to: ${email}`);
          setView('login');
        } else {
          alert(data.message || "Failed to process password reset request.");
        }
      } catch (err) {
        console.error("Forgot password network error:", err);
        alert("Unable to reach the server. Ensure the backend is running on port 5000.");
      }

    } else {
      // Login flow
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role }),
        });
        const data = await response.json();
        if (data.success) {
          console.log("Authentication successful! Token received:", data.token);
          
          onLoginSuccess({ 
            email: data.user.email, 
            role: data.user.role, 
            fullName: data.user.fullName, 
            token: data.token 
          });
        } else {
          alert(data.message || "Invalid credentials. Please try again.");
        }
      } catch (err) {
        console.error("Login network error:", err);
        alert("Unable to reach the server. Ensure the backend is running on port 5000.");
      }
    }
  };

  return (
    /* Uses fixed positioning and inset-0 to guarantee it covers every single pixel of the screen */
    <div className="fixed inset-0 min-w-full min-h-full bg-gradient-to-tr from-[#DCE6EE] via-[#EBF1F6] to-[#F1F5F9] flex items-center justify-center p-6 font-sans tracking-tight antialiased text-left m-0 overflow-y-auto">
      
      {/* Main Centered Card Panel */}
      <div className="bg-white rounded-[32px] shadow-2xl shadow-blue-900/5 w-full max-w-4xl min-h-[540px] grid grid-cols-1 md:grid-cols-2 overflow-hidden p-8 md:p-12 items-center gap-8 border border-white/60 my-auto">
        
        {/* LEFT COLUMN: Vector Illustration Area */}
        <div className="hidden md:flex flex-col items-center justify-center w-full h-full relative p-4 bg-[#F8FAFC] rounded-[24px] md:bg-transparent">
          <div className="w-full max-w-sm aspect-square relative flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50/40 rounded-full absolute scale-95 opacity-80"></div>
            
            {/* Central Board Graphic */}
            <div className="absolute w-56 h-40 bg-white border-2 border-blue-500 rounded-xl shadow-sm top-10 left-10 p-3 flex flex-col justify-between">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
              <div className="grid grid-cols-3 gap-2 flex-grow mt-3">
                <div className="bg-blue-500/20 rounded p-1 flex items-center justify-center text-xs text-blue-600 font-bold">★</div>
                <div className="bg-slate-100 rounded"></div>
                <div className="bg-blue-500 rounded flex items-center justify-center text-xs text-white">✓</div>
                <div className="bg-slate-100 rounded"></div>
                <div className="bg-blue-100 rounded col-span-2"></div>
              </div>
            </div>

            {/* Decorative Ornaments */}
            <div className="absolute top-4 right-16 w-12 h-12 bg-blue-100 rounded-full border-2 border-blue-500 flex items-center justify-center text-xs">🕒</div>
            <div className="absolute bottom-8 left-16 w-14 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded flex items-center justify-center text-[10px] tracking-widest shadow-md rotate-12">🎫</div>
            <div className="absolute bottom-12 right-20 w-8 h-12 bg-blue-600 rounded-t-full shadow-inner flex items-center justify-center text-white text-xs">🎙️</div>
            
            {/* User silhouettes */}
            <div className="absolute bottom-4 left-6 flex flex-col items-center">
              <div className="w-6 h-6 bg-[#1E293B] rounded-full"></div>
              <div className="w-8 h-20 bg-blue-600 rounded-t-lg mt-0.5"></div>
            </div>
            <div className="absolute bottom-4 right-6 flex flex-col items-center">
              <div className="w-6 h-6 bg-[#1E293B] rounded-full"></div>
              <div className="w-8 h-20 bg-indigo-900 rounded-t-lg mt-0.5"></div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication Fields */}
        <div className="w-full max-w-md mx-auto">
          
          {/* Header Layout */}
          <div className="flex flex-col items-center text-center mb-6">
            <h1 className="text-4xl font-black tracking-tight text-[#1B254B] m-0 font-sans">
              EventSync
            </h1>
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mt-3">
              {view === 'login' && "Welcome Back"}
              {view === 'signup' && `Register as ${role}`}
              {view === 'forgot' && "Recover Password"}
            </p>
            {view === 'forgot' && (
              <p className="text-xs text-slate-500 mt-2 max-w-[280px]">
                Enter your verified email link below and we'll send you a link to reset your password.
              </p>
            )}
          </div>

          {/* Premium Role Switch Selector (Hidden on Forgot Password screen) */}
          {/* mb-4 matches the space-y-4 (16px) spacing between form inputs perfectly */}
          {view !== 'forgot' && (
            <div className="mb-4 bg-slate-100/80 p-1.5 rounded-2xl flex relative border border-slate-200">
              <button
                type="button"
                onClick={() => setRole('User')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 cursor-pointer ${
                  role === 'User' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                USER
              </button>
              <button
                type="button"
                onClick={() => setRole('Admin')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 cursor-pointer ${
                  role === 'Admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ADMIN
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Render Full Name input only in signup view */}
            {view === 'signup' && (
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 placeholder-slate-400 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
                />
              </div>
            )}

            <div>
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 placeholder-slate-400 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
              />
            </div>

            {/* Render password inputs only if not in password recovery mode */}
            {view !== 'forgot' && (
              <div>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 placeholder-slate-400 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
                />
              </div>
            )}

            {/* Render Confirm Password field if SignUp mode active */}
            {view === 'signup' && (
              <div>
                <input
                  type="password"
                  required
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 placeholder-slate-400 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
                />
              </div>
            )}

            {view === 'login' && (
              <div className="flex justify-end text-xs font-bold pt-0.5 px-1">
                <button 
                  type="button"
                  onClick={() => setView('forgot')}
                  className="text-blue-600 hover:text-blue-700 hover:underline transition-all bg-transparent border-none outline-none cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.99]"
              >
                {view === 'login' && `Login as ${role}`}
                {view === 'signup' && `Register as ${role}`}
                {view === 'forgot' && "Send Reset Link"}
              </button>
            </div>
          </form>

          {/* Toggle Button View Footer */}
          <div className="text-center mt-8">
            <p className="text-xs font-bold text-slate-400">
              {view === 'login' && (
                <>
                  Don't have an account? 
                  <button
                    type="button"
                    onClick={() => setView('signup')}
                    className="text-blue-600 hover:text-blue-700 hover:underline font-extrabold ml-1 bg-transparent border-none outline-none cursor-pointer"
                  >
                    Register Here
                  </button>
                </>
              )}
              {view !== 'login' && (
                <>
                  Back to login? 
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-blue-600 hover:text-blue-700 hover:underline font-extrabold ml-1 bg-transparent border-none outline-none cursor-pointer"
                  >
                    Login Here
                  </button>
                </>
              )}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}