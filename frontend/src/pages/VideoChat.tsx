import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  initMediaElements,
  initSocket,
  cleanup,
  sendMessageToPeer,
} from "@/lib/connect";
import { useCallback, useEffect, useRef, useState } from "react";

export const VideoChat = () => {
  const localUserVideo = useRef<HTMLVideoElement | null>(null);
  const remoteUserVideo = useRef<HTMLVideoElement | null>(null);
  const msgTextAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const [messages, setMessages] = useState<
    Array<{ text: string; local: boolean }>
  >([]);

  const [mediaInitialized, setMediaInitialized] = useState(false);

  useEffect(() => {
    if (!localUserVideo.current || !remoteUserVideo.current) return;
    initMediaElements(localUserVideo.current, remoteUserVideo.current, () =>
      setMediaInitialized(true)
    );
  }, []);

  const addMessage = useCallback((remoteMsg: string | undefined) => {
    const text = remoteMsg || msgTextAreaRef.current?.value;

    if (text) {
      setMessages((data) => [...data, { text, local: !remoteMsg }]);
      if (msgTextAreaRef?.current && !remoteMsg) {
        msgTextAreaRef.current.value = "";
      }
    }
  }, []);

  useEffect(() => {
    if (mediaInitialized) {
      initSocket({
        onNewText: (text) => addMessage(text),
      });
    }

    return () => {
      cleanup();
    };
  }, [addMessage, mediaInitialized]);

  return (
    <div className="flex items-stretch h-full">
      <div className=" w-[50%] flex flex-col gap-y-1 h-full">
        <div className=" bg-slate-800 w-full h-[50%] border-2 flex items-center">
          <video
            ref={localUserVideo}
            width="100%"
            playsInline
            autoPlay
            className=" h-full"
          />
        </div>

        <div className=" bg-slate-800 w-full h-[50%] border-2 flex items-center">
          <video
            ref={remoteUserVideo}
            width="100%"
            playsInline
            autoPlay
            className="h-full"
          />
        </div>
      </div>

      <div className=" w-[50%] py-1 flex flex-col gap-y-2">
        <p className="inline-flex justify-center p-2">
          You are now chatting with a random stranger!
        </p>

        <div className=" min-h-[200px] border-t-2 flex-1 px-4 py-2 flex flex-col gap-y-3">
          {messages.map((msg, i) => {
            return (
              <div
                key={i}
                className={[
                  "rounded-sm py-2 px-3 w-[70%]",
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
            onClick={() => {
              sendMessageToPeer(msgTextAreaRef?.current?.value || "");
              addMessage(undefined);
            }}
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
