
import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config';  // adapte le chemin

import {
  UsersIcon,
  SearchIcon,
  PlusIcon,
  EditIconAlt,
  TrashIcon,
  PrintIcon,
  LogoutIcon,
  EmptyBoxIcon
} from './Icons';

interface GestionUtilisateursProps {
  onNavigateBack: () => void;
}

type Fonction = {
  id: number;
  nom: string;
  description?: string | null;
};

type Utilisateur = {
  id?: number;
  nom: string;
  login: string;
  contact?: string | null;
  password?: string | null;
  id_fonction?: number | null;
};

const tableHeaders = ["Nom Complet", "Login", "Contact", "Fonction"];

const GestionUtilisateurs: React.FC<GestionUtilisateursProps> = ({ onNavigateBack }) => {
  const [fonctions, setFonctions] = useState<Fonction[]>([]);
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  // Modal / form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Utilisateur | null>(null);

  useEffect(() => {
    fetchFonctions();
    fetchUsers();
  }, []);

  const fetchFonctions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/fonctions`);
      const data = await res.json();
      setFonctions(data || []);
    } catch (e) {
      console.error('Erreur fonctions', e);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/utilisateurs/all`);
      const data = await res.json();
      setUsers(data || []);
    } catch (e) {
      console.error('Erreur utilisateurs', e);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingUser({ nom: '', login: '', contact: '', password: '', id_fonction: null });
    setIsFormOpen(true);
  };

  const openEdit = (u: any) => {
    setEditingUser({ id: u.id, nom: u.nom || '', login: u.login || '', contact: u.contact || '', password: '', id_fonction: u.id_fonction || null });
    setIsFormOpen(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/utilisateurs/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (e) {
      console.error('Erreur suppression', e);
    }
  };

  const handleSave = async () => {
    if (!editingUser) return;
    const payload = {
      nom: editingUser.nom,
      login: editingUser.login,
      password: editingUser.password,
      contact: editingUser.contact,
      idFonction: editingUser.id_fonction
    };

    try {
      if (editingUser.id) {
        await fetch(`${API_BASE_URL}/api/utilisateurs/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(`${API_BASE_URL}/api/utilisateurs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setIsFormOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (e) {
      console.error('Erreur sauvegarde', e);
    }
  };

  const filtered = users.filter(u => u.nom.toLowerCase().startsWith(query.toLowerCase()));

  return (
    <div className="p-6 lg:p-10">
      <div className="bg-white rounded-xl shadow-lg border">
        <div className="bg-gray-50 rounded-t-xl p-4 flex items-center justify-between border-b">
          <div className="flex items-center">
            <UsersIcon className="h-6 w-6 mr-3 text-[#0d2d53]" />
            <h2 className="text-xl font-bold text-gray-800">Liste des utilisateurs</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-2">
            <label htmlFor="search-user" className="text-sm font-medium text-gray-700 whitespace-nowrap">Nom commençant par :</label>
            <div className="relative w-full max-w-sm">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                type="text"
                id="search-user"
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {tableHeaders.map((header) => (
                    <th key={header} className="p-3 font-semibold tracking-wider text-left text-gray-600 uppercase">{header}</th>
                  ))}
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={tableHeaders.length + 1} className="text-center py-6">Chargement...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={tableHeaders.length + 1} className="text-center py-16">
                      <div className="flex flex-col items-center text-gray-500">
                        <EmptyBoxIcon className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="font-semibold">Aucun utilisateur à afficher</p>
                        <p className="text-xs">Utilisez le bouton "Ajouter" pour créer un nouvel utilisateur.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((u: any) => (
                    <tr key={u.id}>
                      <td className="p-3">{u.nom}</td>
                      <td className="p-3">{u.login}</td>
                      <td className="p-3">{u.contact}</td>
                      <td className="p-3">{fonctions.find(f => f.id === u.id_fonction)?.nom || '-'}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(u)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm flex items-center"><EditIconAlt className="h-4 w-4 mr-2"/>Modifier</button>
                          <button onClick={() => handleDelete(u.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm flex items-center"><TrashIcon className="h-4 w-4 mr-2"/>Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <div className="flex flex-wrap gap-2">
            <button onClick={openAdd} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow"><PlusIcon className="h-4 w-4" /><span>Ajouter</span></button>
            <button onClick={fetchUsers} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow"><PrintIcon className="h-4 w-4" /><span>Rafraîchir</span></button>
          </div>
          <button
            onClick={onNavigateBack}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow"
          >
            <LogoutIcon className="h-4 w-4" />
            <span>Quitter</span>
          </button>
        </div>
      </div>

      {/* Simple form modal */}
      {isFormOpen && editingUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">{editingUser.id ? 'Modifier utilisateur' : 'Nouveau utilisateur'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input value={editingUser.nom} onChange={e => setEditingUser({...editingUser, nom: e.target.value})} className="w-full border px-3 py-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Login</label>
                <input value={editingUser.login} onChange={e => setEditingUser({...editingUser, login: e.target.value})} className="w-full border px-3 py-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <input value={editingUser.password || ''} onChange={e => setEditingUser({...editingUser, password: e.target.value})} className="w-full border px-3 py-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact</label>
                <input value={editingUser.contact || ''} onChange={e => setEditingUser({...editingUser, contact: e.target.value})} className="w-full border px-3 py-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fonction</label>
                <select value={editingUser.id_fonction || ''} onChange={e => setEditingUser({...editingUser, id_fonction: e.target.value ? Number(e.target.value) : null})} className="w-full border px-3 py-2 rounded-md">
                  <option value="">-- Sélectionner --</option>
                  {fonctions.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setIsFormOpen(false); setEditingUser(null); }} className="px-4 py-2 bg-gray-200 rounded-md">Annuler</button>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-md">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUtilisateurs;
