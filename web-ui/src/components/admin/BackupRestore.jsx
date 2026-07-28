import React from 'react';
import { FiDownload, FiUpload, FiDatabase } from 'react-icons/fi';

export default function BackupRestore({ 
  backupInfo, 
  handleBackupDownload, 
  handleRestoreUpload, 
  fileInputRef 
}) {
  return (
    <div className="glass-card fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiDatabase style={{ color: '#059669' }} /> Database Backup & Restore
        </h3>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Download the complete SQLite database file or restore the platform from a previous backup.</p>

      {backupInfo && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '16px', transition: 'all 0.2s ease' }} className="hover-glow">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiDownload style={{ color: '#059669' }} /> Export Database
              </h4>
              <div style={{ background: '#e2e8f0', color: '#475569', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>
                {backupInfo.dbSizeFormatted}
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
              Downloads a complete copy of <code>central_platform.sqlite</code> containing <strong>{backupInfo.totalRows}</strong> total records across <strong>{Object.keys(backupInfo.tableCounts).length}</strong> tables.
            </p>
            <button className="btn-primary" onClick={handleBackupDownload} style={{ width: '100%', justifyContent: 'center', background: '#059669', padding: '12px' }}>
              Download .db Backup
            </button>
          </div>

          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '24px', borderRadius: '16px', transition: 'all 0.2s ease' }} className="hover-glow">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#9f1239', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiUpload /> Restore Database
              </h4>
            </div>
            <p style={{ fontSize: '13px', color: '#be123c', marginBottom: '24px', lineHeight: '1.5', fontWeight: 600 }}>
              Warning: Restoring from a backup will overwrite the current live database. Unsaved transactions will be lost.
            </p>
            <input type="file" accept=".sqlite,.db" ref={fileInputRef} style={{ display: 'none' }} onChange={handleRestoreUpload} />
            <button className="btn-primary" onClick={() => fileInputRef.current.click()} style={{ width: '100%', justifyContent: 'center', background: '#be123c', padding: '12px' }}>
              Upload Backup File...
            </button>
          </div>
        </div>
      )}

      {backupInfo && (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', background: '#ffffff' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px', color: '#475569' }}>Database Record Counts</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {Object.entries(backupInfo.tableCounts).map(([table, count]) => (
              <div key={table} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{table}</span>
                <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 900 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
