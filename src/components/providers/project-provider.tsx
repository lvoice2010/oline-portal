"use client";

import * as React from "react";

export type ProjectType = "fte" | "multi";

type Ctx = {
  project: string;
  setProject: (p: string) => void;
  projectType: ProjectType;
  setProjectType: (t: ProjectType) => void;
  hasCallback: boolean;
};

export const PROJECTS = ["Все проекты", "Горячая линия", "Исходящая кампания Q2 2026"];

const ProjectCtx = React.createContext<Ctx | null>(null);

export function useProject() {
  const ctx = React.useContext(ProjectCtx);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = React.useState(PROJECTS[0]);
  const [projectType, setProjectType] = React.useState<ProjectType>("multi");

  return (
    <ProjectCtx.Provider
      value={{ project, setProject, projectType, setProjectType, hasCallback: true }}
    >
      {children}
    </ProjectCtx.Provider>
  );
}
