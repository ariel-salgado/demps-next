export const ssr = true;
export const prerender = true;

const signals = ['SIGINT', 'SIGTERM'];

signals.forEach((event) => {
	process.on(event, () => {
		process.exit();
	});
});
