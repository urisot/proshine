import Icon from './Icon.jsx';

function EmptyState({ icon = 'inbox', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-space-sm py-space-xl px-space-md animate-fade-up">
      <span className="relative flex items-center justify-center w-20 h-20 rounded-full bg-surface-container-high text-secondary bevel-top">
        <span className="absolute inset-0 rounded-full bg-secondary/10 blur-xl" />
        <Icon name={icon} className="relative w-9 h-9" strokeWidth={1.3} />
      </span>
      <h3 className="font-display text-headline-sm text-on-surface">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md">{message}</p>
      {action}
    </div>
  );
}

export default EmptyState;
