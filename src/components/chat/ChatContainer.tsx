import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Loading } from '../common/Loading';
import { t } from '../../services/i18n/use-i18n';
import type { Message, SuggestedAction } from '../../types/models';

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  onResendMessage?: (content: string) => Promise<void>;
  onContinueNarration?: () => Promise<void>;
  isAIResponding?: boolean;
  streamedContent?: string;
  suggestedActions?: SuggestedAction[];
  onSelectAction?: (action: SuggestedAction) => void;
  disabled?: boolean;
}

export function ChatContainer({
  messages,
  onSendMessage,
  onResendMessage,
  onContinueNarration,
  isAIResponding = false,
  streamedContent = '',
  suggestedActions = [],
  onSelectAction,
  disabled = false,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const lastAIMessageIndex = messages.length > 0
    ? messages.map((m, i) => m.role === 'ai' ? i : -1).filter(i => i !== -1).pop()
    : -1;

  const lastUserMessageIndex = messages.length > 0
    ? messages.map((m, i) => m.role === 'user' ? i : -1).filter(i => i !== -1).pop()
    : -1;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedContent]);

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 && !isAIResponding && (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            color: 'var(--color-text-secondary)'
          }}>
            <div style={{ fontSize: '16px', marginBottom: '16px' }}>
              {t('chat.adventureBegins')}
            </div>
            <div style={{ fontSize: '14px' }}>
              {t('chat.firstActionPrompt')}
            </div>
          </div>
        )}

        {messages.map((message, messageIndex) => {
          const isLastAIMessage = messageIndex === lastAIMessageIndex;
          const isLastUserMessage = messageIndex === lastUserMessageIndex;
          const showActions = isLastAIMessage && suggestedActions.length > 0 && !isAIResponding && !disabled;

          return (
            <ChatMessage
              key={`msg-${message.id}`}
              message={message}
              suggestedActions={showActions ? suggestedActions : undefined}
              onSelectAction={onSelectAction}
              actionsDisabled={isAIResponding || disabled}
              onResendMessage={onResendMessage || onSendMessage}
              onContinueNarration={onContinueNarration}
              isLastUserMessage={isLastUserMessage}
              isLastAIMessage={isLastAIMessage}
            />
          );
        })}

        {isAIResponding && streamedContent && (
          <div className="chat-message ai">
            <div style={{ marginBottom: '4px', fontSize: '12px', opacity: 0.7 }}>
              {t('chat.narratorTyping')}
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {streamedContent}
              <span className="blink">▮</span>
            </div>
          </div>
        )}

        {isAIResponding && !streamedContent && (
          <div style={{ padding: '16px' }}>
            <Loading message={t('chat.narratorThinking')} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={onSendMessage}
        disabled={isAIResponding || disabled}
      />
    </div>
  );
}
