import {gql} from 'react-apollo';
import {AppValues} from '../services/values.services.js';
import LocalClient from '../stores/local-client.stores.jsx';
import apolloClient from '../services/graphcool.services';
import slug from 'slug';
slug.defaults.mode = 'rfc3986';
slug.defaults.modes.rfc3986.remove = /[-_\/\\\.]/g;

let localClient;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
});

const defaultValues = {
		values: {
			mode: ['glyph', 'word', 'text'],
			selected: 'A'.charCodeAt(0).toString(),
			onboard: false,
			onboardstep: 'welcome',
			word: 'Hello Prototypo',
			wordFontSize: 7.6,
			text: 'Type any text here and preview your modifications in real time! Curabitur blandit tempus porttitor. Maecenas sed diam eget risus varius blandit sit amet non magna. Sed posuere consectetur est at lobortis. Etiam porta sem malesuada magna mollis euismod. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla vitae elit libero, a pharetra augue. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Vestibulum id ligula porta felis euismod semper. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Cras mattis consectetur purus sit amet fermentum. Cras mattis consectetur purus sit amet fermentum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Donec sed odio dui.',
			textFontSize: 1.6,
			pos: ['Point', 457, -364],
			familySelected: {
				name: 'My first font',
				template: 'elzevir.ptf',
			},
			variantSelected: {
				id: 'deadbeef',
				name: 'REGULAR',
				db: 'myfirstfont',
			},
			library: [{
				name: 'My first font',
				template: 'elzevir.ptf',
				variants: [{
					id: 'deadbeef',
					name: 'REGULAR',
					db: 'myfirstfont',
				}],
			}],
			savedSearch: [],
			firstTimeFile: true,
			firstTimeCollection: true,
			firstTimeIndivCreate: true,
			firstTimeIndivEdit: true,
		},
};

export async function loadStuff() {

	// get all the fonts the user has and put them in the store
	// temporary
	let families = [];
	if (localStorage.getItem('graphcoolToken')) {
		const response = await apolloClient.query({
			query: gql`
				query getFonts {
					user {
						library {
							id
							name
							template
							variants {
								id
								name
							}
						}
					}
				}
			`,
		});

		families = response.data.user.library;
	}

	//We need to fix database names for the change to normal hoodie api so let's go

	let oldAppValues;

	// if (HoodieApi.instance.pouch) {
	// 	try {
	// 		oldAppValues = await AppValues.getWithPouch({typeface: 'default'});
	// 	}
	// 	catch (err) {
	// 		trackJs.track(err);
	// 		console.log(err);
	// 	}
	// 	//Login checking and app and font values loading
	// 	if (oldAppValues && oldAppValues.values.library && oldAppValues.values.library.length > 0 && !oldAppValues.values.switchedToHoodie) {
	// 		for (let i = 0; i < oldAppValues.values.library.length; i++) {
	// 			const variants = oldAppValues.values.library[i].variants;

	// 			for (let j = 0; j < variants.length; j++) {
	// 				const variant = variants[j];
	// 				const newDb = slug(variant.db, '');

	// 				if (newDb !== variant.db) {

	// 					//Here we copy the old db to the new db with slugified name
	// 					try {
	// 						const oldFontValues = await FontValues.getWithPouch({typeface: variant.db});
	// 						await FontValues.save({
	// 							typeface: newDb,
	// 							values: oldFontValues.values,
	// 						});
	// 					}
	// 					catch (err) {
	// 						trackJs.track(err);
	// 						console.log(err);
	// 					}
	// 					variant.db = newDb;
	// 				}
	// 			}
	// 		}
	// 		oldAppValues.values.variantSelected = oldAppValues.values.variantSelected || oldAppValues.values.library[0].variants[0];
	// 		oldAppValues.values.switchedToHoodie = true;
	// 		await AppValues.save({typeface: 'default', values: oldAppValues.values});
	// 	}
	// }

	let appValues;

	try {
		appValues = oldAppValues ? oldAppValues : await AppValues.get({typeface: 'default'});
		console.log('this is the app values', appValues);
		appValues.values = {...defaultValues.values, ...appValues.values};
		//This is to save old accounts
		if (appValues.values.variantSelected.id === undefined) {
			appValues.values.variantSelected = defaultValues.values.variantSelected;
		}
		if (appValues.values.familySelected.name === undefined) {
			appValues.values.familySelected = defaultValues.values.familySelected;
		}

		if (appValues.values.library.length <= 0) {
			appValues.values.library = defaultValues.values.library;
		}

		// tmp
		const selectedFamily = families.find(({name}) => name === appValues.values.familySelected.name);
		if (selectedFamily) {
			appValues.values.familySelected = {...appValues.values.familySelected, ...selectedFamily};

			const selectedVariant = selectedFamily.variants.find(({name}) => name === appValues.values.variantSelected.name);
			appValues.values.variantSelected = {...appValues.values.variantSelected, ...selectedVariant};
		}
	}
	catch (err) {
		appValues = defaultValues;
		console.error(err);
	}
	localClient.dispatchAction('/load-app-values', appValues);

	let customerValues;

	localClient.dispatchAction('/load-font-instance', {appValues});

}
