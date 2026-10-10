import { toast } from 'sonner';
import { DropdownMenuItem } from './dropdown-menu';

interface Props {
  title: string;
  text: string;
}

export function DropdownMenuCopyItem({ title, text }: Props) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast(`${title} copied to clipboard`);
  };

  return (
    <DropdownMenuItem
      onClick={handleCopy}
      className="border-border group flex justify-between overflow-hidden rounded-b-sm border p-0 text-nowrap"
    >
      <span className="px-2">{text}</span>
      <span className="bg-secondary text-secondary-foreground aria-expanded:bg-secondary aria-expanded:text-secondary-foreground block px-2 leading-10 group-hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]">
        Copy
      </span>
    </DropdownMenuItem>
  );
}
