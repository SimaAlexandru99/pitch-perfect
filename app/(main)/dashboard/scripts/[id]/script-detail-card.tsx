"use client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import ScriptMarkdown from "./script-markdown";
import UpvoteScriptBtn from "./upvote-script-btn";

interface ScriptDetailCardProps {
  script: {
    title: string;
    tags: string[];
    authorName: string;
    createdAt: string;
    upvotes: string[];
    content: string;
    id: string;
  };
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } },
};

const badgeVariants = {
  hidden: { scale: 0.7, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 300 },
  },
};

export default function ScriptDetailCard({ script }: ScriptDetailCardProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="w-full"
    >
      <Card className="w-full p-6 flex flex-col gap-4 bg-gradient-to-br from-background/80 to-muted/60 border border-border/40 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">{script.title}</h1>
        <div className="flex flex-wrap gap-2">
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
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>By {script.authorName}</span>
          <span>•</span>
          <span>{new Date(script.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <UpvoteScriptBtn scriptId={script.id} upvotes={script.upvotes} />
        </div>
        <div className="prose prose-invert max-w-none bg-background/90 rounded-md p-4 text-base shadow-inner">
          <ScriptMarkdown content={script.content} />
        </div>
      </Card>
    </motion.div>
  );
}
