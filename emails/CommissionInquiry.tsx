import {
  Body,
  Container,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface CommissionInquiryEmailProps {
  inquiryId: string;
  name: string;
  email: string;
  projectType?: string;
  budgetRange?: string;
  timeline?: string;
  message: string;
}

export function CommissionInquiryEmail({
  inquiryId,
  name,
  email,
  projectType,
  budgetRange,
  timeline,
  message,
}: CommissionInquiryEmailProps) {
  return (
    <Html>
      <Preview>Commission inquiry — {name}</Preview>
      <Tailwind>
        <Body className="bg-white text-[#1a1d24] font-sans">
          <Container className="max-w-xl mx-auto px-6 py-10">
            <Heading className="font-serif text-2xl font-light">
              Commission inquiry — {name}
            </Heading>

            <Section className="mt-8 space-y-2">
              <Text className="m-0">
                <strong>From:</strong> {name} &lt;{email}&gt;
              </Text>
              {projectType && (
                <Text className="m-0">
                  <strong>Project type:</strong> {projectType}
                </Text>
              )}
              {budgetRange && (
                <Text className="m-0">
                  <strong>Budget:</strong> {budgetRange}
                </Text>
              )}
              {timeline && (
                <Text className="m-0">
                  <strong>Timeline:</strong> {timeline}
                </Text>
              )}
            </Section>

            <Section className="mt-8 border-t border-[#d9d1bf] pt-8">
              <Text className="text-xs uppercase tracking-wider text-[#3a3d44] mb-2">
                Message
              </Text>
              <Text className="whitespace-pre-wrap leading-relaxed">{message}</Text>
            </Section>

            <Text className="text-xs text-[#3a3d44]/70 mt-12">
              Inquiry ID: {inquiryId}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default CommissionInquiryEmail;
