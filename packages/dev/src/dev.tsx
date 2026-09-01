import { createRoot } from "react-dom/client";
import App from "./App";

function IndexComponent() {
    return <App />;
}

const root = createRoot(document.getElementById("root")!);
root.render(<IndexComponent />);
