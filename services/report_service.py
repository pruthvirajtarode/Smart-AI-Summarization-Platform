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

            # --- HEADER ---
            pdf.set_fill_color(99, 102, 241) # Indigo-500
            pdf.rect(0, 0, 210, 40, "F")
            
            pdf.set_text_color(255, 255, 255)
            pdf.set_font("Helvetica", "B", 24)
            pdf.ln(10)
            pdf.cell(0, 10, "Content Analysis Report", align="C", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "", 10)
            pdf.cell(0, 8, safe(f"Source: {filename}"), align="C", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(15)

            # --- RESET COLOR ---
            pdf.set_text_color(30, 41, 59) # Slate-800
            pdf.ln(5)

            # --- OVERALL SUMMARY ---
            pdf.set_font("Helvetica", "B", 16)
            pdf.cell(0, 10, "1. EXECUTIVE SUMMARY", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "", 11)
            pdf.set_text_color(71, 85, 105) # Slate-600
            pdf.multi_cell(0, 6, safe(analysis.get('summary', 'No summary available.')))
            pdf.ln(5)

            # --- EVALUATION RUBRICS (THE "DIAGRAMS" PART) ---
            pdf.set_text_color(30, 41, 59)
            pdf.set_font("Helvetica", "B", 16)
            pdf.cell(0, 10, "2. PERFORMANCE RUBRICS", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)

            rubrics = analysis.get('evaluation_rubrics', [])
            for rubric in rubrics:
                name = safe(rubric.get("criteria", "N/A"))
                score = rubric.get("score", 0)
                justification = safe(rubric.get("justification", ""))

                # Category Title & Score
                pdf.set_font("Helvetica", "B", 11)
                pdf.set_text_color(30, 41, 59)
                pdf.cell(100, 8, name)
                pdf.set_text_color(99, 102, 241)
                pdf.cell(0, 8, f"Score: {score}/10", align="R", new_x="LMARGIN", new_y="NEXT")

                # Visual Score Bar (Simplified "Diagram")
                # Bar Background
                pdf.set_fill_color(241, 245, 249) # Gray-100
                pdf.rect(pdf.get_x(), pdf.get_y(), 190, 4, "F")
                # Progress Fill
                if score >= 8: pdf.set_fill_color(16, 185, 129) # Emerald
                elif score >= 6: pdf.set_fill_color(99, 102, 241) # Indigo
                else: pdf.set_fill_color(244, 63, 94) # Rose
                
                bar_width = (score / 10.0) * 190
                pdf.rect(pdf.get_x(), pdf.get_y(), bar_width, 4, "F")
                pdf.ln(6)

                # Justification
                pdf.set_font("Helvetica", "I", 9)
                pdf.set_text_color(100, 116, 139) # Slate-500
                pdf.multi_cell(0, 5, justification)
                pdf.ln(4)

            # --- KEY INSIGHTS ---
            pdf.add_page()
            pdf.set_text_color(30, 41, 59)
            pdf.set_font("Helvetica", "B", 16)
            pdf.cell(0, 10, "3. KEY TAKEAWAYS & INSIGHTS", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(5)

            # Insights List
            insights = analysis.get('actionable_insights', [])
            for i, ins in enumerate(insights, 1):
                pdf.set_font("Helvetica", "B", 10)
                pdf.set_text_color(99, 102, 241)
                pdf.cell(8, 8, f"{i}.")
                pdf.set_font("Helvetica", "", 10)
                pdf.set_text_color(71, 85, 105)
                pdf.multi_cell(0, 8, safe(ins))
                pdf.ln(2)

            # --- KEYWORDS & TOPICS ---
            pdf.ln(5)
            pdf.set_font("Helvetica", "B", 14)
            pdf.set_text_color(30, 41, 59)
            pdf.cell(0, 10, "4. METADATA & TOPICS", new_x="LMARGIN", new_y="NEXT")
            
            pdf.set_font("Helvetica", "B", 10)
            pdf.cell(30, 8, "Primary Topics:")
            pdf.set_font("Helvetica", "", 10)
            pdf.cell(0, 8, safe(", ".join(analysis.get('topics', []))), new_x="LMARGIN", new_y="NEXT")

            pdf.set_font("Helvetica", "B", 10)
            pdf.cell(30, 8, "Keywords:")
            pdf.set_font("Helvetica", "", 10)
            pdf.cell(0, 8, safe(", ".join(analysis.get('keywords', []))), new_x="LMARGIN", new_y="NEXT")

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
