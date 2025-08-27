import { render } from "@wordpress/element";

// Load all files from dashboard folder
const modules = require.context("./dashboard", false, /\.tsx$/);
// const theme = {
//   selectedPalette: "custom",
//   colors: {
//     themeColor: color.color.colors.themeColor,
//     heading: color.color.colors.heading,
//     bodyText: color.color.colors.bodyText,
//     buttonText: color.color.colors.buttonText,
//     buttonBg: color.color.colors.buttonBg,
//     buttonHoverText: color.color.colors.buttonHoverText,
//     buttonHoverBg: color.color.colors.buttonHoverBg,
//   }
// };

// Object.entries(theme.colors).forEach(([key, value]) => {
//   document.documentElement.style.setProperty(`--${key}`, value);
// });

export default function replaceDashboardDivs(container: HTMLElement) {
  const children = container.querySelectorAll<HTMLDivElement>("div[id]");

  children.forEach((div) => {
    const id = div.id; // e.g. "dashboard", "all-orders"
    const filePath = `./${id}.tsx`;

    if (modules.keys().includes(filePath)) {
      try {
        const Component = modules(filePath).default;
        render(<Component />, div);
      } catch (err) {
        console.error(`Failed to render component for ${id}`, err);
      }
    }
  });
}
