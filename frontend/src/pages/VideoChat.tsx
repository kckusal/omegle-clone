import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const VideoChat = () => {
  return (
    <div className="flex items-stretch h-full">
      <div className=" w-[50%] flex flex-col gap-y-1">
        <div className=" bg-slate-500 w-full h-[50%]" />
        <div className=" bg-slate-500 w-full h-[50%]" />
      </div>

      <div className=" w-[50%] py-1 flex flex-col gap-y-2">
        <p className="inline-flex justify-center p-2">
          You are now chatting with a random stranger!
        </p>

        <div className=" min-h-[200px] border-t-2 flex-1"></div>

        <div className=" flex py-1 px-3 gap-x-2">
          <Textarea className=" rounded-none resize-none" />

          <Button className=" rounded-none h-full">Send</Button>
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
