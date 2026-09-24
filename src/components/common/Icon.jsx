const PATHS = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-4.35-4.35',
  cart: 'M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  dashboard: 'M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z',
  box: 'M21 8 12 3 3 8m18 0-9 5m9-5v8l-9 5m0-8L3 8m9 5v8M3 8v8l9 5',
  truck: 'M3 6h11v10H3zM14 9h4l3 3v4h-7zM7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  users: 'M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm10 8v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.5 4.2a3.5 3.5 0 0 1 0 6.6',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2-1.2l-.4-2.6h-4l-.4 2.6a7.5 7.5 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7.5 7.5 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z',
  store: 'M4 9h16v11H4zM3 9l1.5-5h15L21 9M9 20v-6h6v6',
  edit: 'M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3ZM14.5 7.5l2 2',
  trash: 'M4 7h16M9 7V5h6v2m-8 0 1 13h8l1-13',
  eye: 'M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Zm10 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  document: 'M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4Zm0 0v4h4M9 13h6M9 17h4',
  download: 'M12 4v10m0 0 4-4m-4 4-4-4M4 18h16',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M5 13l4 4L19 7',
  alert: 'M12 8v5m0 3v.5M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  money: 'M12 6v12M9.5 9.5a2.5 2.5 0 0 1 2.5-2h.5a2 2 0 0 1 0 4h-1a2 2 0 0 0 0 4h.5a2.5 2.5 0 0 0 2.5-2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
  flask: 'M9 3h6M10 3v6l-5.4 9.3A1.5 1.5 0 0 0 5.9 21h12.2a1.5 1.5 0 0 0 1.3-2.3L14 9V3M7.5 15h9',
  filter: 'M3 5h18l-7 8v6l-4 2v-8L3 5Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  chevronRight: 'M9 5l7 7-7 7',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-5A8 8 0 1 1 21 12Z',
  home: 'M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z',
  hotel: 'M4 20V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v15M15 20V9h4a1 1 0 0 1 1 1v10M3 20h18M7 8h1M7 12h1M11 8h1M11 12h1',
  school: 'M12 4 2 9l10 5 10-5-10-5ZM6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5',
  building: 'M5 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17M15 21V10h4a1 1 0 0 1 1 1v10M3 21h18M8 7h2M8 11h2M8 15h2',
  factory: 'M3 21V10l5 3.5V10l5 3.5V10l5 3.5V21M3 21h18M7 17h2M13 17h2',
  logout: 'M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 8l-4 4 4 4M6 12h10',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1',
  lock: 'M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Zm2 0V8a4 4 0 0 1 8 0v3',
  mail: 'M3 7h18v12H3zM3 7l9 7 9-7',
  phone: 'M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 5.2 2 2 0 0 1 6 3Z',
  pin: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  shield: 'M12 3l8 3v5.5c0 5-3.4 8.9-8 9.5-4.6-.6-8-4.5-8-9.5V6l8-3Z',
  tag: 'M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Zm4.5-5.5h.01',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z',
  arrowRight: 'M5 12h14m0 0-5-5m5 5-5 5',
  arrowLeft: 'M19 12H5m0 0 5 5m-5-5 5-5',
  inbox: 'M3 13h5l1 3h6l1-3h5M3 13l2.4-7.4A1 1 0 0 1 6.3 5h11.4a1 1 0 0 1 .9.6L21 13v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5Z',
};

function Icon({ name, className = 'w-5 h-5', strokeWidth = 1.6 }) {
  const path = PATHS[name];
  if (!path) {
    return null;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export default Icon;
