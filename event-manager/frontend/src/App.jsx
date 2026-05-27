import React, { useState, useEffect } from 'react';
import Login from './Login';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    try {
      const res = await fetch('http://localhost:5000/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        alert("Your password has been changed successfully!");
        window.location.pathname = '/';
      } else {
        alert(data.message || "Failed to update password.");
      }
    } catch (err) {
      alert("Error talking to backend security systems.");
    }
  };

  return (
    <div className="fixed inset-0 min-w-full min-h-full bg-gradient-to-tr from-[#DCE6EE] via-[#EBF1F6] to-[#F1F5F9] flex items-center justify-center p-6 font-sans tracking-tight antialiased">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 border border-white/60 text-center space-y-6">
        <h1 className="text-3xl font-black text-[#1B254B]">EventSync</h1>
        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Set New Password</p>
        {success ? (
          <div className="space-y-4">
            <p className="text-sm text-emerald-600 font-medium">Password changed successfully!</p>
            <button 
              onClick={() => { window.location.pathname = '/'; }}
              className="w-full bg-blue-600 text-white font-bold text-xs py-4 rounded-2xl"
            >
              Back to Login Gateway
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input 
              type="password" 
              required 
              placeholder="New Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 placeholder-slate-400 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
            />
            <input 
              type="password" 
              required 
              placeholder="Confirm New Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 placeholder-slate-400 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
            />
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-lg"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, totalBookings: 0, totalUsers: 0, totalRevenue: 0 });
  const [feedbacks, setFeedbacks] = useState([]);
  
  // Custom navigation tracking
  const [activeSidebar, setActiveSidebar] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Custom Modal & Toast states
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' });
  const [weatherModal, setWeatherModal] = useState({ show: false, data: null, cityName: '', rainfall: 0, loading: false });
  const [crudModal, setCrudModal] = useState({ show: false, mode: 'create', eventData: null });
  const [profileModal, setProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to EventSync! Browse and secure your seats today.", read: false, time: "Just now" },
    { id: 2, text: "System Update: The weather service now queries precise rainfall.", read: false, time: "2 hours ago" },
    { id: 3, text: "New technology workshops and business seminars have been announced.", read: true, time: "Yesterday" }
  ]);
  
  // Custom interactive calendar state variables
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  // Profile Form state
  const [editFullName, setEditFullName] = useState('');
  
  // New Feedback submission states (UI Design removed, modern categories appended)
  const [submitRating, setSubmitRating] = useState(5);
  const [submitComment, setSubmitComment] = useState('');
  const [submitCategory, setSubmitCategory] = useState('Booking Process');

  // Form states for Event creation/editing
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formLocation, setFormLocation] = useState('New York');
  const [formCategory, setFormCategory] = useState('Technology');
  const [formPrice, setFormPrice] = useState('');
  const [formCapacity, setFormCapacity] = useState('');
  const [formImage, setFormImage] = useState('');

  const categories = ['All', 'Technology', 'Music', 'Sports', 'Business', 'Entertainment'];
  const feedbackCategories = [
    'Booking Process',
    'Event Quality',
    'Ticket Pricing',
    'Venue & Amenities',
    'Customer Support',
    'Other Comments'
  ];

  useEffect(() => {
    if (alertConfig.show) {
      const timer = setTimeout(() => {
        setAlertConfig(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alertConfig.show]);

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchFeedbacks();
    if (user?.role === 'Admin') {
      fetchStats();
    } else if (user?.role === 'User') {
      fetchUserBookings();
    }
    if (user) {
      setEditFullName(user.fullName || '');
    }
  }, [user]);

  const showAlert = (message, type = 'success') => {
    setAlertConfig({ show: true, message, type });
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events');
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Error loading events:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const fetchUserBookings = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/events/bookings/${user.email}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("Error loading bookings:", err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events/feedback');
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks);
      }
    } catch (err) {
      console.error("Error loading feedbacks:", err);
    }
  };

  const handlePostFeedback = async (e) => {
    e.preventDefault();
    const payload = {
      rating: submitRating,
      comment: submitComment,
      category: submitCategory,
      userEmail: user.email,
      userName: user.fullName || user.email.split('@')[0]
    };

    try {
      const res = await fetch('http://localhost:5000/api/events/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showAlert("Thank you! Feedback submitted successfully.");
        setSubmitComment('');
        setSubmitRating(5);
        fetchFeedbacks();
      } else {
        showAlert(data.message || "Failed to submit feedback", "error");
      }
    } catch (err) {
      showAlert("Communication error with server.", "error");
    }
  };

  const handleDeleteFeedback = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/events/feedback/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showAlert("Feedback removed successfully.");
        fetchFeedbacks();
      } else {
        showAlert(data.message || "Failed to delete feedback", "error");
      }
    } catch (err) {
      showAlert("Error deleting feedback via server.", "error");
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showAlert("Event deleted successfully.");
        fetchEvents();
        fetchStats();
      } else {
        showAlert(data.message || "Failed to delete event", "error");
      }
    } catch (err) {
      showAlert("Error deleting event via server.", "error");
    }
  };

  const openEventModal = (mode, event = null) => {
    setCrudModal({ show: true, mode, eventData: event });
    if (mode === 'edit' && event) {
      setFormTitle(event.title);
      setFormDescription(event.description);
      setFormDate(event.date);
      setFormTime(event.time);
      setFormLocation(event.location);
      setFormCategory(event.category);
      setFormPrice(event.price);
      setFormCapacity(event.capacity);
      setFormImage(event.imageUrl);
    } else {
      setFormTitle('');
      setFormDescription('');
      setFormDate('');
      setFormTime('');
      setFormLocation('New York');
      setFormCategory('Technology');
      setFormPrice('');
      setFormCapacity('');
      setFormImage('');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: formTitle,
      description: formDescription,
      date: formDate,
      time: formTime,
      location: formLocation,
      category: formCategory,
      price: Number(formPrice),
      capacity: Number(formCapacity),
      imageUrl: formImage
    };

    const url = crudModal.mode === 'create' 
      ? 'http://localhost:5000/api/events' 
      : `http://localhost:5000/api/events/${crudModal.eventData._id}`;

    const method = crudModal.mode === 'create' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showAlert(crudModal.mode === 'create' ? "New event created successfully!" : "Event updated successfully!");
        setCrudModal({ show: false, mode: 'create', eventData: null });
        fetchEvents();
        fetchStats();
      } else {
        showAlert(data.message || "Operation failed", "error");
      }
    } catch (err) {
      showAlert("Communication error with server.", "error");
    }
  };

  const handleBookEvent = async (eventId) => {
    const confirmBooking = window.confirm("Are you sure you want to book a ticket for this event?");
    if (!confirmBooking) return; // Cancel the operation if user presses cancel

    try {
      const res = await fetch('http://localhost:5000/api/events/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userEmail: user.email })
      });
      const data = await res.json();
      if (data.success) {
        showAlert("Booking confirmed! Your tickets have been reserved.");
        fetchUserBookings();
        
        // Push actual booking notice to active notifications
        const matchedEvent = events.find(e => e._id === eventId);
        const eventTitle = matchedEvent ? matchedEvent.title : "Hosted Event";
        setNotifications(prev => [
          {
            id: Date.now(),
            text: `Seat reserved successfully for: "${eventTitle}"!`,
            read: false,
            time: "Just now"
          },
          ...prev
        ]);
      } else {
        showAlert(data.message || "Booking failed", "error");
      }
    } catch (err) {
      showAlert("Server communication issue.", "error");
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!editFullName.trim()) {
      showAlert("Full Name cannot be blank.", "error");
      return;
    }
    setUser(prev => ({
      ...prev,
      fullName: editFullName
    }));
    showAlert("Profile updated successfully!");
    setProfileModal(false);
  };

  const cityCoordinates = {
    'New York': { lat: 40.7128, lon: -74.0060 },
    'London': { lat: 51.5074, lon: -0.1278 },
    'Kathmandu': { lat: 27.7172, lon: 85.3240 },
    'Tokyo': { lat: 35.6762, lon: 139.6503 },
    'Paris': { lat: 48.8566, lon: 2.3522 },
    'Sydney': { lat: -33.8688, lon: 151.2093 }
  };

  const fetchWeather = async (cityName) => {
    setWeatherModal({ show: true, data: null, cityName, rainfall: 0, loading: true });
    const coords = cityCoordinates[cityName] || cityCoordinates['New York'];

    try {
      // Added hourly precipitation parameter to retrieve real rain values
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=precipitation`);
      const data = await res.json();
      
      if (data.current_weather) {
        let preciseRainfall = 0;

        if (data.hourly && data.hourly.time && data.hourly.precipitation) {
          const currentHourISO = data.current_weather.time.substring(0, 13);
          const hourIndex = data.hourly.time.findIndex(timeStr => timeStr.startsWith(currentHourISO));
          if (hourIndex !== -1) {
            preciseRainfall = data.hourly.precipitation[hourIndex];
          }
        }

        setWeatherModal({
          show: true,
          cityName,
          data: data.current_weather,
          rainfall: preciseRainfall,
          loading: false
        });
      } else {
        showAlert("Could not load current weather conditions.", "error");
        setWeatherModal(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      showAlert("Weather service currently offline.", "error");
      setWeatherModal(prev => ({ ...prev, loading: false }));
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Dynamic Monthly Calendar Calculation
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonthIndex = (year, month) => new Date(year, month, 1).getDay();
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
    setSelectedCalendarDate(null);
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
    setSelectedCalendarDate(null);
  };

  if (currentPath === '/reset-password') {
    return <ResetPassword />;
  }

  if (!user) {
    return <Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : "0.0";

  const totalUnreadNotifications = notifications.filter(n => !n.read).length;

  const getTopFeedbackCategory = () => {
    if (!feedbacks || feedbacks.length === 0) return "None Yet";
    
    const counts = {};
    feedbacks.forEach(f => {
      const cat = f.category || 'Other Comments';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-tr from-[#EBF1F6] to-[#F4F7FE] flex items-start justify-center p-4 xl:p-8 text-[#2B3674] font-sans antialiased text-left m-0 box-border">
      
      {/* Toast alert box */}
      {alertConfig.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border transition-all transform duration-300 translate-y-0 ${
          alertConfig.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="text-lg">{alertConfig.type === 'success' ? '✓' : '✗'}</div>
          <div className="text-xs font-bold">{alertConfig.message}</div>
        </div>
      )}

      {/* FLOATING WHITE INTERFACE CONTAINER */}
      <div className="w-full max-w-[1560px] min-h-[calc(100vh-2rem)] xl:min-h-[calc(100vh-4rem)] bg-white border border-[#E2E8F0]/80 rounded-[32px] shadow-[0_24px_70px_rgba(112,126,174,0.12)] flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT SIDEBAR PANEL */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#F4F7FE] flex flex-col justify-between p-6 shrink-0 md:sticky md:top-0 md:h-[calc(100vh-4rem)]">
          <div>
            <div className="flex items-center gap-3 px-2 mb-10 mt-2">
              <h1 className="text-2xl font-black tracking-tight text-[#1B254B]">EventSync</h1>
            </div>

            <nav className="space-y-1">
              {[
                { name: 'Dashboard', icon: '📊'},
                { name: 'Bookings', icon: '✅' },
                { name: 'Calendar', icon: '📅' },
                { name: 'Feedback', icon: '⭐️' }
              ].filter((item) => !(user?.role === 'Admin' && item.name === 'Bookings')).map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveSidebar(item.name)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all border-none bg-transparent text-left cursor-pointer ${
                    activeSidebar === item.name
                      ? 'bg-[#F4F7FE] text-blue-600 border-r-4 border-blue-500'
                      : 'text-[#A3AED0] hover:bg-[#F4F7FE]/50 hover:text-[#1B254B]'
                  }`}
                >
                  <span className="mr-3 text-base">{item.icon}</span>
                  {item.name}
                </button>
              ))}
              <button
                onClick={() => {
                  const confirmLogOut = window.confirm("Are you sure you want to sign out of EventSync?");
                  if (confirmLogOut) {
                    setUser(null);
                  }
                }}
                className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold text-[#A3AED0] hover:bg-red-50 hover:text-red-500 transition-all border-none bg-transparent text-left cursor-pointer mt-2"
              >
                <span className="mr-3 text-base">🚪</span>
                Sign Out
              </button>
            </nav>
          </div>

          <div className="hidden md:block"></div>
        </aside>

        {/* RIGHT WORKSPACE CONSOLE */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] relative">
          
          {/* HEADER BAR */}
          <header className="px-8 pt-8 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent shrink-0">
            <div>
              <p className="text-xs font-bold text-[#A3AED0] tracking-wider uppercase">Dashboard / {activeSidebar}</p>
              <h2 className="text-3xl font-black text-[#1B254B] mt-0.5">{activeSidebar}</h2>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-auto relative">
              {/* Functional Notification Icon (only one interactive bell) */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 bg-white rounded-full hover:bg-[#E0E5F2] transition-colors text-sm shadow-sm border border-[#E2E8F0] cursor-pointer relative"
                >
                  🔔
                  {totalUnreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      {totalUnreadNotifications}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Bubble */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl z-50 p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="font-black text-xs text-[#1B254B]">Live Notifications</span>
                      <button 
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                          showAlert("All notifications marked as read!");
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="space-y-2.5 max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 font-bold text-center py-4">No recent activities found.</p>
                      ) : (
                        notifications.map(notice => (
                          <div 
                            key={notice.id} 
                            onClick={() => {
                              setNotifications(prev => prev.map(n => n.id === notice.id ? { ...n, read: true } : n));
                            }}
                            className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all ${
                              notice.read ? 'bg-slate-50/55 border-transparent text-slate-500' : 'bg-blue-50/40 border-blue-100 text-slate-800 font-medium'
                            }`}
                          >
                            <p className="text-xs leading-relaxed">{notice.text}</p>
                            <span className="text-[9px] text-slate-400 font-bold block mt-1">{notice.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile details container - Clickable to reveal Profile Modal */}
              <div 
                onClick={() => setProfileModal(true)}
                className="flex items-center gap-3 pl-2 border-l border-[#E2E8F0] cursor-pointer hover:opacity-85 transition-opacity"
              >
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-xl shadow-md select-none">
                  {(() => {
                    if (user.role === 'Admin') return '👨‍💼'; // Admin customized emoji
                    return '🧑';
                  })()} 
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1B254B] truncate max-w-[120px]">{user.fullName || user.email.split('@')[0]}</p>
                  <p className="text-[11px] font-medium text-[#A3AED0] uppercase">{user.role}</p>
                </div>
              </div>
            </div>
          </header>

          {/* SCREEN CONTROLLER: DASHBOARD */}
          {activeSidebar === 'Dashboard' && (
            <>
              {/* ADMIN SYSTEM */}
              {user.role === 'Admin' && (
                <div className="px-8 pb-8 space-y-8 flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-[#1B254B]">System Control & Operations</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">Configure live database configurations, track booking statistics, and perform CRUD actions.</p>
                    </div>
                    <button 
                      onClick={() => openEventModal('create')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/10 active:scale-95 flex items-center gap-1.5 cursor-pointer border-none"
                    >
                      <span>+</span> Create New Event
                    </button>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Hosted Events</span>
                      <span className="text-3xl font-black text-slate-900 mt-2">{stats.totalEvents}</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Bookings</span>
                      <span className="text-3xl font-black text-slate-900 mt-2">{stats.totalBookings}</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Users</span>
                      <span className="text-3xl font-black text-slate-900 mt-2">{stats.totalUsers}</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Income Generated</span>
                      <span className="text-3xl font-black text-emerald-600 mt-2">${stats.totalRevenue}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-black text-slate-800 text-base">Hosted Event Listings</h3>
                      <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 rounded text-slate-500">{filteredEvents.length} active</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                            <th className="p-4 pl-6">Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Date & Time</th>
                            <th className="p-4">Location</th>
                            <th className="p-4 text-center">Ticket Price</th>
                            <th className="p-4 pr-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {events.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="p-8 text-center text-xs text-slate-400 font-bold">No events present in database. Press "Create New Event" to start.</td>
                            </tr>
                          ) : (
                            events.map(event => (
                              <tr key={event._id} className="hover:bg-slate-50/50 transition-all">
                                <td className="p-4 pl-6 font-bold text-slate-800">{event.title}</td>
                                <td className="p-4">
                                  <span className="text-[10px] font-extrabold px-2 py-1 bg-blue-50 text-blue-600 rounded">
                                    {event.category}
                                  </span>
                                </td>
                                <td className="p-4 text-xs font-medium text-slate-500">{event.date} @ {event.time}</td>
                                <td className="p-4 text-xs font-bold text-slate-600">{event.location}</td>
                                <td className="p-4 text-center font-bold text-emerald-600">${event.price}</td>
                                <td className="p-4 pr-6 text-right space-x-2">
                                  <button 
                                    onClick={() => openEventModal('edit', event)}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border-none"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteEvent(event._id)}
                                    className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border-none"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* USER PORTAL */}
              {user.role === 'User' && (
                <div className="px-8 pb-8 space-y-6 flex-grow">
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-[24px] border border-[#E2E8F0] shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                      <div className="relative w-full xl:w-72">
                        <input
                          type="text"
                          placeholder="Search event, location, description..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-[#F4F7FE] border border-transparent rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold text-[#1B254B] placeholder-[#A3AED0] focus:outline-none focus:bg-white focus:border-blue-400 transition-all"
                        />
                        <span className="absolute right-3.5 top-3 text-xs opacity-50">🔍</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer border-none ${
                              selectedCategory === cat 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                                : 'bg-[#F4F7FE] text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {filteredEvents.length === 0 ? (
                      <div className="bg-white border border-[#E2E8F0]/80 rounded-[32px] p-16 text-center shadow-sm">
                        <span className="text-5xl block mb-4">🎫</span>
                        <h3 className="text-xl font-bold text-[#1B254B]">No matching events found</h3>
                        <p className="text-xs text-slate-400 mt-2">Adjust your filters or search keywords.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEvents.map((event) => {
                          const hasBooked = bookings.some(b => b.eventId === event._id);
                          return (
                            <div
                              key={event._id}
                              className="bg-white border border-[#E2E8F0]/80 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                            >
                              <div className="p-4">
                                <div className="h-44 w-full bg-[#F4F7FE] rounded-[24px] relative overflow-hidden flex items-center justify-center text-4xl group-hover:scale-[1.01] transition-all duration-300">
                                  <img
                                    src={(() => {
                                      const eventCategory = String(event.category || '').toLowerCase().trim();
                                        
                                      if (eventCategory === 'technology') return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80';
                                      if (eventCategory === 'music') return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';
                                      if (eventCategory === 'sports') return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80';
                                      if (eventCategory === 'business') return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80';
                                      if (eventCategory === 'entertainment') return 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=600&q=80';
                                      
                                      if (event.imageUrl && event.imageUrl.trim() !== "") return event.imageUrl;
                                      if (event.formImage && event.formImage.trim() !== "") return event.formImage;

                                      return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80';
                                    })()}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80'; }}
                                  />
                                  <span className="absolute top-3 left-3 bg-white text-[#1B254B] text-[10px] font-extrabold px-3 py-1.5 rounded-xl shadow-sm border border-[#E0E5F2]">
                                    {event.category || 'General'}
                                  </span>
                                </div>
                              </div>

                              <div className="px-5 pb-5 pt-1 flex-grow flex flex-col justify-between">
                                <div className="space-y-1.5">
                                  <p className="text-xs font-bold text-blue-500 font-mono">{event.date} @ {event.time}</p>
                                  <h4 className="text-base font-black text-[#1B254B] tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {event.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">{event.description}</p>
                                  <p className="text-[#707EAE] text-xs font-bold flex items-center gap-1 pt-1">
                                    📍 <span className="line-clamp-1">{event.location}</span>
                                  </p>
                                </div>

                                <div className="pt-4 border-t border-[#F4F7FE] mt-4 flex flex-col gap-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-col">  
                                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Entry fees</span>
                                      <span className="text-base font-black text-blue-600">${event.price}</span>
                                    </div>
                                    <button onClick={() => fetchWeather(event.location)}
                                      className="px-3 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100/60 transition-all cursor-pointer border-none shrink-0"
                                    >
                                      🌤️ Weather
                                    </button>
                                  </div>  
                                  <div className="w-full">
                                    {hasBooked ? (
                                      <button className="w-full px-4 py-2.5 bg-emerald-50 text-emerald-600 text-xs font-black rounded-xl cursor-not-allowed border-none text-center">
                                        ✓ Reserved
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleBookEvent(event._id)}
                                        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all hover:shadow-lg cursor-pointer border-none text-center"
                                      >
                                        Book
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* SCREEN CONTROLLER: BOOKINGS PANEL */}
          {activeSidebar === 'Bookings' && (
            <div className="px-8 pb-8 space-y-6 flex-grow">
              <h3 className="text-xl font-black text-[#1B254B]">Reservations List</h3>
              <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                {bookings.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 text-center py-10">No bookings currently active in this session.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {bookings.map(booking => (
                      <div key={booking._id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{booking.event?.title || "Hosted Event"}</p>
                          <p className="text-xs text-slate-400 font-medium">{booking.event?.location} — {booking.event?.date}</p>
                        </div>
                        <span className="text-sm font-black text-emerald-600">${booking.event?.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCREEN CONTROLLER: CALENDAR PANEL */}
          {activeSidebar === 'Calendar' && (
            <div className="px-8 pb-8 space-y-6 flex-grow">
              {}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-[#1B254B]">Event Calendar</h3>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-2 bg-white rounded-lg border border-[#E2E8F0] text-sm hover:bg-slate-50 cursor-pointer font-bold"
                  >
                    ◀
                  </button>
                  <span className="font-black text-sm text-slate-800 tracking-tight w-36 text-center">
                    {monthNames[calendarMonth]} {calendarYear}
                  </span>
                  <button 
                    onClick={handleNextMonth}
                    className="p-2 bg-white rounded-lg border border-[#E2E8F0] text-sm hover:bg-slate-50 cursor-pointer font-bold"
                  >
                    ▶
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Calendar Grid */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-100">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mt-4">
                    {/* Blank Padding Slots */}
                    {Array.from({ length: firstDayOfMonthIndex(calendarYear, calendarMonth) }).map((_, idx) => (
                      <div key={`blank-${idx}`} className="aspect-square bg-slate-50/40 rounded-xl" />
                    ))}

                    {/* Active Month Days */}
                    {Array.from({ length: daysInMonth(calendarYear, calendarMonth) }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      
                      // Map standard and booked events onto date matching
                      const daysEvents = events.filter(e => e.date === dateStr);
                      const isBooked = bookings.some(b => b.event?.date === dateStr);
                      const isSelected = selectedCalendarDate === dateStr;

                      return (
                        <div 
                          key={`day-${dayNum}`}
                          onClick={() => {
                            if (daysEvents.length > 0) {
                              setSelectedCalendarDate(dateStr);
                            } else {
                              setSelectedCalendarDate(null);
                              showAlert("No schedules booked on this date.");
                            }
                          }}
                          className={`aspect-square rounded-2xl p-2 flex flex-col justify-between items-center border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : daysEvents.length > 0 
                                ? 'bg-blue-50/70 border-blue-100 text-[#1B254B] hover:bg-blue-100/50' 
                                : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="text-xs font-black block">{dayNum}</span>
                          <div className="flex gap-1 justify-center w-full min-h-[6px]">
                            {daysEvents.map((ev, i) => (
                              <span 
                                key={i} 
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected 
                                    ? 'bg-white' 
                                    : isBooked ? 'bg-emerald-500' : 'bg-blue-500'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Day Schedule Panel details */}
                <div className="lg:col-span-1 bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-sm text-[#1B254B] border-b border-slate-100 pb-3">
                      Selected Day Agenda
                    </h4>
                    {selectedCalendarDate ? (
                      <div className="mt-4 space-y-4">
                        <p className="text-xs font-bold text-blue-600">{selectedCalendarDate}</p>
                        <div className="space-y-3">
                          {events.filter(e => e.date === selectedCalendarDate).map(e => (
                            <div key={e._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-100 text-blue-700 rounded block w-fit mb-1">
                                {e.category}
                              </span>
                              <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{e.title}</h5>
                              <p className="text-[10px] text-slate-400 mt-1">🕒 {e.time} | 📍 {e.location}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-xs font-bold space-y-2">
                        <span className="text-3xl block">📅</span>
                        <p>Click on highlighted days with bullet markers to inspect details.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-bold flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block" />
                      <span>Available Events</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                      <span>Your Reserved Events</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN CONTROLLER: FUNCTIONAL FEEDBACK HUB */}
          {activeSidebar === 'Feedback' && (
            <div className="px-8 pb-8 space-y-6 flex-grow">
              
              {/* ADMIN VIEW FEEDBACKS */}
              {user.role === 'Admin' ? (
                <div className="space-y-6">
                  {/* KPI Overview Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average System Rating</span>
                      <p className="text-5xl font-black text-blue-600 mt-2">{avgRating} / 5.0</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Feedbacks</span>
                      <p className="text-5xl font-black text-slate-800 mt-2">{feedbacks.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Category</span>
                      <p className="text-2xl font-black text-emerald-600 mt-4 truncate">
                        {getTopFeedbackCategory()}
                      </p>    
                    </div>
                  </div>

                  {/* Feedbacks list table */}
                  <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-black text-slate-800 text-base">User Feedback Log</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                            <th className="p-4 pl-6">User</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Rating</th>
                            <th className="p-4">Comment</th>
                            <th className="p-4 pr-6 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {feedbacks.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="p-8 text-center text-xs text-slate-400 font-bold">No feedback entries generated yet.</td>
                            </tr>
                          ) : (
                            feedbacks.map(item => (
                              <tr key={item._id} className="hover:bg-slate-50/50 transition-all">
                                <td className="p-4 pl-6 font-bold text-slate-800">{item.userName} <span className="text-[10px] text-slate-400 font-normal">({item.userEmail})</span></td>
                                <td className="p-4">
                                  <span className="text-[10px] font-extrabold px-2 py-1 bg-blue-50 text-blue-600 rounded">
                                    {item.category}
                                  </span>
                                </td>
                                <td className="p-4 font-black text-amber-500">{"⭐".repeat(item.rating)}</td>
                                <td className="p-4 text-xs font-medium text-slate-500 max-w-xs truncate">{item.comment}</td>
                                <td className="p-4 pr-6 text-right">
                                  <button 
                                    onClick={() => handleDeleteFeedback(item._id)}
                                    className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border-none"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* USER VIEW FEEDBACKS */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Feedback form */}
                  <div className="lg:col-span-1 bg-white rounded-[24px] border border-slate-200 p-6 space-y-4 shadow-sm h-fit">
                    <h3 className="font-black text-slate-800 text-base">Submit System Feedback</h3>
                    <form onSubmit={handlePostFeedback} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Topic Category</label>
                        <select 
                          value={submitCategory}
                          onChange={(e) => setSubmitCategory(e.target.value)}
                          className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-all mt-1"
                        >
                          {feedbackCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Satisfaction Rating</label>
                        <div className="flex gap-1.5 mt-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setSubmitRating(star)}
                              className="text-2xl outline-none border-none bg-transparent cursor-pointer transition-transform duration-100 hover:scale-110"
                            >
                              {star <= submitRating ? "⭐" : "☆"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Detailed Remarks</label>
                        <textarea
                          placeholder="Tell us what you liked or how we can improve..."
                          value={submitComment}
                          onChange={(e) => setSubmitComment(e.target.value)}
                          rows="4"
                          required
                          className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-all mt-1"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer border-none"
                      >
                        Submit Feedback
                      </button>
                    </form>
                  </div>

                  {/* Public Feedbacks list */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-black text-slate-800 text-base">Community Reviews</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {feedbacks.length === 0 ? (
                        <p className="text-xs text-slate-400 font-bold py-10 text-center col-span-2">No system feedbacks published yet.</p>
                      ) : (
                        feedbacks.map(item => (
                          <div key={item._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                                  {item.category}
                                </span>
                                <span className="text-xs font-black text-amber-500">{"⭐".repeat(item.rating)}</span>
                              </div>
                              <p className="text-xs text-slate-600 font-medium italic">"{item.comment}"</p>
                            </div>
                            <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-[10px] font-bold text-slate-400">
                              <span>By: {item.userName}</span>
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
        
      </div>

      {/* USER PROFILE MODAL */}
      {profileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-6 backdrop-blur-xs">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setProfileModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-black text-lg bg-transparent border-none cursor-pointer"
            >
              ×
            </button>
            <div className="flex flex-col items-center space-y-4">
              <div className="h-16 w-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-black text-white text-xl uppercase shadow-lg">
                {(user.fullName || user.email).substring(0, 2).toUpperCase()}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{user.fullName || "EventSync User"}</h3>
                <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{user.role}</span>
              </div>

              <form onSubmit={handleUpdateProfile} className="w-full space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter your name" 
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-all mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Email Address (Read Only)</label>
                  <input 
                    type="email" 
                    disabled
                    value={user.email}
                    className="w-full bg-slate-100 border border-[#E5E7EB] text-slate-400 rounded-2xl px-4 py-3.5 text-xs cursor-not-allowed mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setProfileModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl border-none cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-2xl border-none cursor-pointer shadow-md transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN EVENT DETAILS MODAL */}
      {crudModal.show && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-6 backdrop-blur-xs">
          <div className="bg-white rounded-[32px] w-full max-w-xl p-6 md:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {crudModal.mode === 'create' ? "Generate New Event" : "Modify Hosted Event"}
              </h3>
              <button 
                onClick={() => setCrudModal({ show: false, mode: 'create', eventData: null })}
                className="text-slate-400 hover:text-slate-600 font-black text-lg bg-transparent border-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Event Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter event title" 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-all mt-1.5"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Description</label>
                  <textarea 
                    placeholder="Event description..." 
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows="3"
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-all mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Date</label>
                  <input 
                    type="date" 
                    required 
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-all mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Time</label>
                  <input 
                    type="time" 
                    required 
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-all mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Location City</label>
                  <select 
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-all mt-1.5"
                  >
                    <option value="New York">New York</option>
                    <option value="London">London</option>
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Tokyo">Tokyo</option>
                    <option value="Paris">Paris</option>
                    <option value="Sydney">Sydney</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Category</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-all mt-1.5"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Music">Music</option>
                    <option value="Sports">Sports</option>
                    <option value="Business">Business</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Price ($)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 25"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-all mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Capacity</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 150"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-all mt-1.5"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setCrudModal({ show: false, mode: 'create', eventData: null })}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-4 rounded-2xl transition-all cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/10 cursor-pointer border-none"
                >
                  {crudModal.mode === 'create' ? "Save & Broadcast" : "Update Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE WEATHER FORECAST MODAL */}
      {weatherModal.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-black text-[#1B254B]">{weatherModal.cityName} Sky Status</h4>
              <button
                onClick={() => setWeatherModal(prev => ({ ...prev, show: false }))}
                className="text-slate-400 hover:text-slate-600 bg-transparent border-none text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {weatherModal.loading ? (
              <div className="text-center py-6 text-xs text-slate-400 font-bold">
                Querying weather satellites...
              </div>
            ) : weatherModal.data ? (
              <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3.5 text-left">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 border-b border-slate-200/60 pb-2">
                  <span>Temperature</span>
                  <span className="text-lg font-black text-slate-800">{weatherModal.data.temperature}°C</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 border-b border-slate-200/60 pb-2">
                  <span>Wind Speed</span>
                  <span className="text-slate-800 font-black">{weatherModal.data.windspeed || weatherModal.data.wind_speed} km/h</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
);}