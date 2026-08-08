"use client";

import { useState } from "react";
import { Download, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { useResources } from "@/features/resources/hooks/useResources";
import { type ResourceItem } from "@/features/resources/constants/resources";

export function ResourcesPage() {
  const resources = useResources();
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  const handleOpenResource = (resource: ResourceItem) => {
    // 1. Trigger template download if content exists
    if (resource.content && resource.downloadFileName) {
      const blob = new Blob([resource.content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = resource.downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloadedId(resource.id);
      setTimeout(() => setDownloadedId(null), 3000);
    }

    // 2. Open official site link in a new tab
    if (resource.externalUrl) {
      window.open(resource.externalUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="p-6 lg:p-8">
      <SectionHeading title="Resource Library" subtitle="Learning hub, templates, and community assets for execution-ready founders." />
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {resources.map((resource) => {
          const isDownloaded = downloadedId === resource.id;
          return (
            <article key={resource.id || resource.title} className="flex flex-col justify-between rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6 transition hover:border-femtrex-violet/60">
              <div>
                <Badge variant={resource.category === "Templates" ? "pink" : resource.category === "Community" ? "amber" : "violet"}>
                  {resource.category}
                </Badge>
                <h3 className="mt-5 text-xl font-semibold text-white">{resource.title}</h3>
                <p className="mt-3 text-sm leading-6 text-femtrex-soft">{resource.description}</p>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Button
                  variant={isDownloaded ? "gradient" : "outline"}
                  className={`w-full transition-all ${isDownloaded ? "bg-emerald-600 text-white hover:bg-emerald-500" : ""}`}
                  onClick={() => handleOpenResource(resource)}
                >

                  {isDownloaded ? (
                    <>
                      <CheckCircle className="mr-2 size-4 text-white" />
                      Downloaded & Opened!
                    </>
                  ) : resource.category === "Community" ? (
                    <>
                      <ExternalLink className="mr-2 size-4" />
                      Open Community Platform
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 size-4" />
                      Download & Open Portal
                    </>
                  )}
                </Button>
                <p className="text-center text-[11px] text-femtrex-soft/70">
                  {resource.content ? "Downloads .MD template & opens official site" : "Opens official community portal"}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

