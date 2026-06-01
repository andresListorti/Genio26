import { Suspense } from "react";
import CheckoutResult, {
  CheckoutResultFallback,
} from "@/components/CheckoutResult";

export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={<CheckoutResultFallback />}>
      <CheckoutResult variant="pending" />
    </Suspense>
  );
}
