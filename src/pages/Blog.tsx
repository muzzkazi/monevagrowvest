import { Link } from "react-router-dom";
import PageLayout from "@/components/shared/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CalendarDays, Clock, User, ArrowRight } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";


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
