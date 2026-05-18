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

interface OrderNotificationEmailProps {
  productTitle: string;
  productPrice: number;
  customerEmail: string | null;
  sessionId: string;
}

/**
 * Internal notification to Kelly when a sale completes. Plain, fast,
 * full information.
 */
export function OrderNotificationEmail({
  productTitle,
  productPrice,
  customerEmail,
  sessionId,
}: OrderNotificationEmailProps) {
  return (
    <Html>
      <Preview>Sold: {productTitle}</Preview>
      <Tailwind>
        <Body className="bg-white text-[#1a1d24] font-sans">
          <Container className="max-w-xl mx-auto px-6 py-10">
            <Heading className="font-serif text-2xl font-light">
              Sold — {productTitle}
            </Heading>

            <Section className="mt-8">
              <Text className="m-0">
                <strong>Price:</strong> ${productPrice.toLocaleString("en-US")}
              </Text>
              <Text className="m-0 mt-2">
                <strong>Customer:</strong>{" "}
                {customerEmail ?? "(email not collected at checkout)"}
              </Text>
              <Text className="m-0 mt-2">
                <strong>Session:</strong> {sessionId}
              </Text>
            </Section>

            <Text className="text-sm text-[#3a3d44] mt-10">
              Inventory has been marked as sold in Sanity. Customer received their
              confirmation email automatically.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default OrderNotificationEmail;
