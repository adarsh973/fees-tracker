import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import logo from './assets/nufclogo.png';
import toast, { Toaster } from 'react-hot-toast';

export default function FeeTrackerApp() {
  const [grounds, setGrounds] = useState([]);
  const [currentGround, setCurrentGround] = useState('');
  const [months, setMonths] = useState([]);
  const [currentMonth, setCurrentMonth] = useState('');
  const [players, setPlayers] = useState([]);
  const [newGround, setNewGround] = useState('');
  const [newMonth, setNewMonth] = useState('');

  useEffect(() => {
    const fetchGrounds = async () => {
      const snapshot = await getDocs(collection(db, 'grounds'));
      const groundList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGrounds(groundList);
      if (groundList.length > 0) setCurrentGround(groundList[0].id);
    };
    fetchGrounds();
  }, []);

  useEffect(() => {
    if (!currentGround) return;
    const fetchMonths = async () => {
      const monthSnap = await getDocs(collection(db, `grounds/${currentGround}/months`));
      const monthList = monthSnap.docs.map(doc => doc.id);
      setMonths(monthList);
      if (monthList.length > 0) setCurrentMonth(monthList[0]);
    };
    fetchMonths();
  }, [currentGround]);

  useEffect(() => {
    if (!currentGround || !currentMonth) return;
    const fetchPlayers = async () => {
      const playerSnap = await getDocs(collection(db, `grounds/${currentGround}/months/${currentMonth}/players`));
      const playerList = playerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playerList);
    };
    fetchPlayers();
  }, [currentMonth, currentGround]);

  const addGround = async () => {
    if (!newGround.trim()) return;
    const groundRef = await addDoc(collection(db, 'grounds'), { name: newGround });
    setGrounds(prev => [...prev, { id: groundRef.id, name: newGround }]);
    setCurrentGround(groundRef.id);
    setNewGround('');
    toast.success('Ground added');
  };

  const addMonth = async () => {
    if (!newMonth.trim()) return;
    const monthRef = doc(db, `grounds/${currentGround}/months/${newMonth}`);
    await setDoc(monthRef, { created: new Date().toISOString() });
    setMonths(prev => [...prev, newMonth]);
    setCurrentMonth(newMonth);
    setNewMonth('');
    toast.success('Month added');
  };

  const addPlayer = async () => {
    const newPlayer = {
      name: '',
      contact: '',
      status: 'Not Paid',
      dueFees: 0,
      dueDate: '',
      remarks: '',
    };
    const playerRef = await addDoc(collection(db, `grounds/${currentGround}/months/${currentMonth}/players`), newPlayer);
    setPlayers(prev => [...prev, { ...newPlayer, id: playerRef.id }]);
    toast.success('Player added');
  };

  const updatePlayer = async (id, key, value) => {
    await updateDoc(doc(db, `grounds/${currentGround}/months/${currentMonth}/players/${id}`), {
      [key]: value,
    });
    setPlayers(prev =>
      prev.map(p => (p.id === id ? { ...p, [key]: value } : p))
    );
  };

  const deletePlayer = async (id) => {
    await deleteDoc(doc(db, `grounds/${currentGround}/months/${currentMonth}/players/${id}`));
    setPlayers(prev => prev.filter(p => p.id !== id));
    toast.success('Player deleted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white font-sans">
      <Toaster />
      <main className="max-w-7xl mx-auto p-6">
        <header className="flex items-center space-x-4 mb-8">
          <img src={logo} alt="Logo" className="w-16 h-16 rounded-full border-2 border-white" />
          <div>
            <h1 className="text-4xl font-bold">NORTHERN UNITED FC</h1>
            <p className="text-lg italic text-gray-300">DREAM • BELIEVE • ACHIEVE</p>
          </div>
        </header>

        {/* Ground Selector */}
        <div className="mb-4 flex flex-wrap gap-2">
          {grounds.map(g => (
            <button
              key={g.id}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                g.id === currentGround ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white' : 'bg-gray-300 text-black'
              }`}
              onClick={() => setCurrentGround(g.id)}>
              {g.name}
            </button>
          ))}
        </div>
        <div className="flex items-center mb-6">
          <input
            value={newGround}
            onChange={e => setNewGround(e.target.value)}
            placeholder="New Ground"
            className="border p-2 rounded-l-full text-white bg-black placeholder-gray-300"
          />
          <button
            onClick={addGround}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-r-full">
            Add Ground
          </button>
        </div>

        {/* Month Selector */}
        <div className="mb-4 flex flex-wrap gap-2">
          {months.map(m => (
            <button
              key={m}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                m === currentMonth ? 'bg-gradient-to-r from-green-400 to-green-700 text-white' : 'bg-gray-300 text-black'
              }`}
              onClick={() => setCurrentMonth(m)}>
              {m}
            </button>
          ))}
        </div>
        <div className="flex items-center mb-8">
          <input
            value={newMonth}
            onChange={e => setNewMonth(e.target.value)}
            placeholder="New Month"
            className="border p-2 rounded-l-full text-white bg-black placeholder-gray-300"
          />
          <button
            onClick={addMonth}
            className="bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-2 rounded-r-full">
            Add Month
          </button>
        </div>

        {/* Players Table */}
        <div className="mt-6">
          <button
            onClick={addPlayer}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full mb-4">
            Add Player
          </button>
          <div className="overflow-x-auto rounded-2xl shadow-xl">
            <table className="min-w-full bg-white text-black rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-gray-300 to-gray-200 font-semibold text-black text-lg">
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Contact</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Due Fees</th>
                  <th className="px-6 py-3 text-left">Due Date</th>
                  <th className="px-6 py-3 text-left">Remarks</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, idx) => (
                  <tr key={player.id} className={`hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-2"><input className="w-full p-1 rounded-md" value={player.name} onChange={e => updatePlayer(player.id, 'name', e.target.value)} /></td>
                    <td className="px-6 py-2"><input className="w-full p-1 rounded-md" value={player.contact} onChange={e => updatePlayer(player.id, 'contact', e.target.value)} /></td>
                    <td className="px-6 py-2">
                      <select className="w-full p-1 rounded-md" value={player.status} onChange={e => updatePlayer(player.id, 'status', e.target.value)}>
                        <option>Paid</option>
                        <option>Not Paid</option>
                      </select>
                    </td>
                    <td className="px-6 py-2"><input className="w-full p-1 rounded-md" type="number" value={player.dueFees} onChange={e => updatePlayer(player.id, 'dueFees', +e.target.value)} /></td>
                    <td className="px-6 py-2"><input className="w-full p-1 rounded-md" type="date" value={player.dueDate} onChange={e => updatePlayer(player.id, 'dueDate', e.target.value)} /></td>
                    <td className="px-6 py-2"><input className="w-full p-1 rounded-md" value={player.remarks} onChange={e => updatePlayer(player.id, 'remarks', e.target.value)} /></td>
                    <td className="px-6 py-2">
                      <button className="px-3 py-1 bg-red-600 text-white rounded-full hover:bg-red-700" onClick={() => deletePlayer(player.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}