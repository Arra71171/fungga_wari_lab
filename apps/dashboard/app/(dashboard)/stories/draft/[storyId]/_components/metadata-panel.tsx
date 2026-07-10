import * as React from "react";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Input } from "@workspace/ui/components/input";
import { DashboardCard } from "@workspace/ui/components/DashboardCard";
import { CoverImageUpload } from "@/components/cover-image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

type MetadataPanelProps = {
  coverImageUrl: string;
  setCoverImageUrl: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  language: string;
  setLanguage: (val: string) => void;
  seriesId: string;
  setSeriesId: (val: string) => void;
  seriesOrder: number | "";
  setSeriesOrder: (val: number | "") => void;
  authorSeries: { id: string; title: string }[];
  STORY_CATEGORIES: readonly { value: string; label: string }[];
  STORY_LANGUAGES: readonly { value: string; label: string }[];
};

export function MetadataPanel({
  coverImageUrl,
  setCoverImageUrl,
  description,
  setDescription,
  category,
  setCategory,
  language,
  setLanguage,
  seriesId,
  setSeriesId,
  seriesOrder,
  setSeriesOrder,
  authorSeries,
  STORY_CATEGORIES,
  STORY_LANGUAGES,
}: MetadataPanelProps) {
  return (
    <DashboardCard variant="panel" padding="md" className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 mt-6 bg-bg-panel border-border-strong">
      <div className="space-y-2">
        <Label className="text-fine font-sans font-medium tracking-wide text-muted-foreground">
          Cover Art
        </Label>
        <div className="border border-border/50 bg-bg-surface h-full min-h-[250px]">
          <CoverImageUpload
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            className="w-full h-full aspect-[3/4]"
          />
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-fine font-sans font-medium tracking-wide text-muted-foreground">
            Short Description
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief summary of the story..."
            className="min-h-[100px] resize-none border border-border/50 bg-bg-surface rounded-none focus-visible:ring-1 focus-visible:ring-brand-ember/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-fine font-sans font-medium tracking-wide text-muted-foreground">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="flex h-10 w-full border border-border/50 bg-bg-surface px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-ember/50 text-foreground rounded-none">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="border border-border/50 rounded-none shadow-xs bg-bg-surface">
                {STORY_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="font-sans text-sm focus:bg-primary focus:text-primary-foreground rounded-none cursor-pointer">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-fine font-sans font-medium tracking-wide text-muted-foreground">
              Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="flex h-10 w-full border border-border/50 bg-bg-surface px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-ember/50 text-foreground rounded-none">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent className="border border-border/50 rounded-none shadow-xs bg-bg-surface">
                {STORY_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value} className="font-sans text-sm focus:bg-primary focus:text-primary-foreground rounded-none cursor-pointer">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {authorSeries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-fine font-sans font-medium tracking-wide text-muted-foreground">
                Series
              </Label>
              <Select value={seriesId} onValueChange={setSeriesId}>
                <SelectTrigger className="flex h-10 w-full border border-border/50 bg-bg-surface px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-ember/50 text-foreground rounded-none">
                  <SelectValue placeholder="No Series" />
                </SelectTrigger>
                <SelectContent className="border border-border/50 rounded-none shadow-xs bg-bg-surface">
                  <SelectItem value="none" className="font-sans text-sm focus:bg-primary focus:text-primary-foreground rounded-none cursor-pointer text-muted-foreground">
                    No Series
                  </SelectItem>
                  {authorSeries.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="font-sans text-sm focus:bg-primary focus:text-primary-foreground rounded-none cursor-pointer">
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {seriesId !== "none" && (
              <div className="space-y-2">
                <Label className="text-fine font-sans font-medium tracking-wide text-muted-foreground">
                  Order in Series
                </Label>
                <Input
                  type="number"
                  value={seriesOrder}
                  onChange={(e) => setSeriesOrder(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g. 1"
                  className="h-10 border border-border/50 bg-bg-surface rounded-none focus-visible:ring-1 focus-visible:ring-brand-ember/50"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
