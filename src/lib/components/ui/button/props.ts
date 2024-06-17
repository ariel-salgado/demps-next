// Base style
const baseStyle =
	'cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50';

// Style by variant
const variantPrimary = 'bg-zinc-900 text-white hover:bg-zinc-900/85 shadow';

const variantOutline =
	'border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 shadow';

const variantLink = 'text-zinc-900 underline-offset-4 hover:underline';

// Style by size
const sizeDefault = 'h-9 px-4 py-2 text-sm';

const sizeIcon = 'size-8 p-1.5 shadow-sm';

// Exports
const variants = {
	primary: variantPrimary,
	outline: variantOutline,
	link: variantLink
};

const sizes = {
	default: sizeDefault,
	icon: sizeIcon
};

type Variants = keyof typeof variants;
type Sizes = keyof typeof sizes;

export type { Variants, Sizes };

export { baseStyle, variants, sizes };
