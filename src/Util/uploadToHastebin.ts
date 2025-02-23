import axios from 'axios';

export default (data: any): Promise<string> => {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await axios({
				method: 'POST',
				url: 'https://paste.hep.gg/documents',
				data
			});

			resolve('https://paste.hep.gg/' + result.data.key);
		} catch (e) {
			reject(e);
		}
	});
};
