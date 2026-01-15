import Layout from "./components/Layout";
import { CanvasProvider } from "./context/CanvasContext";

function App() {
  return (
    <CanvasProvider>
      <Layout />
    </CanvasProvider>
  );
}

export default App;
