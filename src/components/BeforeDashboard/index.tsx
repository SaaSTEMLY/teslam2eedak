import React from "react";

import Link from "@/components/Link/customLink";
import { SeedButton } from "./SeedButton";
import { AnalyticsDashboard } from "./analytics-dashboard";
import "./index.scss";

const baseClass = "before-dashboard";

export const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <AnalyticsDashboard />
      <div style={{ marginTop: "1.5rem", padding: "0 1rem" }}>
        <details>
          <summary
            style={{ cursor: "pointer", fontSize: "0.875rem", color: "#666" }}
          >
            Getting Started Guide
          </summary>
          <ul className={`${baseClass}__instructions`}>
            <li>
              <SeedButton />
              {
                " with a few products and pages to jump-start your new project, then "
              }
              {}
              <Link href="/">visit your website</Link>
              {" to see the results."}
            </li>
            <li>
              {"Modify your "}
              <Link
                href="https://payloadcms.com/docs/configuration/collections"
                rel="noopener noreferrer"
                target="_blank"
              >
                collections
              </Link>
              {" and add more "}
              <Link
                href="https://payloadcms.com/docs/fields/overview"
                rel="noopener noreferrer"
                target="_blank"
              >
                fields
              </Link>
              {
                " as needed. If you are new to Payload, we also recommend you check out the "
              }
              <Link
                href="https://payloadcms.com/docs/getting-started/what-is-payload"
                rel="noopener noreferrer"
                target="_blank"
              >
                Getting Started
              </Link>
              {" docs."}
            </li>
          </ul>
        </details>
      </div>
    </div>
  );
};
