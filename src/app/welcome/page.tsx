"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Amina, Hilmy, Noor } from "@/characters/Characters";
import { AVATARS, Avatar } from "@/characters/Avatars";
import { LogoMark } from "@/components/Logo";
import { ParentGate } from "@/components/ParentGate";
import { HealthNotice, SpeechBubble, Switch } from "@/components/ui";
import { APP_NAME, TAGLINE } from "@/content/copy";
import { CHILD_SAFETY_POINTS, NOT_MEDICAL_NOTICE, NOT_RELIGIOUS_AUTHORITY_NOTICE } from "@/content/safety";
import { NICKNAME_MAX, nicknameProblem } from "@/storage/schema";
import { useApp } from "@/state/AppState";
import { Icon, IconChip } from "@/components/Icon";

const STEPS = ["splash", "noor", "about", "gate", "consent", "nickname", "avatar", "prefs", "safety", "enter"] as const;
type Step = (typeof STEPS)[number];

export default function WelcomePage() {
  const { data, createProfile, status } = useApp();
  const router = useRouter();
  const [step, setStep] = useState<Step>("splash");
  const [gateOpen, setGateOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [nickname, setNickname] = useState("");
  const [nickError, setNickError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string>("turtle");
  const [soundOn, setSoundOn] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // A family that already has a profile goes straight home.
  useEffect(() => {
    if (status === "ready" && data.profile && step === "splash") router.replace("/home/");
  }, [status, data.profile, step, router]);

  const idx = STEPS.indexOf(step);
  const go = (s: Step) => {
    setStep(s);
    window.scrollTo?.({ top: 0 });
  };
  const next = () => go(STEPS[Math.min(idx + 1, STEPS.length - 1)]);
  const back = () => go(STEPS[Math.max(idx - 1, 0)]);

  const submitNickname = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = nicknameProblem(nickname);
    setNickError(problem);
    if (!problem) next();
  };

  const enter = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await createProfile({ nickname, avatar, soundOn, reducedMotion });
      router.replace("/home/");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  const stepNumber = idx > 0 ? (
    <p className="small muted center" aria-live="polite">
      Step {idx} of {STEPS.length - 1}
    </p>
  ) : null;

  const nav = (canNext = true, label = "Next") => (
    <div className="row" style={{ marginTop: 8 }}>
      {idx > 0 && (
        <button type="button" className="btn ghost" onClick={back}>
          <Icon name="back" /> Back
        </button>
      )}
      <button type="button" className="btn" style={{ flex: 1 }} onClick={next} disabled={!canNext}>
        {label}
      </button>
    </div>
  );

  return (
    <div className="stack-lg" style={{ maxWidth: 520, margin: "0 auto" }}>
      {step === "splash" && (
        <div className="card emerald stack center" style={{ padding: "40px 20px", background: "linear-gradient(180deg,#1D2B4F,#123C35)" }}>
          <div className="float" style={{ display: "flex", justifyContent: "center" }}>
            <LogoMark size={104} />
          </div>
          <h1 style={{ color: "#E9C66B", fontSize: "2rem" }}>{APP_NAME}</h1>
          <p style={{ fontSize: "1.15rem" }}>{TAGLINE}</p>
          <div className="row" style={{ justifyContent: "center" }}>
            <Noor size={90} expression="wave" />
            <Hilmy size={80} />
            <Amina size={90} expression="wave" />
          </div>
          <button className="btn gold block" onClick={next}>
            Start
          </button>
          <p className="small" style={{ opacity: 0.9 }}>
            Free for every family. No ads. No purchases. No accounts.
          </p>
        </div>
      )}

      {step === "noor" && (
        <section className="stack" aria-labelledby="h-noor">
          {stepNumber}
          <h1 id="h-noor" className="sr-only">
            Welcome
          </h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Noor size={150} expression="wave" />
          </div>
          <SpeechBubble who="noor" expression="wave">
            Assalamu alaikum! I&apos;m Noor. Welcome to {APP_NAME}! Let&apos;s explore the Ramadan Village together.
          </SpeechBubble>
          {nav()}
        </section>
      )}

      {step === "about" && (
        <section className="stack" aria-labelledby="h-about">
          {stepNumber}
          <h1 id="h-about">What can you do here?</h1>
          <ul className="card stack" style={{ listStyle: "none", margin: 0 }}>
            <li className="row">
              <IconChip name="book" tone="sky" size={40} /> Read stories and learn about Ramadan
            </li>
            <li className="row">
              <IconChip name="heart" tone="rose" size={40} /> Do kind things for your family
            </li>
            <li className="row">
              <IconChip name="games" tone="lavender" size={40} /> Play gentle games and quizzes
            </li>
            <li className="row">
              <IconChip name="star" tone="gold" size={40} /> Collect stars, badges and stickers for learning and kindness
            </li>
          </ul>
          <SpeechBubble who="amina">You can enjoy your Ramadan adventure whether or not you are fasting!</SpeechBubble>
          <p className="notice">Next, please ask a parent or guardian to help you set up.</p>
          {nav(true, "Get a grown-up")}
        </section>
      )}

      {step === "gate" && (
        <section className="stack center" aria-labelledby="h-gate">
          {stepNumber}
          <h1 id="h-gate">Grown-up time</h1>
          <p>Please hand the device to your parent or guardian.</p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Hilmy size={110} />
          </div>
          <button className="btn block" onClick={() => setGateOpen(true)}>
            I&apos;m a grown-up
          </button>
          <button className="btn ghost block" onClick={back}>
            <Icon name="back" /> Back
          </button>
          <ParentGate open={gateOpen} reason="Setting up Little Ramadan is for parents and guardians." onCancel={() => setGateOpen(false)} onPass={() => { setGateOpen(false); next(); }} />
        </section>
      )}

      {step === "consent" && (
        <section className="stack parent-theme card" aria-labelledby="h-consent" style={{ background: "var(--parent-bg)" }}>
          {stepNumber}
          <h1 id="h-consent">For parents and guardians</h1>
          <p>
            <strong>{APP_NAME}</strong> is a free Ramadan learning adventure for children aged 7–9. Before your child continues, here is exactly how it handles information.
          </p>
          <h2>What is stored</h2>
          <ul>
            <li>A nickname (not a real name) and a cartoon avatar.</li>
            <li>Settings you choose (sound, motion, calendar, optional fasting journal).</li>
            <li>Which activities are completed, stars, badges and goals.</li>
            <li>Optional private reflections and journal notes, only if your child writes them.</li>
          </ul>
          <h2>Where it is stored</h2>
          <p>Only on this device, in this browser&apos;s storage. Nothing is uploaded. There are no accounts, no analytics, no advertising, no chat and no location tracking. The app never asks for an email, phone number, address, school or birth date, and never uses the camera. The microphone is used only if you choose to record your own voice for your child in the Parent Zone, and recordings stay on this device.</p>
          <p className="notice warn">Clearing browser data, removing the app or changing devices may remove progress.</p>
          <h2>Reset and delete</h2>
          <p>Open <strong>Parents</strong> (bottom menu) at any time to reset progress or delete everything from this device.</p>
          <h2>What this app is not</h2>
          <p className="small">{NOT_MEDICAL_NOTICE}</p>
          <p className="small">{NOT_RELIGIOUS_AUTHORITY_NOTICE}</p>
          <label className="row" style={{ alignItems: "flex-start", fontWeight: 600, color: "var(--text)" }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ width: 28, height: 28, flex: "none", marginTop: 2 }} />
            <span>I am this child&apos;s parent or guardian. I understand how {APP_NAME} stores information on this device, and I&apos;m happy for my child to use it.</span>
          </label>
          {nav(consent, "Agree and continue")}
        </section>
      )}

      {step === "nickname" && (
        <form className="stack" onSubmit={submitNickname} aria-labelledby="h-nick" noValidate>
          {stepNumber}
          <h1 id="h-nick">Choose a nickname</h1>
          <SpeechBubble who="amina">What should we call you? Pick a fun nickname, like &quot;Star Explorer&quot;. Please don&apos;t use your full name.</SpeechBubble>
          <label htmlFor="nickname">Nickname</label>
          <input
            id="nickname"
            className="input"
            value={nickname}
            maxLength={NICKNAME_MAX + 4}
            autoComplete="off"
            autoCapitalize="words"
            spellCheck={false}
            onChange={(e) => {
              setNickname(e.target.value);
              if (nickError) setNickError(null);
            }}
            aria-invalid={!!nickError}
            aria-describedby="nick-help nick-error"
          />
          <p id="nick-help" className="small muted">
            2 to {NICKNAME_MAX} letters. A grown-up can change it later.
          </p>
          <p id="nick-error" className="field-error" role={nickError ? "alert" : undefined}>
            {nickError}
          </p>
          <div className="row">
            <button type="button" className="btn ghost" onClick={back}>
              <Icon name="back" /> Back
            </button>
            <button type="submit" className="btn" style={{ flex: 1 }}>
              Next
            </button>
          </div>
        </form>
      )}

      {step === "avatar" && (
        <section className="stack" aria-labelledby="h-avatar">
          {stepNumber}
          <h1 id="h-avatar">Choose your avatar</h1>
          <p>Pick a friend from the island to be you!</p>
          <div className="choice-grid" role="radiogroup" aria-label="Avatars">
            {AVATARS.map((a) => (
              <button key={a.id} type="button" role="radio" aria-checked={avatar === a.id} className="choice" onClick={() => setAvatar(a.id)}>
                <Avatar id={a.id} size={60} decorative />
                {a.name}
              </button>
            ))}
          </div>
          {nav()}
        </section>
      )}

      {step === "prefs" && (
        <section className="stack" aria-labelledby="h-prefs">
          {stepNumber}
          <h1 id="h-prefs">Sound and movement</h1>
          <p className="muted">You can change these later in the Parents area.</p>
          <div className="card">
            <Switch id="pref-sound" label="Sound effects" description="Soft chimes and sparkles as you play. You can turn them off any time." checked={soundOn} onChange={setSoundOn} />
            <Switch id="pref-motion" label="Less movement" description="Turns off animations." checked={reducedMotion} onChange={setReducedMotion} />
          </div>
          {nav()}
        </section>
      )}

      {step === "safety" && (
        <section className="stack" aria-labelledby="h-safety">
          {stepNumber}
          <h1 id="h-safety">Staying safe and well</h1>
          <SpeechBubble who="hilmy">Before we go, here are some important things to remember.</SpeechBubble>
          <HealthNotice />
          <ul className="card stack" style={{ margin: 0 }}>
            {CHILD_SAFETY_POINTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          {nav(true, "I understand")}
        </section>
      )}

      {step === "enter" && (
        <section className="stack center" aria-labelledby="h-enter">
          {stepNumber}
          <h1 id="h-enter">You&apos;re ready, {nickname.trim() || "Explorer"}!</h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Avatar id={avatar} size={110} />
          </div>
          <p>The Ramadan Village is waiting for you.</p>
          {saveError && (
            <p className="field-error" role="alert">
              {saveError}
            </p>
          )}
          <button className="btn gold block" onClick={enter} disabled={saving}>
            {saving ? "Opening the village…" : "Enter Ramadan Village"}
          </button>
          <button className="btn ghost block" onClick={back} disabled={saving}>
            <Icon name="back" /> Back
          </button>
        </section>
      )}
    </div>
  );
}
