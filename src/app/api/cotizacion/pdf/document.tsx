import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatUSD } from "@/lib/pricing";
import { SHIPPING_FREE_FROM } from "@/lib/shipping";
import type { Customer } from "@/components/cart-context";

// Colores de marca de TECNOVA adaptados a un documento imprimible: fondo
// claro (para no gastar tinta ni verse mal impreso), con el azul eléctrico
// y el cian como acentos. Usa Helvetica (fuente estándar de PDF, sin
// archivos de fuente que mantener) en vez de Space Grotesk/Inter.
const INK = "#05070c";
const SILVER = "#5b6474";
const ELECTRIC = "#2b5cff";
const LINE = "#d8dce3";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: INK, fontFamily: "Helvetica" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  brandAccent: { color: ELECTRIC },
  slogan: { fontSize: 8, color: SILVER, marginTop: 2 },
  quoteBox: { alignItems: "flex-end" },
  quoteNumber: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  quoteDate: { fontSize: 9, color: SILVER, marginTop: 2 },
  divider: { borderBottomWidth: 2, borderBottomColor: ELECTRIC, marginVertical: 14 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: SILVER,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  customerBox: { marginBottom: 16 },
  customerLine: { marginBottom: 2 },
  table: { borderTopWidth: 1, borderTopColor: LINE },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LINE, paddingVertical: 6 },
  trHead: { backgroundColor: "#f3f5f8" },
  cName: { flex: 3, paddingHorizontal: 4 },
  cQty: { flex: 1, textAlign: "center", paddingHorizontal: 4 },
  cUnit: { flex: 1.3, textAlign: "right", paddingHorizontal: 4 },
  cSubtotal: { flex: 1.3, textAlign: "right", paddingHorizontal: 4 },
  headCell: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  totalsBox: { marginTop: 16, alignSelf: "flex-end", width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  totalsLabel: { color: SILVER },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: INK,
    marginTop: 4,
    paddingTop: 6,
  },
  grandLabel: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  grandValue: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  footer: { marginTop: 28, fontSize: 8, color: SILVER, lineHeight: 1.4 },
});

export type QuotePdfItem = {
  name: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
};

export type QuotePdfProps = {
  storeName: string;
  quoteNumber: string;
  date: string;
  customer: Customer;
  items: QuotePdfItem[];
  subtotal: number;
  shipping: number;
  total: number;
};

export function QuotePdfDocument({
  storeName,
  quoteNumber,
  date,
  customer,
  items,
  subtotal,
  shipping,
  total,
}: QuotePdfProps) {
  return (
    <Document title={`Cotización TECNOVA ${quoteNumber}`}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            {storeName.trim().toLowerCase() === "tecnova" ? (
              <Text style={styles.brand}>
                tec<Text style={styles.brandAccent}>nova</Text>
              </Text>
            ) : (
              <Text style={styles.brand}>{storeName}</Text>
            )}
            <Text style={styles.slogan}>Innovación en tecnología para tu día a día</Text>
          </View>
          <View style={styles.quoteBox}>
            <Text style={styles.quoteNumber}>COTIZACIÓN {quoteNumber}</Text>
            <Text style={styles.quoteDate}>{date}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.customerBox}>
          <Text style={styles.sectionTitle}>Datos del cliente</Text>
          <Text style={styles.customerLine}>{customer.nombre}</Text>
          <Text style={styles.customerLine}>Tel: {customer.telefono}</Text>
          <Text style={styles.customerLine}>
            {customer.direccion}, {customer.municipio}, {customer.departamento}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Productos</Text>
        <View style={styles.table}>
          <View style={[styles.tr, styles.trHead]}>
            <Text style={[styles.cName, styles.headCell]}>Producto</Text>
            <Text style={[styles.cQty, styles.headCell]}>Cantidad</Text>
            <Text style={[styles.cUnit, styles.headCell]}>Precio unit.</Text>
            <Text style={[styles.cSubtotal, styles.headCell]}>Subtotal</Text>
          </View>
          {items.map((item, i) => (
            <View style={styles.tr} key={i}>
              <Text style={styles.cName}>{item.name}</Text>
              <Text style={styles.cQty}>{item.qty}</Text>
              <Text style={styles.cUnit}>{formatUSD(item.unitPrice)}</Text>
              <Text style={styles.cSubtotal}>{formatUSD(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text>{formatUSD(subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Envío</Text>
            <Text>{shipping === 0 ? "GRATIS" : formatUSD(shipping)}</Text>
          </View>
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>{formatUSD(total)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Cotización válida por 7 días desde su fecha de emisión. Envío gratis en compras desde{" "}
          {formatUSD(SHIPPING_FREE_FROM)} a nivel nacional. Este documento es una cotización y no
          constituye una factura.
        </Text>
      </Page>
    </Document>
  );
}
