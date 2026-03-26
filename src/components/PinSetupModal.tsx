import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Delete } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  onClose: () => void;
  onSetPin: (pin: string) => void;
};

const PinSetupModal = ({ open, onClose, onSetPin }: Props) => {
  const [step, setStep] = useState<'set' | 'confirm'>('set');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + d;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      if (step === 'set') {
        setFirstPin(newPin);
        setPin('');
        setStep('confirm');
      } else {
        if (newPin === firstPin) {
          onSetPin(newPin);
          toast.success('PIN set successfully!');
          reset();
          onClose();
        } else {
          setError(true);
          setTimeout(() => { setPin(''); setError(false); }, 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const reset = () => {
    setPin('');
    setFirstPin('');
    setStep('set');
    setError(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50" onClick={() => { reset(); onClose(); }} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <h3 className="text-lg font-bold text-foreground">
                  {step === 'set' ? 'Set PIN' : 'Confirm PIN'}
                </h3>
              </div>
              <button onClick={() => { reset(); onClose(); }} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-6 text-center">
              {step === 'set' ? 'Choose a 4-digit PIN' : 'Re-enter your PIN to confirm'}
            </p>

            <div className="flex gap-4 justify-center mb-6">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all ${
                    i < pin.length
                      ? error ? 'bg-destructive' : 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-xs text-destructive text-center mb-3">PINs don't match. Try again.</p>}

            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map(key => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'del') handleDelete();
                    else if (key) handleDigit(key);
                  }}
                  disabled={!key}
                  className={`h-12 rounded-xl text-lg font-semibold transition-all active:scale-95 ${
                    key === 'del'
                      ? 'bg-secondary text-muted-foreground flex items-center justify-center'
                      : key
                        ? 'bg-secondary text-foreground hover:bg-secondary/80'
                        : 'bg-transparent'
                  }`}
                >
                  {key === 'del' ? <Delete className="w-4 h-4" /> : key}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PinSetupModal;
