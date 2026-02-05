import { RecapPanel } from './RecapPanel';
import { EntitiesPanel } from './EntitiesPanel';
import { LeaderProfilePanel } from './LeaderProfilePanel';
import { NotesPanel } from './NotesPanel';
import { useUIStore } from '../../store/ui-store';
import { t } from '../../services/i18n/use-i18n';
import type { Recap, Entity } from '../../types/models';

interface SidebarProps {
  recap: Recap | null;
  entities: Entity[];
  campaignId: string;
  notes: string;
  messageCount?: number;
  onSaveNotes: (notes: string) => Promise<void>;
  onEndSession: () => void;
  onUpdateRecap: () => void;
  isUpdatingRecap: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  recap,
  entities,
  campaignId,
  notes,
  messageCount = 0,
  onSaveNotes,
  onEndSession,
  onUpdateRecap,
  isUpdatingRecap,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const { activePanel, setActivePanel } = useUIStore();

  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {t('sidebar.gameInfo')}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {onClose && (
              <button
                className="retro-button sidebar-close"
                onClick={onClose}
                aria-label={t('common.close')}
                style={{ fontSize: '12px', padding: '4px 8px', minWidth: 'auto' }}
              >
                {t('common.close')}
              </button>
            )}
            <button
            className="retro-button"
            onClick={onEndSession}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              minWidth: 'auto'
            }}
          >
            {t('sidebar.endSession')}
          </button>
          </div>
        </div>
      </div>

      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activePanel === 'leader' ? 'active' : ''}`}
          onClick={() => setActivePanel('leader')}
        >
          {t('sidebar.leader')}
        </button>
        <button
          className={`sidebar-tab ${activePanel === 'recap' ? 'active' : ''}`}
          onClick={() => setActivePanel('recap')}
        >
          {t('sidebar.recap')}
        </button>
        <button
          className={`sidebar-tab ${activePanel === 'entities' ? 'active' : ''}`}
          onClick={() => setActivePanel('entities')}
        >
          {t('sidebar.entities')}
        </button>
        <button
          className={`sidebar-tab ${activePanel === 'notes' ? 'active' : ''}`}
          onClick={() => setActivePanel('notes')}
        >
          {t('sidebar.notes')}
        </button>
      </div>

      <div className="sidebar-content">
        {activePanel === 'leader' && (
          <LeaderProfilePanel campaignId={campaignId} refreshTrigger={messageCount} />
        )}
        {activePanel === 'recap' && (
          <RecapPanel
            recap={recap}
            onUpdateRecap={onUpdateRecap}
            isUpdating={isUpdatingRecap}
          />
        )}
        {activePanel === 'entities' && <EntitiesPanel entities={entities} />}
        {activePanel === 'notes' && (
          <NotesPanel
            campaignId={campaignId}
            initialNotes={notes}
            onSaveNotes={onSaveNotes}
          />
        )}
      </div>
    </div>
  );
}
