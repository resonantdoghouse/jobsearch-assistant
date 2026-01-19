"use client";

import { ResumePreview } from "@/components/ResumePreview";

export function ResumeEditor({ resume }: { resume: any }) {
  let content;
  try {
    content = JSON.parse(resume.latestContent);
  } catch {
    content = resume.latestContent;
  }

  const latestVersion =
    resume.versions && resume.versions.length > 0
      ? resume.versions[resume.versions.length - 1]
      : null;
  const analysis = latestVersion?.feedback;

  const handleSave = async (updatedContent: any) => {
    try {
      const res = await fetch(`/api/resumes/${resume._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: updatedContent }),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      alert("Resume updated successfully!");
    } catch (error) {
      console.error("Save error", error);
      alert("Failed to save changes.");
    }
  };

  return (
    <ResumePreview
      content={content}
      analysis={analysis}
      isEditable={true}
      onSave={handleSave}
    />
  );
}
