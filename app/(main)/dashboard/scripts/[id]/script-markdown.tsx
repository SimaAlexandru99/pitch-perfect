"use client";
import dynamic from "next/dynamic";
import React from "react";

const Markdown = dynamic(() => import("react-markdown"), { ssr: false });

interface ScriptMarkdownProps {
  content: string;
}

export default function ScriptMarkdown({ content }: ScriptMarkdownProps) {
  return <Markdown>{content}</Markdown>;
}
