import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { Camera, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const { formatAmount, getSymbol } = useCurrency();
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [merchant, setMerchant] = useState('');
  const [note, setNote] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [fileError, setFileError] = useState('');

  const fetchExpenses = async () => {
    const res = await api.get('/expenses');
    setExpenses(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!amount) return;
    try {
      const payload = { amount: parseFloat(amount), category, date, merchant, note };
      await api.post('/expenses', payload);
      setAmount(''); setMerchant(''); setNote('');
      toast.success('Expense added successfully');
      fetchExpenses();
    } catch (e) {
      toast.error('Failed to add expense');
    }
  };

  const handleOCRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOcrLoading(true);
    setFileError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/receipts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = res.data;
      if (data.amount) setAmount(data.amount.toString());
      if (data.date) setDate(data.date);
      if (data.merchant && data.merchant !== 'Unknown Merchant') setMerchant(data.merchant);
      
      // We don't save immediately, we just fill the form for user to check and edit
    } catch (err) {
      setFileError('Failed to process receipt.');
      toast.error('Failed to process receipt');
    } finally {
      setOcrLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    if(window.confirm('Delete expense?')) {
      try {
        await api.delete(`/expenses/${id}`);
        toast.success('Expense deleted');
        fetchExpenses();
      } catch(e) { toast.error('Failed to delete'); }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manage Expenses</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ADD FORM */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Smart Scan */}
          <div className="glass-card p-6 bg-gradient-to-br from-green-50 to-primary-50 border-primary-100">
            <h2 className="text-lg font-bold text-primary-800 flex items-center mb-4"><Camera className="mr-2" size={20}/> Smart Receipt Scan</h2>
            <p className="text-sm text-primary-600 mb-4">Upload a receipt and AI will auto-fill the details for you.</p>
            <label className="btn-primary w-full flex justify-center cursor-pointer">
              {ocrLoading ? 'Scanning...' : 'Upload Receipt'}
              <input type="file" accept="image/*" className="hidden" onChange={handleOCRUpload} disabled={ocrLoading} />
            </label>
            {fileError && <p className="text-red-500 text-xs mt-2">{fileError}</p>}
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Manual Expense</h2>
            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-medium pb-1 block">Amount ({getSymbol()})</label>
                <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" placeholder="0.00"/>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium pb-1 block">Merchant</label>
                <input type="text" value={merchant} onChange={(e) => setMerchant(e.target.value)} className="input-field" placeholder="Uber, Starbucks..."/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-gray-500 font-medium pb-1 block">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                      <option>Food</option>
                      <option>Travel</option>
                      <option>Shopping</option>
                      <option>Bills</option>
                      <option>Other</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 font-medium pb-1 block">Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field"/>
                 </div>
              </div>
              <button type="submit" className="w-full btn-primary bg-gray-900 hover:bg-gray-800 flex justify-center items-center mt-2">
                <Plus size={16} className="mr-2"/> Save Expense
              </button>
            </form>
          </div>
        </div>

        {/* LIST */}
        <div className="lg:col-span-2 glass-card p-6 overflow-hidden flex flex-col h-[600px]">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">History</h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {loading ? <p>Loading...</p> : expenses.length === 0 ? <p className="text-gray-500 text-sm">No expenses found.</p> : (
               expenses.map(e => (
                 <div key={e.id} className="p-4 border rounded-xl hover:shadow-md transition bg-white flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-400">
                        {e.category.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-lg">{e.merchant || e.category}</div>
                        <div className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString()} &bull; {e.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-bold text-gray-900">{formatAmount(e.amount)}</div>
                      <button onClick={() => deleteExpense(e.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                 </div>
               ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Expenses;
