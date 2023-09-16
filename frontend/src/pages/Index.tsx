import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Index = () => {
  return (
    <>
      Hello from Omegle
      <Button asChild>
        <Link to="/text-chat">Text chat</Link>
      </Button>
    </>
  );
};
