import { FormSection } from "../base/form-section";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Github, 
  Linkedin, 
  Youtube, 
  Mail, 
  MessageCircle, 
  Send 
} from "lucide-react";

interface SocialLinksProps {
  facebook: string;
  twitter: string;
  instagram: string;
  github: string;
  telegram: string;
  whatsapp: string;
  linkedin: string;
  youtube: string;
  email: string;
  onChange: (key: string, value: string) => void;
}

export function SocialLinks({
  facebook,
  twitter,
  instagram,
  github,
  telegram,
  whatsapp,
  linkedin,
  youtube,
  email,
  onChange
}: SocialLinksProps) {
  
  const socialInputs = [
    { key: 'facebook', label: 'Facebook', value: facebook, placeholder: 'https://fb.com/elonmusk', Icon: Facebook },
    { key: 'twitter', label: 'Twitter', value: twitter, placeholder: 'https://twitter.com/elonmusk', Icon: Twitter },
    { key: 'instagram', label: 'Instagram', value: instagram, placeholder: 'https://instagram.com/elonmusk', Icon: Instagram },
    { key: 'github', label: 'Github', value: github, placeholder: 'https://github.com/elonmusk', Icon: Github },
    { key: 'telegram', label: 'Telegram', value: telegram, placeholder: 'https://t.me/elonmusk', Icon: Send },
    { key: 'linkedin', label: 'Linkedin', value: linkedin, placeholder: 'https://linkedin.com/elonmusk', Icon: Linkedin },
    { key: 'email', label: 'Email', value: email, placeholder: 'elonmusk@geemail.com', Icon: Mail },
    { key: 'youtube', label: 'Youtube', value: youtube, placeholder: 'https://youtube.com/elonmusk', Icon: Youtube },
    { key: 'whatsapp', label: 'Whatsapp', value: whatsapp, placeholder: '+9190000000000', Icon: MessageCircle },
  ];

  return (
    <FormSection
      title="Social Links"
      description="Add some social media links"
    >
      <div className="shadow sm:overflow-hidden sm:rounded-md">
        <div className="grid grid-cols-2 gap-8 bg-white px-4 py-5 sm:p-6">
          {socialInputs.map(({ key, label, value, placeholder, Icon }) => (
            <div key={key}>
              <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                  <Icon className="w-5 h-5" />
                </span>
                <input
                  type="search"
                  name={key}
                  id={key}
                  value={value}
                  onChange={(e) => onChange(key, e.target.value)}
                  className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder={placeholder}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </FormSection>
  );
}
