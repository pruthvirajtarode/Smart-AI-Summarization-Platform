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
        """Generate PDF report as bytes in memory with advanced visual diagrams."""
        try:
            import math
            pdf = FPDF()
            pdf.add_page()
            safe = ReportService._safe

            # --- HEADER ---
            pdf.set_fill_color(99, 102, 241) # Indigo-500
            pdf.rect(0, 0, 210, 50, "F")
            
            pdf.set_text_color(255, 255, 255)
            pdf.set_font("Helvetica", "B", 26)
            pdf.ln(12)
            pdf.cell(0, 10, "EXECUTIVE ANALYSIS REPORT", align="C", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "", 10)
            pdf.cell(0, 8, safe(f"Source: {filename}"), align="C", new_x="LMARGIN", new_y="NEXT")
            pdf.cell(0, 5, safe(f"ID: {process_id}"), align="C", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(15)

            # --- RESET COLOR ---
            pdf.set_text_color(30, 41, 59) # Slate-800
            pdf.ln(8)

            # --- VISUAL SCORECARD SECTION ---
            # Side-by-side Gauge and Radar
            pdf.set_font("Helvetica", "B", 14)
            pdf.cell(0, 10, "Performance Scorecard", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(5)

            y_start = pdf.get_y()
            rubrics = analysis.get('evaluation_rubrics', [])
            scores = [r.get('score', 0) for r in rubrics] if rubrics else [0]
            avg_score = sum(scores) / len(scores) if scores else 0

            # 1. Circular Gauge (Left)
            pdf.set_draw_color(226, 232, 240) # Slate-200
            pdf.set_line_width(2)
            # Draw Circle Background
            pdf.ellipse(25, y_start + 5, 40, 40, "D")
            # Inner Score text
            pdf.set_font("Helvetica", "B", 22)
            pdf.set_text_color(30, 41, 59)
            pdf.text(33, y_start + 28, f"{avg_score:.1f}")
            pdf.set_font("Helvetica", "B", 8)
            pdf.set_text_color(148, 163, 184) # Slate-400
            pdf.text(37, y_start + 35, "OUT OF 10")
            pdf.set_text_color(79, 70, 229) # Indigo-600
            pdf.text(30, y_start + 48, "QUALITY SCORE")

            # 2. Radar Chart (Right)
            if rubrics:
                center_x, center_y = 135, y_start + 25
                radius = 25
                num_vars = len(rubrics)
                
                # Draw Base Pentagons/Hexagons
                pdf.set_draw_color(241, 245, 249)
                pdf.set_line_width(0.2)
                for r_step in [0.2, 0.4, 0.6, 0.8, 1.0]:
                    points = []
                    for i in range(num_vars):
                        angle = (2 * math.pi / num_vars) * i - math.pi/2
                        px = center_x + (radius * r_step) * math.cos(angle)
                        py = center_y + (radius * r_step) * math.sin(angle)
                        points.append((px, py))
                    
                    for i in range(num_vars):
                        p1, p2 = points[i], points[(i+1)%num_vars]
                        pdf.line(p1[0], p1[1], p2[0], p2[1])

                # Draw Axis Lines
                pdf.set_draw_color(226, 232, 240)
                for i in range(num_vars):
                    angle = (2 * math.pi / num_vars) * i - math.pi/2
                    px = center_x + radius * math.cos(angle)
                    py = center_y + radius * math.sin(angle)
                    pdf.line(center_x, center_y, px, py)
                    
                    # Labels
                    label = safe(rubrics[i].get('criteria', '')[:12])
                    lx = center_x + (radius + 5) * math.cos(angle) - 5
                    ly = center_y + (radius + 5) * math.sin(angle)
                    pdf.set_font("Helvetica", "B", 6)
                    pdf.set_text_color(100, 116, 139)
                    pdf.text(lx, ly, label)

                # Draw Score Polygon
                pdf.set_draw_color(79, 70, 229) # Indigo
                pdf.set_fill_color(79, 70, 229)
                pdf.set_line_width(0.8)
                score_points = []
                for i in range(num_vars):
                    score_val = (rubrics[i].get('score', 0) / 10.0)
                    angle = (2 * math.pi / num_vars) * i - math.pi/2
                    px = center_x + (radius * score_val) * math.cos(angle)
                    py = center_y + (radius * score_val) * math.sin(angle)
                    score_points.append((px, py))
                
                for i in range(num_vars):
                    p1, p2 = score_points[i], score_points[(i+1)%num_vars]
                    pdf.line(p1[0], p1[1], p2[0], p2[1])

            pdf.set_y(y_start + 65)
            # --- OVERALL SUMMARY ---
            pdf.set_text_color(30, 41, 59)
            pdf.set_font("Helvetica", "B", 16)
            pdf.cell(0, 10, "1. EXECUTIVE SUMMARY", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "", 11)
            pdf.set_text_color(71, 85, 105) # Slate-600
            pdf.multi_cell(0, 6, safe(analysis.get('summary', 'No summary available.')))
            pdf.ln(5)

            # --- PERFORMANCE RUBRICS (DETAILED) ---
            pdf.set_text_color(30, 41, 59)
            pdf.set_font("Helvetica", "B", 16)
            pdf.cell(0, 10, "2. DETAILED PERFORMANCE RUBRICS", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(5)

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

                # Visual Score Bar
                pdf.set_fill_color(241, 245, 249) # Gray-100
                pdf.rect(pdf.get_x(), pdf.get_y(), 190, 4, "F")
                if score >= 8: pdf.set_fill_color(16, 185, 129) # Emerald
                elif score >= 6: pdf.set_fill_color(99, 102, 241) # Indigo
                else: pdf.set_fill_color(244, 63, 94) # Rose
                
                bar_width = (score / 10.0) * 190
                pdf.rect(pdf.get_x(), pdf.get_y(), bar_width, 4, "F")
                pdf.ln(8)

                # Justification
                pdf.set_font("Helvetica", "I", 9)
                pdf.set_text_color(100, 116, 139) # Slate-500
                pdf.multi_cell(0, 5, justification)
                pdf.ln(6)

                if pdf.get_y() > 250:
                    pdf.add_page()

            # --- KEY INSIGHTS ---
            if pdf.get_y() > 220: pdf.add_page()
            pdf.set_text_color(30, 41, 59)
            pdf.set_font("Helvetica", "B", 16)
            pdf.cell(0, 10, "3. ACTIONABLE INSIGHTS", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(5)

            for i, ins in enumerate(analysis.get('actionable_insights', []), 1):
                pdf.set_font("Helvetica", "B", 10)
                pdf.set_text_color(99, 102, 241)
                pdf.cell(8, 8, f"{i}.")
                pdf.set_font("Helvetica", "", 10)
                pdf.set_text_color(71, 85, 105)
                pdf.multi_cell(0, 8, safe(ins))
                pdf.ln(2)

            return bytes(pdf.output())
        except Exception as e:
            print(f"PDF generation error: {traceback.format_exc()}")
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Helvetica", "", 12)
            pdf.cell(0, 10, "Report generation encountered an error.", new_x="LMARGIN", new_y="NEXT")
            pdf.multi_cell(0, 5, str(e))
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
