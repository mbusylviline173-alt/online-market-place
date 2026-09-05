import React, { useState } from 'react';
import { 
  Clock, 
  Store, 
  CheckCircle2, 
  Mail, 
  Phone, 
  MapPin, 
  RefreshCw, 
  LogOut, 
  ArrowRight, 
  ShieldAlert,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';
import { getUserProfile } from '../services/firebase';

interface PendingApprovalScreenProps {
  user: FirebaseUser | null;
  userProfile?: UserProfile | null;
  onRefreshProfile: () => Promise<void>;
  onLogout: () => void;
  onViewMarketplace: () => void;
}

export const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({
  user,
  userProfile,
  onRefreshProfile,
  onLogout,
  onViewMarketplace,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setStatusMessage(null);
    try {
      await onRefreshProfile();
      setStatusMessage("Status refreshed. If recently approved, your dashboard will load momentarily.");
    } catch {
      setStatusMessage("Could not check status. Please try again in a few moments.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg">
            <Store className="w-5 h-5" />
          </div>
          <span className="font-black text-lg tracking-tight text-white">
            Shop<span className="text-pink-400">Local</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700/60"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Center Notice Card */}
      <main className="max-w-xl w-full mx-auto my-auto py-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-md">
          
          {/* Status Indicator Icon */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                Application Pending Review
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Shop Registration Under Review
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Thank you for registering <strong className="text-white font-bold">{userProfile?.shopName || 'your shop'}</strong> on ShopLocal. To protect local shoppers and maintain high marketplace standards, our platform administrator reviews and approves all new independent merchants before dashboard access is unlocked.
          </p>

          {/* Submitted Shop Overview */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4.5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-indigo-400" />
              <span>Submitted Application Summary</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Shop Name</span>
                <span className="font-bold text-white text-sm">{userProfile?.shopName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <span className="font-semibold text-indigo-300">{userProfile?.shopCategory || 'Independent Merchant'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Owner</span>
                <span className="font-medium text-slate-200">{userProfile?.ownerName || user?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Registered Email</span>
                <span className="font-mono text-slate-300 truncate block">{user?.email}</span>
              </div>
              {userProfile?.phone && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                  <span className="font-medium text-slate-200">{userProfile.phone}</span>
                </div>
              )}
              {userProfile?.address && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Location</span>
                  <span className="font-medium text-slate-200">{userProfile.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Message if refreshed */}
          {statusMessage && (
            <div className="p-3 bg-indigo-950/50 border border-indigo-700/50 rounded-xl text-xs text-indigo-200">
              {statusMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              id="check-approval-status-btn"
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Verifying with Database...' : 'Check Approval Status'}</span>
            </button>

            <button
              type="button"
              id="pending-view-marketplace-btn"
              onClick={onViewMarketplace}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <span>Explore Public Marketplace While You Wait</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Admin Demo Hint */}
          <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Platform Notice:</strong> The administrator can approve your shop immediately from the Admin Dashboard. Once approved, you can refresh this page to manage products and inventory.
            </span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-slate-500 text-xs py-4">
        ShopLocal Marketplace Platform • Merchant Verification Portal
      </footer>
    </div>
  );
};
