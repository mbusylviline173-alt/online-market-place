import React from 'react';
import { Ban, Store, LogOut, ArrowRight, AlertTriangle } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';

interface BannedAccountScreenProps {
  user: FirebaseUser | null;
  userProfile?: UserProfile | null;
  onLogout: () => void;
  onViewMarketplace: () => void;
}

export const BannedAccountScreen: React.FC<BannedAccountScreenProps> = ({
  user,
  userProfile,
  onLogout,
  onViewMarketplace,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white font-black text-lg">
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
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-slate-900 border border-rose-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <Ban className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs font-bold uppercase tracking-wider">
              Account Suspended
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Merchant Access Restricted
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Access to this shop owner account (<strong className="text-white">{user?.email}</strong>) has been suspended by the platform administrator.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </button>

            <button
              type="button"
              onClick={onViewMarketplace}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <span>Return to Public Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      <footer className="max-w-4xl w-full mx-auto text-center text-slate-600 text-xs py-4">
        ShopLocal Marketplace Platform
      </footer>
    </div>
  );
};
