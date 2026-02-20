"""HealthMitra Scan – Reports Router"""
import os
import json
import logging
import traceback
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, UploadFile, File, Depends, Form, HTTPException
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
from models import MedicalReport, HealthTimeline
from services.ocr_service import extract_text_from_file
from services.llm_service import explain_report
from services.alert_service import check_emergency_from_text
from config import UPLOAD_DIR

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/reports", tags=["Medical Reports"])

# Thread pool for blocking OCR / LLM calls
_pool = ThreadPoolExecutor(max_workers=2)


@router.post("/upload")
async def upload_report(
    file: UploadFile = File(...),
    patient_id: int = Form(None),
    language: str = Form("en"),
):
    """Upload a medical report (PDF/image), extract text via OCR, and explain it."""
    try:
        # Save uploaded file
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        loop = asyncio.get_event_loop()

        # OCR extraction (blocking → run in thread)
        ocr_result = await loop.run_in_executor(_pool, extract_text_from_file, file_path)
        logger.info(f"OCR done: {len(ocr_result.get('ocr_text', ''))} chars, risk={ocr_result.get('risk_level')}")

        # LLM explanation in both languages (blocking → run in thread)
        explanation_en = await loop.run_in_executor(
            _pool, explain_report, ocr_result["ocr_text"], ocr_result["risk_level"], "en"
        )
        explanation_hi = await loop.run_in_executor(
            _pool, explain_report, ocr_result["ocr_text"], ocr_result["risk_level"], "hi"
        )

        # Emergency check
        emergency = await loop.run_in_executor(
            _pool, check_emergency_from_text, ocr_result["ocr_text"]
        )

        # Save to database — use a FRESH session after the long blocking calls
        db = SessionLocal()
        try:
            report = MedicalReport(
                patient_id=patient_id,
                filename=file.filename,
                ocr_text=ocr_result["ocr_text"],
                explanation_en=explanation_en,
                explanation_hi=explanation_hi,
                risk_score=ocr_result["risk_score"],
                risk_level=ocr_result["risk_level"],
                critical_alerts=json.dumps(emergency["alerts"]) if emergency["alerts"] else None
            )
            db.add(report)
            db.commit()
            db.refresh(report)

            # Add to health timeline
            timeline_entry = HealthTimeline(
                patient_id=patient_id,
                event_type="report",
                title=f"Medical Report: {file.filename}",
                description=f"Risk Score: {ocr_result['risk_score']}% ({ocr_result['risk_level']})",
                risk_score=ocr_result["risk_score"],
                data_json=json.dumps({"report_id": report.id})
            )
            db.add(timeline_entry)
            db.commit()

            report_id = report.id
        finally:
            db.close()

        return {
            "id": report_id,
            "filename": file.filename,
            "ocr_text": ocr_result["ocr_text"],
            "explanation_en": explanation_en,
            "explanation_hi": explanation_hi,
            "risk_score": ocr_result["risk_score"],
            "risk_level": ocr_result["risk_level"],
            "emergency": emergency,
            "ocr_confidence": ocr_result["confidence"]
        }

    except Exception as e:
        logger.error(f"Report upload failed: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Report processing failed: {str(e)}")


@router.get("/history")
def get_report_history(patient_id: int = None, db: Session = Depends(get_db)):
    """Get report history, optionally filtered by patient."""
    query = db.query(MedicalReport)
    if patient_id:
        query = query.filter(MedicalReport.patient_id == patient_id)
    reports = query.order_by(MedicalReport.created_at.desc()).limit(50).all()

    return [{
        "id": r.id,
        "filename": r.filename,
        "risk_score": r.risk_score,
        "risk_level": r.risk_level,
        "created_at": r.created_at.isoformat() if r.created_at else None
    } for r in reports]


@router.get("/{report_id}")
def get_report(report_id: int, db: Session = Depends(get_db)):
    """Get a specific report by ID."""
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        return {"error": "Report not found"}

    return {
        "id": report.id,
        "filename": report.filename,
        "ocr_text": report.ocr_text,
        "explanation_en": report.explanation_en,
        "explanation_hi": report.explanation_hi,
        "risk_score": report.risk_score,
        "risk_level": report.risk_level,
        "critical_alerts": json.loads(report.critical_alerts) if report.critical_alerts else [],
        "created_at": report.created_at.isoformat() if report.created_at else None
    }
