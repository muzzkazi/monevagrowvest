import { StockInfo } from '@/data/stockDatabase';

interface ExportStock extends StockInfo {
  livePrice?: number;
  change?: number;
  changePercent?: number;
}

export const exportToCSV = (stocks: ExportStock[], filename: string = 'stock-screener-results') => {
  const headers = [
    'Symbol',
    'Name',
    'Sector',
    'Industry',
    'Market Cap (Cr)',
    'Price',
    'Change %',
    'P/E Ratio',
    'P/B Ratio',
    'Dividend Yield %',
    'ROE %',
    'ROCE %',
    'Debt/Equity',
    'RSI',
    '52W High',
    '52W Low',
    'MACD',
    'ADX',
    'Beta',
    'Monthly Return %',
    'Promoter %',
    'FII %',
    'DII %',
  ];

  const rows = stocks.map(stock => [
    stock.symbol,
    stock.name,
    stock.sector,
    stock.industry,
    stock.marketCap,
    stock.livePrice?.toFixed(2) || '',
    stock.changePercent?.toFixed(2) || '',
    stock.peRatio.toFixed(2),
    stock.pbRatio.toFixed(2),
    stock.dividendYield.toFixed(2),
    stock.roe.toFixed(2),
    stock.roce.toFixed(2),
    stock.debtToEquity.toFixed(2),
    stock.rsi,
    stock.high52Week,
    stock.low52Week,
    stock.macdHistogram.toFixed(2),
    stock.adx.toFixed(1),
    stock.beta.toFixed(2),
    stock.monthlyReturn.toFixed(2),
    stock.promoterHolding.toFixed(1),
    stock.fiiHolding.toFixed(1),
    stock.diiHolding.toFixed(1),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (stocks: ExportStock[], filename: string = 'stock-screener-results') => {
  // For Excel, we create an HTML table that Excel can read
  const headers = [
    'Symbol',
    'Name',
    'Sector',
    'Industry',
    'Market Cap (Cr)',
    'Price',
    'Change %',
    'P/E Ratio',
    'P/B Ratio',
    'Dividend Yield %',
    'ROE %',
    'ROCE %',
    'Debt/Equity',
    'RSI',
    '52W High',
    '52W Low',
    'MACD',
    'ADX',
    'Beta',
    'Monthly Return %',
    'Promoter %',
    'FII %',
    'DII %',
  ];

  let tableHtml = '<table><thead><tr>';
  headers.forEach(header => {
    tableHtml += `<th>${header}</th>`;
  });
  tableHtml += '</tr></thead><tbody>';

  stocks.forEach(stock => {
    tableHtml += '<tr>';
    tableHtml += `<td>${stock.symbol}</td>`;
    tableHtml += `<td>${stock.name}</td>`;
    tableHtml += `<td>${stock.sector}</td>`;
    tableHtml += `<td>${stock.industry}</td>`;
    tableHtml += `<td>${stock.marketCap}</td>`;
    tableHtml += `<td>${stock.livePrice?.toFixed(2) || ''}</td>`;
    tableHtml += `<td>${stock.changePercent?.toFixed(2) || ''}</td>`;
    tableHtml += `<td>${stock.peRatio.toFixed(2)}</td>`;
    tableHtml += `<td>${stock.pbRatio.toFixed(2)}</td>`;
    tableHtml += `<td>${stock.dividendYield.toFixed(2)}</td>`;
    tableHtml += `<td>${stock.roe.toFixed(2)}</td>`;
    tableHtml += `<td>${stock.roce.toFixed(2)}</td>`;
    tableHtml += `<td>${stock.debtToEquity.toFixed(2)}</td>`;
    tableHtml += `<td>${stock.rsi}</td>`;
    tableHtml += `<td>${stock.high52Week}</td>`;
    tableHtml += `<td>${stock.low52Week}</td>`;
    tableHtml += `<td>${stock.macdHistogram.toFixed(2)}</td>`;
    tableHtml += `<td>${stock.adx.toFixed(1)}</td>`;
    tableHtml += `<td>${stock.beta.toFixed(2)}</td>`;
    tableHtml += `<td>${stock.monthlyReturn.toFixed(2)}</td>`;
    tableHtml += `<td>${stock.promoterHolding.toFixed(1)}</td>`;
    tableHtml += `<td>${stock.fiiHolding.toFixed(1)}</td>`;
    tableHtml += `<td>${stock.diiHolding.toFixed(1)}</td>`;
    tableHtml += '</tr>';
  });

  tableHtml += '</tbody></table>';

  const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
