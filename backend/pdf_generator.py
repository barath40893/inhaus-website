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
        
        # Classic Black & White color palette - Timeless and elegant
        self.primary_color = colors.black  # Pure black for primary elements
        self.accent_color = colors.HexColor('#333333')  # Dark grey accent
        self.secondary_color = colors.black  # Black for headers
        self.header_bg = colors.black  # Classic black header
        self.header_text = colors.white  # Pure white text on black header
        self.row_light = colors.white  # Pure white for light rows
        self.row_alt = colors.HexColor('#F5F5F5')  # Very light grey for alternating rows
        self.border_color = colors.HexColor('#DDDDDD')  # Light grey border
        self.table_border = colors.HexColor('#000000')  # Black table border
        self.text_color = colors.black  # Pure black text for maximum readability
        self.light_text = colors.HexColor('#666666')  # Medium grey for descriptions
        self.light_gray = colors.HexColor('#CCCCCC')  # Light gray for subtle borders
        self.medium_gray = colors.HexColor('#999999')  # Medium gray for grid
        self.success_color = colors.black  # Black for success
        self.highlight_color = colors.HexColor('#F0F0F0')  # Light grey highlight
        self.total_bg = colors.HexColor('#F5F5F5')  # Light grey background for totals
        self.total_text = colors.black  # Pure black for total text
        
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
    
    def _add_watermark(self, canvas, doc):
        """Add transparent logo watermark to each page"""
        canvas.saveState()
        
        # Try to load and add watermark logo
        logo_path = Path('/app/frontend/public/inhaus/fulllogo_transparent_nobuffer.png')
        if logo_path.exists():
            try:
                # Set transparency (0.0 = fully transparent, 1.0 = fully opaque)
                canvas.setFillAlpha(0.08)  # Very subtle watermark
                canvas.setStrokeAlpha(0.08)
                
                # Calculate center position
                page_width, page_height = A4
                
                # Large watermark in center
                watermark_width = 4 * inch
                watermark_height = 1.5 * inch
                
                x = (page_width - watermark_width) / 2
                y = (page_height - watermark_height) / 2
                
                # Draw the watermark
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
        
        canvas.restoreState()
    
    def generate_quotation_pdf(self, quotation_data: dict, settings_data: dict, output_path: str):
        """Generate a professional quotation PDF with watermark"""
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
        story.append(Paragraph("QUOTATION", self.title_style))
        story.append(Spacer(1, 10))
        
        # Quote details and customer info
        story.extend(self._create_quote_info(quotation_data, settings_data))
        story.append(Spacer(1, 20))
        
        # Group items by room/area
        items_by_room = {}
        for item in quotation_data['items']:
            room = item['room_area']
            if room not in items_by_room:
                items_by_room[room] = []
            items_by_room[room].append(item)
        
        # Create table for each room with enhanced section heading
        for room, items in items_by_room.items():
            # Clean section heading in black
            room_heading = Paragraph(
                f'<font size=14 color="#000000"><b>Scope of Automation - {room}</b></font>',
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
                    borderPadding=0
                )
            )
            story.append(room_heading)
            story.extend(self._create_items_table(items))
            story.append(Spacer(1, 18))
        
        # Summary
        story.append(PageBreak())
        story.append(Paragraph("SUMMARY", self.heading_style))
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
        
        # Footer with company details
        story.extend(self._create_footer(settings_data))
        
        # Build PDF with watermark on each page
        doc.build(story, onFirstPage=self._add_watermark, onLaterPages=self._add_watermark)
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
        
        # Build PDF with watermark on each page
        doc.build(story, onFirstPage=self._add_watermark, onLaterPages=self._add_watermark)
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
        
        # Header styling - Bold, clear, high contrast
        header_style = ParagraphStyle(
            'TableHeader',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=self.header_text,
            fontName='Helvetica-Bold',
            alignment=TA_CENTER,
            leading=14,
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
        
        # Content styling for maximum readability
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
            fontName='Helvetica-Bold'
        )
        
        right_style = ParagraphStyle(
            'RightContent',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.text_color,
            alignment=TA_RIGHT,
            leading=13,
            fontName='Helvetica-Bold'
        )
        
        # Add items with classic black & white styling
        for idx, item in enumerate(items, 1):
            # Smart truncation for description
            desc = item['description']
            if len(desc) > 70:
                desc = desc[:70] + '...'
            
            # Product details with clean black & white hierarchy
            product_para = Paragraph(
                f"<font size=11 color='#000000'><b>{item['product_name']}</b></font><br/>"
                f"<font size=9 color='#666666'>{desc}</font>", 
                content_style
            )
            
            # Model number - bold black
            model_para = Paragraph(
                f"<font size=10 color='#000000'><b>{item['model_no']}</b></font>",
                center_style
            )
            
            # Serial number
            sno_para = Paragraph(
                f"<font size=10 color='#000000'><b>{str(idx)}</b></font>",
                center_style
            )
            
            # Quantity - bold black
            qty_para = Paragraph(
                f"<font size=10 color='#000000'><b>{str(item['quantity'])}</b></font>",
                center_style
            )
            
            # Prices - clean black text
            price_para = Paragraph(
                f"<font size=10 color='#000000'><b>Rs. {item['offered_price']:,.0f}</b></font>",
                right_style
            )
            
            # Total amount - bold black
            amount_para = Paragraph(
                f"<font size=11 color='#000000'><b>Rs. {item['total_amount']:,.0f}</b></font>",
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
        
        # Total row styling - clear and professional
        total_label_style = ParagraphStyle(
            'TotalLabel',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=self.total_text,
            fontName='Helvetica-Bold',
            alignment=TA_RIGHT
        )
        
        total_amount_style = ParagraphStyle(
            'TotalAmount',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=self.primary_color,
            fontName='Helvetica-Bold',
            alignment=TA_RIGHT
        )
        
        total = sum(item['total_amount'] for item in items)
        total_qty = sum(item['quantity'] for item in items)
        
        data.append([
            '', 
            '',
            '', 
            Paragraph('<font size=12 color="#000000"><b>Room Total</b></font>', total_label_style), 
            Paragraph(f'<font size=11 color="#000000"><b>{total_qty}</b></font>', center_style),
            '',
            Paragraph(f'<font size=13 color="#000000"><b>Rs. {total:,.0f}</b></font>', total_amount_style)
        ])
        
        # Optimized column widths for clarity - wider spacing
        table = Table(data, colWidths=[0.4*inch, 0.75*inch, 0.95*inch, 2.45*inch, 0.5*inch, 1.05*inch, 1.15*inch])
        
        # Modern, clean, highly readable table styling
        style_commands = [
            # ========== HEADER - High Contrast, Professional ==========
            ('BACKGROUND', (0, 0), (-1, 0), self.header_bg),  # Rich navy blue
            ('TEXTCOLOR', (0, 0), (-1, 0), self.header_text),  # Pure white
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('TOPPADDING', (0, 0), (-1, 0), 16),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 16),
            ('LEFTPADDING', (0, 0), (-1, 0), 10),
            ('RIGHTPADDING', (0, 0), (-1, 0), 10),
            
            # ========== TOTAL ROW - Clean Highlight ==========
            ('BACKGROUND', (0, -1), (-1, -1), self.total_bg),  # Light grey background
            ('TOPPADDING', (0, -1), (-1, -1), 16),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 16),
            ('LEFTPADDING', (0, -1), (-1, -1), 12),
            ('RIGHTPADDING', (0, -1), (-1, -1), 12),
            ('LINEABOVE', (0, -1), (-1, -1), 2, self.table_border),  # Strong separator
            
            # ========== BORDERS - Clean Lines ==========
            ('BOX', (0, 0), (-1, -1), 1.25, self.table_border),  # Clean outer border
            ('LINEBELOW', (0, 0), (-1, 0), 2, self.secondary_color),  # Dark header underline
            ('LINEBELOW', (0, 1), (-1, -2), 0.75, self.border_color),  # Row separators
            
            # ========== PERFECT ALIGNMENT ==========
            ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # S.No
            ('ALIGN', (1, 1), (1, -1), 'CENTER'),  # Image
            ('ALIGN', (2, 1), (2, -1), 'CENTER'),  # Model No
            ('ALIGN', (3, 1), (3, -1), 'LEFT'),    # Product Details
            ('ALIGN', (4, 1), (4, -1), 'CENTER'),  # Qty
            ('ALIGN', (5, 1), (5, -1), 'RIGHT'),   # Price
            ('ALIGN', (6, 1), (6, -1), 'RIGHT'),   # Amount
            
            # Vertical alignment
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # ========== GENEROUS PADDING for Readability ==========
            ('LEFTPADDING', (0, 1), (-1, -2), 12),
            ('RIGHTPADDING', (0, 1), (-1, -2), 12),
            ('TOPPADDING', (0, 1), (-1, -2), 16),      # Increased for breathing room
            ('BOTTOMPADDING', (0, 1), (-1, -2), 16),   # Increased for breathing room
        ]
        
        # Subtle alternating rows for easy scanning
        for i in range(1, len(data) - 1):
            if i % 2 == 0:
                style_commands.append(('BACKGROUND', (0, i), (-1, i), self.row_alt))  # Subtle grey
            else:
                style_commands.append(('BACKGROUND', (0, i), (-1, i), self.row_light))  # White
        
        table.setStyle(TableStyle(style_commands))
        
        elements.append(table)
        return elements
    
    def _create_summary_table(self, quotation_data: dict, items_by_room: dict):
        """Create premium summary table for quotation"""
        elements = []
        
        # Room-wise summary with elegant styling
        data = [['S.No', 'Scope of Automation', 'Amount']]
        
        for idx, (room, items) in enumerate(items_by_room.items(), 1):
            room_total = sum(item['total_amount'] for item in items)
            data.append([str(idx), room, f"Rs.  {room_total:,.0f}"])
        
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
        
        # Grand total with emphasis - pure black
        data.append(['', Paragraph('<font size=14 color="#000000"><b>GRAND TOTAL</b></font>', self.heading_style), 
                     Paragraph(f"<font size=14 color='#000000'><b>Rs.  {quotation_data['total']:,.0f}</b></font>", self.heading_style)])
        
        table = Table(data, colWidths=[0.6*inch, 4.7*inch, 1.5*inch])
        
        # Premium table styling
        style_commands = [
            # Header styling with black background
            ('BACKGROUND', (0, 0), (-1, 0), colors.black),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('TOPPADDING', (0, 0), (-1, 0), 16),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 16),
            
            # Grand total styling with light grey highlight
            ('BACKGROUND', (0, -1), (-1, -1), self.highlight_color),
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black),
            ('TOPPADDING', (0, -1), (-1, -1), 16),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 16),
            
            # Borders - clean black lines
            ('LINEBELOW', (0, 0), (-1, 0), 2, colors.black),
            ('INNERGRID', (0, 1), (-1, -2), 0.5, self.light_gray),
            ('BOX', (0, 0), (-1, -1), 1.25, colors.black),
            
            # Alignment
            ('ALIGN', (2, 1), (2, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Padding
            ('LEFTPADDING', (0, 1), (-1, -1), 12),
            ('RIGHTPADDING', (0, 1), (-1, -1), 12),
            ('TOPPADDING', (0, 1), (-1, -2), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -2), 10),
        ]
        
        # Add alternating row colors for room items
        room_count = len(items_by_room)
        for i in range(1, room_count + 1):
            if i % 2 == 0:
                style_commands.append(('BACKGROUND', (0, i), (-1, i), colors.white))
            else:
                style_commands.append(('BACKGROUND', (0, i), (-1, i), self.light_gray))
        
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
