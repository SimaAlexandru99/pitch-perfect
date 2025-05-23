"use client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ThumbsUp } from "lucide-react";
import Link from "next/link";

interface Script {
  id: string;
  title: string;
  content: string;
  tags: string[];
  authorName: string;
  createdAt: string;
  upvotes: string[];
}

interface ScriptsListProps {
  scripts: Script[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, type: "spring", stiffness: 80 },
  }),
};

const badgeVariants = {
  hidden: { scale: 0.7, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 300 },
  },
};

export default function ScriptsList({ scripts }: ScriptsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {scripts.map((script, idx) => (
        <motion.div
          key={script.id}
          custom={idx}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover={{
            scale: 1.025,
            boxShadow: "0 8px 32px 0 rgba(0,0,0,0.10)",
          }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className="w-full p-4 flex flex-col gap-2 bg-gradient-to-br from-background/80 to-muted/60 border border-border/40 shadow-md">
            <Link
              href={`/dashboard/scripts/${script.id}`}
              className="font-semibold text-lg hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              {script.title}
            </Link>
            <div className="flex flex-wrap gap-2 mt-1">
              {script.tags.map((tag) => (
                <motion.div
                  key={tag}
                  initial="hidden"
                  animate="visible"
                  variants={badgeVariants}
                >
                  <Badge variant="secondary">{tag}</Badge>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <span>By {script.authorName}</span>
              <span>•</span>
              <span>{new Date(script.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <ThumbsUp className="size-4 text-primary" />
              <span className="font-semibold">{script.upvotes.length}</span>
            </div>
            <div className="text-sm text-muted-foreground line-clamp-3 mt-1">
              {script.content.slice(0, 120)}
              {script.content.length > 120 ? (
                <>
                  ...{" "}
                  <Link
                    href={`/dashboard/scripts/${script.id}`}
                    className="text-primary underline text-xs ml-1"
                  >
                    Read more
                  </Link>
                </>
              ) : null}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
