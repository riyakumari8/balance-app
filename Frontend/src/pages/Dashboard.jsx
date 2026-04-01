import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, AlertTriangle, Info, Calendar } from 'lucide-react';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6', '#64748b'];

const Dashboard = () => {
  const { user } = useAuth();
  const { formatAmount, formatAmountNoFractions } = useCurrency();
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const date = new Date();
      const [expRes, budRes] = await Promise.all([
        api.get('/expenses'),
        api.get(`/budgets/${date.getFullYear()}/${date.getMonth() + 1}`)
      ]);
      setExpenses(expRes.data);
      if(budRes.data) setBudget(budRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center p-8">Loading dashboard...</div>;

  const currentMonth = new Date().getMonth();
  const currentMonthExpenses = expenses.filter(e => new Date(e.date).getMonth() === currentMonth);
  const totalSpent = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);
  
  // Group spending by category
  const categoryData = currentMonthExpenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if(existing) existing.value += curr.amount;
    else acc.push({ name: curr.category, value: curr.amount });
    return acc;
  }, []);

  const budgetAmount = budget?.amount || 0;
  const spendingPercentage = budgetAmount ? (totalSpent / budgetAmount) * 100 : 0;
  
  // Prediction dummy calculation (assuming linear spending)
  const currentDay = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), currentMonth + 1, 0).getDate();
  const projectedSpend = (totalSpent / currentDay) * daysInMonth;

  // Derive Insights
  const highestCategory = categoryData.length > 0 ? [...categoryData].sort((a,b) => b.value - a.value)[0].name : 'N/A';

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 mt-2">Here’s what’s happening with your finances this month.</p>
      </header>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="text-gray-500 text-sm font-medium mb-1">Total Spent This Month</div>
          <div className="text-3xl font-bold text-gray-900">{formatAmount(totalSpent)}</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-gray-500 text-sm font-medium mb-1">Remaining Budget</div>
          <div className="text-3xl font-bold text-gray-900">
            {budgetAmount ? formatAmount(Math.max(0, budgetAmount - totalSpent)) : 'Not Set'}
          </div>
          {budgetAmount > 0 && spendingPercentage > 80 && (
            <div className="text-xs text-red-500 mt-2 flex items-center">
              <AlertTriangle size={14} className="mr-1"/> Warning: Over 80% used!
            </div>
          )}
        </div>
        <div className="glass-card p-6 bg-gradient-to-br from-primary-50 to-white">
          <div className="text-primary-600 text-sm font-medium mb-1 flex items-center">
             <Info size={16} className="mr-2"/> Smart Insight
          </div>
          <p className="text-sm text-gray-700 mt-2">
            You spend the most on <strong>{highestCategory}</strong>. Focus on cutting costs here! <br/>
            Projected end-of-month spend: <strong>{formatAmountNoFractions(projectedSpend)}</strong>
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Charts */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Spending by Category</h2>
          <div className="h-[300px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatAmount(val)} />
                </PieChart>
              </ResponsiveContainer>
             ) : <p className="text-gray-500 text-sm">No expenses this month yet.</p>}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {expenses.slice(0, 5).map((exp) => (
               <div key={exp.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <TrendingUp size={18}/>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{exp.merchant || exp.category}</div>
                      <div className="text-xs text-gray-400 flex items-center"><Calendar size={12} className="mr-1"/> {new Date(exp.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="font-bold text-gray-900">-{formatAmount(exp.amount)}</div>
               </div>
            ))}
            {expenses.length === 0 && <p className="text-gray-500 text-sm">No recent transactions.</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
