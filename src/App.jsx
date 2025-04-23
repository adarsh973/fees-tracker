// Full Firebase Firestore restructuring for Fee Tracker App
// New Firestore structure:
// Collection: grounds
// Document: <ground_id>
// Subcollection: months
// Document: <month_name>
// Subcollection: players
// Document: <player_id>

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
  deleteField
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
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <main className="max-w-7xl mx-auto p-6">
        <header className="flex items-center space-x-4 mb-8">
          <img src={logo} alt="Logo" className="w-16 h-16" />
          <h1 className="text-3xl font-bold">Fee Tracker</h1>
        </header>

        {/* Ground Selector */}
        <div className="mb-4">
          {grounds.map(g => (
            <button
              key={g.id}
              className={`px-4 py-2 m-1 ${g.id === currentGround ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setCurrentGround(g.id)}>
              {g.name}
            </button>
          ))}
        </div>
        <input value={newGround} onChange={e => setNewGround(e.target.value)} placeholder="New Ground" className="border p-2" />
        <button onClick={addGround} className="bg-blue-500 text-white px-4 py-2 rounded ml-2">Add Ground</button>

        {/* Month Selector */}
        <div className="mt-6 mb-4">
          {months.map(m => (
            <button
              key={m}
              className={`px-4 py-2 m-1 ${m === currentMonth ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setCurrentMonth(m)}>
              {m}
            </button>
          ))}
        </div>
        <input value={newMonth} onChange={e => setNewMonth(e.target.value)} placeholder="New Month" className="border p-2" />
        <button onClick={addMonth} className="bg-green-500 text-white px-4 py-2 rounded ml-2">Add Month</button>

        {/* Players Table */}
        <div className="mt-6">
          <button onClick={addPlayer} className="bg-purple-600 text-white px-4 py-2 rounded mb-4">Add Player</button>
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Contact</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Due Fees</th>
                <th className="px-4 py-2">Due Date</th>
                <th className="px-4 py-2">Remarks</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-t">
                  <td><input className="w-full" value={player.name} onChange={e => updatePlayer(player.id, 'name', e.target.value)} /></td>
                  <td><input className="w-full" value={player.contact} onChange={e => updatePlayer(player.id, 'contact', e.target.value)} /></td>
                  <td>
                    <select className="w-full" value={player.status} onChange={e => updatePlayer(player.id, 'status', e.target.value)}>
                      <option>Paid</option>
                      <option>Not Paid</option>
                    </select>
                  </td>
                  <td><input className="w-full" type="number" value={player.dueFees} onChange={e => updatePlayer(player.id, 'dueFees', +e.target.value)} /></td>
                  <td><input className="w-full" type="date" value={player.dueDate} onChange={e => updatePlayer(player.id, 'dueDate', e.target.value)} /></td>
                  <td><input className="w-full" value={player.remarks} onChange={e => updatePlayer(player.id, 'remarks', e.target.value)} /></td>
                  <td>
                    <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => deletePlayer(player.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
