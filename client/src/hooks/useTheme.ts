import { useEffect, useState } from "react";

export const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const html = document.querySelector("html");
    if (html) html.setAttribute("data-theme", theme);
  }, [theme]);
  return { toggleTheme, theme };
};
