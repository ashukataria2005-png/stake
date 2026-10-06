export interface CryptoCurrency {
  id: string;
  name: string;
  symbol: string;
  rateUsd: number;
  iconBg: string;
  accentColor: string;
  decimals: number;
}

export interface FiatCurrency {
  code: string;
  name: string;
  flag: string;
  symbol: string;
  ratePerUsd: number;
  isPrimary?: boolean;
}

// ============================================================
// 9 CRYPTOCURRENCIES (Exact Stake Ordering & Visual Styling)
// ============================================================
export const CRYPTO_CURRENCIES: CryptoCurrency[] = [
  {
    id: "USDT",
    name: "Tether",
    symbol: "₮",
    rateUsd: 1.0,
    iconBg: "bg-[#26a17b]/20 text-[#26a17b] border-[#26a17b]/40",
    accentColor: "#26a17b",
    decimals: 2,
  },
  {
    id: "BTC",
    name: "Bitcoin",
    symbol: "₿",
    rateUsd: 68500.0,
    iconBg: "bg-[#f7931a]/20 text-[#f7931a] border-[#f7931a]/40",
    accentColor: "#f7931a",
    decimals: 8,
  },
  {
    id: "ETH",
    name: "Ethereum",
    symbol: "Ξ",
    rateUsd: 3520.0,
    iconBg: "bg-[#627eea]/20 text-[#627eea] border-[#627eea]/40",
    accentColor: "#627eea",
    decimals: 8,
  },
  {
    id: "LTC",
    name: "Litecoin",
    symbol: "Ł",
    rateUsd: 84.5,
    iconBg: "bg-[#345d9d]/20 text-[#345d9d] border-[#345d9d]/40",
    accentColor: "#345d9d",
    decimals: 8,
  },
  {
    id: "SOL",
    name: "Solana",
    symbol: "◎",
    rateUsd: 185.0,
    iconBg: "bg-[#14f195]/20 text-[#14f195] border-[#14f195]/40",
    accentColor: "#14f195",
    decimals: 8,
  },
  {
    id: "DOGE",
    name: "Dogecoin",
    symbol: "Ð",
    rateUsd: 0.165,
    iconBg: "bg-[#c2a633]/20 text-[#c2a633] border-[#c2a633]/40",
    accentColor: "#c2a633",
    decimals: 8,
  },
  {
    id: "BCH",
    name: "Bitcoin Cash",
    symbol: "Ƀ",
    rateUsd: 420.0,
    iconBg: "bg-[#0ac18e]/20 text-[#0ac18e] border-[#0ac18e]/40",
    accentColor: "#0ac18e",
    decimals: 8,
  },
  {
    id: "XRP",
    name: "Ripple",
    symbol: "✕",
    rateUsd: 0.62,
    iconBg: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    accentColor: "#94a3b8",
    decimals: 8,
  },
  {
    id: "TRX",
    name: "Tron",
    symbol: "♦",
    rateUsd: 0.145,
    iconBg: "bg-[#ef0027]/20 text-[#ef0027] border-[#ef0027]/40",
    accentColor: "#ef0027",
    decimals: 8,
  },
];

// ============================================================
// FIAT CURRENCIES (Primary Tier & Extended Tier with Flags)
// ============================================================
export const PRIMARY_FIAT_CURRENCIES: FiatCurrency[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", symbol: "$", ratePerUsd: 1.0, isPrimary: true },
  { code: "EUR", name: "Euro", flag: "🇪🇺", symbol: "€", ratePerUsd: 0.92, isPrimary: true },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", symbol: "¥", ratePerUsd: 154.5, isPrimary: true },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳", symbol: "₹", ratePerUsd: 87.2, isPrimary: true },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", symbol: "$", ratePerUsd: 1.38, isPrimary: true },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳", symbol: "¥", ratePerUsd: 7.25, isPrimary: true },
  { code: "IDR", name: "Indonesian Rupiah", flag: "🇮🇩", symbol: "Rp", ratePerUsd: 16250, isPrimary: true },
  { code: "KRW", name: "South Korean Won", flag: "🇰🇷", symbol: "₩", ratePerUsd: 1380, isPrimary: true },
  { code: "PHP", name: "Philippine Peso", flag: "🇵🇭", symbol: "₱", ratePerUsd: 58.4, isPrimary: true },
  { code: "RUB", name: "Russian Ruble", flag: "🇷🇺", symbol: "₽", ratePerUsd: 96.5, isPrimary: true },
  { code: "MXN", name: "Mexican Peso", flag: "🇲🇽", symbol: "$", ratePerUsd: 19.8, isPrimary: true },
  { code: "PLN", name: "Polish Złoty", flag: "🇵🇱", symbol: "zł", ratePerUsd: 3.98, isPrimary: true },
  { code: "TRY", name: "Turkish Lira", flag: "🇹🇷", symbol: "₺", ratePerUsd: 34.2, isPrimary: true },
  { code: "VND", name: "Vietnamese Dong", flag: "🇻🇳", symbol: "₫", ratePerUsd: 25400, isPrimary: true },
  { code: "ARS", name: "Argentine Peso", flag: "🇦🇷", symbol: "$", ratePerUsd: 980, isPrimary: true },
  { code: "PEN", name: "Peruvian Sol", flag: "🇵🇪", symbol: "S/", ratePerUsd: 3.75, isPrimary: true },
  { code: "CLP", name: "Chilean Peso", flag: "🇨🇱", symbol: "$", ratePerUsd: 940, isPrimary: true },
  { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬", symbol: "₦", ratePerUsd: 1650, isPrimary: true },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪", symbol: "AED", ratePerUsd: 3.67, isPrimary: true },
  { code: "BHD", name: "Bahraini Dinar", flag: "🇧🇭", symbol: "BD", ratePerUsd: 0.38, isPrimary: true },
  { code: "CRC", name: "Costa Rican Colón", flag: "🇨🇷", symbol: "₡", ratePerUsd: 515, isPrimary: true },
  { code: "KWD", name: "Kuwaiti Dinar", flag: "🇰🇼", symbol: "KD", ratePerUsd: 0.31, isPrimary: true },
  { code: "MAD", name: "Moroccan Dirham", flag: "🇲🇦", symbol: "DH", ratePerUsd: 9.85, isPrimary: true },
  { code: "MYR", name: "Malaysian Ringgit", flag: "🇲🇾", symbol: "RM", ratePerUsd: 4.42, isPrimary: true },
];

export const EXTENDED_FIAT_CURRENCIES: FiatCurrency[] = [
  { code: "QAR", name: "Qatari Riyal", flag: "🇶🇦", symbol: "QR", ratePerUsd: 3.64 },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦", symbol: "SR", ratePerUsd: 3.75 },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬", symbol: "$", ratePerUsd: 1.34 },
  { code: "TND", name: "Tunisian Dinar", flag: "🇹🇳", symbol: "DT", ratePerUsd: 3.12 },
  { code: "TWD", name: "New Taiwan Dollar", flag: "🇹🇼", symbol: "NT$", ratePerUsd: 32.1 },
  { code: "GHS", name: "Ghanaian Cedi", flag: "🇬🇭", symbol: "GH₵", ratePerUsd: 15.6 },
  { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪", symbol: "KSh", ratePerUsd: 129 },
  { code: "BOB", name: "Bolivian Boliviano", flag: "🇧🇴", symbol: "Bs", ratePerUsd: 6.91 },
  { code: "XOF", name: "West African CFA", flag: "🌍", symbol: "CFA", ratePerUsd: 603 },
  { code: "PKR", name: "Pakistani Rupee", flag: "🇵🇰", symbol: "₨", ratePerUsd: 278 },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿", symbol: "$", ratePerUsd: 1.68 },
  { code: "ISK", name: "Icelandic Króna", flag: "🇮🇸", symbol: "kr", ratePerUsd: 138 },
  { code: "BAM", name: "Bosnia Mark", flag: "🇧🇦", symbol: "KM", ratePerUsd: 1.80 },
  { code: "TZS", name: "Tanzanian Shilling", flag: "🇹🇿", symbol: "TSh", ratePerUsd: 2700 },
  { code: "EGP", name: "Egyptian Pound", flag: "🇪🇬", symbol: "E£", ratePerUsd: 48.6 },
  { code: "LKR", name: "Sri Lankan Rupee", flag: "🇱🇰", symbol: "Rs", ratePerUsd: 298 },
  { code: "UGX", name: "Ugandan Shilling", flag: "🇺🇬", symbol: "USh", ratePerUsd: 3680 },
  { code: "AZN", name: "Azerbaijani Manat", flag: "🇦🇿", symbol: "₼", ratePerUsd: 1.70 },
  { code: "KZT", name: "Kazakhstani Tenge", flag: "🇰🇿", symbol: "₸", ratePerUsd: 485 },
  { code: "UAH", name: "Ukrainian Hryvnia", flag: "🇺🇦", symbol: "₴", ratePerUsd: 41.2 },
  { code: "GEL", name: "Georgian Lari", flag: "🇬🇪", symbol: "₾", ratePerUsd: 2.74 },
  { code: "MNT", name: "Mongolian Tögrög", flag: "🇲🇳", symbol: "₮", ratePerUsd: 3400 },
  { code: "GTQ", name: "Guatemalan Quetzal", flag: "🇬🇹", symbol: "Q", ratePerUsd: 7.72 },
  { code: "KGS", name: "Kyrgyzstani Som", flag: "🇰🇬", symbol: "с", ratePerUsd: 85.5 },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦", symbol: "R", ratePerUsd: 17.6 },
  { code: "TMT", name: "Turkmenistani Manat", flag: "🇹🇲", symbol: "m", ratePerUsd: 3.50 },
  { code: "ZMW", name: "Zambian Kwacha", flag: "🇿🇲", symbol: "ZK", ratePerUsd: 26.5 },
  { code: "TTD", name: "Trinidad Dollar", flag: "🇹🇹", symbol: "TT$", ratePerUsd: 6.78 },
  { code: "JMD", name: "Jamaican Dollar", flag: "🇯🇲", symbol: "J$", ratePerUsd: 158 },
  { code: "NIO", name: "Nicaraguan Córdoba", flag: "🇳🇮", symbol: "C$", ratePerUsd: 36.8 },
  { code: "HNL", name: "Honduran Lempira", flag: "🇭🇳", symbol: "L", ratePerUsd: 24.8 },
  { code: "MZN", name: "Mozambican Metical", flag: "🇲🇿", symbol: "MT", ratePerUsd: 63.8 },
  { code: "XAF", name: "Central African CFA", flag: "🌍", symbol: "FCFA", ratePerUsd: 603 },
  { code: "GNF", name: "Guinean Franc", flag: "🇬🇳", symbol: "FG", ratePerUsd: 8650 },
  { code: "BWP", name: "Botswana Pula", flag: "🇧🇼", symbol: "P", ratePerUsd: 13.5 },
  { code: "KMF", name: "Comorian Franc", flag: "🇰🇲", symbol: "CF", ratePerUsd: 452 },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭", symbol: "฿", ratePerUsd: 34.5 },
  { code: "LSL", name: "Lesotho Loti", flag: "🇱🇸", symbol: "L", ratePerUsd: 17.6 },
  { code: "ERN", name: "Eritrean Nakfa", flag: "🇪🇷", symbol: "Nfk", ratePerUsd: 15.0 },
  { code: "BIF", name: "Burundian Franc", flag: "🇧🇮", symbol: "FBu", ratePerUsd: 2900 },
  { code: "MWK", name: "Malawian Kwacha", flag: "🇲🇼", symbol: "MK", ratePerUsd: 1740 },
  { code: "PGK", name: "Papua New Guinean Kina", flag: "🇵🇬", symbol: "K", ratePerUsd: 3.95 },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷", symbol: "R$", ratePerUsd: 5.62 },
];

export const ALL_FIAT_CURRENCIES: FiatCurrency[] = [
  ...PRIMARY_FIAT_CURRENCIES,
  ...EXTENDED_FIAT_CURRENCIES,
];
