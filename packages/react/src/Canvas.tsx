import { Fragment, useEffect, useRef, useState } from "react";
import { useContainer } from "./contexts/ContainerProvider";
import { createPortal } from "react-dom";
import RootDocument from "./RenderNode";

type CanvasProps = {};

export default function Canvas({}: CanvasProps) {
    const [ready, setReady] = useState(false);
    const { head, body } = useContainer();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const onLoad = () => {
            // 1. Correctly target the internal iframe document
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!iframeDoc) return;

            // 2. Assign the internal head and body to your container providers
            head.element = iframeDoc.head;
            body.element = iframeDoc.body;

            console.log("Iframe Loaded and Portals Ready");
            setReady(true);
        };

        // If the about:blank iframe is already loaded by the time useEffect runs
        if (iframe.contentDocument?.readyState === "complete") {
            onLoad();
        } else {
            iframe.addEventListener("load", onLoad);
        }

        return () => {
            iframe.removeEventListener("load", onLoad);
        };
    }, [head, body]);

    return (
        <Fragment>
            {/* Use srcDoc to initialize a clean HTML structure */}
            <iframe
                ref={iframeRef}
                srcDoc="<!DOCTYPE html><html><head></head><body></body></html>"
                style={{ width: "100%", height: "100%", border: "none", borderRadius: 16 }}
            />
            {/* Safely mount your React Portal inside the iframe body */}
            {ready &&
                iframeRef.current?.contentDocument?.body &&
                createPortal(<RootDocument />, iframeRef.current.contentDocument.body)}
        </Fragment>
    );
}
