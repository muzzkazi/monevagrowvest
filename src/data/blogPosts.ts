export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  content: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "5-essential-steps-to-start-your-sip-journey",
    title: "5 Essential Steps to Start Your SIP Journey",
    excerpt:
      "Learn how to begin systematic investment planning with our beginner-friendly guide to building wealth through disciplined investing.",
    author: "Moneva Team",
    date: "2024-03-15",
    readTime: "5 min read",
    category: "Investment",
    content: [
      "A Systematic Investment Plan (SIP) is one of the simplest ways to build long-term wealth. Instead of trying to time the market, you invest a fixed amount every month into a mutual fund of your choice. Over time, the power of compounding and rupee-cost averaging work in your favour.",
      "Step 1: Define your goal. Before you pick a fund, be clear about what you're investing for — retirement, a home, your child's education. The goal decides the horizon, and the horizon decides the fund category.",
      "Step 2: Pick the right category. Equity funds suit horizons of 7+ years, hybrid funds for 3–5 years, and debt funds for shorter goals. Don't chase last year's chart-toppers; look at 5- and 10-year rolling returns and downside performance.",
      "Step 3: Start small, but start now. Even ₹500/month builds a habit. You can always step up the SIP amount as your income grows — most platforms support an automatic annual step-up.",
      "Step 4: Automate and forget. Set up an auto-debit and resist the urge to check NAV daily. SIPs work precisely because you keep buying through bull and bear phases.",
      "Step 5: Review annually, not monthly. Once a year, check whether the fund is still tracking its category benchmark and whether your allocation still matches your goal. Rebalance if it drifts significantly.",
      "The biggest mistake new investors make is waiting for the 'perfect' time. There isn't one. The best SIP you can start is the one you start today.",
    ],
  },
  {
    id: 2,
    slug: "tax-saving-strategies-for-new-investors",
    title: "Tax Saving Strategies for New Investors",
    excerpt:
      "Discover smart tax planning techniques that can help young professionals save money while building their investment portfolio.",
    author: "Moneva Team",
    date: "2024-03-10",
    readTime: "7 min read",
    category: "Tax Planning",
    content: [
      "Tax planning isn't just about saving tax in March — it's about structuring your investments so that wealth creation and tax efficiency go hand in hand.",
      "Start with Section 80C. You can claim up to ₹1.5 lakh a year across EPF, PPF, ELSS mutual funds, life insurance premiums and principal repayment of a home loan. For most young professionals, ELSS is the sweet spot — it has the shortest lock-in (3 years) and equity-like returns.",
      "Next, look at Section 80D. Health insurance premiums for yourself, spouse, kids and parents can add another ₹25,000–₹75,000 in deductions depending on age.",
      "The NPS Tier-1 account gives an extra ₹50,000 deduction under Section 80CCD(1B), over and above 80C. It's a great supplement if you're already maxing out 80C.",
      "Don't ignore the new tax regime. If your deductions are modest, the new regime with lower slab rates often works out cheaper. Run both numbers before filing.",
      "Finally, be aware of capital gains. Equity held over 12 months attracts 10% LTCG above ₹1 lakh; debt is now taxed at slab. Harvest gains up to the ₹1 lakh threshold every year to reset your cost basis tax-free.",
    ],
  },
  {
    id: 3,
    slug: "building-your-first-emergency-fund",
    title: "Building Your First Emergency Fund",
    excerpt:
      "Why every young professional needs an emergency fund and how to build one systematically without compromising your lifestyle.",
    author: "Moneva Team",
    date: "2024-03-05",
    readTime: "4 min read",
    category: "Financial Planning",
    content: [
      "An emergency fund is the foundation of every financial plan. Without it, one job loss or medical bill can force you to break long-term investments at the worst possible time.",
      "How much? Aim for 6 months of essential expenses — rent, EMIs, groceries, utilities, insurance premiums. If your income is variable (freelance, commission-based), stretch it to 9–12 months.",
      "Where to keep it? Split across a high-yield savings account (for instant access) and a liquid or overnight mutual fund (for the rest). Avoid equity, real estate, or anything with a lock-in.",
      "How to build it? Start with a monthly transfer of 10–20% of your take-home into the emergency bucket until you hit the target. Treat it like a non-negotiable bill.",
      "Once funded, don't touch it — and don't confuse it with a vacation or gadget fund. If you do use it, refill it before resuming other investments.",
    ],
  },
  {
    id: 4,
    slug: "understanding-mutual-fund-categories",
    title: "Understanding Mutual Fund Categories",
    excerpt:
      "A simple guide to different types of mutual funds and how to choose the right ones for your investment goals.",
    author: "Moneva Team",
    date: "2024-02-28",
    readTime: "6 min read",
    category: "Investment",
    content: [
      "SEBI classifies mutual funds into clear categories so investors can compare apples to apples. Understanding these buckets is the first step to building a coherent portfolio.",
      "Equity funds invest primarily in stocks. Large-cap funds hold the top 100 companies and are the least volatile; mid-cap (101–250) and small-cap (251+) offer higher returns with sharper drawdowns. Flexi-cap funds move across market caps at the manager's discretion.",
      "Debt funds lend money to governments and corporations. Liquid and overnight funds suit parking money for days or weeks. Short-duration and corporate bond funds fit 1–3 year horizons. Gilt and long-duration funds are interest-rate sensitive and better left to experienced investors.",
      "Hybrid funds mix equity and debt. Aggressive hybrids (65–80% equity) work for 3–5 year goals. Balanced advantage funds dynamically shift allocations based on market valuation.",
      "Index funds and ETFs simply track a benchmark like Nifty 50 or Nifty Next 50 at very low cost. For most passive investors, a couple of index funds do 80% of what an actively managed portfolio does — for a fraction of the fees.",
    ],
  },
  {
    id: 5,
    slug: "debt-vs-equity-building-a-balanced-portfolio",
    title: "Debt vs Equity: Building a Balanced Portfolio",
    excerpt:
      "How to think about asset allocation across debt and equity based on your age, goals, and risk appetite.",
    author: "Moneva Team",
    date: "2024-02-20",
    readTime: "6 min read",
    category: "Portfolio",
    content: [
      "Asset allocation — how you split money between equity, debt, and other assets — explains more of your long-term returns than the individual funds you pick.",
      "A common starting point is the '100 minus age' rule: if you're 30, hold roughly 70% equity and 30% debt. It's crude, but it captures the key idea — take more risk when you have time to recover.",
      "Match the horizon, not the mood. Money you need within 3 years should sit in debt or liquid instruments, no matter how bullish equity markets look. Money you don't need for 10+ years belongs in equity, no matter how scary the headlines get.",
      "Rebalance yearly. If equity rallies and your allocation drifts from 70/30 to 80/20, sell some equity and top up debt. This forces you to book profits high and buy low — mechanically, without emotion.",
      "Don't forget gold and international equity. A 5–10% allocation to each adds diversification and hedges against rupee depreciation.",
    ],
  },
  {
    id: 6,
    slug: "reading-a-mutual-fund-factsheet-like-a-pro",
    title: "Reading a Mutual Fund Factsheet Like a Pro",
    excerpt:
      "Expense ratio, standard deviation, Sharpe, alpha — decode every number that matters before you invest.",
    author: "Moneva Team",
    date: "2024-02-12",
    readTime: "8 min read",
    category: "Investment",
    content: [
      "A factsheet is a fund's monthly report card. Learning to read one takes ten minutes and saves you from a lot of bad decisions.",
      "Expense ratio is the annual fee, expressed as a % of your investment. Anything under 1% for equity and under 0.5% for debt is reasonable. Direct plans are always cheaper than regular plans — prefer them if you invest on your own.",
      "Standard deviation measures how much returns swing around the average. Higher SD means a bumpier ride. Compare it against category peers, not across categories.",
      "Sharpe ratio tells you the return earned per unit of risk. Higher is better. A Sharpe of 1+ over 3–5 years is a good sign; below 0.5 suggests the fund isn't rewarding you for the volatility.",
      "Alpha measures excess return over the benchmark. Positive alpha means the manager is adding value; negative alpha means you'd have been better off in an index fund.",
      "Portfolio turnover shows how frequently the manager churns holdings. Very high turnover in equity funds usually signals a lack of conviction and adds hidden costs.",
      "Finally, check the top 10 holdings and sector allocation. If two 'different' funds in your portfolio hold the same top stocks, you're not diversified — you're doubled up.",
    ],
  },
];

export const getPostBySlug = (slug: string) =>
  blogPosts.find((p) => p.slug === slug);
