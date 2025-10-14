import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, LogIn, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import authService from '../services/authService';

const LoginPage = ({ onLogin, setCurrentPage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    nic_no: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const validateLoginForm = () => {
    const errors = {};
    
    if (!loginForm.username.trim()) errors.username = 'Username is required';
    if (!loginForm.password) errors.password = 'Password is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors = {};
    
    if (!registerForm.name.trim()) errors.name = 'Name is required';
    if (!registerForm.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(registerForm.email)) errors.email = 'Email is invalid';
    if (!registerForm.phone.trim()) errors.phone = 'Phone number is required';
    if (!registerForm.username.trim()) errors.username = 'Username is required';
    else if (registerForm.username.length < 3) errors.username = 'Username must be at least 3 characters';
    if (!registerForm.nic_no.trim()) errors.nic_no = 'NIC/Passport number is required';
    if (!registerForm.password) errors.password = 'Password is required';
    else if (registerForm.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!registerForm.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (registerForm.password !== registerForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!registerForm.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms and conditions';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setIsSubmitting(true);
    setApiError('');
    
    try {
      // Call backend API
      const result = await authService.login(loginForm.username, loginForm.password);
      
      if (result.success) {
        // Pass user data to parent component
        onLogin(result.user);
        setIsSubmitting(false);
      } else {
        setApiError(result.message || 'Login failed. Please check your credentials.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError('An error occurred during login. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;
    
    setIsSubmitting(true);
    setApiError('');
    
    try {
      // Call backend API for registration
      const result = await authService.register({
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        username: registerForm.username,
        nic_no: registerForm.nic_no,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
      });
      
      if (result.success) {
        setShowSuccess(true);
        setIsSubmitting(false);
        
        // Auto switch to login after showing success
        setTimeout(() => {
          setShowSuccess(false);
          setIsLogin(true);
          setRegisterForm({
            name: '',
            email: '',
            phone: '',
            username: '',
            nic_no: '',
            password: '',
            confirmPassword: '',
            agreeToTerms: false
          });
          setFormErrors({});
          setApiError('');
        }, 3000);
      } else {
        setApiError(result.message || 'Registration failed. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setApiError('An error occurred during registration. Please try again.');
      setIsSubmitting(false);
    }
  };

  const switchForm = () => {
    setIsLogin(!isLogin);
    setFormErrors({});
    setShowSuccess(false);
    setApiError('');
  };

  const demoLogin = () => {
    setLoginForm({
      username: 'demo',
      password: 'demo123'
    });
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-20">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-light text-gray-800 mb-6">Registration Successful!</h1>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              Welcome to Sky Nest Hotels! Your account has been created successfully. 
              You can now log in and start booking your perfect getaway.
            </p>
            
            <div className="space-y-3">
              <div className="text-sm text-gray-500">
                Redirecting to login in 3 seconds...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-20 pt-32">
      <div className="max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 pulse-slow">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-light text-white tracking-wide">SKY NEST HOTELS</h1>
          <p className="text-blue-200 mt-2">Welcome back to luxury</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Form Toggle */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-6 rounded-full font-medium transition-all duration-300 ${
                isLogin
                  ? 'bg-white text-gray-800 shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-6 rounded-full font-medium transition-all duration-300 ${
                !isLogin
                  ? 'bg-white text-gray-800 shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {isLogin ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to your account to continue</p>
              </div>

              {/* API Error Message */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{apiError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className={`form-input ${formErrors.username ? 'border-red-500' : ''}`}
                  placeholder="Enter your username"
                />
                {formErrors.username && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className={`form-input pr-11 ${formErrors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-amber-600 shadow-sm focus:border-amber-300 focus:ring focus:ring-amber-200 focus:ring-opacity-50" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-amber-600 hover:text-amber-700">
                  Forgot password?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-4 text-lg rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'btn-primary'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner mr-3"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </button>



              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button 
                  type="button" 
                  onClick={switchForm}
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Sign up here
                </button>
              </p>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Create Account</h2>
                <p className="text-gray-600">Join Sky Nest Hotels family</p>
              </div>

              {/* API Error Message */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{apiError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  className={`form-input ${formErrors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter your full name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  className={`form-input ${formErrors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                  className={`form-input ${formErrors.username ? 'border-red-500' : ''}`}
                  placeholder="Choose a username"
                />
                {formErrors.username && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                  className={`form-input ${formErrors.phone ? 'border-red-500' : ''}`}
                  placeholder="Enter your phone number"
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIC / Passport Number
                </label>
                <input
                  type="text"
                  value={registerForm.nic_no}
                  onChange={(e) => setRegisterForm({...registerForm, nic_no: e.target.value})}
                  className={`form-input ${formErrors.nic_no ? 'border-red-500' : ''}`}
                  placeholder="Enter your NIC or Passport number"
                />
                {formErrors.nic_no && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.nic_no}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    className={`form-input pr-11 ${formErrors.password ? 'border-red-500' : ''}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                    className={`form-input pr-11 ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-start">
                  <input 
                    type="checkbox" 
                    checked={registerForm.agreeToTerms}
                    onChange={(e) => setRegisterForm({...registerForm, agreeToTerms: e.target.checked})}
                    className={`rounded border-gray-300 text-amber-600 shadow-sm focus:border-amber-300 focus:ring focus:ring-amber-200 focus:ring-opacity-50 mt-1 ${formErrors.agreeToTerms ? 'border-red-500' : ''}`}
                  />
                  <span className="ml-2 text-sm text-gray-600 leading-relaxed">
                    I agree to the <a href="#" className="text-amber-600 hover:text-amber-700">Terms of Service</a> and <a href="#" className="text-amber-600 hover:text-amber-700">Privacy Policy</a>
                  </span>
                </label>
                {formErrors.agreeToTerms && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.agreeToTerms}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-4 text-lg rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'btn-primary'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner mr-3"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button 
                  type="button" 
                  onClick={switchForm}
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Sign in here
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="text-blue-200 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;