"use client";

import { useEffect, useState, useCallback } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

const LS_KEY = "ifp105_tour_done";

// ─── LANDING PAGE TOUR (4 steps, emotion-driven) ───
const landingSteps: DriveStep[] = [
  {
    element: "[data-tour='hero']",
    popover: {
      title: "Your study HQ 🎓",
      description: "5 modules. Quizzes. Flashcards. Cheat sheets. Everything for your ICT exam.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "[data-tour='xp-bar']",
    popover: {
      title: "Level up! 🏆",
      description: "Earn XP, unlock badges, and build a study streak. It's like a game.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "[data-tour='module-1']",
    popover: {
      title: "Start here 📘",
      description: "Module 1 is your first stop. Bite-sized topics you finish in minutes.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "[data-tour='cta']",
    popover: {
      title: "Let's go! 🚀",
      description: "Hit this button and start your journey. You've got this!",
      side: "bottom",
      align: "center",
    },
  },
];

// ─── MODULE PAGE TOUR (4 steps, value-first) ───
const moduleSteps: DriveStep[] = [
  {
    element: "[data-tour='topic-content']",
    popover: {
      title: "Learn this 📖",
      description: "Read the content and analogies. Designed to actually make sense.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "[data-tour='quiz-section']",
    popover: {
      title: "Quiz time ✅",
      description: "One question at a time. Instant feedback. 80%+ = bonus XP!",
      side: "top",
      align: "center",
    },
  },
  {
    element: "[data-tour='done-btn']",
    popover: {
      title: "Earn 50 XP 🎉",
      description: "Tap this when done. Confetti flies. Then onto the next topic!",
      side: "top",
      align: "center",
    },
  },
  {
    element: "[data-tour='tab-bar']",
    popover: {
      title: "All topics ↔️",
      description: "Switch topics here. Green = done. Arrow keys work too!",
      side: "bottom",
      align: "center",
    },
  },
];

interface OnboardingTourProps {
  page: "landing" | "module";
}

export default function OnboardingTour({ page }: OnboardingTourProps) {
  const [shouldShow, setShouldShow] = useState(false);
  const tourKey = `${LS_KEY}_${page}`;

  useEffect(() => {
    const done = localStorage.getItem(tourKey);
    if (!done) setShouldShow(true);
  }, [tourKey]);

  const startTour = useCallback(() => {
    const steps = page === "landing" ? landingSteps : moduleSteps;

    // Filter to only steps whose target elements exist
    const validSteps = steps.filter(
      (s) => s.element && document.querySelector(s.element as string)
    );
    if (validSteps.length === 0) return;

    let completedAllSteps = false;

    const tourDriver = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps: validSteps,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayColor: "rgba(0,0,0,0.82)",
      stagePadding: 10,
      stageRadius: 16,
      popoverClass: "ifp-tour-popover",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "I'm Ready! 🚀",
      progressText: "{{current}} of {{total}}",
      onNextClick: () => {
        tourDriver.moveNext();
      },
      onPrevClick: () => {
        tourDriver.movePrevious();
      },
      onCloseClick: () => {
        tourDriver.destroy();
      },
      onDestroyStarted: () => {
        if (tourDriver.isLastStep()) {
          completedAllSteps = true;
        }
        tourDriver.destroy();
      },
      onDestroyed: () => {
        if (completedAllSteps) {
          localStorage.setItem(tourKey, "true");
        } else {
          localStorage.setItem(tourKey, "skipped");
        }
        setShouldShow(false);
      },
    });

    tourDriver.drive();
  }, [page, tourKey]);

  useEffect(() => {
    if (!shouldShow) return;
    const timer = setTimeout(startTour, 1800);
    return () => clearTimeout(timer);
  }, [shouldShow, startTour]);

  return null;
}

export function replayTour(page: "landing" | "module") {
  localStorage.removeItem(`${LS_KEY}_${page}`);
  window.location.reload();
}
