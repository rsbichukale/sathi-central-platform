import React, { useState } from 'react';

export default function TallySimulator() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);

  const startSimulation = () => {
    setRunning(true);
    setStep(1);

    setTimeout(() => setStep(2), 1200);
    setTimeout(() => setStep(3), 2400);
    setTimeout(() => setStep(4), 3600);
  };

  return (
    <div className="glass-card" style={{ maxWidth: '850px', margin: '0 auto 80px auto', border: '1px solid rgba(5, 150, 105, 0.4)', background: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
            ⚡ Interactive Live Demonstration
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Tally Sales Voucher Extraction & Seed Filter</h3>
        </div>
        <button onClick={startSimulation} disabled={running && step < 4} className="btn-primary" style={{ height: '42px' }}>
          {running && step < 4 ? '🔄 Simulating Sync...' : '▶️ Run Tally Sync Demo'}
        </button>
      </div>

      {/* Simulator Terminal / Steps Visualizer */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', fontFamily: 'monospace', fontSize: '14px' }}>
        {step === 0 && (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
            Click <strong>"Run Tally Sync Demo"</strong> above to test voucher extraction & item filtering.
          </div>
        )}

        {step >= 1 && (
          <div style={{ marginBottom: '16px', color: '#0284c7' }}>
            [1/4] 🔌 Connecting to Tally ERP 9 / Tally Prime on 127.0.0.1:9000... <span style={{ color: '#059669', fontWeight: 700 }}>[CONNECTED]</span>
          </div>
        )}

        {step >= 2 && (
          <div style={{ marginBottom: '16px', color: '#d97706' }}>
            [2/4] 📥 Extracting Sales Voucher #INV-2026-0084 (Party: RAMESH PATIL)... <span style={{ color: '#059669', fontWeight: 700 }}>[EXTRACTED]</span>
          </div>
        )}

        {step >= 3 && (
          <div style={{ marginBottom: '16px', padding: '14px', background: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
            <div style={{ color: '#475569', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>[3/4] 🔍 SEED ITEM FILTER ENGINE:</div>
            <div style={{ color: '#059669', marginBottom: '6px' }}>
              ✅ HYBRID COTTON SEED BG-II 475GM — <span style={{ fontWeight: 700 }}>MATCHED SEED ITEM</span> (Sent to SATHI Cache)
            </div>
            <div style={{ color: '#dc2626', textDecoration: 'line-through' }}>
              🚫 ORGANIC PESTICIDE SPRAY 500ML — <span style={{ fontWeight: 700, textDecoration: 'none' }}>NON-SEED ITEM</span> (Auto Filtered Out)
            </div>
          </div>
        )}

        {step >= 4 && (
          <div style={{ color: '#059669', fontWeight: 700, fontSize: '15px', background: 'rgba(5, 150, 105, 0.1)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--primary)', textAlignment: 'center' }}>
            🎉 [4/4] 100% COMPLIANT SATHI SYNC COMPLETED! (Voucher ready for Portal Submission)
          </div>
        )}
      </div>
    </div>
  );
}
