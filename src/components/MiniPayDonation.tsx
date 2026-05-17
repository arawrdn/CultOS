import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createWalletClient, custom, parseEther } from 'viem';
import { celo } from 'viem/chains';
import { Heart, X, Wallet, ChevronUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// Declare window.ethereum type for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

const DONATION_ADDRESS = '0x2A6b5204B83C7619c90c4EB6b5365AA0b7d912F7';
const DONATION_AMOUNTS = [1, 5, 10];

export function MiniPayDonation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkProvider = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        setIsMiniPay(!!window.ethereum.isMiniPay);
        
        // Auto connect if it's MiniPay
        if (window.ethereum.isMiniPay) {
          try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            // Optionally auto open the widget if detected as MiniPay
            setIsOpen(true);
          } catch (e) {
            console.error("Auto connect failed:", e);
          }
        }
      }
    };
    
    // Give injected script time to load
    setTimeout(checkProvider, 500);
  }, []);

  const handleDonate = async (amount: number | string) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    if (!window.ethereum) {
      setErrorMessage("MiniPay / Web3 Wallet not found. Open in MiniPay/Opera Mini app.");
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage('');
      
      const client = createWalletClient({
        chain: celo,
        transport: custom(window.ethereum)
      });

      const [account] = await client.requestAddresses();
      
      if (!account) {
        throw new Error("Account not found or rejected.");
      }

      // Convert to wei
      const value = parseEther(amount.toString());

      await (client as any).sendTransaction({
        account,
        to: DONATION_ADDRESS,
        value,
        chain: celo
      });

      setStatus('success');
      setCustomAmount('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error: any) {
      console.error("Donation error:", error);
      let errMsg = "Donation failed.";
      if (error?.message?.includes('User rejected') || error?.message?.includes('User canceled')) {
        errMsg = "Transaction cancelled by user.";
      } else {
        errMsg = error?.message || errMsg;
      }
      setErrorMessage(errMsg);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-zinc-900 border border-yellow-500/30 rounded-3xl p-5 w-[320px] shadow-[0_0_40px_rgba(234,179,8,0.15)] relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/40">
                  <Heart className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Support the System</h3>
                  <p className="text-[10px] text-zinc-400 font-mono">Via MiniPay (Celo)</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {status === 'loading' && (
              <div className="py-8 flex flex-col items-center justify-center text-yellow-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-xs font-mono animate-pulse">Waiting for wallet confirmation...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center text-green-400">
                <CheckCircle2 className="w-8 h-8 mb-2 drop-shadow-[0_0_10px_currentColor]" />
                <p className="text-xs font-mono font-bold">Donation Successful. Thank you!</p>
              </div>
            )}

            {status === 'error' && (
              <div className="py-6 flex flex-col items-center text-center text-red-400">
                <AlertCircle className="w-8 h-8 mb-2" />
                <p className="text-xs font-mono bg-red-950/50 p-2 rounded-lg border border-red-500/20">{errorMessage}</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-xs underline text-zinc-400 hover:text-white"
                >
                  Try Again
                </button>
              </div>
            )}

            {status === 'idle' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {DONATION_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleDonate(amt)}
                      className="bg-zinc-800 hover:bg-yellow-500 hover:text-black text-white font-bold py-2 rounded-xl border border-zinc-700 transition-all text-sm font-mono flex items-center justify-center gap-1"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <span className="text-zinc-500 font-mono text-sm">CELO</span>
                  </div>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Custom amount..."
                    className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-14 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50 font-mono text-sm transition-colors"
                  />
                </div>

                <button
                  onClick={() => handleDonate(customAmount)}
                  disabled={!customAmount || Number(customAmount) <= 0}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-black py-3 rounded-xl transition-all uppercase tracking-wider text-xs"
                >
                  Send Donation
                </button>
                
                {!isMiniPay && (
                  <p className="text-[9px] text-zinc-500 text-center leading-tight">
                    * Requires <a href="https://minipay.opera.com/" target="_blank" className="underline hover:text-yellow-400">MiniPay</a> or a Web3 wallet extension supporting the Celo network.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-yellow-500 hover:bg-yellow-400 hover:scale-110 text-black p-4 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all flex items-center justify-center z-50 relative group"
      >
        <Heart className="w-6 h-6 fill-black" />
        {isMiniPay && !isOpen && (
           <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse"></span>
        )}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-yellow-400 text-xs font-mono py-1 px-3 rounded-full border border-yellow-500/30 whitespace-nowrap pointer-events-none">
          Donate via MiniPay
        </div>
      </button>
    </div>
  );
}
