// Base style
const baseStyle =
	'cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-600 disabled:pointer-events-none disabled:opacity-50';

// Style by variant
const variantPrimary = 'bg-slate-700 text-white hover:bg-slate-700/85 shadow';

const variantOutline =
	'border border-slate-300 bg-white hover:bg-slate-100 hover:text-slate-700 shadow';

const variantLink = 'text-slate-700 underline-offset-4 hover:underline';

// Style by size
const sizeDefault = 'h-9 px-4 py-2 text-sm';

const sizeSmall = 'h-7 px-3 py-1 text-xs';

const sizeIcon = 'size-8 p-1.5 shadow-sm';

// Exports
const variants = {
	primary: variantPrimary,
	outline: variantOutline,
	link: variantLink
};

const sizes = {
	default: sizeDefault,
	sm: sizeSmall,
	icon: sizeIcon
};

type Variants = keyof typeof variants;
type Sizes = keyof typeof sizes;

export type { Variants, Sizes };

export { baseStyle, variants, sizes };
