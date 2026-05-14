// PDF invoice using @react-pdf/renderer
// Called server-side via /api/invoice/[orderId] route
import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";
import type { Order } from "@/lib/types";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a2e" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#4a4580" },
  brandSub: { fontSize: 9, color: "#888", marginTop: 2 },
  invoiceLabel: { fontSize: 9, color: "#888", textAlign: "right" },
  invoiceNum: { fontSize: 16, fontFamily: "Helvetica-Bold", textAlign: "right", marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  row: { flexDirection: "row", paddingVertical: 4 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e5e5", marginVertical: 4 },
  tableHeader: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#4a4580" },
  tableHeaderText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#4a4580" },
  itemRow: { flexDirection: "row", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "center" },
  col3: { flex: 1, textAlign: "right" },
  col4: { flex: 1.5, textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  totalLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", marginRight: 24 },
  totalAmount: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#4a4580", minWidth: 80, textAlign: "right" },
  statusBadge: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#fff", backgroundColor: "#4a4580", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  footer: { marginTop: 40, borderTopWidth: 1, borderTopColor: "#e5e5e5", paddingTop: 12, fontSize: 8, color: "#aaa", textAlign: "center" },
});

interface InvoiceDocumentProps {
  order: Order;
}

export function InvoiceDocument({ order }: InvoiceDocumentProps) {
  const date = new Date(order.created_at).toLocaleDateString("en-GH", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>True Foods</Text>
            <Text style={styles.brandSub}>Yoghurt · Accra, Ghana</Text>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>RECEIPT</Text>
            <Text style={styles.invoiceNum}>#{order.order_number}</Text>
            <Text style={[styles.invoiceLabel, { marginTop: 4 }]}>{date}</Text>
          </View>
        </View>

        {/* Customer */}
        {(order.customer_name || order.customer_phone) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billed to</Text>
            {order.customer_name && <Text>{order.customer_name}</Text>}
            {order.customer_phone && <Text style={{ color: "#666", marginTop: 2 }}>{order.customer_phone}</Text>}
          </View>
        )}

        {/* Items */}
        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Item</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Size</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Total</Text>
          </View>
          {(order.items ?? []).map((item) => (
            <View style={styles.itemRow} key={item.id}>
              <Text style={styles.col1}>{item.product_name}</Text>
              <Text style={styles.col2}>{item.cup_size}</Text>
              <Text style={styles.col3}>{item.quantity}</Text>
              <Text style={styles.col4}>GHS {Number(item.line_total).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalAmount}>GHS {Number(order.total_amount).toFixed(2)}</Text>
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={{ color: "#666" }}>{order.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Thank you for your purchase! · True Foods · Accra, Ghana</Text>
      </Page>
    </Document>
  );
}
