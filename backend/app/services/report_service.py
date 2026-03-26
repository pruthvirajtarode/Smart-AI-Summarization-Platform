from fpdf import FPDF
import os
from ..core.config import settings

class ReportService:
    @staticmethod
    def generate_pdf_report(analysis: dict, filename: str, process_id: str) -> str:
        pdf = FPDF()
        pdf.add_page()
        
        # Title
        pdf.set_font("Helvetica", "B", 24)
        pdf.cell(0, 20, "Smart Content Analysis Report", ln=True, align="C")
        pdf.ln(10)
        
        # Metadata
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 5, f"Filename: {filename}", ln=True)
        pdf.cell(0, 5, f"Process ID: {process_id}", ln=True)
        pdf.ln(10)
        
        # Overview
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(0, 10, "1. Executive Summary", ln=True)
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(0, 6, analysis['summary'])
        pdf.ln(10)
        
        # Key Points
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(0, 10, "2. Key Highlights", ln=True)
        pdf.set_font("Helvetica", "", 11)
        for pt in analysis['key_points']:
            pdf.multi_cell(0, 6, f"- {pt}")
        pdf.ln(10)
        
        # Topics
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(0, 10, "3. Primary Topics", ln=True)
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(0, 6, ", ".join(analysis['topics']))
        pdf.ln(10)
        
        # Actionable Insights
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(0, 10, "4. Actionable Insights", ln=True)
        pdf.set_font("Helvetica", "", 11)
        for insight in analysis['actionable_insights']:
            pdf.multi_cell(0, 6, f"* {insight}")
            
        report_filename = f"report_{process_id}.pdf"
        report_path = os.path.join(settings.UPLOAD_DIR, report_filename)
        pdf.output(report_path)
        
        return report_path

report_service = ReportService()
