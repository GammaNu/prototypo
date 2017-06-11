import React from 'react';
import {graphql, gql} from 'react-apollo';

class AccountHome extends React.Component {
	render() {
		const {firstName} = this.props;

		return (
			<div className="account-base account-home">
				<h1>Hi {firstName}!</h1>
				<p>
					Welcome to your Prototypo account dashboard.
					You'll find all the necessary info to manage your subscription and billing here.
				</p>
				<h2>Our Youtube channel</h2>
				<p>
					You will find tutorials and other interesting videos on our
					{' '}
					<a
						className="account-link"
						href="https://www.youtube.com/channel/UCmBqMb0koPoquJiSUykdOTw"
						target="_blank"
					>
						Youtube channel!
					</a>
				</p>
				<iframe
					width="710"
					height="420"
					src="https://www.youtube.com/embed/szrJICcJOJI?list=PLxNRc5qdYUC9zQ_yXhIgQck8cfwCb1CQk"
					frameBorder="0"
					allowFullScreen
				/>
			</div>
		);
	}
}

const getFirstNameQuery = gql`
	query getFirstName {
		user {
			id
			firstName
		}
	}
`;

export default graphql(getFirstNameQuery, {
	options: {
		fetchPolicy: 'cache-first',
	},
	props: ({data}) => {
		if (data.loading) {
			return {loading: true, firstName: ''};
		}

		return data.user;
	},
})(AccountHome);
