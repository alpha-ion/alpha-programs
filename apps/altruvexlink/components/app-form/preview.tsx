import { ProfileData, SimpleTemplate } from "../templates/simple";

interface PreviewProps {
  data: ProfileData;
}

export function Preview({ data }: PreviewProps) {
  return (
    <div className="h-screen grid place-items-center bg-gray-100 p-6">
      <div className="h-[650px] w-[320px] overflow-y-auto rounded-[3rem] ring-8 ring-slate-800 overflow-hidden bg-white shadow-xl scrollbar-hide">
        <SimpleTemplate data={data} />
      </div>
    </div>
  );
}
