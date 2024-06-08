const sizeDefault = 'h-9 w-full';

const sizeIcon =
	'inline-flex size-8 items-center justify-center rounded-md bg-white p-1.5 shadow outline outline-1 outline-slate-300';

export const sizes = {
	default: sizeDefault,
	icon: sizeIcon
};

export type Sizes = keyof typeof sizes;

export const defaultStyle = 'cursor-pointer rounded-md bg-white';
