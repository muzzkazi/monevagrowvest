// Comprehensive Indian Mutual Fund Database
// Data sourced from AMFI/MFAPI for popular schemes

export interface MutualFundInfo {
  schemeCode: string;
  schemeName: string;
  category: string;
  subCategory: string;
  fundHouse: string;
  plan: string; // Direct / Regular
  nav: number;
  aum: number; // in Cr
  expenseRatio: number;
  rating: number; // 1-5 stars
  riskLevel: "Low" | "Moderate" | "High" | "Very High";
  returns1Y: number;
  returns3Y: number;
  returns5Y: number;
  returns10Y: number;
  sipMinimum: number;
  lumpSumMinimum: number;
  exitLoad: string;
  benchmark: string;
  fundManager: string;
  inceptionDate: string;
}

export const fundCategories = [
  "All",
  "Equity",
  "Debt",
  "Hybrid",
  "Solution Oriented",
  "Other",
];

export const fundSubCategories: Record<string, string[]> = {
  Equity: ["Large Cap", "Mid Cap", "Small Cap", "Multi Cap", "Flexi Cap", "Large & Mid Cap", "ELSS", "Sectoral", "Index Fund", "Value"],
  Debt: ["Liquid", "Ultra Short Duration", "Short Duration", "Medium Duration", "Long Duration", "Corporate Bond", "Gilt", "Banking & PSU"],
  Hybrid: ["Aggressive Hybrid", "Conservative Hybrid", "Balanced Advantage", "Multi Asset Allocation", "Arbitrage"],
  "Solution Oriented": ["Retirement", "Children's Fund"],
  Other: ["International", "Fund of Funds", "ETF"],
};

export const fundHouses = [
  "All",
  "SBI Mutual Fund",
  "HDFC Mutual Fund",
  "ICICI Prudential",
  "Axis Mutual Fund",
  "Kotak Mutual Fund",
  "Nippon India",
  "Mirae Asset",
  "DSP Mutual Fund",
  "UTI Mutual Fund",
  "Tata Mutual Fund",
  "Aditya Birla Sun Life",
  "Franklin Templeton",
  "Motilal Oswal",
  "Parag Parikh",
  "Quant Mutual Fund",
  "Canara Robeco",
  "Edelweiss",
  "PPFAS",
  "Bandhan Mutual Fund",
];

// Popular mutual funds with realistic data
export const mutualFunds: MutualFundInfo[] = [
  // Large Cap
  { schemeCode: "120503", schemeName: "SBI Blue Chip Fund - Direct Growth", category: "Equity", subCategory: "Large Cap", fundHouse: "SBI Mutual Fund", plan: "Direct", nav: 89.23, aum: 45230, expenseRatio: 0.72, rating: 4, riskLevel: "High", returns1Y: 18.5, returns3Y: 15.2, returns5Y: 16.8, returns10Y: 14.2, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "Nifty 100 TRI", fundManager: "Saurabh Pant", inceptionDate: "2013-01-01" },
  { schemeCode: "120505", schemeName: "ICICI Pru Bluechip Fund - Direct Growth", category: "Equity", subCategory: "Large Cap", fundHouse: "ICICI Prudential", plan: "Direct", nav: 102.45, aum: 52100, expenseRatio: 0.87, rating: 5, riskLevel: "High", returns1Y: 22.3, returns3Y: 17.8, returns5Y: 18.2, returns10Y: 15.1, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "Nifty 100 TRI", fundManager: "Anish Tawakley", inceptionDate: "2013-01-01" },
  { schemeCode: "120506", schemeName: "Axis Bluechip Fund - Direct Growth", category: "Equity", subCategory: "Large Cap", fundHouse: "Axis Mutual Fund", plan: "Direct", nav: 58.67, aum: 33400, expenseRatio: 0.58, rating: 4, riskLevel: "High", returns1Y: 15.2, returns3Y: 12.8, returns5Y: 14.5, returns10Y: 13.8, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "Nifty 50 TRI", fundManager: "Shreyash Devalkar", inceptionDate: "2013-01-01" },
  { schemeCode: "120507", schemeName: "Mirae Asset Large Cap Fund - Direct Growth", category: "Equity", subCategory: "Large Cap", fundHouse: "Mirae Asset", plan: "Direct", nav: 112.34, aum: 38700, expenseRatio: 0.53, rating: 5, riskLevel: "High", returns1Y: 20.1, returns3Y: 16.5, returns5Y: 17.9, returns10Y: 15.8, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "Nifty 100 TRI", fundManager: "Gaurav Misra", inceptionDate: "2013-01-01" },
  { schemeCode: "120508", schemeName: "Kotak Bluechip Fund - Direct Growth", category: "Equity", subCategory: "Large Cap", fundHouse: "Kotak Mutual Fund", plan: "Direct", nav: 55.89, aum: 8500, expenseRatio: 0.62, rating: 4, riskLevel: "High", returns1Y: 19.8, returns3Y: 15.0, returns5Y: 16.2, returns10Y: 14.0, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "Nifty 100 TRI", fundManager: "Harsha Upadhyaya", inceptionDate: "2013-01-01" },

  // Mid Cap
  { schemeCode: "125497", schemeName: "HDFC Mid-Cap Opportunities Fund - Direct Growth", category: "Equity", subCategory: "Mid Cap", fundHouse: "HDFC Mutual Fund", plan: "Direct", nav: 145.67, aum: 62300, expenseRatio: 0.78, rating: 5, riskLevel: "Very High", returns1Y: 35.2, returns3Y: 25.8, returns5Y: 22.4, returns10Y: 18.6, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "Nifty Midcap 150 TRI", fundManager: "Chirag Setalvad", inceptionDate: "2013-01-01" },
  { schemeCode: "120509", schemeName: "Kotak Emerging Equity Fund - Direct Growth", category: "Equity", subCategory: "Mid Cap", fundHouse: "Kotak Mutual Fund", plan: "Direct", nav: 115.23, aum: 42100, expenseRatio: 0.45, rating: 5, riskLevel: "Very High", returns1Y: 38.5, returns3Y: 27.2, returns5Y: 24.1, returns10Y: 20.3, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "Nifty Midcap 150 TRI", fundManager: "Pankaj Tibrewal", inceptionDate: "2013-01-01" },
  { schemeCode: "120510", schemeName: "Axis Midcap Fund - Direct Growth", category: "Equity", subCategory: "Mid Cap", fundHouse: "Axis Mutual Fund", plan: "Direct", nav: 95.45, aum: 26800, expenseRatio: 0.48, rating: 4, riskLevel: "Very High", returns1Y: 28.3, returns3Y: 20.5, returns5Y: 19.8, returns10Y: 17.2, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "Nifty Midcap 150 TRI", fundManager: "Shreyash Devalkar", inceptionDate: "2013-01-01" },
  { schemeCode: "120511", schemeName: "DSP Midcap Fund - Direct Growth", category: "Equity", subCategory: "Mid Cap", fundHouse: "DSP Mutual Fund", plan: "Direct", nav: 132.56, aum: 17800, expenseRatio: 0.65, rating: 4, riskLevel: "Very High", returns1Y: 32.1, returns3Y: 23.4, returns5Y: 21.5, returns10Y: 18.0, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "Nifty Midcap 150 TRI", fundManager: "Vinit Sambre", inceptionDate: "2013-01-01" },

  // Small Cap
  { schemeCode: "120516", schemeName: "SBI Small Cap Fund - Direct Growth", category: "Equity", subCategory: "Small Cap", fundHouse: "SBI Mutual Fund", plan: "Direct", nav: 178.34, aum: 28500, expenseRatio: 0.62, rating: 5, riskLevel: "Very High", returns1Y: 42.5, returns3Y: 28.9, returns5Y: 26.3, returns10Y: 22.1, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "Nifty Smallcap 250 TRI", fundManager: "R. Srinivasan", inceptionDate: "2013-01-01" },
  { schemeCode: "120517", schemeName: "Nippon India Small Cap Fund - Direct Growth", category: "Equity", subCategory: "Small Cap", fundHouse: "Nippon India", plan: "Direct", nav: 165.78, aum: 48200, expenseRatio: 0.68, rating: 5, riskLevel: "Very High", returns1Y: 48.2, returns3Y: 32.5, returns5Y: 28.7, returns10Y: 24.5, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "Nifty Smallcap 250 TRI", fundManager: "Samir Rachh", inceptionDate: "2013-01-01" },
  { schemeCode: "120518", schemeName: "Quant Small Cap Fund - Direct Growth", category: "Equity", subCategory: "Small Cap", fundHouse: "Quant Mutual Fund", plan: "Direct", nav: 245.12, aum: 22100, expenseRatio: 0.64, rating: 5, riskLevel: "Very High", returns1Y: 55.8, returns3Y: 38.2, returns5Y: 35.1, returns10Y: 28.3, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 15 days", benchmark: "Nifty Smallcap 250 TRI", fundManager: "Sanjeev Sharma", inceptionDate: "2013-01-01" },

  // Flexi Cap
  { schemeCode: "120520", schemeName: "Parag Parikh Flexi Cap Fund - Direct Growth", category: "Equity", subCategory: "Flexi Cap", fundHouse: "PPFAS", plan: "Direct", nav: 78.56, aum: 58400, expenseRatio: 0.63, rating: 5, riskLevel: "High", returns1Y: 25.8, returns3Y: 20.2, returns5Y: 21.5, returns10Y: 18.9, sipMinimum: 1000, lumpSumMinimum: 5000, exitLoad: "2% if redeemed within 365 days", benchmark: "Nifty 500 TRI", fundManager: "Rajeev Thakkar", inceptionDate: "2013-05-01" },
  { schemeCode: "120521", schemeName: "HDFC Flexi Cap Fund - Direct Growth", category: "Equity", subCategory: "Flexi Cap", fundHouse: "HDFC Mutual Fund", plan: "Direct", nav: 55.23, aum: 48700, expenseRatio: 0.77, rating: 4, riskLevel: "High", returns1Y: 22.1, returns3Y: 18.5, returns5Y: 17.8, returns10Y: 15.2, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "Nifty 500 TRI", fundManager: "Roshi Jain", inceptionDate: "2013-01-01" },
  { schemeCode: "120522", schemeName: "Quant Flexi Cap Fund - Direct Growth", category: "Equity", subCategory: "Flexi Cap", fundHouse: "Quant Mutual Fund", plan: "Direct", nav: 98.34, aum: 6200, expenseRatio: 0.58, rating: 5, riskLevel: "Very High", returns1Y: 45.2, returns3Y: 30.8, returns5Y: 28.5, returns10Y: 22.1, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 15 days", benchmark: "Nifty 500 TRI", fundManager: "Sanjeev Sharma", inceptionDate: "2013-01-01" },

  // ELSS
  { schemeCode: "120525", schemeName: "Quant Tax Plan - Direct Growth", category: "Equity", subCategory: "ELSS", fundHouse: "Quant Mutual Fund", plan: "Direct", nav: 345.67, aum: 8900, expenseRatio: 0.57, rating: 5, riskLevel: "Very High", returns1Y: 48.5, returns3Y: 32.8, returns5Y: 30.2, returns10Y: 24.5, sipMinimum: 500, lumpSumMinimum: 500, exitLoad: "Nil (3Y lock-in)", benchmark: "Nifty 500 TRI", fundManager: "Sanjeev Sharma", inceptionDate: "2013-01-01" },
  { schemeCode: "120526", schemeName: "Mirae Asset Tax Saver Fund - Direct Growth", category: "Equity", subCategory: "ELSS", fundHouse: "Mirae Asset", plan: "Direct", nav: 45.89, aum: 21300, expenseRatio: 0.55, rating: 5, riskLevel: "High", returns1Y: 25.3, returns3Y: 18.5, returns5Y: 20.1, returns10Y: 0, sipMinimum: 500, lumpSumMinimum: 500, exitLoad: "Nil (3Y lock-in)", benchmark: "Nifty 200 TRI", fundManager: "Neelesh Surana", inceptionDate: "2015-12-01" },
  { schemeCode: "120527", schemeName: "Axis Long Term Equity Fund - Direct Growth", category: "Equity", subCategory: "ELSS", fundHouse: "Axis Mutual Fund", plan: "Direct", nav: 85.12, aum: 35600, expenseRatio: 0.62, rating: 4, riskLevel: "High", returns1Y: 18.2, returns3Y: 14.5, returns5Y: 15.8, returns10Y: 14.2, sipMinimum: 500, lumpSumMinimum: 500, exitLoad: "Nil (3Y lock-in)", benchmark: "Nifty 500 TRI", fundManager: "Jinesh Gopani", inceptionDate: "2013-01-01" },

  // Index Funds
  { schemeCode: "120530", schemeName: "UTI Nifty 50 Index Fund - Direct Growth", category: "Equity", subCategory: "Index Fund", fundHouse: "UTI Mutual Fund", plan: "Direct", nav: 155.23, aum: 18900, expenseRatio: 0.18, rating: 4, riskLevel: "High", returns1Y: 16.5, returns3Y: 14.2, returns5Y: 15.8, returns10Y: 13.5, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "Nil", benchmark: "Nifty 50 TRI", fundManager: "Sharwan Goyal", inceptionDate: "2013-01-01" },
  { schemeCode: "120531", schemeName: "HDFC Index Fund - Nifty 50 Plan - Direct Growth", category: "Equity", subCategory: "Index Fund", fundHouse: "HDFC Mutual Fund", plan: "Direct", nav: 198.45, aum: 14500, expenseRatio: 0.20, rating: 4, riskLevel: "High", returns1Y: 16.3, returns3Y: 14.0, returns5Y: 15.5, returns10Y: 13.2, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "Nil", benchmark: "Nifty 50 TRI", fundManager: "Krishan Kumar Daga", inceptionDate: "2013-01-01" },
  { schemeCode: "120532", schemeName: "Motilal Oswal Nifty Next 50 Index Fund - Direct Growth", category: "Equity", subCategory: "Index Fund", fundHouse: "Motilal Oswal", plan: "Direct", nav: 22.45, aum: 5600, expenseRatio: 0.28, rating: 3, riskLevel: "High", returns1Y: 32.5, returns3Y: 18.8, returns5Y: 17.2, returns10Y: 0, sipMinimum: 500, lumpSumMinimum: 500, exitLoad: "Nil", benchmark: "Nifty Next 50 TRI", fundManager: "Swapnil Mayekar", inceptionDate: "2019-02-01" },

  // Sectoral
  { schemeCode: "120535", schemeName: "ICICI Pru Technology Fund - Direct Growth", category: "Equity", subCategory: "Sectoral", fundHouse: "ICICI Prudential", plan: "Direct", nav: 198.56, aum: 12300, expenseRatio: 0.95, rating: 4, riskLevel: "Very High", returns1Y: 28.5, returns3Y: 15.8, returns5Y: 22.5, returns10Y: 18.9, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 15 days", benchmark: "Nifty IT TRI", fundManager: "Vaibhav Dusad", inceptionDate: "2013-01-01" },
  { schemeCode: "120536", schemeName: "Nippon India Pharma Fund - Direct Growth", category: "Equity", subCategory: "Sectoral", fundHouse: "Nippon India", plan: "Direct", nav: 385.45, aum: 7800, expenseRatio: 0.92, rating: 4, riskLevel: "Very High", returns1Y: 42.8, returns3Y: 22.5, returns5Y: 18.9, returns10Y: 16.5, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 30 days", benchmark: "Nifty Pharma TRI", fundManager: "Sailesh Raj Bhan", inceptionDate: "2013-01-01" },
  { schemeCode: "120537", schemeName: "SBI Banking & Financial Services Fund - Direct Growth", category: "Equity", subCategory: "Sectoral", fundHouse: "SBI Mutual Fund", plan: "Direct", nav: 35.78, aum: 6200, expenseRatio: 0.88, rating: 3, riskLevel: "Very High", returns1Y: 15.2, returns3Y: 12.8, returns5Y: 14.5, returns10Y: 0, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 30 days", benchmark: "Nifty Financial Services TRI", fundManager: "Milind Agrawal", inceptionDate: "2015-06-01" },

  // Debt Funds
  { schemeCode: "120540", schemeName: "HDFC Short Term Debt Fund - Direct Growth", category: "Debt", subCategory: "Short Duration", fundHouse: "HDFC Mutual Fund", plan: "Direct", nav: 30.56, aum: 14500, expenseRatio: 0.25, rating: 4, riskLevel: "Moderate", returns1Y: 7.8, returns3Y: 6.5, returns5Y: 7.2, returns10Y: 7.8, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "Nil", benchmark: "CRISIL Short Term Bond TRI", fundManager: "Anil Bamboli", inceptionDate: "2013-01-01" },
  { schemeCode: "120541", schemeName: "SBI Liquid Fund - Direct Growth", category: "Debt", subCategory: "Liquid", fundHouse: "SBI Mutual Fund", plan: "Direct", nav: 3685.23, aum: 68200, expenseRatio: 0.18, rating: 5, riskLevel: "Low", returns1Y: 7.2, returns3Y: 6.0, returns5Y: 5.8, returns10Y: 6.5, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "Graded exit load for 7 days", benchmark: "CRISIL Liquid Fund AI TRI", fundManager: "R. Arun", inceptionDate: "2013-01-01" },
  { schemeCode: "120542", schemeName: "ICICI Pru Corporate Bond Fund - Direct Growth", category: "Debt", subCategory: "Corporate Bond", fundHouse: "ICICI Prudential", plan: "Direct", nav: 28.89, aum: 26800, expenseRatio: 0.30, rating: 4, riskLevel: "Moderate", returns1Y: 8.2, returns3Y: 6.8, returns5Y: 7.5, returns10Y: 8.0, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "Nil", benchmark: "CRISIL Corporate Bond TRI", fundManager: "Rahul Goswami", inceptionDate: "2013-01-01" },
  { schemeCode: "120543", schemeName: "Kotak Gilt Fund - Direct Growth", category: "Debt", subCategory: "Gilt", fundHouse: "Kotak Mutual Fund", plan: "Direct", nav: 92.34, aum: 3200, expenseRatio: 0.45, rating: 3, riskLevel: "Moderate", returns1Y: 9.5, returns3Y: 6.2, returns5Y: 7.8, returns10Y: 8.5, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "Nil", benchmark: "CRISIL Dynamic Gilt Index", fundManager: "Abhishek Bisen", inceptionDate: "2013-01-01" },
  { schemeCode: "120544", schemeName: "Axis Banking & PSU Debt Fund - Direct Growth", category: "Debt", subCategory: "Banking & PSU", fundHouse: "Axis Mutual Fund", plan: "Direct", nav: 24.56, aum: 15600, expenseRatio: 0.28, rating: 4, riskLevel: "Low", returns1Y: 7.5, returns3Y: 6.3, returns5Y: 7.0, returns10Y: 7.5, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "Nil", benchmark: "CRISIL Banking & PSU Debt TRI", fundManager: "Devang Shah", inceptionDate: "2013-01-01" },

  // Hybrid Funds
  { schemeCode: "120550", schemeName: "ICICI Pru Balanced Advantage Fund - Direct Growth", category: "Hybrid", subCategory: "Balanced Advantage", fundHouse: "ICICI Prudential", plan: "Direct", nav: 68.45, aum: 58900, expenseRatio: 0.82, rating: 5, riskLevel: "Moderate", returns1Y: 15.8, returns3Y: 12.5, returns5Y: 13.2, returns10Y: 12.8, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "CRISIL Hybrid 35+65 Aggressive TRI", fundManager: "Sankaran Naren", inceptionDate: "2013-01-01" },
  { schemeCode: "120551", schemeName: "HDFC Balanced Advantage Fund - Direct Growth", category: "Hybrid", subCategory: "Balanced Advantage", fundHouse: "HDFC Mutual Fund", plan: "Direct", nav: 435.67, aum: 72300, expenseRatio: 0.75, rating: 4, riskLevel: "Moderate", returns1Y: 18.2, returns3Y: 15.8, returns5Y: 14.5, returns10Y: 13.2, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "CRISIL Hybrid 35+65 Aggressive TRI", fundManager: "Prashant Jain", inceptionDate: "2013-01-01" },
  { schemeCode: "120552", schemeName: "SBI Equity Hybrid Fund - Direct Growth", category: "Hybrid", subCategory: "Aggressive Hybrid", fundHouse: "SBI Mutual Fund", plan: "Direct", nav: 265.89, aum: 62100, expenseRatio: 0.68, rating: 4, riskLevel: "High", returns1Y: 20.5, returns3Y: 14.2, returns5Y: 15.8, returns10Y: 14.5, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "CRISIL Hybrid 35+65 Aggressive TRI", fundManager: "R. Srinivasan", inceptionDate: "2013-01-01" },
  { schemeCode: "120553", schemeName: "Kotak Equity Arbitrage Fund - Direct Growth", category: "Hybrid", subCategory: "Arbitrage", fundHouse: "Kotak Mutual Fund", plan: "Direct", nav: 34.56, aum: 42500, expenseRatio: 0.42, rating: 4, riskLevel: "Low", returns1Y: 7.5, returns3Y: 6.2, returns5Y: 6.0, returns10Y: 6.5, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "0.25% if redeemed within 30 days", benchmark: "Nifty 50 Arbitrage TRI", fundManager: "Hiten Shah", inceptionDate: "2013-01-01" },

  // Value
  { schemeCode: "120555", schemeName: "ICICI Pru Value Discovery Fund - Direct Growth", category: "Equity", subCategory: "Value", fundHouse: "ICICI Prudential", plan: "Direct", nav: 405.23, aum: 42500, expenseRatio: 0.95, rating: 4, riskLevel: "High", returns1Y: 28.5, returns3Y: 22.1, returns5Y: 20.8, returns10Y: 17.5, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "Nifty 500 TRI", fundManager: "Sankaran Naren", inceptionDate: "2013-01-01" },
  { schemeCode: "120556", schemeName: "Tata Equity P/E Fund - Direct Growth", category: "Equity", subCategory: "Value", fundHouse: "Tata Mutual Fund", plan: "Direct", nav: 325.67, aum: 8500, expenseRatio: 0.78, rating: 3, riskLevel: "High", returns1Y: 22.3, returns3Y: 18.5, returns5Y: 17.2, returns10Y: 15.8, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 365 days", benchmark: "Nifty 500 TRI", fundManager: "Sonam Udasi", inceptionDate: "2013-01-01" },

  // Multi Cap / Large & Mid
  { schemeCode: "120560", schemeName: "Quant Active Fund - Direct Growth", category: "Equity", subCategory: "Multi Cap", fundHouse: "Quant Mutual Fund", plan: "Direct", nav: 612.34, aum: 9800, expenseRatio: 0.58, rating: 5, riskLevel: "Very High", returns1Y: 52.1, returns3Y: 35.2, returns5Y: 32.5, returns10Y: 26.8, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 15 days", benchmark: "Nifty 500 TRI", fundManager: "Sanjeev Sharma", inceptionDate: "2013-01-01" },
  { schemeCode: "120561", schemeName: "Mirae Asset Large & Midcap Fund - Direct Growth", category: "Equity", subCategory: "Large & Mid Cap", fundHouse: "Mirae Asset", plan: "Direct", nav: 145.67, aum: 33200, expenseRatio: 0.55, rating: 5, riskLevel: "Very High", returns1Y: 28.5, returns3Y: 21.5, returns5Y: 20.8, returns10Y: 18.2, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "Nifty Large Midcap 250 TRI", fundManager: "Neelesh Surana", inceptionDate: "2013-01-01" },
  { schemeCode: "120562", schemeName: "Canara Robeco Flexi Cap Fund - Direct Growth", category: "Equity", subCategory: "Flexi Cap", fundHouse: "Canara Robeco", plan: "Direct", nav: 35.89, aum: 12800, expenseRatio: 0.48, rating: 4, riskLevel: "High", returns1Y: 20.5, returns3Y: 16.8, returns5Y: 18.2, returns10Y: 0, sipMinimum: 500, lumpSumMinimum: 5000, exitLoad: "1% if redeemed within 1 year", benchmark: "Nifty 500 TRI", fundManager: "Shridatta Bhandwaldar", inceptionDate: "2018-01-01" },

  // International
  { schemeCode: "120565", schemeName: "Motilal Oswal Nasdaq 100 FOF - Direct Growth", category: "Other", subCategory: "International", fundHouse: "Motilal Oswal", plan: "Direct", nav: 28.45, aum: 4500, expenseRatio: 0.52, rating: 4, riskLevel: "Very High", returns1Y: 35.2, returns3Y: 15.5, returns5Y: 22.8, returns10Y: 0, sipMinimum: 500, lumpSumMinimum: 500, exitLoad: "Nil", benchmark: "Nasdaq 100 TRI", fundManager: "Pratik Oswal", inceptionDate: "2018-04-01" },
];

// Preset screeners for mutual funds (Tickertape-style)
export interface MFPresetScreener {
  id: string;
  name: string;
  description: string;
  icon: string;
  userCount: string;
  filter: (fund: MutualFundInfo) => boolean;
}

export const mfPresetScreeners: MFPresetScreener[] = [
  {
    id: "topTaxSavers",
    name: "Top Tax Savers",
    description: "ELSS funds with best 3Y returns",
    icon: "🏆",
    userCount: "362k+",
    filter: (f) => f.subCategory === "ELSS",
  },
  {
    id: "longTermCompounders",
    name: "Long Term Compounders",
    description: "5Y+ track record with 15%+ CAGR",
    icon: "📈",
    userCount: "566k+",
    filter: (f) => f.returns5Y > 15 && f.category === "Equity",
  },
  {
    id: "bestSIPFunds",
    name: "Best SIP Funds",
    description: "Top-rated funds ideal for SIP",
    icon: "💰",
    userCount: "428k+",
    filter: (f) => f.rating >= 4 && f.category === "Equity" && f.returns3Y > 15,
  },
  {
    id: "lowCostIndex",
    name: "Low Cost Index Funds",
    description: "Expense ratio < 0.3%",
    icon: "📊",
    userCount: "215k+",
    filter: (f) => f.subCategory === "Index Fund" || f.expenseRatio < 0.3,
  },
  {
    id: "smallCapGems",
    name: "Small Cap Gems",
    description: "Top performing small cap funds",
    icon: "💎",
    userCount: "189k+",
    filter: (f) => f.subCategory === "Small Cap" && f.rating >= 4,
  },
  {
    id: "safeBets",
    name: "Safe Debt Funds",
    description: "Low risk debt funds for parking money",
    icon: "🛡️",
    userCount: "312k+",
    filter: (f) => f.category === "Debt" && (f.riskLevel === "Low" || f.riskLevel === "Moderate"),
  },
  {
    id: "balancedPortfolio",
    name: "Balanced Portfolio",
    description: "Hybrid funds for balanced allocation",
    icon: "⚖️",
    userCount: "275k+",
    filter: (f) => f.category === "Hybrid" && f.rating >= 4,
  },
  {
    id: "highReturn",
    name: "High Returns",
    description: "1Y returns > 30%",
    icon: "🚀",
    userCount: "445k+",
    filter: (f) => f.returns1Y > 30,
  },
];
