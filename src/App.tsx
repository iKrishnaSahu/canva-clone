import Layout from "./components/Layout";
import { CanvasProvider } from "./context/CanvasContext";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <CanvasProvider>
        <Layout />
      </CanvasProvider>
    </ThemeProvider>
  );
}

export default App;
