/**
 * CertificatePDF.tsx
 * APASIFIC Certificate of Achievement — A4 Landscape layout
 * Library: @react-pdf/renderer
 *
 * Install: npm install @react-pdf/renderer
 */

import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Register fonts for premium look
Font.register({
  family: "Playfair",
  fonts: [
    { src: "https://fonts.gstatic.com/s/playfairdisplay/v30/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYh44.ttf", fontWeight: "normal" },
    { src: "https://fonts.gstatic.com/s/playfairdisplay/v30/nuFkD-vYSZviVYUb_rj3ij__anPXBYf9lW4e-Q.ttf", fontWeight: "bold" },
  ],
});

Font.register({
  family: "Lato",
  fonts: [
    { src: "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXg.ttf", fontWeight: "normal" },
    { src: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPGQ.ttf", fontWeight: "bold" },
  ],
});

const GOLD = "#c9a84c";
const DARK = "#0d0d1a";
const DARK_BG = "#05050a";
const GRAY = "#6b7280";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    flexDirection: "column",
    paddingTop: 0,
    paddingBottom: 0,
  },
  // Top gold bar
  topBar: {
    height: 10,
    backgroundColor: GOLD,
    width: "100%",
  },
  // Main content area
  content: {
    flex: 1,
    paddingHorizontal: 56,
    paddingVertical: 36,
    alignItems: "center",
  },
  // Side border lines
  leftBorder: {
    position: "absolute",
    left: 20,
    top: 10,
    bottom: 10,
    width: 2,
    backgroundColor: GOLD,
    opacity: 0.3,
  },
  rightBorder: {
    position: "absolute",
    right: 20,
    top: 10,
    bottom: 10,
    width: 2,
    backgroundColor: GOLD,
    opacity: 0.3,
  },
  // Organization name
  orgName: {
    fontFamily: "Lato",
    fontWeight: "bold",
    fontSize: 10,
    color: GOLD,
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 4,
    textAlign: "center",
  },
  orgSub: {
    fontFamily: "Lato",
    fontSize: 7,
    color: GRAY,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 20,
    textAlign: "center",
  },
  // Thin divider
  divider: {
    width: 60,
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.5,
    marginBottom: 20,
  },
  // Title
  certTitle: {
    fontFamily: "Playfair",
    fontWeight: "normal",
    fontSize: 11,
    color: GRAY,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 8,
    textAlign: "center",
  },
  certOf: {
    fontFamily: "Playfair",
    fontWeight: "bold",
    fontSize: 28,
    color: DARK,
    textAlign: "center",
    marginBottom: 16,
  },
  // Recipient
  awardedTo: {
    fontFamily: "Lato",
    fontSize: 8,
    color: GRAY,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
    textAlign: "center",
  },
  recipientName: {
    fontFamily: "Playfair",
    fontWeight: "bold",
    fontSize: 32,
    color: DARK,
    textAlign: "center",
    marginBottom: 6,
  },
  recipientNameLine: {
    width: 200,
    height: 1.5,
    backgroundColor: GOLD,
    marginBottom: 16,
  },
  // Certification info
  certField: {
    fontFamily: "Lato",
    fontSize: 9,
    color: GRAY,
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 4,
  },
  certFieldValue: {
    fontFamily: "Playfair",
    fontWeight: "bold",
    fontSize: 14,
    color: GOLD,
    textAlign: "center",
    marginBottom: 20,
  },
  // Bottom row: credential + dates + QR
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: "auto",
  },
  credBlock: {
    flex: 1,
  },
  credLabel: {
    fontFamily: "Lato",
    fontSize: 7,
    color: GRAY,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  credNumber: {
    fontFamily: "Lato",
    fontWeight: "bold",
    fontSize: 9,
    color: DARK,
    letterSpacing: 0.5,
  },
  dateBlock: {
    flex: 1,
    alignItems: "center",
  },
  signatureBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  signatureLine: {
    width: 100,
    height: 1,
    backgroundColor: DARK,
    opacity: 0.3,
    marginBottom: 4,
  },
  signatureLabel: {
    fontFamily: "Lato",
    fontSize: 7,
    color: GRAY,
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "center",
    width: 100,
  },
  bottomBar: {
    height: 10,
    backgroundColor: DARK_BG,
    width: "100%",
  },
  // QR code placeholder (actual QR added in route handler)
  qrBox: {
    width: 50,
    height: 50,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  qrLabel: {
    fontFamily: "Lato",
    fontSize: 5,
    color: GRAY,
    textAlign: "center",
  },
});

export type CertificatePDFProps = {
  holderName: string;
  certificationField: string;
  credentialNumber: string;
  issuedAt: string;
  expiredAt: string;
  issuedBy?: string;
  verificationUrl?: string;
  qrCodeDataUrl?: string; // Base64 QR code image
};

export function CertificatePDF({
  holderName,
  certificationField,
  credentialNumber,
  issuedAt,
  expiredAt,
  issuedBy = "APASIFIC Secretariat",
  verificationUrl,
  qrCodeDataUrl,
}: CertificatePDFProps) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Document
      title={`APASIFIC Certificate — ${holderName}`}
      author="APASIFIC"
      subject={`${certificationField} Certification`}
      creator="APASIFIC Certification Platform"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Top gold bar */}
        <View style={styles.topBar} />

        {/* Side borders */}
        <View style={styles.leftBorder} />
        <View style={styles.rightBorder} />

        {/* Main content */}
        <View style={styles.content}>
          {/* Organization */}
          <Text style={styles.orgName}>APASIFIC</Text>
          <Text style={styles.orgSub}>Asian Pacific Association for Social Inclusion &amp; Certification</Text>

          <View style={styles.divider} />

          {/* Certificate title */}
          <Text style={styles.certTitle}>This is to certify that</Text>
          <Text style={styles.awardedTo}>the following individual has successfully fulfilled all requirements for</Text>

          {/* Recipient */}
          <Text style={styles.recipientName}>{holderName}</Text>
          <View style={styles.recipientNameLine} />

          <Text style={styles.certField}>Has been awarded the certification of</Text>
          <Text style={styles.certFieldValue}>{certificationField}</Text>

          {/* Bottom info row */}
          <View style={styles.bottomRow}>
            {/* Credential info */}
            <View style={styles.credBlock}>
              <Text style={styles.credLabel}>Credential Number</Text>
              <Text style={styles.credNumber}>{credentialNumber}</Text>
              <Text style={[styles.credLabel, { marginTop: 8 }]}>Issued</Text>
              <Text style={styles.credNumber}>{fmt(issuedAt)}</Text>
              <Text style={[styles.credLabel, { marginTop: 4 }]}>Valid Until</Text>
              <Text style={styles.credNumber}>{fmt(expiredAt)}</Text>
            </View>

            {/* QR Code */}
            <View style={styles.dateBlock}>
              {qrCodeDataUrl ? (
                <Image src={qrCodeDataUrl} style={{ width: 60, height: 60 }} />
              ) : (
                <View style={styles.qrBox}>
                  <Text style={styles.qrLabel}>Scan to{"\n"}Verify</Text>
                </View>
              )}
              <Text style={[styles.qrLabel, { marginTop: 4, fontSize: 6 }]}>Scan to verify</Text>
            </View>

            {/* Signature */}
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>{issuedBy}</Text>
              <Text style={[styles.signatureLabel, { marginTop: 2, color: GOLD }]}>APASIFIC</Text>
            </View>
          </View>
        </View>

        {/* Bottom dark bar */}
        <View style={styles.bottomBar} />
      </Page>
    </Document>
  );
}
