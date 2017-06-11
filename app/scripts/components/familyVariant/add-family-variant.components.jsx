import React from 'react';
import Classnames from 'classnames';
import Lifespan from 'lifespan';

import LocalClient from '~/stores/local-client.stores.jsx';
import Log from '~/services/log.services.js';

import Button from '../shared/button.components.jsx';
import SelectWithLabel from '../shared/select-with-label.components.jsx';

export class AddFamily extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			fonts: [],
		};

		this.exit = this.exit.bind(this);
		this.createFont = this.createFont.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		const templateList = await this.client.fetch('/prototypoStore');

		this.client.getStore('/prototypoStore', this.lifespan)
		.onUpdate((head) => {
				this.setState({
					selectedFont: head.toJS().d.uiCreatefamilySelectedTemplate,
					error: head.toJS().d.errorAddFamily,
				});
			})
			.onDelete(() => {
				this.setState({
					error: undefined,
				});
			});

		this.setState({
			fonts: templateList.get('templateList'),
		});
	}

	componentWillUnmount() {
		this.client.dispatchAction('/store-value', {
			errorAddFamily: undefined,
			uiCreatefamilySelectedTemplate: undefined,
		});

		this.lifespan.release();
	}

	toggleForm(e, state) {
		e.stopPropagation();
		this.setState({
			error: undefined,
		});

		if (state) {
			this.client.dispatchAction('/store-value', {uiOnboardstep: 'creatingFamily-2'});
			setTimeout(() => {
				this.refs.name.focus();
			}, 100);
		}
	}

	selectFont(uiCreatefamilySelectedTemplate) {
		this.client.dispatchAction('/store-value', {
			errorAddFamily: undefined,
		});
		this.client.dispatchAction('/store-value', {uiCreatefamilySelectedTemplate});
	}

	exit() {
		this.client.dispatchAction('/store-value', {
			openFamilyModal: false,
		});
	}

	createFont(e) {
		e.stopPropagation();
		this.client.dispatchAction('/create-family', {
			name: this.refs.name.value,
			template: this.state.selectedFont ? this.state.selectedFont.templateName : undefined,
			loadCurrent: this.state.selectedFont ? this.state.selectedFont.loadCurrent : false,
		});
		Log.ui('Collection.CreateFamily');
		this.client.dispatchAction('/store-value', {uiOnboardstep: 'customize'});
	}

	render() {

		const familyClass = Classnames({
			'add-family': true,
			'with-error': !!this.state.error,
		});

		const templateList = _.map(this.state.fonts, (font) => {
			return (
				<FamilyTemplateChoice
					key={font.name}
					selectedFont={this.state.selectedFont}
					font={font}
					chooseFont={(selectedFont) => {this.selectFont(selectedFont);}}/>
			);
		});

		const error = this.state.error ? <div className="add-family-form-error">{this.state.error}</div> : false;

		return (
			<div className={familyClass} onClick={(e) => {this.toggleForm(e, true);} } id="font-create">
				<div className="add-family-form">
					<label className="add-family-form-label"><span className="add-family-form-label-order">1. </span>Choose a font template</label>
					<div className="add-family-form-template-list">
						{templateList}
					</div>
					<label className="add-family-form-label"><span className="add-family-form-label-order">2. </span>Choose a family name</label>
					<input ref="name" className="add-family-form-input" type="text" placeholder="My new typeface"></input>
					{error}
					<div className="action-form-buttons">
						<Button click={this.exit} label="Cancel" neutral />
						<Button click={this.createFont} label="Create family"/>
					</div>
				</div>
			</div>
		);
	}
}

export class FamilyTemplateChoice extends React.Component {
	render() {
		const classes = Classnames({
			'family-template-choice': true,
			'is-active': this.props.selectedFont && this.props.selectedFont.name === this.props.font.name,
		});

		return (
			<div className={classes} onClick={() => {this.props.chooseFont(this.props.font);}}>
				<div className="family-template-choice-sample">
					<img src={`/assets/images/${this.props.font.sample}`} />
				</div>
				<div className="family-template-choice-name">
					{this.props.font.name}
				</div>
			</div>
		);
	}
}

export class AddVariant extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			error: undefined,
		};

		this.exit = this.exit.bind(this);
		this.createVariant = this.createVariant.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				if (head.toJS().d.errorAddVariant !== this.state.error) {
					this.setState({
						error: head.toJS().d.errorAddVariant,
					});
				}
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.variants = [
			{label: 'Thin', value: 'Thin'}, //20
			{label: 'Thin Italic', value: 'Thin Italic'},
			{label: 'Light', value: 'Light'}, //50
			{label: 'Light Italic', value: 'Light Italic'},
			{label: 'Book', value: 'Book'}, //70
			{label: 'Book Italic', value: 'Book Italic'},
			{label: 'Regular', value: 'Regular'},
			{label: 'Regular Italic', value: 'Regular Italic'},
			{label: 'Semi-Bold', value: 'Semi-Bold'}, //100
			{label: 'Semi-Bold Italic', value: 'Semi-Bold Italic'},
			{label: 'Bold', value: 'Bold'}, //115
			{label: 'Bold Italic', value: 'Bold Italic'},
			{label: 'Extra-Bold', value: 'Extra-Bold'}, //135
			{label: 'Extra-Bold Italic', value: 'Extra-Bold Italic'},
			{label: 'Black', value: 'Black'}, //150
			{label: 'Black Italic', value: 'Black Italic'},
		];
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	createVariant(e) {
		e.stopPropagation();
		this.client.dispatchAction('/create-variant', {
			name: this.refs.variantName.inputValue.value,
			familyName: this.props.family.name,
			familyId: this.props.family.id,
		});
		Log.ui('Collection.createVariant');
	}

	exit() {
		this.client.dispatchAction('/store-value', {
			openVariantModal: false,
			errorAddVariant: undefined,
		});
	}

	render() {
		console.log('here the ', this.props.family);
		return (
			<div className="variant" ref="container">
				<SelectWithLabel
					ref="variantName"
					noResultsText={false}
					placeholder="Enter a variant name or choose a suggestion with predefined settings"
					options={this.variants}/>
				<div className="variant-error">{this.state.error}</div>
				<div className="action-form-buttons">
					<Button click={this.exit} label="Cancel" neutral={true}/>
					<Button click={this.createVariant} label="Create variant"/>
				</div>
			</div>
		);
	}
}
