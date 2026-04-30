import { useParams, Link } from "wouter";
import { BLOG_POSTS } from "./blog";
import { Clock, ChevronLeft, ChevronRight, Database, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPost() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="container max-w-screen-xl px-4 py-20 mx-auto text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Article not found</h1>
        <Link href="/blog">
          <Button variant="outline">← Back to all guides</Button>
        </Link>
      </div>
    );
  }

  const postIndex = BLOG_POSTS.findIndex(p => p.slug === slug);
  const nextPost = BLOG_POSTS[postIndex + 1] ?? null;

  return (
    <div className="container max-w-screen-xl px-4 py-10 mx-auto">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* Back */}
        <Link href="/blog">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            All guides
          </button>
        </Link>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />{post.readTime}
            </span>
            <span className="text-xs text-muted-foreground">{post.date}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">{post.title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{post.description}</p>
        </div>

        {/* Content */}
        <div className="prose-dba">
          <BlogContent content={post.content} />
        </div>

        {/* CTA */}
        <div className="bg-card border border-primary/20 rounded-xl p-8 space-y-4">
          <Database className="h-8 w-8 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Practice this in a real scenario</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            DBA Forge builds your skills around production crises — not slides. This exact topic is covered in a hands-on module where you work through the incident step by step.
          </p>
          <Link href="/modules">
            <Button className="h-10 px-6">
              Start Training Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Next article */}
        {nextPost && (
          <Link href={`/blog/${nextPost.slug}`}>
            <div className="group flex items-center justify-between bg-card border border-border/50 rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Next article</p>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">{nextPost.title}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
          </Link>
        )}
      </div>

      <style>{`
        .prose-dba h2 { 
          font-size: 1.5rem; font-weight: 700; color: hsl(var(--foreground)); 
          margin-top: 2.5rem; margin-bottom: 1rem; padding-bottom: 0.5rem; 
          border-bottom: 1px solid hsl(var(--border) / 0.4);
        }
        .prose-dba h3 { 
          font-size: 1.15rem; font-weight: 700; color: hsl(var(--foreground)); 
          margin-top: 1.75rem; margin-bottom: 0.75rem; 
        }
        .prose-dba p { 
          color: hsl(var(--muted-foreground)); line-height: 1.75; margin-bottom: 1rem; font-size: 0.9375rem;
        }
        .prose-dba strong { color: hsl(var(--foreground)); font-weight: 600; }
        .prose-dba ul, .prose-dba ol { 
          margin-left: 1.5rem; margin-bottom: 1rem; color: hsl(var(--muted-foreground)); 
        }
        .prose-dba li { margin-bottom: 0.35rem; line-height: 1.65; font-size: 0.9375rem; }
        .prose-dba pre { 
          background: #0d0d0d; border: 1px solid hsl(var(--border) / 0.4); 
          border-radius: 0.75rem; padding: 1.25rem; overflow-x: auto; margin: 1.5rem 0;
        }
        .prose-dba code { 
          font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace; 
          font-size: 0.8125rem; color: #4ade80; line-height: 1.6;
        }
        .prose-dba p code {
          background: hsl(var(--card)); border: 1px solid hsl(var(--border) / 0.5);
          border-radius: 0.25rem; padding: 0.1em 0.4em; color: hsl(var(--primary));
          font-size: 0.8125rem;
        }
        .prose-dba table { 
          width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.875rem;
        }
        .prose-dba th { 
          background: hsl(var(--card)); text-align: left; padding: 0.6rem 1rem; 
          font-weight: 600; color: hsl(var(--foreground)); 
          border-bottom: 2px solid hsl(var(--border) / 0.5); 
        }
        .prose-dba td { 
          padding: 0.55rem 1rem; border-bottom: 1px solid hsl(var(--border) / 0.3); 
          color: hsl(var(--muted-foreground));
        }
        .prose-dba tr:last-child td { border-bottom: none; }
      `}</style>
    </div>
  );
}

function BlogContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  const elements: React.ReactNode[] = [];

  parts.forEach((part, i) => {
    if (part.startsWith("```")) {
      const code = part.replace(/^```[a-z]*\n?/, "").replace(/```$/, "");
      elements.push(<pre key={i}><code>{code}</code></pre>);
    } else {
      const lines = part.split("\n");
      let j = 0;
      while (j < lines.length) {
        const line = lines[j];
        if (line.startsWith("## ")) {
          elements.push(<h2 key={`${i}-${j}`}>{line.slice(3)}</h2>);
        } else if (line.startsWith("### ")) {
          elements.push(<h3 key={`${i}-${j}`}>{line.slice(4)}</h3>);
        } else if (line.startsWith("| ")) {
          const tableLines = [];
          while (j < lines.length && lines[j].startsWith("|")) {
            tableLines.push(lines[j]);
            j++;
          }
          const rows = tableLines.filter(l => !l.match(/^\|[-| ]+\|$/));
          elements.push(
            <table key={`${i}-tbl-${j}`}>
              <thead>
                <tr>{rows[0].split("|").filter(Boolean).map((cell, ci) => <th key={ci}>{cell.trim()}</th>)}</tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri}>{row.split("|").filter(Boolean).map((cell, ci) => <td key={ci}>{cell.trim()}</td>)}</tr>
                ))}
              </tbody>
            </table>
          );
          continue;
        } else if (line.startsWith("- **") || line.startsWith("- ")) {
          const listItems = [];
          while (j < lines.length && lines[j].startsWith("- ")) {
            listItems.push(lines[j].slice(2));
            j++;
          }
          elements.push(
            <ul key={`${i}-ul-${j}`}>
              {listItems.map((item, li) => (
                <li key={li} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              ))}
            </ul>
          );
          continue;
        } else if (line.trim() !== "") {
          elements.push(<p key={`${i}-${j}`} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />);
        }
        j++;
      }
    }
  });

  return <>{elements}</>;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}
