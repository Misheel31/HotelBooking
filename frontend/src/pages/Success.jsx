import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [sessionDetails, setSessionDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId) {
      const timer = setTimeout(() => {
        navigate("/my-booking");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [sessionId, navigate]);

  return (
    <div className="text-center mt-10">
      <h1 className="text-green-600 text-3xl font-bold mb-4">
        Payment Successful!
      </h1>
      <p>
        Your payment session ID is: <code>{sessionId}</code>
      </p>
      <p>Redirecting to your bookings...</p>
    </div>
  );
};

export default SuccessPage;
