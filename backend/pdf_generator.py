from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.pdfgen import canvas
from datetime import datetime, timedelta
from pathlib import Path
import os
import logging

# Try to import PIL, but don't fail if it's not available
try:
    from PIL import Image as PILImage
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logging.warning("PIL/Pillow not available, logo aspect ratio may not be preserved")

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.page_width, self.page_height = A4
        
        # Professional Blue-Grey Color Palette - Consistent Design
        self.primary_color = colors.HexColor('#D3DDF0')  # Light blue-grey (header)
        self.primary_dark = colors.black  # Pure black for borders
        self.accent_color = colors.HexColor('#D3DDF0')  # Same light blue-grey (consistent)
        self.secondary_color = colors.HexColor('#333333')  # Dark grey text
        
        # Header colors - consistent light blue-grey
        self.header_bg = colors.HexColor('#D3DDF0')  # Light blue-grey for headers
        self.header_text = colors.HexColor('#333333')  # Dark grey text on light bg
        
        # Row colors - pure white for consistency
        self.row_light = colors.white  # Pure white (no grey tint)
        self.row_alt = colors.HexColor('#F8FAFB')  # Very subtle light blue tint
        
        # Border colors - BOLD BLACK
        self.table_border = colors.black  # Pure black for ALL borders
        self.border_color = colors.black  # Pure black inner borders
        self.thick_border = colors.black  # Pure black thick borders
        
        # Text colors
        self.text_color = colors.HexColor('#333333')  # Dark grey
        self.light_text = colors.HexColor('#666666')  # Medium grey
        
        # Other colors - consistent light blue-grey
        self.light_gray = colors.HexColor('#D3DDF0')  # Same as header
        self.medium_gray = colors.HexColor('#D3DDF0')  # Same as header
        self.success_color = colors.HexColor('#86EFAC')  # Light green
        self.highlight_color = colors.HexColor('#D3DDF0')  # Same light blue-grey
        self.total_bg = colors.HexColor('#D3DDF0')  # Same light blue-grey for totals
        self.total_text = colors.HexColor('#333333')  # Dark grey for total text
        
        # Custom styles with premium fonts and spacing
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=30,
            textColor=self.secondary_color,
            spaceAfter=20,
            spaceBefore=10,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            leading=36
        )
        
        self.heading_style = ParagraphStyle(
            'CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=self.primary_color,
            spaceAfter=15,
            spaceBefore=20,
            fontName='Helvetica-Bold',
            leading=20,
            borderColor=self.primary_color,
            borderWidth=0,
            borderPadding=5
        )
        
        self.normal_style = ParagraphStyle(
            'CustomNormal',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.text_color,
            leading=14,
            fontName='Helvetica'
        )
        
        self.small_style = ParagraphStyle(
            'CustomSmall',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=self.light_text,
            leading=12,
            fontName='Helvetica'
        )
        
        self.bold_style = ParagraphStyle(
            'CustomBold',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.secondary_color,
            fontName='Helvetica-Bold'
        )
    
    def _add_premium_background(self, canvas, doc):
        """Add sophisticated premium background with modern UI/UX design"""
        canvas.saveState()
        
        page_width, page_height = A4
        
        # ========== LAYER 1: PREMIUM GRADIENT OVERLAY ==========
        # Sophisticated multi-color gradient (blue to soft gold)
        canvas.setFillAlpha(0.02)  # Slightly more visible
        num_gradient_steps = 60
        for i in range(num_gradient_steps):
            y = page_height - (i * page_height / num_gradient_steps)
            height = page_height / num_gradient_steps
            
            # Gradient from cool blue-grey at top to warm gold tint at bottom
            progress = i / num_gradient_steps
            red = 0.85 + (0.1 * progress)  # Increases towards bottom
            green = 0.88 + (0.05 * progress)
            blue = 0.95 - (0.15 * progress)  # Decreases towards bottom
            
            canvas.setFillColorRGB(red, green, blue)
            canvas.rect(0, y, page_width, -height, fill=1, stroke=0)
        
        # ========== LAYER 2: MODERN HEXAGON PATTERN (IoT Connected Home) ==========
        canvas.setStrokeAlpha(0.02)
        canvas.setStrokeColorRGB(0.3, 0.5, 0.7)
        canvas.setLineWidth(1)
        
        # Create hexagon honeycomb pattern
        hex_size = 40
        for row in range(-2, int(page_height / hex_size) + 2):
            for col in range(-2, int(page_width / hex_size) + 2):
                x = col * hex_size * 1.5
                y = row * hex_size * 0.866  # sqrt(3)/2
                if col % 2:
                    y += hex_size * 0.433
                
                # Draw hexagon
                path = canvas.beginPath()
                for i in range(6):
                    angle = 60 * i
                    import math
                    px = x + hex_size * 0.5 * math.cos(math.radians(angle))
                    py = y + hex_size * 0.5 * math.sin(math.radians(angle))
                    if i == 0:
                        path.moveTo(px, py)
                    else:
                        path.lineTo(px, py)
                path.close()
                canvas.drawPath(path, fill=0, stroke=1)
        
        # ========== LAYER 3: FLOWING CONNECTION LINES (Data Flow) ==========
        canvas.setStrokeAlpha(0.03)
        canvas.setLineWidth(1.5)
        
        # Diagonal flowing lines from top-left to bottom-right
        for i in range(5):
            x_start = -100 + (i * 150)
            y_start = page_height + 100
            x_end = page_width + 100
            y_end = -100 + (i * 150)
            
            canvas.setStrokeColorRGB(0.2, 0.4, 0.8)
            canvas.line(x_start, y_start, x_end, y_end)
        
        # ========== LAYER 4: PARTICLE EFFECT (IoT Network Nodes) ==========
        canvas.setFillAlpha(0.04)
        import random
        random.seed(42)  # Consistent pattern
        
        for _ in range(80):
            x = random.uniform(40, page_width - 40)
            y = random.uniform(40, page_height - 40)
            size = random.uniform(1, 3)
            
            # Vary colors - blues and greys
            if random.random() > 0.5:
                canvas.setFillColorRGB(0.2, 0.4, 0.8)  # Blue
            else:
                canvas.setFillColorRGB(0.4, 0.4, 0.5)  # Grey
            
            canvas.circle(x, y, size, fill=1, stroke=0)
        
        # ========== LAYER 5: PREMIUM CORNER FRAMES WITH METALLIC EFFECT ==========
        # Double-line corners for luxury feel
        canvas.setStrokeAlpha(0.08)
        canvas.setLineWidth(3)
        canvas.setStrokeColorRGB(0.15, 0.35, 0.7)  # Deeper blue
        
        corner_size = 70
        offset = 5  # For double line effect
        
        # Top-left corner - outer lines
        canvas.line(25, page_height - 25, 25 + corner_size, page_height - 25)
        canvas.line(25, page_height - 25, 25, page_height - 25 - corner_size)
        # Inner lines for depth
        canvas.setLineWidth(1.5)
        canvas.setStrokeAlpha(0.05)
        canvas.line(25 + offset, page_height - 25 - offset, 25 + corner_size - offset, page_height - 25 - offset)
        canvas.line(25 + offset, page_height - 25 - offset, 25 + offset, page_height - 25 - corner_size + offset)
        
        # Top-right corner
        canvas.setLineWidth(3)
        canvas.setStrokeAlpha(0.08)
        canvas.line(page_width - 25, page_height - 25, page_width - 25 - corner_size, page_height - 25)
        canvas.line(page_width - 25, page_height - 25, page_width - 25, page_height - 25 - corner_size)
        canvas.setLineWidth(1.5)
        canvas.setStrokeAlpha(0.05)
        canvas.line(page_width - 25 - offset, page_height - 25 - offset, page_width - 25 - corner_size + offset, page_height - 25 - offset)
        canvas.line(page_width - 25 - offset, page_height - 25 - offset, page_width - 25 - offset, page_height - 25 - corner_size + offset)
        
        # Bottom-left corner
        canvas.setLineWidth(3)
        canvas.setStrokeAlpha(0.08)
        canvas.line(25, 25, 25 + corner_size, 25)
        canvas.line(25, 25, 25, 25 + corner_size)
        canvas.setLineWidth(1.5)
        canvas.setStrokeAlpha(0.05)
        canvas.line(25 + offset, 25 + offset, 25 + corner_size - offset, 25 + offset)
        canvas.line(25 + offset, 25 + offset, 25 + offset, 25 + corner_size - offset)
        
        # Bottom-right corner
        canvas.setLineWidth(3)
        canvas.setStrokeAlpha(0.08)
        canvas.line(page_width - 25, 25, page_width - 25 - corner_size, 25)
        canvas.line(page_width - 25, 25, page_width - 25, 25 + corner_size)
        canvas.setLineWidth(1.5)
        canvas.setStrokeAlpha(0.05)
        canvas.line(page_width - 25 - offset, 25 + offset, page_width - 25 - corner_size + offset, 25 + offset)
        canvas.line(page_width - 25 - offset, 25 + offset, page_width - 25 - offset, 25 + corner_size - offset)
        
        # ========== LAYER 6: SMART DEVICE ICONS ==========
        canvas.setFillAlpha(0.03)
        canvas.setStrokeAlpha(0.03)
        
        # Light bulb icon (top-left, small)
        bulb_x, bulb_y = 80, page_height - 100
        canvas.setFillColorRGB(0.9, 0.7, 0.2)
        canvas.circle(bulb_x, bulb_y, 8, fill=1, stroke=0)
        canvas.rect(bulb_x - 3, bulb_y - 15, 6, 10, fill=1, stroke=0)
        
        # Thermostat icon (bottom-left)
        therm_x, therm_y = 100, 100
        canvas.setFillColorRGB(0.8, 0.3, 0.3)
        canvas.circle(therm_x, therm_y, 10, fill=1, stroke=0)
        canvas.circle(therm_x, therm_y, 5, fill=1, stroke=0)
        
        # Camera icon (top-right)
        cam_x, cam_y = page_width - 100, page_height - 100
        canvas.setFillColorRGB(0.3, 0.3, 0.3)
        canvas.rect(cam_x - 10, cam_y - 6, 20, 12, fill=1, stroke=0)
        canvas.circle(cam_x, cam_y, 5, fill=0, stroke=1)
        
        # Speaker icon (bottom-right)
        speak_x, speak_y = page_width - 100, 100
        canvas.setFillColorRGB(0.2, 0.6, 0.4)
        canvas.rect(speak_x - 8, speak_y - 10, 16, 20, fill=1, stroke=0)
        canvas.circle(speak_x, speak_y + 3, 4, fill=0, stroke=1)
        canvas.circle(speak_x, speak_y - 3, 4, fill=0, stroke=1)
        
        # ========== LAYER 7: CENTER LOGO WATERMARK ==========
        logo_path = Path('/app/frontend/public/inhaus/fulllogo_transparent_nobuffer.png')
        if logo_path.exists():
            try:
                canvas.setFillAlpha(0.06)
                canvas.setStrokeAlpha(0.06)
                
                watermark_width = 5 * inch
                watermark_height = 1.8 * inch
                
                x = (page_width - watermark_width) / 2
                y = (page_height - watermark_height) / 2
                
                canvas.drawImage(
                    str(logo_path),
                    x, y,
                    width=watermark_width,
                    height=watermark_height,
                    preserveAspectRatio=True,
                    mask='auto'
                )
            except Exception as e:
                logging.error(f"Failed to add watermark: {str(e)}")
        
        # ========== LAYER 8: WIFI SIGNAL WAVES (Main Feature) ==========
        canvas.setStrokeAlpha(0.05)
        canvas.setLineWidth(3)
        canvas.setStrokeColorRGB(0.2, 0.5, 0.9)
        
        # WiFi emanating from top-center
        wifi_center_x = page_width / 2
        wifi_center_y = page_height - 50
        
        for i in range(5):
            radius = 80 + (i * 35)
            canvas.circle(wifi_center_x, wifi_center_y, radius, stroke=1, fill=0)
        
        # WiFi dot at center
        canvas.setFillAlpha(0.08)
        canvas.setFillColorRGB(0.2, 0.5, 0.9)
        canvas.circle(wifi_center_x, wifi_center_y, 5, fill=1, stroke=0)
        
        canvas.restoreState()
    
    def _add_cover_page_background(self, canvas, doc):
        """Add modern smart home interior background to cover page only"""
        canvas.saveState()
        
        page_width, page_height = A4
        
        # Define light grey color for top and bottom sections
        light_grey_color = colors.HexColor('#E8E8E8')  # Light grey for better aesthetics
        
        # Add background image in the MIDDLE section only (clean, no overlay)
        bg_image_url = 'https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3'
        bg_image_path = Path('/tmp/cover_background.jpg')
        
        try:
            # Download image if not already cached
            if not bg_image_path.exists():
                import urllib.request
                urllib.request.urlretrieve(bg_image_url, str(bg_image_path))
            
            # Calculate dimensions for three sections - symmetric
            top_section_height = 120  # Light grey section for logo (smaller)
            bottom_section_height = 280  # Light grey section for text
            image_section_height = page_height - top_section_height - bottom_section_height
            
            # Draw TOP light grey section (for logo)
            canvas.setFillColor(light_grey_color)
            canvas.rect(0, page_height - top_section_height, page_width, top_section_height, fill=1, stroke=0)
            
            # Draw the interior image in MIDDLE section (clean, no text)
            canvas.drawImage(
                str(bg_image_path),
                0, bottom_section_height,
                width=page_width,
                height=image_section_height,
                preserveAspectRatio=True,
                anchor='c'
            )
            
            # Draw BOTTOM light grey section (for text)
            canvas.setFillColor(light_grey_color)
            canvas.rect(0, 0, page_width, bottom_section_height, fill=1, stroke=0)
            
        except Exception as e:
            logging.error(f"Failed to load cover background image: {str(e)}")
            # Fallback to solid light grey background
            canvas.setFillColor(light_grey_color)
            canvas.rect(0, 0, page_width, page_height, fill=1, stroke=0)
        
        canvas.restoreState()
    
    def _create_cover_page(self, quotation_data: dict, settings_data: dict):
        """Create branded cover page with clean layout: light grey top (logo), clean image middle, light grey bottom (text)"""
        elements = []
        
        # ========== TOP SECTION: New transparent logo in light grey area ==========
        elements.append(Spacer(1, 25))
        
        # Try new transparent logo first, fallback to old logo
        logo_path = Path('/app/backend/uploads/inhaus_logo_transparent.png')
        if not logo_path.exists():
            logo_path = Path('/app/frontend/public/inhaus/fulllogo_transparent_nobuffer.png')
        
        if logo_path.exists():
            try:
                if PIL_AVAILABLE:
                    pil_img = PILImage.open(str(logo_path))
                    img_width, img_height = pil_img.size
                    aspect_ratio = img_height / img_width
                    # Size to fit nicely in 120px header (with some padding)
                    desired_width = 2.5 * inch
                    calculated_height = desired_width * aspect_ratio
                    logo = Image(str(logo_path), width=desired_width, height=calculated_height, mask='auto')
                else:
                    logo = Image(str(logo_path), width=2.5*inch, height=0.55*inch)
                
                logo.hAlign = 'CENTER'
                elements.append(logo)
            except Exception as e:
                logging.error(f"Failed to load logo on cover: {str(e)}")
        
        # ========== MIDDLE SECTION: Clean interior image (no text) ==========
        # Spacer to move past the clean image area
        elements.append(Spacer(1, 320))  # Height of clean image section
        
        # ========== BOTTOM SECTION: All text in light grey area ==========
        
        # QUOTATION heading with dark color for light background
        title_style = ParagraphStyle(
            'CoverTitle',
            parent=self.styles['Heading1'],
            fontSize=42,
            textColor=colors.HexColor('#1A1A1A'),  # Dark text for light background
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            leading=50,
            spaceBefore=10,
            spaceAfter=20
        )
        
        elements.append(Paragraph("QUOTATION", title_style))
        elements.append(Spacer(1, 15))
        
        # Company tagline with dark color
        tagline_style = ParagraphStyle(
            'CoverTagline',
            parent=self.styles['Normal'],
            fontSize=13,
            textColor=colors.HexColor('#333333'),  # Dark grey for light background
            alignment=TA_CENTER,
            fontName='Helvetica',
            leading=18,
            leftIndent=50,
            rightIndent=50
        )
        
        branding_quotes = [
            "<b><i>Transform Your Space with Smart Automation</i></b>",
            "<i>Experience the future of living with intelligent home automation</i>",
            "<i>Energy efficient • Secure • Convenient • Modern</i>"
        ]
        
        for quote in branding_quotes:
            elements.append(Paragraph(quote, tagline_style))
            elements.append(Spacer(1, 10))
        
        elements.append(Spacer(1, 20))
        
        # Company info at bottom with dark color
        footer_style = ParagraphStyle(
            'CoverFooter',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#555555'),  # Medium grey for light background
            alignment=TA_CENTER,
            fontName='Helvetica',
            leading=14
        )
        
        elements.append(Paragraph(
            f"<b>{settings_data.get('company_name', 'InHaus Smart Automation')}</b><br/>"
            f"{settings_data.get('company_address', 'Shop No 207, 1st Floor, Kokapet Terminal, Gandipet, Hyderabad - 500075')}<br/>"
            f"Phone: {settings_data.get('company_phone', '+91 7416925607')} | Email: {settings_data.get('company_email', 'support@inhaus.co.in')}<br/>"
            f"Website: {settings_data.get('company_website', 'www.inhaus.co.in')}",
            footer_style
        ))
        
        return elements
    
    def _create_customer_quote_page(self, quotation_data: dict):
        """Create dedicated page with customer details and quote info only"""
        elements = []
        
        elements.append(Spacer(1, 30))
        
        # Prepared For section
        prepared_for_style = ParagraphStyle(
            'PreparedFor',
            parent=self.styles['Normal'],
            fontSize=14,
            textColor=colors.HexColor('#1A1A1A'),
            fontName='Helvetica-Bold',
            alignment=TA_LEFT,
            spaceBefore=5,
            spaceAfter=15
        )
        
        elements.append(Paragraph("<b>PREPARED FOR:</b>", prepared_for_style))
        
        # Customer details
        customer_style = ParagraphStyle(
            'CustomerDetail',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#333333'),
            alignment=TA_LEFT,
            leading=16
        )
        
        customer_info = f"<b>Name:</b> {quotation_data['customer_name']}<br/>"
        customer_info += f"<b>Email:</b> {quotation_data['customer_email']}"
        
        if quotation_data.get('customer_phone'):
            customer_info += f"<br/><b>Phone:</b> {quotation_data['customer_phone']}"
        
        elements.append(Paragraph(customer_info, customer_style))
        elements.append(Spacer(1, 30))
        
        # Quotation details table
        elements.extend(self._create_quotation_details_table(quotation_data))
        
        return elements
    
    def _create_thank_you_page(self, settings_data: dict):
        """Create professional thank you page"""
        elements = []
        
        elements.append(Spacer(1, 150))
        
        # Thank you heading
        thank_you_style = ParagraphStyle(
            'ThankYouHeading',
            parent=self.styles['Heading1'],
            fontSize=32,
            textColor=colors.HexColor('#1A1A1A'),
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            leading=38,
            spaceAfter=30
        )
        
        elements.append(Paragraph("Thank You for Choosing InHaus", thank_you_style))
        elements.append(Spacer(1, 30))
        
        # Thank you message
        message_style = ParagraphStyle(
            'ThankYouMessage',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#333333'),
            alignment=TA_CENTER,
            fontName='Helvetica',
            leading=18,
            leftIndent=80,
            rightIndent=80
        )
        
        thank_you_message = """
        We appreciate the opportunity to provide you with this quotation for transforming your space 
        with intelligent home automation solutions. At InHaus, we are committed to delivering exceptional 
        quality, innovative technology, and outstanding customer service.
        <br/><br/>
        Our team of experts is ready to bring your smart home vision to life. We look forward to working 
        with you to create a seamlessly connected, energy-efficient, and secure living environment that 
        enhances your lifestyle.
        <br/><br/>
        Should you have any questions or require further clarification, please don't hesitate to reach out. 
        We're here to help make your smart home journey smooth and enjoyable.
        <br/><br/>
        <b><i>Experience the Future of Living with InHaus</i></b>
        """
        
        elements.append(Paragraph(thank_you_message, message_style))
        elements.append(Spacer(1, 60))
        
        # Closing signature
        signature_style = ParagraphStyle(
            'Signature',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#333333'),
            alignment=TA_CENTER,
            fontName='Helvetica',
            leading=16
        )
        
        elements.append(Paragraph(
            f"<b>Warm Regards,</b><br/>"
            f"<b>Team InHaus</b><br/>"
            f"{settings_data.get('company_phone', '+91 7416925607')}<br/>"
            f"{settings_data.get('company_email', 'support@inhaus.co.in')}",
            signature_style
        ))
        
        return elements
    
    def generate_quotation_pdf(self, quotation_data: dict, settings_data: dict, output_path: str):
        """Generate a professional quotation PDF with multi-page structure"""
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=30
        )
        
        story = []
        
        # ========== PAGE 1: COVER PAGE WITH BACKGROUND ==========
        story.extend(self._create_cover_page(quotation_data, settings_data))
        story.append(PageBreak())
        
        # ========== PAGE 2+: CUSTOMER DETAILS, QUOTE INFO, PRODUCTS, SUMMARY ==========
        story.extend(self._create_customer_quote_page(quotation_data))
        story.append(Spacer(1, 30))
        
        # Products start on same page or flow to next page naturally
        
        # Group items by room/area
        items_by_room = {}
        for item in quotation_data['items']:
            room = item['room_area']
            if room not in items_by_room:
                items_by_room[room] = []
            items_by_room[room].append(item)
        
        # Create table for each room with enhanced section heading
        for room, items in items_by_room.items():
            # Room heading with orange-highlighted area name
            room_heading = Paragraph(
                f'<font size=14 color="#000000"><b>Scope of Automation - </b></font><font size=14 color="#FF6B35"><b>{room}</b></font>',
                ParagraphStyle(
                    'RoomHeading',
                    parent=self.heading_style,
                    fontSize=14,
                    textColor=self.secondary_color,
                    spaceBefore=8,
                    spaceAfter=10,
                    leftIndent=0,
                    borderColor=self.primary_color,
                    borderWidth=0,
                    borderPadding=0,
                    keepWithNext=True  # Keep heading with table
                )
            )
            story.append(room_heading)
            story.extend(self._create_items_table(items))
            story.append(Spacer(1, 18))
        
        # Summary - NO PAGE BREAK, continue flowing
        story.append(Spacer(1, 30))
        
        summary_heading_style = ParagraphStyle(
            'SummaryHeading',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#1A1A1A'),  # Very dark, almost black
            fontName='Helvetica-Bold',
            alignment=TA_LEFT,
            spaceBefore=10,
            spaceAfter=20,
            leading=22
        )
        
        story.append(Paragraph("<b>SUMMARY</b>", summary_heading_style))
        story.extend(self._create_summary_table(quotation_data, items_by_room))
        story.append(Spacer(1, 20))
        
        # Terms and conditions
        if quotation_data.get('terms_conditions'):
            story.append(Paragraph("Terms & Conditions", self.heading_style))
            story.append(Paragraph(quotation_data['terms_conditions'], self.normal_style))
            story.append(Spacer(1, 15))
        
        # Payment terms
        story.append(Paragraph(f"<b>Payment Terms:</b> {quotation_data['payment_terms']}", self.normal_style))
        story.append(Paragraph(f"<b>Validity:</b> {quotation_data['validity_days']} days from quote date", self.normal_style))
        story.append(Spacer(1, 20))
        
        # ========== LAST PAGE: THANK YOU NOTE ==========
        story.append(PageBreak())
        story.extend(self._create_thank_you_page(settings_data))
        
        # Build PDF with different backgrounds for cover vs other pages
        def add_page_backgrounds(canvas, doc):
            if doc.page == 1:
                # Cover page gets the interior background
                self._add_cover_page_background(canvas, doc)
            else:
                # Other pages get the premium pattern background
                self._add_premium_background(canvas, doc)
        
        doc.build(story, onFirstPage=add_page_backgrounds, onLaterPages=add_page_backgrounds)
        return output_path
    
    def generate_invoice_pdf(self, invoice_data: dict, settings_data: dict, output_path: str):
        """Generate a professional invoice PDF"""
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=30
        )
        
        story = []
        
        # Header with logo and company info
        story.extend(self._create_header(settings_data))
        story.append(Spacer(1, 20))
        
        # Title
        story.append(Paragraph("INVOICE", self.title_style))
        story.append(Spacer(1, 10))
        
        # Invoice details and customer info
        story.extend(self._create_invoice_info(invoice_data, settings_data))
        story.append(Spacer(1, 20))
        
        # Group items by room/area
        items_by_room = {}
        for item in invoice_data['items']:
            room = item['room_area']
            if room not in items_by_room:
                items_by_room[room] = []
            items_by_room[room].append(item)
        
        # Create table for each room
        for room, items in items_by_room.items():
            story.append(Paragraph(f"{room}", self.heading_style))
            story.extend(self._create_items_table(items))
            story.append(Spacer(1, 15))
        
        # Summary
        story.append(PageBreak())
        story.append(Paragraph("INVOICE SUMMARY", self.heading_style))
        story.extend(self._create_invoice_summary_table(invoice_data, items_by_room))
        story.append(Spacer(1, 20))
        
        # Payment information
        story.append(Paragraph("Payment Information", self.heading_style))
        payment_info = [
            ['Amount Paid:', f"Rs.  {invoice_data['amount_paid']:,.2f}"],
            ['Amount Due:', f"Rs.  {invoice_data['amount_due']:,.2f}"],
            ['Payment Status:', invoice_data['payment_status'].upper()],
            ['Due Date:', invoice_data.get('due_date', 'N/A')]
        ]
        payment_table = Table(payment_info, colWidths=[3*inch, 3*inch])
        payment_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        story.append(payment_table)
        story.append(Spacer(1, 20))
        
        # Footer with company details and bank info
        story.extend(self._create_footer(settings_data, include_bank=True))
        
        # Build PDF with premium background on each page
        doc.build(story, onFirstPage=self._add_premium_background, onLaterPages=self._add_premium_background)
        return output_path
    
    def _create_header(self, settings_data: dict):
        """Create premium header with logo and company info"""
        elements = []
        
        # Add top spacing
        elements.append(Spacer(1, 15))
        
        # Try to add logo with proper aspect ratio preservation
        logo_path = Path('/app/frontend/public/inhaus/fulllogo_transparent_nobuffer.png')
        if logo_path.exists():
            try:
                # Use PIL if available for proper aspect ratio
                if PIL_AVAILABLE:
                    # Load image and get actual dimensions to preserve aspect ratio
                    pil_img = PILImage.open(str(logo_path))
                    img_width, img_height = pil_img.size
                    aspect_ratio = img_height / img_width
                    
                    # Set width and calculate proportional height
                    desired_width = 2.8 * inch
                    calculated_height = desired_width * aspect_ratio
                    
                    logo = Image(str(logo_path), width=desired_width, height=calculated_height)
                else:
                    # Fallback if PIL is not available - use fixed dimensions
                    logo = Image(str(logo_path), width=2.8*inch, height=0.9*inch)
                
                logo.hAlign = 'CENTER'
                elements.append(logo)
                elements.append(Spacer(1, 12))
            except Exception as e:
                # If logo loading fails, continue without logo
                logging.error(f"Failed to load logo: {str(e)}")
                pass
        
        # Company info in elegant style
        company_info = f"""
        <para align=center>
        <font size=11 color="#1F2937"><b>{settings_data.get('company_name', 'InHaus Smart Automation')}</b></font><br/>
        <font size=8 color="#6B7280">
        {settings_data.get('company_address', '')}<br/>
        Email: {settings_data.get('company_email', '')} | Phone: {settings_data.get('company_phone', '')}<br/>
        Website: {settings_data.get('company_website', '')}
        """
        
        if settings_data.get('company_gstin'):
            company_info += f" | GSTIN: {settings_data.get('company_gstin', '')}"
        
        company_info += """
        </font>
        </para>
        """
        elements.append(Paragraph(company_info, self.small_style))
        elements.append(Spacer(1, 8))
        
        return elements
    
    def _create_quotation_details_table(self, quotation_data: dict):
        """Create quotation details table matching reference design"""
        
        quote_date = quotation_data['created_at']
        if isinstance(quote_date, str):
            quote_date = datetime.fromisoformat(quote_date).date()
        elif isinstance(quote_date, datetime):
            quote_date = quote_date.date()
        
        valid_until = quote_date + timedelta(days=quotation_data['validity_days'])
        
        # Create 2x2 grid like reference
        data = [
            [
                Paragraph('<b>Quote No:</b>', self.normal_style),
                Paragraph(quotation_data['quote_number'], self.normal_style),
                Paragraph('<b>Date:</b>', self.normal_style),
                Paragraph(str(quote_date), self.normal_style)
            ],
            [
                Paragraph('<b>Revision No:</b>', self.normal_style),
                Paragraph(str(quotation_data.get('revision_no', 0)), self.normal_style),
                Paragraph('<b>Valid Until:</b>', self.normal_style),
                Paragraph(str(valid_until), self.normal_style)
            ]
        ]
        
        # Equal column widths
        col_width = 1.4 * inch
        table = Table(data, colWidths=[col_width, col_width, col_width, col_width])
        
        # Style matching reference image
        table.setStyle(TableStyle([
            # Light grey background for labels (columns 0 and 2)
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F5F5F5')),
            ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#F5F5F5')),
            
            # White background for values (columns 1 and 3)
            ('BACKGROUND', (1, 0), (1, -1), colors.white),
            ('BACKGROUND', (3, 0), (3, -1), colors.white),
            
            # Light grey borders
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#DDDDDD')),
            ('INNERGRID', (0, 0), (-1, -1), 1, colors.HexColor('#DDDDDD')),
            
            # Left alignment for all cells
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Padding
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            
            # Font
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
        ]))
        
        return [table]
    
    def _create_quote_info(self, quotation_data: dict, settings_data: dict):
        """Create quote information section"""
        elements = []
        
        created_date = quotation_data['created_at']
        if isinstance(created_date, str):
            created_date = datetime.fromisoformat(created_date)
        
        info_data = [
            ['Quote No:', quotation_data['quote_number'], 'Date:', created_date.strftime('%Y-%m-%d')],
            ['Revision No:', str(quotation_data.get('revision_no', 0)), 'Valid Until:', 
             (created_date + timedelta(days=quotation_data['validity_days'])).strftime('%Y-%m-%d')],
        ]
        
        info_table = Table(info_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 2*inch])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#f3f4f6')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 15))
        
        # Customer info
        customer_info = f"""
        <b>Customer Details:</b><br/>
        <b>Name:</b> {quotation_data['customer_name']}<br/>
        <b>Email:</b> {quotation_data['customer_email']}<br/>
        <b>Phone:</b> {quotation_data.get('customer_phone', 'N/A')}<br/>
        """
        
        if quotation_data.get('customer_address'):
            customer_info += f"<b>Address:</b> {quotation_data['customer_address']}<br/>"
        
        if quotation_data.get('architect_name'):
            customer_info += f"<b>Architect:</b> {quotation_data['architect_name']}<br/>"
        
        if quotation_data.get('site_location'):
            customer_info += f"<b>Site Location:</b> {quotation_data['site_location']}<br/>"
        
        elements.append(Paragraph(customer_info, self.normal_style))
        
        return elements
    
    def _create_invoice_info(self, invoice_data: dict, settings_data: dict):
        """Create invoice information section"""
        elements = []
        
        invoice_date = invoice_data['invoice_date']
        if isinstance(invoice_date, str):
            invoice_date = datetime.fromisoformat(invoice_date).date()
        
        due_date = invoice_data.get('due_date', 'N/A')
        if isinstance(due_date, str) and due_date != 'N/A':
            due_date = datetime.fromisoformat(due_date).date()
        
        info_data = [
            ['Invoice No:', invoice_data['invoice_number'], 'Invoice Date:', str(invoice_date)],
            ['Payment Status:', invoice_data['payment_status'].upper(), 'Due Date:', str(due_date)],
        ]
        
        info_table = Table(info_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 2*inch])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#f3f4f6')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 15))
        
        # Customer info
        customer_info = f"""
        <b>Bill To:</b><br/>
        <b>Name:</b> {invoice_data['customer_name']}<br/>
        <b>Email:</b> {invoice_data['customer_email']}<br/>
        <b>Phone:</b> {invoice_data.get('customer_phone', 'N/A')}<br/>
        """
        
        if invoice_data.get('billing_address'):
            customer_info += f"<b>Address:</b> {invoice_data['billing_address']}<br/>"
        
        elements.append(Paragraph(customer_info, self.normal_style))
        
        return elements
    
    def _create_items_table(self, items: list):
        """Create clean, modern, highly readable items table with product images"""
        elements = []
        
        # Premium table header styling with dark text on light background
        header_style = ParagraphStyle(
            'TableHeader',
            parent=self.styles['Normal'],
            fontSize=9,  # Reduced to fit in single line
            textColor=self.header_text,
            fontName='Helvetica-Bold',
            alignment=TA_CENTER,
            leading=11,
            spaceBefore=0,
            spaceAfter=0
        )
        
        # Create header row with clear labels
        data = [[
            Paragraph('<b>S.No</b>', header_style),
            Paragraph('<b>Image</b>', header_style),
            Paragraph('<b>Model No</b>', header_style),
            Paragraph('<b>Product Details</b>', header_style),
            Paragraph('<b>Qty</b>', header_style),
            Paragraph('<b>Unit Price</b>', header_style),
            Paragraph('<b>Total</b>', header_style)
        ]]
        
        # Content styling - professional and readable
        content_style = ParagraphStyle(
            'Content',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.text_color,
            alignment=TA_LEFT,
            leading=13,
            spaceBefore=2,
            spaceAfter=2
        )
        
        center_style = ParagraphStyle(
            'CenterContent',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.text_color,
            alignment=TA_CENTER,
            leading=13,
            fontName='Helvetica'
        )
        
        right_style = ParagraphStyle(
            'RightContent',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.text_color,
            alignment=TA_RIGHT,
            leading=13,
            fontName='Helvetica'
        )
        
        # Add items with professional blue-grey styling
        for idx, item in enumerate(items, 1):
            # Smart truncation for description
            desc = item['description']
            if len(desc) > 70:
                desc = desc[:70] + '...'
            
            # Product details - left aligned with hierarchy
            product_para = Paragraph(
                f"<font size=10 color='#333333'><b>{item['product_name']}</b></font><br/>"
                f"<font size=9 color='#666666'>{desc}</font>", 
                content_style
            )
            
            # Model number - centered
            model_para = Paragraph(
                f"<font size=10 color='#333333'>{item['model_no']}</font>",
                center_style
            )
            
            # Serial number - centered
            sno_para = Paragraph(
                f"<font size=10 color='#333333'>{str(idx)}</font>",
                center_style
            )
            
            # Quantity - right aligned
            qty_para = Paragraph(
                f"<font size=10 color='#333333'>{str(item['quantity'])}</font>",
                right_style
            )
            
            # Prices - right aligned
            price_para = Paragraph(
                f"<font size=10 color='#333333'>Rs. {item['offered_price']:,.0f}</font>",
                right_style
            )
            
            # Total amount - right aligned and bold
            amount_para = Paragraph(
                f"<font size=10 color='#333333'><b>Rs. {item['total_amount']:,.0f}</b></font>",
                right_style
            )
            
            # Handle product image with rounded corners effect
            image_cell = ''
            if item.get('image_url'):
                try:
                    # Convert URL path to file system path
                    image_url = item['image_url']
                    if image_url.startswith('/uploads/products/') or image_url.startswith('/api/uploads/products/'):
                        image_path = Path('/app/backend/uploads/products') / image_url.split('/')[-1]
                    else:
                        # If full path is provided
                        image_path = Path(image_url)
                    
                    if image_path.exists():
                        # Create image with proper sizing and aspect ratio
                        if PIL_AVAILABLE:
                            pil_img = PILImage.open(str(image_path))
                            img_width, img_height = pil_img.size
                            aspect_ratio = img_height / img_width
                            
                            # Set optimal dimensions for table cell
                            desired_width = 0.65 * inch
                            calculated_height = desired_width * aspect_ratio
                            
                            # Limit height to maintain table consistency
                            max_height = 0.65 * inch
                            if calculated_height > max_height:
                                calculated_height = max_height
                                desired_width = calculated_height / aspect_ratio
                            
                            image_cell = Image(str(image_path), width=desired_width, height=calculated_height)
                        else:
                            # Fallback without PIL
                            image_cell = Image(str(image_path), width=0.65*inch, height=0.65*inch)
                except Exception as e:
                    logging.error(f"Failed to load product image: {str(e)}")
                    image_cell = Paragraph('<font size=7 color="#999999">No Image</font>', center_style)
            else:
                image_cell = Paragraph('<font size=7 color="#999999">—</font>', center_style)
            
            # Append row with all cells properly aligned
            data.append([
                sno_para,
                image_cell,
                model_para,
                product_para,
                qty_para,
                price_para,
                amount_para
            ])
        
        # Total row styling - InHaus brand
        total_label_style = ParagraphStyle(
            'TotalLabel',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=self.total_text,
            fontName='Helvetica-Bold',
            alignment=TA_RIGHT
        )
        
        total_amount_style = ParagraphStyle(
            'TotalAmount',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=self.total_text,
            fontName='Helvetica-Bold',
            alignment=TA_RIGHT
        )
        
        total = sum(item['total_amount'] for item in items)
        total_qty = sum(item['quantity'] for item in items)
        
        data.append([
            '', 
            '',
            '', 
            Paragraph('<font size=10 color="#333333"><b>Room Total</b></font>', total_label_style), 
            Paragraph(f'<font size=10 color="#333333"><b>{total_qty}</b></font>', right_style),
            '',
            Paragraph(f'<font size=10 color="#333333"><b>Rs. {total:,.0f}</b></font>', total_amount_style)
        ])
        
        # Optimized column widths for clarity - wider spacing
        table = Table(data, colWidths=[0.4*inch, 0.75*inch, 0.95*inch, 2.45*inch, 0.5*inch, 1.05*inch, 1.15*inch])
        
        # Professional Blue-Grey Table with BOLD BLACK Borders
        style_commands = [
            # ========== HEADER - Consistent Light Blue-Grey ==========
            ('BACKGROUND', (0, 0), (-1, 0), self.header_bg),  # Light blue-grey #D3DDF0
            ('TEXTCOLOR', (0, 0), (-1, 0), self.header_text),  # Dark grey text
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            
            # ========== BOLD BLACK BORDERS ==========
            ('BOX', (0, 0), (-1, -1), 2, colors.black),  # 2px BLACK outer border
            ('LINEBELOW', (0, 0), (-1, 0), 2, colors.black),  # 2px BLACK line under header
            ('INNERGRID', (0, 0), (-1, -1), 1.5, colors.black),  # 1.5px BLACK grid
            
            # ========== ALIGNMENT - Professional Layout ==========
            ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # S.No centered
            ('ALIGN', (1, 1), (1, -1), 'CENTER'),  # Image centered
            ('ALIGN', (2, 1), (2, -1), 'CENTER'),  # Model No centered
            ('ALIGN', (3, 1), (3, -1), 'LEFT'),    # Product Details left
            ('ALIGN', (4, 1), (4, -1), 'RIGHT'),   # Qty right
            ('ALIGN', (5, 1), (5, -1), 'RIGHT'),   # Price right
            ('ALIGN', (6, 1), (6, -1), 'RIGHT'),   # Amount right
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # ========== PADDING - Clean Spacing ==========
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 10),
            
            # ========== TOTAL ROW - Same Light Blue-Grey ==========
            ('BACKGROUND', (0, -1), (-1, -1), self.total_bg),  # Same light blue-grey #D3DDF0
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black),  # 2px BLACK line
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 10),
            ('TOPPADDING', (0, -1), (-1, -1), 12),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 12),
        ]
        
        # Clean alternating rows - white and very subtle blue tint
        for i in range(1, len(data) - 1):
            if i % 2 == 0:
                style_commands.append(('BACKGROUND', (0, i), (-1, i), self.row_alt))  # Very light blue tint
            else:
                style_commands.append(('BACKGROUND', (0, i), (-1, i), colors.white))  # Pure white
        
        table.setStyle(TableStyle(style_commands))
        
        elements.append(table)
        return elements
    
    def _create_summary_table(self, quotation_data: dict, items_by_room: dict):
        """Create summary table with room totals - premium styling"""
        elements = []
        
        # Header with consistent styling
        header_style = ParagraphStyle(
            'SummaryHeader',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#333333'),
            fontName='Helvetica-Bold',
            alignment=TA_CENTER,
            leading=13
        )
        
        data = [[
            Paragraph('<b>S.No</b>', header_style),
            Paragraph('<b>Scope of Automation</b>', header_style),
            Paragraph('<b>Amount</b>', header_style)
        ]]
        
        # Content styling - consistent colors
        sno_style = ParagraphStyle(
            'SummaryNumber',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#333333'),
            alignment=TA_CENTER,
            leading=13
        )
        
        room_style = ParagraphStyle(
            'SummaryRoom',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#333333'),
            alignment=TA_LEFT,
            leading=13
        )
        
        amount_style = ParagraphStyle(
            'SummaryAmount',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#333333'),
            fontName='Helvetica-Bold',
            alignment=TA_RIGHT,
            leading=13
        )
        
        for idx, (room, items) in enumerate(items_by_room.items(), 1):
            room_total = sum(item['total_amount'] for item in items)
            
            # Highlight room name with background color
            room_text = f"Scope of Automation - <b><font color='#FF6B35'>{room}</font></b>"
            
            data.append([
                Paragraph(str(idx), sno_style),
                Paragraph(room_text, room_style),
                Paragraph(f"Rs.  {room_total:,.0f}", amount_style)
            ])
        
        # Add spacing row
        data.append(['', '', ''])
        
        # Add pricing breakdown with better formatting
        data.append(['', Paragraph('<b>Subtotal</b>', self.bold_style), f"Rs.  {quotation_data['subtotal']:,.0f}"])
        
        if quotation_data.get('overall_discount', 0) > 0:
            data.append(['', Paragraph('<font color="#DC2626">Discount</font>', self.normal_style), 
                        f"<font color='#DC2626'>- Rs.  {quotation_data['overall_discount']:,.0f}</font>"])
            data.append(['', Paragraph('<b>Net Quote</b>', self.bold_style), f"Rs.  {quotation_data['net_quote']:,.0f}"])
        
        if quotation_data.get('installation_charges', 0) > 0:
            data.append(['', 'Installation Charges', f"Rs.  {quotation_data['installation_charges']:,.0f}"])
        
        data.append(['', f"GST ({quotation_data['gst_percentage']}%)", f"Rs.  {quotation_data['gst_amount']:,.0f}"])
        
        # Grand total with emphasis - Dark grey
        data.append(['', Paragraph('<font size=12 color="#333333"><b>GRAND TOTAL</b></font>', self.heading_style), 
                     Paragraph(f"<font size=12 color='#333333'><b>Rs.  {quotation_data['total']:,.0f}</b></font>", self.heading_style)])
        
        table = Table(data, colWidths=[0.6*inch, 4.7*inch, 1.5*inch])
        
        # Premium table styling
        style_commands = [
            # Header styling - BLUE background
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#D3DDF0')),  # Light blue
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#333333')),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # Data rows - pure white with consistent color
            ('BACKGROUND', (0, 1), (-1, -2), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -2), colors.HexColor('#333333')),
            
            # Grand total styling - BLUE background (same as header)
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#D3DDF0')),  # Light blue
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#333333')),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 11),
            ('TOPPADDING', (0, -1), (-1, -1), 14),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 14),
            ('LINEABOVE', (0, -1), (-1, -1), 2.5, colors.black),  # Thicker for emphasis
            
            # BOLD BLACK BORDERS - MORE PROMINENT
            ('BOX', (0, 0), (-1, -1), 2.5, colors.black),  # Thicker outer border
            ('LINEBELOW', (0, 0), (-1, 0), 2.5, colors.black),  # Thicker under header
            ('INNERGRID', (0, 0), (-1, -1), 2, colors.black),  # Thicker grid
            
            # Alignment - all centered
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Padding
            ('LEFTPADDING', (0, 1), (-1, -1), 12),
            ('RIGHTPADDING', (0, 1), (-1, -1), 12),
            ('TOPPADDING', (0, 1), (-1, -2), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -2), 10),
        ]
        
        # NO alternating colors - all room rows have pure white background (transparent)
        # This ensures Hall, Bed room, kitchen all look the same
        
        table.setStyle(TableStyle(style_commands))
        
        elements.append(table)
        return elements
    
    def _create_invoice_summary_table(self, invoice_data: dict, items_by_room: dict):
        """Create summary table for invoice"""
        elements = []
        
        # Room-wise summary
        data = [['S.No', 'Description', 'Amount']]
        
        for idx, (room, items) in enumerate(items_by_room.items(), 1):
            room_total = sum(item['total_amount'] for item in items)
            data.append([str(idx), room, f"Rs.  {room_total:,.2f}"])
        
        # Add pricing breakdown
        data.append(['', Paragraph('<b>Subtotal</b>', self.normal_style), f"Rs.  {invoice_data['subtotal']:,.2f}"])
        
        if invoice_data.get('discount', 0) > 0:
            data.append(['', 'Discount', f"- Rs.  {invoice_data['discount']:,.2f}"])
            data.append(['', Paragraph('<b>Net Amount</b>', self.normal_style), f"Rs.  {invoice_data['net_amount']:,.2f}"])
        
        if invoice_data.get('installation_charges', 0) > 0:
            data.append(['', 'Installation Charges', f"Rs.  {invoice_data['installation_charges']:,.2f}"])
        
        data.append(['', f"GST ({invoice_data['gst_percentage']}%)", f"Rs.  {invoice_data['gst_amount']:,.2f}"])
        data.append(['', Paragraph('<b>GRAND TOTAL</b>', self.heading_style), 
                     Paragraph(f"<b>Rs.  {invoice_data['total']:,.2f}</b>", self.heading_style)])
        
        table = Table(data, colWidths=[0.8*inch, 4.5*inch, 1.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f97316')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f97316')),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ALIGN', (2, 1), (2, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        elements.append(table)
        return elements
    
    def _create_footer(self, settings_data: dict, include_bank: bool = False):
        """Create premium footer with company details"""
        elements = []
        
        # Add horizontal line separator
        elements.append(Spacer(1, 20))
        
        footer_text = f"""
        <para align=center>
        <font size=11 color="#E85D04"><b>Thank you for your business!</b></font><br/>
        <font size=9 color="#001219">
        <b>{settings_data.get('company_name', 'InHaus Smart Automation')}</b><br/>
        </font>
        <font size=8 color="#6C757D">
        {settings_data.get('company_address', '')}<br/>
        Email: {settings_data.get('company_email', '')} | Phone: {settings_data.get('company_phone', '')}<br/>
        Website: {settings_data.get('company_website', '')}
        """
        
        if settings_data.get('company_gstin'):
            footer_text += f"<br/>GSTIN: <b>{settings_data['company_gstin']}</b>"
        
        footer_text += "</font>"
        
        if include_bank and settings_data.get('bank_name'):
            footer_text += f"""
            <br/><br/>
            <font size=9 color="#1F2937"><b>Bank Details for Payment</b></font><br/>
            <font size=8 color="#6B7280">
            Bank Name: {settings_data.get('bank_name', '')}<br/>
            Account Number: {settings_data.get('bank_account_no', '')}<br/>
            IFSC Code: {settings_data.get('bank_ifsc', '')}<br/>
            Branch: {settings_data.get('bank_branch', '')}
            """
            if settings_data.get('upi_id'):
                footer_text += f"<br/>UPI ID: <b>{settings_data['upi_id']}</b>"
            footer_text += "</font>"
        
        footer_text += "</para>"
        
        elements.append(Paragraph(footer_text, self.small_style))
        
        return elements
