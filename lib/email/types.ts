export interface OrderEmailInput {
  productTitle: string;
  productPrice: number;
  customerEmail: string | null;
  sessionId: string;
}

export interface CommissionEmailInput {
  inquiryId: string;
  name: string;
  email: string;
  projectType?: string;
  budgetRange?: string;
  timeline?: string;
  message: string;
}

export interface EmailProvider {
  readonly name: "mock" | "resend";
  sendOrderEmails(input: OrderEmailInput): Promise<void>;
  sendCommissionInquiry(input: CommissionEmailInput): Promise<void>;
}
