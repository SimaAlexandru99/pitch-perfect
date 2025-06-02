import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: "#333",
  },
  score: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: 20,
    color: "#2563eb",
  },
  category: {
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#e5e7eb",
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563eb",
  },
  metrics: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  metric: {
    width: "45%",
    marginBottom: 15,
  },
  metricTitle: {
    fontSize: 12,
    color: "#666",
  },
  metricValue: {
    fontSize: 16,
    marginTop: 5,
  },
  list: {
    marginLeft: 20,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 5,
  },
});

interface FeedbackPDFProps {
  feedback: Feedback;
  jobTitle: string;
  domain: string;
  level: string;
}

export function FeedbackPDF({
  feedback,
  jobTitle,
  domain,
  level,
}: FeedbackPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Practice Feedback Report</Text>
          <Text style={styles.subtitle}>
            {jobTitle} - {domain} ({level})
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.score}>{feedback.totalScore}</Text>
          <Text style={styles.sectionTitle}>Performance by Category</Text>
          {feedback.categoryScores.map((category) => (
            <View key={category.name} style={styles.category}>
              <Text style={styles.categoryTitle}>
                {category.name} - {category.score}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${category.score}%` }]}
                />
              </View>
              <Text style={styles.listItem}>{category.comment}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Call Metrics</Text>
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={styles.metricTitle}>Total Duration</Text>
              <Text style={styles.metricValue}>
                {Math.round(feedback.metrics.totalDuration)}s
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricTitle}>User Speaking Time</Text>
              <Text style={styles.metricValue}>
                {Math.round(feedback.metrics.userSpeakingTime)}s
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricTitle}>AI Speaking Time</Text>
              <Text style={styles.metricValue}>
                {Math.round(feedback.metrics.aiSpeakingTime)}s
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricTitle}>Silence Time</Text>
              <Text style={styles.metricValue}>
                {Math.round(feedback.metrics.silenceTime)}s
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricTitle}>Interruptions</Text>
              <Text style={styles.metricValue}>
                {feedback.metrics.interruptions}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Strengths</Text>
          <View style={styles.list}>
            {feedback.strengths.map((strength, index) => (
              <Text key={index} style={styles.listItem}>
                • {strength}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas for Improvement</Text>
          <View style={styles.list}>
            {feedback.areasForImprovement.map((area, index) => (
              <Text key={index} style={styles.listItem}>
                • {area}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <Text style={styles.categoryTitle}>Short-term Improvements</Text>
          <View style={styles.list}>
            {feedback.recommendations.shortTerm.map((item, index) => (
              <Text key={index} style={styles.listItem}>
                • {item}
              </Text>
            ))}
          </View>
          <Text style={styles.categoryTitle}>Long-term Goals</Text>
          <View style={styles.list}>
            {feedback.recommendations.longTerm.map((item, index) => (
              <Text key={index} style={styles.listItem}>
                • {item}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Final Assessment</Text>
          <Text style={styles.listItem}>{feedback.finalAssessment}</Text>
        </View>
      </Page>
    </Document>
  );
}
