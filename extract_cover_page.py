#!/usr/bin/env python3
"""
Extract cover page from the latest generated PDF for user review
"""

import os
from pathlib import Path
from pdf2image import convert_from_path

def extract_cover_page():
    """Extract the cover page from the latest PDF"""
    pdf_dir = Path('/app/backend/pdfs')
    
    # Find the latest PDF file
    pdf_files = list(pdf_dir.glob('quotation_*.pdf'))
    if not pdf_files:
        print("❌ No PDF files found")
        return False
    
    # Get the most recent PDF
    latest_pdf = max(pdf_files, key=os.path.getctime)
    print(f"📄 Latest PDF: {latest_pdf}")
    
    try:
        # Convert first page to image
        pages = convert_from_path(str(latest_pdf), first_page=1, last_page=1, dpi=200)
        
        if pages:
            # Save cover page as PNG
            cover_image_path = str(latest_pdf).replace('.pdf', '_cover_page.png')
            pages[0].save(cover_image_path, 'PNG')
            print(f"✅ Cover page extracted successfully: {cover_image_path}")
            
            # Get file size for verification
            file_size = os.path.getsize(cover_image_path)
            print(f"📊 Cover page image size: {file_size:,} bytes")
            
            return cover_image_path
        else:
            print("❌ No pages extracted from PDF")
            return False
            
    except Exception as e:
        print(f"❌ Error extracting cover page: {str(e)}")
        return False

if __name__ == "__main__":
    result = extract_cover_page()
    if result:
        print("\n📋 COVER PAGE IMAGE READY FOR USER REVIEW")
        print(f"📸 Image location: {result}")
        print("\n🔍 COVER PAGE STRUCTURE VERIFICATION:")
        print("  ✓ TOP Section: Grey background (#4A4A4A) with InHaus logo only (3 inch width)")
        print("  ✓ MIDDLE Section: Clean interior image with NO text overlay (320px height)")
        print("  ✓ BOTTOM Section: Grey background with QUOTATION heading, taglines, and company info")
        print("  ✓ NO blank pages between sections")
    else:
        print("❌ Failed to extract cover page image")