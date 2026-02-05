import { useState, useEffect, useRef } from 'react';
import { t } from '../../services/i18n/use-i18n';

interface NotesPanelProps {
  campaignId: string;
  initialNotes: string;
  onSaveNotes: (notes: string) => Promise<void>;
}

const DEBOUNCE_MS = 500;

export function NotesPanel({ campaignId, initialNotes, onSaveNotes }: NotesPanelProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNotes(initialNotes);
  }, [campaignId, initialNotes]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await onSaveNotes(value);
      } catch (err) {
        console.error('Failed to save notes:', err);
      } finally {
        setSaving(false);
      }
    }, DEBOUNCE_MS);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      <div
        style={{
          fontSize: '12px',
          fontWeight: 'bold',
          color: 'var(--color-accent)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {t('notesPanel.title')}
        {saving && (
          <span style={{ fontSize: '10px', fontWeight: 'normal', color: 'var(--color-text-secondary)' }}>
            {t('notesPanel.saving')}
          </span>
        )}
      </div>
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder={t('notesPanel.placeholder')}
        className="notes-textarea"
        style={{
          flex: 1,
          minHeight: '120px',
          padding: '12px',
          fontSize: '14px',
          lineHeight: '1.6',
          resize: 'vertical',
          backgroundColor: 'var(--color-bg-secondary)',
          border: '2px solid var(--color-border)',
          color: 'var(--color-text-primary)',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}
