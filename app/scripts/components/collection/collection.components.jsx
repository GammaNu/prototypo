import React from 'react';
import PropTypes from 'prop-types';
import {graphql, gql, compose} from 'react-apollo';
import Lifespan from 'lifespan';
import ClassNames from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import HoodieApi from '~/services/hoodie.services.js';
import LocalClient from '~/stores/local-client.stores.jsx';

import Button from '../shared/button.components.jsx';
import {collectionsTutorialLabel} from '../../helpers/joyride.helpers.js';

class Collection extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {};

		this.returnToDashboard = this.returnToDashboard.bind(this);
		this.open = this.open.bind(this);
		this.handleDeleteFamily = this.handleDeleteFamily.bind(this);
		this.handleDeleteVariant = this.handleDeleteVariant.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		const prototypoStore = await this.client.fetch('/prototypoStore');
		const creditStore = await this.client.fetch('/creditStore');

		this.setState({
			templateInfos: prototypoStore.head.toJS().templateList,
			otfCreditCost: creditStore.head.toJS().exportOtf,
		});

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				const {
					collectionSelectedFamily,
					collectionSelectedVariant,
					uiAskSubscribeFamily,
					uiAskSubscribeVariant,
					variantToExport,
					exportedVariant,
					credits,
				} = head.toJS().d;

				this.setState({
					selected: collectionSelectedFamily || {},
					selectedVariant: collectionSelectedVariant || {},
					askSubscribeFamily: uiAskSubscribeFamily,
					askSubscribeVariant: uiAskSubscribeVariant,
					variantToExport,
					exportedVariant,
					credits,
				});
			})
			.onDelete(() => {
				this.setState({
					families: undefined,
				});
			});
	}

	componentDidMount() {
		setTimeout(() => {
			this.client.dispatchAction('/store-value', {
				uiJoyrideTutorialValue: collectionsTutorialLabel,
			});
		}, (this.props.collectionTransitionTimeout + 100));
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	returnToDashboard() {
		this.client.dispatchAction('/store-value', {uiShowCollection: false});
	}

	open() {
		this.client.dispatchAction('/select-variant', {variant: this.state.selectedVariant, family: this.state.selected});
		this.client.dispatchAction('/store-value', {uiShowCollection: false});
	}

	download() {
	}

	async handleDeleteFamily() {
		await this.props.deleteFamily(this.state.selected.id);
		await this.props.refetch(); // ugly TMP
	}

	async handleDeleteVariant() {
		await this.props.deleteVariant(this.state.selectedVariant.id);
		await this.props.refetch(); // ugly TMP
	}

	render() {
		const {families} = this.props;
		const {
			selected,
			templateInfos,
			askSubscribeFamily,
			variantToExport,
			exportedVariant,
			credits,
			otfCreditCost,
			askSubscribeVariant,
		} = this.state;

		console.log('just received', families, selected);
		const selectedFamilyVariants = (families.find((family) => {
			return family.name === selected.name;
		}) || {}).variants;
		const variant = selectedFamilyVariants ? (
			<VariantList
				variants={selectedFamilyVariants}
				selectedVariantId={this.state.selectedVariant.id}
				askSubscribe={askSubscribeFamily}
				variantToExport={variantToExport}
				exportedVariant={exportedVariant}
				credits={credits}
				otfCreditCost={otfCreditCost}
				family={selected}
				onDeleteFamily={this.handleDeleteFamily}
			/>
		) : false;

		const selectedVariant = ((selectedFamilyVariants || []).find((item) => {
			return item.id === this.state.selectedVariant.id;
		}) || {});

		const variantInfo = (
			<VariantInfo
				open={this.open}
				download={this.download}
				key={selectedVariant.id}
				family={selected}
				askSubscribe={askSubscribeVariant}
				credits={credits}
				otfCreditCost={otfCreditCost}
				variant={selectedVariant}
				onDeleteVariant={this.handleDeleteVariant}
			/>
		);

		return (
			<div className="collection">
				<div className="collection-container">
					<div className="account-dashboard-icon"/>
					<div className="account-dashboard-back-icon" onClick={this.returnToDashboard}/>
					<div className="account-header">
						<h1 className="account-title">My collection</h1>
					</div>
					<div className="collection-content">
						<FamilyList
							list={families}
							templateInfos={templateInfos}
							selected={selected}/>
						<ReactCSSTransitionGroup
							component="div"
							transitionName="variant-list-container"
							transitionEnterTimeout={300}
							transitionLeaveTimeout={300}
							className="variant-list collection-pan">
							{variant}
						</ReactCSSTransitionGroup>
						<ReactCSSTransitionGroup
							component="div"
							transitionName="variant-info-container"
							transitionEnterTimeout={300}
							transitionLeaveTimeout={300}
							className="variant-info collection-pan">
							{variantInfo}
						</ReactCSSTransitionGroup>
					</div>
				</div>
			</div>
		);
	}
}

Collection.propTypes = {
	families: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string,
			name: PropTypes.string,
			template: PropTypes.string,
		}),
	).isRequired,
	deleteFamily: PropTypes.func,
	deleteVariant: PropTypes.func,
};

Collection.defaultProps = {
	families: [],
	deleteFamily: () => {},
	deleteVariant: () => {},
};

const libraryQuery = gql`
	query {
		user {
			id
			library {
				id
				name
				template
				variants {
					id
					name
					values
				}
			}
		}
	}
`;


const deleteVariantMutation = gql`
	mutation deleteVariant($id: ID!) {
		deleteVariant(id: $id) {
			id
		}
	}
`;

const deleteFamilyMutation = gql`
	mutation deleteFamily($id: ID!) {
		deleteFamily(id: $id) {
			id
		}
	}
`;

export default compose(
	graphql(libraryQuery, {
		props: ({data}) => {
			console.log('Collection libraryQuery', data);
			if (data.loading) {
				return {loading: true};
			}

			if (data.user) {
				return {
					families: data.user.library,
					refetch: data.refetch,
				};
			}

			return {refetch: data.refetch};
		},
	}),
	graphql(deleteVariantMutation, {
		props: ({mutate}) => ({
			deleteVariant: id => mutate({variables: {id}}),
		}),
	}),
	graphql(deleteFamilyMutation, {
		props: ({mutate, ownProps}) => ({
			deleteFamily: (id) => {
				const family = ownProps.families.find(f => f.id === id);

				if (!family) {
					return Promise.reject();
				}

				// don't worry, mutations are batched, so we're only sending one or two requests
				// in the future, cascade operations should be available on graphcool
				const variants = family.variants.map(variant => ownProps.deleteVariant(variant.id));

				return Promise.all([
					...variants,
					mutate({variables: {id}}),
				]);
			},
		}),
	}),
)(Collection);

class FamilyList extends React.PureComponent {
	constructor(props) {
		super(props);

		this.openFamilyModal = this.openFamilyModal.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	openFamilyModal() {
		this.client.dispatchAction('/store-value', {openFamilyModal: true});
	}

	render() {
		const families = this.props.list.map((family) => {
			const templateInfo = this.props.templateInfos.find((template) => {
				return template.templateName === family.template;
			});

			const selected = family.name === this.props.selected.name;

			return (
				<Family
					key={family.name}
					family={family}
					selected={selected}
					class={family.template.split('.')[0]}
					templateName={templateInfo.name}
				/>
			);
		});

		return (
				<div className="family-list collection-pan">
					<Button label="Create a new family" click={this.openFamilyModal}/>
					{families}
				</div>
		);
	}
}

class Family extends React.PureComponent {
	constructor(props) {
		super(props);

		this.selectFamily = this.selectFamily.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	selectFamily() {
		this.client.dispatchAction('/select-family-collection', this.props.family);
	}

	render() {
		const classes = ClassNames({
			family: true,
			'is-active': this.props.selected,
		});
		const sampleClasses = ClassNames({
			'family-sample': true,
			[this.props.class]: true,
		});

		return (
			<div className={classes} onClick={this.selectFamily}>
				<div className={sampleClasses} />
				<div className="family-info">
					<div className="family-info-name">
						{this.props.family.name}
					</div>
					<div className="family-info-base">
						FROM<span className="family-info-base-template"> {this.props.templateName}</span>
					</div>
				</div>
			</div>
		);
	}
}

class VariantList extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			deleteSplit: false,
		};

		this.cancelDelete = this.cancelDelete.bind(this);
		this.prepareDeleteOrDelete = this.prepareDeleteOrDelete.bind(this);
		this.openChangeNameFamily = this.openChangeNameFamily.bind(this);
		this.downloadFamily = this.downloadFamily.bind(this);
		this.askSubscribe = this.askSubscribe.bind(this);
		this.buyCredits = this.buyCredits.bind(this);
		this.openVariantModal = this.openVariantModal.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.client.dispatchAction('/store-value', {
			uiAskSubscribeFamily: false,
		});
	}

	selectVariant(variant) {
		this.client.dispatchAction('/select-variant-collection', variant);
	}

	openVariantModal() {
		this.client.dispatchAction('/store-value', {
			openVariantModal: true,
			familySelectedVariantCreation: this.props.family,
		});
	}

	openChangeNameFamily() {
		this.client.dispatchAction('/store-value', {
			openChangeFamilyNameModal: true,
			familySelectedVariantCreation: this.props.family,
		});
	}

	prepareDeleteOrDelete() {
		if (this.state.deleteSplit) {
			this.props.onDeleteFamily();
			this.client.dispatchAction('/delete-family', {
				family: this.props.family,
			});
			this.setState({deleteSplit: false});
		}
		else {
			this.setState({deleteSplit: true});
		}
	}

	cancelDelete() {
		this.setState({deleteSplit: false});
	}

	downloadFamily() {
		this.client.dispatchAction('/store-value', {
			currentCreditCost: this.props.otfCreditCost,
		});
		this.client.dispatchAction('/export-family', {
			familyToExport: this.props.family,
			variants: this.props.variants,
		});
	}

	askSubscribe() {
		if (this.props.askSubscribe) {
			document.location.href = '#/account/subscribe';
		}
		else {
			this.client.dispatchAction('/store-value', {
				uiAskSubscribeFamily: true,
			});
		}
	}

	buyCredits() {
		this.client.dispatchAction('/store-value', {
			openBuyCreditsModal: true,
		});
	}

	render() {
		const {deleteSplit} = this.state;
		const variants = this.props.variants.map((variant, i) => {
			const classes = ClassNames({
				'variant-list-name': true,
				'is-active': variant.id === this.props.selectedVariantId,
			});

			return (
				<div className={classes} key={i} onClick={() => {this.selectVariant(variant);}}>
					{this.props.family.name} {variant.name}
				</div>
			);
		});
		const freeUser = HoodieApi.instance.plan.indexOf('free_') !== -1;
		const hasEnoughCredits = this.props.credits !== undefined
			&& this.props.credits > 0
			&& (this.props.otfCreditCost * this.props.variants.length) < this.props.credits;
		const canExport = !freeUser || hasEnoughCredits;
		const downloadLabel = this.props.variantToExport
			? `${this.props.exportedVariant} / ${this.props.variantToExport}`
			: !canExport && this.props.askSubscribe
				? 'Subscribe'
				: `Download family${hasEnoughCredits ? ' (' + this.props.variants.length + ' credits)' : ''}`;
		const buyCreditsLabel = this.props.askSubscribe
			? 'Buy credits'
			: '';

		return (
			<div className="variant-list-container">
				<div className="variant-list-title">
					FAMILY ACTIONS
				</div>
				<Button label="Change family name" click={this.openChangeNameFamily}/>
				<Button
					label={deleteSplit ? 'Delete' : 'Delete family'}
					altLabel="Cancel"
					danger
					splitButton
					splitted={deleteSplit}
					click={this.prepareDeleteOrDelete}
					altClick={this.cancelDelete}
				/>
				<div className="variant-list-title">
					VARIANTS
				</div>
				<Button label="Add variant" click={this.openVariantModal}/>
				{variants}
			</div>
		);
	}
}

VariantList.propTypes = {
	onDeleteFamily: PropTypes.func,
};

VariantList.defaultProps = {
	onDeleteFamily: () => {},
};

class VariantInfo extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			deleteSplit: false,
		};

		this.edit = this.edit.bind(this);
		this.duplicate = this.duplicate.bind(this);
		this.cancelDelete = this.cancelDelete.bind(this);
		this.prepareDeleteOrDelete = this.prepareDeleteOrDelete.bind(this);
		this.askSubscribe = this.askSubscribe.bind(this);
		this.buyCredits = this.buyCredits.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.client.dispatchAction('/store-value', {
			uiAskSubscribeVariant: false,
		});
	}

	edit() {
		this.client.dispatchAction('/store-value', {
			openChangeVariantNameModal: true,
			familySelectedVariantCreation: this.props.family,
		});
	}

	duplicate() {
		this.client.dispatchAction('/store-value', {
			openDuplicateVariantModal: true,
			familySelectedVariantCreation: this.props.family,
		});
	}

	prepareDeleteOrDelete() {
		if (this.state.deleteSplit) {
			this.props.onDeleteVariant();
			this.client.dispatchAction('/delete-variant', {
				variant: this.props.variant,
				familyName: this.props.family.name,
			});
			this.setState({deleteSplit: false});
		}
		else {
			this.setState({deleteSplit: true});
		}
	}

	askSubscribe() {
		if (this.props.askSubscribe) {
			document.location.href = '#/account/subscribe';
		}
		else {
			this.client.dispatchAction('/store-value', {
				uiAskSubscribeVariant: true,
			});
		}
	}

	buyCredits() {
		this.client.dispatchAction('/store-value', {
			openBuyCreditsModal: true,
		});
	}

	cancelDelete() {
		this.setState({deleteSplit: false});
	}

	downloadVariant() {
		this.client.dispatchAction('/store-value', {
			currentCreditCost: this.props.otfCreditCost,
		});
		this.client.dispatchAction('/export-otf', {merged});
	}

	render() {
		const {deleteSplit} = this.state;
		const freeUser = HoodieApi.instance.plan.indexOf('free_') !== -1;
		const hasEnoughCredits = this.props.credits !== undefined
			&& this.props.credits > 0
			&& this.props.otfCreditCost < this.props.credits;
		const canExport = !freeUser || hasEnoughCredits;
		const downloadLabel = this.props.variantToExport
			? `${this.props.exportedVariant} / ${this.props.variantToExport}`
			: !canExport && this.props.askSubscribe
				? 'Subscribe'
				: `Download Variant${hasEnoughCredits ? ' (1 credits)' : ''}`;
		const buyCreditsLabel = this.props.askSubscribe
			? 'Buy credits'
			: '';

		const result = this.props.variant.id
			? (
				<div className="variant-info-container">
					<div className="variant-list-title">
						VARIANT ACTIONS
					</div>
					<Button label="Open in prototypo" important click={this.props.open}/>
					<Button label="Change variant name" click={this.edit}/>
					<Button label="Duplicate variant" click={this.duplicate}/>
					<Button
						label={deleteSplit ? 'Delete' : 'Delete variant'}
						altLabel="Cancel"
						danger
						splitButton
						splitted={deleteSplit}
						click={this.prepareDeleteOrDelete}
						altClick={this.cancelDelete}
					/>
				</div>
			)
			: (
				<div className="variant-info-container" />
			);

		return result;
	}
}

VariantInfo.propTypes = {
	onDeleteVariant: PropTypes.func,
};

VariantInfo.defaultProps = {
	onDeleteVariant: () => {},
};
