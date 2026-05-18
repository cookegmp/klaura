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

interface OrderConfirmationEmailProps {
  productTitle: string;
  productPrice: number;
  customerName?: string;
  sessionId: string;
  siteUrl?: string;
}

export function OrderConfirmationEmail({
  productTitle,
  productPrice,
  customerName,
  sessionId,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Preview>Your piece is on its way — {productTitle}</Preview>
      <Tailwind>
        <Body className="bg-[#f4efe6] text-[#1a1d24] font-sans">
          <Container className="max-w-xl mx-auto px-6 py-10">
            <Heading className="font-serif text-3xl font-light tracking-tight">
              Thank you{customerName ? `, ${customerName}` : ""}.
            </Heading>
            <Text className="text-lg text-[#3a3d44] leading-relaxed mt-4">
              Your piece is on its way.
            </Text>

            <Section className="mt-10 border-t border-[#d9d1bf] pt-8">
              <Text className="text-xs uppercase tracking-wider text-[#3a3d44] mb-2">
                Order
              </Text>
              <Text className="font-serif text-2xl text-[#1a1d24] m-0">
                {productTitle}
              </Text>
              <Text className="text-xl text-[#1a1d24] mt-2 m-0">
                ${productPrice.toLocaleString("en-US")}
              </Text>
            </Section>

            <Text className="text-[#3a3d44] mt-10 leading-relaxed">
              Kelly will reach out within a few days with shipping details. If you have
              any questions in the meantime, simply reply to this email.
            </Text>

            <Text className="text-xs text-[#3a3d44]/70 mt-12">
              Reference: {sessionId}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default OrderConfirmationEmail;
