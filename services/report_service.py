from fpdf import FPDF
import os

class ReportService:
    @staticmethod
    def generate_pdf_bytes(analysis: dict, filename: str, process_id: str) -> bytes:
        """Generate PDF report and return as bytes (no filesystem needed)."""
        pdf = FPDF()
        pdf.add_page()

        # Title
        pdf.set_font("Helvetica", "B", 22)
        pdf.cell(0, 20, "Smart Content Analysis Report", new_x="LMARGIN", new_y="NEXT", align="C")
        pdf.ln(8)

        # Metadata
        pdf.set_font("Helvetica", "", 10)
        safe_filename = str(filename)[:80].encode('latin-1', 'replace').decode('latin-1')
        pdf.cell(0, 5, f"Source: {safe_filename}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 5, f"Process ID: {process_id}", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(10)

        def safe_text(text):
            """Ensure text is encodable for PDF."""
            if isinstance(text, str):
                return text.encode('latin-1', 'replace').decode('latin-1')
            return str(text).encode('latin-1', 'replace').decode('latin-1')

        # Summary
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "1. Executive Summary", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(0, 6, safe_text(analysis.get('summary', 'N/A')))
        pdf.ln(6)

        # Key Points
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "2. Key Highlights", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 11)
        for pt in analysis.get('key_points', []):
            pdf.multi_cell(0, 6, safe_text(f"  - {pt}"))
        pdf.ln(6)

        # Topics
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "3. Topics Covered", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 11)
        topics = ", ".join(analysis.get('topics', []))
        pdf.multi_cell(0, 6, safe_text(topics))
        pdf.ln(6)

        # Sentiment
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "4. Sentiment Analysis", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(0, 6, safe_text(analysis.get('sentiment', 'N/A')))
        pdf.ln(6)

        # Actionable Insights
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "5. Actionable Insights", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 11)
        for insight in analysis.get('actionable_insights', []):
            pdf.multi_cell(0, 6, safe_text(f"  * {insight}"))

        # Return as bytes
        return pdf.output()

report_service = ReportService()
