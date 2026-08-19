import { useRef, useEffect } from "react";

export function useScrollFade(timeout = 700) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let timer = null;

        const handleScroll = () => {
            el.classList.add("is-scrolling");
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                el.classList.remove("is-scrolling");
            }, timeout);
        };

        el.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            el.removeEventListener("scroll", handleScroll);
            if (timer) clearTimeout(timer);
        };
    }, [timeout]);

    return ref;
}