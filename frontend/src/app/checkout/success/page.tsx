import { Suspense } from "react";
import CheckoutResult, {
  CheckoutResultFallback,
} from "@/components/CheckoutResult";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutResultFallback />}>
      <CheckoutResult variant="success" />
    </Suspense>
  );
}
