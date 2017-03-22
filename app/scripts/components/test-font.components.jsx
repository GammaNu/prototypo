import React from 'react';
import pleaseWait from 'please-wait';
import Lifespan from 'lifespan';
import ScrollArea from 'react-scrollbar';

import FontPrecursor from '../prototypo.js/precursor/FontPrecursor.js';
import Constant from '../prototypo.js/precursor/Constant.js';
import Formula from '../prototypo.js/precursor/Formula.js';
import ExpandingNode from '../prototypo.js/precursor/ExpandingNode.js';

import Toile from '../toile/toile.js';

import LocalClient from '../stores/local-client.stores.jsx';

import {toLodashPath} from '../prototypo.js/helpers/utils.js';

class ConstOrForm extends React.PureComponent {
	render() {
		if (this.props.value instanceof Constant) {
			return (
				<div>
					<div style={{'background-color': '#90B9FF', padding: '10px'}}>{this.props.name}</div>
					<div>
						<div style={{'background-color': '#A9D9FF', padding: '10px'}}>{JSON.stringify(_.get(this.props.val, toLodashPath(this.props.value.cursor)))}</div>
					</div>
				</div>
			);
		}
		else if (this.props.value instanceof Formula) {
			return (
				<div>
					<div style={{'background-color': '#90B9FF', padding: '10px'}}>{this.props.name}</div>
					<div style={{'background-color': '#C9B9FF', padding: '10px'}}>
						{_.map(this.props.value.dependencies, (d) => {
							return <div>{d}: {JSON.stringify(_.get(this.props.val, toLodashPath(d)))} </div>;
						})}
					</div>
					<div style={{'background-color': '#A9E9FF', padding: '10px'}}>
						{_.map(this.props.value.parameters, (p) => {
							return <div>{p}: {this.props.values[p]}</div>;
						})}
					</div>
					<div style={{'background-color': '#A9D9FF', padding: '10px'}}>{this.props.value.operation.toString()}</div>
					<div style={{'background-color': '#FFC9B0', padding: '10px'}}>{JSON.stringify(_.get(this.props.val, toLodashPath(this.props.value.cursor)))}</div>
				</div>
			);
		}
		else if (this.props.cursor) {
			return (
				<div>
					<div style={{'background-color': '#90B9FF', padding: '10px'}}>{this.props.name}</div>
					<div style={{'background-color': '#FFC9B0', padding: '10px'}}>{JSON.stringify(_.get(this.props.val, toLodashPath(this.props.cursor)))}</div>
				</div>
			);
		}
		else {
			return null;
		}
	}
}

class GlyphAndData extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const contours = _.map(this.props.prec.contours, (cont, i) => {
			const nodes = _.map(cont.nodes, (node, j) => {
				if (node instanceof ExpandingNode) {
					return (
						<div key={j}>
							<div style={{'background-color': '#70A0EF', padding: '10px'}}>{node.cursor}</div>
							<div style={{'margin-left': '10px'}}>
								<ConstOrForm value={node.dirIn} name="dirIn" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.dirOut} name="dirOut" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.type} name="type" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.typeIn} name="typeIn" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.typeOut} name="typeOut" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.tensionIn} name="tensionIn" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.tensionOut} name="tensionOut" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.x} name="x" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.y} name="y" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.expand.width} name="width" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.expand.angle} name="angle" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.expand.distr} name="distr" values={this.props.values} val={this.props.res}/>
							</div>
						</div>
					);
				}
				else {
					return (
						<div key={j}>
							<div style={{'background-color': '#70A0EF', padding: '10px'}}>{node.cursor}</div>
							<div style={{'margin-left': '10px'}}>
								<ConstOrForm value={node.dirIn} name="dirIn" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.dirOut} name="dirOut" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.type} name="type" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.typeIn} name="typeIn" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.typeOut} name="typeOut" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.tensionIn} name="tensionIn" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.tensionOut} name="tensionOut" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.x} name="x" values={this.props.values} val={this.props.res}/>
								<ConstOrForm value={node.y} name="y" values={this.props.values} val={this.props.res}/>
								<ConstOrForm name="handleIn" values={this.props.values} val={this.props.res} cursor={`${node.cursor}handleIn`}/>
								<ConstOrForm name="handleOut" values={this.props.values} val={this.props.res} cursor={`${node.cursor}handleOut`}/>
							</div>
						</div>
					);
				}
			});

			return (
				<div key={i}>
					<div style={{'background-color': '#6090E0', padding: '10px'}}>{cont.cursor} - closed: {cont.closed.value.toString()} skel: {cont.skeleton.value.toString()}</div>
					<div style={{'margin-left': '10px'}}>
						{nodes}
					</div>
				</div>
			);
		});

		return (
			<div>
				{contours}
			</div>
		);
	}
}

export default class TestFont extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {glyph: 'A_cap'};
		this.mouseState = this.mouseState.bind(this);
	}

	componentWillMount() {
		pleaseWait.instance.finish();
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/fontInstanceStore', this.lifespan)
			.onUpdate((head) => {
				this.setState(head.toJS().d);
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/undoableStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					values: head.toJS().d.controlsValues,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	mouseState() {
		this.setState({
			mouse: this.toile.getMouseState(),
		});
	}

	componentDidMount() {
		this.toile = new Toile(this.canvas);
	}

	componentWillUpdate(nextProps, nextState) {
		if (this.toile) {
			if (nextState.typedata && nextState.typedata !== this.state.typedata) {
				this.font = new FontPrecursor(nextState.typedata);
			}
			if (this.font && nextState.values !== this.state.values) {
				this.glyphs = this.font.constructFont(nextState.values);
				this.toile.drawGlyph(this.glyphs[this.state.glyph]);
			}

			if (nextState.glyph !== this.state.glyph) {
				this.toile.clearCanvas(this.canvas.width, this.canvas.height);
				this.toile.drawGlyph(this.glyphs[nextState.glyph]);
			}
		}
	}

	render() {
		return (
			<div style={{display: 'flex', height: '100%'}}>
				<div style={{position: 'fixed', bottom: '10px', left: '10px', background: '#24d390', color: '#fefefe'}}>
					{JSON.stringify(this.state.mouse)}
				</div>
				<div>
					<canvas onMouseMove={this.mouseState} id="hello" ref={(canvas) => {this.canvas = canvas;}} width="1000" height="1000"></canvas>
				</div>
				<div style={{height: '100%', display: 'flex', 'flex-direction': 'column'}}>
					<div style={{'height': '200px'}}>
						<ScrollArea horizontal={false}>
							<div style={{display: 'flex', 'flex-flow': 'row wrap'}}>
								{(() => {
									if (this.state.typedata) {
										return _.map(Object.keys(this.state.typedata.glyphs), (glyphName) => {
											return <div style={{width: '50px', height: '50px', border: 'solid 1px #333333'}} onClick={() => {this.setState({glyph: glyphName})}}>{String.fromCharCode(this.state.typedata.glyphs[glyphName].unicode)}</div>
										});
									}
									else {
										return null;
									}
								})()}
							</div>
						</ScrollArea>
					</div>
					{(() => {
						if (this.state.values) {
							return (
								<ScrollArea horizontal={false}>
									<GlyphAndData values={this.state.values} res={this.glyphs ? this.glyphs[this.state.glyph] : {}} prec={this.font ? this.font.glyphs[this.state.glyph] : {}}/>
								</ScrollArea>
							);
						}
						else {
							return null;
						}
					})()}
				</div>
			</div>
		);
	}
}
