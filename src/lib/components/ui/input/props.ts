const baseStyle =
	'flex h-9 w-full bg-white rounded-md border border-slate-300 px-3 py-2 text-sm ring-offset-white read-only:cursor-not-allowed read-only:select-none read-only:bg-slate-100 read-only:text-slate-700 read-only:ring-offset-slate-100 focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-700 focus-within:ring-offset-2 read-only:focus-within:ring-opacity-0';

const onlyAllowNumbers = (e: KeyboardEvent) => {
	const input = e.target as HTMLInputElement;
	const cursorPosition = input.selectionStart;
	const hasMinusSign = input.value.includes('-');
	const hasDecimalPoint = input.value.includes('.');

	if (e.key === 'Backspace' || e.key === 'Delete' || e.key.startsWith('Arrow') || e.key === 'Tab') {
		return;
	}

	if (e.key === '-' && cursorPosition !== 0) e.preventDefault();
	else if (e.key === '.' && hasDecimalPoint) e.preventDefault();
	else if (
		!/[\d.-]/.test(e.key) ||
		(e.key === '-' && hasMinusSign) ||
		(e.key === '.' && cursorPosition === 0)
	)
		e.preventDefault();
};

export { baseStyle, onlyAllowNumbers };
