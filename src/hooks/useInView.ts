
import { useEffect, useState, useRef } from 'react';

// Extend IntersectionObserverInit to allow for our custom `triggerOnce` property.
interface UseInViewOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

export const useInView = (options: UseInViewOptions = { threshold: 0.1 }) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Separate our custom property from the standard IntersectionObserver options.
    const { triggerOnce, ...observerOptions } = options;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        // The original implementation always unobserves, effectively making it "trigger once".
        // This behavior is maintained. The main fix is accepting `triggerOnce` in the type
        // and not passing it to the `IntersectionObserver` constructor.
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      }
    }, observerOptions); // Pass only standard options.

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, inView] as const;
};
