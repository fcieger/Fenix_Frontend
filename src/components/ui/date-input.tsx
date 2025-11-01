'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function DateInput({
  value,
  onChange,
  placeholder = "Selecione uma data",
  label,
  icon,
  error,
  disabled = false,
  required = false,
  className = ""
}: DateInputProps) {
  // Função para formatar valor para exibição (dd/mm/aaaa)
  const formatValueForDisplay = (val: string) => {
    if (!val) return '';
    // Se o valor está em formato ISO (YYYY-MM-DD), formatar para dd/mm/aaaa
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const partes = val.split('-');
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    // Se já está formatado, usar diretamente
    return val;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(formatValueForDisplay(value));
  const [isValid, setIsValid] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Atualizar inputValue quando value prop muda
  useEffect(() => {
    setInputValue(formatValueForDisplay(value));
  }, [value]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const parseDate = (dateString: string) => {
    if (!dateString) return null;
    
    // Tentar diferentes formatos de data
    const formats = [
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
      /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
      /^(\d{2})-(\d{2})-(\d{4})$/ // DD-MM-YYYY
    ];

    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        const [, day, month, year] = match;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const parsedDate = parseDate(newValue);
    if (parsedDate) {
      const isoString = parsedDate.toISOString().split('T')[0];
      onChange(isoString);
      setIsValid(true);
    } else if (newValue === '') {
      onChange('');
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    const isoString = date.toISOString().split('T')[0];
    const formattedDate = formatDate(date);
    
    setInputValue(formattedDate);
    onChange(isoString);
    setIsOpen(false);
    setIsValid(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getCurrentMonthDates = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const currentDate = new Date(startDate);
    
    // Gerar 42 dias (6 semanas)
    for (let i = 0; i < 42; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!value) return false;
    const selectedDate = new Date(value);
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const dates = getCurrentMonthDates();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        <div
          className={`
            w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200 cursor-pointer
            ${error 
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
              : isValid 
                ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-gray-300' 
                : 'border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
            />
          </div>
          <ChevronDown 
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden"
            >
              {/* Header do calendário */}
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-violet-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {monthNames[new Date().getMonth()]} {new Date().getFullYear()}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {/* Lógica para mês anterior */}}
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => {/* Lógica para mês seguinte */}}
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>

              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-1 p-2 bg-gray-50">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid de datas */}
              <div className="grid grid-cols-7 gap-1 p-2 max-h-64 overflow-y-auto">
                {dates.map((date, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    onClick={() => handleDateSelect(date)}
                    className={`
                      p-2 text-sm rounded-lg transition-all duration-200 hover:scale-105
                      ${isSelected(date)
                        ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold shadow-lg'
                        : isToday(date)
                          ? 'bg-purple-100 text-purple-700 font-semibold border-2 border-purple-300'
                          : isCurrentMonth(date)
                            ? 'text-gray-900 hover:bg-purple-50 hover:text-purple-700'
                            : 'text-gray-400 hover:bg-gray-100'
                      }
                    `}
                  >
                    {date.getDate()}
                  </motion.button>
                ))}
              </div>

              {/* Footer com ações rápidas */}
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => handleDateSelect(new Date())}
                    className="px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    Hoje
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const nextWeek = new Date(today);
                      nextWeek.setDate(today.getDate() + 7);
                      handleDateSelect(nextWeek);
                    }}
                    className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    +7 dias
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const today = new Date();
                      const nextMonth = new Date(today);
                      nextMonth.setDate(today.getDate() + 30);
                      handleDateSelect(nextMonth);
                    }}
                    className="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    +30 dias
                  </button>
                  <button
                    onClick={() => {
                      setInputValue('');
                      onChange('');
                      setIsOpen(false);
                    }}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 flex items-center"
        >
          <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
          {error}
        </motion.p>
      )}
    </div>
  );
}


