import { createRoot } from "react-dom/client";
import App from "./App";
import Theme from "./theme/Theme";

function IndexComponent() {
    return (
        <Theme>
            <App />
        </Theme>
    );
}

const root = createRoot(document.getElementById("root")!);
root.render(<IndexComponent />);
