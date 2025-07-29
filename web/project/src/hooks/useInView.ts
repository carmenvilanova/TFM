import { useInView as useFramerInView } from 'framer-motion';
import { useRef } from 'react';

export const useInView = (amount = 0.1) => {
  const ref = useRef(null);
  const isInView = useFramerInView(ref, {
    amount,
    once: true, // Only trigger once for better performance
    margin: "0px 0px -100px 0px" // Start animation slightly before element is fully visible
  });

  return { ref, isInView };
}; 