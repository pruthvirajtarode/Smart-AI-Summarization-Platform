import os
from PyPDF2 import PdfReader
import docx
import mammoth

class DocService:
    @staticmethod
    def extract_text_from_pdf(filepath: str) -> str:
        text = ""
        with open(filepath, "rb") as f:
            reader = PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text

    @staticmethod
    def extract_text_from_docx(filepath: str) -> str:
        doc = docx.Document(filepath)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text

    @staticmethod
    def extract_text_from_file(filepath: str) -> str:
        ext = os.path.splitext(filepath)[1].lower()
        if ext == ".pdf":
            return DocService.extract_text_from_pdf(filepath)
        elif ext == ".docx":
            return DocService.extract_text_from_docx(filepath)
        elif ext == ".txt":
            with open(filepath, "r", encoding="utf-8") as f:
                return f.read()
        return ""

doc_service = DocService()
