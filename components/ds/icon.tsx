import type { CSSProperties, ReactElement, SVGProps } from "react";

export type IconName =
  | "home" | "compass" | "chart" | "lineChart" | "pieChart" | "briefcase" | "user" | "users" | "settings"
  | "wallet" | "coin" | "dollar" | "trendUp" | "trendDown" | "candle" | "creditCard" | "bank"
  | "arrowUp" | "arrowDown" | "arrowLeft" | "arrowRight" | "chevronDown" | "plus" | "minus" | "check" | "close" | "refresh" | "filter" | "sort"
  | "sparkle" | "bolt" | "fire" | "trophy" | "star" | "heart" | "bookmark" | "share" | "copy" | "download" | "upload" | "edit" | "trash"
  | "mail" | "message" | "phone" | "bell"
  | "eye" | "eyeOff" | "lock" | "unlock" | "search" | "info" | "alert" | "checkCircle" | "xCircle" | "help" | "globe" | "menu" | "moreH" | "moreV"
  | "image" | "play" | "pause" | "video" | "calendar" | "clock" | "file" | "folder" | "grip" | "layers" | "grid" | "list"
  | "target" | "zap" | "shield" | "award";

const PATHS: Record<IconName, ReactElement> = {
  // Nav
  home:        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />,
  compass:     <><circle cx="12" cy="12" r="10" /><path d="m16 8-4 8-4 0 0-4 8-4" /></>,
  chart:       <><path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" /><rect x="12" y="8" width="3" height="10" /><rect x="17" y="4" width="3" height="14" /></>,
  lineChart:   <><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 6-7" /></>,
  pieChart:    <><path d="M21 12a9 9 0 1 1-9-9v9z" /><path d="M21 12a9 9 0 0 0-9-9v9z" /></>,
  briefcase:   <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  user:        <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  users:       <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0" /><path d="M16 3.1a4 4 0 0 1 0 7.8" /><path d="M22 21a6 6 0 0 0-4-5.6" /></>,
  settings:    <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,

  // Finance
  wallet:      <><path d="M20 12V8a2 2 0 0 0-2-2H5a1 1 0 0 1 0-2h14" /><path d="M3 5v14a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2v-4" /><circle cx="18" cy="14" r="1.5" fill="currentColor" /></>,
  coin:        <><circle cx="12" cy="12" r="9" /><path d="M12 7v10M15 9.5a3 3 0 0 0-3-1.5c-1.5 0-3 .7-3 2s1.5 2 3 2 3 .7 3 2-1.5 2-3 2a3 3 0 0 1-3-1.5" /></>,
  dollar:      <><path d="M12 2v20M17 5.5C17 4.12 14.76 3 12 3s-5 1.12-5 2.5S9.24 8 12 8s5 1.12 5 2.5S14.76 13 12 13s-5 1.12-5 2.5S9.24 18 12 18s5-1.12 5-2.5" /></>,
  trendUp:     <><path d="m23 6-9.5 9.5-5-5L1 18" /><path d="M17 6h6v6" /></>,
  trendDown:   <><path d="m23 18-9.5-9.5-5 5L1 6" /><path d="M17 18h6v-6" /></>,
  candle:      <><rect x="5" y="6" width="3" height="12" rx="0.5" /><path d="M6.5 3v3M6.5 18v3" /><rect x="11" y="9" width="3" height="8" rx="0.5" /><path d="M12.5 5v4M12.5 17v3" /><rect x="17" y="4" width="3" height="14" rx="0.5" /><path d="M18.5 2v2M18.5 18v3" /></>,
  creditCard:  <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>,
  bank:        <><path d="M2 10h20M4 10V8l8-5 8 5v2" /><path d="M5 10v8M10 10v8M14 10v8M19 10v8" /><path d="M2 21h20" /></>,

  // Action
  arrowUp:     <path d="m18 15-6-6-6 6" />,
  arrowDown:   <path d="m6 9 6 6 6-6" />,
  arrowLeft:   <path d="m15 18-6-6 6-6" />,
  arrowRight:  <path d="m9 18 6-6-6-6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  plus:        <path d="M12 5v14M5 12h14" />,
  minus:       <path d="M5 12h14" />,
  check:       <path d="m20 6-11 11-5-5" />,
  close:       <path d="M18 6 6 18M6 6l12 12" />,
  refresh:     <><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></>,
  filter:      <path d="M22 3H2l8 9v7l4 2v-9z" />,
  sort:        <path d="M3 6h18M6 12h12M10 18h4" />,

  // Content
  sparkle:     <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />,
  bolt:        <path d="M13 2 3 14h9l-1 8 10-12h-9z" />,
  fire:        <path d="M12 2c0 4-4 4-4 8s4 6 4 6 4-2 4-6c0-2-1-3-1-5 1 1 3 3 3 6a8 8 0 1 1-16 0c0-6 6-8 6-8s1 3 4 5" />,
  trophy:      <path d="M8 21h8M12 17v4M17 4h4v4a4 4 0 0 1-4 4M7 4H3v4a4 4 0 0 0 4 4M17 4H7v6a5 5 0 0 0 10 0z" />,
  star:        <path d="m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />,
  heart:       <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />,
  bookmark:    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  share:       <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.9 4M15.4 6.5l-6.9 4" /></>,
  copy:        <><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" /></>,
  download:    <><path d="M12 3v13M6 10l6 6 6-6" /><path d="M4 21h16" /></>,
  upload:      <><path d="M12 21V8M18 14l-6-6-6 6" /><path d="M4 3h16" /></>,
  edit:        <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z" /></>,
  trash:       <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></>,

  // Communication
  mail:        <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>,
  message:     <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  phone:       <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2z" />,
  bell:        <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,

  // System
  eye:         <><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff:      <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.7 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a13 13 0 0 1-2.17 3" /><path d="M6.61 6.61a13 13 0 0 0-4.61 5.39s4 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="m2 2 20 20" /></>,
  lock:        <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  unlock:      <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></>,
  search:      <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  info:        <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>,
  alert:       <><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18.5a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></>,
  checkCircle: <><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>,
  xCircle:     <><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></>,
  help:        <><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></>,
  globe:       <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" /></>,
  menu:        <path d="M3 6h18M3 12h18M3 18h18" />,
  moreH:       <><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
  moreV:       <><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="5" r="1" fill="currentColor" /><circle cx="12" cy="19" r="1" fill="currentColor" /></>,

  // Media
  image:       <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></>,
  play:        <path d="m5 3 14 9-14 9z" />,
  pause:       <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>,
  video:       <><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m22 8-6 4 6 4z" /></>,

  // Calendar / time
  calendar:    <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  clock:       <><circle cx="12" cy="12" r="10" /><path d="M12 7v5l3 2" /></>,

  // Files
  file:        <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>,
  folder:      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />,

  // Drag
  grip:        <><circle cx="9" cy="5" r="1" fill="currentColor" /><circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="9" cy="19" r="1" fill="currentColor" /><circle cx="15" cy="5" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="19" r="1" fill="currentColor" /></>,

  // Layout
  layers:      <><path d="m12 2 10 5-10 5L2 7z" /><path d="m2 17 10 5 10-5M2 12l10 5 10-5" /></>,
  grid:        <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
  list:        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,

  // Custom product
  target:      <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" fill="currentColor" /></>,
  zap:         <path d="m13 2-10 12h9l-1 8 11-13h-9z" fill="currentColor" stroke="none" />,
  shield:      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  award:       <><circle cx="12" cy="8" r="6" /><path d="m15.5 13-1.4 7.6L12 19l-2.1 1.6L8.5 13" /></>,
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}

export const ALL_ICONS: readonly IconName[] = Object.keys(PATHS) as IconName[];

export function Icon({ name, size = 20, strokeWidth = 1.75, className, ...rest }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
