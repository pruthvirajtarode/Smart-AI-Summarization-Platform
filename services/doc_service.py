import os
from PyPDF2 import PdfReader
import docx

class DocService:
    @staticmethod
    def extract_text_from_pdf(filepath: str) -> str:
        text = ""
        try:
            with open(filepath, "rb") as f:
                reader = PdfReader(f)
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        except Exception as e:
            raise ValueError(f"Could not read PDF: {str(e)}")

        if not text.strip():
            raise ValueError(
                "This PDF appears to be a scanned image PDF with no extractable text. "
                "Please upload a text-based PDF or a DOCX/TXT file instead."
            )
        return text.strip()

    @staticmethod
    def extract_text_from_docx(filepath: str) -> str:
        try:
            doc = docx.Document(filepath)
            paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
            text = "\n".join(paragraphs)
            if not text.strip():
                raise ValueError("The DOCX file appears to be empty.")
            return text.strip()
        except Exception as e:
            raise ValueError(f"Could not read DOCX: {str(e)}")

    @staticmethod
    def extract_text_from_file(filepath: str) -> str:
        ext = os.path.splitext(filepath)[1].lower()
        if ext == ".pdf":
            return DocService.extract_text_from_pdf(filepath)
        elif ext == ".docx":
            return DocService.extract_text_from_docx(filepath)
        elif ext == ".txt":
            with open(filepath, "r", encoding="utf-8", errors="replace") as f:
                content = f.read().strip()
                if not content:
                    raise ValueError("The TXT file appears to be empty.")
                return content
        else:
            raise ValueError(f"Unsupported file type: {ext}. Please upload PDF, DOCX, or TXT.")

doc_service = DocService()
