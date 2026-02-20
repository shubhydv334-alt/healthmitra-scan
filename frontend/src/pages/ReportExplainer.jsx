import { useState, useRef } from 'react'
import { Upload, FileText, AlertTriangle, CheckCircle, Languages, Activity } from 'lucide-react'

export default function ReportExplainer() {
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [language, setLanguage] = useState('en')
    const fileRef = useRef()

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)
        setError(null)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('language', language)

        try {
            const res = await fetch('/api/reports/upload', { method: 'POST', body: formData })
            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`)
            }
            const data = await res.json()
            setResult(data)
        } catch (err) {
            console.error('Report upload failed:', err)
            setError(`Upload failed: ${err.message}. Make sure the backend is running on port 8000.`)
            // Demo fallback
            setResult({
                ocr_text: `PATHOLOGY REPORT\nPatient: Ramesh Kumar\n\nHemoglobin: 9.2 g/dL [LOW]\nFasting Sugar: 185 mg/dL [HIGH]\nHbA1c: 8.5% [HIGH]\nCholesterol: 280 mg/dL [HIGH]\nCreatinine: 1.8 mg/dL [HIGH]`,
                explanation_en: "⚠️ This report shows several concerning values. Blood sugar (185 mg/dL) is significantly elevated indicating poorly controlled diabetes. HbA1c at 8.5% confirms this has been ongoing. Cholesterol at 280 mg/dL increases heart risk. Hemoglobin is low (9.2) suggesting anemia. Kidney marker (creatinine 1.8) is also above normal. Please consult your doctor immediately.",
                explanation_hi: "⚠️ इस रिपोर्ट में कई चिंताजनक मान हैं। ब्लड शुगर (185 mg/dL) बहुत अधिक है जो डायबिटीज का संकेत है। HbA1c 8.5% से पता चलता है कि पिछले 3 महीने से शुगर कंट्रोल में नहीं है। कोलेस्ट्रॉल 280 mg/dL से हृदय रोग का खतरा है। हीमोग्लोबिन कम है (9.2) जो एनीमिया दर्शाता है। कृपया तुरंत डॉक्टर से मिलें।",
                risk_score: 78,
                risk_level: "high",
                emergency: {
                    is_emergency: false,
                    alerts: [
                        { parameter: "Fasting Blood Sugar", value: 185, severity: "warning", message_en: "⚠️ Blood sugar 185 mg/dL indicates poorly controlled diabetes." },
                        { parameter: "Hemoglobin", value: 9.2, severity: "warning", message_en: "⚠️ Hemoglobin 9.2 g/dL is low. Moderate anemia detected." }
                    ],
                    severity: "warning"
                }
            })
        }
        setLoading(false)
    }

    const getRiskColor = (score) => {
        if (score >= 70) return '#ef4444'
        if (score >= 40) return '#f59e0b'
        return '#10b981'
    }

    const circumference = 2 * Math.PI * 65

    return (
        <div>
            <div className="page-header">
                <h2>📄 Medical Report Explainer</h2>
                <p>Upload a medical report (PDF/Image) to get AI-powered explanation in Hindi & English</p>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* Upload Zone */}
                <div className="glass-card animate-in">
                    <div
                        className={`upload-zone ${file ? 'has-file' : ''}`}
                        onClick={() => fileRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]) }}
                    >
                        <input ref={fileRef} type="file" hidden accept=".pdf,.png,.jpg,.jpeg" onChange={e => setFile(e.target.files[0])} />
                        {file ? (
                            <>
                                <div className="upload-icon">📄</div>
                                <h3>{file.name}</h3>
                                <p>{(file.size / 1024).toFixed(1)} KB – Click to change</p>
                            </>
                        ) : (
                            <>
                                <div className="upload-icon">📤</div>
                                <h3>Drop your medical report here</h3>
                                <p>Supports PDF, PNG, JPG – Max 10MB</p>
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <div className="tabs" style={{ flex: 1, marginBottom: 0 }}>
                            <button className={`tab ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>English</button>
                            <button className={`tab ${language === 'hi' ? 'active' : ''}`} onClick={() => setLanguage('hi')}>हिंदी</button>
                        </div>
                        <button className="btn btn-primary btn-lg" onClick={handleUpload} disabled={!file || loading}>
                            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Analyzing...</> : <><Upload size={18} /> Analyze Report</>}
                        </button>
                    </div>

                    {error && (
                        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, fontSize: 12, color: '#ef4444' }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Risk Gauge */}
                <div className="glass-card animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {result ? (
                        <>
                            <div className="risk-gauge">
                                <svg width="160" height="160" viewBox="0 0 160 160">
                                    <circle cx="80" cy="80" r="65" className="gauge-bg" />
                                    <circle
                                        cx="80" cy="80" r="65"
                                        className="gauge-fill"
                                        stroke={getRiskColor(result.risk_score)}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={circumference - (result.risk_score / 100) * circumference}
                                    />
                                </svg>
                                <div className="gauge-value">
                                    <div className="gauge-number" style={{ color: getRiskColor(result.risk_score) }}>{result.risk_score}%</div>
                                    <div className="gauge-label">Risk Score</div>
                                </div>
                            </div>
                            <div style={{
                                marginTop: 16, padding: '6px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                                background: `${getRiskColor(result.risk_score)}20`, color: getRiskColor(result.risk_score),
                                textTransform: 'uppercase', letterSpacing: 1
                            }}>
                                {result.risk_level} Risk
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Activity size={48} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.3 }} />
                            <p style={{ fontSize: 14 }}>Upload a report to see the health risk score</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            {result && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Emergency Alerts */}
                    {result.emergency?.alerts?.length > 0 && (
                        <div className="emergency-banner animate-in">
                            <h3><AlertTriangle size={18} /> Emergency Alerts ({result.emergency.alerts.length})</h3>
                            {result.emergency.alerts.map((alert, i) => (
                                <div key={i} className="emergency-item">
                                    <div className="param">{alert.parameter}: {alert.value} {alert.unit}</div>
                                    <div className="msg">{alert.message_en}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* OCR Text */}
                    <div className="glass-card animate-in">
                        <div className="result-panel" style={{ marginTop: 0 }}>
                            <h4><FileText size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Extracted Report Text (OCR)</h4>
                            <pre>{result.ocr_text}</pre>
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className="grid-2">
                        <div className="glass-card animate-in">
                            <h4 style={{ fontSize: 14, color: 'var(--accent-teal)', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Languages size={16} /> English Explanation
                            </h4>
                            <div className="explanation-text">{result.explanation_en}</div>
                        </div>
                        <div className="glass-card animate-in">
                            <h4 style={{ fontSize: 14, color: 'var(--accent-purple)', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Languages size={16} /> हिंदी में समझाइए
                            </h4>
                            <div className="explanation-text">{result.explanation_hi}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
