"use client";

import {
  RichText as PayloadRichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import {
  Code,
  CodeBlock,
  CodeHeader,
} from "@/components/animate-ui/components/animate/code";
import { File } from "lucide-react";

interface RichTextProps {
  data: SerializedEditorState | null | undefined;
}

const languageLabels: Record<string, string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  css: "CSS",
  html: "HTML",
  json: "JSON",
  python: "Python",
  bash: "Bash",
  shell: "Shell",
};

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Code: ({ node }: { node: any }) => {
      const { code, language } = node.fields as {
        code: string;
        language?: string;
      };
      const lang = language || "typescript";
      const label = languageLabels[lang] || lang;

      return (
        <Code code={code} className="not-prose my-6">
          <CodeHeader icon={File} copyButton>
            {label}
          </CodeHeader>
          <CodeBlock lang={lang} />
        </Code>
      );
    },
  },
});

export function RichText({ data }: RichTextProps) {
  if (!data) return null;

  return <PayloadRichText data={data} converters={converters} />;
}
