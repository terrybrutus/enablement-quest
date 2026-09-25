import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface TitleScreenProps {
  onStart: () => void;
  onClose?: () => void;
}

const introSlides = [
  {
    kicker: "Enablement Quest",
    title: "The Case of the Vanishing Win Rate",
    body: "Atlas Pro is reaching proposal, but too few deals are closing. Leaders think the sales team may need more training.",
    detail:
      "Your job is not to accept that answer yet. Your job is to investigate.",
  },
  {
    kicker: "Your Role",
    title: "Act like the enablement lead",
    body: "You will talk to people, inspect evidence, and decide what is really blocking performance.",
    detail:
      "The question you keep asking is simple: is this actually a training problem?",
  },
  {
    kicker: "How It Works",
    title: "Follow one clear path",
    body: "Start in the lab, go to Leo in Sales Strategy Studio, collect evidence in order, then return to make the recommendation.",
    detail: "The bottom guide will always tell you exactly what to do next.",
  },
  {
    kicker: "Learning Goal",
    title: "Diagnose before designing",
    body: "Choose the cause that explains the full evidence pattern. Then choose the fix that changes behavior and can be measured.",
    detail:
      "You finish when you can explain the problem, cause, fix, and expected business impact in plain language.",
  },
] as const;

export function TitleScreen({ onStart }: TitleScreenProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = introSlides[slideIndex];
  const isFirstSlide = slideIndex === 0;
  const isLastSlide = slideIndex === introSlides.length - 1;

  return (
    <section className="eq-title-screen" aria-label="Enablement Quest intro">
      <div className="eq-title-world" aria-hidden="true">
        <span className="eq-title-building is-sales" />
        <span className="eq-title-building is-lab" />
        <span className="eq-title-building is-operations" />
        <span className="eq-title-path is-horizontal" />
        <span className="eq-title-path is-vertical" />
        <span className="eq-title-fountain" />
        <span className="eq-title-avatar" />
      </div>

      <div className="eq-title-card eq-intro-carousel">
        <div className="eq-title-meta">
          <p className="eq-kicker">{slide.kicker}</p>
          <p className="eq-byline">Created by Terry Brutus</p>
        </div>

        <div className="eq-intro-slide">
          <p className="eq-title-mode">
            Intro {slideIndex + 1} of {introSlides.length}
          </p>
          <h1>{slide.title}</h1>
          <p className="eq-title-copy">{slide.body}</p>
          <p className="eq-title-copy-secondary">{slide.detail}</p>
        </div>

        {!isFirstSlide && (
          <button
            aria-label="Previous intro slide"
            className="eq-carousel-arrow is-left"
            type="button"
            onClick={() => setSlideIndex((index) => Math.max(0, index - 1))}
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
        )}

        {!isLastSlide && (
          <button
            aria-label="Next intro slide"
            className="eq-carousel-arrow is-right"
            type="button"
            onClick={() =>
              setSlideIndex((index) =>
                Math.min(introSlides.length - 1, index + 1),
              )
            }
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        )}

        <div className="eq-intro-dots" aria-label="Intro progress">
          {introSlides.map((item, index) => (
            <span
              className={index === slideIndex ? "is-active" : ""}
              key={item.title}
            />
          ))}
        </div>

        {isLastSlide && (
          <button
            className="eq-primary-button eq-start-button"
            type="button"
            onClick={onStart}
            data-ocid="title.start_button"
          >
            Begin the Case
            <ArrowRight className="h-5 w-5" />
          </button>
        )}

        <div className="eq-control-strip">
          <span className="eq-desktop-control">Move: WASD / arrows</span>
          <span className="eq-desktop-control">
            Talk or inspect: E / Space / Enter
          </span>
          <span className="eq-mobile-control">Move: joystick</span>
          <span className="eq-mobile-control">Talk or inspect: button</span>
        </div>
      </div>
    </section>
  );
}
