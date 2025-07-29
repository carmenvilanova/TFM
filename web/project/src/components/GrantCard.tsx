import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Tag } from 'lucide-react';
import { GrantCall } from '../types/chat';
import { cardHover, scaleIn, hoverScale, textReveal } from '../utils/animations';

interface GrantCardProps {
  grant: GrantCall;
  onSelect: (grant: GrantCall) => void;
}

export const GrantCard: React.FC<GrantCardProps> = ({ grant, onSelect }) => {
  return (
    <motion.div 
      className="bg-white border border-amber-200 rounded-lg p-5 cursor-pointer hover:border-red-300"
      initial="hidden"
      animate="visible"
      variants={cardHover}
      whileHover="hover"
      whileTap="tap"
      onClick={() => onSelect(grant)}
    >
      <div className="flex justify-between items-start mb-3">
        <motion.h3 
          className="font-semibold text-gray-800 text-lg line-clamp-2"
          variants={textReveal}
        >
          {grant.title}
        </motion.h3>
        <motion.span 
          className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium"
          variants={scaleIn}
          whileHover={{ scale: 1.05, backgroundColor: "#fecaca" }}
          transition={{ duration: 0.2 }}
        >
          {grant.category}
        </motion.span>
      </div>
      
      <motion.p 
        className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed"
        variants={textReveal}
      >
        {grant.description}
      </motion.p>
      
      <motion.div 
        className="flex items-center gap-6 text-sm text-gray-500 mb-5"
        variants={textReveal}
      >
        <motion.div 
          className="flex items-center gap-1"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <DollarSign className="w-4 h-4 text-amber-600" />
          <span>{grant.amount}</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-1"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Calendar className="w-4 h-4 text-red-600" />
          <span>{grant.deadline}</span>
        </motion.div>
      </motion.div>
      
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(grant);
        }}
        className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium shadow-md"
        variants={hoverScale}
        whileHover="hover"
        whileTap="tap"
      >
        Consultar Esta Ayuda
      </motion.button>
    </motion.div>
  );
};