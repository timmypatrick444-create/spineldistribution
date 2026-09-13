import { jsPDF } from 'jspdf';
import { Order, SubmittedQuote } from '../types';

export function downloadInvoicePDF(order: Order) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 18;

  // Header Banner
  doc.setFillColor(19, 25, 33); // Amazon dark navy #131921
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SPINEL DISTRIBUTION', margin, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(254, 189, 105); // Amazon yellow #febd69
  doc.text('INTERNATIONAL ENTERPRISE E-COMMERCE & SECURITY SYSTEMS', margin, 20);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL TAX INVOICE', pageWidth - margin - 50, 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, 20);

  y = 38;

  // Order & Customer Details Grid
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE TO:', margin, y);
  doc.text('ORDER SUMMARY:', pageWidth / 2 + 10, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const customerLines = [
    order.customerName,
    order.shippingAddress.companyName ? `Company: ${order.shippingAddress.companyName}` : '',
    order.shippingAddress.streetAddress,
    `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
    `Country: ${order.shippingAddress.country}`,
    `Email: ${order.customerEmail}`,
    `Phone: ${order.shippingAddress.phone}`
  ].filter(Boolean);

  let custY = y;
  for (const line of customerLines) {
    doc.text(line, margin, custY);
    custY += 4.5;
  }

  const isPaid = order.paymentStatus === 'paid' || order.status === 'completed';
  const displayStatus = isPaid ? 'COMPLETED' : 'PENDING';
  const statusMessage = isPaid ? 'Completed (Payment Verified via Paystack)' : 'Pending (Awaiting Payment / Authorization)';

  const orderLines = [
    `Invoice / Order #: ${order.orderNumber}`,
    `Order Date: ${new Date(order.createdAt).toLocaleDateString()}`,
    `Payment Status: ${displayStatus}`,
    `Details: ${statusMessage}`,
    `Payment Method: ${order.paymentMethod.toUpperCase()}`,
    order.paymentReference ? `Paystack Ref: ${order.paymentReference}` : 'Paystack Ref: Unassigned (Pending)',
    `Exchange Rate: 1 USD = ₦${order.exchangeRateUsed.toLocaleString()}`
  ].filter(Boolean);

  let ordY = y;
  for (const line of orderLines) {
    doc.text(line, pageWidth / 2 + 10, ordY);
    ordY += 4.5;
  }

  y = Math.max(custY, ordY) + 8;

  // Table Header
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  doc.text('ITEM DESCRIPTION', margin + 3, y + 5.5);
  doc.text('SKU', margin + 85, y + 5.5);
  doc.text('QTY', margin + 115, y + 5.5);
  doc.text('UNIT (USD)', margin + 130, y + 5.5);
  doc.text('TOTAL (USD)', margin + 155, y + 5.5);

  y += 9;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  order.items.forEach((item, index) => {
    // Check if new page needed
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Row alternating background
    if (index % 2 === 1) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, y - 3.5, pageWidth - (margin * 2), 7, 'F');
    }

    doc.setTextColor(30, 41, 59);
    // Truncate long name
    const cleanName = item.name.length > 45 ? item.name.substring(0, 42) + '...' : item.name;
    doc.text(cleanName, margin + 3, y + 1);
    doc.setTextColor(100, 116, 139);
    doc.text(item.sku || 'N/A', margin + 85, y + 1);
    doc.setTextColor(30, 41, 59);
    doc.text(String(item.quantity), margin + 118, y + 1);
    doc.text(`$${item.priceUSD.toFixed(2)}`, margin + 130, y + 1);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${(item.priceUSD * item.quantity).toFixed(2)}`, margin + 155, y + 1);
    doc.setFont('helvetica', 'normal');

    y += 6.5;
  });

  y += 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Summary box
  const summaryX = pageWidth - margin - 75;
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Subtotal (USD):', summaryX, y);
  doc.text(`$${order.subtotalUSD.toFixed(2)}`, summaryX + 45, y);
  y += 5;

  doc.text('Shipping & Handling:', summaryX, y);
  doc.text(order.shippingFeeUSD === 0 ? 'FREE (Spinel Prime)' : `$${order.shippingFeeUSD.toFixed(2)}`, summaryX + 45, y);
  y += 5;

  // Grand Total in USD and NGN
  doc.setFillColor(254, 243, 199);
  doc.rect(summaryX - 4, y - 1, 80, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(180, 83, 9);
  doc.text('TOTAL AMOUNT:', summaryX, y + 4.5);
  doc.text(`$${order.totalUSD.toFixed(2)}`, summaryX + 45, y + 4.5);

  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`Equivalent in NGN: ₦${order.totalNGN.toLocaleString()}`, summaryX, y + 10);

  y += 24;

  // Footer & Terms
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Thank you for choosing SPINEL DISTRIBUTION. For support or warranty claims, contact support@spineldistribution.com', margin, y);
  y += 4;
  doc.text('All products carry official international manufacturer warranties. Commercial return window is 30 days from dispatch.', margin, y);

  // Save PDF
  doc.save(`Spinel_Invoice_${order.orderNumber}.pdf`);
}

export function downloadQuotationPDF(quote: SubmittedQuote) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 18;

  // Header Banner
  doc.setFillColor(19, 25, 33); // Amazon dark navy #131921
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SPINEL DISTRIBUTION', margin, 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(254, 189, 105); // #febd69
  doc.text('ENTERPRISE B2B PROCUREMENT & COMMERCIAL HARDWARE SOLUTIONS', margin, 19);
  doc.text('AFRICA & INTERNATIONAL DISTRIBUTION DESK', margin, 24);

  // Document Title & Reference
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ENTERPRISE RFQ / QUOTATION', pageWidth - margin - 65, 13);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ref: ${quote.quoteId}`, pageWidth - margin - 65, 18);
  doc.text(`Date: ${quote.date || new Date().toLocaleDateString()}`, pageWidth - margin - 65, 23);

  y = 36;

  // Status Banner
  let statusBg: [number, number, number] = [254, 243, 199]; // amber
  let statusText: [number, number, number] = [180, 83, 9];
  if (quote.status === 'Approved') {
    statusBg = [220, 252, 231];
    statusText = [22, 101, 52];
  } else if (quote.status === 'Quoted') {
    statusBg = [219, 234, 254];
    statusText = [30, 64, 175];
  } else if (quote.status === 'Declined') {
    statusBg = [254, 226, 226];
    statusText = [153, 27, 27];
  }

  doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(statusText[0], statusText[1], statusText[2]);
  doc.text(`RFQ STATUS: ${String(quote.status || 'UNDER REVIEW').toUpperCase()}`, margin + 5, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Authorized Reference ID: ${quote.quoteId}`, pageWidth - margin - 60, y + 6.5);

  y += 16;

  // Two Column Grid: Client Details & Project Parameters
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('CLIENT & ENTERPRISE DETAILS:', margin, y);
  doc.text('PROJECT & LOGISTICS PARAMETERS:', pageWidth / 2 + 5, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const clientInfo = [
    `Company: ${quote.companyName || 'Private Enterprise / Client'}`,
    `Contact Person: ${quote.contactName}`,
    `Email: ${quote.email}`,
    `Phone: ${quote.phone}`,
    `Location: ${quote.location || 'Federal Republic of Nigeria / West Africa'}`
  ];

  let leftY = y;
  for (const line of clientInfo) {
    doc.text(line, margin, leftY);
    leftY += 4.8;
  }

  const projectInfo = [
    `Timeline: ${quote.projectTimeline || 'Standard (1-2 weeks)'}`,
    `Preferred Currency: ${quote.currency || 'USD'}`,
    `On-Site Installation: ${quote.needsInstallation ? 'YES (Deployment Engineers Required)' : 'NO (Supply Only)'}`,
    `Partner Tier Discount: ${quote.needsPartnerDiscount ? 'YES (Volume / Partner Tier Requested)' : 'Standard Wholesale'}`,
    `Assigned Desk: Spinel Enterprise Commercial Operations`
  ];

  let rightY = y;
  for (const line of projectInfo) {
    doc.text(line, pageWidth / 2 + 5, rightY);
    rightY += 4.8;
  }

  y = Math.max(leftY, rightY) + 6;

  // Hardware Table
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  doc.text('HARDWARE DESCRIPTION', margin + 4, y + 5.5);
  doc.text('BRAND / MANUFACTURER', margin + 85, y + 5.5);
  doc.text('SKU / MODEL', margin + 130, y + 5.5);
  doc.text('REQUESTED QTY', margin + 155, y + 5.5);

  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  if (quote.product) {
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, y - 1, pageWidth - (margin * 2), 12, 'F');

    const cleanTitle = quote.product.name.length > 44 ? quote.product.name.substring(0, 41) + '...' : quote.product.name;
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTitle, margin + 4, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Category: ${quote.product.category}`, margin + 4, y + 9);

    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(quote.product.brand || 'Enterprise Grade', margin + 85, y + 6);
    doc.setTextColor(100, 116, 139);
    doc.text(quote.product.sku || 'N/A', margin + 130, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(19, 25, 33);
    doc.text(`${quote.quantity} units`, margin + 155, y + 6);

    y += 16;
  } else {
    doc.text('Multi-System Enterprise Procurement Bill of Quantities', margin + 4, y + 4);
    doc.text(`${quote.quantity} units`, margin + 155, y + 4);
    y += 10;
  }

  // Technical Scope & Notes
  if (quote.notes) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('CLIENT SPECIFICATIONS & SCOPE OF REQUIREMENT:', margin, y);
    y += 5;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    const splitNotes = doc.splitTextToSize(`"${quote.notes}"`, pageWidth - (margin * 2) - 10);
    const boxHeight = Math.max(14, splitNotes.length * 4.5 + 6);

    doc.roundedRect(margin, y, pageWidth - (margin * 2), boxHeight, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(splitNotes, margin + 5, y + 5);

    y += boxHeight + 8;
  } else {
    y += 4;
  }

  // Terms & Conditions Block
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('COMMERCIAL PROCUREMENT CONDITIONS:', margin, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const terms = [
    '1. Quotation Validity: Official proforma quotations derived from this RFQ remain valid for 14 calendar days.',
    '2. Exchange Rate Benchmark: International prices pegged to USD and settled in NGN or USD via official bank wire.',
    '3. Manufacturer Warranty: All enterprise items are covered by standard 1 to 3-year OEM manufacturer replacement warranties.',
    '4. Logistics & Clearance: Door-to-door insured air/sea cargo with technical inspection certificate provided upon dispatch.'
  ];
  for (const term of terms) {
    doc.text(term, margin, y);
    y += 4;
  }

  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Footer Seal & Contact
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(19, 25, 33);
  doc.text('SPINEL DISTRIBUTION ENTERPRISE PROCUREMENT DESK', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Email: rfq@spineldistribution.com | Technical Support: support@spineldistribution.com | www.spineldistribution.com', margin, y + 4);

  // Save PDF
  doc.save(`Spinel_RFQ_${quote.quoteId}.pdf`);
}
