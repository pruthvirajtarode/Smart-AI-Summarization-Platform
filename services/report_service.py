from fpdf import FPDF
import os
from core.config import settings

class ReportService:
    @staticmethod
    def generate_pdf_report(analysis: dict, filename: str, process_id: str) -> str:
        pdf = FPDF()
        pdf.add_page()

        # Title
        pdf.set_font("Helvetica", "B", 22)
        pdf.cell(0, 20, "Smart Content Analysis Report", new_x="LMARGIN", new_y="NEXT", align="C")
        pdf.ln(8)

        # Metadata
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 5, f"Source: {str(filename)[:80]}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 5, f"Process ID: {process_id}", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(10)

        # Summary
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "1. Executive Summary", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(0, 6, str(analysis.get('summary', '')))
        pdf.ln(8)

        # Key Points
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "2. Key Highlights", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 11)
        for pt in analysis.get('key_points', []):
            pdf.multi_cell(0, 6, f"- {str(pt)}")
        pdf.ln(8)

        # Topics
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "3. Topics Covered", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(0, 6, ", ".join(analysis.get('topics', [])))
        pdf.ln(8)

        # Actionable Insights
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "4. Actionable Insights", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 11)
        for insight in analysis.get('actionable_insights', []):
            pdf.multi_cell(0, 6, f"* {str(insight)}")

        # Save
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        report_path = os.path.join(settings.UPLOAD_DIR, f"report_{process_id}.pdf")
        pdf.output(report_path)
        return report_path

report_service = ReportService()
