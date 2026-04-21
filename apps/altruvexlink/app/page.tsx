"use client";

import { useState } from "react";
import { Profile } from "@/components/app-form/profile";
import { Hr } from "@/components/app-form/hr";
import { SocialLinks } from "@/components/app-form/social-links";
import { Links } from "@/components/app-form/links";
import { Preview } from "@/components/app-form/preview";
import { encodeData } from "@/lib/transformer";
import { ProfileData, LinkItem } from "@/components/templates/simple";
import { Code, Send } from "lucide-react";
import Link from "next/link";

export default function BuilderPage() {
  const [data, setData] = useState<ProfileData>({
    name: "",
    desc: "",
    image: "",
    facebook: "",
    twitter: "",
    instagram: "",
    github: "",
    telegram: "",
    linkedin: "",
    email: "",
    whatsapp: "",
    youtube: "",
    links: [],
  });

  const updateField = (field: keyof ProfileData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const prefillDemoData = () => {
    setData({
      name: "John Snow",
      desc: "I’m John Snow, the king in the north. I know Nothing.",
      image: "https://i.insider.com/56743fad72f2c12a008b6cc0",
      facebook: "https://www.facebook.com/john_snow",
      twitter: "https://twitter.com/john_snow",
      instagram: "https://www.instagram.com/john_snow",
      email: "mail@john_snow.cc",
      github: "https://github.com/john_snow",
      telegram: "https://t.me/john_snow",
      whatsapp: "+918888888888",
      youtube: "https://youtube.com/@john_snow",
      linkedin: "https://linkedin.com/john_snow",
      links: [
        {
          id: crypto.randomUUID(),
          label: "My Website",
          icon: "ph:globe-duotone",
          url: "https://example.com",
        },
        {
          id: crypto.randomUUID(),
          label: "Amazon wishlist",
          icon: "ant-design:amazon-outlined",
          url: "https://amazon.in",
        },
        {
          id: crypto.randomUUID(),
          label: "React JS course",
          icon: "grommet-icons:reactjs",
          url: "https://reactjs.org/",
        },
      ],
    });
  };

  const publish = () => {
    const url = `${window.location.origin}/share?data=${encodeData(data)}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard");
    });
  };

  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-x lg:divide-y-0">
      <div className="col-span-2 h-screen flex flex-col bg-slate-100">
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <Profile
            name={data.name}
            desc={data.desc}
            image={data.image}
            onNameChange={(val) => updateField("name", val)}
            onDescChange={(val) => updateField("desc", val)}
            onImageChange={(val) => updateField("image", val)}
          />
          <Hr />
          <SocialLinks
            facebook={data.facebook}
            twitter={data.twitter}
            instagram={data.instagram}
            github={data.github}
            telegram={data.telegram}
            whatsapp={data.whatsapp}
            linkedin={data.linkedin}
            youtube={data.youtube}
            email={data.email}
            onChange={(key, val) => updateField(key as keyof ProfileData, val)}
          />
          <Hr />
          <Links
            links={data.links}
            onChange={(val) => updateField("links", val)}
          />
        </div>
        <div className="border-t bg-white flex items-center shadow-lg lg:shadow-none z-10">
          <button
            onClick={prefillDemoData}
            className="h-12 flex items-center space-x-2 px-4 border-r text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Add demo data</span>
            <Code className="h-4 w-4" />
          </button>
          <button
            onClick={publish}
            className="h-12 flex items-center space-x-2 px-4 border-r text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Publish</span>
            <Send className="h-4 w-4" />
          </button>
          <a
            href="https://github.com/aliab/alphalink" // Updated to likely user
            target="_blank"
            className="h-12 flex items-center space-x-2 px-4 border-r text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Github</span>
            <Code className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="hidden lg:block bg-white relative">
         <Preview data={data} />
         <a
          href="https://twitter.com/aliab" // Updated to likely user
          target="_blank"
          className="absolute bottom-0 right-0 bg-white rounded-tl-lg shadow px-4 py-1 font-medium text-sm text-gray-500 hover:text-gray-700"
        >
          Made by Aliab
        </a>
      </div>
    </div>
  );
}
