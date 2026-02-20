import { useState } from 'react'
import { FileText, Camera, Mic, Activity, Users, Clock, AlertTriangle, TrendingUp, Heart, Stethoscope } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const stats = [
    { icon: '📄', label: 'Reports Analyzed', value: '24', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
    { icon: '🍛', label: 'Foods Scanned', value: '48', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { icon: '🎤', label: 'Voice Sessions', value: '15', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    { icon: '👥', label: 'Patients (Rural)', value: '8', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
]

const quickActions = [
    { icon: FileText, label: 'Scan Report', path: '/report', color: '#06b6d4' },
    { icon: Camera, label: 'Food Scanner', path: '/food', color: '#10b981' },
    { icon: Mic, label: 'Voice Doctor', path: '/voice', color: '#8b5cf6' },
    { icon: Activity, label: 'Risk Check', path: '/risk', color: '#f59e0b' },
    { icon: Users, label: 'Rural Mode', path: '/rural', color: '#ec4899' },
    { icon: Clock, label: 'Health Timeline', path: '/memory', color: '#3b82f6' },
]

const recentActivity = [
    { type: 'report', title: 'Blood Test Report Analyzed', desc: 'Risk Score: 45% (Moderate)', time: '2 hours ago', severity: 'warning' },
    { type: 'scan', title: 'Lunch Meal Scanned', desc: 'Dal Rice + Roti – 470 kcal', time: '5 hours ago', severity: '' },
    { type: 'alert', title: 'High Sugar Alert', desc: 'Fasting sugar 185 mg/dL detected', time: '1 day ago', severity: 'critical' },
    { type: 'voice', title: 'Voice Consultation', desc: 'Query about knee pain remedies', time: '1 day ago', severity: '' },
    { type: 'report', title: 'Thyroid Panel Report', desc: 'Risk Score: 22% (Low)', time: '3 days ago', severity: '' },
]

export default function Dashboard() {
    const navigate = useNavigate()

    return (
        <div>
            {/* Welcome banner */}
            <div className="glass-card glow-teal animate-in" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(139,92,246,0.08))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                            🏥 Welcome to HealthMitra Scan
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                            Your offline AI health assistant powered by AMD Ryzen AI.
                            Scan reports, analyze food, predict health risks – all without internet.
                        </p>
                    </div>
                    <div style={{ fontSize: 64, opacity: 0.3 }}>
                        <Stethoscope size={80} strokeWidth={1} />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid-4 animate-in" style={{ marginBottom: 24 }}>
                {stats.map((s, i) => (
                    <div key={i} className="glass-card stat-card">
                        <div className="stat-icon" style={{ background: s.bg }}>
                            <span style={{ fontSize: 20 }}>{s.icon}</span>
                        </div>
                        <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="page-header animate-in">
                <h2 style={{ fontSize: 18 }}>⚡ Quick Actions</h2>
            </div>
            <div className="grid-3 animate-in" style={{ marginBottom: 28 }}>
                {quickActions.map((a, i) => {
                    const Icon = a.icon
                    return (
                        <button
                            key={i}
                            className="glass-card"
                            onClick={() => navigate(a.path)}
                            style={{
                                cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border-glass)',
                                transition: 'all 0.25s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = 'translateY(-4px)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-glass)'; e.currentTarget.style.transform = 'translateY(0)' }}
                        >
                            <div style={{
                                width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: `${a.color}18`, marginBottom: 12
                            }}>
                                <Icon size={20} color={a.color} />
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 600 }}>{a.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Click to open →</div>
                        </button>
                    )
                })}
            </div>

            {/* Recent Activity */}
            <div className="glass-card animate-in">
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={18} /> Recent Activity
                </h3>
                <div className="timeline">
                    {recentActivity.map((a, i) => (
                        <div key={i} className={`timeline-item ${a.severity}`}>
                            <div className="tl-title">{a.title}</div>
                            <div className="tl-desc">{a.desc}</div>
                            <div className="tl-date">{a.time}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
