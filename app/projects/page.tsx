"use client";

import React, { useState, useEffect } from "react";
import { AppHeader } from "@/components/ui/app-header";
import { motion } from "motion/react";
import {
  Trophy,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Zap,
} from "lucide-react";
import curriculumData from "@/data/curriculum.json";
import { CurriculumData, ProjectItem } from "@/lib/types";
import {
  getProjectStatuses,
  setProjectStatus,
  getStudyLog,
  ProjectStatusType,
} from "@/lib/storage";
import { getCurrentStreak } from "@/lib/pace";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const curriculum = curriculumData as CurriculumData;

type ToneVariant = "excited" | "reflective" | "professional";

function generatePostVariants(project: ProjectItem) {
  const skills = project.topicIds.join(", ");
  return {
    excited: `🚀 MILESTONE UNLOCKED: Built ${project.title}!

Just completed the ${project.title} project as part of my Python Mastery Journey! 

💡 What I built & concepts practiced:
• ${project.description}
• Applied core skills in: ${skills}
• Pushed through stretch goals & error handling

Building in public and taking my Python software engineering skills to the next level. Let's connect!

#Python #100DaysOfCode #BuildInPublic #SoftwareEngineering #PythonDeveloper #TechCommunity`,

    reflective: `🧠 Learning Reflection: ${project.title}

Spent the past ~${project.estimatedHours} hours building a ${project.title}.

Key takeaways from this build:
1. Writing clean, modular Python logic beats rushing to ship.
2. Hands-on debugging reinforced my understanding of ${skills}.
3. Simple, readable code is always better than complex clever code.

What Python projects are you working on right now? Would love feedback on my approach!

#Python #LearningInPublic #CodeNewbie #SoftwareEngineer #PythonCode`,

    professional: `Excited to share my latest Python engineering milestone: ${project.title}.

Project Summary:
${project.description}

Technical Focus:
• Developed scalable Python architecture
• Applied domain skills: ${skills}
• Implemented robust error handling & output formatting

GitHub Repository & documentation ready. Open to feedback and technical discussions!

#Python #SoftwareDevelopment #OpenToWork #BackendEngineering #PythonProject`,
  };
}

export default function ProjectsPage() {
  const [projectStatuses, setProjectStatuses] = useState<Record<string, { status: ProjectStatusType }>>({});
  const [studyLog, setStudyLog] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneVariant>("excited");
  const [postText, setPostText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProjectStatuses(getProjectStatuses());
    setStudyLog(getStudyLog());
    setIsLoaded(true);
  }, []);

  const streak = getCurrentStreak(studyLog);

  const handleStatusChange = (projectId: string, newStatus: ProjectStatusType) => {
    const result = setProjectStatus(projectId, newStatus);
    setProjectStatuses({ ...result.projectStatus });
    setStudyLog([...result.studyLog]);

    if (newStatus === "completed") {
      const proj = curriculum.projects.find((p) => p.id === projectId);
      if (proj) {
        openLinkedInModal(proj);
      }
    }
  };

  const openLinkedInModal = (project: ProjectItem) => {
    setSelectedProject(project);
    const variants = generatePostVariants(project);
    setPostText(variants["excited"]);
    setSelectedTone("excited");
    setCopied(false);
  };

  const handleToneChange = (tone: ToneVariant) => {
    if (!selectedProject) return;
    setSelectedTone(tone);
    const variants = generatePostVariants(selectedProject);
    setPostText(variants[tone]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(postText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postText)}`;
    window.open(url, "_blank");
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#0038FF] dark:bg-[#02040A] text-white font-sans transition-colors duration-300">
      <AppHeader streak={streak.current} />

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] dark:text-[#00D4FF]">
              HANDS-ON PORTFOLIO
            </span>
            <h1
              className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mt-1 dark:[text-shadow:0_2px_10px_rgba(0,56,255,0.4)]"
              style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
            >
              MILESTONE PROJECTS
            </h1>
            <p className="text-xs text-white/60 dark:text-white/70 mt-1">
              Build real-world Python applications and share your achievements
            </p>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {curriculum.projects.map((project) => {
            const pState = projectStatuses[project.id]?.status || "not-started";
            const isDone = pState === "completed";

            return (
              <div
                key={project.id}
                className={`bg-white/10 dark:bg-[#0038FF]/[0.02] backdrop-blur-xl border rounded-[2rem] p-6 flex flex-col justify-between transition-all duration-300 ${
                  isDone
                    ? "border-[#CCFF00]/50 dark:border-[#00D4FF]/50 shadow-[0_0_30px_rgba(0,212,255,0.2)]"
                    : "border-white/20 dark:border-white/10 dark:hover:border-[#00D4FF]/40 dark:hover:shadow-[0_0_30px_rgba(0,212,255,0.1)] dark:hover:bg-[#0038FF]/[0.05]"
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] dark:bg-[#00D4FF]/10 dark:border-[#00D4FF]/30 dark:text-[#00D4FF]">
                      {project.difficulty}
                    </span>
                    <span className="text-xs font-semibold text-white/50 dark:text-white/50">
                      ~{project.estimatedHours} Hours
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-xl font-bold text-white mb-2 dark:text-white">
                    {project.title}
                  </h3>
                  <p className="text-xs text-white/70 dark:text-white/70 leading-relaxed mb-4">
                    {project.description}
                  </p>

                  {/* Topic IDs Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.topicIds.map((tId) => (
                      <span
                        key={tId}
                        className="text-[10px] bg-white/10 dark:bg-white/5 text-white/70 dark:text-white dark:border dark:border-white/15 px-2.5 py-1 rounded-md font-mono"
                      >
                        #{tId}
                      </span>
                    ))}
                  </div>

                  {/* Stretch Goals */}
                  {project.stretchGoals && project.stretchGoals.length > 0 && (
                    <div className="mb-6 bg-white/5 dark:bg-white/[0.02] p-3 rounded-xl border border-white/10 dark:border-white/10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#CCFF00] dark:text-[#00D4FF] block mb-1">
                        Stretch Goals:
                      </span>
                      <ul className="text-xs text-white/60 dark:text-white/60 space-y-1">
                        {project.stretchGoals.map((goal, i) => (
                          <li key={i}>• {goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Controls Footer */}
                <div className="pt-4 border-t border-white/10 dark:border-white/10 flex items-center justify-between gap-4">
                  {/* Status Select */}
                  <select
                    value={pState}
                    onChange={(e) => handleStatusChange(project.id, e.target.value as ProjectStatusType)}
                    className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/15 text-xs font-semibold text-white rounded-full px-4 py-2 outline-none cursor-pointer hover:bg-white/20 dark:hover:bg-white/10"
                  >
                    <option value="not-started" className="bg-[#001A99] dark:bg-[#050714] text-white">Not Started</option>
                    <option value="in-progress" className="bg-[#001A99] dark:bg-[#050714] text-white">In Progress ⚡</option>
                    <option value="completed" className="bg-[#001A99] dark:bg-[#050714] text-white">Completed ✓</option>
                  </select>

                  {isDone && (
                    <button
                      onClick={() => openLinkedInModal(project)}
                      className="flex items-center gap-1.5 bg-[#CCFF00] text-black font-bold text-xs px-4 py-2 rounded-full hover:scale-105 transition-transform"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Generate LinkedIn Post
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ═══════════════════════════════════
          LINKEDIN GENERATOR MODAL
          ═══════════════════════════════════ */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="bg-[#001A99] border-white/20 text-white sm:max-w-xl p-6 rounded-3xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-[#CCFF00]" />
              <DialogTitle className="text-xl font-bold uppercase text-[#CCFF00]">
                LinkedIn Post Generator
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-white/70">
              Celebrate your milestone: <span className="text-white font-semibold">{selectedProject?.title}</span>
            </DialogDescription>
          </DialogHeader>

          {/* Tone Selector */}
          <div className="flex items-center gap-2 my-3">
            <span className="text-xs text-white/50 font-semibold">Tone:</span>
            {(
              [
                { id: "excited", label: "🔥 Milestone" },
                { id: "reflective", label: "🧠 Reflective" },
                { id: "professional", label: "💼 Concise" },
              ] as { id: ToneVariant; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => handleToneChange(t.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  selectedTone === t.id
                    ? "bg-[#CCFF00] text-black"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Text Area */}
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={10}
            className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-xs font-mono text-white/90 outline-none focus:border-[#CCFF00] resize-none"
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                copied ? "bg-emerald-500 text-white" : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied! ✓" : "Copy to Clipboard"}
            </button>

            <button
              onClick={handleShareLinkedIn}
              className="flex items-center gap-2 bg-[#CCFF00] text-black font-bold text-xs px-6 py-2.5 rounded-full hover:scale-105 transition-transform"
            >
              <ExternalLink className="h-4 w-4" />
              Share on LinkedIn
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
