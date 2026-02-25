import { useEffect, useRef } from "react";

declare global {
  interface Window {
    HabboRegistrationConfig: Record<string, unknown>;
    HabboRegistration: {
      setGenderAndFigure?: (gender: string, figure: string) => void;
      setGender?: (gender: string) => void;
      setFigure?: (gender: string, figure: string) => void;
      setAllowedToProceed?: (allowed: boolean) => void;
      onSubmit?: (gender: string, figure: string) => void;
    };
  }
}

interface Props {
  figure: string;
  gender: string;
  onChange: (gender: string, figure: string) => void;
}

const CONTAINER_ID = "habbo-figure-editor-container";

export function HabboFigureEditor({ figure, gender, onChange }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    window.HabboRegistrationConfig = {
      figure,
      gender,
      assetsPath: "/widgets/habbo-registration/",
      container: CONTAINER_ID,
      post_enabled: false,
      localization_url: "data/figure_editor.xml",
      show_submit_button: false,
    };

    window.HabboRegistration = {
      setGenderAndFigure: (g, f) => onChangeRef.current(g, f),
      setAllowedToProceed: () => {},
      onSubmit: () => {},
    };

    const script = document.createElement("script");
    script.src = "/widgets/habbo-registration/habbo-registration.iife.js";
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      const el = document.getElementById(CONTAINER_ID);
      if (el) el.innerHTML = "";
    };
  }, []); // intentionally empty — re-runs only on mount/unmount

  return <div id={CONTAINER_ID} style={{ width: 406, height: 327 }} />;
}
