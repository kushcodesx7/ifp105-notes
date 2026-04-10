"use client";

import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const LS_KEY = "ifp105_tour_done";

// Tour steps for the landing page
const landingSteps = [
  {
    element: "[data-tour='badge']",
    popover: {
      title: "👋 Welcome to IFP105!",
      description: "These are your interactive ICT study notes. Let me show you around — takes 30 seconds!",
      side: "bottom" as const,
    },
  },
  {
    element: "[data-tour='cta']",
    popover: {
      title: "🚀 Start Here",
      description: "Click this button to jump straight into Module 1. You can study at your own pace.",
      side: "bottom" as const,
    },
  },
  {
    element: "[data-tour='stats']",
    popover: {
      title: "📊 What's Inside",
      description: "5 modules, 47 topics, 480 practice questions — everything you need for your ICT exam.",
      side: "top" as const,
    },
  },
  {
    element: "[data-tour='module-1']",
    popover: {
      title: "📘 Your First Module",
      description: "Start with Hardware & Software. Each module has topics, quizzes, flashcards, and a cheat sheet.",
      side: "right" as const,
    },
  },
  {
    element: "[data-tour='xp-bar']",
    popover: {
      title: "🏆 Earn XP & Badges",
      description: "Complete topics and quizzes to earn XP points, level up, and unlock badges. Track your streak here!",
      side: "top" as const,
    },
  },
];

// Tour steps for module pages
const moduleSteps = [
  {
    element: "[data-tour='tab-bar']",
    popover: {
      title: "📑 Topic Tabs",
      description: "Switch between topics by clicking these tabs. Green checkmarks show completed topics. Use ← → arrow keys too!",
      side: "bottom" as const,
    },
  },
  {
    element: "[data-tour='progress']",
    popover: {
      title: "📊 Your Progress",
      description: "This bar shows how many topics you've completed. Aim for 100%!",
      side: "left" as const,
    },
  },
  {
    element: "[data-tour='topic-content']",
    popover: {
      title: "📖 Study the Topic",
      description: "Read the content, check the analogies, and look at the cards. Everything is designed to make concepts stick.",
      side: "top" as const,
    },
  },
  {
    element: "[data-tour='quiz-section']",
    popover: {
      title: "✅ Test Yourself",
      description: "After studying, take the quiz! One question at a time with instant feedback. Get 80%+ for bonus XP.",
      side: "top" as const,
    },
  },
  {
    element: "[data-tour='done-btn']",
    popover: {
      title: "🎉 Mark as Done",
      description: "Click this when you've finished the topic. You'll earn 50 XP and move to the next topic automatically!",
      side: "top" as const,
    },
  },
];

interface OnboardingTourProps {
  page: "landing" | "module";
}

export default function OnboardingTour({ page }: OnboardingTourProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Only show tour once
    const tourKey = `${LS_KEY}_${page}`;
    const done = localStorage.getItem(tourKey);
    if (!done) {
      setShouldShow(true);
    }
  }, [page]);

  useEffect(() => {
    if (!shouldShow) return;

    // Wait for page to render
    const timer = setTimeout(() => {
      const steps = page === "landing" ? landingSteps : moduleSteps;

      // Check if at least the first element exists
      const firstEl = document.querySelector(steps[0].element);
      if (!firstEl) return;

      const tourDriver = driver({
        showProgress: true,
        showButtons: ["next", "previous", "close"],
        steps,
        animate: true,
        overlayColor: "rgba(0,0,0,0.75)",
        stagePadding: 8,
        stageRadius: 12,
        popoverClass: "ifp-tour-popover",
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Let's Go! 🚀",
        onDestroyed: () => {
          localStorage.setItem(`${LS_KEY}_${page}`, "true");
          setShouldShow(false);
        },
      });

      tourDriver.drive();
    }, 1500); // Delay to let animations finish

    return () => clearTimeout(timer);
  }, [shouldShow, page]);

  return null; // This component just triggers the tour
}
