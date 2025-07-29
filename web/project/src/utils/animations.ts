import { Variants } from 'framer-motion';

// Optimized animation variants for better performance
export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    filter: 'blur(4px)'
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const fadeInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -30,
    filter: 'blur(4px)'
  },
  visible: { 
    opacity: 1, 
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const fadeInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 30,
    filter: 'blur(4px)'
  },
  visible: { 
    opacity: 1, 
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    filter: 'blur(4px)'
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const slideInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    filter: 'blur(4px)'
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// Staggered animations for lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    filter: 'blur(4px)'
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// Hover animations
export const hoverScale: Variants = {
  hover: { 
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  tap: { 
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

export const hoverLift: Variants = {
  hover: { 
    y: -5,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  tap: { 
    y: 0,
    transition: {
      duration: 0.1
    }
  }
};

// Loading animations
export const loadingPulse: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const loadingRotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Page transitions
export const pageTransition: Variants = {
  initial: { 
    opacity: 0,
    x: -20,
    filter: 'blur(4px)'
  },
  animate: { 
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0,
    x: 20,
    filter: 'blur(4px)',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// Card animations
export const cardHover: Variants = {
  hover: {
    y: -8,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

// Button animations
export const buttonTap: Variants = {
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

// Text animations
export const textReveal: Variants = {
  hidden: { 
    opacity: 0,
    y: 20,
    filter: 'blur(4px)'
  },
  visible: { 
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// Icon animations
export const iconBounce: Variants = {
  hover: {
    y: [-2, 2, -2],
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  }
};

// Modal animations
export const modalBackdrop: Variants = {
  hidden: { 
    opacity: 0,
    backdropFilter: 'blur(0px)'
  },
  visible: { 
    opacity: 1,
    backdropFilter: 'blur(4px)',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const modalContent: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    y: 20,
    filter: 'blur(4px)'
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}; 