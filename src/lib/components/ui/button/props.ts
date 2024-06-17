type Sizes = keyof typeof sizes;

// Base style
const baseStyle = 'cursor-pointer rounded-md bg-white hover:bg-neutral-100 transition-colors';

// Style by size
const sizeDefault = 'h-9 w-full';

const sizeIcon =
	'inline-flex size-8 items-center justify-center rounded-md bg-white p-1.5 shadow outline outline-1 outline-slate-300';

// Style by variant

// Exports
const sizes = {
	default: sizeDefault,
	icon: sizeIcon
};

export type { Sizes };

export { baseStyle, sizes };
