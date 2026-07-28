import React from 'react';

export default function ApiDocsView() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>SATHI API Documentation</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Developer endpoints for Tally Connector integration and external sync.</p>
      </div>

      <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '24px' }}>
          Authentication
        </h2>
        <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
          All requests from the SATHI Tally Connector must include the following headers for authorization:
        </p>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '13px' }}>
          <div><strong style={{ color: '#2563eb' }}>x-api-key:</strong> {'<YOUR_ACTIVATION_KEY>'}</div>
          <div><strong style={{ color: '#2563eb' }}>x-request-code:</strong> {'<MACHINE_REQUEST_CODE>'}</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '4px', fontWeight: 800, fontSize: '12px' }}>GET</span>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>/api/v1/auth/status</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px' }}>Check the active status of the provided license key.</p>
        
        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Response Example (Success)</h4>
        <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '13px', overflowX: 'auto' }}>
{`{
  "success": true,
  "status": "ACTIVE",
  "plan_type": "PREMIUM",
  "expires_at": "2027-01-01T00:00:00.000Z"
}`}
        </pre>
      </div>

      <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '4px', fontWeight: 800, fontSize: '12px' }}>POST</span>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>/api/v1/registry/farmers/sync</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px' }}>Synchronize farmer ledgers from Tally to the central platform.</p>
        
        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Request Body</h4>
        <pre style={{ background: '#f1f5f9', color: '#0f172a', padding: '16px', borderRadius: '8px', fontSize: '13px', overflowX: 'auto', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
{`{
  "farmers": [
    {
      "ledger_name": "Ramesh Kumar",
      "mobile_no": "9876543210",
      "village_name": "Shirpur",
      "block_name": "Shirpur",
      "district_name": "Dhule",
      "state_name": "Maharashtra",
      "pincode": "425405"
    }
  ]
}`}
        </pre>

        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Response Example</h4>
        <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '13px', overflowX: 'auto' }}>
{`{
  "success": true,
  "inserted": 1,
  "updated": 0,
  "failed": 0
}`}
        </pre>
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '4px', fontWeight: 800, fontSize: '12px' }}>POST</span>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>/api/v1/registry/dealers/sync</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px' }}>Synchronize dealer/wholesale ledgers from Tally.</p>
        
        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Request Body</h4>
        <pre style={{ background: '#f1f5f9', color: '#0f172a', padding: '16px', borderRadius: '8px', fontSize: '13px', overflowX: 'auto', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
{`{
  "dealers": [
    {
      "ledger_name": "Agri inputs Co.",
      "gstin": "27ABCDE1234F1Z5",
      "mobile_no": "9876543210",
      "city_village": "Pune",
      "district_name": "Pune",
      "state_name": "Maharashtra"
    }
  ]
}`}
        </pre>
      </div>
    </div>
  );
}
