import { useEffect, useState } from "react";
import debounce from "debounce";

export default ref => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const updateDimensions = () =>
    setDimensions(ref.current.getBoundingClientRect());

  useEffect(() => {
    let teardown;

    updateDimensions();

    if (window.ResizeObserver) {
      const observer = new window.ResizeObserver(
        debounce(updateDimensions, 250),
      );
      observer.observe(ref.current);
      teardown = () => observer.disconnect();
    } else {
      const interval = setInterval(updateDimensions, 1000);
      teardown = () => clearInterval(interval);
    }

    return teardown;
  }, [ref.current]);

  return dimensions;
};
