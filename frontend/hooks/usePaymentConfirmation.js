import axios from "axios";
import React, { useEffect } from "react";

const usePaymentConfirmation = (razorpayOrderId, setPaymentStatus, setPaymentFailed) => {
   useEffect(() => {
      if (!razorpayOrderId) return;

      let elapsedTime = 0;
      const interval = 5000;
      const maxTime = 180000;

      const paymentConfirmationInteval = setInterval(async () => {
         try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/payment/status/${razorpayOrderId}`);
            const data = response.data;

            if (data.status === "paid") {
               setPaymentStatus(true);
               console.log("Payment Done");
               clearInterval(paymentConfirmationInteval);
            }
         } catch (error) {
            console.log(error);
         }

         elapsedTime += interval;
         if (elapsedTime >= maxTime) {
            setPaymentFailed(true);
            setPaymentStatus(false);
            clearInterval(paymentConfirmationInteval);
         }
      }, interval);

      return () => clearInterval(paymentConfirmationInteval);
   }, [razorpayOrderId]);
};

export default usePaymentConfirmation;
