import CssEditor from "./src/CssEditor";
import { useRef, useState } from "react";
type AppProps = {};

export default function App({}: AppProps) {
    const [content, setContent] = useState(`rgb(100,100,100) max(100% - 87px);`);
    const targetRef = useRef<HTMLDivElement>(null);

    const handleContentChange = (newContent: string) => {
        setContent(newContent);
        targetRef.current?.style.setProperty("color", newContent);  
        console.log("Content changed:", newContent);
    }

    return (
        <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%" }}>
            <CssEditor content={content} onChange={handleContentChange} />
            <div
                style={{
                    flexBasis: 500,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#222",
                }}
            >
                <div ref={targetRef}>
                    <p>TARGET</p>
                </div>
            </div>
        </div>
    );
}
