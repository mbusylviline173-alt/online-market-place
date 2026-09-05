import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  CheckCircle2, 
  Ban, 
  Trash2, 
  FolderOpen, 
  Search, 
  RefreshCw, 
  LogOut, 
  ExternalLink, 
  Store, 
  Mail, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  X, 
  Download, 
  Image as ImageIcon,
  Sparkles,
  Layers,
  Phone,
  MapPin,
  Check,
  Eye,
  ArrowRight
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  ADMIN_UID, 
  getAllUsers, 
  getUserFiles, 
  approveShopOwner, 
  banShopOwner, 
  unbanShopOwner, 
  deleteShopOwner, 
  deleteUserFile,
  seedSampleUsersToFirestore
} from '../services/firebase';
import { UserProfile, UserUploadedFile } from '../types';

interface AdminDashboardProps {
  user: FirebaseUser | null;
  userProfile?: UserProfile | null;
  onLogout: () => void;
  onViewMarketplace: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  userProfile,
  onLogout,
  onViewMarketplace,
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'banned'>('all');
  
  // Selected user for viewing files
  const [selectedUserForFiles, setSelectedUserForFiles] = useState<UserProfile | null>(null);
  const [userFiles, setUserFiles] = useState<UserUploadedFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Modals / Actions
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserProfile | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users:", err);
      showToast("Failed to fetch users from database");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllUsers();

    // Real-time listener for any new shop owner registrations
    const handleSync = () => {
      loadAllUsers();
    };

    window.addEventListener('shoplocal_user_registered', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('shoplocal_user_registered', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleOpenFiles = async (targetUser: UserProfile) => {
    setSelectedUserForFiles(targetUser);
    setIsLoadingFiles(true);
    try {
      const files = await getUserFiles(targetUser.uid);
      setUserFiles(files);
    } catch (err) {
      console.error("Error loading user files:", err);
      showToast("Error retrieving files for this user");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleApprove = async (targetUser: UserProfile) => {
    try {
      await approveShopOwner(targetUser.uid);
      setUsers((prev) => 
        prev.map((u) => u.uid === targetUser.uid ? { ...u, status: 'approved' } : u)
      );
      showToast(`Shop owner "${targetUser.ownerName || targetUser.email}" approved successfully!`);
    } catch (err) {
      console.error("Approval error:", err);
      showToast("Failed to update approval status");
    }
  };

  const handleBan = async (targetUser: UserProfile) => {
    try {
      await banShopOwner(targetUser.uid);
      setUsers((prev) => 
        prev.map((u) => u.uid === targetUser.uid ? { ...u, status: 'banned' } : u)
      );
      showToast(`Shop owner "${targetUser.ownerName || targetUser.email}" has been banned.`);
    } catch (err) {
      console.error("Ban error:", err);
      showToast("Failed to ban shop owner");
    }
  };

  const handleUnban = async (targetUser: UserProfile) => {
    try {
      await unbanShopOwner(targetUser.uid);
      setUsers((prev) => 
        prev.map((u) => u.uid === targetUser.uid ? { ...u, status: 'approved' } : u)
      );
      showToast(`Shop owner "${targetUser.ownerName || targetUser.email}" access restored!`);
    } catch (err) {
      console.error("Unban error:", err);
      showToast("Failed to restore shop owner");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteUser) return;
    setIsDeleting(true);
    try {
      await deleteShopOwner(confirmDeleteUser.uid);
      setUsers((prev) => prev.filter((u) => u.uid !== confirmDeleteUser.uid));
      if (selectedUserForFiles?.uid === confirmDeleteUser.uid) {
        setSelectedUserForFiles(null);
        setUserFiles([]);
      }
      showToast(`Shop owner "${confirmDeleteUser.ownerName || confirmDeleteUser.email}" deleted.`);
      setConfirmDeleteUser(null);
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteFile = async (file: UserUploadedFile) => {
    try {
      await deleteUserFile(file.id, file.userId);
      setUserFiles((prev) => prev.filter((f) => f.id !== file.id));
      setUsers((prev) => prev.map((u) => {
        if (u.uid === file.userId) {
          return { ...u, fileCount: Math.max(0, (u.fileCount || 1) - 1) };
        }
        return u;
      }));
      showToast(`File "${file.fileName}" deleted.`);
    } catch (err) {
      console.error("File deletion error:", err);
      showToast("Failed to delete file");
    }
  };

  const handleSeedSampleData = async () => {
    setIsLoading(true);
    try {
      await seedSampleUsersToFirestore();
      await loadAllUsers();
      showToast("Sample shop owners and files seeded into Firestore!");
    } catch (e) {
      showToast("Could not seed data");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    // Exclude admin from regular shop owners table or display clearly
    const matchesSearch = 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.ownerName && u.ownerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.shopName && u.shopName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.uid.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    return u.status === statusFilter;
  });

  // Calculate high-level stats
  const totalUsersCount = users.length;
  const pendingCount = users.filter((u) => u.status === 'pending').length;
  const approvedCount = users.filter((u) => u.status === 'approved').length;
  const bannedCount = users.filter((u) => u.status === 'banned').length;
  const totalFilesCount = users.reduce((acc, u) => acc + (u.fileCount || 0), 0);

  const formatDate = (dateVal: any) => {
    if (!dateVal) return 'Recently';
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="admin-toast-message"
          className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-sm border border-emerald-400 animate-in slide-in-from-bottom-5"
        >
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar with Clear ADMIN Indicator */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl tracking-tight text-white">
                    Shop<span className="text-pink-400">Local</span>
                  </span>
                  {/* The requested Admin Badge / Indicator */}
                  <span 
                    id="admin-badge-indicator"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm shadow-indigo-500/50 uppercase tracking-wider"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin View
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                  <span>UID:</span>
                  <span className="text-indigo-300 font-semibold">{user?.uid || ADMIN_UID}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="admin-view-marketplace-btn"
              type="button"
              onClick={onViewMarketplace}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-slate-700"
            >
              <Store className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">View Public Marketplace</span>
            </button>

            <button
              id="admin-logout-btn"
              type="button"
              onClick={onLogout}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-rose-800/40"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Alert highlighting Admin Powers */}
        <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-bold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Master Authority Console Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Merchant Directory & Shop Approvals
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              As administrator <code className="text-indigo-300 bg-slate-900/80 px-2 py-0.5 rounded border border-indigo-800/50">{ADMIN_UID}</code>, you have exclusive privilege to approve new shop owners, inspect all user-uploaded files, ban violators, and manage Firestore user data.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-2.5 shrink-0">
            <button
              id="admin-refresh-users-btn"
              type="button"
              onClick={loadAllUsers}
              disabled={isLoading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
              <span>Refresh Users</span>
            </button>

            <button
              id="admin-seed-demo-users-btn"
              type="button"
              onClick={handleSeedSampleData}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              title="Populate test shop owners and uploaded files in Firestore"
            >
              <Sparkles className="w-4 h-4" />
              <span>Seed Sample Shops</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">Total Users</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white">{totalUsersCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">In Firestore DB</div>
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('pending')}
            role="button"
            tabIndex={0}
            title="Click to filter by accounts pending review"
            className={`border p-5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] ${
              pendingCount > 0 
                ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 hover:border-amber-400' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Pending Review</span>
              <Clock className={`w-4 h-4 ${pendingCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-amber-400">{pendingCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Awaiting Approval (Click)</div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">Approved Shops</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-emerald-400">{approvedCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Active Merchants</div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">Total Files</span>
              <FolderOpen className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-purple-400">{totalFilesCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Uploaded Assets</div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">Banned Accounts</span>
              <Ban className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-rose-400">{bannedCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Suspended Access</div>
            </div>
          </div>
        </div>

        {/* User Search and Status Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="admin-search-users-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email, shop name, or UID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              id="admin-filter-all"
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              All ({users.length})
            </button>
            <button
              id="admin-filter-pending"
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-900'
              }`}
            >
              <span>Pending Review</span>
              {pendingCount > 0 && (
                <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              id="admin-filter-approved"
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-slate-900'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              id="admin-filter-banned"
              type="button"
              onClick={() => setStatusFilter('banned')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
                statusFilter === 'banned'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-400/90 hover:text-rose-300 hover:bg-slate-900'
              }`}
            >
              Banned ({bannedCount})
            </button>
          </div>
        </div>

        {/* User List Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Registered Accounts ({filteredUsers.length})</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Click any user's file badge or "View Files" button to inspect their uploads
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
              <p className="text-sm font-medium">Fetching users from Firestore database...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Users className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-base font-bold text-slate-300">No users found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No account matches your search or filter. You can click "Seed Sample Shops" above to populate test shop owners.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/60 bg-slate-900/50 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    <th className="py-3.5 px-6">User / Merchant</th>
                    <th className="py-3.5 px-4">Account Created</th>
                    <th className="py-3.5 px-4">Approval Status</th>
                    <th className="py-3.5 px-4">Uploaded Files</th>
                    <th className="py-3.5 px-6 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-xs">
                  {filteredUsers.map((u) => {
                    const isCurrentUserAdmin = u.uid === ADMIN_UID || u.role === 'admin';
                    return (
                      <tr 
                        key={u.uid} 
                        className="hover:bg-slate-900/40 transition-colors group"
                      >
                        {/* User / Merchant Column */}
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                              {isCurrentUserAdmin ? (
                                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                              ) : (
                                <Store className="w-5 h-5 text-indigo-400" />
                              )}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm truncate max-w-[200px]">
                                  {u.shopName || u.ownerName || 'Independent Merchant'}
                                </span>
                                {isCurrentUserAdmin && (
                                  <span className="px-2 py-0.5 bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 rounded-md text-[10px] font-black uppercase">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-slate-500" />
                                <span>{u.email}</span>
                              </div>
                              {u.ownerName && (
                                <div className="text-[11px] text-slate-400">
                                  Owner: <span className="text-slate-300 font-medium">{u.ownerName}</span>
                                  {u.shopCategory && (
                                    <span className="ml-2 text-slate-500">• {u.shopCategory}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Account Created Column */}
                        <td className="py-4 px-4 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{formatDate(u.createdAt)}</span>
                          </div>
                        </td>

                        {/* Approval Status Column */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {u.status === 'pending' ? (
                            <span 
                              id={`status-badge-pending-${u.uid}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 border border-amber-600/40 text-amber-300 font-bold rounded-full text-[11px]"
                            >
                              <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                              <span>Pending Review</span>
                            </span>
                          ) : u.status === 'approved' ? (
                            <span 
                              id={`status-badge-approved-${u.uid}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 font-bold rounded-full text-[11px]"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Approved</span>
                            </span>
                          ) : u.status === 'banned' ? (
                            <span 
                              id={`status-badge-banned-${u.uid}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-950/60 border border-rose-600/40 text-rose-300 font-bold rounded-full text-[11px]"
                            >
                              <Ban className="w-3 h-3 text-rose-400" />
                              <span>Banned</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-300 font-medium rounded-full text-[11px]">
                              {u.status || 'Active'}
                            </span>
                          )}
                        </td>

                        {/* Uploaded Files Count Column */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            id={`view-files-count-btn-${u.uid}`}
                            onClick={() => handleOpenFiles(u)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/50 text-slate-200 rounded-xl transition-all cursor-pointer text-xs font-semibold group/btn"
                            title="Click to view all uploaded files for this user"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-purple-400 group-hover/btn:scale-110 transition-transform" />
                            <span>{u.fileCount || 0} files</span>
                            <span className="text-[10px] text-purple-300 underline font-normal ml-0.5">
                              inspect
                            </span>
                          </button>
                        </td>

                        {/* Admin Actions Column */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {/* 1. If Pending: Show Approve button */}
                            {u.status === 'pending' && (
                              <button
                                type="button"
                                id={`approve-shop-btn-${u.uid}`}
                                onClick={() => handleApprove(u)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 shadow-sm shadow-emerald-700/30"
                                title="Approve this shop owner to access the merchant dashboard"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}

                            {/* 2. Ban / Unban Toggle */}
                            {u.status === 'approved' && !isCurrentUserAdmin && (
                              <button
                                type="button"
                                id={`ban-shop-btn-${u.uid}`}
                                onClick={() => handleBan(u)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-amber-950/60 text-slate-400 hover:text-amber-300 border border-slate-700 hover:border-amber-700/60 font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                                title="Ban this shop owner and revoke dashboard access"
                              >
                                <Ban className="w-3.5 h-3.5 text-amber-400" />
                                <span className="hidden xl:inline">Ban</span>
                              </button>
                            )}

                            {u.status === 'banned' && !isCurrentUserAdmin && (
                              <button
                                type="button"
                                id={`unban-shop-btn-${u.uid}`}
                                onClick={() => handleUnban(u)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-emerald-950/60 text-slate-400 hover:text-emerald-300 border border-slate-700 hover:border-emerald-700/60 font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                                title="Unban shop owner and restore access"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="hidden xl:inline">Unban</span>
                              </button>
                            )}

                            {/* 3. View Files button */}
                            <button
                              type="button"
                              id={`view-files-action-btn-${u.uid}`}
                              onClick={() => handleOpenFiles(u)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-300 border border-slate-700 hover:border-indigo-700/60 font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                              title="View all files uploaded by this user"
                            >
                              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="hidden xl:inline">Files</span>
                            </button>

                            {/* 4. Delete Shop Owner (Remove account) */}
                            {!isCurrentUserAdmin && (
                              <button
                                type="button"
                                id={`delete-shop-btn-${u.uid}`}
                                onClick={() => setConfirmDeleteUser(u)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-700/60 font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                                title="Permanently delete this shop owner"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: View User's Uploaded Files */}
      {selectedUserForFiles && (
        <div 
          id="user-files-modal"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
        >
          <div 
            className="relative bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-300">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Uploaded Files</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50 font-bold">
                      {userFiles.length} item{userFiles.length === 1 ? '' : 's'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    User: <strong className="text-slate-200">{selectedUserForFiles.email}</strong> • {selectedUserForFiles.shopName || selectedUserForFiles.ownerName || 'Merchant'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="close-user-files-modal-btn"
                onClick={() => {
                  setSelectedUserForFiles(null);
                  setUserFiles([]);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Files Grid */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {isLoadingFiles ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
                  <p className="text-xs">Loading user files from Firestore & Storage...</p>
                </div>
              ) : userFiles.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                  <FolderOpen className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm font-bold text-slate-300">No uploaded files</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    This user hasn't uploaded any product photos or documents to Cloud Storage yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userFiles.map((file) => (
                    <div 
                      key={file.id}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex flex-col justify-between gap-3 group transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {/* Thumbnail / Icon */}
                        <div 
                          className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center relative cursor-pointer"
                          onClick={() => setPreviewImage(file.downloadUrl)}
                          title="Click to preview full image"
                        >
                          {file.downloadUrl && (file.fileType.startsWith('image/') || file.downloadUrl.includes('image') || file.downloadUrl.startsWith('data:image')) ? (
                            <img 
                              src={file.downloadUrl} 
                              alt={file.fileName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <FileText className="w-7 h-7 text-slate-500" />
                          )}
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        {/* File Details */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-xs font-bold text-white truncate" title={file.fileName}>
                            {file.fileName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {file.fileSize ? `${Math.round(file.fileSize / 1024)} KB` : 'Direct Upload'} • {file.fileType.split('/')[1] || 'asset'}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Uploaded: {formatDate(file.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* File Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                        <a 
                          href={file.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open File</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDeleteFile(file)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete this uploaded file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedUserForFiles(null);
                  setUserFiles([]);
                }}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Files View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center">
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-slate-700"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full flex items-center justify-center border border-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Shop Owner */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">
                Delete Shop Owner Account?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently remove <strong className="text-white">{confirmDeleteUser.ownerName || confirmDeleteUser.email}</strong>?
                This will delete their Firestore user document and all associated files. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-user-btn"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-900/40"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
