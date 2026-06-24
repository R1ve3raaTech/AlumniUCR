'use client';

import React from 'react';
import styles from './ChatbotAvatar.module.css';

interface ChatbotAvatarProps {
  className?: string;
  animated?: boolean;
  hovered?: boolean;
}

export default function ChatbotAvatar({ className = '', animated = true, hovered = false }: ChatbotAvatarProps) {
  const animatedClass = animated ? styles.animated : '';
  const hoveredClass = hovered ? styles.hovered : '';

  return (
    <div className={`${styles.avatarContainer} ${animatedClass} ${hoveredClass} ${className}`}>
      <svg
        viewBox="20 25 160 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.avatarSvg}
      >
        {/* ================= BACKGROUND BOOK COVER ================= */}
        {/* Left cover (Blue) */}
        <path
          d="M 20 170 C 50 178 80 174 100 170 L 100 30 C 80 34 50 28 20 30 Z"
          fill="#1e40af"
          stroke="#000000"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Right cover (Blue) */}
        <path
          d="M 100 170 C 120 174 150 178 180 170 L 180 30 C 150 28 120 34 100 30 Z"
          fill="#1e40af"
          stroke="#000000"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* ================= UNDERLYING FIXED PAGES ================= */}
        {/* Left page white sheet */}
        <path
          d="M 25 165 C 52 173 78 169 100 165 L 100 35 C 78 39 52 33 25 35 Z"
          fill="#ffffff"
          stroke="#000000"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Right page white sheet */}
        <path
          d="M 100 165 C 122 169 148 173 175 165 L 175 35 C 148 33 122 39 100 35 Z"
          fill="#ffffff"
          stroke="#000000"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* ================= FIXED LEFT PAGE TEXT ================= */}
        <g opacity="0.35">
          <line x1="40" y1="60" x2="85" y2="60" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
          <line x1="40" y1="80" x2="80" y2="80" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
          <line x1="40" y1="100" x2="85" y2="100" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
          <line x1="40" y1="120" x2="70" y2="120" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
          <line x1="40" y1="140" x2="80" y2="140" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* ================= FLIPPING PAGE (ACTION 1) ================= */}
        <g className={styles.flippingPageGroup}>
          {/* White page sheet */}
          <path
            d="M 100 165 C 122 169 148 173 175 165 L 175 35 C 148 33 122 39 100 35 Z"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Dummy text pattern 1 */}
          <g className={styles.textPattern1}>
            <line x1="115" y1="60" x2="160" y2="60" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
            <line x1="115" y1="80" x2="150" y2="80" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
            <line x1="115" y1="100" x2="165" y2="100" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
            <line x1="115" y1="120" x2="140" y2="120" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
            <line x1="115" y1="140" x2="155" y2="140" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
          </g>

          {/* Dummy text pattern 2 */}
          <g className={styles.textPattern2}>
            <line x1="115" y1="60" x2="145" y2="60" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
            <line x1="115" y1="80" x2="165" y2="80" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
            <line x1="115" y1="100" x2="135" y2="100" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
            <line x1="115" y1="120" x2="160" y2="120" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
            <line x1="115" y1="140" x2="140" y2="140" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
          </g>

          {/* Dummy text pattern 3 */}
          <g className={styles.textPattern3}>
            <line x1="115" y1="60" x2="165" y2="60" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
            <line x1="115" y1="80" x2="160" y2="80" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
            <line x1="115" y1="100" x2="150" y2="100" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
            <line x1="115" y1="120" x2="155" y2="120" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
            <line x1="115" y1="140" x2="145" y2="140" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
          </g>
        </g>

        {/* ================= BOOK SPINE ================= */}
        <line
          x1="100"
          y1="26"
          x2="100"
          y2="174"
          stroke="#000000"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* ================= LIGHT BULB (ACTION 2) ================= */}
        <g className={styles.bulbGroup}>
          {/* Ray lines */}
          <g className={styles.bulbRays}>
            {/* Top ray */}
            <line x1="137.5" y1="67" x2="137.5" y2="55" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
            {/* Top right ray */}
            <line x1="156.5" y1="76" x2="165.5" y2="67" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
            {/* Right ray */}
            <line x1="163.5" y1="95" x2="175.5" y2="95" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
            {/* Bottom right ray */}
            <line x1="156.5" y1="114" x2="165.5" y2="123" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
            {/* Top left ray */}
            <line x1="118.5" y1="76" x2="109.5" y2="67" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
            {/* Left ray */}
            <line x1="111.5" y1="95" x2="99.5" y2="95" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
            {/* Bottom left ray */}
            <line x1="118.5" y1="114" x2="109.5" y2="123" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Contact point */}
          <path
            d="M 132.5 135 A 5 5 0 0 0 142.5 135 Z"
            fill="#4b5563"
            stroke="#000000"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Screw base threads */}
          <path
            d="M 128.5 125 L 146.5 125 L 144.5 135 L 130.5 135 Z"
            fill="#9ca3af"
            stroke="#000000"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Glass bulb body */}
          <path
            d="M 119.5 95 A 18 18 0 1 1 155.5 95 C 155.5 105 148.5 111 146.5 116 L 146.5 125 L 128.5 125 L 128.5 116 C 126.5 111 119.5 105 119.5 95 Z"
            className={styles.bulbGlass}
            stroke="#000000"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Filament inside glass */}
          <path
            d="M 131.5 101 L 137.5 86 L 143.5 101"
            fill="none"
            stroke="#000000"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}
