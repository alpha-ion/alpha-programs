import Link from 'next/link';
import { Link as LinkIcon } from 'lucide-react';

interface ExternalLinkProps {
  label: string;
  url: string;
  icon?: string;
}

export function ExternalLink({ label, url, icon = 'ph:link-simple' }: ExternalLinkProps) {
  if (!label || !url) return null;

  return (
    <li>
      <Link href={url} target="_blank" rel="noopener noreferrer">
        <div className="flex items-center space-x-2 p-1 -m-1 rounded-xl hover:bg-slate-100 bg-slate-50">
          <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg text-slate-500">
            {/* 
              TODO: Handle dynamic icons properly if needed. 
              For now, defaulting to LinkIcon for 'ph:link-simple' and others.
            */}
            <LinkIcon className="h-5 w-5" />
          </div>
          <div className="w-full flex-grow min-w-0">
            <p className="font-medium text-sm leading-6 text-gray-900">
              {label}
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}
