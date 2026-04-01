import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Wallet, Target, TrendingUp } from 'lucide-react';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-primary-600">Balance</div>
        <div className="space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">Log in</Link>
          <Link to="/signup" className="btn-primary">Sign up</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight">
          Track your money.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-green-400">Control your life.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl">
          The smart finance coach for students. Auto-scan receipts, plan budgets, and get AI-powered insights to hit your savings goals.
        </p>
        <Link to="/signup" className="btn-primary text-lg px-8 py-4 inline-flex items-center">
          Get Started <ArrowRight className="ml-2" size={20} />
        </Link>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-primary-100 rounded-2xl text-primary-600 mb-6">
                <Wallet size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Expense Tracking</h3>
              <p className="text-gray-500">Snap a picture of your receipt and let our AI extract amounts and categorizations instantly.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-blue-100 rounded-2xl text-blue-600 mb-6">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Intelligent Insights</h3>
              <p className="text-gray-500">Know exactly where your money goes with vibrant charts and end-of-month budget predictions.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-purple-100 rounded-2xl text-purple-600 mb-6">
                <Target size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Goal-Based Savings</h3>
              <p className="text-gray-500">Set targets for textbooks, trips, or loans and watch your progress bar fill up.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
