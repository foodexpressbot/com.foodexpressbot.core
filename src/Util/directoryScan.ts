import path from 'path';
import fs from 'fs';

export default (dir: string) => {
	const scan = (dir: string, files: string[] = []) => {
		const root = fs.readdirSync(dir);
		root.forEach((file) => {
			if (fs.statSync(path.join(dir, file)).isDirectory()) files = scan(path.join(dir, file), files);
			else files.push(path.join(dir, file));
		});
		return files;
	};
	return scan(dir);
};
