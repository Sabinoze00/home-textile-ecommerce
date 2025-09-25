import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  validateAdminRole,
  handleAdminError,
  logAdminAction,
} from '@/lib/admin'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validation = await validateAdminRole()
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    // Fetch order details
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        shippingAddress: true,
        billingAddress: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Log the action
    await logAdminAction('GENERATE_INVOICE', 'order', params.id, {
      orderNumber: order.orderNumber,
      customerName: `${order.billingAddress.firstName} ${order.billingAddress.lastName}`,
      total: Number(order.total),
    })

    // Generate mock PDF content
    const pdfContent = generateMockInvoicePDF(order)

    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating invoice:', error)
    return handleAdminError(error)
  }
}

function generateMockInvoicePDF(order: any): Buffer {
  // This is a mock implementation. In a real application, you would:
  // 1. Use a proper PDF generation library like PDFKit, jsPDF, or Puppeteer
  // 2. Create professional invoice templates
  // 3. Include company branding and detailed formatting

  const itemsList = order.items
    .map(
      (item: any, index: number) =>
        `${index + 1}. ${item.productName} - Qty: ${item.quantity} x $${Number(item.price).toFixed(2)} = $${Number(item.total).toFixed(2)}`
    )
    .join('\n')

  const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

5 0 obj
<<
/Length 800
>>
stream
BT
/F1 18 Tf
50 750 Td
(INVOICE) Tj
0 -30 Td
/F1 12 Tf
(Order Number: ${order.orderNumber}) Tj
0 -20 Td
(Date: ${new Date(order.createdAt).toLocaleDateString()}) Tj
0 -20 Td
(Status: ${order.status}) Tj
0 -40 Td
/F1 14 Tf
(Bill To:) Tj
0 -20 Td
/F1 12 Tf
(${order.billingAddress.firstName} ${order.billingAddress.lastName}) Tj
0 -20 Td
(${order.billingAddress.street}) Tj
0 -20 Td
(${order.billingAddress.city}, ${order.billingAddress.state} ${order.billingAddress.postalCode}) Tj
0 -20 Td
(${order.billingAddress.country}) Tj
0 -40 Td
/F1 14 Tf
(Items:) Tj
0 -20 Td
/F1 10 Tf
(${itemsList.replace(/\n/g, ') Tj\n0 -15 Td\n(')}) Tj
0 -40 Td
/F1 12 Tf
(Subtotal: $${Number(order.subtotal).toFixed(2)}) Tj
0 -20 Td
(Tax: $${Number(order.tax).toFixed(2)}) Tj
0 -20 Td
(Shipping: $${Number(order.shipping).toFixed(2)}) Tj
0 -20 Td
/F1 14 Tf
(Total: $${Number(order.total).toFixed(2)}) Tj
0 -40 Td
/F1 10 Tf
(Payment Status: ${order.paymentStatus}) Tj
${order.paymentProvider ? `0 -15 Td\n(Payment Method: ${order.paymentProvider}) Tj` : ''}
ET
endstream
endobj

xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000110 00000 n
0000000251 00000 n
0000000329 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
1200
%%EOF`

  return Buffer.from(mockPdfContent)
}
