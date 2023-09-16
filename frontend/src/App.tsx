import { Routes, Route } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { TextChat } from "@/pages/TextChat";
import { VideoChat } from "@/pages/VideoChat";
import { Index } from "./pages/Index";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" Component={Index} />
        <Route path="/text-chat" Component={TextChat} />
        <Route path="/video-chat" Component={VideoChat} />
      </Routes>
    </Layout>
  );
}

export default App;
