import React, { useEffect, useState } from 'react';
import {
	ConnectComponentsProvider,
	ConnectAccountOnboarding,
} from '@stripe/react-connect-js';
import {
	loadConnectAndInitialize,
	StripeConnectInstance,
} from '@stripe/connect-js';

interface Props {
	publishableKey: string;
	clientSecret: string;
	onComplete: () => void;
}

const StripeEmbeddedOnboarding: React.FC<Props> = ({
	publishableKey,
	clientSecret,
	onComplete,
}) => {
	const [instance, setInstance] = useState<StripeConnectInstance | null>(
		null
	);

	useEffect(() => {
		if (!publishableKey || !clientSecret) {
			return;
		}

		(async () => {
			const connectInstance = await loadConnectAndInitialize({
				publishableKey,
				fetchClientSecret: async () => clientSecret,
			});

			setInstance(connectInstance);
		})();
	}, [publishableKey, clientSecret]);

	if (!instance) {
		return <p>No client secret</p>;
	}

	return (
		<ConnectComponentsProvider connectInstance={instance}>
			<ConnectAccountOnboarding
				onExit={() => console.log('User exited onboarding')}
				onStepChange={({ step }) => {
					if (step === 'complete') {
						onComplete();
					}
				}}
				collectionOptions={{
					fields: 'eventually_due',
					futureRequirements: 'include',
				}}
			/>
		</ConnectComponentsProvider>
	);
};

export default StripeEmbeddedOnboarding;
