import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Index = () => {
  return (
    <div className="flex flex-col gap-y-3 max-w-xl mx-auto">
      <p>
        Omegle is a great way to meet new friends. You just need to open the app
        and start chatting; you will be randomly paired with a stranger to talk
        to.
      </p>

      <p className="my-4">
        <span className=" uppercase">
          You must be 18 or older to use omegle.
        </span>
      </p>

      <p className="my-4 text-xl font-semibold">
        Video is monitored. Keep it clean.
      </p>

      <p>Start Chatting:</p>
      <div className="flex items-center gap-x-4">
        <Button asChild>
          <Link to="/text-chat">Text chat</Link>
        </Button>

        <Button asChild className=" bg-orange-700 hover:bg-orange-800">
          <Link to="/video-chat">Video chat</Link>
        </Button>
      </div>
    </div>
  );
};
