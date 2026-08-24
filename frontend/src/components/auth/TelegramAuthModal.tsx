import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Send, ShieldCheck, UserCheck, Building2 } from 'lucide-react';
import type { UserRole } from '../../types/user';

interface TelegramAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TelegramAuthModal: React.FC<TelegramAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithTelegram } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('ATTENDEE');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleTelegramAuth = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      loginWithTelegram(selectedRole);
      setIsAuthenticating(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Telegram Quick Auth">
      <div className="space-y-5 text-center">
        <div className="w-16 h-16 bg-[#0B5D4B]/10 rounded-full flex items-center justify-center mx-auto text-[#0B5D4B]">
          <Send className="w-8 h-8 -rotate-12 translate-x-0.5" />
        </div>

        <div>
          <h4 className="text-xl font-bold text-[#17211E]">Sign in to Sheba</h4>
          <p className="text-sm text-[#66736E] mt-1">
            Ethiopia&apos;s Telegram-native tech event pass and verification system.
          </p>
        </div>

        {/* Role Selector switch */}
        <div className="bg-[#F7F8F5] p-1.5 rounded-xl flex gap-2 border border-gray-200">
          <button
            type="button"
            onClick={() => setSelectedRole('ATTENDEE')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'ATTENDEE'
                ? 'bg-white text-[#0B5D4B] shadow-sm border border-gray-200'
                : 'text-[#66736E] hover:text-[#17211E]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Attendee
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('ORGANIZER')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'ORGANIZER'
                ? 'bg-[#0B5D4B] text-white shadow-sm'
                : 'text-[#66736E] hover:text-[#17211E]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Organizer
          </button>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3.5 text-left text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-950">
            <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
            Telegram Identity Protected
          </div>
          <p className="text-[#66736E]">
            No password required. Connects directly with your Telegram handle for instant QR ticket issuance.
          </p>
        </div>

        <Button
          onClick={handleTelegramAuth}
          isLoading={isAuthenticating}
          fullWidth
          size="lg"
          className="bg-[#2AABEE] hover:bg-[#229ED9] text-white border-0"
          icon={<Send className="w-5 h-5" />}
        >
          Continue with Telegram
        </Button>

        <p className="text-xs text-[#66736E]">
          By continuing, you agree to Sheba&apos;s Event Community Terms.
        </p>
      </div>
    </Modal>
  );
};
