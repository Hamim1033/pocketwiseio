import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Delete } from 'lucide-react';
import logo from '@/assets/logo.png';

type Props = {
  onUnlock: (pin: string) => boolean;
};

const PinLockScreen = ({ onUnlock }: Props) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + d;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      setTimeout(() => {
        const success = onUnlock(newPin);
        if (!success) {
          setError(true);
          setShake(true);
          setTimeout(() => { setShake(false); setPin(''); }, 500);
        }
      }, 100);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center w-full max-w-xs"
      >
        <img src={logo} alt="SpendWise" className="h-12 w-auto mb-6 dark:brightness-110" />
        <Lock className="w-8 h-8 text-primary mb-3" />
        <h2 className="text-lg font-bold text-foreground mb-1">App Locked</h2>
        <p className="text-xs text-muted-foreground mb-8">Enter your 4-digit PIN to continue</p>

        {/* PIN dots */}
        <motion.div
          animate={shake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-4 mb-8"
        >
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                i < pin.length
                  ? error ? 'bg-destructive scale-110' : 'bg-primary scale-110'
                  : 'bg-muted'
              }`}
            />
          ))}
        </motion.div>

        {error && (
          <p className="text-xs text-destructive mb-4 font-medium">Incorrect PIN. Try again.</p>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map(key => (
            <button
              key={key}
              onClick={() => {
                if (key === 'del') handleDelete();
                else if (key) handleDigit(key);
              }}
              disabled={!key}
              className={`h-14 rounded-2xl text-xl font-semibold transition-all active:scale-95 ${
                key === 'del'
                  ? 'bg-secondary text-muted-foreground flex items-center justify-center'
                  : key
                    ? 'bg-secondary text-foreground hover:bg-secondary/80'
                    : 'bg-transparent'
              }`}
            >
              {key === 'del' ? <Delete className="w-5 h-5" /> : key}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PinLockScreen;
