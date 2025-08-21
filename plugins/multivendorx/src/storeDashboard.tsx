import { render } from "@wordpress/element";

// Load all files from dashboard folder
const modules = require.context("./dashboard", false, /\.tsx$/);

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
