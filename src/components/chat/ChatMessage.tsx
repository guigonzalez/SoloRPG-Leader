import { formatTime } from '../../utils/date';
import { SuggestedActions } from './SuggestedActions';
import { t } from '../../services/i18n/use-i18n';
import type { Message, SuggestedAction } from '../../types/models';

interface ChatMessageProps {
  message: Message;
  suggestedActions?: SuggestedAction[];
  onSelectAction?: (action: SuggestedAction) => void;
  actionsDisabled?: boolean;
  onResendMessage?: (content: string) => void;
  onContinueNarration?: () => void;
  isLastUserMessage?: boolean;
  isLastAIMessage?: boolean;
}

export function ChatMessage({
  message,
  suggestedActions,
  onSelectAction,
  actionsDisabled,
  onResendMessage,
  onContinueNarration,
  isLastUserMessage,
  isLastAIMessage,
}: ChatMessageProps) {
  const roleClass = message.role === 'user' ? 'user' : message.role === 'ai' ? 'ai' : 'system';

  const handleResend = () => {
    if (onResendMessage && message.role === 'user') {
      onResendMessage(message.content);
    }
  };

  const handleContinue = () => {
    if (onContinueNarration && message.role === 'ai') {
      onContinueNarration();
    }
  };

  return (
    <div className={`chat-message ${roleClass}`}>
      <div style={{
        marginBottom: '4px',
        fontSize: '12px',
        opacity: 0.7,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          {message.role === 'user' ? 'YOU' : message.role === 'ai' ? 'NARRATOR' : 'SYSTEM'} · {formatTime(message.createdAt)}
        </div>
        {message.role === 'user' && isLastUserMessage && onResendMessage && (
          <button
            onClick={handleResend}
            disabled={actionsDisabled}
            className="retro-button"
            style={{
              padding: '2px 8px',
              fontSize: '10px',
              minWidth: 'auto',
            }}
            title={t('chat.resendMessage')}
            aria-label={t('chat.resendMessage')}
          >
            {t('chat.resendMessage')}
          </button>
        )}
        {message.role === 'ai' && isLastAIMessage && onContinueNarration && (
          <button
            onClick={handleContinue}
            disabled={actionsDisabled}
            className="retro-button"
            style={{
              padding: '2px 8px',
              fontSize: '10px',
              minWidth: 'auto',
            }}
            title={t('chat.continueNarration')}
            aria-label={t('chat.continueNarration')}
          >
            {t('chat.continueNarration')}
          </button>
        )}
      </div>
      <div style={{ whiteSpace: 'pre-wrap' }}>
        {message.content}
      </div>
      {suggestedActions && suggestedActions.length > 0 && onSelectAction && (
        <SuggestedActions
          actions={suggestedActions}
          onSelectAction={onSelectAction}
          disabled={actionsDisabled}
        />
      )}
    </div>
  );
}
