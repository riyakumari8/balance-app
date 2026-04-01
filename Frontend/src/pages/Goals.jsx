import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { Target, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const { formatAmount, formatAmountNoFractions, getSymbol } = useCurrency();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  // New goal state
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  
  // New budget state
  const [budgetAmount, setBudgetAmount] = useState('');

  const fetchData = async () => {
    const d = new Date();
    const [resG, resB] = await Promise.all([
      api.get('/goals'),
      api.get(`/budgets/${d.getFullYear()}/${d.getMonth() + 1}`)
    ]);
    setGoals(resG.data);
    if(resB.data) {
      setBudget(resB.data);
      setBudgetAmount(resB.data.amount);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!title || !targetAmount) return;
    try {
      await api.post('/goals', { title, targetAmount: parseFloat(targetAmount) });
      setTitle(''); setTargetAmount('');
      toast.success('Goal created');
      fetchData();
    } catch(e) { toast.error('Failed to create goal'); }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    if(!budgetAmount) return;
    const d = new Date();
    try {
      await api.post('/budgets', { amount: parseFloat(budgetAmount), month: d.getMonth() + 1, year: d.getFullYear() });
      toast.success('Budget Updated');
      fetchData();
    } catch(e) { toast.error('Failed to update budget'); }
  };

  const handleAddMoneyToGoal = async (id) => {
    const amt = window.prompt("How much to add?");
    if(amt && !isNaN(amt)){
      try {
        await api.put(`/goals/${id}/add?amount=${amt}`);
        toast.success('Money added to goal');
        fetchData();
      } catch(e) { toast.error('Failed to add money'); }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Planning & Savings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Set Budget */}
        <div className="glass-card p-6 border-t-4 border-t-primary-500">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Monthly Budget Limit</h2>
          <p className="text-sm border-b pb-4 mb-4 text-gray-500">Set the maximum you want to spend this month.</p>
          <form className="flex gap-4 items-end" onSubmit={handleSetBudget}>
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-medium pb-1 block">Budget Amount ({getSymbol()})</label>
              <input type="number" required value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} className="input-field" placeholder="1000"/>
            </div>
            <button type="submit" className="btn-primary py-2 px-6 h-[42px]">Save</button>
          </form>
        </div>

        {/* Add Goal */}
        <div className="glass-card p-6 border-t-4 border-t-blue-500">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Create New Goal</h2>
          <p className="text-sm border-b pb-4 mb-4 text-gray-500">What are you saving up for?</p>
          <form className="space-y-3" onSubmit={handleAddGoal}>
            <div className="flex gap-4">
              <div className="flex-[2]">
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="input-field py-2" placeholder="Goal Name (e.g. Vacation)"/>
              </div>
              <div className="flex-1">
                <input type="number" required value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="input-field py-2" placeholder={`Target ${getSymbol()}`}/>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-2 bg-blue-600 hover:bg-blue-700">Add Goal</button>
          </form>
        </div>
      </div>

      <div className="glass-card p-6 mt-6">
         <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Target size={20} className="mr-2 text-primary-500"/> Active Goals</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? 'Loading...' : goals.length === 0 ? <p className="text-gray-500 col-span-3">No active goals yet.</p> : (
               goals.map(g => {
                 const percentage = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
                 return (
                 <div key={g.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-lg transition bg-white relative overflow-hidden group">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-bold text-gray-800">{g.title}</span>
                     <button onClick={() => handleAddMoneyToGoal(g.id)} className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"><Plus size={14}/></button>
                   </div>
                   <div className="text-sm text-gray-500 mb-3">{formatAmountNoFractions(g.currentAmount)} of {formatAmountNoFractions(g.targetAmount)}</div>
                   {/* Progress bar */}
                   <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-primary-500 h-2.5 rounded-full" style={{width: `${percentage}%`}}></div>
                   </div>
                   <div className="text-right mt-1 text-xs font-medium text-gray-400">{percentage.toFixed(0)}%</div>
                 </div>
               )})
            )}
         </div>
      </div>

    </div>
  );
};

export default Goals;
