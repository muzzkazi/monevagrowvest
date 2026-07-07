import PageLayout from "@/components/shared/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CalendarDays, Clock, User, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "5 Essential Steps to Start Your SIP Journey",
    excerpt:
      "Learn how to begin systematic investment planning with our beginner-friendly guide to building wealth through disciplined investing.",
    author: "Moneva Team",
    date: "2024-03-15",
    readTime: "5 min read",
    category: "Investment",
  },
  {
    id: 2,
    title: "Tax Saving Strategies for New Investors",
    excerpt:
      "Discover smart tax planning techniques that can help young professionals save money while building their investment portfolio.",
    author: "Moneva Team",
    date: "2024-03-10",
    readTime: "7 min read",
    category: "Tax Planning",
  },
  {
    id: 3,
    title: "Building Your First Emergency Fund",
    excerpt:
      "Why every young professional needs an emergency fund and how to build one systematically without compromising your lifestyle.",
    author: "Moneva Team",
    date: "2024-03-05",
    readTime: "4 min read",
    category: "Financial Planning",
  },
  {
    id: 4,
    title: "Understanding Mutual Fund Categories",
    excerpt:
      "A simple guide to different types of mutual funds and how to choose the right ones for your investment goals.",
    author: "Moneva Team",
    date: "2024-02-28",
    readTime: "6 min read",
    category: "Investment",
  },
  {
    id: 5,
    title: "Debt vs Equity: Building a Balanced Portfolio",
    excerpt:
      "How to think about asset allocation across debt and equity based on your age, goals, and risk appetite.",
    author: "Moneva Team",
    date: "2024-02-20",
    readTime: "6 min read",
    category: "Portfolio",
  },
  {
    id: 6,
    title: "Reading a Mutual Fund Factsheet Like a Pro",
    excerpt:
      "Expense ratio, standard deviation, Sharpe, alpha — decode every number that matters before you invest.",
    author: "Moneva Team",
    date: "2024-02-12",
    readTime: "8 min read",
    category: "Investment",
  },
];

const Blog = () => {
  return (
    <PageLayout>
      <section className="py-16 sm:py-24 bg-financial-muted">
        <div className="container mx-auto px-4">
          {/* Page header — icon/badge + serif H1 + one-line description */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <Badge
              variant="outline"
              className="mb-5 inline-flex items-center gap-1.5 border-financial-accent/40 bg-financial-accent/10 text-financial-accent px-3 py-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Blog
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              Financial{" "}
              <span className="text-financial-accent">Insights</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Practical guides on investing, tax planning and building wealth — written by the Moneva team.
            </p>
          </div>

          {/* Article grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card
                key={post.id}
                className="group flex flex-col border-border/60 bg-card shadow-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-financial-accent bg-financial-accent/10 px-2.5 py-1 rounded-full">
                      {post.category}
                    </span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="font-display text-xl leading-snug group-hover:text-financial-accent transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center">
                        <User className="w-3.5 h-3.5 mr-1" />
                        {post.author}
                      </span>
                      <span className="inline-flex items-center">
                        <CalendarDays className="w-3.5 h-3.5 mr-1" />
                        {new Date(post.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-financial-accent hover:text-financial-accent hover:bg-financial-accent/10"
                    >
                      Read article
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-muted-foreground mb-4">More articles coming soon.</p>
            <Button variant="outline">Subscribe to our newsletter</Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Blog;
