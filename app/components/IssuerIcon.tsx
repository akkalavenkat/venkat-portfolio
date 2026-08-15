import { type LucideIcon } from "lucide-react";
import { GithubIcon } from "@/app/components/BrandIcons";

function OracleIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="#F80000" xmlns="http://www.w3.org/2000/svg">
      <title>Oracle</title>
      <path d="M16.412 4.412a7.589 7.589 0 0 1 0 15.176H7.59a7.589 7.589 0 0 1 0-15.176zm-.59 2.356H8.178a5.233 5.233 0 0 0 0 10.464h7.644a5.233 5.233 0 0 0 0-10.464z" />
    </svg>
  );
}

function SpringIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="#6DB33F" xmlns="http://www.w3.org/2000/svg">
      <title>Spring</title>
      <path d="M21.8537 1.4158a10.4504 10.4504 0 0 1-1.284 2.2471A11.9666 11.9666 0 1 0 3.8518 20.7757l.4445.3951a11.9543 11.9543 0 0 0 19.6316-8.2971c.3457-3.0126-.568-6.8649-2.0743-11.458zM5.5805 20.8745a1.0174 1.0174 0 1 1-.1482-1.4323 1.0396 1.0396 0 0 1 .1482 1.4323zm16.1991-3.5806c-2.9385 3.9263-9.2601 2.5928-13.2852 2.7904 0 0-.7161.0494-1.4323.1481 0 0 .2717-.1234.6174-.2469 2.8398-.9877 4.1732-1.1853 5.9018-2.0743 3.2349-1.6545 6.4698-5.2844 7.1118-9.0379-1.2347 3.6053-4.9881 6.7167-8.3959 7.9761-2.3459.8643-6.5685 1.7039-6.5685 1.7039l-.1729-.0988c-2.8645-1.4076-2.9632-7.6304 2.2718-9.6306 2.2966-.889 4.4696-.395 6.9637-.9877 2.6422-.6174 5.7043-2.5929 6.939-5.1857 1.3828 4.1732 3.062 10.643.0493 14.6434z" />
    </svg>
  );
}

type IconEntry = { Icon: LucideIcon; color: string } | { custom: React.ReactNode };

const issuerIconMap: Record<string, IconEntry> = {
  Oracle: { custom: <OracleIcon /> },
  GitHub: { custom: <GithubIcon width={20} height={20} style={{ color: "#181717" }} /> },
  Broadcom: { custom: <SpringIcon /> },
};

export default function IssuerIcon({ issuer }: Readonly<{ issuer: string }>) {
  const entry = issuerIconMap[issuer];

  if (entry) {
    const content =
      "custom" in entry ? (
        entry.custom
      ) : (
        <entry.Icon size={20} color={entry.color} />
      );
    return (
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
        aria-hidden="true"
      >
        {content}
      </span>
    );
  }

  // Fallback: styled initials
  const initials = issuer
    .split(/[\s(,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-[11px] font-bold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      aria-hidden="true"
      title={issuer}
    >
      {initials}
    </span>
  );
}
