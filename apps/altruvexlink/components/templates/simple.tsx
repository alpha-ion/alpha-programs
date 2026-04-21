import {
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Mail, MessageCircle, Send,
  Twitter,
  Youtube
} from "lucide-react";
import { ExternalLink } from "../external-link";

export interface LinkItem {
  id: string;
  icon: string;
  label: string;
  url: string;
}

export interface ProfileData {
  name: string;
  desc: string;
  image: string;
  facebook: string;
  twitter: string;
  instagram: string;
  github: string;
  telegram: string;
  whatsapp: string;
  linkedin: string;
  youtube: string;
  email: string;
  links: LinkItem[];
}

interface SimpleTemplateProps {
  data: ProfileData;
}

export function SimpleTemplate({ data }: SimpleTemplateProps) {
  const socialLinks = [
    { value: data.facebook, Icon: Facebook, url: (v: string) => v },
    { value: data.twitter, Icon: Twitter, url: (v: string) => v },
    { value: data.instagram, Icon: Instagram, url: (v: string) => v },
    { value: data.email, Icon: Mail, url: (v: string) => `mailto:${v}` },
    { value: data.telegram, Icon: Send, url: (v: string) => v },
    { value: data.whatsapp, Icon: MessageCircle, url: (v: string) => `https://wa.me/${v}` },
    { value: data.youtube, Icon: Youtube, url: (v: string) => v },
    { value: data.github, Icon: Github, url: (v: string) => v },
    { value: data.linkedin, Icon: Linkedin, url: (v: string) => v },
  ].filter(link => !!link.value);

  return (
    <main className="p-4 bg-white h-full w-full space-y-8 pt-12 max-w-lg mx-auto">
      <div className="text-center">
        {data.image && (
          <div className="h-20 w-20 rounded-full overflow-hidden ring ring-slate-200 mx-auto">
            <img src={data.image} alt={data.name} className="h-full w-full object-cover" />
          </div>
        )}
        {data.name && (
          <h1 className="text-2xl font-bold mt-4 text-slate-800">
            {data.name}
          </h1>
        )}
        {data.desc && (
          <p className="text-sm mt-2 text-slate-600">
            {data.desc}
          </p>
        )}
      </div>
      {socialLinks.length > 0 && (
        <div className="flex items-center justify-center flex-wrap">
          {socialLinks.map((link, idx) => (
            <span key={idx} className="p-1">
              <a href={link.url(link.value)} target="_blank" rel="noopener noreferrer">
                <link.Icon className="h-6 w-6 text-slate-600 hover:text-slate-800" />
              </a>
            </span>
          ))}
        </div>
      )}
      <ul className="space-y-2">
        {data.links.map((link) => (
          <ExternalLink
            key={link.id}
            label={link.label}
            icon={link.icon}
            url={link.url}
          />
        ))}
      </ul>
    </main>
  );
}
