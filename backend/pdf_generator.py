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

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.page_width, self.page_height = A4
        
        # Premium color palette
        self.primary_color = colors.HexColor('#FF6B35')  # Premium orange
        self.secondary_color = colors.HexColor('#1F2937')  # Dark gray
        self.light_gray = colors.HexColor('#F3F4F6')  # Light gray for alternating rows
        self.medium_gray = colors.HexColor('#E5E7EB')  # Medium gray for borders
        self.text_color = colors.HexColor('#374151')  # Body text color
        self.light_text = colors.HexColor('#6B7280')  # Light text color
        
        # Custom styles with premium fonts and spacing
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=28,
            textColor=self.primary_color,
            spaceAfter=20,
            spaceBefore=10,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            leading=34
        )
        
        self.heading_style = ParagraphStyle(
            'CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=self.secondary_color,
            spaceAfter=15,
            spaceBefore=20,
            fontName='Helvetica-Bold',
            leading=20
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
    
    def generate_quotation_pdf(self, quotation_data: dict, settings_data: dict, output_path: str):
        """Generate a professional quotation PDF"""
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
        
        # Create table for each room
        for room, items in items_by_room.items():
            story.append(Paragraph(f"Scope of Automation - {room}", self.heading_style))
            story.extend(self._create_items_table(items))
            story.append(Spacer(1, 15))
        
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
        
        doc.build(story)
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
            ['Amount Paid:', f"₹ {invoice_data['amount_paid']:,.2f}"],
            ['Amount Due:', f"₹ {invoice_data['amount_due']:,.2f}"],
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
        
        doc.build(story)
        return output_path
    
    def _create_header(self, settings_data: dict):
        """Create premium header with logo and company info"""
        elements = []
        
        # Add top spacing
        elements.append(Spacer(1, 15))
        
        # Try to add logo with proper aspect ratio preservation
        logo_path = Path('/app/frontend/public/inhaus/fulllogo_transparent_nobuffer.png')
        if logo_path.exists():
            # Use aspect ratio preservation - only specify width
            # Let height adjust automatically to maintain proportions
            logo = Image(str(logo_path), width=3*inch)
            logo.hAlign = 'CENTER'
            elements.append(logo)
            elements.append(Spacer(1, 12))
        
        # Company info in elegant style
        company_info = f"""
        <para align=center>
        <font size=11 color="#1F2937"><b>{settings_data.get('company_name', 'InHaus Smart Automation')}</b></font><br/>
        <font size=9 color="#6B7280">
        {settings_data.get('company_email', '')} | {settings_data.get('company_phone', '')}<br/>
        {settings_data.get('company_website', '')}
        </font>
        </para>
        """
        elements.append(Paragraph(company_info, self.small_style))
        elements.append(Spacer(1, 5))
        
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
        """Create premium items table with alternating row colors"""
        elements = []
        
        # Table header with premium styling
        data = [['S.No', 'Model No', 'Product Details', 'Qty', 'Price', 'Amount']]
        
        # Add items
        for idx, item in enumerate(items, 1):
            # Truncate description if too long
            desc = item['description']
            if len(desc) > 150:
                desc = desc[:150] + '...'
            
            data.append([
                str(idx),
                Paragraph(f"<font size=9><b>{item['model_no']}</b></font>", self.small_style),
                Paragraph(f"<font size=9><b>{item['product_name']}</b></font><br/><font size=8 color='#6B7280'>{desc}</font>", self.small_style),
                str(item['quantity']),
                f"₹ {item['offered_price']:,.0f}",
                f"₹ {item['total_amount']:,.0f}"
            ])
        
        # Total row with emphasis
        total = sum(item['total_amount'] for item in items)
        data.append(['', '', Paragraph('<b>Room Total</b>', self.bold_style), 
                     str(sum(item['quantity'] for item in items)), '', f"₹ {total:,.0f}"])
        
        table = Table(data, colWidths=[0.5*inch, 0.9*inch, 3.2*inch, 0.5*inch, 1*inch, 1.1*inch])
        
        # Premium table styling with alternating row colors
        style_commands = [
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), self.primary_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 14),
            
            # Total row styling
            ('BACKGROUND', (0, -1), (-1, -1), self.light_gray),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 11),
            ('TOPPADDING', (0, -1), (-1, -1), 12),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 12),
            
            # Grid and borders
            ('LINEBELOW', (0, 0), (-1, 0), 1.5, self.primary_color),
            ('LINEBELOW', (0, -1), (-1, -1), 1, self.medium_gray),
            ('INNERGRID', (0, 1), (-1, -2), 0.5, self.medium_gray),
            
            # Alignment
            ('ALIGN', (3, 1), (3, -1), 'CENTER'),
            ('ALIGN', (4, 1), (5, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Padding for content
            ('LEFTPADDING', (0, 1), (-1, -2), 10),
            ('RIGHTPADDING', (0, 1), (-1, -2), 10),
            ('TOPPADDING', (0, 1), (-1, -2), 12),
            ('BOTTOMPADDING', (0, 1), (-1, -2), 12),
        ]
        
        # Add alternating row colors
        for i in range(1, len(data) - 1):
            if i % 2 == 0:
                style_commands.append(('BACKGROUND', (0, i), (-1, i), colors.white))
            else:
                style_commands.append(('BACKGROUND', (0, i), (-1, i), self.light_gray))
        
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
            data.append([str(idx), room, f"₹ {room_total:,.0f}"])
        
        # Add spacing row
        data.append(['', '', ''])
        
        # Add pricing breakdown with better formatting
        data.append(['', Paragraph('<b>Subtotal</b>', self.bold_style), f"₹ {quotation_data['subtotal']:,.0f}"])
        
        if quotation_data.get('overall_discount', 0) > 0:
            data.append(['', Paragraph('<font color="#DC2626">Discount</font>', self.normal_style), 
                        f"<font color='#DC2626'>- ₹ {quotation_data['overall_discount']:,.0f}</font>"])
            data.append(['', Paragraph('<b>Net Quote</b>', self.bold_style), f"₹ {quotation_data['net_quote']:,.0f}"])
        
        if quotation_data.get('installation_charges', 0) > 0:
            data.append(['', 'Installation Charges', f"₹ {quotation_data['installation_charges']:,.0f}"])
        
        data.append(['', f"GST ({quotation_data['gst_percentage']}%)", f"₹ {quotation_data['gst_amount']:,.0f}"])
        
        # Grand total with emphasis
        data.append(['', Paragraph('<font size=14><b>GRAND TOTAL</b></font>', self.heading_style), 
                     Paragraph(f"<font size=14 color='#FF6B35'><b>₹ {quotation_data['total']:,.0f}</b></font>", self.heading_style)])
        
        table = Table(data, colWidths=[0.6*inch, 4.7*inch, 1.5*inch])
        
        # Premium table styling
        style_commands = [
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), self.primary_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('TOPPADDING', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 14),
            
            # Grand total styling
            ('BACKGROUND', (0, -1), (-1, -1), self.light_gray),
            ('LINEABOVE', (0, -1), (-1, -1), 2, self.primary_color),
            ('TOPPADDING', (0, -1), (-1, -1), 16),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 16),
            
            # Borders
            ('LINEBELOW', (0, 0), (-1, 0), 1.5, self.primary_color),
            ('INNERGRID', (0, 1), (-1, -2), 0.5, self.medium_gray),
            
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
            data.append([str(idx), room, f"₹ {room_total:,.2f}"])
        
        # Add pricing breakdown
        data.append(['', Paragraph('<b>Subtotal</b>', self.normal_style), f"₹ {invoice_data['subtotal']:,.2f}"])
        
        if invoice_data.get('discount', 0) > 0:
            data.append(['', 'Discount', f"- ₹ {invoice_data['discount']:,.2f}"])
            data.append(['', Paragraph('<b>Net Amount</b>', self.normal_style), f"₹ {invoice_data['net_amount']:,.2f}"])
        
        if invoice_data.get('installation_charges', 0) > 0:
            data.append(['', 'Installation Charges', f"₹ {invoice_data['installation_charges']:,.2f}"])
        
        data.append(['', f"GST ({invoice_data['gst_percentage']}%)", f"₹ {invoice_data['gst_amount']:,.2f}"])
        data.append(['', Paragraph('<b>GRAND TOTAL</b>', self.heading_style), 
                     Paragraph(f"<b>₹ {invoice_data['total']:,.2f}</b>", self.heading_style)])
        
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
        """Create footer with company details"""
        elements = []
        
        footer_text = f"""
        <para align=center>
        <b>Thank you for your business!</b><br/>
        {settings_data.get('company_name', 'InHaus Smart Automation')}<br/>
        {settings_data.get('company_address', '')}<br/>
        """
        
        if settings_data.get('company_gstin'):
            footer_text += f"GSTIN: {settings_data['company_gstin']}<br/>"
        
        if include_bank and settings_data.get('bank_name'):
            footer_text += f"""
            <br/>
            <b>Bank Details:</b><br/>
            Bank: {settings_data.get('bank_name', '')}<br/>
            Account No: {settings_data.get('bank_account_no', '')}<br/>
            IFSC: {settings_data.get('bank_ifsc', '')}<br/>
            """
            if settings_data.get('upi_id'):
                footer_text += f"UPI ID: {settings_data['upi_id']}<br/>"
        
        footer_text += "</para>"
        
        elements.append(Paragraph(footer_text, self.small_style))
        
        return elements
