/** Single-file preview of Little Ramadan for sharing as a claude.ai artifact. Uses the real app components. */
import { createRoot } from "react-dom/client";
import { Suspense, useEffect, type ReactNode } from "react";
import "@/styles/globals.css";
import { AppStateProvider } from "@/state/AppState";
import { AppChrome } from "@/components/AppChrome";
import { usePathname } from "next/navigation";
import Welcome from "@/app/welcome/page";
import Home from "@/app/home/page";
import Journey from "@/app/journey/page";
import { DayView } from "@/app/journey/[day]/DayView";
import Learn from "@/app/learn/page";
import { LessonReader } from "@/app/learn/lesson/[id]/LessonReader";
import { StoryReader } from "@/app/learn/story/[id]/StoryReader";
import Kindness from "@/app/kindness/page";
import { MissionView } from "@/app/kindness/[id]/MissionView";
import Games from "@/app/games/page";
import QuizList from "@/app/games/quiz/page";
import { QuizPlayer } from "@/app/games/quiz/[set]/QuizPlayer";
import { GamePlayer } from "@/app/games/[id]/GamePlayer";
import Rewards from "@/app/rewards/page";
import Room from "@/app/rewards/room/page";
import Certificate from "@/app/rewards/certificate/page";
import Eid from "@/app/rewards/eid/page";
import Goals from "@/app/goals/page";
import FirstFast from "@/app/first-fast/page";
import Safety from "@/app/safety/page";
import Parent from "@/app/parent/page";
import StyleGuide from "@/app/style-guide/page";
import NotFound from "@/app/not-found";

function route(path: string): ReactNode {
  const s = path.split("/").filter(Boolean);
  const [a, b, c] = s;
  switch (a) {
    case undefined:
      return null;
    case "welcome":
      return <Welcome />;
    case "home":
      return <Home />;
    case "journey":
      return b ? <DayView key={b} dayId={b} /> : <Journey />;
    case "learn":
      if (b === "lesson" && c) return <LessonReader key={c} id={c} />;
      if (b === "story" && c) return <StoryReader key={c} id={c} />;
      return <Learn />;
    case "kindness":
      return b ? <MissionView key={b} id={b} /> : <Kindness />;
    case "games":
      if (b === "quiz") return c ? <QuizPlayer key={c} setId={c} /> : <QuizList />;
      return b ? <GamePlayer key={b} id={b} /> : <Games />;
    case "rewards":
      if (b === "room") return <Room />;
      if (b === "certificate") return <Certificate />;
      if (b === "eid") return <Eid />;
      return <Rewards />;
    case "goals":
      return <Goals />;
    case "first-fast":
      return <FirstFast />;
    case "safety":
      return <Safety />;
    case "parent":
      return <Parent />;
    case "style-guide":
      return <StyleGuide />;
    default:
      return <NotFound />;
  }
}

function Router() {
  const path = usePathname();
  useEffect(() => {
    document.title = "Little Ramadan";
  }, [path]);
  return <Suspense fallback={null}>{route(path)}</Suspense>;
}

function PreviewNotice() {
  return (
    <div className="banner no-print" style={{ background: "#33465C", color: "#fff" }} role="note">
      Preview version: offline mode, installing, printing and saving pictures only work in the full app.
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <AppStateProvider>
    <PreviewNotice />
    <AppChrome>
      <Router />
    </AppChrome>
  </AppStateProvider>,
);
