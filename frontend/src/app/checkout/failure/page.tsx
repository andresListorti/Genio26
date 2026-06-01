import { Suspense } from "react";
import CheckoutResult, {
  CheckoutResultFallback,
} from "@/components/CheckoutResult";

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={<CheckoutResultFallback />}>
      <CheckoutResult variant="failure" />
    </Suspense>
  );
}
