"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Transaction {
  status: boolean;
  message: string;
  transactionReference: string;
  transactionStatus: "success" | "failed";
  paymentStatus: "paid" | "not paid";
  product: {
    name: string;
    amount: number;
  };
  user: {
    name: string;
    email: string;
  };
}

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) return;

    const fetchTransaction = async () => {
      try {
        const res = await axios.get<Transaction>(
          `http://localhost:4000/transactions/${reference}`,
          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYzZkZDYyNi1mOWJiLTQ3YzMtOTI3MC03YzgxODdlODJjMDciLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImZhbGFkZXl1c3VmNTRAZ21haWwuY29tIiwiaWF0IjoxNzU0MzE0ODA5LCJleHAiOjE3NTQzMTg0MDksImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDAwMCIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDAwMCJ9.85i3Cm1vqgdjb1F9PuBc4FZq7uSRqRlUZ63lDVkvCmk`,
            },
          }
        );

        setTransaction(res.data);
      } catch (error) {
        console.error("Error fetching transaction:", error);
        setError("Failed to load transaction.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [reference]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Verifying your payment...
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Failed</h1>
        <p className="mb-2">{error || "Transaction not found or failed."}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const isSuccess = transaction.paymentStatus === "paid";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      {isSuccess ? (
        <>
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            🎉 Payment Successful!
          </h1>
          <p className="mb-2">
            You've successfully paid for{" "}
            <strong>{transaction.product.name}</strong>.
          </p>
          <p className="mb-2">Amount: ₦{transaction.product.amount / 100}</p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Payment Failed
          </h1>
          <p className="mb-2">
            Something went wrong with your transaction. Please try again.
          </p>
        </>
      )}
      <button
        onClick={() => router.push("/")}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Go Back Home
      </button>
    </div>
  );
}
