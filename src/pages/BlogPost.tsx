import { useParams, Link, Navigate } from "react-router-dom";
import PageLayout from "@/components/shared/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CalendarDays, Clock, User, ArrowLeft, ArrowRight } from "lucide-react";
import { blogPosts, getPostBySlug } from "@/data/blogPosts";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const currentIndex = blogPosts.findIndex((p) => p.slug === post.slug);
  const related = blogPosts.filter((_, i) => i !== currentIndex).slice(0, 3);

  return (
    <PageLayout>
      <article className="py-16 sm:py-24 bg-financial-muted">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-financial-accent transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <header className="mb-10">
            <Badge
              variant="outline"
              className="mb-5 inline-flex items-center gap-1.5 border-financial-accent/40 bg-financial-accent/10 text-financial-accent px-3 py-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {post.category}
            </Badge>
            <h1 className="font-display text-3xl sm:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-border/60 pt-5">
              <span className="inline-flex items-center">
                <User className="w-4 h-4 mr-1.5" />
                {post.author}
              </span>
              <span className="inline-flex items-center">
                <CalendarDays className="w-4 h-4 mr-1.5" />
                {new Date(post.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="inline-flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                {post.readTime}
              </span>
            </div>
          </header>

          <div className="prose prose-lg max-w-none">
            {post.content.map((para, i) => (
              <p
                key={i}
                className="text-base sm:text-lg leading-relaxed text-foreground/90 mb-5"
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="py-16 sm:py-20 bg-background border-t border-border/60">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-8 text-center">
              Continue reading
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="group flex flex-col p-5 rounded-lg border border-border/60 bg-card shadow-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="text-xs font-medium text-financial-accent bg-financial-accent/10 px-2.5 py-1 rounded-full self-start mb-3">
                    {p.category}
                  </span>
                  <h3 className="font-display text-lg leading-snug mb-2 group-hover:text-financial-accent transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {p.excerpt}
                  </p>
                  <span className="mt-auto inline-flex items-center text-sm text-financial-accent">
                    Read article
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button asChild variant="outline">
                <Link to="/blog">View all articles</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </PageLayout>
  );
};

export default BlogPost;
