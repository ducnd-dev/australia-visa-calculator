import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { AllPathwayScores } from "@/lib/visa-rules/gsm/calculate-all-pathways";
import type { PointsResult } from "@/lib/visa-rules/types";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 16 },
  orgName: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  meta: { fontSize: 9, color: "#555", marginBottom: 2 },
  totalBox: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: "#f4f6f8",
    borderRadius: 4,
  },
  total: { fontSize: 22, fontWeight: "bold" },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginTop: 14, marginBottom: 6 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 4,
  },
  footer: { marginTop: 20, fontSize: 8, color: "#666", lineHeight: 1.4 },
  logo: { width: 100, height: 40, objectFit: "contain", marginBottom: 8 },
});

export type AssessmentPdfProps = {
  clientName: string;
  orgName: string;
  logoUrl: string | null;
  maraNumber: string | null;
  registeredBusinessName: string | null;
  phone: string | null;
  website: string | null;
  disclaimerFooter: string;
  lastUpdated: string;
  result: PointsResult;
  allPathways?: AllPathwayScores;
};

function AssessmentReportDocument(props: AssessmentPdfProps) {
  const {
    clientName,
    orgName,
    logoUrl,
    maraNumber,
    registeredBusinessName,
    phone,
    website,
    disclaimerFooter,
    lastUpdated,
    result,
    allPathways,
  } = props;

  return (
    <Document title={`Assessment — ${clientName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
          <Text style={styles.orgName}>{registeredBusinessName || orgName}</Text>
          {maraNumber ? <Text style={styles.meta}>MARA {maraNumber}</Text> : null}
          {phone ? <Text style={styles.meta}>{phone}</Text> : null}
          {website ? <Text style={styles.meta}>{website}</Text> : null}
          <Text style={styles.meta}>Client: {clientName}</Text>
          <Text style={styles.meta}>Subclass {result.visaSubclass} · Rules {lastUpdated}</Text>
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.total}>{result.total} points</Text>
          <Text style={styles.meta}>{result.tierMessage}</Text>
        </View>

        <Text style={styles.sectionTitle}>Schedule 6D breakdown</Text>
        {result.breakdown.map((line) => (
          <View key={line.category} style={styles.row}>
            <Text>{line.category}</Text>
            <Text>{line.points}</Text>
          </View>
        ))}

        {allPathways && allPathways.pathways.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>All GSM pathway scores</Text>
            {allPathways.pathways.map((p) => (
              <View key={p.code} style={styles.row}>
                <Text>Subclass {p.code}</Text>
                <Text>{p.total}</Text>
              </View>
            ))}
          </>
        ) : null}

        <Text style={styles.footer}>{disclaimerFooter}</Text>
      </Page>
    </Document>
  );
}

export async function renderAssessmentPdfBuffer(props: AssessmentPdfProps): Promise<Buffer> {
  const buf = await renderToBuffer(<AssessmentReportDocument {...props} />);
  return Buffer.from(buf);
}
