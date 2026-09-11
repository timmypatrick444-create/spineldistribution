import { jsPDF } from 'jspdf';
import { Order } from '../types';

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

  const orderLines = [
    `Invoice / Order #: ${order.orderNumber}`,
    `Order Date: ${new Date(order.createdAt).toLocaleDateString()}`,
    `Status: ${order.status.toUpperCase()}`,
    `Payment Method: ${order.paymentMethod.toUpperCase()}`,
    `Payment Status: ${order.paymentStatus.toUpperCase()}`,
    order.paymentReference ? `Paystack Ref: ${order.paymentReference}` : '',
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
