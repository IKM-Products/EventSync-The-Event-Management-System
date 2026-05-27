import React, { useState } from 'react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  // Native browser method to extract the secret token out of the URL address bar
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Password updated successfully! Redirecting to login...");
        // Native redirect back to your login home screen
        window.location.href = '/'; 
      } else {
        setMessage(data.message || "Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Unable to connect to the backend server.");
    }
  };

  return (
    <div className="fixed inset-0 min-w-full min-h-full bg-gradient-to-tr from-[#DCE6EE] via-[#EBF1F6] to-[#F1F5F9] flex items-center justify-center p-6 font-sans tracking-tight antialiased text-left m-0 overflow-y-auto">
      <div className="bg-white rounded-[32px] shadow-2xl shadow-blue-900/5 w-full max-w-md border border-white/60 p-8 md:p-12 my-auto">
        
        {/* Header Layout - Matches the exact mb-10 spacing layout from Login */}
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight text-[#1B254B] m-0 font-sans">
            EventSync
          </h1>
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mt-3">
            Create New Password
          </p>
        </div>
        
        {message && <p className="text-sm text-red-500 text-center mb-4 font-semibold">{message}</p>}

        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              required
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 placeholder-slate-400 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
            />
          </div>
          
          <div>
            <input
              type="password"
              required
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 placeholder-slate-400 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.99]"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}