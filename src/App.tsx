import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Cpu, 
  Wallet, 
  Zap, 
  ShieldAlert, 
  TrendingUp, 
  ScrollText, 
  Coins, 
  Globe, 
  ChevronRight, 
  Activity,
  Flame,
  LayoutGrid,
  Info,
  ExternalLink,
  Ghost,
  LogOut
} from 'lucide-react';
import { cn } from './lib/utils';
import { generateCultInfo, generateCultLogo, type CultInfo } from './services/geminiService';
import confetti from 'canvas-confetti';
import { AppConfig, UserSession, showConnect, authenticate, openSTXTransfer } from '@stacks/connect';
import { STACKS_MAINNET } from '@stacks/network';

const TERMINAL_MESSAGES = [
  "SCANNING INTERNET RELIGION...",
  "EXTRACTING MEMETIC POTENTIAL...",
  "ANALYZING BITCOIN ALPHA LAYER...",
  "GENERATING CULT MANIFESTO...",
  "CALIBRATING DEGEN LEVELS...",
  "DEGEN LEVEL CRITICAL: READY.",
];

export default function App() {
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [generatedCult, setGeneratedCult] = useState<CultInfo | null>(null);
  const [stxBalance, setStxBalance] = useState<string>('0.00');
  const [showTemplate, setShowTemplate] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [cultTheme, setCultTheme] = useState('');
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomLogo(reader.result as string);
        addTerminalLog("CUSTOM LOGO ASSET LOADED TO NEURAL CORE.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateLogo = async () => {
    if (!generatedCult || isGeneratingLogo) return;
    
    setIsGeneratingLogo(true);
    addTerminalLog("INITIATING AI VISUAL SYNTHESIS...");
    try {
      const logoUrl = await generateCultLogo(generatedCult.name, generatedCult.slogan);
      setCustomLogo(logoUrl);
      addTerminalLog("VISUAL IDENTITY MANIFESTED.");
    } catch (error) {
      addTerminalLog("VISUAL SYNTHESIS FAILURE: RETRY LATER.");
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const appConfig = useMemo(() => new AppConfig(['store_write', 'publish_data']), []);
  const userSession = useMemo(() => new UserSession({ appConfig }), [appConfig]);

  const [walletData, setWalletData] = useState<{
    userData: any;
    stxAddress: string;
    walletConnected: boolean;
  }>({
    userData: null,
    stxAddress: '',
    walletConnected: false
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (userSession.isUserSignedIn()) {
          const userData = userSession.loadUserData();
          const stxAddress = userData?.profile?.stxAddress?.mainnet || userData?.profile?.stxAddress?.testnet || '';
          setWalletData({
            userData,
            stxAddress,
            walletConnected: true
          });
        } else if (userSession.isSignInPending()) {
          addTerminalLog("PROCESSING AUTH_RESPONSE...");
          try {
            const userData = await userSession.handlePendingSignIn();
            const stxAddress = userData?.profile?.stxAddress?.mainnet || userData?.profile?.stxAddress?.testnet || '';
            setWalletData({
              userData,
              stxAddress,
              walletConnected: true
            });
            addTerminalLog("AUTH_CORE: SECURE_SESSION_ESTABLISHED");
          } catch (err) {
            console.error("Pending sign-in error:", err);
            addTerminalLog("ERROR: AUTH_SESSION_COLLAPSED");
          }
          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (e) {
        console.error("Auth check error:", e);
      }
    };
    checkAuth();
  }, [userSession]);

  const { userData, stxAddress, walletConnected } = walletData;

  // Fetch real STX balance with auto-refresh
  useEffect(() => {
    if (walletConnected && stxAddress) {
      // Show connection success only once per session
      if (!sessionStorage.getItem('wallet_connected_announced')) {
        addTerminalLog("WALLET CONNECTED: AUTHENTICATION SUCCESSFUL");
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.1, x: 0.9 }, // Top right near wallet
          colors: ['#ffffff', '#a855f7']
        });
        sessionStorage.setItem('wallet_connected_announced', 'true');
      }

      const getBalance = () => {
        fetch(`https://api.mainnet.hiro.so/extended/v1/address/${stxAddress}/balances`)
          .then(res => res.json())
          .then(data => {
            if (data.stx) {
              const balance = parseInt(data.stx.balance) / 1000000;
              setStxBalance(balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
            }
          })
          .catch((err) => {
            console.error("Balance fetch error:", err);
            // Don't overwrite current balance on temporary network error
          });
      };

      getBalance();
      const interval = setInterval(getBalance, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [walletConnected, stxAddress]);

  // Simulated terminal typing
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < TERMINAL_MESSAGES.length) {
        setTerminalLogs(prev => {
          const logs = Array.isArray(prev) ? prev : [];
          const nextMsg = TERMINAL_MESSAGES[index];
          return nextMsg ? [...logs, nextMsg].slice(-8) : logs;
        });
        index++;
      } else {
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Detect available wallet protocols
  useEffect(() => {
    const detectProtocols = () => {
      const protocols = [];
      if (typeof window !== 'undefined') {
        if ((window as any).StacksProvider) protocols.push("Stacks");
        if ((window as any).LeatherProvider) protocols.push("Leather");
        if ((window as any).XverseProviders || (window as any).xverse) protocols.push("Xverse");
        if ((window as any).okxwallet) protocols.push("OKX");
        
        if (protocols.length > 0) {
          addTerminalLog(`PROTOCOLS_READY: ${protocols.join(' | ')}`);
        }
      }
    };
    // Small delay to ensure providers are injected
    const timer = setTimeout(detectProtocols, 1500);
    return () => clearTimeout(timer);
  }, []);

  const connectWallet = () => {
    addTerminalLog("INITIATING AUTH_CORE_HANDSHAKE...");
    
    // authenticate is the robust direct way for wallet interaction
    try {
      authenticate({
        appDetails: {
          name: 'CultOS',
          icon: window.location.origin + '/favicon.ico',
        },
        userSession,
        onFinish: () => {
          localStorage.setItem('cultos_auth_success', 'true');
          // Give it a tiny moment to ensure user session is written to persistent storage
          setTimeout(() => window.location.reload(), 100);
        },
        onCancel: () => {
          addTerminalLog("AUTH_CORE: USER_CANCELED");
        },
      });
    } catch (error) {
      console.error("Connection error:", error);
      // Fallback to showConnect if authenticate fails
      if (typeof showConnect === 'function') {
        showConnect({
          appDetails: {
            name: 'CultOS',
            icon: window.location.origin + '/favicon.ico',
          },
          userSession,
          onFinish: () => window.location.reload(),
        });
      } else {
        addTerminalLog("ERROR: AUTH_PROTOCOL_VIOLATION");
      }
    }
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    window.location.reload();
  };

  const addTerminalLog = (msg: string) => {
    setTerminalLogs(prev => {
      const logs = Array.isArray(prev) ? prev : [];
      return [...logs, `> ${msg}`].slice(-8);
    });
  };

  const handleSubscription = async () => {
    if (!walletConnected) {
      addTerminalLog("ERROR: AUTH_REQUIRED_FOR_SUBSCRIPTION");
      connectWallet();
      return;
    }

    addTerminalLog("INITIATING PREMIUM_GENESIS_ENROLLMENT [25 STX]...");

    try {
      if (typeof openSTXTransfer !== 'function') {
        throw new Error("STX_TRANSFER_CORE_MISSING");
      }

      await openSTXTransfer({
        network: STACKS_MAINNET,
        recipient: 'SPQ189E66S20X7ATY7794HBY6743JE9YJMCKHAEF',
        amount: '25000000', // 25 STX in microSTX
        memo: 'CultOS Genesis Subscription',
        onFinish: (data: { txId: string }) => {
          const txId = data.txId;
          addTerminalLog(`SUBSCRIPTION PAID. TXID: ${txId.slice(0, 12)}...`);
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#a855f7', '#4ade80', '#ffffff']
          });
        },
        onCancel: () => {
          addTerminalLog("TRANSFER_CORE: USER_ABORTED");
        }
      });
    } catch (err) {
      addTerminalLog("ERROR: SUBSCRIPTION_BROADCAST_FAILED");
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setCustomLogo(null);
    addTerminalLog(cultTheme ? `INITIATING AI CULT SEQUENCER FOR: ${cultTheme.toUpperCase()}...` : "INITIATING AI CULT SEQUENCER...");
    try {
      const cult = await generateCultInfo(cultTheme);
      setGeneratedCult(cult);
      addTerminalLog(`NEW CULT DETECTED: ${cult.name}`);
      addTerminalLog("CULT DATA TRANSMITTED TO INTERFACE.");
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#22c55e', '#ffffff']
      });
    } catch (error) {
      addTerminalLog("AI SEQUENCER FAILURE: REBOOTING...");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLaunch = async () => {
    if (!walletConnected) {
      addTerminalLog("ERROR: WALLET NOT CONNECTED");
      connectWallet();
      return;
    }

    if (!generatedCult) return;

    setIsTransferring(true);
    addTerminalLog("INITIATING STACKS BROADCAST FEE [0.1 STX]...");

    try {
      if (typeof openSTXTransfer !== 'function') {
        throw new Error("STX_TRANSFER_CORE_MISSING");
      }

      await openSTXTransfer({
        network: STACKS_MAINNET,
        recipient: 'SPQ189E66S20X7ATY7794HBY6743JE9YJMCKHAEF', // Updated fee collection address
        amount: '100000', // 0.1 STX in microstacks
        memo: `Launch ${generatedCult.symbol}`,
        appDetails: {
          name: 'CultOS',
          icon: window.location.origin + '/favicon.ico',
        },
        onFinish: (data: any) => {
          setIsTransferring(false);
          const txId = data?.txId;
          if (typeof txId === 'string') {
            addTerminalLog(`FEE PAID. TXID: ${txId.slice(0, 12)}...`);
          } else {
            addTerminalLog("FEE PAID. TRANSACTION BROADCASTED.");
          }
          setTimeout(() => {
            if (generatedCult) {
              addTerminalLog(`CULT MANIFESTED ON MAINNET: ${generatedCult.name}`);
            }
          }, 1000);
          confetti();
        },
        onCancel: () => {
          setIsTransferring(false);
          addTerminalLog("TRANSACTION CANCELED BY USER");
        },
      });
    } catch (e) {
      setIsTransferring(false);
      addTerminalLog("TRANSACTION FAILED");
    }
  };

  const sip010Template = `;; SIP-010: Standard Trait for Fungible Tokens
(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

(define-fungible-token ${generatedCult?.symbol || 'token'})

(define-constant contract-owner tx-sender)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) (err u100))
    (ft-transfer? ${generatedCult?.symbol || 'token'} amount sender recipient)))

(define-read-only (get-name)
  (ok "${generatedCult?.name || 'Cult Token'}"))

(define-read-only (get-symbol)
  (ok "${generatedCult?.symbol || 'TKN'}"))

(define-read-only (get-decimals)
  (ok u6))`;

  return (
    <div className="h-screen w-full bg-[#050505] text-gray-300 font-sans flex flex-col overflow-hidden selection:bg-purple-500/30">
      {/* Templates Modal */}
      <AnimatePresence>
        {showTemplate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => setShowTemplate(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-purple-500/30 p-6 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-purple-400 uppercase tracking-tighter">SIP-010 Contract Blueprint</h3>
                <button onClick={() => setShowTemplate(false)} className="text-zinc-500 hover:text-white">✕</button>
              </div>
              <pre className="bg-black p-6 rounded-xl text-[10px] text-green-500 overflow-auto flex-1 font-mono leading-relaxed border border-zinc-800">
                {sip010Template}
              </pre>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(sip010Template);
                  addTerminalLog("CONTRACT COPIED TO CLIPBOARD");
                }}
                className="mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all"
              >
                COPY CODE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl"
            onClick={() => setShowAbout(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-purple-500/30 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Globe className="w-32 h-32 text-purple-500" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-purple-500" />
                About CultOS
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed font-medium">
                <p>
                  CultOS is the world's first <span className="text-purple-400">Memetic Manifestation Engine</span> built on the Bitcoin alpha layer via Stacks. 
                </p>
                <p>
                  We leverage advanced neural synthesis to bridge the gap between internet subcultures and permanent blockchain identity. Every cult generated is a unique algorithmic artifacts, ready for mainnet deployment.
                </p>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 uppercase text-[10px] tracking-widest text-zinc-500 font-bold">
                  v1.0 Genesis Phase // Neural Core: Active
                </div>
              </div>
              <button 
                onClick={() => setShowAbout(false)}
                className="mt-8 w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all uppercase tracking-widest"
              >
                Close Protocol
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclaimer Modal */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl"
            onClick={() => setShowDisclaimer(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-red-500/30 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-2xl font-black text-red-500 uppercase tracking-tighter mb-4 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6" />
                Chaos Disclaimer
              </h3>
              <div className="space-y-4 text-gray-400 text-sm leading-relaxed uppercase font-mono">
                <p className="text-white font-bold">WARNING: HIGH VOLATILITY DETECTED.</p>
                <p>
                  CultOS is an experimental art project and memetic generator. Synthesized "cults" are digital artifacts. Financial advice is not provided.
                </p>
                <p>
                  Deployment to the Stacks mainnet involves real crypto-assets (STX). Users assume 100% responsibility for all on-chain interactions and memetic fallout.
                </p>
                <p className="p-3 border border-red-500/20 rounded bg-red-500/5 text-red-400/80">
                  By using this software, you acknowledge that internet religions are highly unpredictable and may result in extreme satisfaction or absolute chaos.
                </p>
              </div>
              <button 
                onClick={() => setShowDisclaimer(false)}
                className="mt-8 w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all uppercase tracking-widest"
              >
                I Accept the Chaos
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="min-h-16 lg:h-16 border-b border-white/10 bg-black/90 lg:bg-black/40 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-[100] shrink-0 relative py-2 lg:py-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-green-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <span className="text-black font-black text-xl">Ω</span>
          </div>
          <span className="text-lg lg:text-2xl font-bold tracking-tighter text-white uppercase">Cult<span className="text-purple-500">OS</span></span>
          <span className="hidden sm:inline text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30 font-mono ml-2 uppercase">Mainnet</span>
        </div>
        
        <div className="flex items-center gap-4 lg:gap-6 relative z-[101]">
          <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <button onClick={() => setShowAbout(true)} className="hover:text-purple-400 transition-colors">About</button>
            <button onClick={() => setShowDisclaimer(true)} className="hover:text-red-400 transition-colors">Disclaimer</button>
          </div>

          {walletConnected ? (
            <div className="flex items-center gap-3 lg:gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] text-gray-500 font-mono uppercase">Balance</span>
                <span className="text-sm font-bold text-white tracking-wide">{stxBalance} STX</span>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={`https://explorer.hiro.so/address/${stxAddress}?chain=mainnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 lg:px-4 py-2 rounded-full font-bold text-xs lg:text-sm transition-colors border border-white/5"
                  title="View on Explorer"
                >
                  <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4 text-purple-400" />
                  {typeof stxAddress === 'string' && stxAddress.length > 10 ? (
                    <>{stxAddress.slice(0, 5)}...{stxAddress.slice(-4)}</>
                  ) : (
                    stxAddress ? String(stxAddress) : '0x...'
                  )}
                </a>
                <button 
                  onClick={disconnectWallet}
                  className="p-2 rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="bg-white text-black px-5 lg:px-6 py-2.5 lg:py-2 rounded-full font-bold text-xs lg:text-sm hover:bg-purple-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2 relative z-[102]"
            >
              <Wallet className="w-4 h-4" />
              Connect
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto lg:overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#1a1025_0%,#050505_100%)]">
        
        {/* Left Sidebar: Terminal & Stats */}
        <aside className="w-full lg:w-72 flex lg:flex-col gap-4 overflow-hidden shrink-0">
          {/* Terminal */}
          <div className="flex-[2] bg-black/60 border border-purple-500/30 rounded-xl p-4 font-mono text-[11px] relative overflow-hidden flex flex-col shadow-[inset_0_0_20px_rgba(168,85,247,0.1)] min-h-[150px] lg:min-h-0">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-purple-500/50 shadow-[0_0_10px_#a855f7]"></div>
            <div className="text-green-400 mb-2 font-bold tracking-tight">[SYS] INITIALIZING_CULT_ENGINE...</div>
            <div className="flex-1 space-y-1 overflow-hidden">
              <AnimatePresence mode="popLayout">
                {terminalLogs.map((log, i) => (
                  <motion.div
                    key={`${log}-${i}`}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={cn(
                      "text-purple-300 leading-tight",
                      log?.includes('CRITICAL') && "text-red-400 animate-pulse font-bold"
                    )}
                  >
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {isGenerating && (
              <div className="text-white animate-pulse mt-2 font-bold uppercase tracking-widest text-[9px]">
                {"> "}Analytic_Core_Active...
              </div>
            )}
            <div className="absolute bottom-2 left-4 text-purple-500/50">_</div>
          </div>
          
          {/* Stats Widget */}
          <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col justify-between shadow-xl">
            <div>
              <h3 className="text-[10px] text-purple-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-3 h-3" /> Global Chaos Index
              </h3>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-3xl font-black text-white tracking-tighter">88.2</span>
                <span className="text-green-400 text-xs mb-1 font-bold">+12.4%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "88.2%" }}
                  className="h-full bg-gradient-to-r from-purple-500 to-green-400"
                />
              </div>
              <div className="flex justify-between text-[9px] uppercase tracking-tighter font-bold">
                <span className="text-gray-500">Belief Score</span>
                <span className="text-white">High Intensity</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Generator & Main Card */}
        <section className="flex-1 flex flex-col gap-4 lg:overflow-hidden">
          {/* Generator Control Bar */}
          <div className="min-h-[96px] bg-gradient-to-r from-purple-900/40 to-green-900/40 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between px-6 lg:px-8 py-4 sm:py-0 shrink-0 relative overflow-hidden group shadow-lg gap-4">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Cpu className="w-16 h-16" />
            </div>
            <div className="relative z-10 flex flex-col gap-1 w-full sm:w-auto">
              <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Construct New Cult 
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 uppercase animate-pulse">Live</span>
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="relative w-full sm:w-64">
                  <input 
                    type="text"
                    value={cultTheme}
                    onChange={(e) => setCultTheme(e.target.value)}
                    placeholder="Enter Theme..."
                    className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 w-full transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Zap className={cn("w-3 h-3 text-purple-500", cultTheme ? "animate-pulse" : "opacity-30")} />
                  </div>
                </div>
                <p className="hidden md:block text-[10px] text-gray-500 italic max-w-[120px] leading-tight">AI-Generated viral layers</p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleGenerate();
              }}
              disabled={isGenerating}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-black px-10 py-3 rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all transform active:scale-95 uppercase tracking-widest italic disabled:opacity-50 disabled:cursor-not-allowed h-fit self-center relative z-30"
            >
              {isGenerating ? "Manifesting..." : "Manifest"}
            </button>
          </div>

          {/* Cult Result Area */}
          <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm group">
            {!generatedCult ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                <Ghost className="w-24 h-24 text-gray-500 animate-bounce" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white italic tracking-tighter">THE VOID AWAITS</h3>
                  <p className="text-sm max-w-xs text-gray-400">Initialize the sequencer above to pull a new internet deity from the depths of the blockchain.</p>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col h-full"
              >
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start flex-1 overflow-y-auto scrollbar-none pr-1">
                  {/* Visual Preview */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full md:w-64 aspect-square rounded-2xl bg-gradient-to-br from-zinc-900 to-black border-2 border-purple-500/30 flex items-center justify-center overflow-hidden relative shrink-0 shadow-2xl group/img cursor-pointer"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleLogoUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    
                    {customLogo ? (
                      <img src={customLogo} alt="Custom Logo" className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover/img:scale-110" referrerPolicy="no-referrer" />
                    ) : (
                      <motion.div 
                        animate={isGeneratingLogo ? { rotate: 360 } : { scale: [1, 1.1, 1] }}
                        transition={isGeneratingLogo ? { duration: 2, repeat: Infinity, ease: "linear" } : { duration: 4, repeat: Infinity }}
                        className="text-7xl md:text-8xl flex items-center justify-center filter drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                      >
                        {isGeneratingLogo ? <Activity className="w-20 h-20 text-purple-500" /> : (
                          generatedCult.riskLevel === 'ABSOLUTE CHAOS' ? '💀' : 
                          generatedCult.riskLevel === 'DEGEN' ? '🔥' : '🧿'
                        )}
                      </motion.div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateLogo();
                        }}
                        disabled={isGeneratingLogo}
                        className="text-[10px] font-black text-white uppercase tracking-widest border border-purple-500/50 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 transition-colors disabled:opacity-50"
                      >
                        {isGeneratingLogo ? "Synthesizing..." : "AI Manifest Logo"}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="text-[10px] font-black text-white uppercase tracking-widest border border-white/20 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 transition-colors"
                      >
                        Upload Asset
                      </button>
                    </div>

                    <div className="absolute bottom-0 w-full h-10 bg-black/80 flex flex-col items-center justify-center text-[9px] font-mono text-purple-400 border-t border-purple-500/20 backdrop-blur-md">
                      <span className="tracking-widest uppercase font-bold text-[8px]">[AIGEN_CORE_ACTIVE]</span>
                    </div>
                  </div>

                  {/* Core Cult Info */}
                  <div className="flex-1 space-y-6 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-purple-400 text-[10px] font-mono font-bold tracking-widest uppercase">
                          ${generatedCult.symbol}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-gray-500 text-[10px] font-mono uppercase font-bold">
                          {generatedCult.rank}
                        </span>
                      </div>
                      <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter uppercase break-words">
                        {generatedCult.name}
                      </h1>
                      <p className="text-green-400 italic text-sm mt-1 font-bold leading-relaxed">
                        "{generatedCult.slogan}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="text-[9px] uppercase text-gray-500 font-bold tracking-widest">Degen Score</div>
                        <div className="text-xl md:text-2xl font-black text-white tracking-tighter">{generatedCult.degenScore}/100</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="text-[9px] uppercase text-gray-500 font-bold tracking-widest">Risk Factor</div>
                        <div className={cn(
                          "text-xl md:text-2xl font-black tracking-tighter uppercase",
                          generatedCult.riskLevel === 'ABSOLUTE CHAOS' ? "text-red-500" :
                          generatedCult.riskLevel === 'DEGEN' ? "text-orange-400" : "text-blue-400"
                        )}>
                          {generatedCult.riskLevel}
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/40 p-5 rounded-2xl border border-white/5 space-y-4">
                      <div>
                        <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <ScrollText className="w-3 h-3" /> Manifesto Blueprint
                        </h4>
                        <p className="text-xs leading-relaxed text-gray-400 italic font-medium">
                          {generatedCult.manifesto}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <Info className="w-3 h-3" /> Neural Lore
                        </h4>
                        <p className="text-[11px] leading-relaxed text-gray-500">
                          {generatedCult.lore}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Integration */}
                <div className="mt-auto flex flex-col md:flex-row items-center justify-between border-t border-white/10 pt-4 md:pt-6 gap-4">
                  <div className="flex gap-4">
                    <div className="text-left flex flex-col">
                      <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Network Alignment</span>
                      <span className="text-sm text-white font-black italic uppercase">Validated on Bitcoin</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowTemplate(true)}
                      className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      SIP-010 TEMPLATE
                    </button>
                    <button 
                      onClick={handleLaunch}
                      disabled={isTransferring}
                      className="px-10 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(34,197,94,0.5)] transform active:scale-95 disabled:opacity-50"
                    >
                      {isTransferring ? "Broadcasting..." : "Deploy for 0.1 STX"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Right Sidebar: Leaderboard & Premium */}
        <aside className="w-full lg:w-72 flex flex-col sm:flex-row lg:flex-col gap-4 shrink-0 pb-10 lg:pb-0">
          {/* Leaderboard */}
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col overflow-hidden shadow-lg backdrop-blur-sm min-h-[300px] sm:min-h-0">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center justify-between">
              Trending Sects 
              <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20 font-mono">LIVE</span>
            </h3>
            <div className="space-y-3 overflow-auto pr-1 scrollbar-none">
              {[
                { name: 'BreadChain', symbol: 'WHEAT', change: '+420%', color: 'green' },
                { name: 'MoonChurch', symbol: 'LUNA', change: '+215%', color: 'green' },
                { name: 'PepeOracle', symbol: 'PRCL', change: '-12%', color: 'red' },
                { name: 'SatoshiCult', symbol: 'SATC', change: '+88%', color: 'green' },
                { name: 'BananaFi', symbol: 'BANA', change: '+1,240%', color: 'green' },
              ].map((cult, i) => (
                <div key={cult.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all group cursor-pointer shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400 font-mono text-[10px] font-bold">0{i+1}</span>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-white group-hover:text-purple-300 transition-colors">{cult.name}</span>
                      <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">${cult.symbol}</span>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase italic tracking-tighter drop-shadow-sm",
                    cult.color === 'green' ? "text-green-400" : "text-red-400"
                  )}>
                    {cult.change}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Upsell */}
          <div className="h-44 bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/40 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <Zap className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-base font-black text-white tracking-tighter italic uppercase">Alpha Passage</h3>
              <p className="text-[10px] text-purple-200 leading-tight mt-1 font-medium italic">Infinite AI manifestations & high-priority Stacks sequencing protocols.</p>
            </div>
            <button 
              onClick={handleSubscription}
              className="w-full bg-white hover:bg-purple-200 text-black py-2.5 rounded-xl font-black text-[10px] uppercase tracking-tighter transition-all shadow-xl active:scale-95 flex items-center justify-between px-4"
            >
              <span>Subscribe (Monthly)</span>
              <span className="bg-black/10 px-2 py-0.5 rounded">25 STX</span>
            </button>
          </div>
        </aside>
      </main>

      {/* Footer Bar (Mobile optimized) */}
      <footer className="bg-black border-t border-white/5 px-4 py-2 flex flex-col md:flex-row items-center justify-between text-[9px] font-mono text-gray-500 shrink-0 gap-2">
        <div className="md:hidden flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
          <button onClick={() => setShowAbout(true)} className="hover:text-purple-400 transition-colors">About</button>
          <button onClick={() => setShowDisclaimer(true)} className="hover:text-red-400 transition-colors">Disclaimer</button>
        </div>
        <div className="flex flex-wrap justify-center gap-4 lg:gap-6 uppercase tracking-widest font-bold">
          <span className="flex items-center gap-1.5"><ShieldAlert className="w-3 h-3 text-red-500/50" /> CONTRACT: SP2...SIP010</span>
          <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-purple-500/50" /> NETWORK: STACKS_POX_V4</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 lg:gap-6 uppercase tracking-widest font-bold">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> SYSTEM_READY</span>
          <span>CULTOS © 2026_GENESIS</span>
        </div>
      </footer>
    </div>
  );
}
