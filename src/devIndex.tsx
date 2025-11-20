import ReactDOM from "react-dom/client";

// import App from "./App";
import App from "./AppWithDatabaseConfig"; // Testing database integration

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);
root.render(<App />);