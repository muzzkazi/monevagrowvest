import PageLayout from "@/components/shared/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, User } from "lucide-react";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "5 Essential Steps to Start Your SIP Journey",
      excerpt: "Learn how to begin systematic investment planning with our beginner-friendly guide to building wealth through disciplined investing.",
      author: "Moneva Team",
      date: "2024-03-15",
      readTime: "5 min read",
      category: "Investment"
    },
    {
      id: 2,
      title: "Tax Saving Strategies for New Investors",
      excerpt: "Discover smart tax planning techniques that can help young professionals save money while building their investment portfolio.",
      author: "Moneva Team",
      date: "2024-03-10",
      readTime: "7 min read",
      category: "Tax Planning"
    },
    {
      id: 3,
      title: "Building Your First Emergency Fund",
      excerpt: "Why every young professional needs an emergency fund and how to build one systematically without compromising your lifestyle.",
      author: "Moneva Team",
      date: "2024-03-05",
      readTime: "4 min read",
      category: "Financial Planning"
    },
    {
      id: 4,
      title: "Understanding Mutual Fund Categories",
      excerpt: "A simple guide to different types of mutual funds and how to choose the right ones for your investment goals.",
      author: "Moneva Team",
      date: "2024-02-28",
      readTime: "6 min read",
      category: "Investment"
    }
  ];

  return (
    <PageLayout>
      <div className="pt-20">
        <section className="py-20 bg-financial-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold mb-6">
                Financial <span className="text-financial-accent">Insights</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Stay updated with the latest financial tips, investment strategies, and market insights to make informed decisions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Card key={post.id} className="hover-scale bg-white border-0 shadow-card">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-financial-accent bg-financial-accent/10 px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                    <CardTitle className="text-xl leading-tight">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-1" />
                        <span className="mr-3">{post.author}</span>
                        <CalendarDays className="w-4 h-4 mr-1" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-16">
              <p className="text-muted-foreground mb-6">More articles coming soon!</p>
              <Button variant="outline">
                Subscribe to Our Newsletter
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Blog;