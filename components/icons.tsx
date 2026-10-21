// Ícones Lucide (https://lucide.dev) usados no site.
type P = { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const UploadIcon = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

export const CameraIcon = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

export const XIcon = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const PlusIcon = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export const CheckIcon = ({ size = 24 }: P) => (
  <svg {...base(size)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const DownloadIcon = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

export const ChevronLeftIcon = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const ChevronRightIcon = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const PlayIcon = ({ size = 12 }: P) => (
  <svg {...base(size)}>
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);
