import React from "react";
import FiatCoinIcon from "@/components/FiatCoinIcon";

export { FiatCoinIcon };

interface CryptoIconProps {
  symbol: string;
  className?: string;
  size?: number;
}

const FIAT_CODES = new Set([
  "INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "BRL", "CNY",
  "IDR", "KRW", "PHP", "RUB", "MXN", "PLN", "TRY", "VND", "ARS",
  "PEN", "CLP", "NGN", "AED", "BHD", "CRC", "KWD", "MAD", "MYR",
  "QAR", "SAR", "SGD", "TND", "TWD", "GHS", "KES", "BOB", "XOF",
  "PKR", "NZD", "ISK", "BAM", "TZS", "EGP", "LKR", "UGX", "AZN",
  "KZT", "UAH", "GEL", "MNT", "GTQ", "KGS", "ZAR", "TMT", "ZMW",
  "TTD", "JMD", "NIO", "HNL", "MZN", "XAF", "GNF", "BWP", "KMF",
  "THB", "LSL", "ERN", "BIF", "MWK", "PGK"
]);

export default function CryptoIcon({ symbol, className = "w-5 h-5", size = 20 }: CryptoIconProps) {
  const s = symbol.toUpperCase();

  // If this symbol corresponds to a fiat currency, render the 3D metallic digital coin badge!
  if (FIAT_CODES.has(s) || s.startsWith("FIAT_")) {
    const cleanCode = s.replace(/^FIAT_/, "");
    return <FiatCoinIcon currency={cleanCode} className={className} size={size} />;
  }

  switch (s) {
    case "USDT":
      return (
        <svg viewBox="0 0 32 32" className={className} width={size} height={size} fill="none">
          <circle cx="16" cy="16" r="16" fill="#26A17B" />
          <path
            d="M17.8 17.5v6.5h-3.6v-6.5c-4 .3-7 1.1-7 2 0 1.2 4.4 2.1 9.8 2.1s9.8-.9 9.8-2.1c0-.9-3-1.7-7-2v-.8c4.2-.3 7.3-1.2 7.3-2.2 0-1.2-4.4-2.1-9.8-2.1s-9.8.9-9.8 2.1c0 1 3.1 1.9 7.3 2.2v.9zm0-5.7v-2.3h6.4V6H7.8v3.5h6.4v2.3c-4.4.2-7.8 1.1-7.8 2.2s3.4 2 7.8 2.2v.7c-4.5.2-8 1.2-8 2.3 0 1.5 4.6 2.7 10.4 2.7s10.4-1.2 10.4-2.7c0-1.1-3.5-2.1-8-2.3v-.7c4.4-.2 7.8-1.1 7.8-2.2s-3.4-2-7.8-2.2z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "BTC":
      return (
        <svg viewBox="0 0 32 32" className={className} width={size} height={size} fill="none">
          <circle cx="16" cy="16" r="16" fill="#F7931A" />
          <path
            d="M22.6 13.7c.3-2.1-1.3-3.2-3.5-3.9l.7-2.9-1.8-.4-.7 2.8c-.5-.1-1-.2-1.5-.3l.7-2.9-1.8-.4-.7 2.9c-.4-.1-.8-.2-1.2-.3l-2.5-.6-.5 2s1.3.3 1.3.3c.7.2.9.7.8 1.1l-2 7.8c-.1.2-.3.6-.8.4 0 0-1.3-.3-1.3-.3l-.9 2.1 2.4.6c.4.1.9.2 1.3.3l-.7 3 1.8.4.7-2.9c.5.1 1 .2 1.5.3l-.7 2.9 1.8.4.7-2.9c3.1.6 5.4.3 6.4-2.4.8-2.2 0-3.5-1.6-4.3 1.1-.3 2-1 2.2-2.5zm-3.9 5.5c-.6 2.3-4.4 1.1-5.6.8l1-4c1.2.3 5.2.9 4.6 3.2zm.6-5.6c-.5 2.1-3.7 1-4.7.8l.9-3.7c1 .2 4.3.7 3.8 2.9z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "ETH":
      return (
        <svg viewBox="0 0 32 32" className={className} width={size} height={size} fill="none">
          <circle cx="16" cy="16" r="16" fill="#627EEA" />
          <path d="M16 4l-.3.9v15.3l.3.3 7.1-4.2L16 4z" fill="#C0CBF7" />
          <path d="M16 4L8.9 16.3l7.1 4.2V4z" fill="#FFFFFF" />
          <path d="M16 21.8l-.2.2v5.7l.2.5 7.1-9.9-7.1 3.5z" fill="#C0CBF7" />
          <path d="M16 28.2v-6.4l-7.1-3.5 7.1 9.9z" fill="#FFFFFF" />
          <path d="M16 20.5l7.1-4.2-7.1-3.2v7.4z" fill="#8299F0" />
          <path d="M8.9 16.3l7.1 4.2v-7.4l-7.1 3.2z" fill="#C0CBF7" />
        </svg>
      );

    case "LTC":
      return (
        <svg viewBox="0 0 32 32" className={className} width={size} height={size} fill="none">
          <circle cx="16" cy="16" r="16" fill="#345D9D" />
          <path
            d="M12.8 19.3l1.4-5.2-2.5.9.6-2.2 2.5-.9 1.8-6.9h4.3l-1.5 5.8 2.8-1-.6 2.2-2.8 1-1.3 5h6.6l-.8 3.1H12l.8-3.1z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "SOL":
      return (
        <svg viewBox="0 0 32 32" className={className} width={size} height={size} fill="none">
          <circle cx="16" cy="16" r="16" fill="#000000" />
          <defs>
            <linearGradient id="solGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FFA3" />
              <stop offset="100%" stopColor="#DC1FFF" />
            </linearGradient>
          </defs>
          <path
            d="M8.8 20.9l2.7-2.7h11.7l-2.7 2.7H8.8zm0-6l2.7-2.7h11.7l-2.7 2.7H8.8zm2.7-8.7L8.8 8.9h11.7l2.7-2.7H11.5z"
            fill="url(#solGrad)"
          />
        </svg>
      );

    case "DOGE":
      return (
        <svg viewBox="0 0 32 32" className={className} width={size} height={size} fill="none">
          <circle cx="16" cy="16" r="16" fill="#C2A633" />
          <path
            d="M11 8h5.8c4.2 0 7.2 2.6 7.2 8s-3 8-7.2 8H11V8zm4.3 12.8h1.2c2.4 0 3.7-1.7 3.7-4.8 0-3.2-1.3-4.8-3.7-4.8h-1.2v9.6zm-5-4.8h5.6v-2.2H10.3v2.2z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "BCH":
      return (
        <svg viewBox="0 0 32 32" className={className} width={size} height={size} fill="none">
          <circle cx="16" cy="16" r="16" fill="#0AC18E" />
          <path
            d="M21.5 13.8c.3-1.8-1.1-2.8-3-3.4l.6-2.5-1.5-.4-.6 2.4c-.4-.1-.9-.2-1.3-.2l.6-2.5-1.5-.4-.6 2.5c-.4-.1-.7-.2-1-.2l-2.1-.5-.4 1.7s1.1.3 1.1.3c.6.2.8.6.7 1l-1.7 6.7c-.1.2-.3.5-.7.4 0 0-1.1-.3-1.1-.3l-.8 1.8 2 .5c.4.1.8.2 1.1.2l-.6 2.6 1.5.4.6-2.5c.4.1.9.2 1.3.2l-.6 2.5 1.5.4.6-2.5c2.7.5 4.7.3 5.5-2.1.7-1.9 0-3-1.4-3.7.9-.3 1.7-.9 1.9-2.2zm-3.4 4.7c-.5 2-3.8 1-4.8.7l.9-3.4c1 .3 4.5.8 3.9 2.7zm.5-4.8c-.4 1.8-3.2.9-4.1.7l.8-3.2c.9.2 3.7.6 3.3 2.5z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "XRP":
      return (
        <svg viewBox="0 0 32 32" className={className} width={size} height={size} fill="none">
          <circle cx="16" cy="16" r="16" fill="#23292F" />
          <path
            d="M22.8 8.5c-.6 0-1.2.3-1.7.7l-5.1 5.1-5.1-5.1c-.4-.4-1-.7-1.7-.7s-1.2.3-1.7.7c-.9.9-.9 2.5 0 3.4l6.8 6.8c.4.4 1 .7 1.7.7s1.2-.3 1.7-.7l6.8-6.8c.9-.9.9-2.5 0-3.4-.4-.5-1-.7-1.7-.7zM9.2 23.5c.6 0 1.2-.3 1.7-.7l5.1-5.1 5.1 5.1c.4.4 1 .7 1.7.7s1.2-.3 1.7-.7c.9-.9.9-2.5 0-3.4l-6.8-6.8c-.4-.4-1-.7-1.7-.7s-1.2.3-1.7.7l-6.8 6.8c-.9.9-.9 2.5 0 3.4.4.5 1 .7 1.7.7z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "TRX":
      return (
        <svg viewBox="0 0 32 32" className={className} width={size} height={size} fill="none">
          <circle cx="16" cy="16" r="16" fill="#EF0027" />
          <path
            d="M7 8l16 3-8 13L7 8zm2.8 1.9l5.4 9.1 5.5-8.9-10.9-.2zm6.7 10.3l3.6-5.8-3.6 5.8z"
            fill="#FFFFFF"
          />
        </svg>
      );

    default:
      return (
        <div className={`rounded-full bg-[#00e701]/20 text-[#00e701] flex items-center justify-center font-black text-[10px] ${className}`}>
          {s.slice(0, 2)}
        </div>
      );
  }
}
