import { encode, decode } from "js-base64";
import { ProfileData, LinkItem } from "../components/templates/simple";

interface ShortLinkItem {
  i: string; // icon
  l: string; // label
  u: string; // url
}

interface ShortData {
  n?: string; // name
  d?: string; // desc
  i?: string; // image
  f?: string; // facebook
  t?: string; // twitter
  ig?: string; // instagram
  gh?: string; // github
  tg?: string; // telegram
  l?: string; // linkedin
  e?: string; // email
  w?: string; // whatsapp
  y?: string; // youtube
  ls?: ShortLinkItem[]; // links
}

export const encodeData = (data: ProfileData): string => {
  const shortData: ShortData = {
    n: data.name,
    d: data.desc,
    i: data.image,
    f: data.facebook,
    t: data.twitter,
    ig: data.instagram,
    gh: data.github,
    tg: data.telegram,
    l: data.linkedin,
    e: data.email,
    w: data.whatsapp,
    y: data.youtube,
    ls: data.links.map(link => ({
      i: link.icon,
      l: link.label,
      u: link.url
    })),
  };
  return encode(JSON.stringify(shortData));
};

export const decodeData = (base64: string): ProfileData => {
  try {
    const json = decode(base64);
    const shortData: ShortData = JSON.parse(json);
    
    return {
      name: shortData.n || "",
      desc: shortData.d || "",
      image: shortData.i || "",
      facebook: shortData.f || "",
      twitter: shortData.t || "",
      instagram: shortData.ig || "",
      github: shortData.gh || "",
      telegram: shortData.tg || "",
      linkedin: shortData.l || "",
      email: shortData.e || "",
      whatsapp: shortData.w || "",
      youtube: shortData.y || "",
      links: (shortData.ls || []).map(link => ({
        id: crypto.randomUUID(), // Generate new ID for React keys
        icon: link.i || "",
        label: link.l || "",
        url: link.u || ""
      })),
    };
  } catch (error) {
    console.error("Failed to decode data:", error);
    return {
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
    };
  }
};
