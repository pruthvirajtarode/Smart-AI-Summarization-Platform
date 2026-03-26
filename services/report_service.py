from fpdf import FPDF
import traceback

class ReportService:
    @staticmethod
    def _safe(text):
        """Make text safe for PDF encoding."""
        if not text:
            return "N/A"
        if not isinstance(text, str):
            text = str(text)
        # Replace problematic unicode chars with ASCII equivalents
        replacements = {
            '\u2018': "'", '\u2019': "'", '\u201c': '"', '\u201d': '"',
            '\u2013': '-', '\u2014': '-', '\u2026': '...', '\u2022': '-',
            '\u00a0': ' ', '\u200b': '', '\ufeff': '',
        }
        for k, v in replacements.items():
            text = text.replace(k, v)
        return text.encode('latin-1', 'replace').decode('latin-1')

    @staticmethod
    def generate_pdf_bytes(analysis: dict, filename: str, process_id: str) -> bytes:
        """Generate PDF report as bytes in memory."""
        try:
            pdf = FPDF()
            pdf.add_page()
            safe = ReportService._safe

            # Title
            pdf.set_font("Helvetica", "B", 20)
            pdf.cell(0, 15, "Content Analysis Report", new_x="LMARGIN", new_y="NEXT", align="C")
            pdf.ln(5)

            # Source info
            pdf.set_font("Helvetica", "", 9)
            pdf.cell(0, 5, safe(f"File: {filename}"), new_x="LMARGIN", new_y="NEXT")
            pdf.cell(0, 5, safe(f"ID: {process_id}"), new_x="LMARGIN", new_y="NEXT")
            pdf.ln(8)

            # Summary
            pdf.set_font("Helvetica", "B", 13)
            pdf.cell(0, 10, "Summary", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "", 10)
            pdf.multi_cell(0, 5, safe(analysis.get('summary', 'No summary available.')))
            pdf.ln(5)

            # Key Points
            points = analysis.get('key_points', [])
            if points:
                pdf.set_font("Helvetica", "B", 13)
                pdf.cell(0, 10, "Key Points", new_x="LMARGIN", new_y="NEXT")
                pdf.set_font("Helvetica", "", 10)
                for i, pt in enumerate(points, 1):
                    pdf.multi_cell(0, 5, safe(f"{i}. {pt}"))
                    pdf.ln(1)
                pdf.ln(3)

            # Topics
            topics = analysis.get('topics', [])
            if topics:
                pdf.set_font("Helvetica", "B", 13)
                pdf.cell(0, 10, "Topics", new_x="LMARGIN", new_y="NEXT")
                pdf.set_font("Helvetica", "", 10)
                pdf.multi_cell(0, 5, safe(", ".join(topics)))
                pdf.ln(5)

            # Keywords
            keywords = analysis.get('keywords', [])
            if keywords:
                pdf.set_font("Helvetica", "B", 13)
                pdf.cell(0, 10, "Keywords", new_x="LMARGIN", new_y="NEXT")
                pdf.set_font("Helvetica", "", 10)
                pdf.multi_cell(0, 5, safe(", ".join(keywords)))
                pdf.ln(5)

            # Insights
            insights = analysis.get('actionable_insights', [])
            if insights:
                pdf.set_font("Helvetica", "B", 13)
                pdf.cell(0, 10, "Actionable Insights", new_x="LMARGIN", new_y="NEXT")
                pdf.set_font("Helvetica", "", 10)
                for i, ins in enumerate(insights, 1):
                    pdf.multi_cell(0, 5, safe(f"{i}. {ins}"))
                    pdf.ln(1)

            return bytes(pdf.output())
        except Exception as e:
            print(f"PDF generation error: {traceback.format_exc()}")
            # Return a minimal fallback PDF
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Helvetica", "", 12)
            pdf.cell(0, 10, "Report generation encountered an error.", new_x="LMARGIN", new_y="NEXT")
            pdf.multi_cell(0, 5, str(e).encode('latin-1', 'replace').decode('latin-1'))
            return bytes(pdf.output())

report_service = ReportService()
