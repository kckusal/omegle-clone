import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  initMediaElements,
  initUsers,
  initSocket,
  cleanup,
} from "@/lib/connect";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket } from "socket.io-client";

export const VideoChat = () => {
  const localUserVideo = useRef<HTMLVideoElement | null>(null);
  const remoteUserVideo = useRef<HTMLVideoElement | null>(null);
  const msgTextAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const [messages, setMessages] = useState<
    Array<{ text: string; local: boolean }>
  >([]);

  const [searchParams] = useSearchParams();
  const { localuser, remoteuser } = useMemo(
    () => Object.fromEntries(searchParams),
    [searchParams]
  );
  const [mediaInitialized, setMediaInitialized] = useState(false);

  useEffect(() => {
    if (!localUserVideo.current || !remoteUserVideo.current) return;
    initMediaElements(localUserVideo.current, remoteUserVideo.current, () =>
      setMediaInitialized(true)
    );
  }, []);

  useEffect(() => {
    initUsers(localuser, remoteuser);
    let socket: Socket | undefined;
    if (localuser && mediaInitialized) {
      socket = initSocket();
    }

    return () => {
      socket?.disconnect();
      cleanup();
    };
  }, [localuser, mediaInitialized, remoteuser]);

  const addMessage = useCallback((local = true) => {
    if (!msgTextAreaRef.current) return;

    const text = msgTextAreaRef.current?.value;

    if (text) {
      setMessages((data) => [...data, { text, local }]);
      msgTextAreaRef.current.value = "";
    }
  }, []);

  return (
    <div className="flex items-stretch h-full">
      <div className=" w-[50%] flex flex-col gap-y-1">
        <div className=" bg-slate-800 w-full h-[50%] border-2 flex items-center">
          <video
            ref={localUserVideo}
            width="100%"
            height="100%"
            playsInline
            autoPlay
          />
        </div>

        <div className=" bg-slate-800 w-full h-[50%] border-2 flex items-center">
          <video
            ref={remoteUserVideo}
            width="100%"
            height="100%"
            playsInline
            autoPlay
          />
        </div>
      </div>

      <div className=" w-[50%] py-1 flex flex-col gap-y-2">
        <p className="inline-flex justify-center p-2">
          You are now chatting with a random stranger!
        </p>

        <div className=" min-h-[200px] border-t-2 flex-1 px-4 py-2 flex flex-col gap-y-4">
          {messages.map((msg, i) => {
            return (
              <div
                key={i}
                className={[
                  "rounded-sm bg-slate-300 py-2 px-3 w-[70%]",
                  msg.local
                    ? "bg-orange-800 text-white"
                    : "bg-gray-200 self-end",
                ].join(" ")}
              >
                {msg.text}
              </div>
            );
          })}
        </div>

        <div className=" flex py-1 px-3 gap-x-2">
          <Textarea
            ref={msgTextAreaRef}
            className=" rounded-none resize-none"
            placeholder="Write a message..."
          />

          <Button
            className=" rounded-none h-full"
            onClick={() => addMessage(true)}
          >
            Send
          </Button>
        </div>

        <div className="px-3">
          <Button className=" rounded-none w-full h-[60px] bg-orange-600 text-2xl hover:bg-orange-700">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
