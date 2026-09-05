import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Send, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { Shop, Product } from '../types';

interface ContactShopModalProps {
  shop: Shop | null;
  product?: Product | null;
  quantity?: number;
  onClose: () => void;
}

export const ContactShopModal: React.FC<ContactShopModalProps> = ({
  shop,
  product,
  quantity = 1,
  onClose,
}) => {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [subject, setSubject] = useState(
    product 
      ? `Order / Reservation: ${quantity}x ${product.title}` 
      : `Question for ${shop?.name || 'Shop'}`
  );
  const [message, setMessage] = useState(
    product
      ? `Hi! I would like to reserve/order ${quantity} unit(s) of "${product.title}" (${(product.price * quantity).toLocaleString()} CFAF total). Is this ready for local pickup or neighborhood delivery?`
      : ''
  );
  const [isSent, setIsSent] = useState(false);

  if (!shop) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          id="close-contact-shop-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 pb-6 border-b border-indigo-900/50">
          <div className="flex items-center gap-2 text-yellow-300 text-xs font-black uppercase tracking-wider mb-2">
            <Store className="w-4 h-4 text-yellow-300" />
            <span>Direct Merchant Inquiry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Contact {shop.name}
          </h2>
          <p className="text-xs text-indigo-200/80 mt-1 font-normal">
            Send a direct message to the shop owner regarding inventory, custom orders, or local pickup.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSent ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3.5 shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1.5">
                Message Sent to {shop.name}
              </h3>
              <p className="text-xs text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed font-normal">
                Thank you! The shop owner has received your inquiry and will reply to <strong>{senderEmail}</strong> within their operating hours.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-200 cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {product && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 block">Item to reserve / order:</span>
                    <h4 className="font-bold text-slate-900 truncate">{product.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-slate-600 font-bold">{product.price.toLocaleString()} CFAF each</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                        Qty: {quantity}
                      </span>
                      <span className="text-indigo-600 font-extrabold text-xs ml-auto">
                        Total: {(product.price * quantity).toLocaleString()} CFAF
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="sender-name">
                    Your Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      id="sender-name"
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="sender-email">
                    Your Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      id="sender-email"
                      type="email"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="sender-subject">
                  Subject
                </label>
                <input
                  id="sender-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="sender-message">
                  Message / Question
                </label>
                <textarea
                  id="sender-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about ingredients, materials, sizing, custom orders, or reserving for local pickup..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="send-inquiry-btn"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Direct Message to Shop</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 text-center font-medium">
                Shop phone: {shop.phone} • Typical reply time: &lt; 4 hours
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

